class Role < ApplicationRecord
  belongs_to :tenant

  has_many :users, dependent: :restrict_with_error

  enum :permission_type, { general: 0, admin: 1 }

  validates :permission_type, presence: true
  validates :name, presence: true, uniqueness: { scope: :tenant_id }

  before_validation :ensure_admin_role_remains, on: %i[update]

  private

  def ensure_admin_role_remains
    errors.add(:base, "少なくとも1つの管理者ロールが必要です。") if Role.where(permission_type: :admin, tenant_id: tenant_id).count <= 1 && permission_type_changed? && permission_type_was == "admin"
  end
end
