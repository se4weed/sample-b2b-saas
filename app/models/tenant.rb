class Tenant < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :roles, dependent: :destroy

  validates :name, presence: true, uniqueness: true
end
