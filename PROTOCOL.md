# Urja Operations Portal — Protocol Investigation

## 1. Objective

The objective of this investigation was to understand how the Urja Operations Portal communicates with its backend and use that understanding to build a REST API wrapper.

Rather than scraping HTML pages or introducing browser automation, I focused on identifying the portal's HTTP endpoints, reproducing its authentication flow, and consuming its JSON responses.

The wrapper exposes selected portal functionality through an Express application while preserving the existing portal as the source of data.

## 2. Investigation Approach

I used the browser's Developer Tools, particularly the Network tab, to investigate requests associated with logging in, viewing meters, retrieving energy readings, and viewing geographic information.

This helped identify the portal's HTTP-based interface and guided the implementation of the API clients.

The resulting implementation uses Axios to communicate with the portal. The findings below distinguish endpoint behavior confirmed by the implementation and runtime responses from assumptions about how the portal may behave internally.

## 3. Authentication and Session Management

### 3.1 Login sequence

The authentication client performs these requests:

1. Sends `GET /login` to initialize the login flow.
2. Sends `POST /login` with URL-encoded credentials.
3. Includes request headers such as `Origin`, `Referer`, `Accept`, `Content-Type`, and `X-SvelteKit-Action`.
4. Uses a shared cookie jar so subsequent requests can reuse session cookies.

The configured credentials are loaded from environment variables through `dotenv`.

The application uses:

- `axios` for HTTP requests.
- `axios-cookiejar-support` to integrate cookie handling with Axios.
- `tough-cookie` to manage the cookie jar.

### 3.2 Session lifecycle

The application logs in during startup and only begins listening for API requests after the login function succeeds.

The shared Axios client retains the cookie jar for subsequent portal requests.

**Current limitation:** automatic session renewal and re-authentication after session expiry are not implemented. If the portal invalidates the session, requests may fail until the application is restarted or the authentication flow is otherwise restored.

### 3.3 Configuration issue encountered

During development on Windows, the environment variable `USERNAME` conflicted with the application's intended configuration. Using `PORTAL_EMAIL` for the portal email address resolved the configuration conflict.

The relevant environment variables are:

- `PORT`
- `BASE_URL`
- `PORTAL_EMAIL`
- `PORTAL_PASSWORD`

Credentials belong in the local `.env` file and should not be committed to source control.

## 4. Portal Endpoints

The following portal endpoints are used by the implementation.

| Method | Portal endpoint | Purpose |
|---|---|---|
| GET | `/login` | Initializes the login flow |
| POST | `/login` | Submits login credentials |
| GET | `/portal/meters/search` | Retrieves and searches meters |
| GET | `/portal/meters/{meterId}/energy` | Retrieves energy readings for a meter |
| GET | `/portal/meters/{meterId}/geo` | Retrieves geographic information for a meter |
| GET | `/portal/dts` | Retrieves distribution transformer data |

The meter search endpoint accepts the `q` search parameter and the `page` pagination parameter. The transformer endpoint accepts `page`.

The wrapper uses these JSON endpoints directly rather than scraping rendered HTML.

## 5. Observed Response Behavior

### 5.1 Meter listing

A successful request to:

`GET /api/meters?page=1`

returned an object with this structure:

```json
{
  "data": [
    {
      "meterId": "J100000",
      "serialNo": "SE33962",
      "make": "HPL",
      "phaseType": "single",
      "installStatus": "Decommissioned",
      "dtCode": "DT-001"
    }
  ],
  "total": 403,
  "page": 1,
  "pageSize": 20
}
```

The example above is shortened to one item for readability. The observed first page contained 20 meter records, and the response reported 403 total records.

The meter records included the following fields:

- `meterId`
- `serialNo`
- `make`
- `phaseType`
- `installStatus`
- `dtCode`

The response values show that identifiers and descriptive fields are represented as strings.

### 5.2 Transformer listing

A successful request to:

`GET /api/transformers?page=1`

returned a paginated object with `data`, `total`, `page`, and `pageSize`.

The observed first page contained 20 transformer records, and the response reported 40 total records.

The transformer records included:

