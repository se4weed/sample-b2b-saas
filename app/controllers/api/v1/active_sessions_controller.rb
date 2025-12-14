class Api::V1::ActiveSessionsController < Api::V1::ApplicationController
  def index
    sessions = current_user.sessions.order(created_at: :desc, id: :desc)
    render status: :ok, json: {
      activeSessions: sessions.map do |session|
        {
          id: session.id,
          current: session.id == Current.session.id,
          userAgent: {
            device: session.device,
            browser: session.browser.name,
            platform: session.browser.platform.name
          },
          location: session.location,
          ipAddress: session.ip_address,
          createdAt: session.created_at.iso8601
        }
      end
    }
  end

  def destroy
    session = current_user.sessions.find(params[:id])
    if session.destroy
      render status: :ok, json: { message: I18n.t("messages.success.session_logged_out") }
    else
      render status: :unprocessable_content, json: { error: I18n.t("messages.error.session_logout_failed") }
    end
  end
end
