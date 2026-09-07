var mockPrismaClient = jest.fn();
var mockPrismaPg = jest.fn();

jest.mock("@prisma/client", () => ({ PrismaClient: mockPrismaClient }));
jest.mock("@prisma/adapter-pg", () => ({ PrismaPg: mockPrismaPg }));

describe("Prisma client setup", () => {
  const originalDatabaseUrl = process.env.POSTGRESQL_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.POSTGRESQL_URL = "postgresql://portfolio:test@db:5432/portfolio";
    mockPrismaPg.mockImplementation((options) => ({ options }));
    mockPrismaClient.mockImplementation((options) => ({ options }));
    (globalThis as { cachedPrisma?: unknown }).cachedPrisma = undefined;
  });

  afterAll(() => {
    if (originalDatabaseUrl === undefined) delete process.env.POSTGRESQL_URL;
    else process.env.POSTGRESQL_URL = originalDatabaseUrl;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  it("fails fast when the connection string is missing", () => {
    delete process.env.POSTGRESQL_URL;

    expect(() => {
      jest.isolateModules(() => {
        require("@/lib/db/prisma");
      });
    }).toThrow("POSTGRESQL_URL must be set");
  });

  it("creates a fresh client in production", () => {
    process.env.NODE_ENV = "production";

    let database: unknown;
    jest.isolateModules(() => {
      database = require("@/lib/db/prisma").db;
    });

    expect(mockPrismaPg).toHaveBeenCalledWith({
      connectionString: process.env.POSTGRESQL_URL,
    });
    expect(mockPrismaClient).toHaveBeenCalledWith({
      adapter: expect.objectContaining({
        options: { connectionString: process.env.POSTGRESQL_URL },
      }),
    });
    expect(database).toEqual({
      options: { adapter: expect.anything() },
    });
    expect((globalThis as { cachedPrisma?: unknown }).cachedPrisma).toBeUndefined();
  });

  it("caches one client during development", () => {
    process.env.NODE_ENV = "development";

    let firstDatabase: unknown;
    let secondDatabase: unknown;
    jest.isolateModules(() => {
      firstDatabase = require("@/lib/db/prisma").db;
      secondDatabase = require("@/lib/db/prisma").db;
    });

    expect(firstDatabase).toBe(secondDatabase);
    expect(mockPrismaClient).toHaveBeenCalledTimes(1);
    expect((globalThis as { cachedPrisma?: unknown }).cachedPrisma).toBe(firstDatabase);
  });
});
