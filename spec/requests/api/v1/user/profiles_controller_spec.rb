require "rails_helper"

RSpec.describe Api::V1::User::ProfilesController, type: :request do
  include Committee::Rails::Test::Methods

  describe "PATCH /api/v1/user/profile" do
    let(:user) { FactoryBot.create(:user) }
    let!(:user_profile) { FactoryBot.create(:user_profile, user:, name: "user_profile_name") }

    before do
      sign_in_as(user)
    end

    it "return 200" do
      patch api_v1_user_profile_path, params: { name: "new_name" }

      assert_schema_conform(200)
    end

    it "ユーザーのプロフィールが更新されること" do
      patch api_v1_user_profile_path, params: { name: "new_name" }

      expected_body = { message: "プロフィールを更新しました。" }

      expect(response.body).to eq expected_body.to_json
      expect(user.reload.profile.name).to eq("new_name")
    end

    context "プロフィールの更新に失敗した場合" do
      before do
        allow_any_instance_of(User::Profile).to receive(:update).and_return(false)
      end

      it "return 422" do
        patch api_v1_user_profile_path, params: { name: "new_name" }

        assert_schema_conform(422)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_user_profile_path, params: { name: "new_name" }

        expected_body = {
          error: "プロフィールの更新に失敗しました。"
        }
        expect(response.body).to eq expected_body.to_json
      end
    end

    context "パラメータが不足している場合" do
      it "return 400" do
        patch api_v1_user_profile_path, params: {}

        assert_schema_conform(400)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_user_profile_path, params: {}

        expected_body = {
          error: "パラメータ（ロール名）が不足しています。"
        }

        expect(response.body).to eq expected_body.to_json
      end
    end
  end
end
