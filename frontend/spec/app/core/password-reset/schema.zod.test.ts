import { describe, it, expect } from "vitest";
import { Schema } from "~/core/password-reset/schema.zod";

describe("パスワードリセットスキーマの場合", () => {
  it("有効なパスワードデータをバリデーションする", () => {
    const validData = {
      password: "validpassword123",
      passwordConfirmation: "validpassword123",
    };

    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("8文字未満のパスワードを拒否する", () => {
    const invalidData = {
      password: "1234567", // 7 characters
      passwordConfirmation: "validpassword123",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    }
  });

  it("8文字未満のパスワード確認を拒否する", () => {
    const invalidData = {
      password: "validpassword123",
      passwordConfirmation: "1234567", // 7 characters
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    }
  });

  it("ちょうど8文字のパスワードを受け入れる", () => {
    const validData = {
      password: "12345678", // exactly 8 characters
      passwordConfirmation: "12345678",
    };

    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("パスワード未入力を拒否する", () => {
    const invalidData = {
      passwordConfirmation: "validpassword123",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("パスワード確認未入力を拒否する", () => {
    const invalidData = {
      password: "validpassword123",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("長いパスワードを受け入れる", () => {
    const validData = {
      password: "thisisaverylongpasswordwithmorethan50characters12345",
      passwordConfirmation: "thisisaverylongpasswordwithmorethan50characters12345",
    };

    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
