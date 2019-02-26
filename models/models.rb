require "airrecord"

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

  def self.finishes_for_project(project)
    return {} if project.nil?
    views = [
      "Walls & Millwork",
      "Flooring",
      "Light Fixtures",
      "Plumbing Fixtures & Acc.",
      "Shelving",
      "Blinds",
      "Mirrors",
      "Appliances",
      "Furniture",
      "Cabinets & Countertops",
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
      @versions = UnitVersion.all(filter: "(FIND(\"#{self.id}\", {Unit ID}))", sort: { "Created At": "desc"})
    end

    return @versions
  end

  def pano_data(version)
    panos = self.panos
    current_version_panos = []

    if !version.nil?
        current_version = version
        current_version_panos = current_version.pano_versions
    end

    return panos.map do |pano|
      pano_version = current_version_panos.find { |p| p["Pano"][0] == pano.id }
      fields = pano.fields
      link_hotspots = pano.link_hotspots.map{ |lh| lh.fields }

      # Backwards compatibility
      pano["Image URL"] = pano_version["Image URL"] unless pano_version.nil?

      fields["link_hotspots"] = link_hotspots
      next fields
    end
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

  def link_hotspots
    if @link_hotspots.nil?
      @link_hotspots = LinkHotspots.all(filter: "(FIND(\"#{self.id}\", {Pano ID}))")
    end

    return @link_hotspots
  end
end

class PanoVersion < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Pano Versions"

  belongs_to :unit_version, class: "UnitVersion", column: "Unit Version"
  has_many :feedbacks, class: "Feedback", column: "Feedback"
end

class UnitVersion < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Unit Versions"

  has_many :pano_versions, class: "PanoVersion", column: "Pano Versions"

  def feedbacks
      self.pano_versions.map { |pv| pv.feedbacks }.flatten
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

class LinkHotspots < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Link Hotspots"
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
