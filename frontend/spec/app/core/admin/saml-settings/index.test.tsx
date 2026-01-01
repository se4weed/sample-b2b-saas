import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { Layout } from "../../../../helpers/Layout";
import SamlSettings from "~/core/admin/saml-settings";
import { server } from "../../../../setupTests";
import { getGetSamlSettingMockHandler, getPatchSamlSettingMockHandler } from "~/gen/api-client/saml-settings/saml-settings.msw";

describe("SamlSettings", () => {
  const userAction = userEvent.setup();

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Layout>
          <SamlSettings />
        </Layout>
      </BrowserRouter>
    );
  };

  it("APIから取得したSAML設定がフォームに表示されること", async () => {
    const samlSetting = {
      samlSetting: {
        entityId: "https://example.com/metadata",
        ssoUrl: "https://idp.example.com/sso",
        idpX509Certificate: "-----BEGIN CERTIFICATE-----",
      },
      serviceProvider: {
        entityId: "example",
        acsUrl: "https://app.test/auth/saml/example/acs",
        initiateUrl: "https://app.test/auth/saml/example",
      },
    };
    server.use(getGetSamlSettingMockHandler(samlSetting));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue("https://example.com/metadata")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("https://idp.example.com/sso")).toBeInTheDocument();
    expect(screen.getByDisplayValue("-----BEGIN CERTIFICATE-----")).toBeInTheDocument();
    expect(screen.getByText("example")).toBeInTheDocument();
    expect(screen.getByText("https://app.test/auth/saml/example/acs")).toBeInTheDocument();
    expect(screen.getByText("https://app.test/auth/saml/example")).toBeInTheDocument();
  });

  it("保存ボタンでSAML設定を更新できること", async () => {
    server.use(
      getGetSamlSettingMockHandler({
        samlSetting: {
          entityId: "https://example.com/metadata",
          ssoUrl: "https://idp.example.com/sso",
          idpX509Certificate: "-----BEGIN CERTIFICATE-----",
        },
        serviceProvider: {
          entityId: "example",
          acsUrl: "https://app.test/auth/saml/example/acs",
          initiateUrl: "https://app.test/auth/saml/example",
        },
      })
    );
    const patchSpy = vi.fn();
    server.use(
      getPatchSamlSettingMockHandler(async (info) => {
        const body = await info.request.json();
        patchSpy(body);
        return { message: "SAML設定を更新しました" };
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue("https://example.com/metadata")).toBeInTheDocument();
    });

    await userAction.clear(screen.getByLabelText("エンティティID"));
    await userAction.type(screen.getByLabelText("エンティティID"), "https://example.com/new");
    await userAction.clear(screen.getByLabelText("SSO URL"));
    await userAction.type(screen.getByLabelText("SSO URL"), "https://idp.example.com/new");
    await userAction.clear(screen.getByLabelText("IdP X.509証明書"));
    await userAction.type(screen.getByLabelText("IdP X.509証明書"), "CERT-DATA");

    await userAction.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith({
        entityId: "https://example.com/new",
        ssoUrl: "https://idp.example.com/new",
        idpX509Certificate: "CERT-DATA",
      });
    });
    await waitFor(() => {
      expect(screen.getByText("SAML設定を更新しました")).toBeInTheDocument();
    });
  });
});
