require "./models/models.rb"

def create_feedback_notification_message(feedback)
  unit_version = UnitVersion.find(feedback["Unit Version ID"][0])
  unit = unit_version.unit
  project = unit.project

  unit_name = feedback["Unit Name"][0]
  project_name = feedback["Project Name"][0]
  project_prod_link = project["Prod Link"]
  unit_feedback_link = "#{project_prod_link}/unit/#{unit.id}/feedback_feed"

  return [
    "A comment was added to #{unit_name} on #{project_name} project: <#{unit_feedback_link}|All Feedback>",
    feedback["Notes"],
    "===========",
  ].join("\n")
end
