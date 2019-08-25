require "./models/models.rb"

PROJECTS = [
  "430 Walnut",
  "5539 Pershing",
  "226 Lockwood",
  "Warrenville",
  "Chroma II",
  "Pine Lawn Dental",
  "S1 - Coastal Gray",
  "S2 - Classy Timeless",
  "S3 - Taupe & Black",
  "S4 - Black & White & Gold",
  "S5 - Modern Farmhouse",
  "S6 - Glam",
]

PROJECTS.each do |p|
  project = Finishes::Project.create({ "Name": p })

  puts p
  selections = ProjectFinishSelections.finishes_for_project(p)

  selections.values.flatten.each do |s|
    puts s.inspect
    data = {
      "Project": [ project.id ],
      "Location": s["Location"],
      "Type": s["Type"],
      "Room": s["Room"],
      "Notes": s["Notes"],
    }

    if !s["Options"].nil?
      data["Options"] = s.finish_options.map do |fo|
        filter = "'#{fo['Name'].gsub("'", "\\'")}' = {Name}"
        puts filter
        option = Finishes::Option.all(filter: filter).first
        option.id
      end
    end

    puts data.inspect

    Finishes::Selection.create(data)

    sleep(1)
  end
end
