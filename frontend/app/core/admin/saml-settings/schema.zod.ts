import { z } from "zod";

export const Schema = z.object({
  entityId: z.string().min(1, "エンティティIDは必須です"),
  ssoUrl: z.url("SSO URLの形式が正しくありません").min(1, "SSO URLは必須です"),
  idpX509Certificate: z.string().min(1, "IdP X.509証明書は必須です"),
  samlRequestMethod: z.enum(["GET", "POST"], "SAMLリクエストの送信方法はGETまたはPOSTである必要があります"),
});
