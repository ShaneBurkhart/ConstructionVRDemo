require "csv"
require "./models/models.rb"

file = ARGV[0]
exit if file.nil?

append_all = ARGV[1] == "1"
update_by_model = false

if !append_all
  # It makes no sense to update if we append all.
  update_by_model = ARGV[2] == "1"
end

CSV.foreach(file, headers: true) do |row|
  model_num = row['Model #']
  if model_num.nil?
    puts "No model number found for row: #{row.inspect}"
    next
  end

  data = { "Model #": model_num }

  data["Info"] = row["Info"] unless row["Info"].nil?
  data["URL"] = row["URL"] unless row["URL"].nil?
  data["Unit Price"] = row["Unit Price"].to_f.round(2) unless row["Unit Price"].nil?

  if append_all
    Finishes::Option.create(data)
  else
    current = Finishes::Option.all(filter: "{Model #} = '#{model_num}'").first

    if current.nil?
      Finishes::Option.create(data)
    else
      data.each { |k, v| current[k.to_s] = v }
      current.save
    end
  end

  sleep(1)
end
