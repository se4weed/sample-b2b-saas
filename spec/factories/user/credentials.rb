FactoryBot.define do
  factory :user_credential, class: "User::Credential" do
    password = Faker::Internet.password(min_length: 8, max_length: 72)
    user { FactoryBot.create(:user) }
    email_address { Faker::Internet.email }
    password { password }
    password_confirmation { password }
  end
end
