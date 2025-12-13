FactoryBot.define do
  factory :tenant do
    sequence(:name) { |n| "tenant_#{n}" }
  end
end
