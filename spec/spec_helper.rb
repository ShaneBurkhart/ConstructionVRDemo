require 'rack/test'
require 'rspec'
require 'capybara/rspec'
require 'securerandom'

ENV['RACK_ENV'] = 'test'

require "./server.rb"

ADMIN_USER_EMAIL = "shane@finishvisionvr.com"
TEST_USER_EMAIL = "test@finishvisionvr.com"
TEST_USER_PASSWORD = "password"
TEST_PROJECT_NAME = "Test Job"

Capybara.app = FinishVision

module RSpecMixin
  include Rack::Test::Methods
  def app() FinishVision end
end

# For RSpec 2.x and 3.x
RSpec.configure do |c|
  c.include RSpecMixin

  c.before :all do
    # Create a test user
    user = Finishes::User.find_by_email(TEST_USER_EMAIL)
    if user.nil?
      post "/sign_up", {
        first_name: "Test",
        last_name: "User",
        team_name: "Team",
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }
      # Make sure we are logged out
      get "/logout"

      user = Finishes::User.find_by_email(TEST_USER_EMAIL)
    end

    # Create admin user
    admin = Finishes::User.find_by_email(ADMIN_USER_EMAIL)
    if admin.nil?
      post "/sign_up", {
        first_name: "Test",
        last_name: "User",
        team_name: "Team",
        email: ADMIN_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }
      # Make sure we are logged out
      get "/logout"

      admin = Finishes::User.find_by_email(ADMIN_USER_EMAIL)
    end

    # Create a test job
    @project = Finishes::Project.find_by_name(TEST_PROJECT_NAME)
    if @project.nil?
      @project = Finishes::Project.create({
        "Name" => TEST_PROJECT_NAME,
        "Team" => [user.owned_team.id],
        "Access Token" => SecureRandom.uuid,
      })
    end

    @unit = @project.units.first
    if @unit.nil?
      @unit = Unit.create({
        "Project" => [@project.id],
        "Name" => "Test Unit",
      })
      uv = UnitVersion.create({ "Unit" => [@unit.id] })
      @unit["Current Version"] = [uv.id]
      @unit.save
    end
  end
end
