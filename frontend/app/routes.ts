import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("components/layouts/SideBarLayout.tsx", [
    index("routes/home.tsx"),
    route("/account", "routes/account.tsx"),
    route("/admin/users", "routes/admin/users.tsx"),
    route("/admin/roles", "routes/admin/roles.tsx"),
  ]),
  route("/about", "routes/about.tsx"),
  route("/signin", "routes/signin.tsx"),
  route("/terms-of-service", "routes/terms-of-service.tsx"),
  route("/privacy-policy", "routes/privacy-policy.tsx"),
  route("/password-resets", "routes/password-resets.tsx"),
  route("/password-resets/:token", "routes/password-reset.tsx"),
] satisfies RouteConfig;
