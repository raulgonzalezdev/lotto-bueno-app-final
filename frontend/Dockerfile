# Build stage
FROM node:20.13.1-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn build

# Runner stage
FROM node:20.13.1-alpine AS runner
WORKDIR /app

# Define the environment as production
ENV NODE_ENV production

# Create a group and user to run our app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/out ./out

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Create the output directory in the app folder
RUN mkdir -p /app/frontend/out
RUN cp -r /app/out/* /app/frontend/out/

# Set permissions
RUN chown -R nextjs:nodejs /app

# Specify the user to use when running your app
USER nextjs

# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["yarn", "start"]
