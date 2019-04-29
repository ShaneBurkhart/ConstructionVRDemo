require "sinatra"
require "active_record"
require "haml"
require "redis-store"
require 'redis-rack'
require 'redcarpet'
require 'json'

require './models/models.rb'
require './models/db_models.rb'

MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

# docker needs stdout to sync to get logs.
$stdout.sync = true

set :bind, '0.0.0.0'

use Rack::Session::Redis, :redis_server => 'redis://redis:6379/0'

def find_project_by_access_token(access_token)
  return false if access_token.nil? or access_token == ""
  records = Project.all(filter: "(FIND(\"#{access_token}\", {Access Token}))") || []
  return records.first
end

def find_project_by_plansource_access_token(ps_access_token)
  return false if ps_access_token.nil? or ps_access_token == ""
  records = Project.all(filter: "(FIND(\"#{ps_access_token}\", {PlanSource Access Token}))") || []
  return records.first
end

def find_project_by_admin_access_token(admin_access_token)
  return false if admin_access_token.nil? or admin_access_token == ""
  records = Project.all(filter: "(FIND(\"#{admin_access_token}\", {Admin Access Token}))") || []
  return records.first
end

get '/93e8e03a-9c36-48bc-af15-54db7715ac15/component/search' do
  s = params[:s] || ""
  haml :component_search, locals: {
      finish_options: FinishOptions.search_for_component(s)
  }
end

# ps_access_token is PlanSource access token. We use that to authenticate the job.
get '/api/project/:ps_access_token/renderings' do
  # We have to escape slashes so now we unescape to check against airtables.
  ps_access_token = params[:ps_access_token].gsub("%2F", "/")
  project = find_project_by_plansource_access_token(ps_access_token)
  return { renderings: [] }.to_json if project.nil?

  renderings = project.units.map do |u|
    @version_id = (u["Current Version"] || [])[0]

    if !@version_id.nil?
        version = UnitVersion.find(@version_id)
        version = nil if version.nil? or version.id.nil?
    end

    # Backwards compatibility
    if !version.nil?
      u["Floor Plan Image URL"] = version["Floor Plan Image URL"]
    end

    {
      name: u["Name"],
      updated_at: u["Updated At"],
      floor_plan_url: u["Floor Plan Image URL"],
      url: "http://construction-vr.shaneburkhart.com/project/#{project['Access Token']}/unit/#{u.id}",
    }
  end

  finishes_url = nil
  if !project["Finish Selections Table Name"].nil?
    finishes_url = "http://construction-vr.shaneburkhart.com/project/#{project['Access Token']}/finishes"
  end

  return {
    renderings: renderings,
    finish_selections_url: finishes_url,
  }.to_json
end

get '/admin/login/:admin_token' do
  admin_token = params[:admin_token]
  project = find_project_by_admin_access_token(admin_token)
  return "Not found" if project.nil?

  redirect_to = params[:redirect_to]
  redirect_to = "/project/#{project["Access Token"]}" if redirect_to.nil? or redirect_to.length == 0

  # Log in user so we don't have to specify debug mode and can update
  # linked hotspots in the app.
  session[:is_admin] = true

  redirect redirect_to
end

post '/admin/linked_hotspot/set' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  pano_version_id = params[:pano_version_id]
  dest_pano_version_id = params[:dest_pano_version_id]
  yaw = params[:yaw]
  pitch = params[:pitch]

  hotspot = DBModels::LinkHotspot.where(
    pano_version_id: pano_version_id,
    destination_pano_version_id: dest_pano_version_id
  ).first

  if hotspot.nil?
    hotspot = DBModels::LinkHotspot.new(
      pano_version_id: pano_version_id,
      destination_pano_version_id: dest_pano_version_id,
      yaw: yaw,
      pitch: pitch
    )
  else
    hotspot.yaw = yaw
    hotspot.pitch = pitch
  end

  if hotspot.save
    return { hotspot: hotspot }.to_json
  else
    return {}
  end
end

