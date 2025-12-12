class Api::V1::PasswordsController < Api::V1::ApplicationController
  allow_unauthenticated_access only: %i[show create update]

  def show
    credential = User::Credential.find_by_password_reset_token(params[:token])
    render status: :not_found, json: { error: "パスワードリセットのリンクが無効または期限切れです。" } and return unless credential

    render status: :ok, json: { message: "ok" }
  end

  def create
    credential = User::Credential.find_by!(email_address: password_reset_create_params[:emailAddress])
    PasswordsMailer.reset(credential.user).deliver_later

    render status: :ok, json: { message: "パスワードリセットの手順を送信しました。" }
  end

  def update
    credential = User::Credential.find_by_password_reset_token!(params[:token])
    if credential.update(password: password_reset_update_params[:password], password_confirmation: password_reset_update_params[:passwordConfirmation])
      render status: :ok, json: { message: "パスワードを更新しました。ログインしてください。" }
    else
      render status: :unprocessable_content, json: { error: "パスワードが一致しないか、値が不正です。" }
    end
  rescue ActiveRecord::RecordNotFound, ActiveSupport::MessageVerifier::InvalidSignature
    render status: :unprocessable_content, json: { error: "パスワードリセットのリンクが無効または期限切れです。" }
  end

  private

  def password_reset_create_params
    params.require(:emailAddress)
    params.permit(:emailAddress)
  end

  def password_reset_update_params
    params.require(%i[password passwordConfirmation])
    params.permit(:password, :passwordConfirmation)
  end
end
