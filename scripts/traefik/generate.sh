#!/bin/bash
# Simple wrapper script for generating Traefik configuration

APP_ID="fwkw8g8gww00g4ggg0w8gg4s"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

echo "🚀 Generating Traefik configuration..."
echo ""

python3 generate-config.py "$APP_ID" "$@"

if [ $? -eq 0 ]; then
    echo ""
    echo "📋 To apply the configuration:"
    echo "   1. Open: $SCRIPT_DIR/traefik-config.txt"
    echo "   2. Copy ALL contents"
    echo "   3. Paste into Coolify → Settings → Custom Labels"
    echo "   4. Save and restart your application"
else
    echo ""
    echo "❌ Error generating configuration"
    exit 1
fi

