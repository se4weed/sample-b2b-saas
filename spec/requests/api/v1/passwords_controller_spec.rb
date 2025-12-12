require "rails_helper"

RSpec.describe Api::V1::PasswordsController, type: :request do
  include Committee::Rails::Test::Methods

  describe "GET /api/v1/passwords/:token" do
    let(:user) { FactoryBot.create(:user) }

    let!(:token) { user.credential.password_reset_token }

    it "return 200" do
      get api_v1_password_path(token)

      assert_schema_conform(200)
    end

    it "成功メッセージが返されること" do
      get api_v1_password_path(token)

      expected_body = { message: "ok" }
      expect(response.body).to eq(expected_body.to_json)
    end

    context "無効なトークンの場合" do
      it "return 404" do
        get api_v1_password_path("invalid_token")

        assert_schema_conform(404)
      end

      it "エラーメッセージが返されること" do
        get api_v1_password_path("invalid_token")

        expected_body = { error: "パスワードリセットのリンクが無効または期限切れです。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end

    context "期限切れトークンの場合" do
      it "return 404" do
        travel_to(16.minutes.from_now) do
          get api_v1_password_path(token)

          assert_schema_conform(404)
        end
      end

      it "エラーメッセージが返されること" do
        travel_to(20.minutes.from_now) do
          get api_v1_password_path(token)

          expected_body = { error: "パスワードリセットのリンクが無効または期限切れです。" }
          expect(response.body).to eq(expected_body.to_json)
        end
      end
    end
  end

  describe "POST /api/v1/passwords" do
    let!(:user) { FactoryBot.create(:user) }
    let(:valid_params) do
      {
        emailAddress: user.credential.email_address
      }
    end

    context "有効なメールアドレスの場合" do
      context "正常なリクエストの場合" do
        it "return 200" do
          post api_v1_passwords_path, params: valid_params

          assert_schema_conform(200)
        end
      end

      context "レスポンスボディを確認する場合" do
        it "成功メッセージが返されること" do
          post api_v1_passwords_path, params: valid_params

          expected_body = { message: "パスワードリセットの手順を送信しました。" }
          expect(response.body).to eq(expected_body.to_json)
        end
      end

      it "パスワードリセットメールが送信されること" do
        expect do
          post api_v1_passwords_path, params: valid_params
        end.to have_enqueued_job(ActionMailer::MailDeliveryJob)
      end

      it "パスワードリセットトークンが存在すること" do
        post api_v1_passwords_path, params: valid_params

        user.credential.reload
        expect(user.credential.password_reset_token).to be_present
      end

      context "大文字のメールアドレスが与えられた場合" do
        let(:params_with_uppercase_email) do
          {
            emailAddress: user.credential.email_address.upcase
          }
        end

        it "return 200" do
          post api_v1_passwords_path, params: params_with_uppercase_email

          assert_schema_conform(200)
        end

        it "パスワードリセットメールが送信されること" do
          expect do
            post api_v1_passwords_path, params: params_with_uppercase_email
          end.to have_enqueued_job(ActionMailer::MailDeliveryJob)
        end
      end
    end

    context "存在しないメールアドレスの場合" do
      let(:invalid_params) do
        {
          emailAddress: "nonexistent@example.com"
        }
      end

      it "return 404" do
        post api_v1_passwords_path, params: invalid_params

        assert_schema_conform(404)
      end

      it "メールが送信されないこと" do
        expect do
          post api_v1_passwords_path, params: invalid_params
        end.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
      end
    end

    context "メールアドレスが不足している場合" do
      it "return 400" do
        post api_v1_passwords_path, params: {}

        assert_schema_conform(400)
      end
    end

    context "メールアドレスが空の場合" do
      let(:invalid_params) do
        {
          emailAddress: ""
        }
      end

      it "return 400" do
        post api_v1_passwords_path, params: invalid_params

        assert_schema_conform(400)
      end

      it "メールが送信されないこと" do
        expect do
          post api_v1_passwords_path, params: invalid_params
        end.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)
      end
    end
  end

  describe "PATCH /api/v1/passwords/:token" do
    let!(:user_credential) { FactoryBot.create(:user_credential, email_address: "user@example.com", password: "old_password", password_confirmation: "old_password") }
    let!(:token) { user_credential.password_reset_token }
    let(:valid_params) do
      {
        password: "new_password123",
        passwordConfirmation: "new_password123"
      }
    end

    it "return 200" do
      patch api_v1_password_path(token), params: valid_params

      assert_schema_conform(200)
    end

    it "成功メッセージが返されること" do
      patch api_v1_password_path(token), params: valid_params

      expected_body = { message: "パスワードを更新しました。ログインしてください。" }
      expect(response.body).to eq(expected_body.to_json)
    end

    it "パスワードが更新されて、ログインできること" do
      patch api_v1_password_path(token), params: valid_params

      expect(user_credential.reload.authenticate("new_password123")).to be_truthy
    end

    context "パスワードが一致しない場合" do
      let(:invalid_params) do
        {
          password: "new_password123",
          passwordConfirmation: "different_password"
        }
      end

      it "return 422" do
        patch api_v1_password_path(token), params: invalid_params

        assert_schema_conform(422)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_password_path(token), params: invalid_params

        expected_body = { error: "パスワードが一致しないか、値が不正です。" }
        expect(response.body).to eq(expected_body.to_json)
      end

      it "パスワードが更新されないこと" do
        patch api_v1_password_path(token), params: invalid_params

        expect(user_credential.reload.password).to eq "old_password"
      end
    end

    context "無効なトークンの場合" do
      let(:invalid_token) { "invalid_token" }
      let(:invalid_params) do
        {
          password: "new_password123",
          passwordConfirmation: "new_password123"
        }
      end

      it "return 422" do
        patch api_v1_password_path(invalid_token), params: invalid_params

        assert_schema_conform(422)
      end

      it "エラーメッセージが返されること" do
        patch api_v1_password_path(invalid_token), params: invalid_params

        expected_body = { error: "パスワードリセットのリンクが無効または期限切れです。" }
        expect(response.body).to eq(expected_body.to_json)
      end

      it "パスワードが更新されないこと" do
        patch api_v1_password_path(invalid_token), params: valid_params

        expect(user_credential.reload.password).to eq "old_password"
      end
    end

    context "期限切れトークンの場合" do
      it "return 422" do
        travel_to(20.minutes.from_now) do
          patch api_v1_password_path(token), params: valid_params

          assert_schema_conform(422)
        end
      end

      it "エラーメッセージが返されること" do
        travel_to(20.minutes.from_now) do
          patch api_v1_password_path(token), params: valid_params

          expected_body = { error: "パスワードリセットのリンクが無効または期限切れです。" }
          expect(response.body).to eq(expected_body.to_json)
        end
      end
    end

    context "passwordが不足している場合" do
      it "return 400" do
        patch api_v1_password_path(token), params: { passwordConfirmation: "new_password123" }

        assert_schema_conform(400)
      end
    end

    context "passwordConfirmationが不足している場合" do
      it "return 400" do
        patch api_v1_password_path(token), params: { password: "new_password123" }

        assert_schema_conform(400)
      end
    end

    context "両方のパラメータが不足している場合" do
      it "return 400" do
        patch api_v1_password_path(token), params: {}

        assert_schema_conform(400)
      end
    end
  end
end
