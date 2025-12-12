require "rails_helper"

RSpec.describe Api::V1::SessionsController, type: :request do
  describe "POST /api/v1/sessions" do
    let!(:user) { FactoryBot.create(:user) }
    let(:valid_params) do
      {
        emailAddress: user.credential.email_address,
        password: user.credential.password
      }
    end

    it "return 200" do
      post api_v1_sessions_path, params: valid_params

      assert_schema_conform(200)
    end

    it "成功メッセージが返されること" do
      post api_v1_sessions_path, params: valid_params

      expected_body = { message: "ログインしました。" }
      expect(response.body).to eq(expected_body.to_json)
    end

    it "新しいセッションが作成されること" do
      expect do
        post api_v1_sessions_path, params: valid_params
      end.to change(Session, :count).by(1)
    end

    it "セッションクッキーが設定されること" do
      post api_v1_sessions_path, params: valid_params

      expect(cookies[:session_id]).to be_present
    end

    it "メールアドレスは大文字小文字を区別しないこと" do
      params_with_uppercase_email = valid_params.merge(
        emailAddress: user.credential.email_address.upcase
      )

      post api_v1_sessions_path, params: params_with_uppercase_email
      assert_schema_conform(200)
    end

    context "無効な認証情報の場合" do
      context "パスワードが間違っている場合" do
        let(:invalid_params) do
          {
            emailAddress: user.credential.email_address,
            password: "wrong_password"
          }
        end

        it "return 401" do
          post api_v1_sessions_path, params: invalid_params

          assert_schema_conform(401)
        end

        it "エラーメッセージが返されること" do
          post api_v1_sessions_path, params: invalid_params

          expected_body = { error: "メールアドレスまたはパスワードが間違っています。" }
          expect(response.body).to eq(expected_body.to_json)
        end

        it "セッションが作成されないこと" do
          expect do
            post api_v1_sessions_path, params: invalid_params
          end.not_to(change(Session, :count))
        end

        it "セッションクッキーが設定されないこと" do
          post api_v1_sessions_path, params: invalid_params
          expect(cookies[:session_id]).to be_blank
        end
      end

      context "メールアドレスが間違っている場合" do
        let(:invalid_params) do
          {
            emailAddress: "nonexistent@example.com",
            password: "password123"
          }
        end

        it "return 401" do
          post api_v1_sessions_path, params: invalid_params

          assert_schema_conform(401)
        end

        it "エラーメッセージが返されること" do
          post api_v1_sessions_path, params: invalid_params

          expected_body = { error: "メールアドレスまたはパスワードが間違っています。" }
          expect(response.body).to eq(expected_body.to_json)
        end

        it "セッションが作成されないこと" do
          expect do
            post api_v1_sessions_path, params: invalid_params
          end.not_to(change(Session, :count))
        end
      end

      context "ユーザークレデンシャルが存在しない場合" do
        let(:user_without_credential) { FactoryBot.create(:user) }
        let(:invalid_params) do
          {
            emailAddress: "deleted@example.com",
            password: "password123"
          }
        end

        before do
          user_without_credential.credential.destroy
        end

        it "return 401" do
          post api_v1_sessions_path, params: invalid_params

          assert_schema_conform(401)
        end
      end
    end

    context "パラメータが不足している場合" do
      it "emailAddressが不足している場合はreturn 400" do
        post api_v1_sessions_path, params: { password: "password123" }

        assert_schema_conform(400)
      end

      it "passwordが不足している場合はreturn 400" do
        post api_v1_sessions_path, params: { emailAddress: "test@example.com" }

        assert_schema_conform(400)
      end

      it "両方のパラメータが不足している場合はreturn 400" do
        post api_v1_sessions_path, params: {}

        assert_schema_conform(400)
      end
    end
  end

  describe "DELETE /api/v1/sessions" do
    let(:user) { FactoryBot.create(:user) }

    before do
      sign_in_as(user)
    end

    it "return 200" do
      delete api_v1_sessions_path

      assert_schema_conform(200)
    end

    it "成功メッセージが返されること" do
      delete api_v1_sessions_path

      expected_body = { message: "ログアウトしました。" }
      expect(response.body).to eq(expected_body.to_json)
    end

    it "セッションが終了されること" do
      session = sign_in_as(user)

      delete api_v1_sessions_path

      expect { session.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it "セッションクッキーがクリアされること" do
      delete api_v1_sessions_path
      expect(cookies[:session_id]).to be_blank
    end

    context "ユーザーが認証されていない場合" do
      before do
        Current.session = nil
      end

      it "return 200" do
        delete api_v1_sessions_path

        assert_schema_conform(200)
      end

      it "成功メッセージが返されること" do
        delete api_v1_sessions_path

        expected_body = { message: "ログアウトしました。" }
        expect(response.body).to eq(expected_body.to_json)
      end
    end
  end
end
