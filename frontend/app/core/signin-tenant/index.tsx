import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import Center from "~/components/shared/center";
import Text from "~/components/shared/text";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

type Props = {
  tenantCode: string;
  message?: string;
};

const SigninTenant = ({ tenantCode, message }: Props) => {
  const startSaml = () => {
    window.location.assign(`/auth/saml/${tenantCode}`);
  };

  useEffect(() => {
    if (!tenantCode || !!message) {
      return;
    }
    startSaml();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantCode, message]);

  if (message) {
    toast.error(message);

    return (
      <Center className="h-screen">
        <Card>
          <CardHeader>
            <CardTitle>
              SAMLサインインエラー
            </CardTitle>
          </CardHeader>
          <div className="p-4">
            <Button type="button" onClick={startSaml} variant="outline">
              再度SAMLでログインする
            </Button>
          </div>
        </Card>
      </Center>
    )
  }
  return (
    <Center className="h-screen space-y-2">
      <LoaderCircle className="h-6 w-6 animate-spin" />
      <Text>IdPにリダイレクトしています...</Text>
    </Center>
  );
};

export default SigninTenant;
