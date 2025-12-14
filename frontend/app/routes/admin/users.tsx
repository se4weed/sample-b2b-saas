import serviceConfig from "~/config/serviceConfig";
import Users from "~/core/admin/users";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export const meta = () => {
  return [{ title: `ユーザー管理` }, { name: "description", content: `${serviceConfig.name}のユーザー管理` }];
};

export const handle = {
  pageTitle: "ユーザー管理",
};

const UserPage = () => {
  const { user, isLoading } = useAuthRedirect({
    requireAuth: true,
    requireAdmin: true,
  });

  if (!user || isLoading) {
    return <div>Loading...</div>;
  } else {
    return <Users />;
  }
};

export default UserPage;
