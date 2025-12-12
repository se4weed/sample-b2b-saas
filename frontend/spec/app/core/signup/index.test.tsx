import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import SignUp from "~/core/signup";
import { getPostUsersMockHandler } from "~/gen/api-client/users/users.msw";
import { http, HttpResponse } from "msw";
import { server } from "../../../setupTests";
import { Layout } from "../../../helpers/Layout";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

describe("SignUp", () => {
  const userAction = userEvent.setup();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("サインアップフォームが正しく表示される", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getAllByText("アカウント登録")[0]).toBeInTheDocument();
    expect(screen.getByText(/すでにアカウントをお持ちの方は/)).toBeInTheDocument();
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード（確認用）")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "アカウント登録" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "利用規約" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "プライバシーポリシー" })).toBeInTheDocument();
  });

  it("メールアドレスの形式をバリデーションすること", async () => {
    const mock = [getPostUsersMockHandler({ message: "Should not be called" })];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(emailInput, "invalid-email");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).not.toContain("アカウントが作成されました");
      expect(screen.getByText("有効なメールアドレスを入力してください")).toBeInTheDocument();
    });
  });

  it("パスワードの最小文字数をバリデーションすること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "1234567"); // 7 chars
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText("パスワードは8文字以上で入力してください")[0]).toBeInTheDocument();
    });
  });

  it("パスワード確認の最小文字数をバリデーションすること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "1234567"); // 7 chars
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText("パスワードは8文字以上で入力してください")[0]).toBeInTheDocument();
    });
  });

  it("ユーザー名が必須であること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("ユーザー名を入力してください")).toBeInTheDocument();
    });
  });

  it("空のメールアドレスでバリデーションエラーが表示されること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("有効なメールアドレスを入力してください")).toBeInTheDocument();
    });
  });

  it("利用規約への同意が必須であること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).not.toContain("アカウントが作成されました");
    });
  });

  it("有効なデータと利用規約への同意でフォームを送信すること", async () => {
    const mock = [getPostUsersMockHandler({ message: "アカウントが作成されました" })];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).toContain("アカウントが作成されました");
    });
  });

  it("フォーム送信中は送信ボタンが無効になること", async () => {
    const mock = [
      getPostUsersMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);
    await userAction.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it("送信中はローディングインジケーターを表示すること", async () => {
    const mock = [
      getPostUsersMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);
    await userAction.click(submitButton);

    await waitFor(() => {
      const spinningElement = document.querySelector(".animate-spin");
      expect(spinningElement).toBeInTheDocument();
    });
  });

  it("サインインページへのリンクが正しい", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const signinLink = screen.getByRole("link", { name: "ログイン" });
    expect(signinLink).toHaveAttribute("href", "/signin");
  });

  it("利用規約へのリンクが正しい", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const termsLink = screen.getByRole("link", { name: "利用規約" });
    expect(termsLink).toHaveAttribute("href", "/terms-of-service");
  });

  it("プライバシーポリシーへのリンクが正しい", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const privacyLink = screen.getByRole("link", { name: "プライバシーポリシー" });
    expect(privacyLink).toHaveAttribute("href", "/privacy-policy");
  });

  it("すべてのフィールドの入力が必須であること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const nameInput = screen.getByLabelText("ユーザー名");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");

    expect(emailInput).toHaveValue("");
    expect(nameInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
    expect(passwordConfirmationInput).toHaveValue("");
    expect(termsCheckbox).not.toBeChecked();
  });

  it("有効な入力を受け入れること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);

    expect(screen.queryByText("ユーザー名を入力してください")).not.toBeInTheDocument();
    expect(screen.queryByText("有効なメールアドレスを入力してください")).not.toBeInTheDocument();
    expect(screen.queryByText("パスワードは8文字以上で入力してください")).not.toBeInTheDocument();
  });

  it("利用規約チェックボックスを正しく切り替えること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const termsCheckbox = screen.getByRole("checkbox");

    expect(termsCheckbox).not.toBeChecked();

    await userAction.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();

    await userAction.click(termsCheckbox);
    expect(termsCheckbox).not.toBeChecked();
  });

  it("allowTermsOfServiceを除いて正しいデータをAPIに送信すること", async () => {
    const mockFn = vi.fn();
    const mock = [
      getPostUsersMockHandler(async (info) => {
        const body = await info.request.json();
        mockFn(body);
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <SignUp />
        </Layout>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText("ユーザー名");
    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "アカウント登録" });

    await userAction.type(nameInput, "テストユーザー");
    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.type(passwordConfirmationInput, "password123");
    await userAction.click(termsCheckbox);
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledWith({
        emailAddress: "test@example.com",
        password: "password123",
        passwordConfirmation: "password123",
        name: "テストユーザー",
      });
    });
  });

  describe("APIでエラーが発生した場合", () => {
    it("APIでエラーが発生した場合、エラーメッセージが表示されること", async () => {
      const mockResponseBody = {
        error: "メールアドレスは既に使用されています。",
        errorDetails: [
          {
            propertyMessage: "メールアドレスは既に使用されています。",
            propertyName: "emailAddress",
          },
        ],
      };
      const mock = [
        http.post(
          "*/api/v1/users",
          async () =>
            new HttpResponse(JSON.stringify(mockResponseBody), {
              status: 422,
              headers: {
                "Content-Type": "application/json",
              },
            })
        ),
      ];
      server.use(...mock);

      render(
        <BrowserRouter>
          <Layout>
            <SignUp />
          </Layout>
        </BrowserRouter>
      );

      const nameInput = screen.getByLabelText("ユーザー名");
      const emailInput = screen.getByLabelText("メールアドレス");
      const passwordInput = screen.getByLabelText("パスワード");
      const passwordConfirmationInput = screen.getByLabelText("パスワード（確認用）");
      const termsCheckbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: "アカウント登録" });

      await userAction.type(nameInput, "テストユーザー");
      await userAction.type(emailInput, "test@example.com");
      await userAction.type(passwordInput, "password123");
      await userAction.type(passwordConfirmationInput, "password123");
      await userAction.click(termsCheckbox);
      await userAction.click(submitButton);

      await waitFor(() => {
        expect(document.body.innerText).toContain("メールアドレスは既に使用されています。");
      });
    });
  });
});
