
# Frontend Dockerfile
FROM nginx:alpine

# Set permissions for the nginx user to run on non-privileged port
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Copy custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets
COPY src /usr/share/nginx/html

# Switch to non-privileged user
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
