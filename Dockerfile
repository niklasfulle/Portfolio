FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
RUN yarn playwright install --with-deps chromium

COPY prisma ./prisma
ARG POSTGRESQL_URL=postgresql://portfolio@db:5432/portfolio?schema=public
ENV POSTGRESQL_URL=${POSTGRESQL_URL}
RUN yarn prisma generate

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]
