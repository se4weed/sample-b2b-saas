require "rails_helper"

RSpec.describe UserUpdateCommand do
  describe "#call!" do
    subject(:command) do
      described_class.new(
        user_id: user.id,
        email_address: email_address,
        password: password,
        password_confirmation: password_confirmation,
        name: name,
        role_id: new_role.id,
        tenant_id: tenant.id
      )
    end

    let(:tenant) { FactoryBot.create(:tenant) }
    let(:role) { FactoryBot.create(:role, tenant: tenant, permission_type: :general) }
    let(:new_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }
    let(:user) do
      FactoryBot.create(:user, tenant: tenant, role: role).tap do |created_user|
        FactoryBot.create(:user_profile, user: created_user, name: "旧ユーザー")
      end
    end
    let(:email_address) { "updated@example.com" }
    let(:password) { "Password123!" }
    let(:password_confirmation) { password }
    let(:name) { "更新後ユーザー" }

    before do
      user.profile # ensure eager load
    end

    it "ユーザー情報を更新すること" do
      command.call!

      user.reload
      expect(user.role_id).to eq new_role.id
      expect(user.credential.email_address).to eq email_address
      expect(user.credential.authenticate(password)).to be_truthy
      expect(user.profile.name).to eq name
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

      it "更新がロールバックされること" do
        previous_role_id = user.reload.role_id
        previous_email = user.credential.email_address

        expect { command.call! }.to raise_error(ActiveRecord::RecordInvalid)
        expect(user.reload.role_id).to eq(previous_role_id)
        expect(user.credential.reload.email_address).to eq(previous_email)
      end
    end
  end
end
