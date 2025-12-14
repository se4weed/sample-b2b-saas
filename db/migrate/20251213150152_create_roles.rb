class CreateRoles < ActiveRecord::Migration[8.0]
  def change
    create_table :roles, id: :uuid do |t|
      t.references :tenant, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.integer :permission_type, null: false, default: 0

      t.timestamps
    end

    add_reference :users, :role, type: :uuid, foreign_key: true, null: false
    add_index :roles, [:tenant_id, :name], unique: true
  end
end
