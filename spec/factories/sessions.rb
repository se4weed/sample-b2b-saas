FactoryBot.define do
  factory :session do
    user
    user_agent { Faker::Internet.user_agent }
    ip_address { Faker::Internet.ip_v4_address }
  end
end
