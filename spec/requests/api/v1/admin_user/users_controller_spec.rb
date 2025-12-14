require "spec_helper"
require "rails_helper"

RSpec.describe Api::V1::AdminUser::UsersController do
  include Committee::Rails::Test::Methods

  let(:tenant) { FactoryBot.create(:tenant) }
  let(:admin_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }
  let(:general_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :general) }
  let(:admin_user) do
    FactoryBot.create(:user, tenant: tenant, role: admin_role).tap do |user|
      FactoryBot.create(:user_profile, user: user, name: "管理者")
    end
  end

  before do
    mail_double = instance_double(ActionMailer::MessageDelivery, deliver_later: nil)
    allow(UserMailer).to receive(:welcome).and_return(mail_double)
    sign_in_as(admin_user)
  end

  describe "GET /api/v1/admin_user/users" do
    let!(:user1) do
      FactoryBot.create(:user, tenant: tenant, role: general_role).tap do |user|
        FactoryBot.create(:user_profile, user: user, name: "User 1")
      end
    end
    let!(:user2) do
      FactoryBot.create(:user, tenant: tenant, role: admin_role).tap do |user|
        FactoryBot.create(:user_profile, user: user, name: "User 2")
      end
    end

    it "return 200" do
      get api_v1_admin_user_users_path

      assert_schema_conform(200)
    end

    it "自分も含めたユーザー一覧が返されること" do
      get api_v1_admin_user_users_path

      body = JSON.parse(response.body, symbolize_names: true)

      expect(body[:users].size).to eq 3
      expect(body[:users].first[:profile][:name]).to eq "User 2"
    end

    context "一般ユーザーがアクセスした場合" do
      before do
        general_user = FactoryBot.create(:user, tenant: tenant, role: general_role)
        sign_in_as(general_user)
      end

      it "return 403" do
        get api_v1_admin_user_users_path

        assert_schema_conform(403)
      end
    end
  end

  describe "POST /api/v1/admin_user/users" do
    let(:params) do
      {
        roleId: general_role.id,
        name: "新規ユーザー",
        credential: {
          emailAddress: "new_user@example.com",
          password: "Password123!",
          passwordConfirmation: "Password123!"
        }
      }
    end

    it "return 200" do
      post api_v1_admin_user_users_path, params: params

      assert_schema_conform(200)
    end

    it "ユーザーが作成されること" do
      expect do
        post api_v1_admin_user_users_path, params: params
      end.to change(User, :count).by(1)
    end

    context "不正なパラメータの場合" do
      it "return 422" do
        post api_v1_admin_user_users_path, params: params.deep_merge(credential: { passwordConfirmation: "Mismatch" })

        assert_schema_conform(422)
      end
    end
  end

  describe "PATCH /api/v1/admin_user/users/:id" do
    let!(:target_user) do
      FactoryBot.create(:user, tenant: tenant, role: general_role).tap do |user|
        FactoryBot.create(:user_profile, user: user, name: "Before")
      end
    end

    let(:params) do
      {
        roleId: admin_role.id,
        name: "更新ユーザー",
        credential: {
          emailAddress: "updated@example.com",
          password: "Password123!",
          passwordConfirmation: "Password123!"
        }
      }
    end

    it "return 200" do
      patch api_v1_admin_user_user_path(target_user), params: params

      assert_schema_conform(200)
    end

    it "ユーザーが更新されること" do
      patch api_v1_admin_user_user_path(target_user), params: params

      expect(target_user.reload.role_id).to eq admin_role.id
      expect(target_user.credential.email_address).to eq "updated@example.com"
    end

    context "不正なパラメータの場合" do
      it "return 422" do
        patch api_v1_admin_user_user_path(target_user), params: params.deep_merge(credential: { passwordConfirmation: "Mismatch" })

        assert_schema_conform(422)
      end
    end

    context "存在しないユーザーの場合" do
      it "return 404" do
        patch api_v1_admin_user_user_path(id: "missing"), params: params

        assert_schema_conform(404)
      end
    end
  end

  describe "DELETE /api/v1/admin_user/users/:id" do
    let!(:target_user) do
      FactoryBot.create(:user, tenant: tenant, role: general_role).tap do |user|
        FactoryBot.create(:user_profile, user: user, name: "Delete Target")
      end
    end

    it "return 200" do
      delete api_v1_admin_user_user_path(target_user)

      assert_schema_conform(200)
    end

    it "ユーザーが削除されること" do
      expect do
        delete api_v1_admin_user_user_path(target_user)
      end.to change(User, :count).by(-1)
    end

    context "自分を削除しようとした場合" do
      it "return 400" do
        delete api_v1_admin_user_user_path(admin_user)

        assert_schema_conform(400)
      end

      it "エラーメッセージが返されること" do
        delete api_v1_admin_user_user_path(admin_user)

        expected_body = { error: "ユーザー自身を削除することはできません。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "削除に失敗する場合" do
      it "return 422" do
        errors_double = instance_double(ActiveModel::Errors, full_messages: ["削除できません。"])
        allow_any_instance_of(User).to receive(:destroy).and_return(false)
        allow_any_instance_of(User).to receive(:errors).and_return(errors_double)

        delete api_v1_admin_user_user_path(target_user)

        assert_schema_conform(422)
      end
    end
  end
end