post '/admin/linked_hotspot/remove' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  pano_version_id = params[:pano_version_id]
  dest_pano_version_id = params[:dest_pano_version_id]

  hotspots = DBModels::LinkHotspot.where(
    pano_version_id: pano_version_id,
    destination_pano_version_id: dest_pano_version_id
  )

  hotspots.destroy_all unless hotspots.nil?

  return {}
end

post '/admin/floor_plan_hotspot/set' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  pano_version_id = params[:pano_version_id]
  percentX = params[:percent_x]
  percentY = params[:percent_y]

  pano_version = PanoVersion.find(pano_version_id)
  return {} if pano_version.nil?

  pano_version["Floor Plan Label X"] = percentX
  pano_version["Floor Plan Label Y"] = percentY
  pano_version.save

  return { pano_version: pano_version }.to_json
end

post '/admin/floor_plan_hotspot/remove' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  pano_version_id = params[:pano_version_id]
  pano_version = PanoVersion.find(pano_version_id)
  return {} if pano_version.nil?

  pano_version["Floor Plan Label X"] = nil
  pano_version["Floor Plan Label Y"] = nil
  pano_version.save

  return { pano_version: pano_version }.to_json
end

post '/admin/pano/initial_yaw/set' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  pano_version_id = params[:pano_version_id]
  yaw = params[:yaw]

  pano_version = PanoVersion.find(pano_version_id)
  return "Not found" if pano_version.nil?

  pano_version["Initial Yaw"] = yaw
  pano_version.save

  return { pano_version: pano_version }.to_json
end

get '/project/:access_token' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  units = project.units
  units.each do |unit|
      @version_id = (unit["Current Version"] || [])[0]

      if !@version_id.nil?
          version = UnitVersion.find(@version_id)
          version = nil if version.nil? or version.id.nil?
      end

      # Backwards compatibility
      if !version.nil?
        unit["Floor Plan Image URL"] = version["Floor Plan Image URL"]
      end
  end

  haml :project, locals: {
    project: project,
    units: units,
    access_token: access_token,
    is_admin_mode: is_admin_mode,
  }
end

get '/project/:access_token/finishes' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @finishes = ProjectFinishSelections.finishes_for_project(project)

  haml :project_finishes, locals: {
    markdown: MARKDOWN,
    project: project,
    access_token: access_token,
  }
end

get '/project/:access_token/procurement_forms' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?
  return "Not found" if !is_admin_mode

  haml :project_procurement_forms, locals: {
    project: project,
    access_token: access_token,
  }
end

get '/project/:access_token/procurement_forms/:id/edit' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?
  return "Not found" if !is_admin_mode

  @procurement_form = ProcurementForm.find(params[:id])
  return "Not found" if @procurement_form.nil?

  haml :edit_project_procurement_form, locals: {
    project: project,
    access_token: access_token,
    aws_identity_pool_id: ENV["AWS_IDENTITY_POOL_ID"]
  }
end

get '/procurement_forms/:access_token' do
  @procurement_form = ProcurementForm.find_by_access_token(params[:access_token])
  return "Not found" if @procurement_form.nil?

  haml :project_procurement_form, locals: {
    markdown: MARKDOWN,
    aws_identity_pool_id: ENV["AWS_IDENTITY_POOL_ID"]
  }
end

post '/procurement_forms/:access_token/update' do
  is_admin_mode = !!session[:is_admin]
  return "Not found" if !is_admin_mode

  @procurement_form = ProcurementForm.find_by_access_token(params[:access_token])
  return "Not found" if @procurement_form.nil?

  updates = params["updates"]
  updates.each do |key, val|
    @procurement_form[key] = val
  end

  @procurement_form.save

  return 200
end

get '/project/:access_token/feedbacks' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @units = project.units
  haml :project_feedbacks, locals: {
    access_token: access_token,
    project: project,
  }
end

