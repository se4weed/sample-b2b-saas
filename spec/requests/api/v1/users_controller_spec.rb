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

  xdescribe "POST /api/v1/users" do
    let(:valid_params) do
      {
        emailAddress: "test@example.com",
        password: "password123",
        passwordConfirmation: "password123",
        name: "name"
      }
    end

    it "return 201" do
      post api_v1_users_path, params: valid_params

      assert_schema_conform(201)
    end

    it "新しいユーザーが作成されること" do
      expect do
        post api_v1_users_path, params: valid_params
      end.to change(User, :count).by(1)
    end

    it "ユーザークレデンシャルが作成されること" do
      expect do
        post api_v1_users_path, params: valid_params
      end.to change(User::Credential, :count).by(1)
    end

    it "ユーザーのプロフィールが作成されること" do
      expect do
        post api_v1_users_path, params: valid_params
      end.to change(User::Profile, :count).by(1)
    end

    it "成功メッセージが返されること" do
      post api_v1_users_path, params: valid_params

      expected_body = { message: "アカウントの登録が完了しました。" }
      expect(response.body).to eq(expected_body.to_json)
    end

    it "ウェルカムメールが送信されること" do
      expect do
        post api_v1_users_path, params: valid_params
      end.to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end

    it "ユーザーの新しいセッションが開始されること" do
      expect do
        post api_v1_users_path, params: valid_params
      end.to change(Session, :count).by(1)
    end

    it "セッションクッキーが設定されること" do
      post api_v1_users_path, params: valid_params
      expect(cookies[:session_id]).to be_present
    end

    context "メールアドレスが空の場合" do
      let(:invalid_params) do
        {
          emailAddress: "",
          password: "password123",
          passwordConfirmation: "password123",
          name: "name"
        }
      end

      it "return 400" do
        post api_v1_users_path, params: invalid_params

        assert_schema_conform(400)
      end

      it "ユーザーが作成されないこと" do
        expect do
          post api_v1_users_path, params: invalid_params
        end.not_to(change(User, :count))
      end
    end

    context "パスワードが一致しない場合" do
      let(:invalid_params) do
        {
          emailAddress: "test@example.com",
          password: "password123",
          passwordConfirmation: "different_password",
          name: "name"
        }
      end

      it "return 422" do
        post api_v1_users_path, params: invalid_params

        assert_schema_conform(422)
      end

      it "ユーザーが作成されないこと" do
        expect do
          post api_v1_users_path, params: invalid_params
        end.not_to(change(User, :count))
      end
    end

    context "メールアドレスが既に使用されている場合" do
      let!(:existing_user) { FactoryBot.create(:user) }
      let(:invalid_params) do
        {
          emailAddress: existing_user.credential.email_address,
          password: "password123",
          passwordConfirmation: "password123",
          name: "name"
        }
      end

      it "return 422" do
        post api_v1_users_path, params: invalid_params

        assert_schema_conform(422)
      end

      it "ユーザーが作成されないこと" do
        expect do
          post api_v1_users_path, params: invalid_params
        end.not_to(change(User, :count))
      end
    end

    context "必須パラメータが不足している場合" do
      it "emailAddressが不足している場合はreturn 400" do
        post api_v1_users_path, params: { password: "password123", passwordConfirmation: "password123", name: "name" }

        assert_schema_conform(400)
      end

      it "passwordが不足している場合はreturn 400" do
        post api_v1_users_path, params: { emailAddress: "test@example.com", passwordConfirmation: "password123", name: "name" }

        assert_schema_conform(400)
      end

      it "passwordConfirmationが不足している場合はreturn 400" do
        post api_v1_users_path, params: { emailAddress: "test@example.com", password: "password123", name: "name" }

        assert_schema_conform(400)
      end

      it "nameが不足している場合はreturn 400" do
        post api_v1_users_path, params: { emailAddress: "test@example.com", password: "password123", passwordConfirmation: "password123" }

        assert_schema_conform(400)
      end
    end
  end
end
