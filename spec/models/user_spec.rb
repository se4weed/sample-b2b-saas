require "rails_helper"

RSpec.describe User do
  describe "validations" do
    subject { FactoryBot.build(:user, tenant: tenant, role: role) }

    let(:tenant) { FactoryBot.create(:tenant) }
    let(:role) { FactoryBot.create(:role, tenant: tenant) }

    it { is_expected.to validate_uniqueness_of(:name_id).scoped_to(:tenant_id).allow_nil }
  end

  describe "associations" do
    subject(:user) { FactoryBot.build(:user) }

    it { is_expected.to have_one(:credential).class_name("User::Credential").dependent(:destroy) }
    it { is_expected.to have_many(:sessions).dependent(:destroy) }
    it { is_expected.to have_one(:profile).class_name("User::Profile").dependent(:destroy) }
    it { is_expected.to belong_to(:tenant) }
    it { is_expected.to belong_to(:role) }
  end

  describe "#display_name" do
    let(:user) { FactoryBot.create(:user, :with_profile) }

    it "profileのnameを返す" do
      expect(user.display_name).to eq(user.profile.name)
    end

    context "profileが存在しない場合" do
      let(:user) { FactoryBot.create(:user) }

      it "削除済みを返す" do
        expect(user.display_name).to eq(I18n.t("activerecord.attributes.user.already_destroyed"))
      end
    end
  end
end
