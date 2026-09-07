import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
  });

  it("filters conditional classes", () => {
    expect(cn("flex", false && "hidden", undefined, "items-center")).toBe(
      "flex items-center"
    );
  });
});
