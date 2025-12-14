class Api::V1::AdminUser::RolesController < Api::V1::AdminUser::ApplicationController
  def index
    roles = Role.where(tenant_id: current_user.tenant_id).order(created_at: :desc)

    render status: :ok, json:
    {
      roles: roles.map do |role|
        {
          id: role.id,
          name: role.name,
          permissionType: role.permission_type
        }
      end
    }
  end

  def create
    role = Role.new(
      name: role_params[:name],
      permission_type: role_params[:permissionType],
      tenant_id: current_user.tenant_id
    )

    if role.save
      render status: :ok, json: {
        message: I18n.t("messages.success.create", model: Role.model_name.human)
      }
    else
      render json: { error: role.errors.full_messages.join("\n") }, status: :unprocessable_entity
    end
  end

  def update
    role = Role.find_by!(id: params[:id], tenant_id: current_user.tenant_id)

    if role.update(name: role_params[:name], permission_type: role_params[:permissionType])
      render status: :ok, json: {
        message: I18n.t("messages.success.update", model: Role.model_name.human)
      }
    else
      render json: { error: role.errors.full_messages.join("\n") }, status: :unprocessable_entity
    end
  end

  def destroy
    role = Role.find_by!(id: params[:id], tenant_id: current_user.tenant_id)

    if role.destroy
      render status: :ok, json: {
        message: I18n.t("messages.success.destroy", model: Role.model_name.human)
      }
    else
      render json: { error: role.errors.full_messages.join("\n") }, status: :unprocessable_entity
    end
  end

  private

  def role_params
    params.require(:name)
    params.require(:permissionType)

    params.permit(:name, :permissionType)
  end
end
