import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Center from "~/components/shared/center";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Schema } from "./schema.zod";
import type z from "zod";
import { usePostSessions } from "~/gen/api-client/sessions/sessions";
import { mutate } from "swr";
import { getGetUsersMeKey } from "~/gen/api-client/users/users";
import { toast } from "sonner";
import type { Ok, UnprocessableEntityError } from "~/gen/api-client/models";
import type { AxiosError, AxiosResponse } from "axios";
import { useIsMobile } from "~/hooks/use-mobile";
import Text from "~/components/shared/text";
import { WideLogo } from "~/components/shared/logo";
import { KeyRoundIcon, LoaderCircle } from "lucide-react";
import { useState } from "react";
import SamlLoginDialog from "./SamlLoginDialog";

const Signin = () => {
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl");

  const { trigger, isMutating } = usePostSessions();
  const options = {
    async onSuccess(data: AxiosResponse<Ok>) {
      toast.success(data.data.message);
      await mutate(getGetUsersMeKey()).catch(() => undefined);
      navigate(redirectUrl || "/");
    },
    onError(err: AxiosError<UnprocessableEntityError, unknown>) {
      toast.error(err.response?.data.error);
    },
  };

  const onSubmit = async (data: z.infer<typeof Schema>) => {
    await trigger(data, options);
  };
  if (useIsMobile()) {
    return (
      <Center className="px-8 space-y-4">
        <div className="space-y-8">
          <WideLogo className="w-full md:max-w-[400px]" />
          <div className="space-y-2">
            <Text type="blockTitle" weight="semibold">
              ログイン
            </Text>
          </div>
        </div>
        <SignInForm form={form} onSubmit={onSubmit} isMutating={isMutating} />
      </Center>
    );
  }
  return (
    <Center>
      <Card className="w-md max-w-screen mx-4">
        <CardHeader className="space-y-8">
          <WideLogo className="w-[400px]" />
          <div className="space-y-2">
            <CardTitle>ログイン</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SignInForm form={form} onSubmit={onSubmit} isMutating={isMutating} />
        </CardContent>
      </Card>
    </Center>
  );
};

export default Signin;

const SignInForm = ({
  form,
  onSubmit,
  isMutating,
}: {
  form: UseFormReturn<z.infer<typeof Schema>>;
  onSubmit: (data: z.infer<typeof Schema>) => void;
  isMutating: boolean;
}) => {
  const [samlDialogOpen, setSamlDialogOpen] = useState(false);
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="p-2">
            <Text type="description">
              パスワードをお忘れですか？
              <Link to="/password-resets" className="text-link text-sm">
                パスワードをリセット
              </Link>
              する
            </Text>
          </div>
          <div className="space-y-4">
            <Button type="submit" className="w-full space-x-1" disabled={isMutating}>
              {isMutating && <LoaderCircle className="h-full animate-spin" />}
              <span>ログイン</span>
            </Button>
            <Button type="button" variant="outline" className="w-full space-x-1" onClick={() => setSamlDialogOpen(true)}>
              <KeyRoundIcon />
              <span>SAMLでログイン</span>
            </Button>
          </div>
        </form>
      </Form>
      <SamlLoginDialog open={samlDialogOpen} onOpenChange={setSamlDialogOpen} />
    </>
  );
};
