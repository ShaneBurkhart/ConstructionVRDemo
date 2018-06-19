require "sinatra"
require "haml"
require "airrecord"
require "redis-store"
require 'redis-rack'

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

get '/project/:access_token' do
  is_debug_mode = !!params[:debug]
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
  haml :project_feedbacks
end

get '/project/:access_token/unit/:id' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug]

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

class LinkHotspots < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Link Hotspots"
end
