require "./spec/spec_helper.rb"

# Make sure the pages we see when logged in and logged out are appropriate

# Paths that should only authenticate for shane@finishvisionvr.com
# No one else. Show 404 if not authenticated.
ADMIN_AUTH_PATHS = [
  ["GET", "/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard"],
  ["GET", "/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard/restart"],
]

# Requests that should be 200 when user signed in
# Requests that should redirect when user is not signed in
AUTH_PATHS = [
  ["GET", "/logout"],
  ["GET", "/projects"],
  # Arbitrary UUID. Don't make it an existing UUID.
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/feedbacks"],
  # Arbitrary IDs
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/unit/rec1dKshaneSwPaKB/feedback_feed"],
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/unit/rec1dKshaneSwPaKB/set_description"],
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/unit/rec1dKshaneSwPaKB/set_visibility"],
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/unit/rec1dKshaneSwPaKB/set_current_version"],

  ["POST", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/screenshot/feedback"],
  ["POST", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/pano/rec1dKburkhSwPaKB/feedback"],
  ["POST", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/feedback_feed/rec1dKsburkSwPaKB/update"],

  ["POST", "/api/temp_upload/presign"],
  ["GET", "/api/finishes/options/search"],
  ["POST", "/api/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/finishes/save"],
]

# Requests that should be 200 when no user
# Requests that should redirect when user
UNAUTH_PATHS = [
  ["GET", "/"],
  ["GET", "/sign_in"],
  ["POST", "/sign_in"],
  ["GET", "/sign_up"],
  ["POST", "/sign_up"],
]

# Requests that should be 200 all of the time. User or not.
AUTH_AGNOSTIC_PATHS = [
  # Arbitrary UUID. Don't make it an existing UUID.
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd"],
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/finishes"],
  ["GET", "/api/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/finishes"],
  ["GET", "/project/9f09f4ba-700d-4cb7-8e98-ab84b7bd6abd/unit/rec1dKshaneSwPaKB"],
]

RSpec.describe "User Authentication" do
  context "with no user session" do
    before :each do
      # Make sure we are logged out
      get "/logout"
    end

    ADMIN_AUTH_PATHS.each do |r|
      it "should be not found #{r[1]}" do
        custom_request r[0], r[1]

        expect(last_response.status).to be(404)
      end
    end

    AUTH_PATHS.each do |r|
      it "should auth redirect #{r[1]}" do
        custom_request r[0], r[1]

        expect(last_response.status).to be(302)
        expect(last_response.headers["Location"]).to end_with("/sign_in")
      end
    end

    UNAUTH_PATHS.each do |r|
      it "should be unauth okay #{r[1]}" do
        custom_request r[0], r[1]

        expect(last_response.status).to be(200)
      end
    end

    AUTH_AGNOSTIC_PATHS.each do |r|
      it "should be auth agnostic #{r[1]}" do
        custom_request r[0], r[1]

        expect(last_response.status).to be(200)
      end
    end
  end

  context "with user session" do
    before :each do
      post "/sign_in", {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
      }
    end

    ADMIN_AUTH_PATHS.each do |r|
      it "should be not found #{r[1]}" do
        custom_request r[0], r[1]

        expect(last_response.status).to be(404)
      end
    end

    AUTH_PATHS.each do |r|
      it "should auth redirect #{r[1]}" do
        custom_request r[0], r[1]

        if r[1] == "/logout"
          expect(last_response.status).to be(302)
          expect(last_response.headers["Location"]).to end_with("/")
        else
          expect(last_response.status).to be(200)
        end
      end
    end

    UNAUTH_PATHS.each do |r|
      it "should redirect #{r[1]}" do
        custom_request r[0], r[1]

        expect(last_response.status).to be(302)
        expect(last_response.headers["Location"]).to end_with("/projects")
      end
    end

    AUTH_AGNOSTIC_PATHS.each do |r|
      it "should be auth agnostic #{r[1]}" do
        custom_request r[0], r[1]

        expect(last_response.status).to be(200)
      end
    end
  end

  context "with admin(shane@finishvisionvr.com) user session" do
    before :each do
      post "/sign_in", {
        "email": ADMIN_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
      }
    end

    ADMIN_AUTH_PATHS.each do |r|
      it "should be okay #{r[1]}" do
        custom_request r[0], r[1]

        if r[1] == "/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard/restart"
          expect(last_response.status).to be(302)
          expect(last_response.headers["Location"]).to end_with("/cdd3e3ea-b1bb-453b-96d3-35d344ebc598/rendering/dashboard")
        else
          expect(last_response.status).to be(200)
        end
      end
    end

  end
end
