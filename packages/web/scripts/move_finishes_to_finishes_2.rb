require "./models/models.rb"
require "./models/old_models.rb"

i = 0

FinishOptions.all.each do |fo|
  i += 1
  puts i

  data = {
    "Name": fo["Name"],
    "Type": fo["Type"],
    "URL": fo["URL"],
    "Info": fo["Info"],
    "Selections": fo["Selections"],
    "Unit Price": fo["Unit Price"],
    "SketchUp Model URL": fo["SketchUp Model URL"],
    "Old Record ID": fo.id,
  }

  data["Image"] = fo["Image"].map{ |i| { "url": i["url"] } } unless fo["Image"].nil?

  Finishes::Option.create(data)

  sleep(1)
end
