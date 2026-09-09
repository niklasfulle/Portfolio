# Portfolio Website

## Table of Contents

- [Description](#description)
- [Dependencies](#dependencies)
- [Screenshots](#screenshots)

## Description

This is a portfolio website for myself. It is built with Next.js and Tailwind CSS. As database I use Prisma with a Postgres database. It can show my projects, my skills and my contact information. It is also possible to send me a message via the contact form.

## Dependencies

| name                        | version  | url                                                       |
| --------------------------- | -------- | --------------------------------------------------------- |
| @auth/prisma-adapter        | ^1.0.2   | https://www.npmjs.com/package/@auth/prisma-adapter        |
| @emotion/react              | ^11.11.1 | https://www.npmjs.com/package/@emotion/react              |
| @emotion/styled             | ^11.11.0 | https://www.npmjs.com/package/@emotion/styled             |
| @mui/material               | ^5.14.8  | https://www.npmjs.com/package/@mui/material               |
| @prisma/client              | ^5.2.0   | https://www.npmjs.com/package/@prisma/client              |
| @react-email/components     | ^0.0.7   | https://www.npmjs.com/package/@react-email/components     |
| @react-email/tailwind       | ^0.0.8   | https://www.npmjs.com/package/@react-email/tailwind       |
| @tailwindcss/typography     | ^0.5.10  | https://www.npmjs.com/package/@tailwindcss/typography     |
| @types/bcrypt               | ^5.0.0   | https://www.npmjs.com/package/@types/bcrypt               |
| @types/node                 | 20.5.9   | https://www.npmjs.com/package/@types/node                 |
| @types/react                | 18.2.21  | https://www.npmjs.com/package/@types/react                |
| @types/react-dom            | 18.2.7   | https://www.npmjs.com/package/@types/react-dom            |
| @types/three                | ^0.155.1 | https://www.npmjs.com/package/@types/three                |
| autoprefixer                | 10.4.15  | https://www.npmjs.com/package/autoprefixer                |
| bcrypt                      | ^5.1.1   | https://www.npmjs.com/package/bcrypt                      |
| class-variance-authority    | ^0.7.0   | https://www.npmjs.com/package/class-variance-authority    |
| clsx                        | ^2.0.0   | https://www.npmjs.com/package/clsx                        |
| country-flag-icons          | ^1.5.7   | https://www.npmjs.com/package/country-flag-icons          |
| eslint                      | 8.48.0   | https://www.npmjs.com/package/eslint                      |
| eslint-config-next          | 13.4.19  | https://www.npmjs.com/package/eslint-config-next          |
| eslint-plugin-react         | ^7.33.2  | https://www.npmjs.com/package/eslint-plugin-react         |
| eslint-plugin-react-hooks   | ^4.6.0   | https://www.npmjs.com/package/eslint-plugin-react-hooks   |
| framer-motion               | ^10.16.4 | https://www.npmjs.com/package/framer-motion               |
| lucide-react                | ^0.274.0 | https://www.npmjs.com/package/lucide-react                |
| next                        | 13.5     | https://www.npmjs.com/package/next                        |
| next-themes                 | ^0.2.1   | https://www.npmjs.com/package/next-themes                 |
| postcss                     | 8.4.29   | https://www.npmjs.com/package/postcss                     |
| prettier                    | ^3.0.3   | https://www.npmjs.com/package/prettier                    |
| prettier-plugin-tailwindcss | ^0.5.4   | https://www.npmjs.com/package/prettier-plugin-tailwindcss |
| prisma                      | ^5.3.1   | https://www.npmjs.com/package/prisma                      |
| react                       | 18.2.0   | https://www.npmjs.com/package/react                       |
| react-dom                   | 18.2.0   | https://www.npmjs.com/package/react-dom                   |
| react-hot-toast             | ^2.4.1   | https://www.npmjs.com/package/react-hot-toast             |
| react-icons                 | ^4.11.0  | https://www.npmjs.com/package/react-icons                 |
| react-intersection-observer | ^9.5.2   | https://www.npmjs.com/package/react-intersection-observer |
| resend                      | ^1.0.0   | https://www.npmjs.com/package/resend                      |
| sharp                       | ^0.32.5  | https://www.npmjs.com/package/sharp                       |
| tailwind-merge              | ^1.14.0  | https://www.npmjs.com/package/tailwind-merge              |
| tailwindcss                 | 3.3.3    | https://www.npmjs.com/package/tailwindcss                 |
| tailwindcss-animate         | ^1.0.7   | https://www.npmjs.com/package/tailwindcss-animate         |
| three                       | ^0.156.1 | https://www.npmjs.com/package/three                       |
| typescript                  | 5.2.2    | https://www.npmjs.com/package/typescript                  |
| zod                         | ^3.22.2  | https://www.npmjs.com/package/zod                         |

## Screenshots

## Development with Docker Compose

Start the Next.js development server and a local PostgreSQL database with:

```bash
docker compose up --build
```

The portfolio is available at http://localhost:3000. Stop the services with
`Ctrl+C`; the PostgreSQL data remains in the named Docker volume.

## Tests and SonarQube

Run the Jest test suite with LCOV coverage using:

```bash
yarn test:coverage
```

For a SonarQube scan, set `SONAR_HOST_URL` and `SONAR_TOKEN`, then run:

```bash
yarn sonar:scan
```

The scan runs the tests first and starts SonarQube only when they pass. The
project key defaults to `portfolio` and can be overridden with
`SONAR_PROJECT_KEY`.
