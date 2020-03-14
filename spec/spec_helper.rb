require 'rack/test'
require 'rspec'

ENV['RACK_ENV'] = 'test'

require "./server.rb"

module RSpecMixin
  include Rack::Test::Methods
  def app() FinishVision end
end

# For RSpec 2.x and 3.x
RSpec.configure { |c| c.include RSpecMixin }
