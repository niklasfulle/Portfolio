import {
  calculateStreaks,
  fallbackGithubStats,
  getGithubStats,
} from "@/lib/github-stats";

function jsonResponse(body: unknown): Response {
  return {
    json: async () => body,
    ok: true,
  } as Response;
}

function textResponse(body: string): Response {
  return {
    ok: true,
    text: async () => body,
  } as Response;
}

function failedResponse(status: number): Response {
  return { ok: false, status } as Response;
}

describe("GitHub statistics", () => {
  const originalFetch = globalThis.fetch;
  const originalGithubToken = process.env.GITHUB_TOKEN;

  beforeEach(() => {
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }
    if (originalGithubToken === undefined) {
      delete process.env.GITHUB_TOKEN;
    } else {
      process.env.GITHUB_TOKEN = originalGithubToken;
    }
    jest.restoreAllMocks();
  });

  it("calculates totals and current and longest contribution streaks", () => {
    expect(
      calculateStreaks([
        { date: "2026-09-01", count: 1 },
        { date: "2026-09-02", count: 2 },
        { date: "2026-09-03", count: 0 },
        { date: "2026-09-04", count: 1 },
      ])
    ).toEqual({
      totalContributions: 4,
      currentStreak: 1,
      longestStreak: 2,
      currentStreakDates: "Sep 4",
      longestStreakDates: "Sep 1 - Sep 2",
    });
  });

  it("handles a contribution calendar without activity", () => {
    expect(
      calculateStreaks([
        { date: "2026-09-01", count: 0 },
        { date: "2026-09-02", count: 0 },
      ])
    ).toEqual({
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentStreakDates: "No recent activity",
      longestStreakDates: "No activity",
    });
  });

  it("uses the safe fallback when GitHub cannot be reached", async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error("offline")) as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toEqual(fallbackGithubStats);
  });

  it("uses the fallback when the authenticated GraphQL request fails", async () => {
    process.env.GITHUB_TOKEN = "local-test-token";
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(failedResponse(401)) as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toEqual(fallbackGithubStats);
  });

  it("uses the fallback when GraphQL returns errors without data", async () => {
    process.env.GITHUB_TOKEN = "local-test-token";
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse({ errors: [{ message: "Forbidden" }] })) as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toEqual(fallbackGithubStats);
  });

  it("uses the fallback when the public repository request fails", async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(failedResponse(503)) as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toEqual(fallbackGithubStats);
  });

  it("uses the fallback when the public contribution page fails", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/repos?")) return jsonResponse([]);
      if (url.includes("search/")) return jsonResponse({ total_count: 0 });
      if (url.includes("/contributions?")) return failedResponse(503);

      throw new Error(`Unexpected URL: ${url}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toEqual(fallbackGithubStats);
  });

  it("builds live repository, activity and language statistics", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = decodeURIComponent(String(input));

      if (url.includes("/repos?")) {
        return jsonResponse([
          {
            fork: false,
            languages_url: "https://api.github.com/repos/niklasfulle/one/languages",
            stargazers_count: 5,
          },
          {
            fork: true,
            languages_url: "https://api.github.com/repos/niklasfulle/fork/languages",
            stargazers_count: 100,
          },
          {
            fork: false,
            languages_url: "https://api.github.com/repos/niklasfulle/two/languages",
            stargazers_count: 2,
          },
        ]);
      }

      if (url.includes("search/commits")) {
        return jsonResponse({ total_count: 12 });
      }

      if (url.includes("is:pr")) {
        return jsonResponse({ total_count: 7 });
      }

      if (url.includes("is:issue")) {
        return jsonResponse({ total_count: 9 });
      }

      if (url.includes("/contributions?")) {
        return textResponse(
          '<td data-date="2026-09-01" data-count="1"></td>' +
            '<td data-date="2026-09-02" data-count="2"></td>' +
            '<td data-date="2026-09-03" data-count="0"></td>' +
            '<td data-date="2026-09-04" data-count="1"></td>'
        );
      }

      if (url.endsWith("/one/languages")) {
        return jsonResponse({ TypeScript: 75, JavaScript: 25 });
      }

      if (url.endsWith("/two/languages")) {
        return jsonResponse({ TypeScript: 50, Python: 50 });
      }

      throw new Error(`Unexpected URL: ${url}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toMatchObject({
      stars: 7,
      commits: 12,
      pullRequests: 7,
      issues: 9,
      totalContributions: 4,
      currentStreak: 1,
      longestStreak: 2,
      currentStreakDates: "Sep 4",
      longestStreakDates: "Sep 1 - Sep 2",
      languages: [
        { name: "TypeScript", percentage: 62.5 },
        { name: "Python", percentage: 25 },
        { name: "JavaScript", percentage: 12.5 },
      ],
    });
    expect(fetchMock).toHaveBeenCalled();
  });

  it("uses the authenticated contribution calendar for historical totals", async () => {
    process.env.GITHUB_TOKEN = "local-test-token";
    const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/graphql")) {
        const body = JSON.parse(String(init?.body)) as {
          query: string;
        };

        if (body.query.includes("UserCreatedAt")) {
          return jsonResponse({ data: { user: { createdAt: "2026-09-01T00:00:00Z" } } });
        }

        if (body.query.includes("UserRepositories")) {
          const variables = JSON.parse(String(init?.body)) as {
            variables: { after: string | null };
          };

          if (variables.variables.after) {
            return jsonResponse({
              data: {
                user: {
                  repositories: {
                    nodes: [
                      {
                        isFork: false,
                        stargazerCount: 4,
                        languages: {
                          edges: [{ node: { name: "TypeScript" }, size: 25 }],
                        },
                      },
                    ],
                    pageInfo: { endCursor: null, hasNextPage: false },
                  },
                },
              },
            });
          }

          return jsonResponse({
            data: {
              user: {
                repositories: {
                  nodes: [
                    {
                      isFork: false,
                      stargazerCount: 11,
                      languages: {
                        edges: [
                          { node: { name: "TypeScript" }, size: 75 },
                          { node: { name: "Python" }, size: 25 },
                        ],
                      },
                    },
                  ],
                  pageInfo: { endCursor: "cursor-1", hasNextPage: true },
                },
              },
            },
          });
        }

        return jsonResponse({
          data: {
            user: {
              contributionsCollection: {
                contributionCalendar: {
                  weeks: [
                    {
                      contributionDays: [
                        { date: "2026-09-01", contributionCount: 400 },
                        { date: "2026-09-02", contributionCount: 300 },
                        { date: "2026-09-03", contributionCount: 200 },
                        { date: "2026-09-04", contributionCount: 100 },
                      ],
                    },
                  ],
                },
              },
            },
          },
        });
      }

      if (url.includes("/repos?")) return jsonResponse([]);
      if (url.includes("search/")) return jsonResponse({ total_count: 0 });

      throw new Error(`Unexpected URL: ${url}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toMatchObject({
      stars: 15,
      totalContributions: 1000,
      currentStreak: 4,
      currentStreakDates: "Sep 1 - Sep 4",
      longestStreak: 4,
      longestStreakDates: "Sep 1 - Sep 4",
      languages: [
        { name: "TypeScript", percentage: 80, bytes: 100, repositoryCount: 2 },
        { name: "Python", percentage: 20, bytes: 25, repositoryCount: 1 },
      ],
    });

    const graphqlCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/graphql")
    );
    expect(graphqlCalls.length).toBeGreaterThan(0);
    expect(
      graphqlCalls.every(([, init]) =>
        new Headers(init?.headers).get("Authorization") === "Bearer local-test-token"
      )
    ).toBe(true);

  });

  it("falls back when authenticated repository pagination has no cursor", async () => {
    process.env.GITHUB_TOKEN = "local-test-token";
    const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (!url.endsWith("/graphql")) return jsonResponse({ total_count: 0 });

      const body = JSON.parse(String(init?.body)) as { query: string };
      if (body.query.includes("UserRepositories")) {
        return jsonResponse({
          data: {
            user: {
              repositories: {
                nodes: [],
                pageInfo: { endCursor: null, hasNextPage: true },
              },
            },
          },
        });
      }

      return jsonResponse({
        data: {
          user: { createdAt: "2026-09-01T00:00:00Z" },
        },
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getGithubStats()).resolves.toEqual(fallbackGithubStats);
  });
});
