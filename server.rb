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

def find_user_by_access_token(access_token)
  return false if access_token.nil? or access_token == ""

  records = User.all filter: "(FIND(\"#{access_token}\", {Access Token}))"

  return records.first
end

def current_user
  user_id = session["user_id"]
  return nil if user_id.nil? or user_id == ""
  return User.find user_id
end

# Log user in with their access token (UUID).
get '/login/:access_token' do
  access_token = params[:access_token]
  user = find_user_by_access_token(access_token)
  return "Not found" if user.nil?

  session["user_id"] = user.id

  redirect "/projects"
end

# List projects for current user
get '/projects' do
  user = current_user
  return "Not found" if user.nil?

  haml :projects, locals: { projects: user.projects }
end

get '/project/:id' do
  user = current_user
  return "Not found" if user.nil?

  project = Project.find(params[:id])
  return "Not found" if project.nil? or !project.belongs_to_user?(user)

  haml :project, locals: { project: project }
end

get '/unit/:id' do
  user = current_user
  return "Not found" if user.nil?

  unit = Unit.find(params[:id])
  return "Not found" if unit.nil? or !unit.project.belongs_to_user?(user)

  haml :unit, locals: { unit: unit }
end

get '/pano/:id' do
  user = current_user
  return "Not found" if user.nil?

  pano = Pano.find(params[:id])
  return "Not found" if pano.nil? or !pano.unit.project.belongs_to_user?(user)

  haml :pano, locals: { pano: pano, pano_image: pano["Image"].first || {} }
end

post '/pano/:id/feedback' do
  user = current_user
  return "Not found" if user.nil?

  pano = Pano.find(params[:id])
  return "Not found" if pano.nil? or !pano.unit.project.belongs_to_user?(user)

  feedback = Feedback.new "Pano" => [pano.id], "User" => [user.id], "Notes" => params["notes"]
  feedback.create

  redirect "/pano/#{pano.id}"
end

class User < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Users"

  def viewer_projects
    return Project.all(filter: "(FIND(\"#{self.id}\", {Viewer IDs}))") || []
  end

  def editor_projects
    return Project.all(filter: "(FIND(\"#{self.id}\", {Editor IDs}))") || []
  end

  def projects
    return (viewer_projects + editor_projects).uniq { |i| i.id }
  end
end

class Project < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Projects"

  has_many :units, class: "Unit", column: "Units"

  def viewers
    return User.all(filter: "(FIND(\"#{self.id}\", {Viewer Project IDs}))") || []
  end

  def editors
    return User.all(filter: "(FIND(\"#{self.id}\", {Editor Project IDs}))") || []
  end

  def users
    return viewers + editors
  end

  def belongs_to_user?(user)
    return !!self.users.find { |u| return user.id == u.id }
  end

  def units
    return Unit.all(filter: "(FIND(\"#{self.id}\", {Project ID}))", sort: { Name: "asc" }) || []
  end
end

class Unit < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Units"

  def project
    return Project.all(filter: "(FIND(\"#{self.id}\", {Unit IDs}))").first
  end

  def panos
    return Pano.all(filter: "(FIND(\"#{self.id}\", {Unit ID}))", sort: { Name: "asc" }) || []
  end
end

class Pano < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Panos"

  def unit
    return Unit.all(filter: "(FIND(\"#{self.id}\", {Pano IDs}))").first
  end

  def feedbacks
    return Feedback.all(filter: "(FIND(\"#{self.id}\", {Pano ID}))", sort: { "Created At": "desc"})
  end
end

class Feedback < Airrecord::Table
  self.base_key = AIRTABLES_APP_ID
  self.table_name = "Feedback"
end
