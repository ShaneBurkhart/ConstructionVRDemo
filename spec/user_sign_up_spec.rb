require "./spec/spec_helper.rb"

RSpec.describe "User Sign Up" do

  context "when user exists with email #{TEST_USER_EMAIL}" do
    it "should not let duplicate emails" do
      post "/sign_up", {
        first_name: "Test",
        last_name: "User",
        team_name: "Team",
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }

      # It would redirect if it was successful
      expect(last_response.status).to be(200)
    end
  end
end
