class Api::V1::AdminUser::ApplicationController < Api::V1::ApplicationController
  before_action :authenticate_admin_user!

  private

  def authenticate_admin_user!
    render json: { error: "権限が不足しています。" }, status: :forbidden and return if current_user && !current_user.role&.admin?
  end
end
