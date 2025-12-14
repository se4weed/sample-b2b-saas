class Role < ApplicationRecord
  belongs_to :tenant

  has_many :users, dependent: :restrict_with_error

  enum :permission_type, { general: 0, admin: 1 }

  validates :permission_type, presence: true
  validates :name, presence: true, uniqueness: { scope: :tenant_id }
end
