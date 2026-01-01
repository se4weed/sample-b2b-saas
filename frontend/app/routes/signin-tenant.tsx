import type { Route } from "./+types/signin-tenant";
import serviceConfig from "~/config/serviceConfig";
import SigninTenant from "~/core/signin-tenant";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export function meta({}: Route.MetaArgs) {
  return [{ title: `${serviceConfig.name}にログイン` }, { name: "description", content: `${serviceConfig.name}にログインする` }];
}

export const clientLoader = ({ params }: Route.ClientLoaderArgs) => {
  return { tenantCode: params.tenantCode };
};

const SigninPage = ({ loaderData }: Route.ComponentProps) => {
  const tenantCode = (loaderData as { tenantCode?: string } | undefined)?.tenantCode ?? "";
  const { isLoading } = useAuthRedirect({
    redirectIfAuthenticated: true,
  });
  const message = new URLSearchParams(window.location.search).get("message") || undefined;

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return <SigninTenant tenantCode={tenantCode} message={message} />;
  }
};

export default SigninPage;
