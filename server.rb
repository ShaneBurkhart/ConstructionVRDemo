require "sinatra"
require "haml"
require "airrecord"
require "redis-store"
require 'redis-rack'
require 'redcarpet'

MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

# docker needs stdout to sync to get logs.
$stdout.sync = true

RENDERING_AIRTABLE_APP_ID = "appTAmLzyXUW1RxaH"
FINISHES_AIRTABLE_APP_ID = "app5xuA2wJKN1rkp0"
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

  renderings = project.units.map { |u| {
    name: u["Name"],
    updated_at: u["Updated At"],
    floor_plan_url: u["Floor Plan Image"][0]["url"],
    url: "http://construction-vr.shaneburkhart.com/project/#{project['Access Token']}/unit/#{u.id}",
  }}

  finishes_url = nil
  if !project["Finish Selections App ID"].nil?
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

  # Log in user so we don't have to specify debug mode and can update
  # linked hotspots in the app.
  session[:is_admin] = true

  redirect "/project/#{project["Access Token"]}"
end

post '/admin/linked_hotspot/set' do
  is_admin = !!session[:is_admin]
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

post '/admin/pano/initial_yaw/set' do
  is_admin = !!session[:is_admin]
  return "Not found" if is_admin.nil?

  pano_id = params[:pano_id]
  yaw = params[:yaw]

  pano = Pano.find(pano_id)
  return "Not found" if pano.nil?

  pano["Initial Yaw"] = yaw
  pano.save

  return { pano: pano }.to_json
end

get '/project/:access_token' do
  is_admin_mode = !!session[:is_admin]
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  haml :project, locals: {
    project: project,
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
  is_debug_mode = !!params[:debug] || !!session[:is_admin]
  is_admin_mode = !!session[:is_admin]

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
    unit["Floor Plan Image"] = version["Floor Plan Image"]
    feedbacks = version.feedbacks
  end

  haml :unit, locals: {
    unit: unit,
    unit_versions: unit.versions,
    feedbacks: feedbacks,
    unit_pano_data: unit.pano_data(version),
    access_token: access_token,
    is_debug_mode: is_debug_mode,
    is_admin_mode: is_admin_mode,
    aws_identity_pool_id: ENV["AWS_IDENTITY_POOL_ID"]
  }
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

  screenshot = params[:screenshot]
  return "Not found" if screenshot.nil?

  feedback = Feedback.new(
    "Pano Version" => [pano_version.id],
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

class FinishOptions < Airrecord::Table
  self.base_key = FINISHES_AIRTABLE_APP_ID
  self.table_name = "Finish Options"

  def self.search_for_component(s)
    # Implement search later
    FinishOptions.all view: "Has Model"
  end
end

class ProjectFinishSelections < Airrecord::Table
  self.base_key = FINISHES_AIRTABLE_APP_ID

  def self.finishes_for_project(project)
    return {} if project.nil?
    views = [
      "Walls & Millwork",
      "Flooring",
      "Light Fixtures",
      "Plumbing Fixtures & Acc.",
      "Shelving",
      "Blinds",
      "Mirrors",
      "Appliances",
      "Furniture",
      "Cabinets & Countertops",
      "Exterior",
      "Misc"
    ]
    finishes = {}
    self.table_name = project["Finish Selections Table Name"]

    views.each do |view|
      finishes[view] = self.all(view: view)
    end

    return finishes
  end
end

class Project < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Projects"

  def units
    if @units.nil?
      @units = Unit.all(filter: "(FIND(\"#{self.id}\", {Project ID}))", sort: { Name: "asc" }) || []
    end

    return @units
  end

  def procurement_forms
    if @procurement_forms.nil?
      @procurement_forms = ProcurementForm.all(filter: "{Project ID} = '#{self.id}'", sort: { "Created At" => "desc" })
    end

    return @procurement_forms
  end
end

class Unit < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
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

  def versions
    if @versions.nil?
      @versions = UnitVersion.all(filter: "(FIND(\"#{self.id}\", {Unit ID}))", sort: { "Created At": "desc"})
    end

    return @versions
  end

  def feedbacks
    if @feedbacks.nil?
      @feedbacks = Feedback.all(filter: "(FIND(\"#{self.id}\", {Unit ID}))", sort: { "Created At": "desc"})
    end

    return @feedbacks
  end

  def pano_data(version)
    panos = self.panos
    current_version_panos = []

    if !version.nil?
        current_version = version
        current_version_panos = current_version.pano_versions
    end

    return panos.map do |pano|
      pano_version = current_version_panos.find { |p| p["Pano"][0] == pano.id }
      fields = pano.fields
      link_hotspots = pano.link_hotspots.map{ |lh| lh.fields }

      # Backwards compatibility
      pano["Image"] = pano_version["Image"] unless pano_version.nil?

      fields["link_hotspots"] = link_hotspots
      next fields
    end
  end
end

class Pano < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
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

class UnitVersion < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Unit Versions"

  has_many :pano_versions, class: "PanoVersion", column: "Pano Versions"

  def feedbacks
      self.pano_versions.map { |pv| pv.feedbacks }.flatten
  end
end

class PanoVersion < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Pano Versions"

  belongs_to :unit_version, class: "UnitVersion", column: "Unit Version"
  has_many :feedbacks, class: "Feedback", column: "Feedback"
end

class Feedback < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Feedback"

  belongs_to :pano_version, class: "PanoVersion", column: "Pano Version"

  def notes_html
    # We get the raw "Notes" value from fields so it isn't type cast
    notes = self.fields["Notes"] || ""
    notes = notes.gsub("\n", "<br>")
    notes
  end
end

class FeedbackPermalink < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Feedback Permalinks"

  def project
    if @project.nil?
      @project = Project.find(self["Project"].first)
    end

    return @project
  end
end

class LinkHotspots < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Link Hotspots"
end

class ProcurementForm < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Procurement Forms"


  def self.find_by_access_token(access_token)
    return false if access_token.nil? or access_token == ""
    records = ProcurementForm.all(filter: "(FIND(\"#{access_token}\", {Access Token}))") || []
    return records.first
  end
end
