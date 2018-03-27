require "sinatra"
require "haml"

set :bind, '0.0.0.0'

get '/demo' do
  haml :index, locals: { api_key: ENV["AIRTABLES_API_KEY"] }
end
