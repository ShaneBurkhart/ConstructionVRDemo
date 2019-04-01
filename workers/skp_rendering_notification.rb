require 'open-uri'

require "./util/slack.rb"
require "./models/models.rb"

def create_unit_version_rendering_completed_notification_message(unit_version)
  unit = unit_version.unit
  project = unit.project

  unit_name = unit["Name"]
  project_name = project["Name"]
  project_prod_link = project["Prod Link"]
  unit_link = "#{project_prod_link}/unit/#{unit.id}"
  unit_feedback_link = "#{unit_link}/feedback_feed"

  return "Done rendering #{unit_name} unit in #{project_name}. <#{unit_link}|View> - <#{unit_feedback_link}|Feedback>"
end

def send_update_hotspots_email_to_magic_team(unit_version)
  # TODO Send email to magic team email.
  # Start with sending it to Meghan in slack.
end

loop do
  unit_versions = UnitVersion.all(view: "To Notify")

  unit_versions.each do |unit_version|
    slack_message = create_unit_version_rendering_completed_notification_message(unit_version)
    send_slack_message_to_rendering_channel(slack_message)

    send_update_hotspots_email_to_magic_team(unit_version)

    unit_version["Notified At"] = Time.now
    unit_version.save
  end

  sleep 60
end
