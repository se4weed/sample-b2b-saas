module CsrfCookie
  extend ActiveSupport::Concern

  included do
    before_action :set_csrf_cookie
  end

  private

  def set_csrf_cookie
    cookies["X-CSRF-Token"] = form_authenticity_token
  end
end
