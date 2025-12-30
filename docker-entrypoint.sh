#!/bin/sh

set -e

# Replace environment variable placeholders in HTML files
replace_env_vars() {
    local html_file="$1"
    local tmp_file="/tmp/index.html.tmp"

    # Replace VITE_SITE_URL if set
    if [ ! -z "$VITE_SITE_URL" ]; then
        echo "=> Replacing __VITE_SITE_URL__ with $VITE_SITE_URL"
        sed -i "s|__VITE_SITE_URL__|$VITE_SITE_URL|g" "$html_file"
    fi

    # Replace VITE_CDN_IMAGE_URL if set
    if [ ! -z "$VITE_CDN_IMAGE_URL" ]; then
        echo "=> Replacing __VITE_CDN_IMAGE_URL__ with $VITE_CDN_IMAGE_URL"
        sed -i "s|__VITE_CDN_IMAGE_URL__|$VITE_CDN_IMAGE_URL|g" "$html_file"
    fi

    # Inject custom header scripts if provided
    if [ ! -z "$HEADER_SCRIPTS" ]; then
        echo "=> Injecting header scripts"
        echo "$HEADER_SCRIPTS" > /tmp/header-scripts.txt
        awk '/<\/head>/ { system("cat /tmp/header-scripts.txt") } { print }' "$html_file" > "$tmp_file" && mv "$tmp_file" "$html_file"
    fi
}

# Process all HTML files
for html_file in /usr/share/nginx/html/*.html; do
    if [ -f "$html_file" ]; then
        replace_env_vars "$html_file"
    fi
done

# Process manifest.webmanifest
if [ -f /usr/share/nginx/html/manifest.webmanifest ]; then
    echo "=> Processing manifest.webmanifest"
    if [ ! -z "$VITE_SITE_URL" ]; then
        sed -i "s|__VITE_SITE_URL__|$VITE_SITE_URL|g" /usr/share/nginx/html/manifest.webmanifest
    fi
    if [ ! -z "$VITE_CDN_IMAGE_URL" ]; then
        sed -i "s|__VITE_CDN_IMAGE_URL__|$VITE_CDN_IMAGE_URL|g" /usr/share/nginx/html/manifest.webmanifest
    fi
fi

echo "=> Starting Nginx..."
exec nginx -g 'daemon off;'
