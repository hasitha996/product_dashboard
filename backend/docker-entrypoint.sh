#!/bin/sh
set -eu

if [ -z "${APP_KEY:-}" ]; then
    key_file=/var/lib/app-key/app_key
    mkdir -p "$(dirname "$key_file")"

    if [ -s "$key_file" ]; then
        APP_KEY="$(cat "$key_file")"
    else
        APP_KEY="$(php -r 'echo "base64:" . base64_encode(random_bytes(32));')"
        umask 077
        printf '%s' "$APP_KEY" > "$key_file"
    fi

    export APP_KEY
fi

php artisan storage:link --force
php artisan migrate --force
php artisan db:seed --class=CategorySeeder --force

exec php artisan serve --host=0.0.0.0 --port=8000
