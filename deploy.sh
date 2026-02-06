#!/bin/bash

# Configuration
NAS_USER="russ_admin"
NAS_HOST="192.168.1.70"
NAS_PORT="2222" # Change this if your NAS uses a different SSH port
NAS_PATH="/volume1/docker/apps/wall-of-wins"

echo "🚀 Deploying Wall of Wins to ${NAS_HOST} (v2 - Sudo Fix)..."

# 1. Transfer Files (Stream tarball over SSH)
# This pipes the local files directly to the NAS.
echo "📦 Packaging and Uploading..."

COPYFILE_DISABLE=1 tar --no-xattrs --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='db' \
    --exclude='public/uploads' \
    -cf - . | ssh -p ${NAS_PORT} ${NAS_USER}@${NAS_HOST} "mkdir -p ${NAS_PATH} ${NAS_PATH}/db ${NAS_PATH}/public/uploads && tar -xf - -C ${NAS_PATH} --no-same-owner --no-same-permissions -m || echo '⚠️ Non-critical tar warnings ignored'; chmod -R 777 ${NAS_PATH}/db ${NAS_PATH}/public/uploads"

if [ $? -eq 0 ]; then
  echo "✅ Upload successful!"
else
  echo "❌ Upload failed."
  exit 1
fi

# 2. Rebuild and Restart Docker (Separate SSH session for interactive sudo)
echo "🔄 Rebuilding and Restarting Docker..."
echo "🔐 You may be asked for your NAS password again for sudo."

ssh -t -p ${NAS_PORT} ${NAS_USER}@${NAS_HOST} "cd ${NAS_PATH} && sudo /usr/local/bin/docker-compose up -d --build"

if [ $? -eq 0 ]; then
  echo "✅ Deployment completed successfully!"
else
  echo "❌ Rebuild failed."
  exit 1
fi
echo "📋 Next Steps:"
echo "1. Verify app is running at http://${NAS_HOST}:3000"
