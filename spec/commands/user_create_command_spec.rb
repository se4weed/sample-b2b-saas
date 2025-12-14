require "rails_helper"

RSpec.describe UserCreateCommand do
  describe "#call!" do
    subject(:command) do
      described_class.new(
        email_address: email_address,
        password: password,
        password_confirmation: password_confirmation,
        name: name,
        role_id: role.id,
        tenant_id: tenant.id
      )
    end

    let(:tenant) { FactoryBot.create(:tenant) }
    let(:role) { FactoryBot.create(:role, tenant: tenant) }
    let(:email_address) { "user@example.com" }
    let(:password) { "Password123!" }
    let(:password_confirmation) { password }
    let(:name) { "新規ユーザー" }

    it "ユーザー・クレデンシャル・プロフィールを作成すること" do
      expect { command.call! }
        .to change(User, :count).by(1)
        .and change(User::Credential, :count).by(1)
        .and change(User::Profile, :count).by(1)
    end

    it "指定した属性でユーザーが作成されること" do
      user = command.call!

      expect(user.tenant_id).to eq tenant.id
      expect(user.role_id).to eq role.id
      expect(user.credential.email_address).to eq email_address
      expect(user.profile.name).to eq name
      expect(user.credential.authenticate(password)).to be_truthy
    end

    it "トランザクションで実行されること" do
      expect(ActiveRecord::Base).to receive(:transaction).and_call_original

      command.call!
    end

    context "無効なパラメータの場合" do
      let(:password_confirmation) { "Mismatch123" }

      it "ActiveRecord::RecordInvalidを発生させること" do
        expect { command.call! }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it "レコードを作成しないこと" do
        expect do
          command.call!
        rescue ActiveRecord::RecordInvalid
          # ignore
        end.not_to change(User, :count)
      end
    end
  end
end
