import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import PasswordResets from "~/core/password-resets";
import { getPostPasswordsMockHandler } from "~/gen/api-client/passwords/passwords.msw";
import { http, HttpResponse } from "msw";
import { server } from "../../../setupTests";
import { Layout } from "../../../helpers/Layout";

vi.mock("~/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

describe("PasswordResets", () => {
  const userAction = userEvent.setup();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("パスワードリセットリクエストフォームが正しく表示される", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText("パスワードをリセット")).toBeInTheDocument();
    expect(screen.getByText(/パスワードをリセットするには、メールアドレスを入力してください/)).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "パスワードリセット用メールを送信" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toBeInTheDocument();
  });

  it("メールアドレスの形式をバリデーションすること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const submitButton = screen.getByRole("button", { name: "パスワードリセット用メールを送信" });

    await userAction.type(emailInput, "invalid-email");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("メールアドレスの形式が不正です")).toBeInTheDocument();
    });
  });

  it("有効なメールアドレスを受け入れること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    await userAction.type(emailInput, "test@example.com");

    expect(screen.queryByText("メールアドレスの形式が不正です")).not.toBeInTheDocument();
  });

  it("有効なメールでフォームを送信し成功メッセージを表示すること", async () => {
    const mock = [getPostPasswordsMockHandler({ message: "パスワードリセット用のメールを送信しました" })];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const submitButton = screen.getByRole("button", { name: "パスワードリセット用メールを送信" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).toContain("パスワードリセット用のメールを送信しました");
    });
  });

  it("フォーム送信中は送信ボタンが無効になること", async () => {
    const mock = [
      getPostPasswordsMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const submitButton = screen.getByRole("button", { name: "パスワードリセット用メールを送信" });

    await userAction.type(emailInput, "test@example.com");
    await userAction.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it("送信中はローディングインジケーターを表示すること", async () => {
    const mock = [
      getPostPasswordsMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");
    const submitButton = screen.getByRole("button", { name: "パスワードリセット用メールを送信" });

    await userAction.type(emailInput, "test@example.com");
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
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const signinLink = screen.getByRole("link", { name: "ログイン" });
    expect(signinLink).toHaveAttribute("href", "/signin");
  });

  it("空のメールアドレスを拒否すること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", { name: "パスワードリセット用メールを送信" });
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("メールアドレスの形式が不正です")).toBeInTheDocument();
    });
  });

  it("様々なメール形式を処理すること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordResets />
        </Layout>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText("メールアドレス");

    const validEmails = ["user@example.com", "test.email@domain.co.jp", "user+tag@example.org", "123@numbers.com"];

    for (const email of validEmails) {
      await userAction.clear(emailInput);
      await userAction.type(emailInput, email);

      expect(screen.queryByText("メールアドレスの形式が不正です")).not.toBeInTheDocument();
    }

    const invalidEmails = ["invalid", "@domain.com", "user@", "user..double.dot@example.com"];

    for (const email of invalidEmails) {
      await userAction.clear(emailInput);
      await userAction.type(emailInput, email);

      const submitButton = screen.getByRole("button", { name: "パスワードリセット用メールを送信" });
      await userAction.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("メールアドレスの形式が不正です")).toBeInTheDocument();
      });
    }
  });

  describe("APIでエラーが発生した場合", () => {
    it("APIでエラーが発生した場合、エラーメッセージが表示されること", async () => {
      const mockResponseBody = {
        error: "メールアドレスが見つかりません。",
        errorDetails: [
          {
            propertyMessage: "メールアドレスが見つかりません。",
            propertyName: "emailAddress",
          },
        ],
      };
      const mock = [
        http.post(
          "*/api/v1/passwords",
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
            <PasswordResets />
          </Layout>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText("メールアドレス");
      const submitButton = screen.getByRole("button", { name: "パスワードリセット用メールを送信" });

      await userAction.type(emailInput, "notfound@example.com");
      await userAction.click(submitButton);

      await waitFor(() => {
        expect(document.body.innerText).toContain("メールアドレスが見つかりません。");
      });
    });
  });
});
