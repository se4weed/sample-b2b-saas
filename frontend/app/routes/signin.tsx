import Signin from "~/core/signin";
import type { Route } from "./+types/signin";
import serviceConfig from "~/config/serviceConfig";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export function meta({}: Route.MetaArgs) {
  return [{ title: `${serviceConfig.name}にログイン` }, { name: "description", content: `${serviceConfig.name}にログインする` }];
}

const SigninPage = () => {
  const { isLoading } = useAuthRedirect({
    redirectIfAuthenticated: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return <Signin />;
  }
};

export default SigninPage;
