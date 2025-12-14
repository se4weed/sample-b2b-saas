require "rails_helper"

RSpec.describe Role do
  describe "associations" do
    it { is_expected.to have_many(:users).dependent(:restrict_with_error) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:permission_type).with_values(general: 0, admin: 1) }
  end

  describe "validations" do
    subject { FactoryBot.build(:role) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).scoped_to(:tenant_id) }
  end
end
