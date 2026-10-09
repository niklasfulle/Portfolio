FROM node:24-bookworm-slim

WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY admin/package.json admin/package-lock.json ./admin/
RUN npm ci --prefix admin

COPY . .

ENV NODE_ENV=development
EXPOSE 3001

CMD ["npm", "run", "dev:docker", "--prefix", "admin"]
