import { describe, it, expect } from "vitest";
import { cn } from "~/lib/utils";

describe("utils", () => {
  describe("cn関数", () => {
    it("単一のクラス名を正しく処理する", () => {
      expect(cn("test-class")).toBe("test-class");
    });

    it("複数のクラス名を結合する", () => {
      expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3");
    });

    it("条件付きクラス名を正しく処理する", () => {
      expect(cn("base", true && "conditional", false && "hidden")).toBe("base conditional");
    });

    it("オブジェクト形式のクラス名を処理する", () => {
      expect(
        cn({
          active: true,
          disabled: false,
          primary: true,
        })
      ).toBe("active primary");
    });

    it("配列形式のクラス名を処理する", () => {
      expect(cn(["class1", "class2"], ["class3"])).toBe("class1 class2 class3");
    });

    it("Tailwind CSSの競合するクラスをマージする", () => {
      expect(cn("px-2 py-1 px-3")).toBe("py-1 px-3");
      expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
    });

    it("undefinedやnullを無視する", () => {
      expect(cn("valid", undefined, null, "also-valid")).toBe("valid also-valid");
    });

    it("空文字列を無視する", () => {
      expect(cn("valid", "", "also-valid")).toBe("valid also-valid");
    });

    it("複雑な組み合わせを正しく処理する", () => {
      const result = cn(
        "base-class",
        {
          active: true,
          disabled: false,
        },
        ["array-class"],
        true && "conditional",
        undefined,
        "final-class"
      );
      expect(result).toBe("base-class active array-class conditional final-class");
    });

    it("引数なしで呼び出した場合は空文字を返す", () => {
      expect(cn()).toBe("");
    });

    it("同じプロパティの異なる値を持つTailwindクラスを適切にマージする", () => {
      expect(cn("p-2", "p-4")).toBe("p-4");

      expect(cn("m-1", "mx-2")).toBe("m-1 mx-2");

      expect(cn("bg-red-500", "bg-blue-600")).toBe("bg-blue-600");
    });

    it("異なるプロパティのTailwindクラスは保持する", () => {
      expect(cn("p-2", "m-4", "text-red-500", "bg-blue-600")).toBe("p-2 m-4 text-red-500 bg-blue-600");
    });
  });
});
