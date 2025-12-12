class Api::V1::ApplicationController < Api::ApplicationController
  include Authentication

  rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity_error
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found_error
  rescue_from ActionController::ParameterMissing, with: :render_bad_request_error

  private

  def render_unprocessable_entity_error(exception)
    render status: :unprocessable_content, json: { error: exception.record.errors.full_messages.join(", ") }
  end

  def render_not_found_error(exception)
    render status: :not_found, json: { error: exception.message }
  end

  def render_bad_request_error(exception)
    message =
      if exception.is_a?(ActionController::ParameterMissing) && exception.param.present?
        "パラメータ（#{exception.param}）が不足しています。"
      else
        exception.message
      end

    render status: :bad_request, json: { error: message }
  end

  def rate_limit_exceeded
    render status: :too_many_requests, json: { error: "リクエストが多すぎます。しばらくしてから再度お試しください。" }
  end
end
