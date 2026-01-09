FactoryBot.define do
  factory :saml_setting do
    tenant
    sequence(:entity_id) { |n| "https://sp.example.com/metadata/#{n}" }
    sequence(:sso_url) { |n| "https://idp.example.com/sso/#{n}" }
    idp_x509_certificate { <<~CERT }
      -----BEGIN CERTIFICATE-----
      MIIDdzCCAl+gAwIBAgIEbG5K0jANBgkqhkiG9w0BAQsFADBtMQswCQYDVQQGEwJV
      UzELMAkGA1UECBMCQ0ExETAPBgNVBAcTCFNhbiBKb3NlMRMwEQYDVQQKEwpFeGFt
      cGxlIEluYzEPMA0GA1UECxMGU2VjdXJlMRQwEgYDVQQDEwtFeGFtcGxlIENBMB4X
      DTE2MDUxMzE2MTEzNloXDTI2MDUxMDE2MTEzNlowbTELMAkGA1UEBhMCVVMxCzAJ
      BgNVBAgTAkNBMREwDwYDVQQHEwhTYW4gSm9zZTETMBEGA1UEChMKRXhhbXBsZSBJ
      bmMxDzANBgNVBAsTBlNlY3VyZTEUMBIGA1UEAxMLRXhhbXBsZSBDQTCCASIwDQYJ
      KoZIhvcNAQEBBQADggEPADCCAQoCggEBALYw2v7qPaX5sp7J9tV7pAo0P5NdQ4KJ
      Ip4jOSAmhpN6wXg7PpHgYBqlhK/SXGEdq8np5xpoE2mR7BfrpsbR9f7D3Dveoxu4
      8UUfZo0Sy0RKZrpV6he6zJ1Nsx3Rp3bIanFkFJxuxMxDPZWS9Vyuk3F7S3w7Dnk3
      a1JpN96CB2A+qs0kGugKgdGXNq35p3xNmPR9U1FVLtZL1NVr7Di5urN6byjHgNsx
      3Rp3bIanFkFJxuxMxDPZWS9Vyuk3F7S3w7Dnk3a1JpN96CB2A+qs0kGugKgdGXNq
      35p3xNmPR9U1FVLtZL1NVr7Di5urN6byjHgNsx3Rp3bIanFkFJxuxMxDPZWS9Vy
      uk3F7S3w7Dnk3a1JpN96CAwEAAaMhMB8wHQYDVR0OBBYEFKz8LNkYheAQ7EzxKQ
      EiC5Evhcz2MA0GCSqGSIb3DQEBCwUAA4IBAQB5jOfn34mCiUJkG2jQdRMiXxBpC
      Vd6w4kQvS9PDxOdcwJ5Q9z6aGeqeBLiYgo+7ZD4t0ilYJ1Gp3Zf5whFFu/WqZ0Lt
      hV9QZSQfN3YH3zcFeVn5+2l4iB5+p9WlKKcykK9L7DmruEpk6h1TnW7mKjHDJlLi
      LAJmIl6mYrZlR+XFHirWkZlN/MpxyqOo4ILEhr5L1xXWxMi7Omhq7Q==#{' '}
      -----END CERTIFICATE-----
    CERT
  end
end
