class Api::V1::SessionsController < Api::V1::ApplicationController
  allow_unauthenticated_access only: %i[create]

  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { rate_limit_exceeded }

  def create
    user_credential = User::Credential.authenticate_by(email_address: login_params[:emailAddress], password: login_params[:password])
    if user_credential.present?
      start_new_session_for user_credential.user
      render status: :ok, json: { message: "ログインしました。" }
    else
      render status: :unauthorized, json: { error: "メールアドレスまたはパスワードが間違っています。" }
    end
  end

  def destroy
    terminate_session
    render status: :ok, json: { message: "ログアウトしました。" }
  end

  private

  def login_params
    params.require(%i[emailAddress password])
    params.permit(:emailAddress, :password)
  end
end
