import serviceConfig from "~/config/serviceConfig";
import Account from "~/core/account";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export const meta = () => {
  return [{ title: `アカウント` }, { name: "description", content: `${serviceConfig.name}のアカウント情報` }];
};

export const handle = {
  pageTitle: "アカウント",
};

const AccountPage = () => {
  const { user, isLoading } = useAuthRedirect({
    requireAuth: true,
  });

  if (!user || isLoading) {
    return <div>Loading...</div>;
  } else {
    return <Account user={user} />;
  }
};

export default AccountPage;
