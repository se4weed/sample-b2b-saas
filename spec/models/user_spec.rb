require "rails_helper"

RSpec.describe User do
  describe "associations" do
    it { is_expected.to have_one(:credential).class_name("User::Credential").dependent(:destroy) }
    it { is_expected.to have_many(:sessions).dependent(:destroy) }
    it { is_expected.to have_one(:profile).class_name("User::Profile").dependent(:destroy) }
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
