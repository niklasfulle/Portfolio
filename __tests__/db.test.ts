var mockDb;

jest.mock("@/lib/db/prisma", () => {
  mockDb = {
    aboutMe: { findMany: jest.fn() },
    projects: { findMany: jest.fn() },
    skills: { findMany: jest.fn() },
    experience: { findMany: jest.fn() },
    contactEmail: { findMany: jest.fn() },
    user: { findUnique: jest.fn() },
  };
  return { db: mockDb };
});

import {
  getAbout,
  getContactEmail,
  getExperience,
  getLearn,
  getProjects,
  getSkills,
} from "@/lib/db/functions";
import { getUser, getUserWithouPassword } from "@/lib/db/user-functions";

describe("database read functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads visible about text ordered by series", async () => {
    const rows = [{ id: "about-1" }];
    mockDb.aboutMe.findMany.mockResolvedValue(rows);

    await expect(getAbout()).resolves.toBe(rows);
    expect(mockDb.aboutMe.findMany).toHaveBeenCalledWith({
      where: { visible: true },
      orderBy: { series: "asc" },
    });
  });

  it("loads visible projects ordered by series", async () => {
    const rows = [{ id: "project-1" }];
    mockDb.projects.findMany.mockResolvedValue(rows);

    await expect(getProjects()).resolves.toBe(rows);
    expect(mockDb.projects.findMany).toHaveBeenCalledWith({
      where: { visible: true },
      orderBy: { series: "asc" },
    });
  });

  it("separates visible skills from visible learning topics", async () => {
    const skills = [{ id: "skill-1" }];
    const learn = [{ id: "learn-1" }];
    mockDb.skills.findMany
      .mockResolvedValueOnce(skills)
      .mockResolvedValueOnce(learn);

    await expect(getSkills()).resolves.toBe(skills);
    await expect(getLearn()).resolves.toBe(learn);
    expect(mockDb.skills.findMany).toHaveBeenNthCalledWith(1, {
      where: { visible: true, type: "skill" },
      orderBy: { series: "asc" },
    });
    expect(mockDb.skills.findMany).toHaveBeenNthCalledWith(2, {
      where: { visible: true, type: "learn" },
      orderBy: { series: "asc" },
    });
  });

  it("loads visible experience and all contact email records", async () => {
    const experience = [{ id: "experience-1" }];
    const contactEmails = [{ id: "email-1", email: "test@example.com" }];
    mockDb.experience.findMany.mockResolvedValue(experience);
    mockDb.contactEmail.findMany.mockResolvedValue(contactEmails);

    await expect(getExperience()).resolves.toBe(experience);
    await expect(getContactEmail()).resolves.toBe(contactEmails);
    expect(mockDb.experience.findMany).toHaveBeenCalledWith({
      where: { visible: true },
      orderBy: { series: "asc" },
    });
    expect(mockDb.contactEmail.findMany).toHaveBeenCalledWith();
  });

  it("loads a user by email", async () => {
    const user = { id: "user-1", email: "test@example.com", password: "hash" };
    mockDb.user.findUnique.mockResolvedValue(user);

    await expect(getUser(user.email)).resolves.toBe(user);
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it("loads a user with only public profile fields", async () => {
    const user = { id: "user-1", email: "test@example.com", name: "Test" };
    mockDb.user.findUnique.mockResolvedValue(user);

    await expect(getUserWithouPassword(user.email)).resolves.toBe(user);
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });
  });
});
