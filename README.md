# Product Management App

An product  management application with a Next.js frontend and a Laravel REST API. Users can register and sign in, manage products and categories, upload product images, and search the catalogue.

## Project components

| Component | Technology | Local URL |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript | http://localhost:3000 |
| Backend API | Laravel 13, PHP 8.3 | http://localhost:8000 |
| Database (Docker setup) | MySQL 8.4 | Internal Compose service |

The frontend communicates with the backend through its server-side API routes. Authentication tokens are stored in HttpOnly cookies; configure `LARAVEL_API_URL` as the Laravel API base URL ending in `/api`.

## Requirements

### Local development

- PHP 8.3  required by
- Composer 2
- Node.js 22 LTS and npm

### Docker

- Docker Desktop with Docker Compose

## Local setup

The following commands use PowerShell and assume you start in the project root.

### 1. Configure and start Laravel

```powershell
Set-Location .\backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=0.0.0.0 --port=8000
```


- Email: `admin@test.com`
- Password: `12345678`

These credentials are for local development only.

### 2. Configure and start Next.js

Open a second PowerShell window in the project root:

```powershell
Set-Location .\frontend
npm ci
Set-Content .env.local "LARAVEL_API_URL=http://127.0.0.1:8000/api"
npm run dev
```

Open http://localhost:3000 and sign in using the local development account above, or register another account.

### Local checks

Run these from the corresponding directory:

```powershell
# frontend
npm test
npm run lint
npm run build

# backend
composer test
```

## Docker setup

Docker Compose runs the frontend, backend, and MySQL database. From the project root:

```powershell
docker compose up --build
```

Open http://localhost:3000. The API is also available at http://localhost:8000. On first start, Compose waits for MySQL, runs migrations, seeds the default categories, and starts both applications. It does not create a default login or sample products; register through the frontend.

The default database passwords in `compose.yaml` are for local development only. Set `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD` in the root Compose `.env` file or shell environment before exposing the services beyond your machine.

Stop the stack with `Ctrl+C` or:

```powershell
docker compose down
```

Named volumes preserve the MySQL database, uploaded product images, and Laravel app key across restarts. To remove those persisted data volumes as well:

```powershell
docker compose down --volumes
```

See [DOCKER.md](./DOCKER.md) for Docker logs, migrations, tests, and rebuild commands.

## Useful URLs and commands

- Frontend: http://localhost:3000
- Laravel health endpoint: http://localhost:8000/up
- Docker logs: `docker compose logs -f`
- Docker backend shell command: `docker compose exec backend php artisan migrate:status`
- Frontend tests: `npm test` (run in `frontend`)
- Backend tests: `composer test` (run in `backend`)
