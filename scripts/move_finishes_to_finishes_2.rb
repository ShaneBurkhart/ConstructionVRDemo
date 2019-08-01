require "./models/models.rb"

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

  Finishes::Option.create(data)

  sleep(1)
end
