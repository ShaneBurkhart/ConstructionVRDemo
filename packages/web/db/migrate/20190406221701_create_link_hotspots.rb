class CreateLinkHotspots < ActiveRecord::Migration[5.2]
  def change
    create_table :link_hotspots do |t|
      t.string :pano_version_id
      t.string :destination_pano_version_id
      t.string :yaw
      t.string :pitch
    end
  end
end
