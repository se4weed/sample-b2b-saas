class UserMailer < ApplicationMailer
  def welcome(user)
    @user = user
    mail subject: t("actionmailer.user_mailer.welcome.subject"), to: user.credential.email_address
  end
end
