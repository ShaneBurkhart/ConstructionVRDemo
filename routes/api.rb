require 'sinatra/base'

require './routes/includes.rb'

module Routes
  class API < Sinatra::Base
    set :views, Proc.new { "/app/views" }

    include Includes::CurrentUser

    register do
      def auth (type)
        condition do
          redirect "/sign_in" if current_user.nil?
        end
      end
    end

    get '/api/project/:access_token/finishes', :auth => :user  do
      is_admin_mode = !!session[:is_admin]
      access_token = params[:access_token]
      project = find_project_by_access_token(access_token)
      return "Not found" if project.nil?

      @categories = project.categories
      @selections = project.selections
      @options = project.options

      content_type "application/json"
      {
        admin_mode: is_admin_mode,
        categories: @categories,
        selections: @selections,
        options: @options,
      }.to_json
    end

    post '/api/project/:access_token/finishes/save', :auth => :user do
      is_admin_mode = !!session[:is_admin]
      access_token = params[:access_token]
      project = find_project_by_access_token(access_token)
      return "Not found" if project.nil?
      body = JSON.parse(request.body.read)

      updated_categories = []
      updated_selections = []
      updated_options = []

      categories = body["categories"] || []
      selections = body["selections"] || []
      options = body["options"] || []

      # All keys should be unique. Keep track of temp ids to new objects
      new_models = {}

      @options = project.options.index_by { |o| o.id }
      options.each do |option|
        if option["id"].starts_with?("new")
          option_fields = option["fields"].select{ |k,v|
            ["Name", "Selections", "Type", "Other Type Value", "Image", "Info",
                 "URL", "Unit Price", "Order"].include?(k)
          }
          option_fields["Image"] = (option_fields["Image"] || []).map{ |i| { url: i["url"] }}

          new_option = Finishes::Option.create(option_fields)
          new_models[option["id"]] = new_option
          updated_options << new_option
        else
          old_option = @options[option["id"]]

          # Only update if is different than old
          old_option.update(option["fields"])
          old_option.save
          updated_options << old_option
        end
      end

      @selections = project.selections.index_by { |s| s.id }
      selections.each do |selection|
        if selection["id"].starts_with?("new")
          selection_fields = selection["fields"].select{ |k,v|
            ["Type", "Category", "Location", "Room", "Notes", "Order"].include?(k)
          }

          new_selection = Finishes::Selection.create(selection_fields)
          new_models[selection["id"]] = new_selection
          updated_selections << new_selection
        else
          old_selection = @selections[selection["id"]]

          # If the option ID is new, replace with option ID we just saved
          selection["fields"]["Options"] = (selection["fields"]["Options"] || []).map { |o|
            o.starts_with?("new") ? new_models[o].id : o
          }

          # Only update if is different than old
          old_selection.update(selection["fields"])
          old_selection.save
          updated_selections << old_selection
        end
      end

      @categories = project.categories.index_by { |c| c.id }
      categories.each do |category|
        if !category["DELETE"].nil?
          old_category = @categories[category["id"]]
          old_category.destroy if !old_category.nil?
          next
        elsif category["id"].starts_with?("new")
          category_fields = category["fields"].select{ |k,v|
            ["Name", "Order"].include?(k)
          }
          category_fields["Project"] = [project.id]

          new_category = Finishes::Category.create(category_fields)
          new_models[category["id"]] = new_category
          updated_categories << new_category
        else
          old_category = @categories[category["id"]]

          # If the option ID is new, replace with option ID we just saved
          category["fields"]["Selections"] = (category["fields"]["Selections"] || []).map { |s|
            s.starts_with?("new") ? new_models[s].id : s
          }

          # Only update if is different than old
          old_category.update(category["fields"])
          old_category.save
          updated_categories << old_category
        end
      end

      content_type "application/json"
      {
        categories: updated_categories,
        selections: updated_selections,
        options: updated_options,
      }.to_json
    end

    post '/api/temp_upload/presign', :auth => :user do
      is_admin_mode = !!session[:is_admin]
      return "Not found" if !is_admin_mode

      key = "tmp/#{SecureRandom.uuid}_#{params['filename']}"
      signer = Aws::S3::Presigner.new
      url = signer.presigned_url(:put_object, {
        bucket: ENV["BUCKET"],
        key: key,
        content_type: params["mime"],
        acl: "public-read"
      })

      content_type "application/json"
      {
        presignedURL: url,
        awsURL: "https://finish-vision-vr.s3-us-west-2.amazonaws.com/#{key}"
      }.to_json
    end

    get '/api/finishes/options/search', :auth => :user do
      is_admin_mode = !!session[:is_admin]
      return "Not found" if !is_admin_mode

      @options = Finishes::Option.search(params["q"] || "")

      content_type "application/json"
      {
        admin_mode: is_admin_mode,
        options: @options,
      }.to_json
    end

    post '/project/:access_token/screenshot/feedback', :auth => :user do
      is_admin = !!session[:is_admin]
      return "Not found" unless is_admin

      access_token = params[:access_token]
      project = find_project_by_access_token(access_token)
      return "Not found" if project.nil?

      unit_version_id = params["unitVersionId"]
      image_url = params["imageURL"]
      notes = params["notes"]

      unit_version = UnitVersion.find(unit_version_id)
      return "Not found" if unit_version.nil? or !unit_version.unit.belongs_to_project?(project)
      return "Not found" if unit_version["Pano Versions"].nil? or unit_version["Pano Versions"].length < 1

      feedback = Feedback.new(
        "Pano Version" => [unit_version["Pano Versions"].first],
        "Notes" => notes,
        "Is Fix" => true,
        "Screenshot" => [{ url: image_url }],
      )

      feedback.create

      fields = feedback.fields
      fields["Notes HTML"] = feedback.notes_html

      # Send notification to slack
      send_slack_message_to_rendering_channel(create_feedback_notification_message(feedback))

      content_type :json
      return fields.to_json
    end

    post '/project/:access_token/pano/:id/feedback', :auth => :user do
      is_admin = !!session[:is_admin]
      return "Not found" unless is_admin

      access_token = params[:access_token]
      project = find_project_by_access_token(access_token)
      return "Not found" if project.nil?

      pano = Pano.find(params[:id])
      return "Not found" if pano.nil? or !pano.unit.belongs_to_project?(project)
      unit = pano.unit

      unit_version_id = params["unitVersionId"] || unit["Current Version"][0]

      pano_version = PanoVersion.all(filter: "AND({Pano ID} = '#{pano.id}', {Unit Version ID} = '#{unit_version_id}')").first
      return "Not found" if pano_version.nil?

      is_fix = params["isFix"] == "true"
      screenshot = params[:screenshot]

      feedback = Feedback.new(
        "Pano Version" => [pano_version.id],
        "Notes" => params["notes"],
        "View Parameters" => params["viewParameters"],
        "Is Fix" => is_fix == true ? true : nil
      )

      if !screenshot.nil?
        feedback["Screenshot"] = [{ url: screenshot[:url], filename: screenshot[:filename] }]
      end

      feedback.create

      fields = feedback.fields
      fields["Notes HTML"] = feedback.notes_html

      content_type :json
      return fields.to_json
    end

    post '/project/:access_token/feedback_feed/:id/update', :auth => :user do
      access_token = params[:access_token]
      is_debug_mode = !!params[:debug] || !!session[:is_admin]
      is_admin_mode = !!session[:is_admin]

      project = find_project_by_access_token(access_token)
      return "Not found" if project.nil?

      feedback = Feedback.find(params[:id])
      return "Not found" if feedback.nil?

      if !params[:checked].nil?
        is_checked = params[:checked] == "checked"
        feedback["Fixed At"] = is_checked == true ? Time.now : nil
      end

      feedback["Notes"] = params[:notes] unless params[:notes].nil?

      feedback.save

      fields = feedback.fields
      fields["Notes HTML"] = feedback.notes_html

      content_type :json
      return fields.to_json
    end

  end
end
