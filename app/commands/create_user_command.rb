class CreateUserCommand
  attr_accessor :email_address, :password, :password_confirmation, :name

  def initialize(email_address:, password:, password_confirmation:, name:)
    @email_address = email_address
    @password = password
    @password_confirmation = password_confirmation
    @name = name
  end

  def call!
    ActiveRecord::Base.transaction do
      user = User.create!
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
