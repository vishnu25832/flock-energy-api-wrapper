Urja Operations Portal — Protocol Investigation
1. Objective
This document records the investigation and implementation decisions made while building the Flock Energy API Wrapper. The wrapper communicates with the Urja Operations Portal through HTTP requests and exposes selected data through an Express REST API.

Rather than scraping HTML pages or introducing browser automation, I focused on identifying the portal's HTTP endpoints, reproducing its authentication flow, and consuming its JSON responses. The portal remains the source of data; the wrapper does not maintain a separate application database.
2. Investigation Approach
I used the browser's Developer Tools Network tab to inspect requests associated with logging in, viewing meters, retrieving energy readings, and viewing geographic information. This helped identify the portal's HTTP interface and guided the API client implementation.

The wrapper uses Axios to communicate with the portal. The notes below distinguish observed response behavior from assumptions about the portal's internal implementation.
3. Authentication and Session Management
3.1 Login flow
The authentication client performs the login flow using the portal's login endpoint. During implementation, the request sequence and headers were compared with the browser's network activity until the Axios request successfully authenticated.

The implementation uses:
- axios for HTTP requests.
- axios-cookiejar-support to integrate cookie handling with Axios.
- tough-cookie to maintain a shared cookie jar.
- dotenv to load configuration from environment variables.
The configured variables are PORT, BASE_URL, PORTAL_EMAIL, and PORTAL_PASSWORD. Credentials belong in the local .env file and must not be committed to source control.
3.2 Session lifecycle
The application authenticates during startup and begins listening for API requests only after login succeeds. The shared Axios client reuses the session cookies for subsequent portal requests.

Current limitation: automatic session renewal and re-authentication after session expiry are not implemented. If the portal invalidates the session, requests may fail until authentication is restored or the application is restarted.
3.3 Configuration issue encountered
During development on Windows, the environment variable USERNAME conflicted with the application's intended configuration. Using PORTAL_EMAIL for the portal email address avoided that conflict.
4. Portal Endpoints
The implementation uses the following portal endpoints:
Method	Portal endpoint	Purpose
GET	/login	Initializes the login flow, if required by the portal
POST	/login	Submits login credentials
GET	/portal/meters/search	Retrieves and searches meters
GET	/portal/meters/{meterId}/energy	Retrieves energy readings for a meter
GET	/portal/meters/{meterId}/geo	Retrieves geographic information for a meter


The meter search endpoint accepts q for search and page for pagination. The transformer wrapper endpoint is GET /api/transformers; its upstream path is implemented in the transformer client. Confirm that path against the client and portal Network activity before describing it as independently observed.

The wrapper uses JSON endpoints directly rather than scraping rendered HTML.
5. Observed Response Behavior
5.1 Meter listing
A successful request to GET /api/meters?page=1 returned a paginated object with data, total, page, and pageSize. The observed first page contained 20 records and reported 403 total records. A shortened example of the observed data shape is:
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
The example is shortened to one record for readability. Observed meter fields included meterId, serialNo, make, phaseType, installStatus, and dtCode. These observations do not guarantee every response contains every field.
5.2 Transformer listing
A successful request to GET /api/transformers?page=1 returned a paginated object containing data, total, page, and pageSize. The observed first page contained 20 transformer records and reported 40 total records. Observed fields included code, name, feederCode, and capacityKva; the inspected capacityKva values were numeric.
5.3 Geographic information
A successful request to GET /api/meters/J100000/geo returned location data. The inspected response included latitude and longitude as strings, for example:
{
  "data": {
    "latitude": "26.938961002479868",
    "longitude": "75.83095696146852"
  }
}
These values are an example of an observed response, not a guarantee that every meter has location data.
5.4 Energy readings
Energy data is available through GET /api/meters/J100000/energy. The inspected records included timestamp, kwh, kvah, and voltR. The inspected sample contained readings at 30-minute intervals, and the values shown were strings. This describes the sample inspected, not every meter or time range.
5.5 Combined meter response
GET /api/meters/J100000 combines the meter lookup with geographic information and energy data. Its top-level response contains meter, geo, and energy. The meter itself is resolved through the portal's meter search endpoint rather than a separate meter-details endpoint in the current implementation.
6. Wrapper-to-Portal Mapping
Public API endpoint	Portal operation
GET /api/meters	GET /portal/meters/search
GET /api/meters/:meterId	Meter search followed by energy and geographic requests
GET /api/meters/:meterId/energy	GET /portal/meters/:meterId/energy
GET /api/meters/:meterId/geo	GET /portal/meters/:meterId/geo
GET /api/transformers	Transformer client operation; verify its upstream path against the client and Network activity


