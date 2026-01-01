FactoryBot.define do
  factory :tenant do
    sequence(:name) { |n| "tenant_#{n}" }
    sequence(:code) { |n| "tenant_code_#{n}" }
  end
end
