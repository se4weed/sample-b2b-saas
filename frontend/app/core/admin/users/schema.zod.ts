import z from "zod";

const CredentialSchema = z
  .object({
    emailAddress: z.string().min(1, "メールアドレスは必須です").email("メールアドレスの形式が正しくありません"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
    passwordConfirmation: z.string().min(8, "確認用パスワードも8文字以上で入力してください。"),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "パスワードが一致していません。",
  });

export const Schema = z.object({
  name: z.string().min(1, "ユーザー名は必須です"),
  roleId: z.string().min(1, "ロールを選択してください"),
  credential: CredentialSchema,
});
