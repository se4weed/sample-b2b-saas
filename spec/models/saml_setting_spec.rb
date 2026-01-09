require "rails_helper"

RSpec.describe SamlSetting do
  describe "associations" do
    it { is_expected.to belong_to(:tenant) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:saml_request_method).with_values(get: 0, post: 1).with_prefix }
  end

  describe "validations" do
    subject { FactoryBot.build(:saml_setting) }

    it { is_expected.to validate_presence_of(:idp_x509_certificate) }
    it { is_expected.to validate_presence_of(:saml_request_method) }
    it { is_expected.to validate_length_of(:entity_id).is_at_most(255) }
    it { is_expected.to validate_length_of(:sso_url).is_at_most(255) }

    it { is_expected.to allow_value("https://idp.example.com/sso").for(:sso_url) }
    it { is_expected.not_to allow_value("http://idp.example.com/sso").for(:sso_url) }
    it { is_expected.to allow_value("").for(:sso_url) }
  end
end
