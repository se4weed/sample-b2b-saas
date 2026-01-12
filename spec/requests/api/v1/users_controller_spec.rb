require "rails_helper"

RSpec.describe Api::V1::UsersController, type: :request do
  include Committee::Rails::Test::Methods

  describe "GET /api/v1/users/me" do
    let(:user) { FactoryBot.create(:user) }
    let!(:user_profile) { FactoryBot.create(:user_profile, user:, name: "user_profile_name") }

    before do
      sign_in_as(user)
    end

    it "return 200" do
      get api_v1_users_me_path

      assert_schema_conform(200)
    end

    it "現在のユーザー情報が返されること" do
      get api_v1_users_me_path

      expected_body = {
        user: {
          id: user.id,
          emailAddress: user.credential.email_address,
          nameId: user.name_id,
          createdAt: user.created_at.iso8601(3),
          updatedAt: user.updated_at.iso8601(3),
          profile: {
            name: "user_profile_name"
          },
          role: {
            id: user.role.id,
            name: user.role.name,
            permissionType: user.role.permission_type
          }
        }
      }
      expect(response.body).to eq(expected_body.to_json)
    end

    context "ユーザーのプロフィールが存在しない場合" do
      before do
        user.profile.destroy
      end

      it "return 200" do
        get api_v1_users_me_path

        assert_schema_conform(200)
      end

      it "profileのnameが削除済みを返すこと" do
        get api_v1_users_me_path

        expected_body = {
          user: {
            id: user.id,
            emailAddress: user.credential.email_address,
            nameId: user.name_id,
            createdAt: user.created_at.iso8601(3),
            updatedAt: user.updated_at.iso8601(3),
            profile: {
              name: "削除済みのユーザー"
            },
            role: {
              id: user.role.id,
              name: user.role.name,
              permissionType: user.role.permission_type
            }
          }
        }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "ユーザーが認証されていない場合" do
      before do
        # signed cookieをnilに設定
        permanent_double = instance_double(ActionDispatch::Cookies::PermanentCookieJar)
        allow(permanent_double).to receive(:[]=).and_return(nil)

        signed_double = instance_double(ActionDispatch::Cookies::SignedKeyRotatingCookieJar)
        allow(signed_double).to receive_messages("[]=": nil, "[]": nil, permanent: permanent_double)

        allow_any_instance_of(ActionDispatch::Cookies::CookieJar).to receive(:signed).and_return(signed_double)
      end

      it "return 200" do
        get api_v1_users_me_path

        expect(response).to have_http_status(:ok)
      end

      it "userがnilで返されること" do
        get api_v1_users_me_path

        expected_body = { user: nil }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end
end
