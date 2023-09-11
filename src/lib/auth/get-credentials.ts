export function getGithubCredentials(): { githubClientId: string; githubClientSecret: string } {
  const githubClientId = process.env.GITHUB_CLIENT_ID
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!githubClientId || githubClientId.length === 0) {
    throw new Error('Missing GITHUB_CLIENT_ID')
  }

  if (!githubClientSecret || githubClientSecret.length === 0) {
    throw new Error('Missing GITHUB_CLIENT_SECRET')
  }

  return { githubClientId, githubClientSecret }
}