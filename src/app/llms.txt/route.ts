const llmsText = `# Niklas Fulle — Portfolio

> Personal portfolio of Niklas Fulle, a software developer and DevOps enthusiast. The public website is available in German and English.

## About

Niklas Fulle builds software with a focus on reliable, well-tested applications, developer tooling, CI/CD, and DevOps practices.

## Public projects

- [Portfolio](https://github.com/niklasfulle/Portfolio): Next.js portfolio with GitHub statistics, Docker-based development, Playwright tests, and SonarQube analysis.
- [Netflix Clone](https://github.com/niklasfulle/Netflix-Clone): Streaming-style web interface built with TypeScript and Next.js.
- [WorldData API](https://github.com/niklasfulle/WorldData-API): Backend API for worldwide datasets and data-driven applications.
- [Chat App](https://github.com/niklasfulle/chat-app): Bachelor-thesis chat application with Terraform and Ansible-based provisioning.
- [Self-Driving Car](https://github.com/niklasfulle/Self-Driving-Car): JavaScript experiment with neural networks and machine-learning concepts.
- [Randnotizen](https://github.com/niklasfulle/Randnotizen): Offline-capable Windows desktop note application with topics, checklists, and keyboard navigation.
- [LifeSim](https://github.com/niklasfulle/LifeSim): Desktop life and survival simulation with procedural worlds and persistent save states.
- [3D-Online-Schach](https://github.com/niklasfulle/3D-Online-Schach): Browser-based 3D chess platform with lobby, games, and live game status.

## Skills

TypeScript, React, Next.js, Tailwind CSS, Node.js, .NET, .NET MAUI, Docker, PostgreSQL, Prisma, SQLite, Terraform, Ansible, GitHub Actions, GitLab CI/CD, Playwright, Jest, SonarQube, Codex, and GitHub Copilot.

## Important pages

- [Home](/)
- [Privacy policy](/privacy)
- [Cookie policy](/cookies)
- [Legal notice](/imprint)
- [Terms](/terms)

## Data and privacy

The site has no analytics, advertising, or marketing trackers in its reviewed source. The theme preference is stored only after explicit consent. GitHub statistics are aggregated server-side for the configured account.
`;

export function GET() {
  return new Response(llmsText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
