require "rails_helper"
require "factory_bot_rails"

RSpec.describe PasswordsMailer do
  describe "#reset" do
    let(:user) { FactoryBot.create(:user) }
    let(:mail) { described_class.reset(user) }

    it "ヘッダーをレンダリングする" do
      expect(mail.subject).to eq("パスワードをリセットします")
      expect(mail.to).to eq([user.credential.email_address])
      expect(mail.from).to eq(["from@example.com"])
    end

    it "@userをアサインする" do
      expect(mail.html_part.body.decoded).to include("15分以内に")
    end

    it "@credentialをアサインする" do
      expect(mail.body.encoded).to be_present
    end

    it "@tokenをアサインする" do
      html_body = mail.html_part.body.decoded
      expect(html_body).to match(%r{password-resets/[A-Za-z0-9\-_=]+})
    end

    it "本文にリセットリンクを含む" do
      html_body = mail.html_part.body.decoded
      expect(html_body).to match(%r{href="[^"]*password-resets/[A-Za-z0-9\-_=]+[^"]*"})
    end

    context "HTML版" do
      it "HTMLテンプレートをレンダリングする" do
        html_part = mail.html_part
        expect(html_part).to be_present
        expect(html_part.body.decoded).to include("15分以内に")
      end

      it "HTMLにクリック可能なリンクを含む" do
        html_body = mail.html_part.body.decoded
        expect(html_body).to include("href=")
        expect(html_body).to match(%r{password-resets/[A-Za-z0-9\-_=]+})
      end
    end

    context "テキスト版" do
      it "テキストテンプレートをレンダリングする" do
        text_part = mail.text_part
        expect(text_part).to be_present
        expect(text_part.body.decoded).to include("15分以内に")
      end

      it "テキストにリセットURLを含む" do
        text_body = mail.text_part.body.decoded
        expect(text_body).to match(%r{password-resets/[A-Za-z0-9\-_=]+})
      end
    end

    context "ユーザーにクレデンシャルがない場合" do
      let(:user_without_credential) { FactoryBot.create(:user) }

      before do
        user_without_credential.credential.destroy
        user_without_credential.reload
      end

      it "エラーを発生させる" do
        expect do
          described_class.reset(user_without_credential).deliver_now
        end.to raise_error(NoMethodError)
      end
    end

    context "クレデンシャルにパスワードリセットトークンがない場合" do
      let(:user_without_token) { FactoryBot.create(:user) }

      it "nilトークンを適切に処理する" do
        mail = described_class.reset(user_without_token)
        expect(mail.body.encoded).to be_present
      end
    end
  end

  describe "delivery" do
    let(:user) { FactoryBot.create(:user) }

    it "メールを配信する" do
      expect do
        described_class.reset(user).deliver_now
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it "メールを後で配信するためにキューに入れる" do
      expect do
        described_class.reset(user).deliver_later
      end.to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end
  end
end
