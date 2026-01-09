require "rails_helper"

RSpec.describe Api::V1::AdminUser::SamlSettingsController do
  include Committee::Rails::Test::Methods

  let(:tenant) { FactoryBot.create(:tenant) }
  let(:admin_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }
  let(:admin_user) { FactoryBot.create(:user, tenant: tenant, role: admin_role) }

  before { sign_in_as(admin_user) }

  describe "GET /api/v1/admin_user/saml_setting" do
    let(:expected_service_provider) do
      {
        entityId: tenant.code,
        acsUrl: auth_saml_acs_url(tenant_code: tenant.code),
        initiateUrl: auth_saml_url(tenant_code: tenant.code)
      }
    end

    context "SAML設定が存在する場合" do
      let!(:saml_setting) do
        FactoryBot.create(
          :saml_setting,
          tenant: tenant,
          entity_id: "https://example.com/metadata",
          sso_url: "https://idp.example.com/sso",
          idp_x509_certificate: "CERT"
        )
      end

      it "return 200" do
        get api_v1_admin_user_saml_setting_path

        assert_schema_conform(200)
      end

      it "SAML設定が返されること" do
        get api_v1_admin_user_saml_setting_path

        expected_body = {
          samlSetting: {
            entityId: saml_setting.entity_id,
            ssoUrl: saml_setting.sso_url,
            idpX509Certificate: saml_setting.idp_x509_certificate,
            samlRequestMethod: saml_setting.saml_request_method.upcase
          },
          serviceProvider: expected_service_provider
        }
        expect(response.body).to eq(expected_body.to_json)
      end

      it "SP情報が返されること" do
        get api_v1_admin_user_saml_setting_path

        json = response.parsed_body
        expect(json["serviceProvider"]).to eq(expected_service_provider.deep_stringify_keys)
      end
    end

    context "SAML設定が存在しない場合" do
      it "return 200" do
        get api_v1_admin_user_saml_setting_path

        assert_schema_conform(200)
      end

      it "samlSettingが空で返されること" do
        get api_v1_admin_user_saml_setting_path

        expected_body = {
          samlSetting: {
            entityId: "",
            ssoUrl: "",
            idpX509Certificate: "",
            samlRequestMethod: "GET"
          },
          serviceProvider: expected_service_provider
        }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end

  describe "PATCH /api/v1/admin_user/saml_setting" do
    it "return 200" do
      patch api_v1_admin_user_saml_setting_path, params: saml_setting_params

      assert_schema_conform(200)
    end

    it "SAML設定を保存できること" do
      patch api_v1_admin_user_saml_setting_path, params: saml_setting_params

      saml_setting = tenant.reload.saml_setting
      expect(saml_setting.entity_id).to eq("https://example.com/metadata")
      expect(saml_setting.sso_url).to eq("https://idp.example.com/sso")
      expect(saml_setting.idp_x509_certificate).to eq("CERT")
    end

    context "SAML設定が既に存在する場合" do
      let!(:saml_setting) { FactoryBot.create(:saml_setting, tenant: tenant) }

      it "既存の設定を更新できること" do
        patch api_v1_admin_user_saml_setting_path, params: saml_setting_params(entity_id: "https://new.example.com")

        expect(saml_setting.reload.entity_id).to eq("https://new.example.com")
      end
    end

    context "必須パラメータが不足している場合" do
      it "return 400" do
        patch api_v1_admin_user_saml_setting_path, params: saml_setting_params.except(:ssoUrl)

        assert_schema_conform(400)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_admin_user_saml_setting_path, params: saml_setting_params.except(:ssoUrl)

        expected_body = { error: "パラメータ（SSO URL）が不足しています。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end

  def saml_setting_params(entity_id: "https://example.com/metadata")
    {
      entityId: entity_id,
      ssoUrl: "https://idp.example.com/sso",
      idpX509Certificate: "CERT",
      samlRequestMethod: "GET"
    }
  end
end
