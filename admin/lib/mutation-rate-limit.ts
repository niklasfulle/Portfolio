export const ADMIN_MUTATION_LIMIT = 20;

export function isAdminMutationRateLimited(requestCount: number): boolean {
  return requestCount > ADMIN_MUTATION_LIMIT;
}
