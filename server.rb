require "sinatra"
require "haml"
require "airrecord"
require "redis-store"
require 'redis-rack'
require 'redcarpet'

MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

# docker needs stdout to sync to get logs.
$stdout.sync = true

AIRTABLES_APP_ID = "appTAmLzyXUW1RxaH"
Airrecord.api_key = ENV["AIRTABLES_API_KEY"]

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

# ps_access_token is PlanSource access token. We use that to authenticate the job.
get '/api/project/:ps_access_token/renderings' do
  # We have to escape slashes so now we unescape to check against airtables.
  ps_access_token = params[:ps_access_token].gsub("%2F", "/")
  project = find_project_by_plansource_access_token(ps_access_token)
  return { renderings: [] }.to_json if project.nil?

  renderings = project.units.map { |u| {
    name: u["Name"],
    url: "http://construction-vr.shaneburkhart.com/project/#{project['Access Token']}/unit/#{u.id}",
  }}

  return { renderings: renderings }.to_json
end

get '/admin/login/:admin_token' do
  admin_token = params[:admin_token]
  project = find_project_by_admin_access_token(admin_token)
  return "Not found" if project.nil?

  # Log in user so we don't have to specify debug mode and can update
  # linked hotspots in the app.
  session[:is_admin] = true

  redirect "/project/#{project["Access Token"]}"
end

post '/admin/linked_hotspot/set' do
  is_admin = session[:is_admin]
  return "Not found" if is_admin.nil?

  pano_id = params[:pano_id]
  dest_pano_id = params[:dest_pano_id]
  yaw = params[:yaw]
  pitch = params[:pitch]

  hotspot = LinkHotspots.all(filter: "AND({Pano} = '#{pano_id}', {Destination Pano} = '#{dest_pano_id}')").first

  if hotspot.nil?
    hotspot = LinkHotspots.new("Pano" => [pano_id], "Destination Pano" => [dest_pano_id], "Yaw" => yaw, "Pitch" => pitch)
    hotspot.create
  else
    hotspot["Yaw"] = yaw
    hotspot["Pitch"] = pitch
    hotspot.save
  end

  return { hotspot: hotspot }.to_json
end

get '/project/:access_token' do
  is_debug_mode = !!params[:debug] || session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  haml :project, locals: {
    project: project,
    access_token: access_token,
    is_debug_mode: is_debug_mode,
  }
end

get '/project/:access_token/feedbacks' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @units = project.units
  haml :project_feedbacks, locals: {
    access_token: access_token,
  }
end

get '/project/:access_token/feedbacks/permalinks' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @feedback_permalinks = FeedbackPermalink.all(filter: "{Project ID} = '#{project.id}'", sort: { "Created At": "desc" })
  haml :feedback_permalinks, locals: {
    access_token: access_token,
  }
end

post '/project/:access_token/feedbacks/permalinks' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  markdown = params[:markdown]
  feedbackPermalink = FeedbackPermalink.new("Project" => [project.id], "Markdown" => markdown)
  feedbackPermalink.create

  redirect "/project/#{access_token}/feedbacks/permalinks"
end

get '/project/:access_token/feedbacks/permalinks/new' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @units = project.units
  haml :new_feedback_permalink, locals: {
    access_token: access_token,
  }
end

get '/project/:access_token/feedbacks/permalinks/:id' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @feedback_permalink = FeedbackPermalink.find(params[:id])
  return "Not found" if @feedback_permalink.nil?

  raw_markdown = @feedback_permalink["Markdown"]
  @js_safe_markdown = @feedback_permalink["Markdown"].gsub(/\n/, "\\n")
  pre_render_markdown = raw_markdown.gsub(/\[(x| )\]/).with_index do |match, index|
    checked = match =~ /x/ ? true : false
    if checked
      next "<input id='#{index}' type='checkbox' checked='true'>"
    else
      next "<input id='#{index}' type='checkbox'>"
    end
  end

  @markdown_html = MARKDOWN.render(pre_render_markdown)
  haml :feedback_permalink, locals: {
    access_token: access_token,
  }
end

