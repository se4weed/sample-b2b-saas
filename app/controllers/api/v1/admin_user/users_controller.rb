class Api::V1::AdminUser::UsersController < Api::V1::AdminUser::ApplicationController
  def index
    users = User.where(tenant_id: current_user.tenant_id).preload(:role, :profile, :credential).order(created_at: :desc)

    render status: :ok, json:
    {
      users: users.map do |user|
        {
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
      end
    }
  end

  def create
    user = UserCreateCommand.new(
      email_address: user_credential_params[:emailAddress],
      password: user_credential_params[:password],
      password_confirmation: user_credential_params[:passwordConfirmation],
      name: user_params[:name],
      role_id: user_params[:roleId],
      tenant_id: current_user.tenant_id
    ).call!

    UserMailer.welcome(user).deliver_later

    render status: :ok, json: {
      message: I18n.t("messages.success.create", model: User.model_name.human)
    }
  rescue ActiveRecord::RecordInvalid
    render json: { error: I18n.t("messages.error.create", model: User.model_name.human) }, status: :unprocessable_entity
  end

  def update
    user = User.find_by!(id: params[:id], tenant_id: current_user.tenant_id)

    UserUpdateCommand.new(
      user_id: user.id,
      email_address: user_credential_params[:emailAddress],
      password: user_credential_params[:password],
      password_confirmation: user_credential_params[:passwordConfirmation],
      name: user_params[:name],
      role_id: user_params[:roleId],
      tenant_id: current_user.tenant_id
    ).call!

    render status: :ok, json: {
      message: I18n.t("messages.success.update", model: User.model_name.human)
    }
  rescue ActiveRecord::RecordInvalid
    render json: { error: I18n.t("messages.error.update", model: User.model_name.human) }, status: :unprocessable_entity
  end

  def destroy
    user = User.find_by!(id: params[:id], tenant_id: current_user.tenant_id)

    render json: { error: I18n.t("activerecord.errors.messages.destroy_user_self") }, status: :bad_request and return if user.id == current_user.id

    if user.destroy
      render status: :ok, json: {
        message: I18n.t("messages.success.destroy", model: User.model_name.human)
      }
    else
      render json: { error: user.errors.full_messages.join("\n") }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:roleId)
    params.require(:name)

    params.permit(:roleId, :name)
  end

  def user_credential_params
    params.expect(credential: %i[emailAddress password passwordConfirmation])
  end
end
