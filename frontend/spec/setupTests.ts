import { cleanup, configure } from "@testing-library/react";
import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

configure({ asyncUtilTimeout: 8000 });

export const server = setupServer();
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
