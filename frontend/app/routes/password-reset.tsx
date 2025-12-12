import { useNavigate } from "react-router";

import PasswordReset from "~/core/password-reset";
import { useCurrentUserState } from "~/globalStates/user";
import type { Route } from "./+types/password-reset";
import { useGetPassword } from "~/gen/api-client/password/password";
import Center from "~/components/shared/center";
import { Loader2 } from "lucide-react";
import Text from "~/components/shared/text";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  const { token } = params;
  return { token };
};

const PasswordResetPage = ({ loaderData }: Route.ComponentProps) => {
  const { token } = loaderData;
  const { isLoading } = useGetPassword({ token });
  const user = useCurrentUserState();
  const navigate = useNavigate();

  if (user) {
    navigate("/");
    return null;
  }

  // ローディング中は何も表示しない（または Loading コンポーネント）
  if (isLoading) {
    return (
      <Center className="h-screen">
        <div className="flex items-center gap-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          <Text>Loading...</Text>
        </div>
      </Center>
    );
  }

  return <PasswordReset token={token} />;
};

export default PasswordResetPage;
