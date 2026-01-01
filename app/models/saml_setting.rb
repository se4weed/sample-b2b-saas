class SamlSetting < ApplicationRecord
  belongs_to :tenant

  validates :sso_url, format: { with: /\A#{URI::DEFAULT_PARSER.make_regexp(%w[https])}\z/, allow_blank: true }, length: { maximum: 255 }
  validates :entity_id, length: { maximum: 255 }
  validates :idp_x509_certificate, presence: true
end
