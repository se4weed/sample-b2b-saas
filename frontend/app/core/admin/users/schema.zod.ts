import z from "zod";

const CredentialSchema = z
  .object({
    emailAddress: z.string().min(1, "メールアドレスは必須です").email("メールアドレスの形式が正しくありません"),
    password: z.union([z.string().min(8, "パスワードは8文字以上で入力してください。"), z.literal("")]),
    passwordConfirmation: z.union([z.string().min(8, "確認用パスワードも8文字以上で入力してください。"), z.literal("")]),
  })
  .refine(
    (values) => {
      const passwordBlank = values.password === null || values.password === "";
      const confirmationBlank = values.passwordConfirmation === null || values.passwordConfirmation === "";
      if (passwordBlank && confirmationBlank) {
        return true;
      }

      return values.password === values.passwordConfirmation;
    },
    {
      path: ["passwordConfirmation"],
      message: "パスワードが一致していません。",
    }
  );

export const Schema = z.object({
  name: z.string().min(1, "ユーザー名は必須です"),
  roleId: z.string().min(1, "ロールを選択してください"),
  nameId: z.string().optional(),
  credential: CredentialSchema,
});
