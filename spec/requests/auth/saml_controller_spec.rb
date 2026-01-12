require "rails_helper"

RSpec.describe "Auth::SamlController" do
  describe "GET /auth/saml/:tenant_code" do
    let(:tenant) { FactoryBot.create(:tenant, code: "acme") }
    let!(:saml_setting) { FactoryBot.create(:saml_setting, tenant: tenant) }

    it "redirects to IdP with generated SAMLRequest" do
      auth_request = instance_double(OneLogin::RubySaml::Authrequest)
      allow(OneLogin::RubySaml::Authrequest).to receive(:new).and_return(auth_request)
      allow(auth_request).to receive(:create).and_return("https://idp.example.com/login")

      get "/auth/saml/#{tenant.code}"

      expect(response).to redirect_to("https://idp.example.com/login")
    end

    it "raises not found when tenant code is invalid" do
      get "/auth/saml/missing"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /auth/saml/:tenant_code/acs" do
    let(:tenant) { FactoryBot.create(:tenant, code: "acme") }
    let!(:saml_setting) { FactoryBot.create(:saml_setting, tenant: tenant) }
    let(:role) { FactoryBot.create(:role, tenant: tenant) }
    let(:user) { FactoryBot.create(:user, tenant: tenant, role: role) }
    let(:credential) { user.credential }

    it "signs in the user when response is valid" do
      allow(OneLogin::RubySaml::Authrequest).to receive(:new).and_return(instance_double(OneLogin::RubySaml::Authrequest, create: "/idp"))
      get "/auth/saml/#{tenant.code}"
      saml_response = instance_double(
        OneLogin::RubySaml::Response,
        is_valid?: true,
        nameid: credential.email_address,
        attributes: {}
      )
      allow(OneLogin::RubySaml::Response).to receive(:new).and_return(saml_response)

      post "/auth/saml/#{tenant.code}/acs", params: { SAMLResponse: "response", RelayState: "/frontend/" }

      expect(response).to redirect_to("/frontend/")
      expect(response.cookies["session_id"]).to be_present
    end

    it "redirects back to signin when response is invalid" do
      allow(OneLogin::RubySaml::Authrequest).to receive(:new).and_return(instance_double(OneLogin::RubySaml::Authrequest, create: "/idp"))
      get "/auth/saml/#{tenant.code}"
      saml_response = instance_double(OneLogin::RubySaml::Response, is_valid?: false, nameid: nil, attributes: {})
      allow(OneLogin::RubySaml::Response).to receive(:new).and_return(saml_response)

      post "/auth/saml/#{tenant.code}/acs", params: { SAMLResponse: "bad" }

      expect(response).to redirect_to("/signin/acme?error=saml&message=Invalid+SAML+response")
    end
  end
end
