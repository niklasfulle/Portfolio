import { links } from "@/lib/data";

describe("navigation links", () => {
  it("contains the portfolio sections in display order", () => {
    expect(links.map((link) => link.name)).toEqual([
      "Home",
      "About",
      "Projects",
      "Skills",
      "Experience",
      "Contact",
    ]);
  });

  it("uses section anchors for every link", () => {
    expect(links.every((link) => link.hash.startsWith("/#"))).toBe(true);
  });
});
