class CreateSamlSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :saml_settings, id: :uuid do |t|
      t.references :tenant, null: false, foreign_key: true, type: :uuid
      t.string :entity_id
      t.string :sso_url
      t.text :idp_x509_certificate

      t.timestamps
    end

    add_column :users, :name_id, :string, null: true
    add_index :users, [:name_id, :tenant_id], unique: true

    add_column :tenants, :code, :string, null: false, default: ""
    add_index :tenants, :code, unique: true

    add_column :sessions, :auth_type, :integer, null: false, default: 0
  end
end
