export type GithubLanguageStat = {
  name: string;
  percentage: number;
  color: string;
  bytes?: number;
  repositoryCount?: number;
};

export type GithubStatsData = {
  stars: number;
  commits: number;
  pullRequests: number;
  issues: number;
  grade: string;
  gradeScore: number;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionStart: string;
  currentStreakDates: string;
  longestStreakDates: string;
  languages: GithubLanguageStat[];
};

type GithubRepository = {
  fork: boolean;
  stargazers_count: number;
  languages_url?: string;
  languageBytes?: Record<string, number>;
};

type GithubSearchResult = {
  total_count: number;
};

type ContributionDay = {
  date: string;
  count: number;
};

type StreakRange = {
  length: number;
  start: string;
  end: string;
};

type GithubGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type GithubContributionCalendar = {
  weeks: Array<{
    contributionDays: Array<{
      date: string;
      contributionCount: number;
    }>;
  }>;
};

type GithubUserCreatedAtResponse = {
  user: {
    createdAt: string;
  } | null;
};

type GithubUserContributionResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: GithubContributionCalendar;
    };
  } | null;
};

type GithubUserRepositoriesResponse = {
  user: {
    repositories: {
      nodes: Array<{
        isFork: boolean;
        stargazerCount: number;
        languages: {
          edges: Array<{
            size: number;
            node: {
              name: string;
            };
          }>;
        };
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  } | null;
};

const username = process.env.GITHUB_USERNAME ?? "niklasfulle";
const fallbackLanguages: GithubLanguageStat[] = [
  { name: "TypeScript", percentage: 61.87, color: "#3178c6" },
  { name: "Python", percentage: 9.89, color: "#3572a5" },
  { name: "C#", percentage: 5.94, color: "#68217a" },
  { name: "JavaScript", percentage: 5.64, color: "#f1e05a" },
  { name: "Java", percentage: 5.12, color: "#b07219" },
  { name: "CSS", percentage: 3.6, color: "#563d7c" },
  { name: "HTML", percentage: 3.05, color: "#e34c26" },
  { name: "PHP", percentage: 2.72, color: "#4f5d95" },
  { name: "PowerShell", percentage: 0.68, color: "#012456" },
  { name: "Shell", percentage: 0.6, color: "#89e051" },
  { name: "C", percentage: 0.25, color: "#555555" },
  { name: "Lua", percentage: 0.23, color: "#000080" },
  { name: "C++", percentage: 0.13, color: "#f34b7d" },
  { name: "Jinja", percentage: 0.11, color: "#a52a22" },
  { name: "PLpgSQL", percentage: 0.07, color: "#336790" },
  { name: "Haskell", percentage: 0.05, color: "#5e5086" },
  { name: "HCL", percentage: 0.03, color: "#844fba" },
  { name: "Dockerfile", percentage: 0, color: "#384d54" },
];

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Java: "#b07219",
  "C#": "#68217a",
  "C++": "#f34b7d",
  PHP: "#4f5d95",
  Shell: "#89e051",
  PowerShell: "#012456",
};

export const fallbackGithubStats: GithubStatsData = {
  stars: 37,
  commits: 81,
  pullRequests: 23,
  issues: 70,
  grade: "B-",
  gradeScore: 72,
  totalContributions: 1139,
  currentStreak: 2,
  longestStreak: 69,
  contributionStart: "Mar 2, 2018 - Present",
  currentStreakDates: "Sep 5 - Sep 6",
  longestStreakDates: "Jul 15, 2023 - Sep 21, 2023",
  languages: fallbackLanguages,
};

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "niklasfulle-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchGithubGraphql<T>(
  query: string,
  variables: Record<string, string | null>
): Promise<T> {
  const response = await fetch("https://api.github.com/graphql", {
    body: JSON.stringify({ query, variables }),
    headers: {
      ...githubHeaders(),
      "Content-Type": "application/json",
    },
    method: "POST",
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with ${response.status}`);
  }

  const payload = (await response.json()) as GithubGraphqlResponse<T>;

  if (payload.errors?.length || !payload.data) {
    throw new Error(payload.errors?.[0]?.message ?? "GitHub GraphQL response was empty");
  }

  return payload.data;
}

async function fetchGithubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchGithubText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`GitHub contribution request failed with ${response.status}`);
  }

  return response.text();
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatContributionDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function formatContributionRange(start: string, end: string) {
  if (!start || !end) return "";
  if (start === end) return formatContributionDate(start);
  return `${formatContributionDate(start)} - ${formatContributionDate(end)}`;
}

function emptyStreakRange(): StreakRange {
  return { length: 0, start: "", end: "" };
}

function findLongestStreak(days: ContributionDay[]): StreakRange {
  let longest = emptyStreakRange();
  let current = emptyStreakRange();

  for (const day of days) {
    if (day.count === 0) {
      current = emptyStreakRange();
      continue;
    }

    const start = current.length > 0 ? current.start : day.date;
    current = { length: current.length + 1, start, end: day.date };
    if (current.length > longest.length) longest = current;
  }

  return longest;
}

function findCurrentStreak(days: ContributionDay[]): StreakRange {
  let current = emptyStreakRange();

  for (const day of [...days].reverse()) {
    if (day.count === 0 && current.length > 0) break;
    if (day.count === 0) continue;

    current = {
      length: current.length + 1,
      start: day.date,
      end: current.end || day.date,
    };
  }

  return current;
}

export function calculateStreaks(days: ContributionDay[]) {
  const longest = findLongestStreak(days);
  const current = findCurrentStreak(days);

  return {
    totalContributions: days.reduce((total, day) => total + day.count, 0),
    currentStreak: current.length,
    longestStreak: longest.length,
    currentStreakDates:
      current.length > 0
        ? formatContributionRange(current.start, current.end)
        : "No recent activity",
    longestStreakDates:
      longest.length > 0
        ? formatContributionRange(longest.start, longest.end)
        : "No activity",
  };
}

function parseContributionDays(html: string): ContributionDay[] {
  const days: ContributionDay[] = [];
  const pattern = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"/g;

  for (const match of html.matchAll(pattern)) {
    days.push({ date: match[1], count: Number(match[2]) });
  }

  return days;
}

function buildLanguageStats(
  languageTotals: Map<string, number>,
  languageRepositoryCounts: Map<string, number>
) {
  const total = [...languageTotals.values()].reduce((sum, value) => sum + value, 0);

  if (total === 0) return fallbackLanguages;

  return [...languageTotals.entries()]
    .sort(([, first], [, second]) => second - first)
    .slice(0, 18)
    .map(([name, bytes]) => ({
      name,
      percentage: Number(((bytes / total) * 100).toFixed(2)),
      color: languageColors[name] ?? "#64748b",
      bytes,
      repositoryCount: languageRepositoryCounts.get(name) ?? 0,
    }));
}

async function getContributionStatsFromHtml() {
  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setDate(today.getDate() - 365);
  const url = `https://github.com/users/${username}/contributions?from=${dateOnly(yearAgo)}&to=${dateOnly(today)}`;
  const days = parseContributionDays(await fetchGithubText(url));

  return days.length > 0 ? calculateStreaks(days) : null;
}

const createdAtQuery = `
  query UserCreatedAt($login: String!) {
    user(login: $login) {
      createdAt
    }
  }
`;

const contributionCalendarQuery = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(
        from: $from
        to: $to
      ) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

async function getAuthenticatedContributionStats() {
  const profile = await fetchGithubGraphql<GithubUserCreatedAtResponse>(
    createdAtQuery,
    { login: username }
  );

  if (!profile.user) throw new Error("GitHub user was not found");

  const today = new Date();
  const cursor = new Date(`${dateOnly(new Date(profile.user.createdAt))}T00:00:00.000Z`);
  const daysByDate = new Map<string, ContributionDay>();

  while (cursor <= today) {
    const intervalEnd = new Date(cursor);
    intervalEnd.setUTCFullYear(intervalEnd.getUTCFullYear() + 1);
    intervalEnd.setUTCDate(intervalEnd.getUTCDate() - 1);
    const end = new Date(Math.min(intervalEnd.getTime(), today.getTime()));
    const contributionData =
      await fetchGithubGraphql<GithubUserContributionResponse>(
        contributionCalendarQuery,
        {
          from: cursor.toISOString(),
          login: username,
          to: end.toISOString(),
        }
      );

    if (!contributionData.user) throw new Error("GitHub user was not found");

    for (const week of contributionData.user.contributionsCollection.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        daysByDate.set(day.date, {
          count: day.contributionCount,
          date: day.date,
        });
      }
    }

    cursor.setTime(end.getTime());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const days = [...daysByDate.values()].sort((first, second) =>
    first.date.localeCompare(second.date)
  );

  return days.length > 0 ? calculateStreaks(days) : null;
}

async function getContributionStats() {
  if (!process.env.GITHUB_TOKEN) return getContributionStatsFromHtml();

  return getAuthenticatedContributionStats();
}

const repositoriesQuery = `
  query UserRepositories($login: String!, $after: String) {
    user(login: $login) {
      repositories(
        first: 100
        after: $after
        ownerAffiliations: OWNER
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        nodes {
          isFork
          stargazerCount
          languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

async function getAuthenticatedRepositories(): Promise<GithubRepository[]> {
  const repositories: GithubRepository[] = [];
  let after: string | null = null;

  while (true) {
    const response: GithubUserRepositoriesResponse = await fetchGithubGraphql<GithubUserRepositoriesResponse>(
      repositoriesQuery,
      { after, login: username }
    );

    if (!response.user) throw new Error("GitHub user was not found");

    repositories.push(
      ...response.user.repositories.nodes.map((repository) => ({
        fork: repository.isFork,
        languageBytes: Object.fromEntries(
          repository.languages.edges.map((language) => [
            language.node.name,
            language.size,
          ])
        ),
        stargazers_count: repository.stargazerCount,
      }))
    );

    if (!response.user.repositories.pageInfo.hasNextPage) break;

    after = response.user.repositories.pageInfo.endCursor;
    if (!after) throw new Error("GitHub repository pagination cursor was empty");
  }

  return repositories;
}

async function getRepositories() {
  if (process.env.GITHUB_TOKEN) return getAuthenticatedRepositories();

  return fetchGithubJson<GithubRepository[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
  );
}

export async function getGithubStats(): Promise<GithubStatsData> {
  try {
    const yearAgo = new Date();
    yearAgo.setDate(yearAgo.getDate() - 365);
    const since = dateOnly(yearAgo);
    const [repositories, commits, pullRequests, issues, contributionStats] =
      await Promise.all([
        getRepositories(),
        fetchGithubJson<GithubSearchResult>(
          `https://api.github.com/search/commits?q=author:${username}+committer-date:>=${since}&per_page=1`
        ),
        fetchGithubJson<GithubSearchResult>(
          `https://api.github.com/search/issues?q=author:${username}+is:pr&per_page=1`
        ),
        fetchGithubJson<GithubSearchResult>(
          `https://api.github.com/search/issues?q=author:${username}+is:issue&per_page=1`
        ),
        getContributionStats(),
      ]);

    const ownedRepositories = repositories.filter((repository) => !repository.fork);
    const languageResponses = process.env.GITHUB_TOKEN
      ? ownedRepositories.map((repository) => repository.languageBytes ?? {})
      : await Promise.all(
          ownedRepositories.map((repository) =>
            fetchGithubJson<Record<string, number>>(repository.languages_url ?? "")
          )
        );
    const languageTotals = new Map<string, number>();
    const languageRepositoryCounts = new Map<string, number>();

    for (const languageResponse of languageResponses) {
      for (const [name, bytes] of Object.entries(languageResponse)) {
        languageTotals.set(name, (languageTotals.get(name) ?? 0) + bytes);
        languageRepositoryCounts.set(
          name,
          (languageRepositoryCounts.get(name) ?? 0) + 1
        );
      }
    }

    const calculatedContributions = contributionStats ?? {
      totalContributions: commits.total_count,
      currentStreak: 0,
      longestStreak: 0,
      currentStreakDates: "Recent activity",
      longestStreakDates: "No contribution calendar",
    };

    return {
      ...fallbackGithubStats,
      stars: ownedRepositories.reduce(
        (total, repository) => total + repository.stargazers_count,
        0
      ),
      commits: commits.total_count,
      pullRequests: pullRequests.total_count,
      issues: issues.total_count,
      totalContributions: calculatedContributions.totalContributions,
      currentStreak: calculatedContributions.currentStreak,
      longestStreak: calculatedContributions.longestStreak,
      currentStreakDates: calculatedContributions.currentStreakDates,
      longestStreakDates: calculatedContributions.longestStreakDates,
      languages: buildLanguageStats(languageTotals, languageRepositoryCounts),
    };
  } catch (error) {
    console.error(
      "GitHub statistics request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return fallbackGithubStats;
  }
}
