import { LoaderCircle, SquareArrowDown } from "lucide-react";
import { useState } from "react";
import { Container } from "~/components/shared/container";
import Text from "~/components/shared/text";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { Role, User } from "~/gen/api-client/models";
import { useGetRoles } from "~/gen/api-client/roles/roles";
import { useGetUsers } from "~/gen/api-client/adminuser-users/adminuser-users";
import { EditDialog } from "./EditDialog";
import { DeleteDialog } from "./DeleteDialog";
import { CreateDialog } from "./CreateDialog";
import { parsePermissionType } from "~/core/admin/roles";

const Users = () => {
  const { data, isLoading, mutate } = useGetUsers();
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRoles();
  const users = data?.data?.users ?? [];
  const roles = rolesResponse?.data?.roles ?? [];
  const [targetUser, setTargetUser] = useState<User>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const mutateUsers = () => {
    void mutate();
  };

  const handleEdit = (user: User) => {
    setTargetUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setTargetUser(user);
    setIsDeleteDialogOpen(true);
  };

  const isTableLoading = isLoading || isLoadingRoles;

  return (
    <Container className="space-y-4">
      <div className="flex items-end justify-between">
        <Text type="title">ユーザー一覧</Text>
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
          ユーザーの作成
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ユーザー名</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>ロール</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isTableLoading ? (
            <TableRow>
              <TableCell colSpan={4}>
                <LoaderCircle className="mx-auto animate-spin" />
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.profile.name}</TableCell>
                <TableCell>{user.emailAddress}</TableCell>
                <TableCell>
                  {user.role.name}（{parsePermissionType(user.role.permissionType)}）
                </TableCell>
                <TableCell>
                  <ActionButton user={user} handleEdit={handleEdit} handleDelete={handleDelete} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {targetUser && (
        <EditDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => setIsEditDialogOpen(open)}
          user={targetUser}
          roles={roles}
          mutateUsers={mutateUsers}
        />
      )}
      {targetUser && (
        <DeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => setIsDeleteDialogOpen(open)}
          user={targetUser}
          mutateUsers={mutateUsers}
        />
      )}
      <CreateDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => setIsCreateDialogOpen(open)}
        roles={roles}
        mutateUsers={mutateUsers}
      />
    </Container>
  );
};

export default Users;

type ActionButtonProps = {
  user: User;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
};

const ActionButton = ({ user, handleEdit, handleDelete }: ActionButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex h-full items-center space-x-1">
          <Text>操作</Text>
          <SquareArrowDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-20 p-0">
        <div className="w-full">
          <Button variant="ghost" className="w-full" onClick={() => handleEdit(user)}>
            編集
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => handleDelete(user)}>
            削除
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
