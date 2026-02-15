
# Frontend Dockerfile
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from builder stage or directly
COPY src /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
