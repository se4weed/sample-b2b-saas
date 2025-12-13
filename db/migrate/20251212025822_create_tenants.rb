class CreateTenants < ActiveRecord::Migration[8.0]
  def change
    create_table :tenants, id: :uuid do |t|
      t.string :name, null: false
      t.timestamps
      t.index :name, unique: true
    end

    add_reference :users, :tenant, type: :uuid, foreign_key: true, null: false
  end
end
