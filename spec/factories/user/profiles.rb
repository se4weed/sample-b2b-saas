FactoryBot.define do
  factory :user_profile, class: "User::Profile" do
    user
    sequence(:name) { |n| "user_#{n}" }
  end
end
