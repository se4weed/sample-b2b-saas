class CreateUserProfiles < ActiveRecord::Migration[8.0]
  def change
    create_table :user_profiles, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false

      t.timestamps
    end

    add_index :user_profiles, :name, unique: true
  end
end
