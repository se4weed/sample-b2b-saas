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
    message = I18n.t("messages.error.not_found", model: human_model_name(exception.model))

    render status: :not_found, json: { error: message }
  end

  def render_bad_request_error(exception)
    param_name = human_parameter_name(exception.param)
    message = I18n.t("messages.error.parameter_missing", param_name: param_name)

    render status: :bad_request, json: { error: message }
  end

  def rate_limit_exceeded
    render status: :too_many_requests, json: { error: I18n.t("messages.error.too_many_requests") }
  end

  def human_parameter_name(param)
    scopes = []

    if request&.path
      sanitized_path = request.path.split("?").first.to_s.delete_prefix("/")
      sanitized_path = sanitized_path.sub(%r{^api/v\d+/?}, "")
      sanitized_path = sanitized_path.split("/").reject { |segment| segment.blank? || segment.match?(/\A\d+\z/) }.join("/")
      scopes << sanitized_path if sanitized_path.present?
    end

    sanitized_controller = controller_path.to_s.sub(%r{^api/v\d+/?}, "")
    scopes << sanitized_controller if sanitized_controller.present?
    scopes << controller_name.singularize if controller_name.present?

    scopes.each do |scope|
      next if scope.blank?

      key = "api.#{scope}.parameters.#{param}"
      return I18n.t(key) if I18n.exists?(key, I18n.locale)
    end

    param
  end

  def human_model_name(model_name)
    model_name.constantize.model_name.human
  rescue NameError
    model_name
  end
end
