require 'uri'
require 'net/http'
require 'openssl'
require 'json'

def send_slack_message_to_rendering_channel(payload)
  url = URI(ENV['SLACK_RENDERING_CHANNEL_WEBHOOK'])

  http = Net::HTTP.new(url.host, url.port)
  http.use_ssl = true
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE

  request = Net::HTTP::Post.new(url)
  request["Content-Type"] = "application/json"

  if payload.is_a? Hash
    request.body = payload.to_json
  elsif payload.is_a? String
    request.body = { "text": payload }.to_json
  else
    return nil
  end

  response = http.request(request)
  return response
end