- `code`
- `name`
- `feederCode`
- `capacityKva`

The observed `capacityKva` values were numeric.

### 5.3 Geographic information

A successful request to:

`GET /api/meters/J100000/geo`

returned:

```json
{
  "data": {
    "latitude": "26.938961002479868",
    "longitude": "75.83095696146852"
  }
}
```

The coordinates are returned as strings in the observed response.

### 5.4 Energy readings

Energy data is available through:

`GET /api/meters/J100000/energy`

The observed energy records included fields such as:

- `timestamp`
- `kwh`
- `kvah`
- `voltR`

The inspected data included readings at 30-minute intervals. The values shown in the inspected records were strings.

This documents the observed sample, not a guarantee that every meter has the same fields or that every time range uses the same interval.

### 5.5 Combined meter response

The wrapper also exposes:

`GET /api/meters/J100000`

The implementation combines the result of the meter lookup with geographic information and energy data. Its top-level response contains `meter`, `geo`, and `energy`.

The individual meter is resolved through the portal's meter search endpoint rather than through a separate meter-details endpoint in the current implementation.

## 6. Wrapper-to-Portal Mapping

| Public API endpoint | Portal endpoint |
|---|---|
| `GET /api/meters` | `GET /portal/meters/search` |
| `GET /api/meters/:meterId` | Meter search, followed by energy and geographic requests |
| `GET /api/meters/:meterId/energy` | `GET /portal/meters/:meterId/energy` |
| `GET /api/meters/:meterId/geo` | `GET /portal/meters/:meterId/geo` |
| `GET /api/transformers` | `GET /portal/dts` |

The combined meter endpoint performs multiple portal requests to construct its response.

## 7. Validation and Error Handling

The public meter-list and transformer-list endpoints validate the `page` query parameter. If supplied, it must be a positive integer; otherwise, the wrapper returns HTTP 400.

The meter lookup returns HTTP 404 when the requested meter cannot be found.

The application also includes centralized Express error middleware to produce JSON error responses. Upstream failures may be propagated or translated depending on the relevant controller and error-handling path.

## 8. Architecture

The wrapper separates responsibilities across several layers:

- **Routes:** define public API endpoints and their documentation.
- **Controllers:** validate inputs and construct HTTP responses.
- **Services:** coordinate operations and delegate to clients.
- **Clients:** communicate with the portal.
- **Shared Axios client:** provides the base URL and cookie-jar configuration.
- **Error middleware:** formats errors passed through the Express error pipeline.

This separation makes the portal integration easier to maintain and individual components easier to test.

## 9. Design Decisions and Trade-offs

### Direct HTTP communication

I chose direct HTTP requests because the portal exposes JSON endpoints. This avoids the additional overhead and fragility of browser automation or HTML scraping.

### Cookie-based session persistence

A shared cookie jar avoids manually copying session cookies into every request. However, the current implementation does not automatically renew an expired session.

### No local database

The wrapper retrieves data from the existing portal instead of maintaining a second data store. This reduces infrastructure requirements but means the API depends on portal availability.

### Layered architecture

Separating routes, controllers, services, and clients keeps HTTP handling separate from portal communication.

### Swagger and OpenAPI

Swagger UI makes the endpoints easier to explore and test. The static `openapi.json` provides a separate API contract suitable for inspection and tooling.

## 10. Known Limitations

- Authentication is performed during application startup.
- Automatic session renewal is not implemented.
- The wrapper depends on the portal's internal endpoints remaining compatible.
- There is no local cache or database.
- Automated unit and integration tests have not yet been added.
- Portal response formats may change independently of the wrapper.

## 11. Further Investigation

With more time, I would investigate session-expiry behavior, upstream timeout behavior, response consistency across different meters, and the portal's pagination limits.

I would also add automated tests for successful requests, invalid inputs, missing meters, and upstream failures.

## 12. Conclusion

The investigation established a direct HTTP-based integration with the Urja Operations Portal. By reproducing the login flow, retaining session cookies, and identifying the endpoints for meters, energy, geographic information, and transformers, I built a modular REST API wrapper without introducing browser automation or a separate data store.
```