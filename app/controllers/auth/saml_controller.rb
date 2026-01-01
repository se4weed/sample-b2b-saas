class Auth::SamlController < ApplicationController
  include Authentication

  allow_unauthenticated_access only: %i[initiate acs]
  skip_forgery_protection only: :acs

  SAML_SETTING_URL = "/frontend/admin/saml-settings".freeze

  def initiate
    tenant_code = params[:tenant_code]
    tenant = Tenant.find_by!(code: tenant_code)
    saml_setting = tenant.saml_setting

    saml_request = OneLogin::RubySaml::Authrequest.new
    relay_state = params[:redirectUrl].presence || "/frontend/"

    redirect_to saml_request.create(build_settings(saml_setting, tenant), RelayState: relay_state), allow_other_host: true
  end

  def acs
    tenant = Tenant.find_by(code: params[:tenant_code])
    return redirect_to(signin_with_error_path(tenant_code: params[:tenant_code], message: "Tenant not found")) unless tenant

    settings = build_settings(tenant.saml_setting, tenant)
    return redirect_to(signin_with_error_path(tenant_code: params[:tenant_code], message: "SAML setting not found")) unless settings

    response = OneLogin::RubySaml::Response.new(params[:SAMLResponse], settings: settings)

    return redirect_to(signin_with_error_path(tenant_code: params[:tenant_code], message: "Invalid SAML response")) unless response.is_valid?

    email = response.nameid.presence || response.attributes["email"] || response.attributes["Email"]
    return redirect_to(signin_with_error_path(tenant_code: params[:tenant_code], message: "Email not found in SAML response")) if email.blank?

    user = tenant.users.joins(:credential).find_by(user_credentials: { email_address: email })
    return redirect_to(signin_with_error_path(tenant_code: params[:tenant_code], message: "User not found")) unless user

    start_new_session_for(user)

    redirect_to params[:RelayState].presence || "/frontend/"
  end

  private

  def build_settings(saml_setting, tenant)
    return nil unless saml_setting

    entity_id = saml_setting.entity_id
    sso_url = saml_setting.sso_url
    idp_x509_certificate = session[:testing_auth_idp_x509_cert].presence || saml_setting.idp_x509_certificate
    return nil unless entity_id.present? && sso_url.present? && idp_x509_certificate.present?

    OneLogin::RubySaml::Settings.new.tap do |settings|
      settings.assertion_consumer_service_url = auth_saml_acs_url(tenant_code: tenant.code)
      settings.sp_entity_id = tenant.code
      settings.issuer = auth_saml_acs_url(tenant_code: tenant.code)
      settings.name_identifier_format = "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"

      settings.idp_entity_id = entity_id
      settings.idp_sso_target_url = sso_url
      settings.idp_cert = idp_x509_certificate
      settings.idp_sso_service_binding = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
    end
  end

  def signin_with_error_path(tenant_code:, message: "SAML sign-in failed")
    "/frontend/signin/#{tenant_code}?error=saml&message=#{CGI.escape(message)}"
  end
end
