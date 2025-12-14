import serviceConfig from "~/config/serviceConfig";
import Roles from "~/core/admin/roles";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export const meta = () => {
  return [{ title: `ロール管理` }, { name: "description", content: `${serviceConfig.name}のロール管理` }];
};

export const handle = {
  pageTitle: "ロール管理",
};

const RolePage = () => {
  const { user, isLoading } = useAuthRedirect({
    requireAuth: true,
    requireAdmin: true,
  });

  if (!user || isLoading) {
    return <div>Loading...</div>;
  } else {
    return <Roles user={user} />;
  }
};

export default RolePage;
