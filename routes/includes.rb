require 'sinatra/base'

module Includes
  module CurrentUser
    # Add user to the request.
    def current_user
      @current_user ||= nil

      if !session[:user_id].nil?
        @current_user ||= Finishes::User.find(session[:user_id])
      end

      return @current_user
    end
  end

  module AuthenticateUser
    def self.included(base)
      register do
        def auth (type)
          condition do
            redirect "/sign_in" if @current_user.nil?
          end
        end
      end
    end
  end
end
