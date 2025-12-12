class Api::ApplicationController < ApplicationController
  include CsrfCookie

  rescue_from ActiveRecord::RecordNotFound do
    render status: :not_found, json: { error: "リソースが見つかりません。" }
  end

  rescue_from ActionController::ParameterMissing do |exception|
    render status: :bad_request, json: { error: "パラメータ（#{exception.param}）が不足しています。" }
  end
end
