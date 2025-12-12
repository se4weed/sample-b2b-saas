import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { Schema } from "./schema.zod";
import { Button } from "~/components/ui/button";
import Center from "~/components/shared/center";
import { Link, useNavigate } from "react-router";
import { Checkbox } from "~/components/ui/checkbox";
import { toast } from "sonner";
import { getGetUsersMeKey, usePostUsers } from "~/gen/api-client/users/users";
import type { AxiosError, AxiosResponse } from "axios";
import type { Created, UnprocessableEntityError } from "~/gen/api-client/models";
import { WideLogo } from "~/components/shared/logo";
import { useIsMobile } from "~/hooks/use-mobile";
import Text from "~/components/shared/text";
import { LoaderCircle } from "lucide-react";
import { mutate } from "swr";

const SignUp = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      emailAddress: "",
      password: "",
      passwordConfirmation: "",
      allowTermsOfService: false,
      name: "",
    },
  });
  const { trigger, isMutating } = usePostUsers();
  const options = {
    async onSuccess(data: AxiosResponse<Created>) {
      toast.success(data.data.message);
      await mutate(getGetUsersMeKey());
      navigate("/");
    },
    onError(err: AxiosError<UnprocessableEntityError, unknown>) {
      toast.error(err.response?.data.error);
    },
  };
  const onSubmit = async (data: z.infer<typeof Schema>) => {
    if (data.allowTermsOfService) {
      const requestData = {
        emailAddress: data.emailAddress,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
        name: data.name,
      };
      await trigger(requestData, options);
    } else {
      toast.error("利用規約に同意してください");
    }
  };
  if (useIsMobile()) {
    return (
      <Center className="px-8 space-y-4">
        <WideLogo className="w-full md:max-w-[400px]" />
        <div className="space-y-2">
          <Text type="blockTitle" weight="semibold">
            アカウント登録
          </Text>
          <Text type="description">
            すでにアカウントをお持ちの方は
            <Link to="/signin" className="text-link">
              ログイン
            </Link>
            してください。
          </Text>
        </div>
        <SignUpForm form={form} onSubmit={onSubmit} isMutating={isMutating} />
      </Center>
    );
  }
  return (
    <Center>
      <Card className="w-md max-w-screen mx-4">
        <CardHeader className="space-y-8">
          <WideLogo className="w-[400px]" />
          <div className="space-y-2">
            <CardTitle>アカウント登録</CardTitle>
            <CardDescription>
              <Text size="sm" className="gap-0.5">
                すでにアカウントをお持ちの方は
                <Link to="/signin" className="text-link">
                  ログイン
                </Link>
                してください。
              </Text>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SignUpForm form={form} onSubmit={onSubmit} isMutating={isMutating} />
        </CardContent>
      </Card>
    </Center>
  );
};

export default SignUp;

const SignUpForm = ({
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ユーザー名</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
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
              <FormLabel>パスワード（確認用）</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allowTermsOfService"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-row items-center space-x-1">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>
                  <Link to="/terms-of-service" className="text-link">
                    利用規約
                  </Link>
                  と
                  <Link to="/privacy-policy" className="text-link">
                    プライバシーポリシー
                  </Link>
                  に同意する
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full space-x-1" disabled={isMutating}>
          {isMutating && <LoaderCircle className="h-full animate-spin" />}
          <span>アカウント登録</span>
        </Button>
      </form>
    </Form>
  );
};
