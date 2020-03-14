require 'sinatra/base'

require './models/models.rb'

module Routes
  class Dashboard < Sinatra::Base
    set :views, Proc.new { "/app/views" }

    include Includes::CurrentUser

    register do
      def admin_auth (type)
        condition do
          if current_user.nil? or current_user["Email"] != "shane@finishvisionvr.com"
            halt(404)
          end
        end
      end
    end

    get '/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard', :admin_auth => :user do
      is_admin = !!session[:is_admin]
      return "Not found" unless is_admin

      haml :rendering_dashboard, locals: {
        unit_versions: UnitVersion.all(sort: { "Created At": "desc" }, max_records: 30),
        unit_versions_to_render: UnitVersion.all(view: "To Render"),
      }
    end

    get '/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard/restart', :admin_auth => :user do
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
  end
end
