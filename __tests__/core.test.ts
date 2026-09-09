import { getAbout, getContactEmail, getExperience, getLearn, getProjects, getSkills } from "@/lib/db/functions";
import { getAsHTMLInputElement, shortToast } from "@/lib/helpers/shorter-function";
import { db } from "@/lib/db/prisma";
import { toast } from "@/components/ui/Toast";

jest.mock("@/lib/db/prisma", () => ({
  db: {
    aboutMe: { findMany: jest.fn() },
    projects: { findMany: jest.fn() },
    skills: { findMany: jest.fn() },
    experience: { findMany: jest.fn() },
    contactEmail: { findMany: jest.fn() },
  },
}));

jest.mock("@/components/ui/Toast", () => ({
  toast: jest.fn(),
}));

const mockedDb = db as unknown as {
  aboutMe: { findMany: jest.Mock };
  projects: { findMany: jest.Mock };
  skills: { findMany: jest.Mock };
  experience: { findMany: jest.Mock };
  contactEmail: { findMany: jest.Mock };
};

describe("database query helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [getAbout, "aboutMe", { where: { visible: true }, orderBy: { series: "asc" } }],
    [getProjects, "projects", { where: { visible: true }, orderBy: { series: "asc" } }],
    [getExperience, "experience", { where: { visible: true }, orderBy: { series: "asc" } }],
    [getContactEmail, "contactEmail", undefined],
  ])("returns data from %s", async (query, model, expectedArgs) => {
    const rows = [{ id: "1" }];
    mockedDb[model as keyof typeof mockedDb].findMany.mockResolvedValue(rows);

    await expect(query()).resolves.toBe(rows);
    if (expectedArgs) {
      expect(mockedDb[model as keyof typeof mockedDb].findMany).toHaveBeenCalledWith(expectedArgs);
    } else {
      expect(mockedDb[model as keyof typeof mockedDb].findMany).toHaveBeenCalledWith();
    }
  });

  it("loads skills and learning items with their type filter", async () => {
    mockedDb.skills.findMany.mockResolvedValue([]);

    await getSkills();
    expect(mockedDb.skills.findMany).toHaveBeenLastCalledWith({
      where: { visible: true, type: "skill" },
      orderBy: { series: "asc" },
    });

    await getLearn();
    expect(mockedDb.skills.findMany).toHaveBeenLastCalledWith({
      where: { visible: true, type: "learn" },
      orderBy: { series: "asc" },
    });
  });

});

describe("small helpers", () => {
  it("forwards toast arguments", () => {
    shortToast("Title", "Message", "success", 3000);
    expect(toast).toHaveBeenCalledWith({
      title: "Title",
      message: "Message",
      type: "success",
      duration: 3000,
    });
  });

  it("returns an input element by id", () => {
    const input = document.createElement("input");
    input.id = "email";
    document.body.append(input);

    expect(getAsHTMLInputElement("email")).toBe(input);
  });
});
