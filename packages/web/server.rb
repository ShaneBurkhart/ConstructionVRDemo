require "sinatra"
require "active_record"
require "slack-ruby-client"
require "haml"
require "redis-store"
require 'redis-rack'
require 'redcarpet'
require 'json'
require 'cgi'
require 'uri'
require 'aws-sdk'
require 'aws-sdk-s3'
require 'securerandom'

require './util/slack.rb'
require './util/messages.rb'
require './models/models.rb'
require './models/db_models.rb'

Aws.config.update({
  region: ENV["AWS_REGION"],
  credentials: Aws::Credentials.new(ENV["AWS_ACCESS_KEY_ID"], ENV["AWS_SECRET_ACCESS_KEY"])
})

MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

# docker needs stdout to sync to get logs.
$stdout.sync = true

set :bind, '0.0.0.0'
set :sockets, []

use Rack::Session::Redis, :redis_server => 'redis://redis:6379/0', :expires_in => 60 * 60 * 24 * 7

Slack.configure do |config|
  config.token = ENV['SLACK_KONTENT_KEEPER_SIGNING_SECRET']
end

def find_project_by_access_token(access_token)
  return false if access_token.nil? or access_token == ""
  records = Finishes::Project.all(filter: "(FIND(\"#{access_token}\", {Access Token}))") || []
  return records.first
end

def find_project_by_plansource_access_token(ps_access_token)
  return false if ps_access_token.nil? or ps_access_token == ""
  records = Finishes::Project.all(filter: "(FIND(\"#{ps_access_token}\", {PlanSource Access Token}))") || []
  return records.first
end

def find_project_by_admin_access_token(admin_access_token)
  return false if admin_access_token.nil? or admin_access_token == ""
  records = Finishes::Project.all(filter: "(FIND(\"#{admin_access_token}\", {Admin Access Token}))") || []
  return records.first
end


get '/' do
  redirect "#{ENV["SITE_URL"]}/app"
end

renderer_app_url_uuid = "83f75fdc-975b-4a12-a183-360a20038ac1"
get "/#{renderer_app_url_uuid}" do
  haml :renderer_uploader
end

renderer_app_projects = "24621eed-e87b-4422-b67f-a4ba513b47f2"
get "/#{renderer_app_projects}" do
  @projects = Finishes::Project.all
  @units = Unit.all
  content_type "application/json"
  project_list = @projects.map { |p| p.fields }
  unit_list = @units.map { |u| u.fields }
  {projects: project_list, units: unit_list}.to_json
end

post "/#{renderer_app_projects}" do
  screenshot_urls = params["screenshotUrls"]

  new_unit_version = UnitVersion.create({
    "Unit": [params["unitId"]],
    "Floor Plan Image URL": params["floorPlanImgUrl"],
    "SKP File URL": params["skpUrl"],
    "Floor Plans Started At": DateTime.now(),
    "Floor Plans Finished At": DateTime.now(),
    "Screenshots Started At": DateTime.now(),
    "Screenshots Finished At": DateTime.now(),
  })

  screenshot_urls.each do |s|
    ScreenshotVersion.create({
      "Image URL": s,
      "Unit Version": [new_unit_version.id]
    })
  end
  session[:is_admin] = true
  return new_unit_version.id.to_json
end

