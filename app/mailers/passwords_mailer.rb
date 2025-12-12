class PasswordsMailer < ApplicationMailer
  def reset(user)
    @user = user
    @credential = user.credential
    @token = @credential.password_reset_token
    mail subject: t("actionmailer.passwords_mailer.reset.subject"), to: user.credential.email_address
  end
end
