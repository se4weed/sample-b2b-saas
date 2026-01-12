import serviceConfig from "~/config/serviceConfig";
import SamlSettings from "~/core/admin/saml-settings";
import { useAuthRedirect } from "~/hooks/use-auth-redirect";

export const meta = () => {
  return [{ title: "SAML設定" }, { name: "description", content: `${serviceConfig.name}のSAML設定` }];
};

export const handle = {
  pageTitle: "SAML設定",
};

const SamlSettingsPage = () => {
  const { user, isLoading } = useAuthRedirect({
    requireAuth: true,
    requireAdmin: true,
  });

  if (!user || isLoading) {
    return <div>Loading...</div>;
  }

  return <SamlSettings />;
};

export default SamlSettingsPage;
