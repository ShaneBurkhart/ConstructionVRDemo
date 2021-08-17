require 'open-uri'

require "./models/models.rb"

unit_version_ids = [
  "recCQ3GMcVipQaCn1",
  "recygOQ4Hf7DeSAGN",
  "recxDNgBbtyXkSoms",
  "rec15vl6tHCom0vkC",
  "rec9lMn0MjqgYRnNz",
  "reczpPEKFM2AmVy1q",
  "recn2OIrC4mmTud3g",
  "recmZfZxGyemS9znq",
  "recpA42JSSsOM1yqq",
  "rec1BvWKJfvaHnszz",
  "reccHGh2XIMr0CO96",
]

unit_version_ids.each do |id|
  uvs = UnitVersion.find(id)

  uname = uvs["Unit Name"][0]
  next if Dir.exist? uname
  Dir.mkdir(uname)

  uvs.pano_versions.each do |pv|
    IO.copy_stream(open(pv["Image URL"]), "#{uname}/#{pv['Pano Name'][0]}.png")
    sleep(4)
  end
end

