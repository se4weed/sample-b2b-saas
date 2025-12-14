import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useCurrentUserState } from "~/globalStates/user";

type AuthRedirectOptions = {
  /** 認証が必要なページかどうか */
  requireAuth?: boolean;
  /** 管理者である必要があるかどうか */
  requireAdmin?: boolean;
  /** 認証済みユーザーをリダイレクトするかどうか */
  redirectIfAuthenticated?: boolean;
  /** リダイレクト先のパス */
  redirectTo?: string;
  /** トーストメッセージを表示するかどうか */
  showToast?: boolean;
  /** カスタムトーストメッセージ */
  toastMessage?: string;
};

const SIGNIN_PATH = "/signin";
const DEFAULT_REDIRECT_PATH = "/";

export const useAuthRedirect = (options: AuthRedirectOptions = {}) => {
  const {
    requireAuth = false,
    requireAdmin = false,
    redirectIfAuthenticated = false,
    redirectTo = DEFAULT_REDIRECT_PATH,
    showToast = true,
    toastMessage,
  } = options;

  const user = useCurrentUserState();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const isLoading = user === undefined;
  const isAuthenticated = !!user;
  const hasHandledRef = useRef(false);
  const previousAuthStatusRef = useRef<boolean | undefined>(undefined);
  const isAdmin = user?.role.permissionType === "admin";

  useEffect(() => {
    if (isLoading) {
      previousAuthStatusRef.current = isAuthenticated;
      return;
    }

    const wasAuthenticated = previousAuthStatusRef.current;
    let handled = false;

    if (requireAuth && !isAuthenticated) {
      if (!hasHandledRef.current) {
        hasHandledRef.current = true;

        if (showToast) {
          toast.error(toastMessage ?? "ログインが必要です。");
        }

        const destination = pathname === "/" ? SIGNIN_PATH : `${SIGNIN_PATH}?redirectUrl=${encodeURIComponent(pathname)}`;

        navigate(destination);
      }

      handled = true;
    }

    if (!handled && redirectIfAuthenticated && isAuthenticated) {
      if (!hasHandledRef.current) {
        hasHandledRef.current = true;

        const justAuthenticated = wasAuthenticated === false;

        if (showToast && !justAuthenticated) {
          toast.info(toastMessage ?? "すでにログインしています。");
        }

        navigate(redirectTo);
      }

      handled = true;
    }

    if (!handled && requireAuth && isAuthenticated && requireAdmin && !isAdmin) {
      if (!hasHandledRef.current) {
        hasHandledRef.current = true;

        if (showToast) {
          toast.error(toastMessage ?? "管理者権限が必要です。");
        }

        // 一つ前のページに戻る
        navigate(-1);
      }

      handled = true;
    }

    if (!handled) {
      hasHandledRef.current = false;
    }

    previousAuthStatusRef.current = isAuthenticated;
  }, [isLoading, isAuthenticated, requireAuth, redirectIfAuthenticated, redirectTo, showToast, toastMessage, navigate, pathname]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
};
