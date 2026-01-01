import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import Users from "~/core/admin/users";
import { Layout } from "../../../../helpers/Layout";
import { server } from "../../../../setupTests";
import { getGetUsersMockHandler } from "~/gen/api-client/adminuser-users/adminuser-users.msw";
import { getGetRolesMockHandler } from "~/gen/api-client/roles/roles.msw";
import { PermissionType } from "~/gen/api-client/models";

describe("Users", () => {
  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Layout>
          <Users />
        </Layout>
      </BrowserRouter>
    );
  };

  it("NameID列にユーザーのNameIDが表示され、存在しない場合はハイフンが表示されること", async () => {
    server.use(
      getGetUsersMockHandler({
        users: [
          {
            id: "user-1",
            emailAddress: "user1@example.com",
            nameId: "name-id-001",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            profile: { name: "ユーザー1" },
            role: { id: "role-1", name: "管理者", permissionType: PermissionType.admin },
          },
          {
            id: "user-2",
            emailAddress: "user2@example.com",
            nameId: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            profile: { name: "ユーザー2" },
            role: { id: "role-2", name: "メンバー", permissionType: PermissionType.general },
          },
        ],
      }),
      getGetRolesMockHandler({
        roles: [
          { id: "role-1", name: "管理者", permissionType: PermissionType.admin },
          { id: "role-2", name: "メンバー", permissionType: PermissionType.general },
        ],
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("ユーザー1")).toBeInTheDocument();
      expect(screen.getByText("ユーザー2")).toBeInTheDocument();
    });

    expect(screen.getByText("NameID")).toBeInTheDocument();
    expect(screen.getByText("name-id-001")).toBeInTheDocument();

    const user2Row = screen.getByText("ユーザー2").closest("tr");
    expect(user2Row).not.toBeNull();
    if (user2Row) {
      expect(within(user2Row).getByText("-")).toBeInTheDocument();
    }
  });
});
