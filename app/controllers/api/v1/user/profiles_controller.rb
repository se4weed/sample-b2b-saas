class Api::V1::User::ProfilesController < Api::V1::ApplicationController
  def update
    name = params.require(:name)
    profile = current_user.profile
    if profile.update(name: name)
      render status: :ok, json: { message: I18n.t("messages.success.update", model: profile.model_name.human) }
    else
      render status: :unprocessable_entity, json: { error: I18n.t("messages.error.update", model: profile.model_name.human) }
    end
  end
end
