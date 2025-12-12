require "rails_helper"

RSpec.describe "Api::V1::ActiveSessionsController", type: :request do
  include Committee::Rails::Test::Methods

  describe "GET /api/v1/active_sessions" do
    let(:user) { FactoryBot.create(:user) }
    let!(:old_session) { FactoryBot.create(:session, user: user, created_at: 1.hour.ago) }
    let!(:current_session) { sign_in_as(user) }

    it "return 200" do
      get api_v1_active_sessions_path

      assert_schema_conform(200)
    end

    it "有効なセッションの一覧が返されること" do
      get api_v1_active_sessions_path

      expected_body = {
        activeSessions: [
          {
            id: current_session.id,
            current: true,
            userAgent: {
              device: current_session.device,
              browser: current_session.browser.name,
              platform: current_session.browser.platform.name
            },
            location: current_session.location,
            ipAddress: current_session.ip_address,
            createdAt: current_session.created_at.iso8601
          },
          {
            id: old_session.id,
            current: false,
            userAgent: {
              device: old_session.device,
              browser: old_session.browser.name,
              platform: old_session.browser.platform.name
            },
            location: old_session.location,
            ipAddress: old_session.ip_address,
            createdAt: old_session.created_at.iso8601
          }
        ]
      }
      expect(response.body).to eq(expected_body.to_json)
    end
  end

  describe "DELETE /api/v1/active_sessions/:id" do
    let(:user) { FactoryBot.create(:user) }
    let!(:old_session) { FactoryBot.create(:session, user: user, created_at: 1.hour.ago) }

    before do
      sign_in_as(user)
    end

    it "return 200" do
      delete api_v1_active_session_path(old_session.id)

      assert_schema_conform(200)
    end

    it "セッションが削除されること" do
      delete api_v1_active_session_path(old_session.id)

      expected_json = { message: "ログアウトしました。" }
      expect(response.body).to eq(expected_json.to_json)
      expect(user.sessions.find_by(id: old_session.id)).to be_nil
    end

    context "他人のセッションを削除しようとした場合" do
      let(:other_user) { FactoryBot.create(:user) }
      let!(:other_session) { FactoryBot.create(:session, user: other_user) }

      it "return 404" do
        delete api_v1_active_session_path(other_session.id)

        assert_schema_conform(404)
      end

      it "セッションは削除されないこと" do
        delete api_v1_active_session_path(other_session.id)

        expect(Session.exists?(other_session.id)).to be true
      end
    end

    context "削除に失敗した場合" do
      before do
        allow_any_instance_of(Session).to receive(:destroy).and_return(false)
      end

      it "return 422" do
        delete api_v1_active_session_path(old_session.id)

        assert_schema_conform(422)
      end

      it "エラーメッセージが返されること" do
        delete api_v1_active_session_path(old_session.id)

        expected_json = { error: "ログアウトに失敗しました。" }
        expect(response.body).to eq(expected_json.to_json)
      end
    end
  end
end
