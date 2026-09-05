#!/bin/bash
# Save this script at the same level as the files, make executable, then run:
# chmod +x zip-instructions.sh
# ./zip-instructions.sh
mkdir -p us-figma-starter
cp README.md design-tokens.json design-tokens.ts heart-logo.svg components.md frames.md us-figma-starter/
cd us-figma-starter
zip -r ../us-figma-starter.zip .
echo "Created us-figma-starter.zip in the parent directory"
