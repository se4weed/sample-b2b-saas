class Api::V1::User::ProfilesController < Api::V1::ApplicationController
  def update
    name = params.require(:name)
    if current_user.profile.update(name: name)
      render status: :ok, json: { message: "プロフィールを更新しました。" }
    else
      render status: :unprocessable_entity, json: { error: "プロフィールの更新に失敗しました。" }
    end
  end
end
