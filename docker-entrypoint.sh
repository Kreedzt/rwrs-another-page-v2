#!/bin/sh

set -e

# 替换 HTML 中的环境变量占位符
replace_env_vars() {
    local html_file="$1"
    local tmp_file="/tmp/index.html.tmp"

    # 如果设置了环境变量，则替换
    if [ ! -z "$VITE_SITE_URL" ]; then
        echo "=> Replacing __VITE_SITE_URL__ with $VITE_SITE_URL"
        sed -i "s|__VITE_SITE_URL__|$VITE_SITE_URL|g" "$html_file"
    fi

    if [ ! -z "$VITE_CDN_IMAGE_URL" ]; then
        echo "=> Replacing __VITE_CDN_IMAGE_URL__ with $VITE_CDN_IMAGE_URL"
        sed -i "s|__VITE_CDN_IMAGE_URL__|$VITE_CDN_IMAGE_URL|g" "$html_file"
    fi

    # 如果设置了 HEADER_SCRIPTS 环境变量，则注入脚本
    if [ ! -z "$HEADER_SCRIPTS" ]; then
        echo "=> Injecting header scripts"
        echo "$HEADER_SCRIPTS" > /tmp/header-scripts.txt
        awk '/<\/head>/ { system("cat /tmp/header-scripts.txt") } { print }' "$html_file" > "$tmp_file" && mv "$tmp_file" "$html_file"
    fi
}

# 处理所有 HTML 文件
for html_file in /usr/share/nginx/html/*.html; do
    if [ -f "$html_file" ]; then
        replace_env_vars "$html_file"
    fi
done

# 处理 manifest.webmanifest
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
# 启动 Nginx
exec nginx -g 'daemon off;'
