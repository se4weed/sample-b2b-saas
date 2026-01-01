# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

tenant = Tenant.find_or_create_by!(code: "test", name: "Test Tenant")

admin_role = tenant.roles.find_or_create_by!(
  name: "管理者",
  permission_type: :admin
)
general_role = tenant.roles.find_or_create_by!(
  name: "一般ユーザー",
  permission_type: :general
)

admin_user = tenant.users.find_or_create_by!(
  role: admin_role
)
admin_user.build_profile(
  name: "Admin User"
).save!
admin_user.build_credential(
  email_address: "admin@example.com",
  password: "password123",
  password_confirmation: "password123"
).save!

general_user = tenant.users.find_or_create_by!(
  role: general_role
)
general_user.build_profile(
  name: "General User"
).save!
general_user.build_credential(
  email_address: "general@example.com",
  password: "password123",
  password_confirmation: "password123"
).save!
