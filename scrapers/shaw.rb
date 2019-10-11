require "nokogiri"
require "open-uri"

require "./models/models.rb"

ROOT_URL = "https://www.armstrongflooring.com"
PRODUCTS_URLS = {
  "Carpet": "https://shawfloors.com/api/odata/Carpets?$top=81&$skip=0&$select=UniqueId,SellingStyleNbr,SellingColorNbr,SellingStyleName,SellingColorName,StaticRoomFlag,Vignette,ColorCount,MSRPRange,HasSwatchImage,SampleCount,CutARug,Backing&$orderby=StyleSequence,UniqueId&$filter=(IsBaselineData%20eq%20false)%20and%20(IsDropped%20eq%20false)%20and%20(ColorCount%20gt%200)%20and%20(ProductGroupPermanentName%20eq%20%27shawfloors%27)%20and%20(HasMainImage%20eq%20true)%20and%20(IsDuplicate%20eq%20false)%20and%20(ProductGroupShowOnBrowseCat%20eq%20true)%20and%20(HasMainImage%20eq%20true)%20and%20(StaticRoomFlag%20eq%20true%20or%20HasRenderImage%20eq%20true)%20and%20(IsDefaultStyleColor%20eq%20true)&$count=true",
  "Hardwood": "https://shawfloors.com/api/odata/Hardwoods?$top=81&$skip=0&$select=UniqueId,SellingStyleNbr,SellingColorNbr,SellingStyleName,SellingColorName,StaticRoomFlag,Vignette,ColorCount,MSRPRange,HasSwatchImage,SampleCount,IsMadeInUsa,CollectionDesc&$orderby=StyleSequence,UniqueId&$filter=(IsBaselineData%20eq%20false)%20and%20(IsDropped%20eq%20false)%20and%20(ColorCount%20gt%200)%20and%20(ProductGroupPermanentName%20eq%20%27shawfloors%27)%20and%20(HasMainImage%20eq%20true)%20and%20(ProductGroupShowOnBrowseCat%20eq%20true)%20and%20(HasMainImage%20eq%20true)%20and%20(StaticRoomFlag%20eq%20true%20or%20HasRenderImage%20eq%20true)%20and%20(IsDefaultStyleColor%20eq%20true)&$count=true",
  "Laminate": "https://shawfloors.com/api/odata/Laminates?$top=81&$skip=0&$select=UniqueId,SellingStyleNbr,SellingColorNbr,SellingStyleName,SellingColorName,StaticRoomFlag,Vignette,ColorCount,MSRPRange,HasSwatchImage,SampleCount,IsMadeInUsa,CollectionDesc&$orderby=StyleSequence,UniqueId&$filter=(IsBaselineData%20eq%20false)%20and%20(IsDropped%20eq%20false)%20and%20(ColorCount%20gt%200)%20and%20(ProductGroupPermanentName%20eq%20%27shawfloors%27)%20and%20(HasMainImage%20eq%20true)%20and%20(ProductGroupShowOnBrowseCat%20eq%20true)%20and%20(HasMainImage%20eq%20true)%20and%20(StaticRoomFlag%20eq%20true%20or%20HasRenderImage%20eq%20true)%20and%20(IsDefaultStyleColor%20eq%20true)&$count=true",
  "Vinyl": "https://shawfloors.com/api/odata/Resilient?$top=81&$skip=0&$select=UniqueId,SellingStyleNbr,SellingColorNbr,SellingStyleName,SellingColorName,StaticRoomFlag,Vignette,ColorCount,MSRPRange,HasSwatchImage,SampleCount,IsMadeInUsa,CollectionDesc&$orderby=StyleSequence,UniqueId&$filter=(IsBaselineData%20eq%20false)%20and%20(IsDropped%20eq%20false)%20and%20(ColorCount%20gt%200)%20and%20(ProductGroupPermanentName%20eq%20%27shawfloors%27)%20and%20(HasMainImage%20eq%20true)%20and%20(ProductGroupShowOnBrowseCat%20eq%20true)%20and%20(HasMainImage%20eq%20true)%20and%20(StaticRoomFlag%20eq%20true%20or%20HasRenderImage%20eq%20true)%20and%20(IsDefaultStyleColor%20eq%20true)&$count=true",
  "Tile & Stone": "https://shawfloors.com/api/odata/Ceramics?$top=81&$skip=0&$select=UniqueId,SellingStyleNbr,SellingColorNbr,SellingStyleName,SellingColorName,StaticRoomFlag,Vignette,ColorCount,MSRPRange,HasSwatchImage,SampleCount,MadeInUSA&$orderby=StyleSequence,UniqueId&$filter=(IsBaselineData%20eq%20false)%20and%20(IsDropped%20eq%20false)%20and%20(ColorCount%20gt%200)%20and%20(ProductGroupPermanentName%20eq%20%27shawfloors%27)%20and%20(HasMainImage%20eq%20true)%20and%20(ProductGroupShowOnBrowseCat%20eq%20true)%20and%20(HasMainImage%20eq%20true)%20and%20(StaticRoomFlag%20eq%201%20or%20HasRenderImage%20eq%20true)%20and%20(SellingColorNbr%20eq%20DefaultSsColorNumber)&$count=true",
  "Floorigami": "https://shawfloors.com/api/odata/CarpetTiles?$top=81&$skip=0&$select=UniqueId,SellingStyleNbr,SellingColorNbr,SellingStyleName,SellingColorName,StaticRoomFlag,Vignette,ColorCount,MSRPRange,HasSwatchImage,SampleCount,CutARug,Backing&$orderby=StyleSequence,UniqueId&$filter=(IsBaselineData%20eq%20false)%20and%20(IsDropped%20eq%20false)%20and%20(ColorCount%20gt%200)%20and%20(ProductGroupPermanentName%20eq%20%27shawfloors%27)%20and%20(HasMainImage%20eq%20true)%20and%20(IsDuplicate%20eq%20false)%20and%20(ProductGroupShowOnBrowseCat%20eq%20true)%20and%20(HasMainImage%20eq%20true)%20and%20(StaticRoomFlag%20eq%20true%20or%20HasRenderImage%20eq%20true)%20and%20(IsDefaultStyleColor%20eq%20true)&$count=true",
}

