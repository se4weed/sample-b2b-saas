require "rails_helper"
require "factory_bot_rails"

RSpec.describe UserMailer do
  describe "#welcome" do
    let(:user) { FactoryBot.create(:user) }
    let(:mail) { described_class.welcome(user) }

    it "ヘッダーをレンダリングする" do
      expect(mail.subject).to eq("アプリへようこそ！")
      expect(mail.to).to eq([user.credential.email_address])
      expect(mail.from).to eq(["from@example.com"])
    end

    it "本文をレンダリングする" do
      expect(mail.html_part.body.decoded).to include("アカウント登録ありがとうございます")
    end

    it "@userをアサインする" do
      expect(mail.html_part.body.decoded).to include("今後ともよろしくお願いいたします")
    end

    context "ユーザーにクレデンシャルがない場合" do
      let(:user_without_credential) { FactoryBot.create(:user) }

      before do
        user_without_credential.credential.destroy
        user_without_credential.reload
      end

      it "エラーを発生させる" do
        expect do
          described_class.welcome(user_without_credential).deliver_now
        end.to raise_error(NoMethodError)
      end
    end
  end

  describe "delivery" do
    let(:user) { FactoryBot.create(:user) }

    it "メールを配信する" do
      expect do
        described_class.welcome(user).deliver_now
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it "メールを後で配信するためにキューに入れる" do
      expect do
        described_class.welcome(user).deliver_later
      end.to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end
  end
end
