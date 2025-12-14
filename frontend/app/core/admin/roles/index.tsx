import { LoaderCircle, SquareArrowDown, TriangleIcon } from "lucide-react";
import { useState } from "react";
import { Container } from "~/components/shared/container";
import Text from "~/components/shared/text";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { PermissionType, Role, User } from "~/gen/api-client/models";
import { useGetRoles } from "~/gen/api-client/roles/roles";
import { EditDialog } from "./EditDialog";
import { DeleteDialog } from "./DeleteDialog";
import { CreateDialog } from "./CreateDialog";

type Props = {
  user: User;
};

const Roles = ({ user }: Props) => {
  const { data, isLoading, mutate: mutateRoles } = useGetRoles();
  const roles = data?.data?.roles;
  const [targetRole, setTargetRole] = useState<Role>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleEdit = (role: Role) => {
    setTargetRole(role);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setTargetRole(role);
    setIsDeleteDialogOpen(true);
  };
  return (
    <Container className="space-y-4">
      <div className="flex items-end justify-between">
        <Text type="title">ロール一覧</Text>
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
          ロールの作成
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ロール名</TableHead>
            <TableHead>権限</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!roles || isLoading ? (
            <TableRow>
              <TableCell colSpan={3}>
                <LoaderCircle className="mx-auto animate-spin" />
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role: Role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{parsePermissionType(role.permissionType)}</TableCell>
                <TableCell>
                  <ActionButton role={role} handleEdit={handleEdit} handleDelete={handleDelete} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {targetRole && (
        <EditDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => setIsEditDialogOpen(open)}
          role={targetRole}
          mutateRoles={mutateRoles}
        />
      )}
      {targetRole && (
        <DeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => setIsDeleteDialogOpen(open)}
          role={targetRole}
          mutateRoles={mutateRoles}
        />
      )}
      <CreateDialog open={isCreateDialogOpen} onOpenChange={(open) => setIsCreateDialogOpen(open)} mutateRoles={mutateRoles} />
    </Container>
  );
};

export default Roles;

export const parsePermissionType = (permissionType: PermissionType) => {
  switch (permissionType) {
    case "admin":
      return "管理者";
    case "general":
      return "一般";
  }
};

type ActionButtonProps = {
  role: Role;
  handleEdit: (role: Role) => void;
  handleDelete: (role: Role) => void;
};

const ActionButton = ({ role, handleEdit, handleDelete }: ActionButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-1 h-full">
          <Text>操作</Text>
          <SquareArrowDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-20 p-0">
        <div className="w-full">
          <Button variant="ghost" className="w-full" onClick={() => handleEdit(role)}>
            編集
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => handleDelete(role)}>
            削除
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
