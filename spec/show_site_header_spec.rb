require "./spec/spec_helper.rb"

RSpec.describe "Site Header Visibility", type: :feature do
  context "when user is present" do
    before :each do
      visit "/logout"
      visit "/sign_in"
      fill_in "email", with: TEST_USER_EMAIL
      fill_in "password", with: TEST_USER_PASSWORD
      click_button "Sign In"
    end

    it "should show a header on .../renderings unit picker" do
      visit "/project/#{@project["Access Token"]}"
      expect(page.has_selector?("#site-header")).to be_truthy
    end

    it "should show a header on .../renderings unit viewer" do
      visit "/project/#{@project["Access Token"]}/unit/#{@unit.id}"
      expect(page.has_selector?("#site-header")).to be_truthy
    end

    it "should show a header on .../finishes" do
      visit "/project/#{@project["Access Token"]}/finishes"
      expect(page.has_selector?("#site-header")).to be_truthy
    end
  end

  context "when user is absent" do
    before :each do
      # Make sure we are logged out
      visit "/logout"
    end

    it "should not show a header on .../renderings unit picker" do
      visit "/project/#{@project["Access Token"]}"
      expect(page.has_selector?("#site-header")).to be_falsey
    end

    it "should not show a header on .../renderings unit viewer" do
      visit "/project/#{@project["Access Token"]}/unit/#{@unit.id}"
      expect(page.has_selector?("#site-header")).to be_falsey
    end

    it "should not show a header on .../finishes" do
      visit "/project/#{@project["Access Token"]}/finishes"
      expect(page.has_selector?("#site-header")).to be_falsey
    end
  end
end