The combined meter endpoint performs multiple portal requests to construct its response.
7. Wrapper Endpoints, Validation, and Errors
The Express application exposes:
Method	Wrapper path	Purpose
GET	/	Health/status response
GET	/api/meters	Retrieve and search meters
GET	/api/meters/:meterId	Return meter details with energy and geographic data
GET	/api/meters/:meterId/energy	Retrieve energy readings
GET	/api/meters/:meterId/geo	Retrieve geographic data
GET	/api/transformers	Retrieve distribution transformers


The meter-list endpoint accepts optional page and q query parameters. The transformer endpoint accepts an optional page parameter. For both listing endpoints, a supplied page must be a positive integer; invalid values return HTTP 400.

An invalid meter lookup was tested and returned HTTP 404 with the message Meter not found. The application also includes centralized Express error middleware for JSON error responses. Error behavior for every possible upstream failure has not been exhaustively tested, and upstream errors may be propagated or translated depending on the controller and middleware path.
8. Architecture
The wrapper separates responsibilities across several layers:
- Routes: define public API endpoints and their documentation.
- Controllers: validate inputs and construct HTTP responses.
- Services: coordinate operations and delegate to clients.
- Clients: communicate with the portal.
- Shared Axios client: provides base URL and cookie-jar configuration.
- Error middleware: formats errors passed through the Express error pipeline.
This separation keeps HTTP request handling distinct from portal communication and supports maintainability and testing.
9. Design Decisions and Trade-offs
Direct HTTP communication
I chose direct HTTP requests because the portal exposes JSON endpoints. This avoids the additional overhead and fragility of browser automation or HTML scraping.
Cookie-based session persistence
A shared cookie jar allows the HTTP client to reuse session cookies without manually copying them into every request. The current implementation does not automatically renew an expired session.
No local database
The wrapper retrieves data from the portal instead of maintaining a second data store. This reduces infrastructure requirements but makes the API dependent on portal availability.
Swagger and OpenAPI
Swagger UI makes the endpoints easier to explore and test. The static openapi.json provides a separate API specification for inspection and tooling.
10. Known Limitations and Risks
- Authentication is performed during application startup.
- Automatic session renewal is not implemented.
- The wrapper depends on the portal's internal endpoints and response formats remaining compatible.
- There is no local cache or database.
- Automated unit and integration tests have not been added as part of the verified checks described here.
- Error behavior for every possible upstream failure has not been exhaustively tested.
- The upstream transformer path should be confirmed against the implementation and portal Network activity before being described as independently observed.
11. Further Investigation
With more time, I would investigate session-expiry behavior, upstream timeout behavior, response consistency across different meters, and the portal's pagination limits. I would also add automated tests for successful requests, invalid inputs, missing meters, and upstream failures.
12. Conclusion
The investigation established an HTTP-based integration with the Urja Operations Portal. By reproducing the login flow, retaining session cookies, and identifying endpoints for meters, energy, and geographic information, I built a modular REST API wrapper without introducing browser automation or a separate data store. The transformer endpoint is exposed by the wrapper; its exact upstream route should be confirmed against the client implementation and portal network activity before being claimed as an independently observed endpoint.