// import { describe, it, expect, vi } from "vitest";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { BrowserRouter } from "react-router";
// import { Layout as TestLayout } from "../../../helpers/Layout";
// import SideBarLayout from "~/components/layouts/SideBarLayout";

// // Mock root Layout to avoid network calls inside root Layout
// vi.mock("~/root", () => ({
//   Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="root-layout">{children}</div>,
// }));

// // Helper to mock current user state
// vi.mock("~/globalStates/user", async (orig) => {
//   const actual: any = await (orig as any);
//   return {
//     ...actual,
//     useCurrentUserState: vi.fn(),
//   };
// });

// describe("SideBarLayout", () => {
//   const userAction = userEvent.setup();

//   it("未ログイン時は children のみが表示されること", async () => {
//     const { useCurrentUserState } = await import("~/globalStates/user");
//     (useCurrentUserState as unknown as vi.Mock).mockReturnValue(null);

//     render(
//       <BrowserRouter>
//         <TestLayout>
//           <SideBarLayout>
//             <div>ChildContent</div>
//           </SideBarLayout>
//         </TestLayout>
//       </BrowserRouter>
//     );

//     expect(screen.getByText("ChildContent")).toBeInTheDocument();
//     expect(screen.queryByText("アプリ")).toBeNull();
//     expect(screen.queryByText("Home")).toBeNull();
//   });

//   it("ログイン時はサイドバーとヘッダーが表示されること", async () => {
//     const { useCurrentUserState } = await import("~/globalStates/user");
//     (useCurrentUserState as unknown as vi.Mock).mockReturnValue({
//       id: "u1",
//       emailAddress: "test@example.com",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       profile: { name: "太郎" },
//     });

//     render(
//       <BrowserRouter>
//         <TestLayout>
//           <SideBarLayout>
//             <div>ChildContent</div>
//           </SideBarLayout>
//         </TestLayout>
//       </BrowserRouter>
//     );

//     // SiteHeader title
//     await waitFor(() => {
//       expect(screen.getByText("Home")).toBeInTheDocument();
//     });

//     // Sidebar group label and Home menu item
//     expect(screen.getByText("アプリ")).toBeInTheDocument();
//     expect(screen.getByText("Home")).toBeInTheDocument();

//     // User name appears in footer button area
//     expect(screen.getByText("太郎")).toBeInTheDocument();

//     // children still rendered
//     expect(screen.getByText("ChildContent")).toBeInTheDocument();
//   });
// });
