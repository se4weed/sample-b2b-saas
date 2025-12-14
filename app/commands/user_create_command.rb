class UserCreateCommand
  include ActiveModel::Model

  attr_accessor :email_address, :password, :password_confirmation, :name, :role_id, :tenant_id

  def initialize(email_address:, password:, password_confirmation:, name:, role_id:, tenant_id:)
    @email_address = email_address
    @password = password
    @password_confirmation = password_confirmation
    @tenant_id = tenant_id
    @name = name
    @role_id = role_id
  end

  def call!
    ActiveRecord::Base.transaction do
      user = User.create!(tenant_id:, role_id:)
      user.build_credential(
        email_address: email_address,
        password: password,
        password_confirmation: password_confirmation
      ).save!
      user.build_profile(name: name).save!
      user
    end
  end
end
