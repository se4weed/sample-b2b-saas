require "browser"
require "ipinfo" unless defined?(IPinfo)

class Session < ApplicationRecord
  belongs_to :user

  enum :auth_type, { password: 0, saml: 1 }

  def browser
    Browser.new(user_agent)
  end

  def device
    if browser.device.unknown?
      "pc"
    elsif browser.device.mobile?
      "mobile"
    elsif browser.device.tablet?
      "tablet"
    elsif browser.device.console?
      "console"
    else
      "others"
    end
  end

  def location
    if ip_address.present?
      begin
        # NOTE: APIは有料のため一旦コメントアウト
        # handler = IPinfo.create(Rails.configuration.x.ipinfo.token)
        # ip = "104.30.163.175"
        # # ip = "2a09:bac0:1000:87b::16:23c"
        # detail_v4 = handler.details_v6 ip
        # return "#{detail_v4.city}, #{detail_v4.region}, #{detail_v4.country}" if detail_v4.city.present? && detail_v4.region.present? && detail_v4.country.present?

        # detail_v6 = handler.details_v4(ip)
        # return "#{detail_v6.city}, #{detail_v6.region}, #{detail_v6.country}" if detail_v6.city.present? && detail_v6.region.present? && detail_v6.country.present?

        ""
      rescue StandardError
        ip
      end
    else
      ""
    end
  end
end
