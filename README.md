# Flock Energy API Wrapper

A Node.js and Express REST API wrapper for the Urja Operations Portal. The application authenticates with the existing portal, maintains the session using cookies, and exposes endpoints for retrieving meters, energy readings, geographic coordinates, and distribution transformer data.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Configuration](#installation-and-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Example Requests](#example-requests)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Design Decisions and Trade-offs](#design-decisions-and-trade-offs)
- [Assumptions and Limitations](#assumptions-and-limitations)
- [Future Improvements](#future-improvements)
- [Additional Documentation](#additional-documentation)

## Overview

The goal of this project is to provide a clean REST interface over the existing Urja Operations Portal without scraping its HTML pages or rebuilding its underlying data system.

The wrapper uses the portal's existing HTTP endpoints and preserves the authenticated session across requests. It separates routing, request handling, business logic, and portal communication into distinct modules.

## Features

- Portal authentication using environment-configured credentials.
- Cookie-based session persistence.
- Paginated meter listing with an optional search query.
- Meter lookup by identifier.
- Energy-reading retrieval for a meter.
- Geographic-coordinate retrieval for a meter.
- Paginated distribution transformer listing.
- Centralized error handling.
- Interactive Swagger UI.
- Static OpenAPI specification.

## Technology Stack

- **Runtime:** Node.js
- **Web framework:** Express.js
- **HTTP client:** Axios
- **Session cookies:** `axios-cookiejar-support` and `tough-cookie`
- **Configuration:** `dotenv`
- **API documentation:** `swagger-jsdoc` and `swagger-ui-express`

## Architecture

The application follows a layered structure:

```text
Client Request
     |
     v
Express Routes
     |
     v
Controllers
     |
     v
Services
     |
     v
Portal Clients
     |
     v
Urja Operations Portal
```

- **Routes** expose the public API endpoints.
- **Controllers** validate request parameters and prepare HTTP responses.
- **Services** coordinate application operations.
- **Clients** send authenticated HTTP requests to the portal.
- **Axios client** maintains the shared cookie jar.
- **Error middleware** formats errors returned through the Express error pipeline.

The API reads data from the existing portal; it does not require a separate application database.

## Project Structure

```text
flock-energy-api-wrapper/
├── app.js
├── package.json
├── openapi.json
├── README.md
├── PROTOCOL.md
├── REFLECTION.md
└── src/
    ├── clients/
    │   ├── auth.client.js
    │   ├── dts.client.js
    │   ├── energy.client.js
    │   ├── geo.client.js
    │   └── meter.client.js
    ├── config/
    │   ├── config.js
    │   └── swagger.js
    ├── controllers/
    │   ├── dts.controller.js
    │   ├── energy.controller.js
    │   ├── geo.controller.js
    │   └── meter.controller.js
    ├── middleware/
    │   └── error.middleware.js
    ├── routes/
    │   ├── dts.routes.js
    │   └── meter.routes.js
    ├── services/
    │   ├── dts.service.js
    │   ├── energy.service.js
    │   ├── geo.service.js
    │   └── meter.service.js
    └── utils/
        └── axiosClient.js
```

## Prerequisites

- Node.js and npm.
- Network access to the Urja Operations Portal.
- Valid portal credentials supplied for the assignment.

## Installation and Configuration

Clone the repository:

```bash
git clone https://github.com/vishnu25832/flock-energy-api-wrapper.git
cd flock-energy-api-wrapper
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
BASE_URL=https://urja-ops.flockenergy.tech
PORTAL_EMAIL=your_portal_email
PORTAL_PASSWORD=your_portal_password
```

Replace the credential placeholders with your authorized portal credentials. Do not commit `.env` or expose real credentials in documentation, screenshots, or source control.

## Running the Application

Start the development server:

```bash
npm run dev
```

Or start the application normally:

```bash
npm start
```

The default local address is:

`http://localhost:3000`

The application authenticates with the portal during startup. If authentication fails, inspect the configured credentials, portal availability, and server logs.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API health/root response |
| GET | `/api/meters` | Retrieve a paginated meter list |
| GET | `/api/meters?q=J100000` | Search meters |
| GET | `/api/meters?page=2` | Retrieve another meter page |
| GET | `/api/meters/:meterId` | Retrieve meter details, geo data, and energy data |
| GET | `/api/meters/:meterId/energy` | Retrieve meter energy readings |
| GET | `/api/meters/:meterId/geo` | Retrieve meter geographic coordinates |
| GET | `/api/transformers` | Retrieve a paginated transformer list |

For meter and transformer listing endpoints, `page` must be a positive integer. The meter listing endpoint also accepts the optional `q` search parameter.

## Example Requests

Retrieve meters:

```bash
curl http://localhost:3000/api/meters?page=1
```

Search for a meter:

```bash
curl "http://localhost:3000/api/meters?q=J100000"
```

Retrieve an individual meter and its related data:

```bash
curl http://localhost:3000/api/meters/J100000
```

Retrieve energy readings:

```bash
curl http://localhost:3000/api/meters/J100000/energy
```

Retrieve geographic coordinates:

```bash
curl http://localhost:3000/api/meters/J100000/geo
```

Retrieve transformers:

```bash
curl http://localhost:3000/api/transformers?page=1
```

## API Documentation

Swagger UI:

`http://localhost:3000/api-docs`

Static OpenAPI specification:

[`openapi.json`](./openapi.json)

The specification documents the five main data endpoints, their parameters, response descriptions, and reusable schemas.

## Error Handling

The API uses centralized Express error middleware to return JSON error responses.

Example:

```json
{
  "success": false,
  "message": "Meter not found"
}
```

Invalid page parameters return HTTP 400. A meter that cannot be found returns HTTP 404. Other upstream or internal errors depend on the failure encountered and the response handling path.

## Design Decisions and Trade-offs

### Direct HTTP requests instead of browser automation

The wrapper uses the portal's HTTP endpoints rather than browser automation or HTML scraping. This reduces overhead and keeps the implementation focused on the JSON data interface.

### Shared cookie jar

A shared cookie jar allows the HTTP client to reuse session cookies between requests. The current implementation establishes authentication during startup; automatic session renewal is not implemented.

### Layered architecture

Routes, controllers, services, and clients are separated to improve readability and make future testing and maintenance easier.

### No separate database

The application retrieves data from the portal instead of storing a second copy. This avoids database setup and data synchronization concerns, but responses depend on portal availability.

## Assumptions and Limitations

- The supplied portal credentials remain valid.
- The portal's internal endpoints and response formats remain compatible with the implementation.
- The portal is reachable from the machine running the API.
- The authenticated session remains usable while the application is running.
- The API currently relies on the portal for its source data.
- Automated session renewal and caching are not implemented.
- Automated test coverage has not yet been added.

## Future Improvements

- Add automated unit and integration tests.
- Implement session-expiry detection and re-authentication.
- Add structured logging and request correlation identifiers.
- Improve upstream timeout and error handling.
- Add response caching where appropriate, with explicit freshness rules.
- Add Docker support.
- Expand OpenAPI response examples and schemas as additional portal responses are verified.

## Additional Documentation

- [Portal protocol investigation and endpoint notes](./PROTOCOL.md)
- [Implementation reflection and lessons learned](./REFLECTION.md)
- [Static OpenAPI specification](./openapi.json)

## License

This project was created as an engineering assignment. No separate open-source license is declared.
```