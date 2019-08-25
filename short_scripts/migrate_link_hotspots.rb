require "./models/models.rb"
require "./models/db_models.rb"

UnitVersion.all.each do |uv|
  pano_versions_h = {}
  pano_versions = uv.pano_versions
  pano_versions.each { |pv| pano_versions_h[pv["Pano ID"][0]] = pv }
  puts uv["Unit Name"][0]

  pano_versions.each do |pv|
    pano = pv.pano
    puts pv["Pano Name"][0]

    pano.link_hotspots.each do |l|
      pano_from = l["Pano"][0]
      from_pv = pano_versions_h[pano_from]
      pano_to = l["Destination Pano"][0]
      to_pv = pano_versions_h[pano_to]
      next if from_pv.nil? or to_pv.nil?

      pano_version_id = from_pv.id
      dest_pano_version_id = to_pv.id
      yaw = l["Yaw"]
      pitch = l["Pitch"]

      hotspot = DBModels::LinkHotspot.where(
        pano_version_id: pano_version_id,
        destination_pano_version_id: dest_pano_version_id
      ).first

      if hotspot.nil?
        hotspot = DBModels::LinkHotspot.new(
          pano_version_id: pano_version_id,
          destination_pano_version_id: dest_pano_version_id,
          yaw: yaw,
          pitch: pitch
        )
      else
        hotspot.yaw = yaw
        hotspot.pitch = pitch
      end

      hotspot.save
    end
  end
end
