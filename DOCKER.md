# Run the project with Docker

Docker Compose runs the Next.js frontend, Laravel API, and MySQL database. The frontend uses `http://backend:8000/api` as its internal Laravel API base URL. MySQL data, uploaded product images, and the Laravel application key are stored in named volumes and survive container restarts.

## Requirements

- Docker Desktop with Docker Compose enabled

## Start

From the project root:

```powershell
docker compose up --build
```

The first start builds the application images, waits for MySQL, runs Laravel migrations and seeds the default categories, then starts both applications. Register an account through the frontend; Docker does not create a default user or demo products. Open:

- Frontend: http://localhost:3000
- Laravel API: http://localhost:8000

The backend generates an application key on first start and persists it in the `app_key` volume. The Compose file's default MySQL credentials are for local development only; override `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD` in your shell or a root `.env` file before exposing the stack beyond your machine.

Stop the containers with `Ctrl+C`, or run `docker compose down`. To also delete the database, uploaded images, and saved application key, run `docker compose down --volumes`.

## Useful commands

```powershell
docker compose logs -f
docker compose exec backend php artisan migrate:status
docker compose exec backend php artisan test
docker compose exec frontend npm test
```

After changing application code or dependencies, rebuild the relevant image:

```powershell
docker compose up --build
```
