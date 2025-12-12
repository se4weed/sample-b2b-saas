class User::Credential < ApplicationRecord
  belongs_to :user

  has_secure_password

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true, uniqueness: true
end
