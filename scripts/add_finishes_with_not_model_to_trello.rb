require 'trello'

require "./models/models.rb"

TRELLO_DEVELOPER_PUBLIC_KEY = ENV["TRELLO_APP_KEY"]
TRELLO_MEMBER_TOKEN = ENV["TRELLO_MEMBER_TOKEN"]
# Rendering TODO list ID
LIST_ID = "5cd9d785e9381b87a00a222c"

Trello.configure do |config|
  config.developer_public_key = TRELLO_DEVELOPER_PUBLIC_KEY
  config.member_token = TRELLO_MEMBER_TOKEN
end

FinishOptions.all(view: "Needs Model").each do |o|
  card = Trello::Card.create({
    name: o["Name"],
    list_id: LIST_ID,
    desc: "Record ID: #{o.id}\n\n#{o['Info']}"
  })

  next if o["Image"].nil?

  o["Image"].each do |i|
    card.add_attachment(i["url"])
  end

  card.update_fields(cover_image_id: "")
end