get '/project/:access_token/unit/:id' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  is_tour = !!params[:show_tour]

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit = Unit.find(params[:id])
  return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

  @version_id = (unit["Current Version"] || [])[0]
  @version_id = params[:version] if is_admin_mode and !params[:version].nil?
  feedbacks = []

  if !@version_id.nil?
      version = UnitVersion.find(@version_id)
      version = nil if version.nil? or version.id.nil?
  end

  # Backwards compatibility
  if !version.nil?
    unit["Floor Plan Image URL"] = version["Floor Plan Image URL"]
    feedbacks = version.feedbacks
  end

  if version.nil? or version.screenshot_versions.length == 0
    is_tour = true
  end

  haml :unit, locals: {
    unit: unit,
    selected_version: version,
    unit_versions: unit.versions,
    feedbacks: feedbacks,
    unit_pano_data: version.pano_data,
    access_token: access_token,
    is_tour: is_tour,
    is_debug_mode: is_debug_mode,
    is_admin_mode: is_admin_mode,
    aws_identity_pool_id: ENV["AWS_IDENTITY_POOL_ID"]
  }
end

get '/project/:access_token/unit/:id/feedback_feed' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit = Unit.find(params[:id])
  return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

  haml :unit_feedback_feed, locals: {
    unit: unit,
    versions: unit.versions,
    access_token: access_token,
  }
end

post '/project/:access_token/feedback_feed/:id/update' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  feedback = Feedback.find(params[:id])
  return "Not found" if feedback.nil?

  if !params[:checked].nil?
    is_checked = params[:checked] == "checked"
    feedback["Fixed At"] = is_checked == true ? Time.now : nil
  end

  feedback["Notes"] = params[:notes] unless params[:notes].nil?

  feedback.save

  fields = feedback.fields
  fields["Notes HTML"] = feedback.notes_html

  content_type :json
  return fields.to_json
end

post '/project/:access_token/screenshot/feedback' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit_version_id = params["unitVersionId"]
  image_url = params["imageURL"]
  notes = params["notes"]

  unit_version = UnitVersion.find(unit_version_id)
  return "Not found" if unit_version.nil? or !unit_version.unit.belongs_to_project?(project)
  return "Not found" if unit_version["Pano Versions"].length < 1

  feedback = Feedback.new(
    "Pano Version" => [unit_version["Pano Versions"].first],
    "Notes" => notes,
    "Is Fix" => true,
    "Screenshot" => [{ url: image_url }],
  )

  feedback.create

  fields = feedback.fields
  fields["Notes HTML"] = feedback.notes_html

  content_type :json
  return fields.to_json
end

post '/project/:access_token/pano/:id/feedback' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  pano = Pano.find(params[:id])
  return "Not found" if pano.nil? or !pano.unit.belongs_to_project?(project)
  unit = pano.unit

  unit_version_id = params["unitVersionId"] || unit["Current Version"][0]

  pano_version = PanoVersion.all(filter: "AND({Pano ID} = '#{pano.id}', {Unit Version ID} = '#{unit_version_id}')").first
  return "Not found" if pano_version.nil?

  is_fix = params["isFix"] == "true"
  screenshot = params[:screenshot]

  feedback = Feedback.new(
    "Pano Version" => [pano_version.id],
    "Notes" => params["notes"],
    "View Parameters" => params["viewParameters"],
    "Is Fix" => is_fix == true ? true : nil
  )

  if !screenshot.nil?
    feedback["Screenshot"] = [{ url: screenshot[:url], filename: screenshot[:filename] }]
  end

  feedback.create

  fields = feedback.fields
  fields["Notes HTML"] = feedback.notes_html

  content_type :json
  return fields.to_json
end

# DEVELOPMENT USE ONLY!
# USED FOR GENERATING MISSING FEEDBACK IMAGES
# Uncomment to use.
#get '/fix_feedback' do
  #return "Not found" if
  #@feedbacks = Feedback.all(filter: '{Screenshot} = ""') || []
  #return "Done." if @feedbacks.count == 0
  #@feedback = @feedbacks.first

  #haml :fix_feedback, locals: { feedbacks: @feedbacks, aws_identity_pool_id: ENV["AWS_IDENTITY_POOL_ID"] }
#end

#post '/fix_feedback/:id' do
  #feedback = Feedback.find(params[:id])
  #return "Not found" if feedback.nil?

  #screenshot = params[:screenshot]
  #return "Not found" if screenshot.nil?

  #feedback["Screenshot"] = [{ url: screenshot[:url], filename: screenshot[:filename] }]
  #feedback.save

  #return 200
#end
