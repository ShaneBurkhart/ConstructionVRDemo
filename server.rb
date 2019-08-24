require "sinatra"
require "active_record"
require "slack-ruby-client"
require "haml"
require "redis-store"
require 'redis-rack'
require 'redcarpet'
require 'json'
require 'aws-sdk'
require 'aws-sdk-s3'
require 'open-uri'

require './models/models.rb'
require './models/db_models.rb'

S3_URL = "https://s3-us-west-2.amazonaws.com"
REGION = ENV["REGION"]
BUCKET = ENV["BUCKET"]
TMP_KEY_PREFIX = "tmp"

Aws.config.update({
  region: REGION,
  credentials: Aws::Credentials.new(ENV["ACCESS_KEY_ID"], ENV["SECRET_ACCESS_KEY"])
})
s3 = Aws::S3::Resource.new(region: REGION)

MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

# docker needs stdout to sync to get logs.
$stdout.sync = true

set :bind, '0.0.0.0'

use Rack::Session::Redis, :redis_server => 'redis://redis:6379/0'

Slack.configure do |config|
  config.token = ENV['SLACK_KONTENT_KEEPER_SIGNING_SECRET']
end

def find_user_by_access_token(access_token)
  return false if access_token.nil? or access_token == ""
  records = User.all(filter: "(FIND(\"#{access_token}\", {Access Token}))") || []
  return records.first
end

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
    finish_options: Finishes::Option.search_for_component(s)
  }
end

get '/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard' do
  is_admin = !!session[:is_admin]
  return "Not found" unless is_admin

  haml :rendering_dashboard, locals: {
    unit_versions: UnitVersion.all(sort: { "Created At": "desc" }, max_records: 30),
    unit_versions_to_render: UnitVersion.all(view: "To Render"),
  }
end

get '/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard/restart' do
  is_admin = !!session[:is_admin]
  return "Not found" unless is_admin
  unit_version_id = params[:uv_id] || ""
  prefix = params[:p] || ""

  if !["Floor Plans", "Screenshots", "Panos"].include? prefix
    return redirect "/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard"
  end

  unit_version = UnitVersion.find(unit_version_id)
  if unit_version.nil?
    return redirect "/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard"
  end

  unit_version["#{prefix} Started At"] = nil
  unit_version["#{prefix} Finished At"] = nil
  unit_version["Notified At"] = nil
  unit_version.save

  redirect "/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard"
end

post '/f038c9d4-2809-4050-976a-309445be7c8b/slack/kontent-keeper/webhook' do
  slack_request = Slack::Events::Request.new(request)
  slack_request.verify!

  puts params.inspect
  #Content::Links.create(
    #"Link" => params["link"],
    #"Description" => params["description"],
  #)

  return params[:challenge]
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
      description: u["Details"].gsub("|", "; "),
      updated_at: u.current_version[0]["Created At"],
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

get '/user/login/:access_token' do
  access_token = params[:access_token]
  user = find_user_by_access_token(access_token)
  return "Not found" if user.nil?

  redirect_to = params[:redirect_to]
  redirect_to = "/projects" if redirect_to.nil? or redirect_to.length == 0

  session[:is_admin] = !!user["Admin?"]
  session[:user_id] = user.id

  redirect redirect_to
end

post '/admin/linked_hotspot/set' do
  is_admin = !!session[:is_admin]
  return "Not found" unless is_admin

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
  return "Not found" unless is_admin

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
  return "Not found" unless is_admin

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
  return "Not found" unless is_admin

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
  return "Not found" unless is_admin

  pano_version_id = params[:pano_version_id]
  yaw = params[:yaw]

  pano_version = PanoVersion.find(pano_version_id)
  return "Not found" if pano_version.nil?

  pano_version["Initial Yaw"] = yaw
  pano_version.save

  return { pano_version: pano_version }.to_json
end

get '/projects' do
  is_admin_mode = !!session[:is_admin]
  user = User.find(session[:user_id])
  return "Not found" if user.nil?

  projects = user.projects

  haml :projects, locals: { projects: projects }
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

  @finish_categories = Finishes::Selection.finishes_for_project(project)

  finish_option_ids = []

  @finish_categories.each do |o|
    category = o[:category]
    finish_selections = o[:selections]
    finish_selections.each do |finish_selection|
      finish_option_ids.concat(finish_selection["Options"] || [])
    end
  end

  all_finish_options = Finishes::Option.find_many(finish_option_ids)
  finish_options_by_id = all_finish_options.map { |o| [o.id, o] }.to_h

  @options_for_selection = {}
  @finish_categories.each do |o|
    category = o[:category]
    finish_selections = o[:selections]
    finish_selections.each do |finish_selection|
      options = (finish_selection["Options"] || [])
      @options_for_selection[finish_selection.id] = options.map { |id| finish_options_by_id[id] }
    end
  end

  haml :project_finishes, locals: {
    markdown: MARKDOWN,
    project: project,
    access_token: access_token,
    fixed_width_viewport: true,
    is_admin_mode: is_admin_mode,
  }
end

get '/project/:access_token/finishes/options/search' do
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  search_token = params[:s]

  options = Finishes::Option.all(filter: "SEARCH('#{search_token}', {Name})")
  options = options.map do |o|
    fields = o.fields

    fields["List Card HTML"] = haml :_finish_option_card, layout: false, locals: {
      markdown: MARKDOWN,
      is_admin_mode: is_admin_mode,
      finish_option: o,
      is_search: false,
    }
    fields["Search Card HTML"] = haml :_finish_option_card, layout: false, locals: {
      markdown: MARKDOWN,
      is_admin_mode: is_admin_mode,
      finish_option: o,
      is_search: true,
    }

    next fields
  end

  return { options: options }.to_json
