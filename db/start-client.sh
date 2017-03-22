#!/bin/sh

echo "Starting client..."
sudo docker run --name client \
    -p 3000:3000 \
    --link db:db \
    -e DATABASE_HOST=DB users-service  