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
import { toast } from "sonner";
import { Schema } from "./schema.zod";
import type { Ok, Role, UnprocessableEntityError, User } from "~/gen/api-client/models";
import type { PatchUserRequest } from "~/gen/api-client/models/patchUserRequest";
import { usePatchUser } from "~/gen/api-client/adminuser-user/adminuser-user";
import { parsePermissionType } from "~/core/admin/roles";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  user: User;
  mutateUsers: () => void;
};

export const EditDialog = ({ open, onOpenChange, roles, user, mutateUsers }: Props) => {
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: user.profile.name,
      roleId: user.role.id,
      nameId: user.nameId ?? "",
      credential: {
        emailAddress: user.emailAddress,
        password: "",
        passwordConfirmation: "",
      },
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset({
      name: user.profile.name,
      roleId: user.role.id,
      nameId: user.nameId ?? "",
      credential: {
        emailAddress: user.emailAddress,
        password: "",
        passwordConfirmation: "",
      },
    });
  }, [open, user, form]);

  const mutationOptions = {
    onSuccess(response: AxiosResponse<Ok>) {
      toast.success(response.data.message);
      mutateUsers();
      onOpenChange(false);
    },
    onError(error: AxiosError<UnprocessableEntityError>) {
      if (error.response) {
        toast.error(error.response.data?.error || `ユーザーの更新に失敗しました。（${error.response.status}）`);
      } else {
        toast.error("予期せぬエラーが発生しました。");
      }
    },
  };

  const { trigger, isMutating } = usePatchUser({ userId: user.id }, { swr: mutationOptions });

  const handleSubmit = (values: z.infer<typeof Schema>) => {
    const normalizedNameId = values.nameId?.trim();
    const payload: PatchUserRequest = {
      name: values.name,
      roleId: values.roleId,
      nameId: normalizedNameId || null,
      credential: values.credential,
    };

    trigger(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ユーザーの編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ユーザー名</FormLabel>
                  <FormDescription>ユーザーの表示名を入力してください。</FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NameID</FormLabel>
                  <FormDescription>SAML 連携で使用する NameID を設定できます（任意）。</FormDescription>
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
                  <FormDescription>ログインに使用するメールアドレスを入力してください。</FormDescription>
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
                  <FormLabel>新しいパスワード</FormLabel>
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
                        <SelectValue />
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
                更新
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
