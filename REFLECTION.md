## How I Approached the Assignment

Before writing the API wrapper, I first explored how the Urja Operations Portal worked. Since the assignment involved reverse engineering an existing application, I wanted to understand the portal's actual communication flow instead of making assumptions.

I used Chrome Developer Tools, particularly the **Network** tab, while interacting with the portal. I observed the requests generated when viewing meters, energy readings, geographical information, and distribution transformers.

This allowed me to identify the JSON endpoints used by the portal and build the wrapper around those endpoints rather than scraping HTML pages.

---

## Authentication

Authentication was the most challenging part of the implementation.

I initially attempted to reproduce the login request using Axios, but the request did not behave exactly like the browser request. I compared the browser request details with my implementation and adjusted the request until authentication succeeded.

The portal returns an authenticated session cookie after login. I used **axios-cookiejar-support** together with **tough-cookie** to store and reuse that session for subsequent requests.

The application performs authentication when the server starts:

1. Request the login page.
2. Submit the login credentials.
3. Store the returned session cookie.
4. Reuse the authenticated session for portal API requests.

I also encountered a Windows environment-variable naming issue where `USERNAME` conflicted with the system environment. I changed the application configuration to use `PORTAL_EMAIL` instead.

---

## Endpoints Identified

The main portal endpoints identified during reverse engineering were:

```text
POST /login

GET /portal/meters/search

GET /portal/meters/{meterId}/energy

GET /portal/meters/{meterId}/geo

GET /portal/dts
````

These endpoints returned structured JSON data, which made it unnecessary to use browser automation or HTML scraping.

---

## API Implementation

I built an Express REST API around the identified portal endpoints.

The public API exposes:

```text
GET /api/meters

GET /api/meters/{meterId}

GET /api/meters/{meterId}/energy

GET /api/meters/{meterId}/geo

GET /api/transformers
```

The meter details endpoint also combines the meter's basic information with its energy and geographical data.

---

## Project Architecture

The application is divided into several layers.

### Routes

Routes define the public API endpoints and connect them to the appropriate controllers.

### Controllers

Controllers handle HTTP requests, validate request parameters, and return API responses.

### Services

Services coordinate the application logic and communicate with the portal clients.

### Clients

Clients are responsible for making HTTP requests to the Urja Operations Portal.

### Middleware

The error middleware provides centralized handling for application errors and returns consistent JSON responses.

This separation keeps the application modular and makes individual components easier to maintain.

---

## Pagination and Validation

Both meters and transformers support pagination.

For example:

```text
GET /api/meters?page=2

GET /api/transformers?page=2
```

The `page` parameter is validated before making the portal request.

Invalid values such as:

```text
?page=0

?page=abc
```

return:

```json
{
  "success": false,
  "message": "page must be a positive integer"
}
```

When the parameter is omitted, the API defaults to page 1.

---

## Error Handling

The application uses centralized Express error handling.

For example, requesting an invalid meter ID produces:

```json
{
  "success": false,
  "message": "Meter not found"
}
```

This prevents raw internal errors from being exposed through the API.

---

## Design Decisions

### Axios Instead of Browser Automation

The portal already exposes JSON APIs used by its frontend. Direct HTTP requests were therefore simpler and more appropriate than controlling a browser.

### Cookie-Based Session Management

The portal uses an authenticated session, so the application maintains the session using a cookie jar rather than logging in for every request.

### Layered Architecture

Separating routes, controllers, services, and clients keeps the code organized and makes future changes easier.

### Swagger Documentation

Swagger UI was added to make the REST API easy to inspect and test.

An OpenAPI specification is also generated as:

```text
openapi.json
```

---

## Testing

I manually tested the implemented endpoints using PowerShell and verified successful responses from the running API.

The following functionality was tested.

### Meters

```text
GET /api/meters

GET /api/meters?page=2

GET /api/meters?page=0

GET /api/meters?page=abc
```

The valid requests returned meter data, while invalid pagination values returned the expected validation error.

### Meter Details

```text
GET /api/meters/J100000

GET /api/meters/INVALID123
```

A valid meter returned its details, energy information, and geographical information.

An invalid meter returned:

```json
{
  "success": false,
  "message": "Meter not found"
}
```

### Energy

```text
GET /api/meters/J100000/energy
```

The endpoint successfully returned energy readings.

### Geo

```text
GET /api/meters/J100000/geo
```

The endpoint successfully returned latitude and longitude data.

### Transformers

```text
GET /api/transformers

GET /api/transformers?page=2

GET /api/transformers?page=0

GET /api/transformers?page=abc
```

Valid requests returned transformer data, while invalid pagination values returned the expected validation error.

### Swagger

Swagger UI was configured and the generated OpenAPI specification contains the following public API paths:

```text
/api/meters

/api/meters/{meterId}

/api/meters/{meterId}/energy

/api/meters/{meterId}/geo

/api/transformers
```

---

## Challenges

The main challenge was reproducing the portal's authentication behavior correctly.

The browser request contained specific headers and form data that needed to be reproduced by the Axios client. Once the authentication flow was understood and the session cookie was persisted, the remaining API requests were considerably simpler.

Another issue was the Windows `USERNAME` environment variable conflicting with the application's configuration. Using `PORTAL_EMAIL` resolved the problem.

---

## What I Would Improve

If I continued developing the project, I would add:

* Automated unit and integration tests
* Automatic session renewal when the portal session expires
* Response caching where appropriate
* Structured logging
* More comprehensive request validation
* More detailed OpenAPI schemas
* Docker support

These improvements were outside the core implementation completed for the assignment.

---

## Final Reflection

The most valuable part of this assignment was learning to understand an existing application's backend communication instead of trying to reproduce its frontend behavior.

Inspecting the Network requests made it possible to identify the actual APIs used by the portal. From there, I could implement a lightweight REST wrapper using Express and Axios while maintaining the authenticated session with cookies.

The project also reinforced the value of separating HTTP communication, application logic, request handling, and error handling into different layers.

Overall, the assignment provided practical experience with reverse engineering API communication, session-based authentication, REST API design, pagination, validation, and OpenAPI documentation.