get '/93e8e03a-9c36-48bc-af15-54db7715ac15/component/search' do
  s = params[:s] || ""
  haml :component_search, locals: {
    finish_options: Finish::Options.search_for_component(s)
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
    return redirect "http://#{request.env["HTTP_HOST"]}/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard"
  end

  unit_version = UnitVersion.find(unit_version_id)
  if unit_version.nil?
    return redirect "http://#{request.env["HTTP_HOST"]}/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard"
  end

  unit_version["#{prefix} Started At"] = nil
  unit_version["#{prefix} Finished At"] = nil
  unit_version["Notified At"] = nil
  unit_version.save

  redirect "http://#{request.env["HTTP_HOST"]}/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard"
end

post '/api/temp_upload/presign' do
  is_admin_mode = !!session[:is_admin]
  return "Not found" if !is_admin_mode

  key = "tmp/#{SecureRandom.uuid}_#{params['filename']}"
  signer = Aws::S3::Presigner.new
  url = signer.presigned_url(:put_object, {
    bucket: ENV["AWS_BUCKET"],
    key: key,
    content_type: params["mime"],
    acl: "public-read"
  })

  content_type "application/json"
  {
    presignedURL: url,
    awsURL: "https://#{ENV["AWS_BUCKET"]}.s3-us-west-2.amazonaws.com/#{key}"
  }.to_json
end

renderer_uploader_presign = "99a0101f-2c32-4d60-9471-983372a81840"
post "/api/presign/#{renderer_uploader_presign}" do
  key = "tmp/#{SecureRandom.uuid}_#{params['filename']}"
  signer = Aws::S3::Presigner.new
  url = signer.presigned_url(:put_object, {
    bucket: ENV["AWS_BUCKET"],
    key: key,
    content_type: params["mime"],
    acl: "public-read"
  })

  content_type "application/json"
  {
    presignedURL: url,
    awsURL: "https://#{ENV["AWS_BUCKET"]}.s3-us-west-2.amazonaws.com/#{key}"
  }.to_json
end

get '/api/finishes/options/search' do
  is_admin_mode = !!session[:is_admin]
  return "Not found" if !is_admin_mode

  @options = Finishes::Option.search(params["q"] || "")

  content_type "application/json"
  {
    admin_mode: is_admin_mode,
    options: @options,
  }.to_json
end

get '/api/project/:access_token/finishes' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @categories = project.categories
  @selections = project.selections
  @options = project.options

  content_type "application/json"
  {
    admin_mode: is_admin_mode,
    categories: @categories,
    selections: @selections,
    options: @options,
  }.to_json
end

get '/api/project/:access_token/finishes/socket' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  if request.websocket?
    request.websocket do |ws|
      ws.onopen do
        ws.send("Hello World!")
        settings.sockets << ws
      end
      ws.onmessage do |msg|
        EM.next_tick { settings.sockets.each{|s| s.send(msg) } }
      end
      ws.onclose do
        warn("websocket closed")
        settings.sockets.delete(ws)
      end
    end
  else
    halt 500, "Invalid request."
  end
end

post '/api/project/:access_token/finishes/save' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?
  body = JSON.parse(request.body.read)

  updated_categories = []
  updated_selections = []
  updated_options = []

  categories = body["categories"] || []
  selections = body["selections"] || []
  options = body["options"] || []

  # All keys should be unique. Keep track of temp ids to new objects
  new_models = {}

  @options = project.options.index_by { |o| o.id }
  options.each do |option|
    if option["id"].starts_with?("new")
      option_fields = option["fields"].select{ |k,v|
        ["Name", "Selections", "Type", "Other Type Value", "Image", "Info",
             "URL", "Unit Price", "Order"].include?(k)
      }
      option_fields["Image"] = (option_fields["Image"] || []).map{ |i| { url: i["url"] }}

      new_option = Finishes::Option.create(option_fields)
      new_models[option["id"]] = new_option
      updated_options << new_option
    else
      old_option = @options[option["id"]]

      # Only update if is different than old
      old_option.update(option["fields"])
      old_option.save
      updated_options << old_option
    end
  end

  @selections = project.selections.index_by { |s| s.id }
  selections.each do |selection|
    if selection["id"].starts_with?("new")
      selection_fields = selection["fields"].select{ |k,v|
        ["Type", "Category", "Location", "Room", "Notes", "Order"].include?(k)
      }

      new_selection = Finishes::Selection.create(selection_fields)
      new_models[selection["id"]] = new_selection
      updated_selections << new_selection
    else
      old_selection = @selections[selection["id"]]

      # If the option ID is new, replace with option ID we just saved
      selection["fields"]["Options"] = (selection["fields"]["Options"] || []).map { |o|
        o.starts_with?("new") ? new_models[o].id : o
      }

      # Only update if is different than old
      old_selection.update(selection["fields"])
      old_selection.save
      updated_selections << old_selection
    end
  end

  @categories = project.categories.index_by { |c| c.id }
  categories.each do |category|
    if !category["DELETE"].nil?
      old_category = @categories[category["id"]]
      old_category.destroy if !old_category.nil?
      next
    elsif category["id"].starts_with?("new")
      category_fields = category["fields"].select{ |k,v|
        ["Name", "Order"].include?(k)
      }
      category_fields["Project"] = [project.id]

      new_category = Finishes::Category.create(category_fields)
      new_models[category["id"]] = new_category
      updated_categories << new_category
    else
      old_category = @categories[category["id"]]

      # If the option ID is new, replace with option ID we just saved
      category["fields"]["Selections"] = (category["fields"]["Selections"] || []).map { |s|
        s.starts_with?("new") ? new_models[s].id : s
      }

      # Only update if is different than old
      old_category.update(category["fields"])
      old_category.save
      updated_categories << old_category
    end
  end

  content_type "application/json"
  {
    categories: updated_categories,
    selections: updated_selections,
    options: updated_options,
  }.to_json
end

# ps_access_token is PlanSource access token. We use that to authenticate the job.
get '/api/project/:ps_access_token/renderings' do
  # We have to escape slashes so now we unescape to check against airtables.
  ps_access_token = CGI.unescape(params[:ps_access_token])
  project = find_project_by_plansource_access_token(ps_access_token)
  return { renderings: [] }.to_json if project.nil?

  renderings = project.units.filter { |r| !r["Hidden?"] }.map do |u|
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
      description: (u["Details"] || "").gsub("|", "; "),
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

  # Log admin in on the websocket server too
  redirect "http://#{request.env["HTTP_HOST"]}/api2/admin/login/#{admin_token}?redirect_to=#{CGI.escape(redirect_to)}"
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

get '/project/:access_token' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  units = project.units
  if units.nil? or units.length == 0
    return redirect "http://#{request.env["HTTP_HOST"]}/project/#{access_token}/finishes"
  end


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
    page_title: project["Name"] + " - Renderings",
  }
