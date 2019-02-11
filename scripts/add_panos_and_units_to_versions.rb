require "./models/models.rb"

(Unit.all || []).each do |unit|
  # No image, no version
  next if unit["Floor Plan Image URL"].nil?
  # If current version for unit, don't add
  next if (unit["Current Version"] || []).first.nil?

  unit_version = UnitVersion.new({
    "Floor Plan Image URL": unit["Floor Plan Image URL"],
    "Unit": [unit.id]
  })
  unit_version.save

  unit["Current Version"] = [unit_version.id]
  unit.save

  unit.panos.each do |pano|
    pano_version = PanoVersion.new({
      "Image URL": pano["Image URL"],
      "Unit Version": [unit_version.id],
      "Pano": [pano.id]
    })
    pano_version.save
  end
end
