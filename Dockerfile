# Multi-stage build for optimized production image
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy website files
COPY . /usr/share/nginx/html

# Create necessary directories with proper permissions
RUN mkdir -p /var/run/nginx /var/cache/nginx /var/log/nginx && \
    chown -R root:root /var/run/nginx && \
    chmod 755 /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/log/nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx as root (nginx drops privileges internally)
CMD ["nginx", "-g", "daemon off;"]
