import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
  useSidebar,
} from "../ui/sidebar";
import Text from "../shared/text";
import { CreditCard, EllipsisVertical, HomeIcon, LogOut, User2, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { useCurrentUserMutators, useCurrentUserState } from "~/globalStates/user";
import type { Ok, UnprocessableEntityError, User } from "~/gen/api-client/models";
import SiteHeader from "./SiteHeader";
import { Logo, WideLogo } from "../shared/logo";
import { Link, Outlet, useMatches, useLocation, useNavigate } from "react-router";
import type { UIMatch, Location as RRLocation } from "react-router";
import { useDeleteSessions } from "~/gen/api-client/sessions/sessions";
import type { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

const SideBarLayout = () => {
  return (
    <SideBarLayoutComponent>
      <Outlet />
    </SideBarLayoutComponent>
  );
};

export default SideBarLayout;

type PageTitleGetter = (ctx: {
  params: Record<string, string | undefined>;
  data?: unknown;
  matches: UIMatch[];
  location: RRLocation;
}) => string;

type PageTitleHandle = {
  pageTitle?: string | PageTitleGetter;
};

const usePageTitle = () => {
  const matches = useMatches();
  const location = useLocation();
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const handle = match?.handle as PageTitleHandle | undefined;
    if (!handle?.pageTitle) continue;
    const pageTitle = handle.pageTitle;
    if (typeof pageTitle === "function") {
      const params = match.params as Record<string, string | undefined>;
      const title = pageTitle({ params, data: match.data, matches, location });
      if (title) return title;
    } else if (typeof pageTitle === "string" && pageTitle) {
      return pageTitle;
    }
  }
  return "Home";
};

const SideBarLayoutComponent = ({ children }: { children: React.ReactNode }) => {
  const pageTitle = usePageTitle();
  const user = useCurrentUserState();

  if (!user) {
    return children;
  }

  return (
    <SidebarProvider>
      <AppSideBar user={user} />
      <SidebarInset>
        <SiteHeader title={pageTitle} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

type SideBarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const AppSideBar = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const { setCurrentUserState } = useCurrentUserMutators();
  const { isMobile } = useSidebar();

  if (!user) {
    navigate("/signin");
  }

  const items: SideBarItem[] = [
    {
      title: "Home",
      url: "/",
      icon: HomeIcon,
    },
  ];
  const adminItems: SideBarItem[] = [
    {
      title: "ロール管理",
      url: "/admin/roles",
      icon: User2,
    },
  ];

  const { open } = useSidebar();
  const { trigger: mutateSignOut } = useDeleteSessions();
  const options = {
    onSuccess(data: AxiosResponse<Ok>) {
      toast.success(data.data.message);
      // NOTE: ログアウトして、ログイン画面に遷移させるまでの間に
      // globalStateが更新されないためglobalStateを手動でnullにする
      setCurrentUserState(null);
      navigate("/signin");
    },
    onError(err: AxiosError<UnprocessableEntityError, unknown>) {
      toast.error(err.response?.data.error || "ログアウトに失敗しました");
      navigate("/signin");
    },
  };

  const handleSignOut = () => {
    mutateSignOut(undefined, options);
  };
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/">{open ? <WideLogo className="w-full" /> : <Logo className="h-full" />}</Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>アプリ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user.role.permissionType === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>管理者設定</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="space-x-2 py-6">
                  <User2 />
                  <div>
                    <Text size="sm" className="truncate">
                      {user.profile.name}
                    </Text>
                    <Text type="description" className="text-xs truncate">
                      {user.emailAddress}
                    </Text>
                  </div>
                  <EllipsisVertical className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "top" : "right"}
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                sideOffset={3}
              >
                <DropdownMenuLabel>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.profile.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.emailAddress}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <User2 />
                    <span>アカウント</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    <span>支払い情報</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
