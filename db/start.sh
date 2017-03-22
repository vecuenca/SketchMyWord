#!/bin/sh

echo "Starting DB..."
sudo docker run --name db -d \
  -e MYSQL_ROOT_PASSWORD=1234 \
  -e MYSQL_DATABASE=sketch-my-word \
  -p 3306:3306 \
  mysql:latest
