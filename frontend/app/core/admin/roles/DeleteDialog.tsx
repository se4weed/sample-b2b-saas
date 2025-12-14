import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import type { Ok, Role, UnprocessableEntityError } from '~/gen/api-client/models';
import { Button } from '~/components/ui/button';
import type { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { Caution } from '~/components/shared/caution';
import { useDeleteRole } from '~/gen/api-client/role/role';
import Text from '~/components/shared/text';
import { FieldSet } from '~/components/shared/fieldset';
import { parsePermissionType } from '.';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  mutateRoles: () => void;
}
export const DeleteDialog = ({ open, onOpenChange, role, mutateRoles }: Props) => {
  const options = {
    onSuccess(data: AxiosResponse<Ok>) {
      onOpenChange(false);
      toast.success(data.data.message);
      mutateRoles();
    },
    onError(error: AxiosError<UnprocessableEntityError, unknown>) {
      if (error.response) {
        toast.error(error?.response?.data?.error || `ロールの作成に失敗しました。（${error.response.status}）`);
      } else {
        toast.error("予期せぬエラーが発生しました。");
      }
    },
  }
  const { trigger } = useDeleteRole({ roleId: role.id }, { swr: options });

  const handleSubmit = () => {
    trigger();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ロールの削除</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Text>本当にこのロールを削除しますか？</Text>
          <div className='space-y-2'>
            <FieldSet title="ロール名">
              <Text size='sm'>{role.name}</Text>
            </FieldSet>
            <FieldSet title="権限">
              <Text size='sm'>{parsePermissionType(role.permissionType)}</Text>
            </FieldSet>
          </div>
        </div>
        <Caution>
          <ul className='list-disc ml-6'>
            <li>
              <Text size='sm'>ユーザーがこのロールを使用している場合、削除できません。</Text>
            </li>
            <li>
              <Text size='sm'>この操作は取り消せません。</Text>
            </li>
          </ul>
        </Caution>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSubmit}>削除</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
