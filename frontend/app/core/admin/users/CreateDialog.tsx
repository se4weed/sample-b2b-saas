import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { Ok, Role, UnprocessableEntityError } from "~/gen/api-client/models";
import type { PostUsersRequest } from "~/gen/api-client/models/postUsersRequest";
import { usePostUser } from "~/gen/api-client/adminuser-users/adminuser-users";
import { toast } from "sonner";
import { Schema } from "./schema.zod";
import { parsePermissionType } from "~/core/admin/roles";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  mutateUsers: () => void;
};

export const CreateDialog = ({ open, onOpenChange, roles, mutateUsers }: Props) => {
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: "",
      roleId: "",
      credential: {
        emailAddress: "",
        password: "",
        passwordConfirmation: "",
      },
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        roleId: "",
        credential: {
          emailAddress: "",
          password: "",
          passwordConfirmation: "",
        },
      });
    }
  }, [open, form]);

  const mutationOptions = {
    onSuccess(response: AxiosResponse<Ok>) {
      toast.success(response.data.message);
      mutateUsers();
      onOpenChange(false);
    },
    onError(error: AxiosError<UnprocessableEntityError>) {
      if (error.response) {
        toast.error(error.response.data?.error || `ユーザーの作成に失敗しました。（${error.response.status}）`);
      } else {
        toast.error("予期せぬエラーが発生しました。");
      }
    },
  };

  const { trigger, isMutating } = usePostUser({ swr: mutationOptions });

  const handleSubmit = (values: z.infer<typeof Schema>) => {
    const payload: PostUsersRequest & { roleId: string } = {
      name: values.name,
      roleId: values.roleId,
      credential: values.credential,
    };

    trigger(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ユーザーの作成</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ユーザー名</FormLabel>
                  <FormDescription>作成するユーザーの表示名を入力してください。</FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credential.emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormDescription>ユーザーのログインに使用するメールアドレスです。</FormDescription>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credential.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormDescription>8文字以上のパスワードを設定してください。</FormDescription>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credential.passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード（確認）</FormLabel>
                  <FormDescription>確認のため、同じパスワードを入力してください。</FormDescription>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ロール</FormLabel>
                  <FormDescription>ユーザーに割り当てるロールを選択してください。</FormDescription>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="ロールを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}（{parsePermissionType(role.permissionType)}）
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isMutating}>
                作成
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
