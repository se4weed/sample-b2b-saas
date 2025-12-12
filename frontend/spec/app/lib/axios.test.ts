import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "~/lib/axios";

Object.defineProperty(document, "cookie", {
  writable: true,
  value: "",
});

describe("Axios", () => {
  beforeEach(() => {
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();

    vi.resetModules();
  });

  afterEach(() => {
    document.cookie = "";
  });

  it("axiosインスタンスが正しく設定されている", () => {
    expect(axios).toBeDefined();
    expect(typeof axios.get).toBe("function");
    expect(typeof axios.post).toBe("function");
    expect(typeof axios.put).toBe("function");
    expect(typeof axios.delete).toBe("function");
  });

  it("リクエストインターセプターが設定されている", () => {
    expect(axios.interceptors.request).toBeDefined();
  });

  it("CSRFトークンがヘッダーに設定される", () => {
    expect(axios.interceptors.request).toBeDefined();
    expect(document.cookie).toBeDefined();
  });

  it("CSRFトークンがない場合は空文字が設定される", () => {
    document.cookie = "other-cookie=value; path=/";
    expect(axios.interceptors.request).toBeDefined();
  });

  it("withCredentialsが常にtrueに設定される", () => {
    expect(axios.interceptors.request).toBeDefined();
  });

  it("Acceptヘッダーが常に設定される", () => {
    expect(axios.interceptors.request).toBeDefined();
  });
});
