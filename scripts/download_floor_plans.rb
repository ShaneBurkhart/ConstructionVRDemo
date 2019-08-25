require 'open-uri'

require "./models/models.rb"

if !ARGV.length
  puts "No arguments given.  Please specify the ID for the project to download the floor plans."
  return
end

OUTPUT_DIR = "scripts/output"

project = Project.find(ARGV[0])

pname = project["Name"] + "_floor_plans"
path = File.join(OUTPUT_DIR, pname)
if Dir.exist? path
  puts "A folder for this project's floor plans already exists."
  return
end
Dir.mkdir(path)

project.units.each do |u|
  uv = u.current_version
  upath = File.join(path, u["Name"] + ".png")
  IO.copy_stream(open(uv[0]["Floor Plan Image URL"]), upath)
  sleep(4)
end

