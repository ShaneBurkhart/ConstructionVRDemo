require 'sinatra/base'

require './routes/includes.rb'

module Routes
  class App < Sinatra::Base
    set :views, Proc.new { "/app/views" }

    include Includes::CurrentUser

    register do
      def auth (type)
        condition do
          redirect "/sign_in" if current_user.nil?
        end
      end
    end

    get "/projects", :auth => :user do
      haml :projects
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

      haml :project_finishes, locals: {
        markdown: MARKDOWN,
        project: project,
        access_token: access_token,
        no_style: true,
        fixed_width_viewport: true,
        is_admin_mode: is_admin_mode,
      }
    end

    get '/project/:access_token/feedbacks', :auth => :user do
      access_token = params[:access_token]
      project = find_project_by_access_token(access_token)
      return "Not found" if project.nil?

      @units = project.units
      haml :project_feedbacks, locals: {
        access_token: access_token,
        project: project,
      }
    end

    get '/project/:access_token/unit/:id/feedback_feed', :auth => :user do
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

    get '/project/:access_token/unit/:id' do
      access_token = params[:access_token]
      is_debug_mode = !!params[:debug] || !!session[:is_admin]
      is_admin_mode = !!session[:is_admin]
      is_tour = !!params[:show_tour]

      project = find_project_by_access_token(access_token)
      return "Not found" if project.nil?

      unit = Unit.find(params[:id])
      return "Not found" if unit.nil? or !unit.belongs_to_project?(project)

      @version_id = (unit["Current Version"] || [])[0] || unit["Versions"].last
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

    get '/project/:access_token/unit/:id/set_description', :auth => :user do
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

    get '/project/:access_token/unit/:id/set_visibility', :auth => :user do
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

      return redirect "/project/#{access_token}/unit/#{unit_id}"
    end

    get '/project/:access_token/unit/:id/set_current_version', :auth => :user do
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

  end
end

