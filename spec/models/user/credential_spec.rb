require "rails_helper"

RSpec.describe User::Credential do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    subject { build(:user_credential) }

    it { is_expected.to validate_presence_of(:email_address) }
    it { is_expected.to validate_uniqueness_of(:email_address).case_insensitive }
    it { is_expected.to have_secure_password }
  end

  describe "normalization" do
    it "メールアドレスを正規化する（空白削除・小文字化）" do
      credential = build(:user_credential, email_address: "  TEST@EXAMPLE.COM  ")
      credential.valid?
      expect(credential.email_address).to eq("test@example.com")
    end
  end

  describe ".authenticate_by" do
    before do
      create(:user_credential, email_address: "test@example.com", password: "password123", password_confirmation: "password123")
    end

    context "正しい認証情報の場合" do
      it "return true" do
        result = described_class.authenticate_by(email_address: "test@example.com", password: "password123")

        expect(result).to be_truthy
      end

      context "大文字のメールアドレスの場合" do
        it "return true" do
          result = described_class.authenticate_by(email_address: "TEST@EXAMPLE.COM", password: "password123")

          expect(result).to be_truthy
        end
      end
    end

    context "間違った認証情報の場合" do
      it "return false" do
        result = described_class.authenticate_by(email_address: "test@example.com", password: "wrong_password")

        expect(result).to be_falsey
      end
    end
  end
end
