class Api::V1::AdminUser::ApplicationController < Api::V1::ApplicationController
  before_action :authenticate_admin_user!

  private

  def authenticate_admin_user!
    render json: { error: I18n.t("messages.error.forbidden") }, status: :forbidden and return unless current_user.role&.admin?
  end
end