end

get '/project/:access_token/finishes' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  # V2 PROJECTS ARE SERVED VIA WEBSOCKET.JS
  return redirect "http://#{request.env["HTTP_HOST"]}/app/project/#{access_token}/finishes" unless project["Is V1?"] 


  haml :project_finishes_v1, locals: {
    markdown: MARKDOWN,
    project: project,
    access_token: access_token,
    page_title: project["Name"] + " - Finishes",
    no_style: true,
    fixed_width_viewport: true,
    is_admin_mode: is_admin_mode,
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
    project: project,
    unit: unit,
    page_title: unit["Name"] + " - " + project["Name"] + " - Renderings",
    is_latest_version: unit["Versions"].last == version.id,
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

  return redirect "http://#{request.env["HTTP_HOST"]}/project/#{access_token}/unit/#{unit_id}"
end

get '/project/:access_token/unit/:id/set_visibility' do
  access_token = params[:access_token]
  is_admin = !!session[:is_admin]
  unit_id = params[:id]
  set_hidden = params[:hidden] == "1"

  return "Not found" unless is_admin

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit = Unit.find(unit_id)
  return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

  unit["Hidden?"] = set_hidden
  unit.save

  return redirect "http://#{request.env["HTTP_HOST"]}/project/#{access_token}/unit/#{unit_id}"
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
    return redirect "http://#{request.env["HTTP_HOST"]}/project/#{access_token}/unit/#{unit_id}"
  end

  unit["Current Version"] = [unit_version_id]
  unit.save

  return redirect "http://#{request.env["HTTP_HOST"]}/project/#{access_token}/unit/#{unit_id}"
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

  feedback = Feedback.create(
    "Pano Version" => [unit_version["Pano Versions"].first],
    "Notes" => notes,
    "Is Fix" => true,
    "Screenshot" => [{ url: image_url }],
  )


  fields = feedback.fields
  fields["Notes HTML"] = feedback.notes_html

  # Send notification to slack
  send_slack_message_to_rendering_channel(create_feedback_notification_message(feedback, unit_version))

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
    "Unit Version Id" => unit_version_id,
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
