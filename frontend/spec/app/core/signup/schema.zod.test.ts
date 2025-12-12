import { describe, it, expect } from "vitest";
import { Schema } from "~/core/signup/schema.zod";

describe("サインアップスキーマ", () => {
  it("有効なサインアップデータをバリデーションする", () => {
    const validData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("無効なメール形式を拒否する", () => {
    const invalidData = {
      emailAddress: "invalid-email",
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("有効なメールアドレスを入力してください");
    }
  });

  it("空のユーザー名を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
      name: "",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("ユーザー名を入力してください");
    }
  });

  it("ユーザー名未入力を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("8文字未満のパスワードを拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "1234567", // 7 characters
      passwordConfirmation: "password123",
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    }
  });

  it("8文字未満のパスワード確認を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "1234567", // 7 characters
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    }
  });

  it("利用規約に同意しない場合を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: false,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("利用規約に同意してください");
    }
  });

  it("ちょうど8文字のパスワードを受け入れる", () => {
    const validData = {
      emailAddress: "test@example.com",
      password: "12345678", // exactly 8 characters
      passwordConfirmation: "12345678",
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("メールアドレス未入力を拒否する", () => {
    const invalidData = {
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("パスワード未入力を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("パスワード確認未入力を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      allowTermsOfService: true,
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("利用規約同意未入力を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("空のメールアドレスを拒否する", () => {
    const invalidData = {
      emailAddress: "",
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("有効なメールアドレスを入力してください");
    }
  });

  it("空のパスワードを拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "",
      passwordConfirmation: "password123",
      allowTermsOfService: true,
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    }
  });

  it("空のパスワード確認を拒否する", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "",
      allowTermsOfService: true,
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("パスワードは8文字以上で入力してください");
    }
  });

  it("様々な有効なメール形式を受け入れる", () => {
    const validEmails = [
      "user@example.com",
      "test.email@domain.co.jp",
      "user+tag@example.org",
      "123@numbers.com",
      "user_name@example-domain.com",
    ];

    validEmails.forEach((email) => {
      const data = {
        emailAddress: email,
        password: "password123",
        passwordConfirmation: "password123",
        allowTermsOfService: true,
        name: "テストユーザー",
      };
      const result = Schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it("長いパスワードを受け入れる", () => {
    const validData = {
      emailAddress: "test@example.com",
      password: "thisisaverylongpasswordwithmorethan50characters12345",
      passwordConfirmation: "thisisaverylongpasswordwithmorethan50characters12345",
      allowTermsOfService: true,
      name: "テストユーザー",
    };

    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("様々な無効なメール形式を拒否する", () => {
    const invalidEmails = ["invalid", "@domain.com", "user@", "user@domain", "user..double.dot@example.com"];

    invalidEmails.forEach((email) => {
      const data = {
        emailAddress: email,
        password: "password123",
        passwordConfirmation: "password123",
        allowTermsOfService: true,
        name: "テストユーザー",
      };
      const result = Schema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  it("複数のバリデーションエラーを処理する", () => {
    const invalidData = {
      emailAddress: "invalid-email",
      password: "1234567", // too short
      passwordConfirmation: "1234567", // too short
      allowTermsOfService: false, // not agreed
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(1);
      const errorMessages = result.error.issues.map((err) => err.message);
      expect(errorMessages).toContain("有効なメールアドレスを入力してください");
      expect(errorMessages).toContain("パスワードは8文字以上で入力してください");
      expect(errorMessages).toContain("利用規約に同意してください");
    }
  });

  it("allowTermsOfServiceのブール型をバリデーションする", () => {
    const invalidData = {
      emailAddress: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
      allowTermsOfService: "yes" as unknown, // should be boolean
      name: "テストユーザー",
    };

    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
