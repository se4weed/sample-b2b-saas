require "rails_helper"

RSpec.describe User do
  describe "validations" do
    let(:tenant) { FactoryBot.create(:tenant) }

    it "name_idが同一テナント内で一意であること" do
      FactoryBot.create(:user, tenant:, name_id: "name-id-001")
      duplicated_user = FactoryBot.build(:user, tenant:, name_id: "name-id-001")

      expect(duplicated_user).not_to be_valid
      duplicated_user.valid?
      expect(duplicated_user.errors.added?(:name_id, :taken)).to be true
    end

    it "name_idにnilを許可すること" do
      FactoryBot.create(:user, tenant:, name_id: nil)
      user = FactoryBot.build(:user, tenant:, name_id: nil)

      expect(user).to be_valid
    end
  end

  describe "associations" do
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
