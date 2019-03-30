require 'open-uri'

require "./models/models.rb"

def parse_model_data(raw_model_data)
  model_data = { scenes: [], layers: {} }
  lines = raw_model_data.split("\n")
  current_scene = nil

  lines.each do |line|
    next unless line.strip.length
    next if line.include? "Model Layers:"
    next if line.include? "Scene Layers:"

    if line.start_with? "Scene:"
      parts = line.split(/:\s+/)
      if parts.length > 1
        current_scene = { name: parts[1], layers: {} }
        model_data[:scenes] << current_scene
      end
      next
    end

    parts = line.split(/:\s+/)
    name = parts[0]
    next if name.nil? or !name.length
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

def check_unit_version_model(unit_version)
  # Check for all panoramas as scenes.  Including entry, and floor plan.
  panos = unit_version.unit.panos
  model_data = parse_model_data(unit_version["Model Data Output"])
  errors = []

  panos.each do |pano|
    name = pano["Name"]
    scene = model_data[:scenes].find { |scene| scene[:name] == name }
    errors << "Missing scene with name matching '#{name}'. Make sure the name matches exactly :)" if scene.nil?
  end

  return errors
end

loop do
  unit_versions = UnitVersion.all(view: "To Test")

  unit_versions.each do |unit_version|
    errors = check_unit_version_model(unit_version)
    puts errors.inspect

    unit_version["Errors"] = errors.join("\n") if errors.length
    unit_version["Tested At"] = Time.now
    unit_version.save
  end

  sleep 60
end
