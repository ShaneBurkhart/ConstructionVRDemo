require "./models/models.rb"

def create_feedback_notification_message(feedback, unit_version)
  unit = unit_version.unit
  project = unit.project

  unit_name = unit_version["Unit Name"][0]
  project_name = unit_version["Project Name"][0]
  project_prod_link = project["Prod Link"]
  unit_feedback_link = "#{project_prod_link}/unit/#{unit.id}/feedback_feed"

  return [
    "A comment was added to #{unit_name} on #{project_name} project: <#{unit_feedback_link}|All Feedback>",
    feedback["Notes"],
    "===========",
  ].join("\n")
end
