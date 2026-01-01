Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :passwords, param: :token, only: %i[show create update]
      resource :sessions, only: %i[create destroy]
      resources :active_sessions, only: %i[index destroy]
      get "users/me", to: "users#me", as: :users_me
      namespace :user do
        resource :profile, only: %i[update]
      end
      resources :tenants, param: :code, only: %i[show]
      namespace :admin_user do
        resources :roles, only: %i[index create update destroy]
        resources :users, only: %i[index create update destroy]
        resource :saml_setting, only: %i[show create update]
      end
    end
  end

  scope "/auth/saml/:tenant_code", tenant_code: %r{[^/]+} do
    get "/", to: "auth/saml#initiate", as: :auth_saml
    post "/acs", to: "auth/saml#acs", as: :auth_saml_acs
  end

  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?

  get "up" => "rails/health#show", as: :rails_health_check

  # SPA root
  root "assets#index"

  # SPA catch-all route
  get "*path", to: "assets#index"
end
