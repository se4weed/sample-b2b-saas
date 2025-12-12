import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import type { AxiosError, AxiosResponse } from "axios";

import { Schema } from "./schema.zod";
import { usePostPasswords } from "~/gen/api-client/passwords/passwords";
import type { Ok, UnprocessableEntityError } from "~/gen/api-client/models";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import Center from "~/components/shared/center";
import Text from "~/components/shared/text";
import { useIsMobile } from "~/hooks/use-mobile";
import { WideLogo } from "~/components/shared/logo";

const PasswordResets = () => {
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      emailAddress: "",
    },
  });
  const { trigger, isMutating } = usePostPasswords();
  const options = {
    onSuccess(data: AxiosResponse<Ok>) {
      toast.success(data.data.message);
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
        <WideLogo className="w-full md:max-w-[400px]" />
        <div className="space-y-2">
          <Text type="blockTitle" weight="semibold">
            パスワードをリセット
          </Text>
          <Text type="description">
            パスワードをリセットするには、メールアドレスを入力してください。
            <br />
            やっぱり思い出した？
            <Link to="/signin" className="text-link">
              ログイン
            </Link>
          </Text>
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
            <CardTitle>パスワードをリセット</CardTitle>
            <CardDescription>
              <Text size="sm" className="gap-0.5">
                パスワードをリセットするには、メールアドレスを入力してください。
                <br />
                やっぱり思い出した？
                <Link to="/signin" className="text-link">
                  ログイン
                </Link>
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

export default PasswordResets;

const PasswordResetForm = ({
  form,
  onSubmit,
  isMutating,
}: {
  form: UseFormReturn<z.infer<typeof Schema>>;
  onSubmit: (data: z.infer<typeof Schema>) => void;
  isMutating: boolean;
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="emailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isMutating} className="w-full space-x-1">
          {isMutating && <LoaderCircle className="h-full animate-spin" />}
          パスワードリセット用メールを送信
        </Button>
      </form>
    </Form>
  );
};
