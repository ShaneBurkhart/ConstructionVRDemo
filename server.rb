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
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  haml :project, locals: { project: project, access_token: access_token }
end

get '/project/:access_token/unit/:id' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  unit = Unit.find(params[:id])
  return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

  haml :unit, locals: { unit: unit, access_token: access_token }
end

get '/project/:access_token/pano/:id' do
  access_token = params[:access_token]
  is_debug_mode = !!params[:debug]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  pano = Pano.find(params[:id])
  return "Not found" if pano.nil? or !pano.unit.belongs_to_project?(project)

  haml :pano, locals: {
    pano: pano,
    pano_image: pano["Image"].first || {},
    access_token: access_token,
    is_debug_mode: is_debug_mode
  }
end

post '/project/:access_token/pano/:id/feedback' do
  access_token = params[:access_token]
  project = find_project_by_access_token(access_token)
  return "Not found" if project.nil?

  pano = Pano.find(params[:id])
  return "Not found" if pano.nil? or !pano.unit.belongs_to_project?(project)

  feedback = Feedback.new(
    "Pano" => [pano.id],
    "Notes" => params["notes"],
    "View Parameters" => params["viewParameters"]
  )
  feedback.create

  redirect "/project/#{access_token}/pano/#{pano.id}"
end

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
      @panos = Pano.all(filter: "(FIND(\"#{self.id}\", {Unit ID}))", sort: { Name: "asc" }) || []
    end

    return @panos
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

  def feedbacks
    if @feedbacks.nil?
      @feedbacks = Feedback.all(filter: "(FIND(\"#{self.id}\", {Pano ID}))", sort: { "Created At": "desc"})
    end

    return @feedbacks
  end
end

class Feedback < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Feedback"
end
