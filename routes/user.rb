require 'sinatra/base'

require './models/models.rb'

module Routes
  class User < Sinatra::Base
    set :views, Proc.new { "/app/views" }

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

    def validate_sign_up_form(form)
      errors = {}

      # Presence validation
      ["First Name", "Last Name", "Password", "Email", "Team Name"].each do |k|
        errors[k] = "Need a #{k.downcase}." if form[k].nil?
      end

      pass = form["Password"] || ""
      if pass.length < 8
        errors["Password"] = "Password needs 8+ characters."
      end

      return errors.empty? ? nil : errors
    end

    get "/logout", :auth => :user do
      session[:user_id] = nil
      session[:is_admin] = nil

      redirect "/"
    end

    get "/sign_up", :no_auth => :user  do
      haml :sign_up
    end

    post "/sign_up", :no_auth => :user do
      form = {
        "First Name" => params[:first_name],
        "Last Name" => params[:last_name],
        "Email" => params[:email],
        "Password" => params[:password],
        "Team Name" => params[:team_name]
      }

      errors = validate_sign_up_form(form)
      if !errors.nil?
        return haml :sign_up, locals: { errors: errors }
      end

      team = Finishes::Team.create({ "Name": form["Team Name"] })
      user = Finishes::User.new(form.slice("First Name", "Last Name", "Email"))
      user.teams += [ team ]

      user.hash_password(form["Password"])
      user.save

      session[:user_id] = user.id
      session[:is_admin] = true

      redirect "/projects"
    end

    get "/sign_in", :no_auth => :user do
      haml :sign_in
    end

    post "/sign_in", :no_auth => :user do
      email = params[:email]
      password = params[:password]

      user = Finishes::User.authenticate(email, password)
      if user.nil?
        return haml :sign_in, locals: { email: email }
      end

      session[:user_id] = user.id
      session[:is_admin] = true

      redirect "/projects"
    end
  end
end
