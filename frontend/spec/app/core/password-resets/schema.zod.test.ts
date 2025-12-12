import { describe, it, expect } from "vitest";
import { Schema } from "~/core/password-resets/schema.zod";

describe("パスワードリセットリクエストスキーマ", () => {
  it("有効なメールアドレスをバリデーションする", () => {
    const validData = {
      emailAddress: "test@example.com",
    };

    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("無効なメール形式を拒否する", () => {
    const invalidData = {
      emailAddress: "invalid-email",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("メールアドレスの形式が不正です");
    }
  });

  it("空のメールアドレスを拒否する", () => {
    const invalidData = {
      emailAddress: "",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("メールアドレスの形式が不正です");
    }
  });

  it("メールアドレス未入力を拒否する", () => {
    const invalidData = {};

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("様々な有効なメール形式を受け入れる", () => {
    const validEmails = [
      "user@example.com",
      "test.email@domain.co.jp",
      "user+tag@example.org",
      "123@numbers.com",
      "user_name@example-domain.com",
      "firstname.lastname@subdomain.example.com",
    ];

    validEmails.forEach((email) => {
      const data = { emailAddress: email };
      const result = Schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it("様々な無効なメール形式を拒否する", () => {
    const invalidEmails = [
      "invalid",
      "@domain.com",
      "user@",
      "user@domain",
      "user..double.dot@example.com",
      "user@domain..com",
      ".user@example.com",
      "user.@example.com",
      "user @example.com",
      "user@ex ample.com",
    ];

    invalidEmails.forEach((email) => {
      const data = { emailAddress: email };
      const result = Schema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
