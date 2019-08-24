require "./models/models.rb"

old_to_new = {}

FinishOptions.all.each do |fo|
  data = {
    "Name": fo["Name"],
    "Type": fo["Type"],
    "URL": fo["URL"],
    "Info": fo["Info"],
    "Selections": fo["Selections"],
    "Unit Price": fo["Unit Price"],
    "SketchUp Model URL": fo["SketchUp Model URL"],
  }

  data["Image"] = fo["Image"].map{ |i| { "url": i["url"] } } unless fo["Image"].nil?

  option = Finishes::Option.create(data)
  old_to_new[fo.id] = option.id

  sleep(1)
end

Project.all.each do |project|
  name = project["Finish Selections Table Name"]
  next if name.nil? or name == ""

  ProjectFinishSelections.table_name = name
  ProjectFinishSelections.all.each do |selection|
    next if selection["Location"].nil?

    data = selection.fields.slice("Room", "Type", "Location", "Notes", "Category")
    data["Options"] = selection.finish_options.map { |o| old_to_new[o.id] }
    data["Project"] = [project.id]
    Finishes::Selection.create(data)

    sleep(1)
  end
end
