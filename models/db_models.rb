require "active_record"

db_file = File.join(File.expand_path('..', __FILE__), '..', 'db', 'config.yml')
db_config = YAML.load(File.read(db_file))
ActiveRecord::Base.establish_connection(db_config["development"]).inspect

module DBModels
  class LinkHotspot < ActiveRecord::Base
  end
end
