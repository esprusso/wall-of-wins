#!/bin/bash

# Configuration
NAS_USER="russ_admin"
NAS_HOST="192.168.1.70"
NAS_PORT="2222" # Change this if your NAS uses a different SSH port
NAS_PATH="/volume1/docker/apps/wall-of-wins"

echo "🚀 Deploying Wall of Wins to ${NAS_HOST}..."

# 1. Transfer Files (Stream tarball over SSH)
# This pipes the local files directly to the NAS, requiring only one password entry.
echo "📦 Packaging and Uploading..."

COPYFILE_DISABLE=1 tar --no-xattrs --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    -cf - . | ssh -p ${NAS_PORT} ${NAS_USER}@${NAS_HOST} "mkdir -p ${NAS_PATH} ${NAS_PATH}/db ${NAS_PATH}/public/uploads && tar -xf - -C ${NAS_PATH} --no-same-owner --no-same-permissions -m || echo '⚠️ Non-critical tar warnings ignored' && chmod -R 777 ${NAS_PATH}/db ${NAS_PATH}/public/uploads"

if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment failed. Please check your password."
  exit 1
fi
echo "📋 Next Steps:"
echo "1. SSH into your NAS: ssh -p ${NAS_PORT} ${NAS_USER}@${NAS_HOST}"
echo "2. Go to the folder:  cd ${NAS_PATH}"
echo "3. Build & Run:       docker-compose up -d --build"

