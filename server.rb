require "sinatra"
require "active_record"
require "slack-ruby-client"
require "haml"
require "redis-store"
require 'redis-rack'
require 'redcarpet'
require 'json'
require 'cgi'
require 'aws-sdk'
require 'aws-sdk-s3'
require 'securerandom'

require './util/slack.rb'
require './util/messages.rb'
require './models/models.rb'
require './models/db_models.rb'

require './routes/app.rb'
require './routes/user.rb'
require './routes/api.rb'
require './routes/dashboard.rb'

Aws.config.update({
  region: ENV["REGION"],
  credentials: Aws::Credentials.new(ENV["ACCESS_KEY_ID"], ENV["SECRET_ACCESS_KEY"])
})

MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

# docker needs stdout to sync to get logs.
$stdout.sync = true

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

class FinishVision < Sinatra::Base
  set :bind, '0.0.0.0'
  set :views, Proc.new { "/app/views" }

  use Rack::Session::Redis, :redis_server => 'redis://redis:6379/0'

  include Includes::CurrentUser

  register do
    def no_auth (type)
      condition do
        redirect "/projects" if !current_user.nil?
      end
    end

    def auth (type)
      condition do
        redirect "/sign_in" if current_user.nil?
      end
    end
  end

  get '/93e8e03a-9c36-48bc-af15-54db7715ac15/component/search' do
    s = params[:s] || ""
    haml :component_search, locals: {
      finish_options: Finish::Options.search_for_component(s)
    }
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

  get "/", :no_auth => :user do
    haml :home
  end

  use Routes::App
  use Routes::User
  use Routes::API
  use Routes::Dashboard

  run! if __FILE__ == $0
end


