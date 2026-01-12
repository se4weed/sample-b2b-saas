import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";

import SamlLoginDialog from "~/core/signin/SamlLoginDialog";
import { server } from "../../../setupTests";
import { Layout } from "../../../helpers/Layout";

describe("SamlLoginDialog", () => {
  const userAction = userEvent.setup();

  afterEach(() => {
    server.resetHandlers();
  });

  it("ダイアログが表示されること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SamlLoginDialog open={true} onOpenChange={vi.fn()} />
        </Layout>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "SAMLでログイン" })).toBeInTheDocument();
      expect(screen.getByText("SAMLでログインするには、会社コードを入力してください。")).toBeInTheDocument();
      expect(screen.getByLabelText("会社コード")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "SAMLでログイン" })).toBeInTheDocument();
    });
  });

  it("会社コードを入力するとリンク先が更新されること", async () => {
    render(
      <BrowserRouter>
        <Layout>
          <SamlLoginDialog open={true} onOpenChange={vi.fn()} />
        </Layout>
      </BrowserRouter>
    );

    const companyCodeInput = screen.getByLabelText("会社コード");
    await userAction.type(companyCodeInput, "acme");

    await waitFor(() => {
      const samlLink = screen.getByRole("link", { name: "SAMLでログイン" });
      expect(samlLink).toHaveAttribute("href", "/signin/acme");
    });
  });

  it("閉じるボタンを押すとダイアログが閉じること", async () => {
    const onOpenChange = vi.fn();

    render(
      <BrowserRouter>
        <Layout>
          <SamlLoginDialog open={true} onOpenChange={onOpenChange} />
        </Layout>
      </BrowserRouter>
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    await userAction.click(closeButton);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
