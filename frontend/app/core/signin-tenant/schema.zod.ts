import { z } from "zod";

export const Schema = z.object({
  emailAddress: z.email({ message: "有効なメールアドレスを入力してください" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }),
});
