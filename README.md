# Server-node Exercise

This exercise is designed to demonstrate and display proficiency in **Node.js** and **RESTful API design**.  
The tasks range from straightforward to intermediate and potentially challenging features.

---

## Requirements

### Domain Model
The service must manage and persist a simple domain of three entities: **Users**, **Organizations**, and **Orders**.

- **User**: `id`, `firstName`, `lastName`, `email`, `organizationId`, `dateCreated`
- **Organization**: `id`, `name`, `industry`, `dateFounded`
- **Order**: `id`, `orderDate`, `totalAmount`, `userId`, `organizationId`

> The `userId` and `organizationId` values must reference valid records.

---

### RESTful Endpoints

Each entity must support the following endpoints:

| Method | Route | Description |
|--------|--------|-------------|
| GET | `/api/[entity]` | Returns all items (paginated) |
| GET | `/api/[entity]/{id}` | Returns a single item by ID |
| POST | `/api/[entity]` | Creates a new item |
| PUT | `/api/[entity]/{id}` | Updates an existing item |
| DELETE | `/api/[entity]/{id}` | Deletes an item |

#### Special endpoints
- `GET /api/orders/{id}` — returns the order **along with** the associated user and organization.
- `POST /api/orders/bulk` — creates multiple orders in a single request.

##### Bulk Orders Endpoint

Creates multiple orders at once with validation:

| Rule | Description |
|------|-------------|
| `orders` array | Must contain at least 1 order |
| `organizationId` | All orders must have the same organizationId |
| Total sum | Sum of all `totalAmount` values must not exceed `MAX_BULK_ORDER_TOTAL` (default: 100,000) |

**Request body:**
```json
{
  "orders": [
    { "totalAmount": 100, "userId": "uuid", "organizationId": "uuid" },
    { "totalAmount": 200, "userId": "uuid", "organizationId": "uuid" }
  ]
}
```

> Note: `userId` and `organizationId` are optional. If omitted, they default to the authenticated user's values.

**Environment variable:**
- `MAX_BULK_ORDER_TOTAL` — Maximum allowed sum of all order amounts (default: 100,000)

---

### Input Validation

`POST` and `PUT` requests must be validated and respond with appropriate HTTP status codes.

| Rule | Description |
|------|--------------|
| User `firstName`, `lastName` | Must not be null or whitespace |
| Organization `name` | Must not be null or whitespace |
| Order `totalAmount` | Must be **greater than 0** |
| All date fields | Must occur **before** the current timestamp |

---

### API Documentation and Health Checks

- **Swagger/OpenAPI** must be available at: `GET /swagger`
- Health probes:
  - `GET /health` — liveness
  - `GET /readiness` — readiness (check DB connection and cache readiness)

---

## Seed Data

Provide a simple seed script that creates:
- 2 organizations
- 10 users
- 20 orders (with valid past dates)

This will help with testing pagination, relationships, and validation rules.


---

## Non-functional Requirements

1. Tech Stack: Node.js, Typescript, Express, MySQL with Sequelize ORM
2. Separate concerns between:
   - Controllers
   - Business logic (services)
   - Data access (repositories)
3. Domain entities **must not** be directly exposed in HTTP responses.  
   Use DTOs or mapping functions.
4. Logging:
   - Database state changes → `info` level  
   - HTTP headers → `debug` level
5. Implement **unit tests** for business logic.
6. Deploy the service via **Docker**, including dependencies
7. Handle unhandled exceptions gracefully — return a structured JSON error message, not the developer exception page.

---

### Bonus Features
1. **Client-side caching headers**
   - User and Organization responses: cacheable for **10 minutes**
   - Order responses: use **ETag** headers (`304 Not Modified` when valid)
2. **Server-side caching**
   - Cache GET responses in memory (e.g., using `lru-cache`)
   - TTL: **10 minutes**
   - Invalidate cached entries when related data changes
3. **Rate limiting**
   - Limit API access per organization to **30 requests per minute**
4. **Authentication**
   - Implement **JWT/OAuth2** authentication  
   - All routes require authorization except `/health`, `/readiness`, and `/swagger`
5. **Secure configuration**
   - No hardcoded credentials in the source code (implement industry recognized security standards)

---


## Deliverables

The final repository must include:

- Complete source code
- `README.md` (this file)
- `docker-compose.yml`
- `Dockerfile`
- `.env.example`
- Swagger documentation setup
- Unit tests

### The `README.md` must describe:
- How to run the app locally
- How to run it with Docker
- How to access the Swagger UI
- How to run the test suite
- A short note on key design decisions (ORM, error handling, caching, etc.)

---
## How to run the app locally

1.  **Prerequisites**: Ensure you have Node.js (v22+) and MySQL 8 installed.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Copy `.env.example` to `.env` and update database credentials.
    ```bash
    cp .env.example .env
    ```
4.  **Database Setup**:
    Run migrations and seed data:
    ```bash
    npm run db:migrate
    npm run db:seed
    ```
5.  **Start the Server**:
    ```bash
    npm run dev
    ```

