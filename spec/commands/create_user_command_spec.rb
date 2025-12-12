require "rails_helper"

RSpec.describe CreateUserCommand do
  describe "#call!" do
    subject { described_class.new(email_address: email_address, password: password, password_confirmation: password, name: name) }

    let(:email_address) { Faker::Internet.email }
    let(:password) { Faker::Internet.password(min_length: 8, max_length: 72) }
    let(:name) { "user_name" }

    context "有効なパラメータの場合" do
      it "新しいユーザーを作成する" do
        expect { subject.call! }.to change(User, :count).by(1)
      end

      it "ユーザークレデンシャルを作成する" do
        expect { subject.call! }.to change(User::Credential, :count).by(1)
      end

      it "ユーザープロフィールを作成する" do
        expect { subject.call! }.to change(User::Profile, :count).by(1)
      end

      it "作成されたユーザーを返す" do
        user = subject.call!
        expect(user).to be_a(User)
        expect(user).to be_persisted
      end

      it "正しいクレデンシャル属性でユーザーを作成する" do
        user = subject.call!
        credential = user.credential

        expect(credential.email_address).to eq(email_address)
        expect(credential.authenticate(password)).to be_truthy
      end

      it "正しいプロフィール属性でユーザーを作成する" do
        user = subject.call!
        profile = user.profile

        expect(profile.name).to eq(name)
      end

      it "メールアドレスを正規化する" do
        command = described_class.new(
          email_address: "  TEST@EXAMPLE.COM  ",
          password: password,
          password_confirmation: password,
          name: name
        )

        user = command.call!
        expect(user.credential.email_address).to eq("test@example.com")
      end
    end

    context "無効なパラメータの場合" do
      context "メールアドレスが空の場合" do
        let(:command) do
          described_class.new(
            email_address: "",
            password: password,
            password_confirmation: password,
            name: name
          )
        end

        it "エラーを発生させる" do
          expect { command.call! }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it "レコードを作成しない" do
          expect do
            command.call!
          rescue ActiveRecord::RecordInvalid
            # Ignore the error for count check
          end.to change(User, :count).by(0)
            .and change(User::Credential, :count).by(0)
            .and change(User::Profile, :count).by(0)
        end
      end

      context "パスワードが一致しない場合" do
        let(:command) do
          described_class.new(
            email_address: email_address,
            password: password,
            password_confirmation: "different_password",
            name: name
          )
        end

        it "エラーを発生させる" do
          expect { command.call! }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it "レコードを作成しない" do
          expect do
            command.call!
          rescue ActiveRecord::RecordInvalid
            # Ignore the error for count check
          end.to change(User, :count).by(0)
            .and change(User::Credential, :count).by(0)
            .and change(User::Profile, :count).by(0)
        end
      end

      context "メールアドレスが既に使用されている場合" do
        let!(:existing_user) { create(:user) }
        let(:command) do
          described_class.new(
            email_address: existing_user.credential.email_address,
            password: password,
            password_confirmation: password,
            name: name
          )
        end

        it "エラーを発生させる" do
          expect { command.call! }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it "レコードを作成しない" do
          expect do
            command.call!
          rescue ActiveRecord::RecordInvalid
            # Ignore the error for count check
          end.to change(User, :count).by(0)
            .and change(User::Credential, :count).by(0)
            .and change(User::Profile, :count).by(0)
        end
      end
    end

    context "トランザクションの動作" do
      it "作成処理をトランザクションでラップする" do
        expect(ActiveRecord::Base).to receive(:transaction).and_call_original
        subject.call!
      end

      it "失敗時にロールバックする" do
        allow_any_instance_of(User::Profile).to receive(:save!).and_raise(ActiveRecord::RecordInvalid.new(User::Profile.new))

        expect do
          subject.call!
        rescue ActiveRecord::RecordInvalid
          # Ignore the error for count check
        end.to change(User, :count).by(0)
          .and change(User::Credential, :count).by(0)
          .and change(User::Profile, :count).by(0)
      end
    end
  end
end
