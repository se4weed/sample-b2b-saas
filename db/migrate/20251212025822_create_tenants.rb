class CreateTenants < ActiveRecord::Migration[8.0]
  def change
    create_table :tenants, id: :uuid do |t|
      t.string :name, null: false
      t.timestamps
      t.index :name, unique: true
    end

    add_column :users, :tenant_id, :uuid, null: false
    add_index :users, :tenant_id
  end
end
