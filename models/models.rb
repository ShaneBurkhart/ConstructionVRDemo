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

module Content
  class Links < Airrecord::Table
    self.base_key = CONTENT_AIRTABLE_APP_ID
    self.table_name = "Links"
  end
end

module Finishes
  class Selection < Airrecord::Table
    self.base_key = RENDERING_AIRTABLE_APP_ID
    self.table_name = "Selections"

    has_many :options, class: "Finishes::Option", column: "Options"

    CATEGORY_ORDER = [
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

    def belongs_to_project?(project)
      return false if project.nil?
      return self["Project"][0] == project.id
    end

    def self.finishes_for_project(project)
      return {} if project.nil?
      selections = project.selections
      by_category = selections.group_by { |s| s["Category"] }
      output = []

      by_category.delete(nil)

      self::CATEGORY_ORDER.each do |c|
        next if by_category[c].nil?
        output << { category: c, selections: by_category[c] }
      end

      remaining = by_category.except(self::CATEGORY_ORDER).to_a.map { |k, v|
        { category: k, selections: v }
      }
      output.concat(remaining.sort_by{ |s| s[:category] })

      return output
    end
  end

  class Option < Airrecord::Table
    self.base_key = RENDERING_AIRTABLE_APP_ID
    self.table_name = "Options"

    FINISH_VISION_VR_TEAM_USER_ID = "recCToPMsjUh8gdcc"
    TYPES = [
      "Concepts",
      "Flooring",
      "Light Fixture",
      "Bath Accessories",
      "Appliance",
      "Plumbing Fixture",
      "Tile",
      "Exterior",
      "Cabinet/Countertop",
      "Paint Color",
      "LVT - Luxury Vinyl Tile",
      "Millwork",
      "Furniture",
      "Mirrors",
      "Art",
      "Misc",
      "Blinds",
      "Shelving",
      "Doors",
      "Other"
    ]

    def self.search_for_component(s)
      # Implement search later
      self.all view: "Has Model"
    end

    def self.promo_results
      sort = { "Used In Selection Count": "desc" }

      return {
        promoResults: {
          byOptionType: self::TYPES.map{ |t|
            by_option_type_filter = "AND(FIND('#{Finishes::Option::FINISH_VISION_VR_TEAM_USER_ID}', {User ID}), FIND('#{t}', {Type}))"

            [t, self.all(filter: by_option_type_filter, sort: sort, max_records: 10)]
          }.to_h
        }
      }
    end

    def self.search(s, category, user)
      return {} if user.nil?
      sort = { "Used In Selection Count": "desc" }
      search_filter = "FIND('#{s}', {Search Text})"
      if category.length
        search_filter = "AND({Type} = '#{category}', FIND('#{s}', {Search Text}))"
      end

      user_library_filter = "AND(FIND({User ID}, '#{user.id}'), #{search_filter})"
      finish_vision_library_filter = "AND(FIND({User ID}, '#{Finishes::Option::FINISH_VISION_VR_TEAM_USER_ID}'), #{search_filter})"

      return {
        searchResults: {
          query: s,
          category: category,
          userLibrary: self.all(
            filter: user_library_filter,
            sort: sort,
            paginate: false
          ),
          finishVisionLibrary: self.all(
            filter: finish_vision_library_filter,
            sort: sort,
            paginate: false,
          )
        }
      }
    end

    def form_object
      self.fields.slice(
        "Name", "Type", "Unit Price", "URL", "Info"
      ).transform_keys { |k| k.underscore.gsub(" ", "_") }
    end

    def is_library?
      return self["User"].include?(Finishes::Option::FINISH_VISION_VR_TEAM_USER_ID)
    end
  end
end

class FinishOptions < Airrecord::Table
  self.base_key = FINISHES_AIRTABLE_APP_ID
  self.table_name = "Finish Options"

  def self.search_for_component(s)
    # Implement search later
    FinishOptions.all view: "Has Model"
  end

  def form_object
    self.fields.slice(
      "Name", "Type", "Unit Price", "URL", "Info"
    ).transform_keys { |k| k.underscore.gsub(" ", "_") }
  end
end

class ProjectFinishSelections < Airrecord::Table
  self.base_key = FINISHES_AIRTABLE_APP_ID

  has_many :finish_options, class: "FinishOptions", column: "Options"

  def self.find_project_selection(project, selection_id)
    return {} if project.nil? or selection_id.nil?

    self.table_name = project["Finish Selections Table Name"]
    self.table_name = project if project.is_a?(String)

    self.find(selection_id)
  end

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

class User < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Users"

  has_many :projects, class: "Project", column: "Projects"
end

class Project < Airrecord::Table
  self.base_key = RENDERING_AIRTABLE_APP_ID
  self.table_name = "Projects"

  belongs_to :users, class: "User", column: "Users"
  has_many :selections, class: "Finishes::Selection", column: "Selections"

  def options
    selections = self.selections
    option_ids = selections.map { |s| s["Options"] }.flatten
    puts option_ids.inspect
    return Finishes::Option.find_many(option_ids)
  end

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

  def belongs_to_user?(user)
    return false if user.nil?
    if user.is_a? String
      return self["Users"].include? user
    else
      return self["Users"].include? user.id
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

