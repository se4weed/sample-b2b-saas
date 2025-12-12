import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import Signin from "~/core/signin";
import { getPostSessionsMockHandler } from "~/gen/api-client/sessions/sessions.msw";
import { http, HttpResponse } from "msw";
import { server } from "../../../setupTests";
import { Layout } from "../../../helpers/Layout";

const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

vi.mock("~/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

describe("Signin", () => {
  const userAction = userEvent.setup();

  afterEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("redirectUrl");
  });

  it("サインインフォームが正しく表示されること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getAllByText("ログイン")[0]).toBeInTheDocument();
    expect(screen.getByText(/アカウントをお持ちでない方は/)).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "アカウント登録" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "パスワードをリセット" })).toBeInTheDocument();
  });

  it("メールアドレスの形式をバリデーションすること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await userAction.type(emailInput, "invalid-email");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).not.toContain("ログインしました");
    });
  });

  it("パスワードの最小文字数をバリデーションすること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "1234567"); // 7 chars
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("パスワードは8文字以上で入力してください")).toBeInTheDocument();
    });
  });

  it("有効な認証情報でフォームを送信しホームに遷移すること", async () => {
    const mock = [getPostSessionsMockHandler({ message: "ログインしました" })];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).toContain("ログインしました");
    });
  });

  it("リダイレクトURLが指定されている場合はそこに遷移すること", async () => {
    mockSearchParams.set("redirectUrl", "/dashboard");

    const mock = [getPostSessionsMockHandler({ message: "ログインしました" })];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).toContain("ログインしました");
    });
  });

  it("フォーム送信中は送信ボタンが無効になること", async () => {
    const mock = [
      getPostSessionsMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it("送信中はローディングインジケーターを表示すること", async () => {
    const mock = [
      getPostSessionsMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.click(submitButton);

    await waitFor(() => {
      const spinningElement = document.querySelector(".animate-spin");
      expect(spinningElement).toBeInTheDocument();
    });
  });

  it("サインアップページへのリンクが正しいこと", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const signupLink = screen.getByRole("link", { name: "アカウント登録" });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("パスワードリセットページへのリンクが正しいこと", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const passwordResetLink = screen.getByRole("link", { name: "パスワードをリセット" });
    expect(passwordResetLink).toHaveAttribute("href", "/password-resets");
  });

  it("メールアドレスとパスワードの両方が必須こと", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", { name: "ログイン" });
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("有効なメールアドレスを入力してください")).toBeInTheDocument();
    });
  });

  it("有効なメールアドレスとパスワードを受け入れること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");

    expect(screen.queryByText("有効なメールアドレスを入力してください")).not.toBeInTheDocument();
    expect(screen.queryByText("パスワードは8文字以上で入力してください")).not.toBeInTheDocument();
  });

  it("Enterキーでのフォーム送信を処理すること", async () => {
    const mock = [getPostSessionsMockHandler({ message: "ログインしました" })];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <Signin />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    await userAction.type(emailInput, "test@example.com");
    await userAction.type(passwordInput, "password123");
    await userAction.keyboard("{Enter}");

    await waitFor(() => {
      expect(document.body.innerText).toContain("ログインしました");
    });
  });

  describe("APIでエラーが発生した場合", () => {
    it("APIでエラーが発生した場合、エラーメッセージが表示されること", async () => {
      const mockResponseBody = {
        error: "メールアドレスまたはパスワードが正しくありません。",
        errorDetails: [
          {
            propertyMessage: "メールアドレスまたはパスワードが正しくありません。",
            propertyName: "authentication",
          },
        ],
      };
      const mock = [
        http.post(
          "*/api/v1/sessions",
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
            <Signin />
          </Layout>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText("メールアドレス");
      const passwordInput = screen.getByLabelText("パスワード");
      const submitButton = screen.getByRole("button", { name: "ログイン" });

      await userAction.type(emailInput, "test@example.com");
      await userAction.type(passwordInput, "wrongpassword");
      await userAction.click(submitButton);

      await waitFor(() => {
        expect(document.body.innerText).toContain("メールアドレスまたはパスワードが正しくありません。");
      });
    });
  });
});
