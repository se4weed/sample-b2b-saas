import Signup from "~/core/signup";
import type { Route } from "./+types/signup";
import serviceConfig from "~/config/serviceConfig";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${serviceConfig.name}のアカウントを登録` },
    { name: "description", content: `${serviceConfig.name}のアカウントを登録する` },
  ];
}

const SignupPage = () => {
  const { isLoading } = useAuthRedirect({
    redirectIfAuthenticated: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return <Signup />;
  }
};

export default SignupPage;