end

get '/project/:access_token/finishes/options/images/upload' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  return "Not found" unless is_admin_mode

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  open(params[:fetch]) { |f|
    content_type f.content_type
    return f.read
  }
end

post '/project/:access_token/finishes/options/images/upload' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  filepond = params["filepond"]
  return "Not found" unless is_admin_mode

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  if params[:fetch]
    return open(params[:fetch])
  end

  ext = filepond["filename"].split(".").last
  key = "#{TMP_KEY_PREFIX}/#{SecureRandom.uuid}.#{ext}"
  obj = s3.bucket(BUCKET).object(key)
  obj.upload_file(filepond["tempfile"].path)
  obj.acl.put({acl: "public-read"})

  return key
end

post '/project/:access_token/finishes/options/images/upload' do
  # Nothing to do. Needed for filepond to delete images.
  # We use an expiration date for temp files in s3 instead.
end

post '/project/:access_token/finishes/option/save' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  user_id = session[:user_id]
  return "Not found" unless is_admin_mode and !user_id.nil?

  option_id = params[:id]
  selection_id = params[:selection_id]
  option = Finishes::Option.new({})

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  if !option_id.nil? and option_id != ""
    option = Finishes::Option.find(option_id)
    option = Finishes::Option.new({}) if option.nil? or option.id.nil? or option.id == ""
  end

  option["User"] = [ user_id ]
  option["Name"] = params[:name] if params.has_key? :name
  option["Type"] = params[:type] if params.has_key? :type
  option["Unit Price"] = params[:unit_price].to_f if params.has_key? :unit_price
  option["URL"] = params[:url] if params.has_key? :url
  option["Info"] = params[:info] if params.has_key? :info

  if params.has_key? :images
    option["Image"] = (params[:images] || []).map { |i| { url: "#{S3_URL}/#{BUCKET}/#{i}"} }
  end

  option.save

  option_fields = option.fields
  option_fields["List Card HTML"] = haml :_finish_option_card, layout: false, locals: {
    markdown: MARKDOWN,
    is_admin_mode: is_admin_mode,
    finish_option: option,
    is_search: false,
  }

  return { option: option_fields }.to_json if selection_id.nil? or selection_id == ""

  # Add option to selection
  selection = Finishes::Selection.find(selection_id)
  return { option: option_fields }.to_json if selection.nil? or !selection.belongs_to_project?(project)

  if !selection["Options"].include? option.id
    selection["Options"] += [option.id]
    selection.save
  end

  return { option: option_fields }.to_json
end

post '/project/:access_token/finishes/selection/:id/remove' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  selection_id = params[:id]

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  selection = Finishes::Selection.find(selection_id)
  return "Not found" if selection.nil? or !selection.belongs_to_project?(project)

  selection.destroy

  return {}.to_json
end

post '/project/:access_token/finishes/selection/:selection_id/option/:option_id/link' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  selection_id = params[:selection_id]
  option_id = params[:option_id]

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  selection = Finishes::Selection.find(selection_id)
  return "Not found" if selection.nil? or !selection.belongs_to_project?(project)

  option = Finishes::Option.find(option_id)
  return "Not found" if option.nil?

  option_fields = {}

  if !selection["Options"].include? option_id
    selection["Options"] += [option_id]
    selection.save

    option_fields = option.fields
    option_fields["List Card HTML"] = haml :_finish_option_card, layout: false, locals: {
      markdown: MARKDOWN,
      is_admin_mode: is_admin_mode,
      finish_option: option,
      is_search: false,
    }
  end

  return { option: option_fields }.to_json
end

post '/project/:access_token/finishes/selection/:selection_id/option/:option_id/unlink' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]
  selection_id = params[:selection_id]
  option_id = params[:option_id]

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  selection = Finishes::Selection.find(selection_id)
  return "Not found" if selection.nil? or !selection.belongs_to_project?(project)
  return "Not found" if option_id.nil?

  selection["Options"] = selection["Options"] - [option_id]
  selection.save

  return {}
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

get '/project/:access_token/unit/:id/set_description' do
  access_token = params[:access_token]
  is_admin = !!session[:is_admin]
  unit_id = params[:id]
  description = params[:description] || ""

  return "Not found" unless is_admin

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit = Unit.find(unit_id)
  return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

  unit["Details"] = description
  unit.save

  return redirect "/project/#{access_token}/unit/#{unit_id}"
end

get '/project/:access_token/unit/:id/set_current_version' do
  access_token = params[:access_token]
  is_admin = !!session[:is_admin]
  unit_id = params[:id]
  unit_version_id = params[:uv_id] || ""

  return "Not found" unless is_admin

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit = Unit.find(unit_id)
  return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

  unit_version = UnitVersion.find(unit_version_id)
  if unit_version.nil?
    return redirect "/project/#{access_token}/unit/#{unit_id}"
  end

  unit["Current Version"] = [unit_version_id]
  unit.save

  return redirect "/project/#{access_token}/unit/#{unit_id}"
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
  return "Not found" unless is_admin

  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit_version_id = params["unitVersionId"]
  image_url = params["imageURL"]
  notes = params["notes"]

  unit_version = UnitVersion.find(unit_version_id)
  return "Not found" if unit_version.nil? or !unit_version.unit.belongs_to_project?(project)
  return "Not found" if unit_version["Pano Versions"].nil? or unit_version["Pano Versions"].length < 1

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
  return "Not found" unless is_admin

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
