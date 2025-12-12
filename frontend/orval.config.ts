import { defineConfig } from "orval";


export default defineConfig({
  frontend: {
    input: {
      target: "../openapi/merged/openapi/openapi.yaml",
    },
    output: {
      mode: "tags-split",
      target: "app/gen/api-client",
      schemas: "app/gen/api-client/models",
      baseUrl: "",
      client: "swr",
      prettier: true,
      clean: true,
      mock: {
        type: "msw",
        delay: false,
      },
      override: {
        swr: {
          swrMutationOptions: {
            throwOnError: false,
          },
        },
        useNamedParameters: true,
      },
    },
    hooks: {
      afterAllFilesWrite: "pnpm lint-fix:eslint",
    },
  },
});
