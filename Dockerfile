# Multi-stage build for Next.js application

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on lockfile
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then corepack enable yarn && yarn install --frozen-lockfile; \
  else echo "No lockfile found." && exit 1; \
  fi

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_AZURE_AD_CLIENT_ID
ARG NEXT_PUBLIC_AZURE_AD_TENANT_ID
ARG NEXT_PUBLIC_AZURE_AD_REDIRECT_URI
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_LOG_LEVEL

# Set environment variables for build
ENV NEXT_PUBLIC_AZURE_AD_CLIENT_ID=$NEXT_PUBLIC_AZURE_AD_CLIENT_ID
ENV NEXT_PUBLIC_AZURE_AD_TENANT_ID=$NEXT_PUBLIC_AZURE_AD_TENANT_ID
ENV NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=$NEXT_PUBLIC_AZURE_AD_REDIRECT_URI
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_LOG_LEVEL=$NEXT_PUBLIC_LOG_LEVEL
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f yarn.lock ]; then corepack enable yarn && yarn build; \
  fi

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["node", "server.js"]