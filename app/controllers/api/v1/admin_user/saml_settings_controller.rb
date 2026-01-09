class Api::V1::AdminUser::SamlSettingsController < Api::V1::AdminUser::ApplicationController
  def show
    saml_setting = current_tenant.saml_setting

    render status: :ok, json: {
      samlSetting: {
        entityId: saml_setting&.entity_id.to_s,
        ssoUrl: saml_setting&.sso_url.to_s,
        idpX509Certificate: saml_setting&.idp_x509_certificate.to_s,
        samlRequestMethod: saml_setting&.saml_request_method.to_s.upcase || "GET"
      },
      serviceProvider: {
        entityId: current_tenant.code,
        acsUrl: auth_saml_acs_url(tenant_code: current_tenant.code),
        initiateUrl: auth_saml_url(tenant_code: current_tenant.code)
      }
    }
  end

  def create
    if current_tenant.saml_setting.present?
      render status: :unprocessable_entity, json: { error: I18n.t("messages.error.already_exists", model: SamlSetting.model_name.human) }
      return
    end
    saml_setting = current_tenant.build_saml_setting
    saml_setting.assign_attributes(saml_setting_attributes)

    if saml_setting.save
      render status: :ok, json: { message: I18n.t("messages.success.create", model: saml_setting.model_name.human) }
    else
      render status: :unprocessable_entity, json: { error: I18n.t("messages.error.create", model: saml_setting.model_name.human) }
    end
  end

  def update
    saml_setting = current_tenant.saml_setting || current_tenant.build_saml_setting
    saml_setting.assign_attributes(saml_setting_attributes)

    if saml_setting.save
      render status: :ok, json: { message: I18n.t("messages.success.update", model: saml_setting.model_name.human) }
    else
      render status: :unprocessable_entity, json: { error: I18n.t("messages.error.update", model: saml_setting.model_name.human) }
    end
  end

  private

  def saml_setting_params
    params.require(:entityId)
    params.require(:ssoUrl)
    params.require(:idpX509Certificate)
    params.require(:samlRequestMethod)

    params.permit(:entityId, :ssoUrl, :idpX509Certificate, :samlRequestMethod)
  end

  def saml_setting_attributes
    {
      entity_id: saml_setting_params[:entityId],
      sso_url: saml_setting_params[:ssoUrl],
      idp_x509_certificate: saml_setting_params[:idpX509Certificate],
      saml_request_method: saml_setting_params[:samlRequestMethod].downcase
    }
  end

  def current_tenant
    current_user.tenant
  end
end
