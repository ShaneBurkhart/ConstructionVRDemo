require "./models/models.rb"
require "./models/old_models.rb"

PROJECTS = [
  "430 Walnut",
  "226 Lockwood",
  "Warrenville",
  "Chroma II",
  "Olivette",
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
  categories = ProjectFinishSelections.finishes_for_project(p)

  i = 0
  categories.each do |category, selections|
    c = Finishes::Category.create({
      "Name": category,
      "Project": [project.id],
      "Order": i,
    })

    selections.each do |s|
      data = {
        "Category": [ c.id ],
        "Location": s["Location"],
        "Type": s["Type"],
        "Room": s["Room"],
        "Notes": s["Notes"],
      }

      if !s["Options"].nil?
        options = []
        s.finish_options.each do |fo|
          filter = "'#{fo.id}' = {Old Record ID}"
          option = Finishes::Option.all(filter: filter).first
          options << option.id if !option.nil?
        end

        data["Options"] = options
      end

      Finishes::Selection.create(data)

      sleep(1)
    end

    i += 1
  end

end
