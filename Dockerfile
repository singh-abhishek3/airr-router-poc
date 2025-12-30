# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# Install deps (use package-lock for deterministic builds)
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Needed at runtime
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Next.js server
CMD ["npm", "run", "start"]
