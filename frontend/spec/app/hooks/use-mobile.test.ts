import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "~/hooks/use-mobile";

const mockMatchMedia = vi.fn();

describe("useIsMobile", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では未定義が返される", () => {
    const { result } = renderHook(() => useIsMobile());

    expect(typeof result.current).toBe("boolean");
  });

  it("デスクトップサイズの画面でfalseを返す", () => {
    window.innerWidth = 1024;

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("モバイルサイズの画面でtrueを返す", () => {
    window.innerWidth = 400;

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("ブレークポイント境界値を正しく処理する", () => {
    window.innerWidth = 767;
    const { result: mobileResult } = renderHook(() => useIsMobile());
    expect(mobileResult.current).toBe(true);

    window.innerWidth = 768;
    const { result: desktopResult } = renderHook(() => useIsMobile());
    expect(desktopResult.current).toBe(false);
  });

  it("matchMediaが正しいクエリで呼び出される", () => {
    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("イベントリスナーが適切に設定・削除される", () => {
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();

    mockMatchMedia.mockReturnValue({
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const { unmount } = renderHook(() => useIsMobile());

    expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("画面サイズ変更時に状態が更新される", () => {
    let changeHandler: () => void = () => {};

    mockMatchMedia.mockReturnValue({
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn((event, handler) => {
        if (event === "change") {
          changeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
    });

    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 400;
      changeHandler();
    });

    expect(result.current).toBe(true);
  });

  it("undefinedの場合でも真偽値を返す", () => {
    const { result } = renderHook(() => useIsMobile());

    expect(typeof result.current).toBe("boolean");
  });
});
