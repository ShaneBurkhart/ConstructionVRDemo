require "./models/models.rb"
require "./models/old_models.rb"

PROJECTS = [
  #"The Jefferson",
  "Olivette",
  #"430 Walnut",
  #"226 Lockwood",
  #"Warrenville",
  #"Chroma II",
  #"Olivette",
  #"Pine Lawn Dental",
  #"S1 - Coastal Gray",
  #"S2 - Classy Timeless",
  #"S3 - Taupe & Black",
  #"S4 - Black & White & Gold",
  #"S5 - Modern Farmhouse",
  #"S6 - Glam",
]

PROJECTS.each do |p|
  project = Finishes::Project.create({ "Name": p })

  puts p
  categories = ProjectFinishSelections.finishes_for_project(p)

  i = 0
  categories.each do |category, selections|
    c = Finishes::Category.create({
      "Name": category,
      "Project": [project.id],
      "Order": i,
    })

    j = 0
    selections.each do |s|
      new_selection = Finishes::Selection.create({
        "Category": [ c.id ],
        "Location": s["Location"],
        "Type": s["Type"],
        "Room": s["Room"],
        "Notes": s["Notes"],
        "Order": j,
      })

      if !s["Options"].nil?
        options = []
        k = 0
        s.finish_options.each do |fo|
          data = {
            "Name": fo["Name"],
            "Type": fo["Type"],
            "URL": fo["URL"],
            "Info": fo["Info"],
            "Selections": [ new_selection.id ],
            "Unit Price": fo["Unit Price"],
            "SketchUp Model URL": fo["SketchUp Model URL"],
            "Old Record ID": fo.id,
            "Order": k,
          }

          data["Image"] = fo["Image"].map{ |i| { "url": i["url"] } } unless fo["Image"].nil?

          option = Finishes::Option.create(data)
          options << option.id

          k += 1
        end
      end

      j += 1

      sleep(1)
    end

    i += 1
  end

end
