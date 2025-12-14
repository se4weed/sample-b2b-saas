require "spec_helper"
require "rails_helper"

RSpec.describe "Authentication" do
  before do
    stub_const(
      "ProtectedController",
      Class.new(ApplicationController) do
        include Authentication

        def index
          head :ok
        end
      end
    )

    Rails.application.routes.draw do
      get "/protected", to: "protected#index", as: :protected
    end
  end

  after { Rails.application.reload_routes! }

  describe "#request_authentication" do
    it "/signinにリダイレクトすること" do
      get protected_url

      expect(response).to redirect_to "/signin"
    end

    it "リダイレクト元URLをセッションに保存すること" do
      get protected_url

      expect(session[:return_to_after_authenticating]).to eq protected_url
    end
  end
end
