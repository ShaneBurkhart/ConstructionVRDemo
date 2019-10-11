require "nokogiri"
require "open-uri"

require "./models/models.rb"

ROOT_URL = "https://www.armstrongflooring.com"
PRODUCTS_URL = "https://www.armstrongflooring.com/commercial/en-us/products.html"

MANUFACTURER = "Armstrong"
TYPE = "Flooring"

products_doc = Nokogiri::HTML(open(PRODUCTS_URL))
count = 0

products_doc.css(".card__info h3 a").each do |link|
  collection_name = link.children.last.text.strip
  collection_url = ROOT_URL + link['href']

  collection_doc = Nokogiri::HTML(open(collection_url))
  collection_doc.css(".card--collection h4 a").each do |link|
    product_line_name = link.content.strip
    product_line_url = ROOT_URL + link["href"]

    product_line_doc = Nokogiri::HTML(open(product_line_url))
    product_line_doc.css(".card__info").each do |c|
      link = c.children[1]
      product_name = link.text.strip
      product_url = ROOT_URL + link["href"]

      product_doc = Nokogiri::HTML(open(product_url))
      product_info_table = product_doc.css(".item-differentiators").first
      product_infos = product_info_table.css("tr td")

      model_num = product_infos[0].text.strip
      color = product_infos[2].text.strip
      size = product_infos[3].text.strip

      Finishes::Option.create({
        "Name": product_name,
        "Type": TYPE,
        "URL": product_url,
        "Manufacturer": MANUFACTURER,
        "Manufacturer Subtype": collection_name,
        "Manufacturer Product Line": product_line_name,
        "Manufacturer Model #": model_num,
        "Info": [
          "Color: #{color}",
          "Size: #{size.gsub(/\s{2,}/, "\n")}",
        ].join("\n"),
        "User": [Finishes::Option::FINISH_VISION_VR_TEAM_USER_ID]
      })

      sleep 0.5

      count = count + 1
    end
  end
end

puts "Added #{count} finishes from #{MANUFACTURER}."
