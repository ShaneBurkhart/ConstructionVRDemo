require 'sinatra/base'

require './models/models.rb'

module Routes
  class User < Sinatra::Base
    set :views, Proc.new { "/app/views" }

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

    get "/sign_up" do
      haml :sign_up
    end

    post "/sign_up" do
      form = {
        "First Name" => params[:first_name],
        "Last Name" => params[:last_name],
        "Email" => params[:email],
        "Password" => params[:password],
        "Team Name" => params[:team_name]
      }

      errors = validate_sign_up_form(form)
      if !errors.nil?
        puts "errors"
        return haml :sign_up, locals: { errors: errors }
      end

      team = Finishes::Team.create({ "Name": form["Team Name"] })
      user = Finishes::User.new(form.slice("First Name", "Last Name", "Email"))
      user.teams += [ team ]

      user.hash_password(form["Password"])
      user.save

      puts session.inspect
      puts "asdfadf"

      session[:user_id] = user.id
      session[:is_admin] = true

      redirect "/projects"
    end

    get "/sign_in" do
      puts @current_user.inspect
      puts session.inspect
      haml :sign_in
    end

    post "/sign_in" do
      email = params[:email]
      password = params[:password]

      user = Finishes::User.authenticate(email, password)
      if user.nil?
        return haml :sign_in, locals: { email: email }
      end

      puts session.inspect
      session[:user_id] = user.id
      session[:is_admin] = true

      puts session.inspect

      redirect "/projects"
    end
  end
end
