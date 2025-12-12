import { z } from "zod";

export const Schema = z.object({
  emailAddress: z.email({ message: "有効なメールアドレスを入力してください" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }),
  passwordConfirmation: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }),
  allowTermsOfService: z.boolean().refine((value) => value, { message: "利用規約に同意してください" }),
  name: z.string().min(1, { message: "ユーザー名を入力してください" }),
});
