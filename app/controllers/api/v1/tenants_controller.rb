class Api::V1::TenantsController < Api::V1::ApplicationController
  allow_unauthenticated_access only: %i[show]
  rate_limit to: 5, within: 1.minute, only: :show, with: -> { rate_limit_exceeded }

  def show
    tenant = Tenant.find_by!(code: params[:code])
    render status: :ok, json: {
      tenant: {
        name: tenant.name,
        code: tenant.code,
        samlEnabled: tenant.saml_setting.present?
      }
    }
  end
end
