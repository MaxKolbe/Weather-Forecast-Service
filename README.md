# ⛅ Weather Forecast Service

A monolithic TypeScript application that retrieves weather forecast data from the [OpenWeatherMap API](https://openweathermap.org/api), persists it in a PostgreSQL database with Redis caching, and serves it through both a server-rendered web dashboard and a RESTful API — no authentication required.

---

## Table of Contents

- [Summary](#summary)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
- [API Endpoints](#api-endpoints)
- [Dashboard](#dashboard)
- [Caching Strategy](#caching-strategy)
- [Scheduled Jobs](#scheduled-jobs)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Summary

The Weather Forecast Service allows visitors to look up **current weather conditions** and **forecasts** for any city worldwide. Data is sourced from the OpenWeatherMap API, stored in PostgreSQL via Drizzle ORM, and cached in Redis to minimise external API calls and improve response times.

Key capabilities include:

- **Current Weather** — temperature, humidity, wind speed/direction, pressure, sunrise/sunset, and conditions for a given city.
- **Weather Forecast** — short-term forecast data including temperature, humidity, wind, rain volume, and precipitation probability.
- **Web Dashboard** — an EJS-rendered frontend with a search form, recent searches list, and detailed weather view.
- **REST API** — JSON endpoints for programmatic access to current weather and forecast data.
- **Background Refresh** — scheduled cron jobs that automatically update weather data for frequently searched cities.
- **Graceful Degradation** — a layered data-fetching strategy (Cache → Database → API) ensures the service remains responsive even when the external API is unavailable.

---

## Features

| Feature | Description |
| --- | --- |
| City search | Look up weather by exact city name |
| Multi-layer data fetching | Redis cache → PostgreSQL → OpenWeatherMap API fallback chain |
| Automatic data refresh | Cron jobs update current weather (every 2 hrs) and forecasts (every 3 hrs) |
| Server-side rendering | EJS templates for a visitor-friendly dashboard |
| Structured logging | Winston + Logtail (Better Stack) for local and remote log aggregation |
| Standardised responses | Consistent JSON response format via a shared response handler |
| Global error handling | Centralised Express error middleware with network error detection |
| Environment-aware config | Separate database and Redis URLs for development, test, and production |

---

## Tech Stack

### Backend

| Technology | Purpose |
| --- | --- |
| **TypeScript** | Primary language |
| **Express 5** | Web framework |
| **Drizzle ORM** | Type-safe PostgreSQL ORM & migrations |
| **PostgreSQL** | Relational database |
| **Redis** | In-memory cache |
| **node-fetch** | HTTP client for OpenWeatherMap API |
| **node-schedule** | Cron-style scheduled tasks |
| **Winston** | Logging framework |
| **Logtail** | Remote log transport (Better Stack) |
| **Joi** | Request validation schemas |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

### Frontend

| Technology | Purpose |
| --- | --- |
| **EJS** | Server-side HTML templating |
| **Tailwind CSS 4** | Utility-first CSS framework |

### Development & Testing

| Technology | Purpose |
| --- | --- |
| **tsx** | TypeScript execution & watch mode |
| **Jest** | Unit & integration testing |
| **SuperTest** | HTTP assertion library for API tests |
| **Drizzle Kit** | Database migration tooling |

---

## Architecture

The application follows a **layered architecture** within a monolithic Express application:

```
┌─────────────────────────────────────────────────────────┐
│                   Weather Forecast Service              │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │  Web Layer  │   │Service Layer │   │  Data Layer  │  │
│  │(Controllers/│◄─►│  (Services)  │◄─►│  (Repos /    │  │
│  │   Views)    │   │              │   │   Cache)     │  │
│  └─────────────┘   └──────────────┘   └──────────────┘  │
│          ▲                 ▲                ▲           │
└──────────┼─────────────────┼────────────────┼───────────┘
           │                 │                │
           ▼                 ▼                ▼
  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐
  │  Web Browser │  │ OpenWeatherMap │  │  PostgreSQL  │
  └──────────────┘  │     API        │  │  + Redis     │
                    └────────────────┘  └──────────────┘
```

**Data-fetching waterfall:** Every read request follows a three-tier strategy:

1. **Redis Cache** — fastest; returns immediately if a cache hit is found.
2. **PostgreSQL** — checked next; results are cached on retrieval.
3. **OpenWeatherMap API** — last resort; data is persisted to both DB and cache.

---

## Folder Structure

```
Weather Forecast Service/
├── drizzle/                        # Drizzle-Kit generated migrations
│   ├── 0000_square_sir_ram.sql     # Initial migration SQL
│   └── meta/                       # Migration metadata
├── public/                         # Static assets served by Express
│   ├── input.css                   # Tailwind CSS source
│   ├── output.css                  # Compiled Tailwind CSS
│   └── bitimg.jpg                  # Image asset
├── views/                          # EJS templates
│   ├── home.ejs                    # Dashboard — search form & recent cities
│   └── weather.ejs                 # Weather detail — current + forecast view
├── src/
│   ├── index.ts                    # Application entry point (starts server)
│   ├── app.ts                      # Express app setup (middleware, routes, crons)
│   ├── configs/
│   │   ├── db.config.ts            # PostgreSQL pool & Drizzle initialisation
│   │   ├── cache.config.ts         # Redis client with reconnection strategy
│   │   └── logger.config.ts        # Winston + Logtail logger configuration
│   ├── db/
│   │   └── schema.ts              # Re-exports all Drizzle schemas
│   ├── middleware/
│   │   └── errorHandler.ts        # Global Express error handler
│   ├── modules/
│   │   └── weather/
│   │       ├── weather.routes.ts   # Route definitions (API + Dashboard)
│   │       ├── weather.controller.ts # Request handlers
│   │       ├── weather.service.ts  # Business logic & DB operations
│   │       ├── weather.api.ts      # OpenWeatherMap API integration
│   │       ├── weather.cache.ts    # Redis cache operations
│   │       ├── weather.cron.ts     # Scheduled background jobs
│   │       ├── weather.schema.ts   # Drizzle table definitions
│   │       ├── weather.middleware.ts # Route-level middleware (placeholder)
│   │       └── tests/
│   │           ├── weather.integration.test.ts
│   │           ├── fixtures/       # Test fixtures
│   │           └── tsconfig.json   # Test-specific TS config
│   ├── types/
│   │   └── weather.d.ts           # TypeScript type declarations
│   └── utils/
│       ├── responseHandler.ts     # Standardised JSON response helper
│       └── isStringArray.ts       # Type guard utility
├── .env                            # Environment variables
├── .gitignore
├── drizzle.config.ts               # Drizzle Kit configuration
├── jest.config.js                  # Jest test configuration
├── tsconfig.json                   # TypeScript compiler options
├── package.json
├── PRD.md                          # Product Requirements Document
├── TDD.md                         # Technical Design Document
└── todo.md                         # Development notes & learnings
```

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** ≥ 18
- **PostgreSQL** — running locally or a remote instance
- **Redis** — running locally or a remote instance
- **OpenWeatherMap API key** — sign up at [openweathermap.org](https://openweathermap.org/api)

---

## Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/MaxKolbe/Weather-Forecast-Service.git
cd Weather-Forecast-Service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) for the full list):

```env
NODE_ENV=development

# PostgreSQL
PG_DATABASE_DEV_URL=postgresql://postgres:password@localhost:5432/devdb
PG_DATABASE_TEST_URL=postgresql://postgres:password@localhost:5432/testdb
PG_DATABASE_PROD_URL=<your-production-database-url>

# Redis
REDIS_DEV_URL=redis://localhost:6379
REDIS_TEST_URL=redis://localhost:6379
REDIS_PROD_URL=<your-production-redis-url>

# OpenWeatherMap
WEATHER_APIKEY=<your-api-key>

# Logging
LOG_LEVEL=debug
SOURCE_TOKEN=<your-logtail-source-token>
INGESTING_HOST=<your-logtail-ingesting-host>

PORT=3000
```

### 4. Run Database Migrations

Generate and apply the database schema:

```bash
npm run db:gen-mig
```

Or run each step separately:

```bash
npm run db:generate   # Generate migration files
npm run db:migrate    # Apply migrations
```

### 5. Compile Tailwind CSS (optional, for frontend changes)

```bash
npm run style
```

### 6. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

### 7. Production Build

```bash
npm run build       # Compile TypeScript to dist/
npm run start       # Run the compiled application
```

---

## API Endpoints

All API routes are prefixed with `/api/v1/weather`.

### Get Current Weather

```
GET /api/v1/weather/current?city={cityName}
```

Returns the current weather conditions for the specified city.

**Query Parameters:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | string | Yes | City name (case-insensitive) |

**Success Response** `200 OK`:

```json
{
  "status": 200,
  "message": "Success: Current Weather found",
  "data": {
    "city": "berlin",
    "country": "DE",
    "timestamp": "2025-03-21T14:30:00.000Z",
    "temperature": 12.5,
    "humidity": 65,
    "windSpeed": 5.2,
    "windDirection": 180,
    "pressure": 1012,
    "conditions": "Clouds",
    "description": "scattered clouds",
    "sunrise": "2025-03-21T06:12:00.000Z",
    "sunset": "2025-03-21T18:34:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition |
| --- | --- |
| `400` | Missing or empty `city` parameter |
| `404` | City not found |
| `503` | Network error (DNS resolution failure) |
| `504` | Request to weather API timed out |

---

### Get Weather Forecast

```
GET /api/v1/weather/forecast?city={cityName}
```

Returns forecast data for the specified city.

**Query Parameters:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | string | Yes | City name (case-insensitive) |

**Success Response** `200 OK`:

```json
{
  "status": 200,
  "message": "Success: Weather Forecast found",
  "data": {
    "city": "berlin",
    "country": "DE",
    "forecast": {
      "date": "2025-03-22T12:00:00.000Z",
      "temperature": 14.2,
      "humidity": 60,
      "windSpeed": 4.8,
      "conditions": "Clear",
      "description": "clear sky"
    }
  }
}
```

**Error Responses:**

| Status | Condition |
| --- | --- |
| `400` | Missing or empty `city` parameter |
| `404` | City not found |
| `503` | Network error (DNS resolution failure) |
| `504` | Request to weather API timed out |

---

### Dashboard Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/v1/weather/home` | Renders the home dashboard with recent searches |
| `GET` | `/api/v1/weather/?city={cityName}` | Renders the weather detail page for a city |

---

## Dashboard

The web dashboard provides a visitor-friendly interface built with EJS and Tailwind CSS:

- **Home Page** (`/api/v1/weather/home`) — a search form to enter a city name, along with a list of recently searched cities pulled from the Redis cache.
- **Weather Detail Page** (`/api/v1/weather/?city=berlin`) — displays current weather conditions and forecast data side by side, fetched in parallel via `Promise.all`.

---

## Caching Strategy

| Data Type | Cache Key Pattern | TTL |
| --- | --- | --- |
| Current Weather | `get:currentweather:{city}` | 15 minutes |
| Forecast | `get:forecast:{city}` | 1 hour |
| City Name | `get:city:{city}` | 24 hours |

The Redis client is configured with an **exponential backoff reconnection strategy** (with jitter) and a maximum of 5 retries to handle transient connection failures gracefully.

---

## Scheduled Jobs

Background cron jobs keep weather data fresh for frequently searched cities:

| Job | Schedule | Description |
| --- | --- | --- |
| `updateCurrentWeatherCron` | Every 2 hours | Batch-updates current weather for all recently searched cities |
| `updateForecastCron` | Every 3 hours | Batch-updates forecast data for all recently searched cities |

Both jobs identify "frequently searched" cities by reading cached city keys and filtering for those searched within the last 12 hours.

---

## Testing

The project uses **Jest** with **SuperTest** for integration testing.

```bash
# Run the test suite
npm test
```

Tests are located at `src/modules/weather/tests/` and cover:

- **Integration tests** — end-to-end API endpoint testing with `SuperTest`
- **Fixtures** — reusable test data in the `fixtures/` directory

> **Note:** Tests run with `--experimental-vm-modules` for ES module support and `--detectOpenHandles` to catch unclosed async operations.

---

## Environment Variables

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Environment: `development`, `test`, or `production` |
| `PORT` | Server port (default: `3000`) |
| `PG_DATABASE_DEV_URL` | PostgreSQL connection string (development) |
| `PG_DATABASE_TEST_URL` | PostgreSQL connection string (test) |
| `PG_DATABASE_PROD_URL` | PostgreSQL connection string (production) |
| `REDIS_DEV_URL` | Redis connection string (development) |
| `REDIS_TEST_URL` | Redis connection string (test) |
| `REDIS_PROD_URL` | Redis connection string (production) |
| `WEATHER_APIKEY` | OpenWeatherMap API key |
| `LOG_LEVEL` | Winston log level (default: `info`) |
| `SOURCE_TOKEN` | Logtail / Better Stack source token |
| `INGESTING_HOST` | Logtail ingesting endpoint host |

---

## Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `tsx watch src/index.ts` | Start dev server with hot-reload |
| `npm run build` | `npm install --include=dev && npx tsc` | Compile TypeScript to `dist/` |
| `npm run start` | `node dist/index.js` | Run the production build |
| `npm run watch` | `npx tsc -w` | Watch-mode TypeScript compilation |
| `npm run db:push` | `npx drizzle-kit push` | Push schema changes directly |
| `npm run db:generate` | `npx drizzle-kit generate` | Generate migration files |
| `npm run db:migrate` | `npx drizzle-kit migrate` | Apply pending migrations |
| `npm run db:gen-mig` | Generate + migrate in one step | Combined migration command |
| `npm run style` | Tailwind CLI | Compile Tailwind CSS (watch mode) |
| `npm test` | Jest | Run the test suite |

---

## License

MIT
