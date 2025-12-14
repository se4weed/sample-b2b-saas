class Api::V1::UsersController < Api::V1::ApplicationController
  allow_unauthenticated_access only: %i[create me]

  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { rate_limit_exceeded }

  def me
    resume_session
    user = current_user
    logger.info(user)
    if user
      render status: :ok, json: {
        user: {
          id: user.id,
          emailAddress: user.credential.email_address,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          profile: {
            name: user.display_name
          },
          role: {
            id: user.role.id,
            name: user.role.name,
            permissionType: user.role.permission_type
          }
        }
      }
    else
      render status: :ok, json: { user: nil }
    end
  end

  def create
    user = CreateUserCommand.new(
      email_address: create_user_params[:emailAddress],
      password: create_user_params[:password],
      password_confirmation: create_user_params[:passwordConfirmation],
      name: create_user_params[:name]
    ).call!
    UserMailer.welcome(user).deliver_later
    start_new_session_for user

    render status: :created, json: { message: "アカウントの登録が完了しました。" }
  end

  private

  def rate_limit_exceeded
    render status: :too_many_requests, json: { error: "リクエストが多すぎます。しばらくしてから再度お試しください。" }
  end

  def create_user_params
    params.require(%i[emailAddress password passwordConfirmation name])
    params.permit(:emailAddress, :password, :passwordConfirmation, :name)
  end
end
