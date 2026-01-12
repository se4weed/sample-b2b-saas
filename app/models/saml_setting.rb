class SamlSetting < ApplicationRecord
  belongs_to :tenant

  enum :saml_request_method, {
    get: 0,
    post: 1
  }, prefix: true

  validates :sso_url, format: { with: /\A#{URI::DEFAULT_PARSER.make_regexp(%w[https])}\z/, allow_blank: true }, length: { maximum: 255 }
  validates :entity_id, length: { maximum: 255 }
  validates :idp_x509_certificate, presence: true
  validates :saml_request_method, presence: true
end
