class UserUpdateCommand
  include ActiveModel::Model

  attr_accessor :user_id, :email_address, :password, :password_confirmation, :name, :role_id, :tenant_id

  def initialize(user_id:, email_address:, password:, password_confirmation:, name:, role_id:, tenant_id:)
    @user_id = user_id
    @email_address = email_address
    @password = password
    @password_confirmation = password_confirmation
    @tenant_id = tenant_id
    @name = name
    @role_id = role_id
  end

  def call!
    ActiveRecord::Base.transaction do
      user = User.find_by!(id: user_id, tenant_id: tenant_id)
      user.update!(tenant_id:, role_id:)
      user.credential.update!(
        email_address: email_address,
        password: password,
        password_confirmation: password_confirmation
      )
      user.profile.update!(name: name)
      user
    end
  end
end
