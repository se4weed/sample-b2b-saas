import type { AxiosError, AxiosResponse } from "axios";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import Text from "~/components/shared/text";
import { FieldSet } from "~/components/shared/fieldset";
import { Caution } from "~/components/shared/caution";
import type { Ok, UnprocessableEntityError, User } from "~/gen/api-client/models";
import { useDeleteUser } from "~/gen/api-client/adminuser-user/adminuser-user";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  mutateUsers: () => void;
};

export const DeleteDialog = ({ open, onOpenChange, user, mutateUsers }: Props) => {
  const mutationOptions = {
    onSuccess(response: AxiosResponse<Ok>) {
      toast.success(response.data.message);
      mutateUsers();
      onOpenChange(false);
    },
    onError(error: AxiosError<UnprocessableEntityError>) {
      if (error.response) {
        toast.error(error.response.data?.error || `ユーザーの削除に失敗しました。（${error.response.status}）`);
      } else {
        toast.error("予期せぬエラーが発生しました。");
      }
    },
  };

  const { trigger, isMutating } = useDeleteUser({ userId: user.id }, { swr: mutationOptions });

  const handleDelete = () => {
    trigger();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ユーザーの削除</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Text>本当にこのユーザーを削除しますか？</Text>
          <div className="space-y-2">
            <FieldSet title="ユーザー名">
              <Text size="sm">{user.profile.name}</Text>
            </FieldSet>
            <FieldSet title="メールアドレス">
              <Text size="sm">{user.emailAddress}</Text>
            </FieldSet>
          </div>
          <Caution>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                <Text size="sm">削除したユーザーは元に戻せません。</Text>
              </li>
            </ul>
          </Caution>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleDelete} disabled={isMutating}>
              削除
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
