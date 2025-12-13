class User < ApplicationRecord
  has_one :credential, class_name: "User::Credential", dependent: :destroy
  has_many :sessions, dependent: :destroy
  has_one :profile, class_name: "User::Profile", dependent: :destroy

  belongs_to :tenant

  def display_name
    profile&.name || I18n.t("activerecord.attributes.user.already_destroyed")
  end
end
