import { z } from "zod";

export const Schema = z.object({
  emailAddress: z.email({
    message: "メールアドレスの形式が不正です",
  }),
});