## How to run it with docker

Run the following command to start the application and the database:

```bash
docker compose up
```

To rebuild the image (e.g. after installing new dependencies):

```bash
docker compose down && docker compose build --no-cache && docker compose up
```

## How to debug with Chrome DevTools

1. **Start the app with the local compose file**:
    ```bash
    docker compose up
    ```

2. **Open Chrome** and navigate to `chrome://inspect`

3. **Click "Configure"** and ensure `localhost:9229` is in the list

4. Your Node.js app will appear under **Remote Target** — click **inspect** to open DevTools

You can now set breakpoints, inspect variables, and step through code.

## How to access the Swagger UI

Once the application is running, you can access the interactive API documentation at:

[http://localhost:3000/swagger](http://localhost:3000/swagger)

## How to run the test suite

To run the unit tests:

```bash
npm test
```

To run tests with coverage report:

```bash
npm run test:coverage
```

## How to run E2E tests

E2E tests require a running MySQL database. The easiest way is to use Docker:

1.  **Start the database and application**:
    ```bash
    docker compose up -d
    ```

2. Run migration and db seeding
   ```bash
    npm run db:migrate
    ```
    ```bash
    npm run db:seed
    ```

2.  **Run E2E tests**:
    ```bash
    npm run test:e2e
    ```

The E2E tests will run against the containerized application and database, testing the full request/response flow including authentication, CRUD operations, and pagination.

## Key decisions

*   **Architecture**: Implemented a layered architecture (Controllers, Services, Data Access) with **Dependency Injection** to ensure separation of concerns and testability.
*   **Validation**: Used **Zod** for strict runtime request validation and environment variable verification.
*   **Database**: Chosen **Sequelize** as the ORM for its easy integration with MySQL.
*   **Error Handling**: Centralized error handling middleware that captures exceptions and returns structured JSON responses, ensuring no sensitive stack traces leak in production.
*   **Testing**: Utilized **Vitest** for a fast, modern testing experience.
*   **Docker**: Configured a multi-environment Docker setup (`docker-compose.yml` vs `docker-compose.local.yml`) to support both production-like execution and local development with hot-reloading.

## Cache Flow

The API implements a multi-layer caching strategy:

1. **Client-side cache** (Cache-Control) - Browser caches responses, no request made
2. **Server-side LRU cache** - In-memory cache, no database query
3. **ETag validation** - Returns 304 if content unchanged

```
                        ┌─────────────────────┐
                        │   GET /api/users    │
                        └──────────┬──────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                            │
│                                                              │
│      ┌─────────────────────────────┐                         │
│      │ Cache-Control still valid?  │                         │
│      │    (max-age not expired)    │                         │
│      └──────────────┬──────────────┘                         │
│              │             │                                 │
│             YES            NO                                │
│              │             │                                 │
│              ▼             ▼                                 │
│      ┌──────────────┐    ┌──────────────────────────┐        │
│      │ Use cached   │    │ Send request to server   │        │
│      │ response     │    │ + If-None-Match: <etag>  │        │
│      │              │    └─────────────┬────────────┘        │
│      │ (instant!)   │                  │                     │
│      └──────────────┘                  │                     │
│                                        │                     │
└────────────────────────────────────────┼─────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────┐
│  SERVER                                                      │
│                                                              │
│      ┌─────────────────────────────┐                         │
│      │     Check LRU Cache         │                         │
│      └──────────────┬──────────────┘                         │
│              │             │                                 │
│             HIT           MISS                               │
│              │             │                                 │
│              ▼             ▼                                 │
│      ┌──────────────┐    ┌──────────────┐                    │
│      │ ETag matches │    │  Query DB    │                    │
│      │ request?     │    │  + cache it  │                    │
│      └───────┬──────┘    └───────┬──────┘                    │
│          │       │               │                           │
│         YES      NO              ▼                           │
│          │       │       ┌──────────────┐                    │
│          │       │       │ ETag matches │                    │
│          │       │       │ request?     │                    │
│          │       │       └───────┬──────┘                    │
│          │       │           │       │                       │
│          │       │          YES      NO                      │
│          ▼       ▼           ▼       ▼                       │
│       ┌─────┐ ┌─────┐    ┌─────┐ ┌─────┐                     │
│       │ 304 │ │ 200 │    │ 304 │ │ 200 │                     │
│       │     │ │+body│    │     │ │+body│                     │
│       └─────┘ └─────┘    └─────┘ └─────┘                     │
│       X-Cache X-Cache    X-Cache X-Cache                     │
│         HIT     HIT        MISS    MISS                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Response headers:**
- `Cache-Control: private, max-age=600` - Users/Organizations (client caches 10 min)
- `Cache-Control: no-cache` - Orders (must revalidate with ETag)
- `ETag` - Hash of response body for validation
- `X-Cache: HIT/MISS` - Server-side cache status

**Cache invalidation:**
- Server cache entries invalidated on mutations (POST/PUT/DELETE)
- TTL: 10 minutes



