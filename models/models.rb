require "airrecord"
require 'redcarpet'

require "./models/db_models.rb"

RENDERING_AIRTABLE_APP_ID = "appTAmLzyXUW1RxaH"
FINISHES_AIRTABLE_APP_ID = "app5xuA2wJKN1rkp0"
FINISHES_2_AIRTABLE_APP_ID = "appWVS9i2byAQv6bn"
CONTENT_AIRTABLE_APP_ID = "appSLMPJEIk05Sday"
Airrecord.api_key = ENV["AIRTABLES_API_KEY"]

# For rendering some HTML
MARKDOWN = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true)

module Finishes
  class Project < Airrecord::Table
    self.base_key = RENDERING_AIRTABLE_APP_ID
    self.table_name = "Projects"

    has_many :categories, class: "Finishes::Category", column: "Categories"

    def selections
      Finishes::Selection.all(filter: "FIND(\"#{self.id}\", {Project ID}) >= 1")
    end

    def options
      Finishes::Option.all(filter: "FIND(\"#{self.id}\", {Project IDs}) >= 1")
    end

    def units
      if @units.nil?
        @units = Unit.all(filter: "(FIND(\"#{self.id}\", {Project ID}))", sort: { Name: "asc" }) || []
      end

      return @units
    end
  end

  class Category < Airrecord::Table
    self.base_key = RENDERING_AIRTABLE_APP_ID
    self.table_name = "Categories"

    has_many :selections, class: "Finishes::Selection", column: "Selections"

    def update(fields)
      self["Name"] = fields["Name"]
      self["Order"] = fields["Order"]
      self["Selections"] = fields["Selections"]
    end

    def is_different?(fields)
      self["Name"] != fields["Name"] ||
      self["Order"] != fields["Order"] ||
      (self["Selections"] || []).length != (fields["Selections"] || []).length ||
      (fields["Selections"] || []).map{ |o| self["Selections"].include?(o) }.include?(false)
    end
  end

  class Selection < Airrecord::Table
    self.base_key = RENDERING_AIRTABLE_APP_ID
    self.table_name = "Selections"

    has_many :options, class: "Finishes::Option", column: "Options"

    def update(fields)
      self["Order"] = fields["Order"]
      self["Room"] = fields["Room"]
      self["Type"] = fields["Type"]
      self["Location"] = fields["Location"]
      self["Notes"] = fields["Notes"]
      self["Category"] = fields["Category"]
      self["Options"] = fields["Options"]
    end

    def is_different?(fields)
      self["Order"] != fields["Order"] ||
      self["Name"] != fields["Name"] ||
      self["Room"] != fields["Room"] ||
      self["Type"] != fields["Type"] ||
      self["Location"] != fields["Location"] ||
      self["Notes"] != fields["Notes"] ||
      self["Category"][0] != fields["Category"][0] ||
      (self["Options"] || []).length != (fields["Options"] || []).length ||
      (fields["Options"] || []).map{ |o| self["Options"].include?(o) }.include?(false)
    end

    def self.finishes_for_project(project)
      return {} if project.nil?
      finishes = {}

      project.categories.map do |c|
        finishes[c["Name"]] = c.selections || []
      end

      return finishes
    end
  end

  class Option < Airrecord::Table
    self.base_key = RENDERING_AIRTABLE_APP_ID
    self.table_name = "Options"

    def self.search_for_component(s)
      # Implement search later
      Finishes::Option.all view: "Has Model"
    end

    def self.search(query)
      Finishes::Option.all(
        view: "Searchable",
        filter: "(FIND(\"#{query}\", {Search Text}))",
        max_records: 100,
      ).group_by { |o| o["Compare String"] }.values.map { |a| a.first }
    end

    def update(fields)
      self["Name"] = fields["Name"]
      self["Order"] = fields["Order"]
      self["Type"] = fields["Type"]
      self["Info"] = fields["Info"]
      self["URL"] = fields["URL"]
      self["Image"] = fields["Image"]
    end

    def is_different?(fields)
      self["Name"] != fields["Name"] ||
      self["Order"] != fields["Order"] ||
      self["Type"] != fields["Type"] ||
      self["Info"] != fields["Info"] ||
      self["URL"] != fields["URL"] ||
      (self["Image"] || []).length != (fields["Image"] || []).length ||
      (fields["Image"] || []).map{ |i| self["Image"].include?(i) }.include?(false)
    end

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

  def get_screenshot_scene_names
    screenshot_scenes = self.parse_model_data[:scenes].select do |s|
      s[:name].downcase.include?("enscape view")
    end
    screenshot_scenes.map { |s| s[:name].gsub(/enscape view/i, "").strip }
  end

  def parse_model_data
    model_data = { scenes: [], layers: {} }
    lines = self["Model Data Output"].split("\n")
    current_scene = nil

    lines.each do |line|
      next unless line.strip.length > 0
      next if line.include? "Model Layers:"
      next if line.include? "Scene Layers:"
      next if line.include? "Scenes:"

      if line.start_with? "Scene:"
        parts = line.split(/:\s+/)
        if parts.length > 1
          name = parts[1].strip
          current_scene = { name: name, layers: {} }
          model_data[:scenes] << current_scene
        end
        next
      end

      parts = line.split(/:\s+/)
      name = parts[0]
      next if name.nil? or name.length == 0
      visibility = -1
      visibility = parts[1].strip.to_i if parts.length > 1

      if current_scene.nil?
        model_data[:layers][name] = visibility
      else
        current_scene[:layers][name] = visibility
      end
    end

    return model_data
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

class RenderingSetting < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Rendering Settings"
end

