#!/bin/sh

# Use Railway's PORT if available, otherwise default to 80
PORT=${PORT:-80}

# Replace the port in nginx config
sed -i "s/listen 80/listen $PORT/g" /etc/nginx/conf.d/default.conf
sed -i "s/listen \[::\]:80/listen [::]:$PORT/g" /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g "daemon off;"
