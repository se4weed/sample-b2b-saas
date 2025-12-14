require "rails_helper"

RSpec.describe Api::V1::AdminUser::ApplicationController do
  include Committee::Rails::Test::Methods

  let(:tenant) { FactoryBot.create(:tenant) }
  let(:general_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :general) }
  let(:admin_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }

  before do
    stub_const(
      "MockController",
      Class.new(Api::V1::AdminUser::ApplicationController) do
        def index
          render json: { message: "success" }, status: :ok
        end
      end
    )

    Rails.application.routes.draw do
      get "/mock", to: "mock#index", as: :mock
    end
  end

  after { Rails.application.reload_routes! }

  describe "authenticate_admin_user!" do
    context "Admin Roleが紐づいたユーザーの場合" do
      let(:admin_user) { FactoryBot.create(:user, tenant: tenant, role: admin_role) }

      before { sign_in_as(admin_user) }

      it "return 200" do
        get mock_url

        expect(response).to have_http_status :ok
      end

      it "正常なレスポンスが返されること" do
        get mock_url

        expected_body = { message: "success" }
        expect(response.body).to eq expected_body.to_json
      end
    end

    context "General Roleが紐づいたユーザーの場合" do
      let(:general_user) { FactoryBot.create(:user, tenant: tenant, role: general_role) }

      before { sign_in_as(general_user) }

      it "return 403" do
        get mock_url

        expect(response).to have_http_status :forbidden
      end

      it "Unauthorizedエラーが返されること" do
        get mock_url

        expected_body = { error: "権限が不足しています。" }
        expect(response.body).to eq expected_body.to_json
      end
    end

    context "ログインしていない場合" do
      it "return 302" do
        get mock_url

        expect(response).to have_http_status :found
      end

      it "redirect to /signin" do
        get mock_url

        expect(response.headers["Location"]).to eq "http://www.example.com/signin"
      end
    end
  end
end
