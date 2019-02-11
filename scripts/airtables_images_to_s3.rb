require 'open-uri'
require 'aws-sdk'
require 'aws-sdk-s3'

require "./models/models.rb"

S3_URL = "https://s3-us-west-2.amazonaws.com"
REGION = ENV["REGION"]
BUCKET = ENV["BUCKET"]

Aws.config.update({
  region: REGION,
  credentials: Aws::Credentials.new(ENV["ACCESS_KEY_ID"], ENV["SECRET_ACCESS_KEY"])
})
s3 = Aws::S3::Resource.new(region: REGION)

FLOOR_PLAN_IMAGES_KEY_PREFIX = "floor-plans"
PANO_IMAGES_KEY_PREFIX = "panos"

# To Convert
# Unit - Floor Plan Image -> Floor Plan Image URL
# UnitVersion - Floor Plan Image -> Floor Plan Image URL
# Pano - Image -> Image URL
# PanoVersion - Image -> Image URL

[Unit, UnitVersion, Pano, PanoVersion].each do |unit_class|
  puts unit_class.name
  image_key = "Image" if unit_class.name.include? "Pano"
  image_key = "Floor Plan Image" if unit_class.name.include? "Unit"

  (unit_class.all || []).each do |u|
    next if u[image_key].nil? or !u[image_key].length

    f_name = "#{u.id}.png"
    IO.copy_stream(open(u[image_key][0]["url"]), f_name)

    key = "#{FLOOR_PLAN_IMAGES_KEY_PREFIX}/#{SecureRandom.uuid}.png"
    obj = s3.bucket(BUCKET).object(key)
    obj.upload_file(f_name, { acl: 'public-read' })

    File.delete(f_name)

    u["#{image_key} URL"] = "#{S3_URL}/#{BUCKET}/#{key}"
    u.save
  end
end
