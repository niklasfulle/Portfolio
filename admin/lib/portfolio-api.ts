import "server-only";
import { createAdminServiceAssertion } from "@/lib/admin-service-auth";

const API_URL = process.env.PORTFOLIO_CONTENT_API_URL;
const API_TOKEN = process.env.ADMIN_CONTENT_API_TOKEN;

function getApiConfiguration() {
  if (!API_URL || !API_TOKEN || API_TOKEN.length < 32) {
    throw new Error("Portfolio content API is not configured.");
  }
  const parsedUrl = new URL(API_URL);
  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("Portfolio content API must use HTTPS in production.");
  }
  return { url: API_URL, token: API_TOKEN };
}

export async function requestPortfolioContent(method: "GET" | "PUT", actor: string, body?: unknown) {
  const { url, token } = getApiConfiguration();
  const pathname = new URL(url).pathname;
  const response = await fetch(url, {
    method,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...createAdminServiceAssertion(token, { actor, method, pathname }),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json().catch(() => null);
  return { response, result };
}
