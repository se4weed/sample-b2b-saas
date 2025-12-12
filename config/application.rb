require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module RailsReactBoilerTemplate
  class Application < Rails::Application
    config.load_defaults 8.0

    config.autoload_lib(ignore: %w[assets tasks])

    config.time_zone = "Asia/Tokyo"
    config.i18n.default_locale = :ja
    config.i18n.load_path += Rails.root.glob("config/locales/**/*.{rb,yml}")
    config.x.ipinfo.token = ENV.fetch("IPINFO_API_TOKEN", "")
  end
end
