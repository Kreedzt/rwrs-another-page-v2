# Build stage
FROM node:22-alpine AS build

# Build arguments with defaults
ARG TAG_NAME
ARG VITE_SITE_URL=https://robin.kreedzt.com
ARG VITE_CDN_IMAGE_URL=

# Set working directory
WORKDIR /app

# Copy package.json files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies with cache optimization
RUN corepack enable && \
    corepack prepare pnpm@10.8.0 --activate && \
    pnpm install --frozen-lockfile

# Create .env file from build args
RUN echo "VITE_SITE_URL=${VITE_SITE_URL}" > .env && \
    echo "VITE_CDN_IMAGE_URL=${VITE_CDN_IMAGE_URL}" >> .env

# Copy the rest of the code
COPY . .

# Build the app (Vite will read .env)
RUN pnpm build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy the built files to Nginx serve directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use the entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
