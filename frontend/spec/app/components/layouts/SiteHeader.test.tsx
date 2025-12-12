// import { describe, it, expect, vi } from "vitest";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { BrowserRouter } from "react-router";
// import { server } from "../../../setupTests";
// import { Layout } from "../../../helpers/Layout";
// import SiteHeader from "~/components/layouts/SiteHeader";
// import { getDeleteSessionsMockHandler } from "~/gen/api-client/sessions/sessions.msw";
// import { HttpResponse, http } from "msw";
// import { getDeleteSessionsMutationKey } from "~/gen/api-client/sessions/sessions";

// const mockNavigate = vi.fn();
// vi.mock("react-router", async (orig) => {
//   const actual: any = await (orig as any)();
//   return {
//     ...actual,
//     useNavigate: () => mockNavigate,
//   };
// });

// describe("SiteHeader", () => {
//   const userAction = userEvent.setup();

//   it("ログアウトボタンでサインインへ遷移し、成功トーストが表示されること", async () => {
//     const mock = [getDeleteSessionsMockHandler({ message: "ログアウトしました" })];
//     server.use(...mock);

//     render(
//       <BrowserRouter>
//         <Layout>
//           <SiteHeader title="Dashboard" />
//         </Layout>
//       </BrowserRouter>
//     );

//     const buttons = screen.getAllByRole("button");
//     const logoutButton = buttons[buttons.length - 1];
//     await userAction.click(logoutButton);

//     await waitFor(() => {
//       expect(mockNavigate).toHaveBeenCalledWith("/signin");
//     });

//     await waitFor(() => {
//       expect(document.body.innerText).toContain("ログアウトしました");
//     });
//   });

//   it("APIエラー時にエラートーストが表示され、遷移しないこと", async () => {
//     const mockKey = getDeleteSessionsMutationKey()[0];
//     const errorBody = { error: "エラーが発生しました。" };
//     const mock = [
//       http.delete(mockKey, async () =>
//         new HttpResponse(JSON.stringify(errorBody), {
//           status: 422,
//           headers: { "Content-Type": "application/json" },
//         })
//       ),
//     ];
//     server.use(...mock);

//     render(
//       <BrowserRouter>
//         <Layout>
//           <SiteHeader title="Dashboard" />
//         </Layout>
//       </BrowserRouter>
//     );

//     const buttons = screen.getAllByRole("button");
//     const logoutButton = buttons[buttons.length - 1];
//     await userAction.click(logoutButton);

//     await waitFor(() => {
//       expect(document.body.innerText).toContain("エラーが発生しました。");
//     });

//     expect(mockNavigate).not.toHaveBeenCalled();
//   });
// });
