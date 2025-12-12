class User::Profile < ApplicationRecord
  belongs_to :user

  validates :name,
            presence: true,
            uniqueness: true,
            length: { maximum: 255 }
end
