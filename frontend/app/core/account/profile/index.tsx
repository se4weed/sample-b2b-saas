import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Text from "~/components/shared/text";
import type { Ok, UnprocessableEntityError, User, UserResponse } from "~/gen/api-client/models";
import { Schema } from "./schema.zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { CircleCheck, Pencil } from "lucide-react";
import { usePatchUserProfile } from "~/gen/api-client/user/user";
import { toast } from "sonner";
import type { AxiosError, AxiosResponse } from "axios";
import { useCurrentUserMutators } from "~/globalStates/user";
import { useGetUsersMe } from "~/gen/api-client/users/users";

type Props = {
  user: User;
};

const AccountProfile = ({ user }: Props) => {
  return (
    <div className="space-y-4">
      <Text type="subTitle">アカウント情報</Text>
      <Card>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountProfile;

const ProfileForm = ({ user }: { user: User }) => {
  const { setCurrentUserState } = useCurrentUserMutators();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const form = useForm<z.infer<typeof Schema>>({
    defaultValues: {
      name: user.profile.name,
    },
    resolver: zodResolver(Schema),
  });

  const meMutateOptions = {
    onSuccess(data: AxiosResponse<UserResponse>) {
      setCurrentUserState(data.data.user!);
    },
  };
  const { mutate: meMutate } = useGetUsersMe({ swr: meMutateOptions });

  const options = {
    onSuccess(data: AxiosResponse<Ok>) {
      toast.success(data.data.message ?? "プロフィールを更新しました");
      meMutate();
      setIsEditMode(false);
    },
    onError(err: AxiosError<UnprocessableEntityError, unknown>) {
      toast.error(err.response?.data.error ?? "プロフィールの更新に失敗しました");
    },
  };
  const { trigger } = usePatchUserProfile();

  const onSubmit = (values: z.infer<typeof Schema>) => {
    trigger({ name: values.name }, options);
  };

  return (
    <div className="flex justify-between">
      <Form {...form}>
        <form className="flex justify-between gap-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>ユーザー名</Label>
                  {isEditMode ? (
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  ) : (
                    <div className="h-9 px-3 py-2">
                      <Text size="sm">{field.value}</Text>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditMode && (
              <Button variant="outline">
                <CircleCheck className="w-4 h-4 text-emerald-500" />
                更新
              </Button>
            )}
          </div>
        </form>
      </Form>
      <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)}>
        {isEditMode ? (
          <>取り消し</>
        ) : (
          <>
            <Pencil className="w-4 h-4" />
            編集
          </>
        )}
      </Button>
    </div>
  );
};
