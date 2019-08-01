require 'open-uri'
require "airrecord"

require "./util/slack.rb"
require "./models/models.rb"

def check_unit_version_model(unit_version)
  # Check for all panoramas as scenes.  Including entry, and floor plan.
  panos = unit_version.unit.panos
  model_data = unit_version.parse_model_data
  errors = []

  fp_scene = model_data[:scenes].find { |scene| scene[:name].downcase == "floor plan" }
  errors << "Missing scene with name matching 'Floor Plan'. Make sure the name matches exactly :)" if fp_scene.nil?

  panos.each do |pano|
    name = pano["Name"]
    scene = model_data[:scenes].find { |scene| scene[:name].downcase == name.downcase }
    errors << "Missing scene with name matching '#{name}'. Make sure the name matches exactly :)" if scene.nil?
  end

  model_data[:errors] = errors
  return model_data
end

def create_unit_version_error_notification_message(unit_version)
  unit = unit_version.unit
  project = unit.project

  unit_name = unit["Name"]
  project_name = project["Name"]
  project_prod_link = project["Prod Link"]
  unit_feedback_link = "#{project_prod_link}/unit/#{unit.id}/feedback_feed"

  return "Oh no! Errors for #{unit_name} unit in #{project_name}. Please fix and resubmit. <#{unit_feedback_link}|View Errors>"
end

def create_unit_version_success_notification_message(unit_version)
  unit = unit_version.unit
  project = unit.project

  unit_name = unit["Name"]
  project_name = project["Name"]
  project_prod_link = project["Prod Link"]
  unit_feedback_link = "#{project_prod_link}/unit/#{unit.id}/feedback_feed"

  return "Successfully tested #{unit_name} unit in #{project_name}. Rendering will start soon. <#{unit_feedback_link}|Check Progress>"
end

loop do
  begin
    unit_versions = UnitVersion.all(view: "To Test")
    available_rendering_settings = RenderingSetting.all(view: "Available")

    unit_versions.each do |unit_version|
      model_data = check_unit_version_model(unit_version)
      errors = model_data[:errors]
      screenshots = model_data[:scenes].select { |s| s[:name].downcase.include? "enscape view" }
      screenshot_count = screenshots.nil? ? 0 : screenshots.length

      # Include default setting no matter what.  The Record ID is for FV000.
      rendering_settings_codes = ["rec1OLozwPCO6FhRj"]
      if !screenshots.nil?
        screenshots.each do |s|
          result = /[fF][vV]\d{3}/.match(s[:name])
          # We will use default if no settings are provided.  Default is already added.
          next if result.nil?
          r = available_rendering_settings.find { |t| t["Name"] === result[0] }
          next if setting.nil?
          rendering_settings_codes << r.id
        end
      end

      if errors.length > 0
        unit_version["Errors"] = errors.join("\n")
        slack_message = create_unit_version_error_notification_message(unit_version)
        send_slack_message_to_rendering_channel(slack_message)
      else
        slack_message = create_unit_version_success_notification_message(unit_version)
        send_slack_message_to_rendering_channel(slack_message)
      end

      unit_version["Screenshot Count"] = screenshot_count
      unit_version["Tested At"] = Time.now
      unit_version["Rendering Settings"] = rendering_settings_codes
      unit_version.save
    end
  rescue Airrecord::Error => e
    puts "Ooopps! There was an Airtables error.  Waiting a bit, then trying again."
    puts e
  end

  sleep 60
end
