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

    get "/projects", :auth => :user  do
      haml :projects
    end
  end
end

