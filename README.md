# Flock Energy API Wrapper

## Project Overview

This project is my solution for the Flock Energy Backend Assignment.

The objective was to understand how the Urja Operations Portal works internally and build a REST API wrapper around it. Instead of interacting with the portal through the browser, this application communicates directly with the portal's internal endpoints and exposes the same information through clean REST APIs.

During development, I explored the application's network requests, understood its authentication flow, and identified the APIs used to retrieve meter information, energy readings, and location data. I then recreated this workflow using Express and Axios while maintaining the authenticated session with cookies.

---

## What this project can do

- Authenticate with the Urja Operations Portal
- Maintain the user session using cookies
- Retrieve all available meters
- Retrieve complete information for a specific meter
- Retrieve meter energy readings
- Retrieve meter location (latitude & longitude)
- Provide interactive API documentation using Swagger
- Return consistent error responses

---

## Tech Stack

- Node.js
- Express.js
- Axios
- axios-cookiejar-support
- tough-cookie
- dotenv
- Swagger UI

---

## Project Structure

```
src
├── clients
├── config
├── controllers
├── middleware
├── routes
├── services
└── utils

app.js
package.json
README.md
```

---

## Installation

Install the dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=3000
BASE_URL=https://urja-ops.flockenergy.tech

PORTAL_EMAIL=operator@urja.local
PORTAL_PASSWORD=urja-ops-2026
```

Run the application

```bash
npm run dev
```

The server starts on

```
http://localhost:3000
```

---

## API Documentation

Swagger UI is available at

```
http://localhost:3000/api-docs
```

---

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meters` | Returns the list of available meters |
| GET | `/api/meters/:meterId` | Returns meter details along with energy and location information |
| GET | `/api/meters/:meterId/energy` | Returns energy readings |
| GET | `/api/meters/:meterId/geo` | Returns geographical coordinates |

---

## Approach

Rather than scraping HTML pages, I inspected the browser's network activity to understand how the portal communicates with its backend. After identifying the required endpoints and login flow, I recreated the requests using Axios and managed authentication with a persistent cookie jar.

The project is organized into separate layers (routes, controllers, services, and clients) so that each component has a single responsibility and the code remains easy to maintain.

---

## Error Handling

The application uses centralized error handling to return meaningful responses instead of exposing internal server errors.

Example:

```json
{
  "success": false,
  "message": "Meter not found"
}
```

---

## Assumptions

While building this project, I assumed that:

- The provided credentials remain valid.
- The internal endpoints used by the portal remain unchanged.
- The authenticated session stays active while the application is running.

---

## What I would improve

Given more time, I would add:

- Automatic session renewal when authentication expires
- Response caching
- Unit and integration tests
- Input validation
- Structured logging
- Docker support for deployment

---

## Closing Note

This assignment was a good opportunity to understand how an existing web application works behind the scenes. The most interesting part was reverse engineering the authentication flow and identifying the internal APIs used by the portal. Once that was understood, the rest of the application was built around providing a clean and simple REST interface while keeping the implementation modular and easy to extend.