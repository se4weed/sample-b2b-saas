module AuthenticationHelpers
  def sign_in_as(user)
    session = Session.create!(
      user: user,
      user_agent: Faker::Internet.user_agent,
      ip_address: Faker::Internet.ip_v4_address
    )
    # Rack::Testでsigned cookieをシミュレート
    permanent_double = instance_double(ActionDispatch::Cookies::PermanentCookieJar)
    allow(permanent_double).to receive(:[]=).and_return(nil)

    signed_double = instance_double(ActionDispatch::Cookies::SignedKeyRotatingCookieJar)
    allow(signed_double).to receive_messages("[]=": nil, "[]": session.id, permanent: permanent_double)

    allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return(signed_double)
    session
  end

  def sign_out
    permanent_double = instance_double(ActionDispatch::Cookies::PermanentCookieJar)
    allow(permanent_double).to receive(:[]=).and_return(nil)

    signed_double = instance_double(ActionDispatch::Cookies::SignedKeyRotatingCookieJar)
    allow(signed_double).to receive_messages("[]=": nil, "[]": nil, permanent: permanent_double)

    allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return(signed_double)
    Current.session = nil
  end
end

RSpec.configure do |config|
  config.include AuthenticationHelpers, type: :request
end
