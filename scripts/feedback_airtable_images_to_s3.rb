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

FEEDBACK_IMAGES_KEY_PREFIX = "feedback_perspectives"

# To Convert
# Screenshot => Screenshot URL

[Feedback].each do |unit_class|
  image_key = "Screenshot"

  (unit_class.all || []).each do |u|
    next if u[image_key].nil? or !u[image_key].length

    f_name = "#{u.id}.png"
    IO.copy_stream(open(u[image_key][0]["url"]), f_name)

    key = "#{FEEDBACK_IMAGES_KEY_PREFIX}/#{SecureRandom.uuid}.png"
    obj = s3.bucket(BUCKET).object(key)
    obj.upload_file(f_name, { acl: 'public-read' })

    File.delete(f_name)

    u["#{image_key} URL"] = "#{S3_URL}/#{BUCKET}/#{key}"
    u.save
  end
end
