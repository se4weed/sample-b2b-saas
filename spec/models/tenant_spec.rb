require "rails_helper"

RSpec.describe Tenant do
  describe "associations" do
    it { is_expected.to have_many(:users).dependent(:destroy) }
    it { is_expected.to have_many(:roles).dependent(:destroy) }
  end

  describe "validations" do
    subject { FactoryBot.build(:tenant) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
  end
end
