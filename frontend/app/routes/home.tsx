import type { Route } from "./+types/home";
import { Welcome } from "../core/welcome/welcome";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export function meta({}: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export const handle = {
  pageTitle: "ホーム",
};

export default function Home() {
  const { isLoading } = useAuthRedirect({
    requireAuth: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return <Welcome />;
  }
}
