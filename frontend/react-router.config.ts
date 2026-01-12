import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  // ルート配信なので basename は "/" に揃える
  basename: "/"
} satisfies Config;
