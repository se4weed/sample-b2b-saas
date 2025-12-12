import { useForm, type UseFormReturn } from "react-hook-form";
import { Schema } from "./schema.zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePatchPassword } from "~/gen/api-client/password/password";
import type { AxiosResponse, AxiosError } from "axios";
import { toast } from "sonner";
import type { Ok, UnprocessableEntityError } from "~/gen/api-client/models";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { LoaderCircle } from "lucide-react";
import Center from "~/components/shared/center";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { WideLogo } from "~/components/shared/logo";
import Text from "~/components/shared/text";
import { useIsMobile } from "~/hooks/use-mobile";
import { useNavigate } from "react-router";

const PasswordReset = ({ token }: { token: string }) => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof Schema>>({
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
    resolver: zodResolver(Schema),
  });
  const options = {
    onSuccess(data: AxiosResponse<Ok>) {
      toast.success(data.data.message);
      navigate("/signin");
    },
    onError(err: AxiosError<UnprocessableEntityError, unknown>) {
      toast.error(err.response?.data.error);
    },
  };
  const { trigger, isMutating } = usePatchPassword({ token });

  const onSubmit = async (data: z.infer<typeof Schema>) => {
    await trigger(data, options);
  };
  if (useIsMobile()) {
    return (
      <Center className="px-8 space-y-4">
        <WideLogo className="w-full md:max-w-[400px]" />
        <div className="space-y-2">
          <Text type="blockTitle" weight="semibold">
            新しいパスワードを設定
          </Text>
          <Text type="description">新しいパスワードを設定してください。</Text>
        </div>
        <PasswordResetForm form={form} onSubmit={onSubmit} isMutating={isMutating} />
      </Center>
    );
  }
  return (
    <Center>
      <Card className="w-md max-w-screen mx-4">
        <CardHeader className="space-y-8">
          <WideLogo className="w-[400px]" />
          <div className="space-y-2">
            <CardTitle>新しいパスワードを設定</CardTitle>
            <CardDescription>
              <Text size="sm" className="gap-0.5">
                新しいパスワードを設定してください。
              </Text>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <PasswordResetForm form={form} onSubmit={onSubmit} isMutating={isMutating} />
        </CardContent>
      </Card>
    </Center>
  );
};

export default PasswordReset;

const PasswordResetForm = ({
  form,
  onSubmit,
  isMutating,
}: {
  form: UseFormReturn<z.infer<typeof Schema>>;
  onSubmit: (data: z.infer<typeof Schema>) => Promise<void>;
  isMutating: boolean;
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード確認</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isMutating} className="w-full space-x-1">
          {isMutating && <LoaderCircle className="h-full animate-spin" />}
          パスワードをリセット
        </Button>
      </form>
    </Form>
  );
};
