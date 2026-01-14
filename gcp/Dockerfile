FROM directus/directus:latest

# Cloud Run provides PORT environment variable
# Directus will use PORT if set, otherwise defaults to 8055
ENV PORT=8080

WORKDIR /directus

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Directus will start automatically via the base image's entrypoint
