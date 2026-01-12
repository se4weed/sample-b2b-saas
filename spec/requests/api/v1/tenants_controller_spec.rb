require "spec_helper"
require "rails_helper"

RSpec.describe Api::V1::TenantsController do
  include Committee::Rails::Test::Methods

  describe "GET /api/v1/tenants/:code" do
    let(:tenant) { FactoryBot.create(:tenant, name: "Example Corp", code: "example") }

    it "return 200" do
      get api_v1_tenant_path(code: tenant.code)

      assert_schema_conform(200)
    end

    it "テナント情報が返されること" do
      get api_v1_tenant_path(code: tenant.code)

      expected_body = {
        tenant: {
          name: tenant.name,
          code: tenant.code,
          samlEnabled: false
        }
      }
      expect(response.body).to eq(expected_body.to_json)
    end

    context "SAML設定が存在する場合" do
      before { FactoryBot.create(:saml_setting, tenant: tenant) }

      it "samlEnabledがtrueになること" do
        get api_v1_tenant_path(code: tenant.code)

        expected_body = {
          tenant: {
            name: tenant.name,
            code: tenant.code,
            samlEnabled: true
          }
        }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "存在しないテナントコードの場合" do
      it "return 404" do
        get api_v1_tenant_path(code: "missing")

        assert_schema_conform(404)
      end
    end
  end
end
