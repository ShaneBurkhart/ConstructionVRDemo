require "airrecord"
require 'redcarpet'

require "./models/db_models.rb"

RENDERING_AIRTABLE_APP_ID = "appTAmLzyXUW1RxaH"
FINISHES_AIRTABLE_APP_ID = "app5xuA2wJKN1rkp0"
Airrecord.api_key = ENV["AIRTABLES_API_KEY"]

# For rendering some HTML
MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

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

    views.each do |view|
      finishes[view] = self.all(view: view)
    end

    return finishes
  end
end

class Project < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Projects"

  def units
    if @units.nil?
      @units = Unit.all(filter: "(FIND(\"#{self.id}\", {Project ID}))", sort: { Name: "asc" }) || []
    end

    return @units
  end

  def procurement_forms
    if @procurement_forms.nil?
      @procurement_forms = ProcurementForm.all(filter: "{Project ID} = '#{self.id}'", sort: { "Created At" => "desc" })
    end

    return @procurement_forms
  end
end

class Unit < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Units"

  has_many :current_version, class: "UnitVersion", column: "Current Version"

  def belongs_to_project?(project)
    return false if project.nil?
    self.project.id == project.id
  end

  def project
    if @project.nil?
      @project = Project.all(filter: "(FIND(\"#{self.id}\", {Unit IDs}))").first
    end

    return @project
  end

  def panos
    if @panos.nil?
      @panos = Pano.all(filter: "(FIND(\"#{self.id}\", ARRAYJOIN({Unit ID})))", sort: { "Order Priority": "asc" }) || []
    end

    return @panos
  end

  def versions
    if @versions.nil?
      @versions = UnitVersion.all(filter: "(FIND(\"#{self.id}\", {Unit ID}))", sort: { "Created At": "desc" })
    end

    return @versions
  end

  def latest_has_errors?
    return false if self["Versions"].length == 0
    current_version = self.versions.first
    errors = current_version["Errors"]
    return !errors.nil? && errors.length > 0
  end

  def total_feedbacks
    self["Total Feedback Count"]
  end

  def total_completed_feedbacks
    self["Completed Feedback Count"]
  end

  def total_feedbacks_to_complete
    self["TODO Feedback Count"]
  end
end

class Pano < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Panos"

  def unit
    if @unit.nil?
      @unit = Unit.all(filter: "(FIND(\"#{self.id}\", {Pano IDs}))").first
    end

    return @unit
  end
end

class ScreenshotVersion < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Screenshot Versions"

  belongs_to :unit_version, class: "UnitVersion", column: "Unit Version"
end

class PanoVersion < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Pano Versions"

  belongs_to :unit_version, class: "UnitVersion", column: "Unit Version"
  has_many :feedbacks, class: "Feedback", column: "Feedback"
  has_one :pano, class: "Pano", column: "Pano"

  def link_hotspots
    DBModels::LinkHotspot.where(pano_version_id: self.id)
  end
end

class UnitVersion < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Unit Versions"

  has_one :unit, class: "Unit", column: "Unit"
  has_many :pano_versions, class: "PanoVersion", column: "Pano Versions"
  has_many :screenshot_versions, class: "ScreenshotVersion", column: "Screenshot Versions"

  def is_viewable?
    !self["Floor Plan Image URL"].nil?
  end

  def is_rendering?
    !self.is_viewable? and !self.has_errors?
  end

  def has_errors?
    !self["Errors"].nil?
  end

  def total_to_complete
    self["Total Feedback Count"]
  end

  def total_completed
    self["Completed Feedback Count"]
  end

  def feedbacks
    self.pano_versions.map { |pv| pv.feedbacks }.flatten.sort_by{ |f| f["Created At"] }.reverse
  end

  def pano_data
    pano_versions = self.pano_versions.sort_by { |p| p["Order Priority"] }

    return pano_versions.map do |pano_version|
      pano = pano_version.pano
      link_hotspots = pano_version.link_hotspots.map{ |lh| lh.as_json }

      fields = pano_version.fields
      # Match the pano ID for backwards compatibility
      fields["link_hotspots"] = link_hotspots
      next fields
    end
  end
end

class Feedback < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Feedback"

  belongs_to :pano_version, class: "PanoVersion", column: "Pano Version"

  def notes_html
    # We get the raw "Notes" value from fields so it isn't type cast
    notes = self.fields["Notes"] || ""
    MARKDOWN.render(notes)
  end
end

class FeedbackPermalink < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Feedback Permalinks"

  def project
    if @project.nil?
      @project = Project.find(self["Project"].first)
    end

    return @project
  end
end

class ProcurementForm < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Procurement Forms"


  def self.find_by_access_token(access_token)
    return false if access_token.nil? or access_token == ""
    records = ProcurementForm.all(filter: "(FIND(\"#{access_token}\", {Access Token}))") || []
    return records.first
  end
end

class RenderingSetting < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Rendering Settings"
end