MANUFACTURER = "Shaw"
TYPE = "Flooring"

count = 0

PRODUCTS_URLS.each do |k, v|
  products_json = JSON.parse(open(v).read)
  product_lines = products_json["value"]
  product_lines.each do |i|
    style = i["SellingStyleName"].downcase.gsub(" ", "-")
    style_num = i["SellingStyleNbr"].downcase.gsub(" ", "-")
    color = i["SellingColorName"].downcase.gsub(" ", "-")
    subtype = k.to_s.downcase.gsub("&", "and").gsub(" ", "-")

    product_line_url = "https://shawfloors.com/flooring/#{subtype}/details/#{style}-#{style_num}/#{color}"

    product_line_doc = Nokogiri::HTML(open(product_line_url))
    product_line_doc.css(".swatch-color").each do |link|
      product_url = link["href"]
      puts product_url

      product_doc = Nokogiri::HTML(URI(URI.encode(product_url)).read)
      product_infos = product_doc.css(".specs-content-row")

      collection_name = product_infos[0].css("span").first.text.strip
      product_line_name = product_infos[1].css("span").first.text.strip
      product_line_name_parts = product_line_name.split(" ")
      color = product_infos[2].css("span").first.text.strip
      color_parts = color.split(" ")
      size = product_infos[3].css("span").first.text.strip
      model_num = "Style:#{product_line_name_parts[0]} Color:#{color_parts[0]}"
      product_name = "#{color} - #{product_line_name}"

      puts collection_name
      puts product_line_name
      puts color

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
        ].join("\n"),
        "User": [Finishes::Option::FINISH_VISION_VR_TEAM_USER_ID]
      })

      sleep 0.5

      count = count + 1
    end
  end
end

puts "Added #{count} finishes from #{MANUFACTURER}."
