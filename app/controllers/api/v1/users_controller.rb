class Api::V1::UsersController < Api::V1::ApplicationController
  allow_unauthenticated_access only: %i[me]
  def me
    resume_session
    user = current_user
    logger.info(user)
    if user
      render status: :ok, json: {
        user: {
          id: user.id,
          emailAddress: user.credential.email_address,
          nameId: user.name_id,
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

  private

  def create_user_params
    params.require(%i[emailAddress password passwordConfirmation name])
    params.permit(:emailAddress, :password, :passwordConfirmation, :name)
  end
end
