#!/usr/bin/env ruby

require "json"
require "aws-sdk"

AWS_ACCESS_KEY_ID = ENV["ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY = ENV["SECRET_ACCESS_KEY"]
AWS_REGION = ENV["REGION"]
AWS_BUCKET = ENV["BUCKET"]
LAMBDA_FUNCTION_NAME = "FinishVisionImageResizer"
S3_KEY_PREFIXES = ["screenshots/", "floor-plans/", "panos/"]

Aws.config.update({
  region: AWS_REGION,
  credentials: Aws::Credentials.new(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
})

def rerun_prefix(prefix)
  after_date = Date.parse('19-5-2020').to_time

  s3 = Aws::S3::Client.new
  lambda_client  = Aws::Lambda::Client.new

  # The next page of results
  marker = nil
  iteration = 1

  loop do
    puts "Iteration: #{iteration}"
    s3_resp = s3.list_objects_v2({
      bucket: AWS_BUCKET,
      prefix: prefix,
      continuation_token: marker
    }).to_h
    photos = s3_resp[:contents].select{ |k| k[:last_modified] >= after_date }.collect { |k| k[:key] }

    photos.each_with_index do |key, index|
      lambda_resp = lambda_client.invoke({
        function_name: LAMBDA_FUNCTION_NAME,
        invocation_type: "Event", # accepts Event, RequestResponse, DryRun
        log_type: "Tail", # accepts None, Tail
        client_context: "String",
        payload: { Records: [
          { s3: {
            bucket: { name: AWS_BUCKET },
            object: { key: key },
          } }
        ] }.to_json
      })

      puts "[I:#{iteration} #{index+1}/#{photos.count}] #{key}"
    end

    iteration += 1
    # Use next marker or last key for next marker
    marker = s3_resp[:next_continuation_token] || photos.last

    break if !s3_resp[:is_truncated]
  end
end

S3_KEY_PREFIXES.each do |prefix|
  rerun_prefix(prefix)
end

