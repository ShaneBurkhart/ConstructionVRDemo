require "airrecord"

RENDERING_AIRTABLE_APP_ID = "appTAmLzyXUW1RxaH"

class FinishOptions < Airrecord::Table
  self.base_key = FINISHES_AIRTABLE_APP_ID
  self.table_name = "Finish Options"

  def self.search_for_component(s)
    # Implement search later
    FinishOptions.all view: "Has Model"
  end
end

class ProjectFinishSelections < Airrecord::Table
  self.base_key = FINISHES_AIRTABLE_APP_ID

  has_many :finish_options, class: "FinishOptions", column: "Options"

  def self.finishes_for_project(project)
    return {} if project.nil?
    views = [
      "Concepts",
      "Walls & Millwork",
      "Flooring",
      "Cabinets & Countertops",
      "Tile",
      "Light Fixtures",
      "Plumbing Fixtures & Acc.",
      "Mirrors",
      "Blinds",
      "Shelving",
      "Appliances",
      "Furniture",
      "Exterior",
      "Misc"
    ]
    finishes = {}
    self.table_name = project["Finish Selections Table Name"]
    self.table_name = project if project.is_a?(String)

    views.each do |view|
      finishes[view] = self.all(view: view)
    end

    return finishes
  end
end

