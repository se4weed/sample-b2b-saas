import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import PasswordReset from "~/core/password-reset";
import { getPatchPasswordMockHandler } from "~/gen/api-client/password/password.msw";
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

describe("PasswordReset", () => {
  const userAction = userEvent.setup();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("パスワードリセットフォームが正しく表示される", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordReset token="test-token" />
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText("新しいパスワードを設定")).toBeInTheDocument();
    expect(screen.getByText("新しいパスワードを設定してください。")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード確認")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "パスワードをリセット" })).toBeInTheDocument();
  });

  it("パスワードの最小文字数をバリデーションすること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordReset token="test-token" />
        </Layout>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "パスワードをリセット" });

    await userAction.type(passwordInput, "1234567"); // 7 chars (less than 8)
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("パスワードは8文字以上で入力してください")).toBeInTheDocument();
    });
  });

  it("パスワード確認の最小文字数をバリデーションすること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <PasswordReset token="test-token" />
        </Layout>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード確認");
    const submitButton = screen.getByRole("button", { name: "パスワードをリセット" });

    await userAction.type(passwordInput, "12345678");
    await userAction.type(passwordConfirmationInput, "1234567");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).not.toContain("パスワードがリセットされました");
    });
  });

  it("有効なデータでフォームを送信し成功メッセージを表示すること", async () => {
    const mock = [getPatchPasswordMockHandler({ message: "パスワードがリセットされました" })];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <PasswordReset token="test-token" />
        </Layout>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード確認");
    const submitButton = screen.getByRole("button", { name: "パスワードをリセット" });

    await userAction.type(passwordInput, "newpassword123");
    await userAction.type(passwordConfirmationInput, "newpassword123");
    await userAction.click(submitButton);

    await waitFor(() => {
      expect(document.body.innerText).toContain("パスワードがリセットされました");
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/signin");
    });
  });

  it("フォーム送信中は送信ボタンが無効になること", async () => {
    const mock = [
      getPatchPasswordMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <PasswordReset token="test-token" />
        </Layout>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード確認");
    const submitButton = screen.getByRole("button", { name: "パスワードをリセット" });

    await userAction.type(passwordInput, "newpassword123");
    await userAction.type(passwordConfirmationInput, "newpassword123");

    await userAction.click(submitButton);

    expect(submitButton).toBeDisabled();
    // リクエスト完了まで待機して未解決の非同期を残さない
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("送信中はローディングインジケーターを表示すること", async () => {
    const mock = [
      getPatchPasswordMockHandler(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { message: "Success" };
      }),
    ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <PasswordReset token="test-token" />
        </Layout>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText("パスワード");
    const passwordConfirmationInput = screen.getByLabelText("パスワード確認");
    const submitButton = screen.getByRole("button", { name: "パスワードをリセット" });

    await userAction.type(passwordInput, "newpassword123");
    await userAction.type(passwordConfirmationInput, "newpassword123");
    await userAction.click(submitButton);

    await waitFor(() => {
      const spinningElement = document.querySelector(".animate-spin");
      expect(spinningElement).toBeInTheDocument();
    });

    // スピナーが消える（リクエストが完了する）まで待つ
    await waitFor(() => {
      const spinningElement = document.querySelector(".animate-spin");
      expect(spinningElement).not.toBeInTheDocument();
    });
  });

  describe("APIでエラーが発生した場合", () => {
    it("APIでエラーが発生した場合、エラーメッセージが表示されること", async () => {
      const mockResponseBody = {
        error: "無効なトークンです。",
        errorDetails: [
          {
            propertyMessage: "無効なトークンです。",
            propertyName: "token",
          },
        ],
      };
      const mock = [
        http.patch(
          "*/api/v1/passwords/test-token",
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
            <PasswordReset token="test-token" />
          </Layout>
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText("パスワード");
      const passwordConfirmationInput = screen.getByLabelText("パスワード確認");
      const submitButton = screen.getByRole("button", { name: "パスワードをリセット" });

      await userAction.type(passwordInput, "newpassword123");
      await userAction.type(passwordConfirmationInput, "newpassword123");
      await userAction.click(submitButton);

      await waitFor(() => {
        expect(document.body.innerText).toContain("無効なトークンです。");
      });
    });
  });
});
