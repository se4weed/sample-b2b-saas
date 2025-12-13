FactoryBot.define do
  factory :user do
    association :tenant
    after(:build) do |user|
      password = Faker::Internet.password(min_length: 8, max_length: 72)
      user.build_credential(
        email_address: Faker::Internet.email,
        password: password,
        password_confirmation: password
      )
    end

    trait :with_sessions do
      after(:create) do |user|
        create_list(:session, 2, user: user)
      end
    end

    trait :with_profile do
      after(:create) do |user|
        create(:user_profile, user: user)
      end
    end
  end
end
