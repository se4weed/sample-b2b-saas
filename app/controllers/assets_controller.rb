class AssetsController < ApplicationController
  include CsrfCookie

  def index
    render file: Rails.public_path.join("frontend/index.html"), layout: false
  end
end
