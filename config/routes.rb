Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :passwords, param: :token, only: %i[show create update]
      resource :sessions, only: %i[create destroy]
      resources :active_sessions, only: %i[index destroy]
      resources :users, only: %i[create]
      get "users/me", to: "users#me", as: :users_me
      namespace :user do
        resource :profile, only: %i[update]
      end
    end
  end

  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?

  get "up" => "rails/health#show", as: :rails_health_check

  # SPA root
  root "assets#index"

  # SPA catch-all route
  get "*path", to: "assets#index"
end
