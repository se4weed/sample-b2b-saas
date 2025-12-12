import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  // アプリを "/frontend" 配下に配信しているため、
  // React Router 側でも basename を合わせる
  basename: "/frontend/"
} satisfies Config;
