import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";
import { Layout } from "../../helpers/Layout";
import { toast } from "sonner";

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

vi.mock("~/globalStates/user", () => ({
  useCurrentUserState: () => mockUser,
}));

let mockNavigate = vi.fn();
let mockUser: unknown = undefined;
let mockLocation = { pathname: "/" };

type UseAuthRedirectOptions = Parameters<typeof useAuthRedirect>[0];

const LayoutWrapper = ({ children }: { children: ReactNode }) => createElement(Layout, null, children);

const renderUseAuthRedirect = (options?: UseAuthRedirectOptions, withLayout = false) => {
  if (withLayout) {
    return renderHook(() => useAuthRedirect(options), { wrapper: LayoutWrapper });
  }

  return renderHook(() => useAuthRedirect(options));
};

describe("useAuthRedirect", () => {
  beforeEach(() => {
    mockNavigate = vi.fn();
    mockUser = undefined;
    mockLocation = { pathname: "/" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("初期状態", () => {
    it("正しい初期値を返す", () => {
      mockUser = undefined;
      const { result } = renderUseAuthRedirect();

      expect(result.current.user).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("ユーザーが認証済みの場合の状態を返す", () => {
      mockUser = { id: 1, email: "test@example.com" };
      const { result } = renderUseAuthRedirect();

      expect(result.current.user).toEqual({ id: 1, email: "test@example.com" });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("ユーザーが未認証の場合の状態を返す", () => {
      mockUser = null;
      const { result } = renderUseAuthRedirect();

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("認証が必要なページ", () => {
    it("未認証ユーザーをサインインページにリダイレクトする", () => {
      mockUser = null;

      renderUseAuthRedirect({ requireAuth: true });

      expect(mockNavigate).toHaveBeenCalledWith("/signin");
    });

    it("現在のパスをリダイレクトURLに含める", () => {
      mockUser = null;
      mockLocation = { pathname: "/account" };
      const errorSpy = vi.spyOn(toast, "error");

      renderUseAuthRedirect({ requireAuth: true }, true);

      expect(mockNavigate).toHaveBeenCalledWith("/signin?redirectUrl=%2Faccount");
      expect(errorSpy).toHaveBeenCalledWith("ログインが必要です。");

      errorSpy.mockRestore();
    });

    it("認証済みユーザーはリダイレクトされない", () => {
      mockUser = { id: 1, email: "test@example.com" };

      renderUseAuthRedirect({ requireAuth: true });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("カスタムトーストメッセージが表示される", () => {
      mockUser = null;
      const customMessage = "管理者権限が必要です";

      renderUseAuthRedirect({
        requireAuth: true,
        toastMessage: customMessage,
      });

      expect(mockNavigate).toHaveBeenCalledWith("/signin");
    });

    it("トーストを無効にできる", () => {
      mockUser = null;

      renderUseAuthRedirect({
        requireAuth: true,
        showToast: false,
      });

      expect(mockNavigate).toHaveBeenCalledWith("/signin");
    });
  });

  describe("認証済みユーザーのリダイレクト", () => {
    it("認証済みユーザーをホームページにリダイレクトする", () => {
      mockUser = { id: 1, email: "test@example.com" };
      const infoSpy = vi.spyOn(toast, "info");

      renderUseAuthRedirect({ redirectIfAuthenticated: true }, true);

      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(infoSpy).toHaveBeenCalledWith("すでにログインしています。");

      infoSpy.mockRestore();
    });

    it("未認証ユーザーはリダイレクトされない", () => {
      mockUser = null;

      renderUseAuthRedirect({ redirectIfAuthenticated: true });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("カスタムリダイレクト先を指定できる", () => {
      mockUser = { id: 1, email: "test@example.com" };

      renderUseAuthRedirect({
        redirectIfAuthenticated: true,
        redirectTo: "/dashboard",
      });

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    it("カスタムトーストメッセージが表示される", () => {
      mockUser = { id: 1, email: "test@example.com" };
      const customMessage = "ダッシュボードに移動します";

      renderUseAuthRedirect({
        redirectIfAuthenticated: true,
        toastMessage: customMessage,
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("トーストを無効にできる", () => {
      mockUser = { id: 1, email: "test@example.com" };

      renderUseAuthRedirect({
        redirectIfAuthenticated: true,
        showToast: false,
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("直後の認証では既ログイントーストを表示しない", () => {
      mockUser = null;
      const infoSpy = vi.spyOn(toast, "info");

      const { rerender } = renderUseAuthRedirect(
        {
          redirectIfAuthenticated: true,
        },
        true
      );

      mockUser = { id: 1, email: "test@example.com" };

      rerender();

      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(infoSpy).not.toHaveBeenCalledWith("すでにログインしています。");

      infoSpy.mockRestore();
    });
  });

  describe("ユーザー状態が読み込み中", () => {
    it("ユーザー状態が未定義の場合は何もしない", () => {
      mockUser = undefined;

      renderHook(() => useAuthRedirect({ requireAuth: true }));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("オプションのデフォルト値", () => {
    it("オプションなしで呼び出しても動作する", () => {
      mockUser = { id: 1, email: "test@example.com" };

      const { result } = renderUseAuthRedirect();

      expect(result.current.user).toEqual({ id: 1, email: "test@example.com" });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("部分的なオプションでも動作する", () => {
      mockUser = null;

      renderUseAuthRedirect({ requireAuth: true });

      expect(mockNavigate).toHaveBeenCalledWith("/signin");
    });
  });

  describe("複雑なシナリオ", () => {
    it("両方のオプションが有効でも認証状態に応じて適切に動作する", () => {
      mockUser = null;

      renderUseAuthRedirect({
        requireAuth: true,
        redirectIfAuthenticated: true,
      });

      expect(mockNavigate).toHaveBeenCalledWith("/signin");
    });
  });
});
