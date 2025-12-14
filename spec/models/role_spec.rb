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

  describe "before_validation callbacks" do
    describe "#ensure_admin_role_remains" do
      let(:tenant) { FactoryBot.create(:tenant) }
      let!(:admin_role) { FactoryBot.create(:role, tenant: tenant, permission_type: :admin) }

      it "管理者ロールが一つだけの場合に一般ロールへ変更するとバリデーションエラーとなること" do
        admin_role.permission_type = :general

        expect(admin_role).to be_invalid
        expect(admin_role.errors[:base]).to include("少なくとも1つの管理者ロールが必要です。")
      end

      it "別の管理者ロールが存在する場合は変更できること" do
        FactoryBot.create(:role, tenant: tenant, permission_type: :admin)
        admin_role.permission_type = :general

        expect(admin_role).to be_valid
      end
    end
  end
end
