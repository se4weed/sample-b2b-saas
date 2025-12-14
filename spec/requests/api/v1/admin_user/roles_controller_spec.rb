require "rails_helper"

RSpec.describe Api::V1::AdminUser::RolesController, type: :request do
  include Committee::Rails::Test::Methods

  describe "GET /api/v1/admin_user/roles" do
    let(:tenant) { FactoryBot.create(:tenant) }
    let!(:role_1) { FactoryBot.create(:role, name: "Role 1", permission_type: :admin, tenant: tenant) }
    let!(:role_2) { FactoryBot.create(:role, name: "Role 2", permission_type: :general, tenant: tenant) }
    let(:admin_user) { FactoryBot.create(:user, role: role_1, tenant: tenant) }

    before do
      sign_in_as(admin_user)
    end

    it "return 200" do
      get api_v1_admin_user_roles_path

      assert_schema_conform(200)
    end

    it "役割の一覧が返されること" do
      get api_v1_admin_user_roles_path

      expected_body = {
        roles: [
          {
            id: role_2.id,
            name: role_2.name,
            permissionType: role_2.permission_type
          },
          {
            id: role_1.id,
            name: role_1.name,
            permissionType: role_1.permission_type
          }
        ]
      }
      expect(response.body).to eq(expected_body.to_json)
    end

    context "一般ユーザーがアクセスした場合" do
      let(:general_user) { FactoryBot.create(:user, role: FactoryBot.create(:role, permission_type: :general)) }

      before do
        sign_in_as(general_user)
      end

      it "return 403" do
        get api_v1_admin_user_roles_path

        assert_schema_conform(403)
      end

      it "権限不足エラーが返されること" do
        get api_v1_admin_user_roles_path

        expected_body = { error: "権限が不足しています。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end

  describe "POST /api/v1/admin_user/roles" do
    let(:tenant) { FactoryBot.create(:tenant) }
    let(:admin_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }
    let(:admin_user) { FactoryBot.create(:user, tenant: tenant, role: admin_role) }

    before do
      sign_in_as(admin_user)
    end

    it "return 200" do
      post api_v1_admin_user_roles_path, params: {
        name: "New Role",
        permissionType: "general"
      }

      assert_schema_conform(200)
    end

    it "新しいロールが作成されること" do
      expect do
        post api_v1_admin_user_roles_path, params: {
          name: "New Role",
          permissionType: "general"
        }
      end.to change(Role, :count).by(1)
    end

    context "パラメータが不足している場合" do
      it "return 400" do
        post api_v1_admin_user_roles_path, params: {
          name: "New Role"
        }

        assert_schema_conform(400)
      end

      it "エラーメッセージが返されること" do
        post api_v1_admin_user_roles_path, params: {
          name: "New Role"
        }

        expected_body = { error: "パラメータ（権限）が不足しています。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "ロールの作成に失敗する場合" do
      before do
        Role.last.update(name: "New Role")
      end

      it "return 422" do
        post api_v1_admin_user_roles_path, params: {
          name: "New Role",
          permissionType: "general"
        }

        assert_schema_conform(422)
      end

      it "エラーメッセージが返されること" do
        post api_v1_admin_user_roles_path, params: {
          name: "New Role",
          permissionType: "general"
        }

        expected_body = { error: "ロール名 がすでに使用されています。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end

  describe "PATCH /api/v1/admin_user/roles/:id" do
    let(:tenant) { FactoryBot.create(:tenant) }
    let(:admin_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }
    let(:admin_user) { FactoryBot.create(:user, tenant: tenant, role: admin_role) }
    let(:role_to_update) { FactoryBot.create(:role, tenant: tenant, name: "Old Name", permission_type: :general) }

    before do
      sign_in_as(admin_user)
    end

    it "return 200" do
      patch api_v1_admin_user_role_path(role_to_update), params: {
        name: "Updated Name",
        permissionType: "admin"
      }

      assert_schema_conform(200)
    end

    it "ロールが更新されること" do
      patch api_v1_admin_user_role_path(role_to_update), params: {
        name: "Updated Name",
        permissionType: "admin"
      }

      expect(role_to_update.reload.name).to eq("Updated Name")
      expect(role_to_update.reload.permission_type).to eq("admin")
    end

    context "唯一の管理者ロールを一般ロールへ変更しようとした場合" do
      it "return 422" do
        patch api_v1_admin_user_role_path(admin_role), params: {
          name: "Admin Role",
          permissionType: "general"
        }

        assert_schema_conform(422)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_admin_user_role_path(admin_role), params: {
          name: "Admin Role",
          permissionType: "general"
        }

        expected_body = { error: "権限が管理者のロールは少なくとも1つ必要です。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "パラメータが不足している場合" do
      it "return 400" do
        patch api_v1_admin_user_role_path(role_to_update), params: {
          name: "Updated Name"
        }

        assert_schema_conform(400)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_admin_user_role_path(role_to_update), params: {
          name: "Updated Name"
        }

        expected_body = { error: "パラメータ（権限）が不足しています。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "存在しないロールIDを指定した場合" do
      it "return 404" do
        patch api_v1_admin_user_role_path(id: "nonexistent"), params: {
          name: "Updated Name",
          permissionType: "admin"
        }

        assert_schema_conform(404)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_admin_user_role_path(id: "nonexistent"), params: {
          name: "Updated Name",
          permissionType: "admin"
        }

        expected_body = { error: "ロールが見つかりません。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end

  describe "DELETE /api/v1/admin_user/roles/:id" do
    let(:tenant) { FactoryBot.create(:tenant) }
    let(:admin_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }
    let(:admin_user) { FactoryBot.create(:user, tenant: tenant, role: admin_role) }
    let!(:role_to_delete) { FactoryBot.create(:role, tenant: tenant, name: "Role to Delete", permission_type: :general) }

    before do
      sign_in_as(admin_user)
    end

    it "return 200" do
      delete api_v1_admin_user_role_path(role_to_delete)

      assert_schema_conform(200)
    end

    it "ロールが削除されること" do
      expect do
        delete api_v1_admin_user_role_path(role_to_delete)
      end.to change(Role, :count).by(-1)
    end

    context "ユーザーに紐づいているロールを削除しようとした場合" do
      let!(:user_with_role) { FactoryBot.create(:user, tenant: tenant, role: role_to_delete) }

      it "return 422" do
        delete api_v1_admin_user_role_path(role_to_delete)

        assert_schema_conform(422)
      end

      it "エラーメッセージが返されること" do
        delete api_v1_admin_user_role_path(role_to_delete)

        expected_body = { error: "ユーザーがこのロールを使用しているため、削除できません。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "存在しないロールIDを指定した場合" do
      it "return 404" do
        delete api_v1_admin_user_role_path(id: "nonexistent")

        assert_schema_conform(404)
      end

      it "エラーメッセージが返されること" do
        delete api_v1_admin_user_role_path(id: "nonexistent")

        expected_body = { error: "ロールが見つかりません。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end
end
