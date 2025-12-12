import { z } from "zod";

export const Schema = z.object({
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }),
  passwordConfirmation: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }),
});
