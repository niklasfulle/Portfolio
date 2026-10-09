import { createServer } from "node:http";

let version = 0;
let lastPublishKey = null;
let failNextRead = false;
const content = {
  aboutMe: [],
  projects: [{
    id: "cms-e2e-project",
    title: "Published project title",
    descriptionDe: "Beschreibung des veröffentlichten Projekts",
    descriptionEn: "Published project description",
    image: null,
    url: "https://example.test/project",
    tags: "TypeScript, Next.js, Webentwicklung, PostgreSQL, Tests, CI/CD",
    visible: true,
    series: 1,
  }],
  skills: [],
  experience: [],
  contactEmail: [],
};

const githubStats = {
  isFallback: true,
  stars: 0,
  commits: 0,
  pullRequests: 0,
  issues: 0,
  grade: "C",
  gradeScore: 100,
  totalContributions: 0,
  currentStreak: 0,
  longestStreak: 0,
  contributionStart: "",
  currentStreakDates: "",
  longestStreakDates: "",
  contributionDays: [],
  languages: [],
  repositoryStats: [],
};

function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.url === "/health") return send(response, 200, { ok: true });
  if (request.url === "/_test/fail-next-read" && request.method === "POST") {
    failNextRead = true;
    return send(response, 200, { armed: true });
  }
  if (request.url !== "/api/admin/content") return send(response, 404, { message: "Not found" });
  if (request.headers.authorization !== `Bearer ${process.env.ADMIN_CONTENT_API_TOKEN}`) {
    return send(response, 401, { message: "Unauthorized" });
  }
  if (request.method === "GET") {
    if (failNextRead) {
      failNextRead = false;
      request.socket.destroy();
      return;
    }
    return send(response, 200, { version, content, githubStats });
  }
  if (request.method !== "PUT") return send(response, 405, { message: "Method not allowed" });

  let body = "";
  for await (const chunk of request) body += chunk;
  let update;
  try {
    update = JSON.parse(body);
  } catch {
    return send(response, 400, { message: "Bad JSON" });
  }
  if (update.idempotencyKey === lastPublishKey) return send(response, 200, { version });
  if (update.expectedVersion !== version) return send(response, 409, { message: "Stale version" });
  Object.assign(content, update.content);
  version += 1;
  lastPublishKey = update.idempotencyKey;
  return send(response, 200, { version });
});

server.listen(Number(process.env.PORTFOLIO_MOCK_API_PORT ?? "4010"), "127.0.0.1");
