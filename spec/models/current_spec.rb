require "rails_helper"

RSpec.describe Current do
  describe "delegation" do
    let(:user) { create(:user) }
    let(:session) { create(:session, user: user) }

    context "sessionが存在する場合" do
      before { described_class.session = session }
      after { described_class.reset }

      it "userをsessionに委譲する" do
        expect(described_class.user).to eq(user)
      end
    end

    context "sessionがnilの場合" do
      before { described_class.session = nil }
      after { described_class.reset }

      it "userにnilを返す" do
        expect(described_class.user).to be_nil
      end
    end
  end

  describe "thread safety" do
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }
    let(:session1) { create(:session, user: user1) }
    let(:session2) { create(:session, user: user2) }

    it "スレッドごとに個別のcurrent属性を維持する" do
      results = []

      threads = [
        Thread.new do
          described_class.session = session1
          sleep(0.1)
          results << described_class.user
        end,
        Thread.new do
          described_class.session = session2
          sleep(0.1)
          results << described_class.user
        end
      ]

      threads.each(&:join)

      expect(results).to contain_exactly(user1, user2)
    end
  end
end