get '/feedback_permalink/:id' do
  @feedback_permalink = FeedbackPermalink.find(params[:id])
  return "Not found" if @feedback_permalink.nil?

  project = @feedback_permalink.project
  return "Not found" if project.nil?

  raw_markdown = @feedback_permalink["Markdown"]
  @js_safe_markdown = @feedback_permalink["Markdown"].gsub(/\n/, "\\n")
  pre_render_markdown = raw_markdown.gsub(/\[(x| )\]/).with_index do |match, index|
    checked = match =~ /x/ ? true : false
    if checked
      next "<input id='#{index}' type='checkbox' checked='true'>"
    else
      next "<input id='#{index}' type='checkbox'>"
    end
  end

  @markdown_html = MARKDOWN.render(pre_render_markdown)
  haml :feedback_permalink, locals: {
    access_token: project["Access Token"],
  }
end

post '/project/:access_token/feedbacks/permalinks/:id/update' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  @feedback_permalink = FeedbackPermalink.find(params[:id])
  return "Not found" if @feedback_permalink.nil?

  updates = params["updates"]
  raw_markdown = @feedback_permalink["Markdown"]
  pre_render_markdown = raw_markdown.gsub(/\[(x| )\]/).with_index do |match, index|
    result = updates["#{index}"]
    next match if result.nil?

    if result == "true"
      next "[x]"
    else
      next "[ ]"
    end
  end

  @feedback_permalink["Markdown"] = pre_render_markdown
  @feedback_permalink.save

  MARKDOWN.render(pre_render_markdown)
end

get '/project/:access_token/unit/:id' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug] || session[:is_admin]
  is_admin_mode = session[:is_admin]

  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit = Unit.find(params[:id])
  return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

  haml :unit, locals: {
    unit: unit,
    feedbacks: unit.feedbacks,
    unit_pano_data: unit.pano_data,
    access_token: access_token,
    is_debug_mode: is_debug_mode,
    is_admin_mode: is_admin_mode,
    aws_identity_pool_id: ENV["AWS_IDENTITY_POOL_ID"]
  }
end

post '/project/:access_token/pano/:id/feedback' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  pano = Pano.find(params[:id])
  return "Not found" if pano.nil? or !pano.unit.belongs_to_project?(project)

  screenshot = params[:screenshot]
  return "Not found" if screenshot.nil?

  feedback = Feedback.new(
    "Pano" => [pano.id],
    "Notes" => params["notes"],
    "View Parameters" => params["viewParameters"],
    "Screenshot" => [{ url: screenshot[:url], filename: screenshot[:filename] }]
  )
  feedback.create

  redirect "/project/#{access_token}/unit/#{pano.unit.id}"
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

class Project < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Projects"

  def units
    if @units.nil?
      @units = Unit.all(filter: "(FIND(\"#{self.id}\", {Project ID}))", sort: { Name: "asc" }) || []
    end

    return @units
  end
end

class Unit < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Units"

  def belongs_to_project?(project)
    return false if project.nil?
    self.project.id == project.id
  end

  def project
    if @project.nil?
      @project = Project.all(filter: "(FIND(\"#{self.id}\", {Unit IDs}))").first
    end

    return @project
  end

  def panos
    if @panos.nil?
      @panos = Pano.all(filter: "(FIND(\"#{self.id}\", ARRAYJOIN({Unit ID})))", sort: { "Order Priority": "asc" }) || []
    end

    return @panos
  end

  def feedbacks
    if @feedbacks.nil?
      @feedbacks = Feedback.all(filter: "(FIND(\"#{self.id}\", {Unit ID}))", sort: { "Created At": "desc"})
    end

    return @feedbacks
  end

  def pano_data
    panos = self.panos

    return panos.map do |pano|
      fields = pano.fields
      link_hotspots = pano.link_hotspots.map{ |lh| lh.fields }

      fields["link_hotspots"] = link_hotspots
      next fields
    end
  end
end

class Pano < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Panos"

  def unit
    if @unit.nil?
      @unit = Unit.all(filter: "(FIND(\"#{self.id}\", {Pano IDs}))").first
    end

    return @unit
  end

  def link_hotspots
    if @link_hotspots.nil?
      @link_hotspots = LinkHotspots.all(filter: "(FIND(\"#{self.id}\", {Pano ID}))")
    end

    return @link_hotspots
  end
end

class Feedback < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Feedback"

  def pano
    if @pano.nil?
      @pano = Pano.find(self["Pano"].first)
    end

    return @pano
  end
end

class FeedbackPermalink < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Feedback Permalinks"

  def project
    if @project.nil?
      @project = Project.find(self["Project"].first)
    end

    return @project
  end
end

class LinkHotspots < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Link Hotspots"
end
