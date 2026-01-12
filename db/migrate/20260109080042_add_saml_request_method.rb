class AddSamlRequestMethod < ActiveRecord::Migration[8.0]
  def change
    add_column :saml_settings, :saml_request_method, :integer, default: 0, null: false
  end
end
