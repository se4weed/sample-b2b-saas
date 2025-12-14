FactoryBot.define do
  factory :role, class: "Role" do
    tenant
    sequence(:name) { |n| "role_#{n}" }
    permission_type { :general }
  end
end
