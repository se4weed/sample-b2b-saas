import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Toaster } from "./components/ui/sonner";
import "./lib/axios";
import serviceConfig from "./config/serviceConfig";
import { useEffect } from "react";
import { useGetUsersMe } from "./gen/api-client/users/users";
import { useCurrentUserMutators } from "./globalStates/user";
import ErrorBoundary from "./components/errorHandler/ErrorBoundary";
import { LoaderCircle } from "lucide-react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "icon", href: "/frontend/logo.svg", type: "image/svg+xml" },
];

export const meta: Route.MetaFunction = () => {
  return [{ title: serviceConfig.name }, { name: "description", content: serviceConfig.description }];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { setCurrentUserState } = useCurrentUserMutators();

  const {
    data: me,
    error,
    isLoading: isLoadingMe,
  } = useGetUsersMe({
    swr: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 500,
    },
  });

  useEffect(() => {
    if (isLoadingMe) return;

    // me の取得結果が揃った段階でグローバルユーザー状態を更新
    if (error) {
      setCurrentUserState(null);
      return;
    }

    setCurrentUserState(me?.data?.user ?? null);
  }, [isLoadingMe, me?.data?.user, error, setCurrentUserState]);

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main className="w-screen h-screen">{isLoadingMe ? <LoadingPage /> : children}</main>
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}

const LoadingPage = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <LoaderCircle className="animate-spin" />
    </div>
  );
};
