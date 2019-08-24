require "csv"
require 'open-uri'
require 'aws-sdk'
require 'aws-sdk-s3'

require "./models/models.rb"

S3_URL = "https://s3-us-west-2.amazonaws.com"
REGION = ENV["REGION"]
BUCKET = ENV["BUCKET"]
TMP_KEY_PREFIX = "tmp"

Aws.config.update({
  region: REGION,
  credentials: Aws::Credentials.new(ENV["ACCESS_KEY_ID"], ENV["SECRET_ACCESS_KEY"])
})
s3 = Aws::S3::Resource.new(region: REGION)

def pretty_number(num)
  return "000" + num if num.length == 1
  return "00" + num if num.length == 2
  return "0" + num if num.length == 3
  return num
end

CSV.foreach("scripts/input/SW Paint to RGB - Colors.csv") do |row|
  pretty_name = "SW#{pretty_number(row[0])}"
  key = "#{TMP_KEY_PREFIX}/#{pretty_name}.png"
  obj = s3.bucket(BUCKET).object(key)
  obj.upload_file("scripts/output/#{pretty_name}.png")
  obj.acl.put({acl: "public-read"})

  data = {
    "Name": "#{pretty_name} - #{row[1]} - Sherwin-Williams Paint",
    "Type": "Paint Color",
    "Image": [{ "url": "#{S3_URL}/#{BUCKET}/#{key}" }],
  }

  Finishes::Option.create(data)
end

