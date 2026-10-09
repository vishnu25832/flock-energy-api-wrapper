# Engineering Assignment Reflection — Flock Energy API Wrapper

## 1. Approach to the Assignment

I began by investigating how the Urja Operations Portal communicated with its backend. Since the assignment involved reverse engineering an existing application, I wanted to understand its actual HTTP requests before deciding how to implement the wrapper.

I used Chrome Developer Tools, particularly the Network tab, while interacting with the portal. I investigated requests associated with authentication, meter listing, energy readings, geographic information, and distribution transformers.

After identifying the relevant JSON endpoints, I implemented a Node.js and Express API wrapper using Axios. The wrapper reuses the portal's authenticated session and exposes the selected operations through REST endpoints.

This approach allowed me to work with the portal's existing data interface instead of scraping HTML pages or introducing browser automation.

## 2. Assumptions

The implementation relies on several assumptions:

- The supplied portal credentials remain valid.
- The portal's internal endpoints remain available and compatible with the implementation.
- The portal's response formats remain sufficiently stable for the current clients and services.
- The authenticated session remains usable while the application is running.
- The portal is the source of truth for meter, energy, geographic, and transformer data.

These assumptions simplify the implementation, but they also introduce dependencies on the existing portal. Changes to its authentication flow or response formats may require updates to the wrapper.

## 3. Hardest Problem and How I Solved It

The most challenging part was reproducing the portal's authentication behavior.

My initial Axios login request did not behave like the browser's request. Rather than continuing to guess, I compared the request details and adjusted the implementation to reproduce the login flow.

The final authentication client performs a request to `GET /login`, followed by a form-encoded `POST /login`. It includes relevant headers, including `X-SvelteKit-Action`, and uses a shared cookie jar to preserve session cookies for subsequent requests.

I used `axios-cookiejar-support` and `tough-cookie` to manage this session.

Once authentication worked, the remaining endpoints were easier to implement because the portal exposed structured JSON responses.

## 4. Mistake and What I Learned

One configuration issue I encountered on Windows involved the `USERNAME` environment variable conflicting with the application's intended configuration. I resolved it by using `PORTAL_EMAIL` as the environment variable for the portal email address.

I also learned the importance of reproducing the browser's actual request behavior instead of assuming that a conventional HTTP login request will work unchanged.

During the final documentation pass, I encountered another practical issue: copying Markdown code fences into JavaScript and JSON files caused syntax errors. This reinforced the importance of validating files after editing them and running the application or parser before considering a change complete.

These experiences showed me that small configuration and formatting mistakes can prevent an otherwise functional implementation from starting.

## 5. Implementation and Architecture

The public API provides the following endpoints:

- `GET /api/meters`
- `GET /api/meters/:meterId`
- `GET /api/meters/:meterId/energy`
- `GET /api/meters/:meterId/geo`
- `GET /api/transformers`

The project separates routes, controllers, services, and clients. A shared Axios client manages portal communication and cookie persistence, while centralized middleware handles errors passed through the Express error pipeline.

I also added Swagger UI and a static OpenAPI specification to make the API easier to inspect and integrate with other tools.

## 6. Verification Performed

I manually tested the API using PowerShell against the running application.

The verified checks included:

- Retrieving the meter list and observing its pagination metadata.
- Retrieving an individual meter and its geographic and energy data.
- Retrieving meter geographic coordinates.
- Retrieving the transformer list and observing its pagination metadata.
- Requesting an invalid meter and checking the resulting 404 response.
- Confirming that Swagger UI loads and groups the endpoints under the Meters and Transformers tags.
- Parsing `openapi.json` and confirming that it is valid JSON with five documented paths and eight component schemas.

These were manual checks. **An automated unit and integration test suite has not yet been implemented.** The current verification therefore does not provide repeatable automated regression coverage.

## 7. Design Decisions and Trade-offs

### Direct HTTP requests

I used Axios instead of browser automation because the portal already exposes JSON endpoints. This reduces overhead and avoids relying on rendered HTML.

### Cookie-based session persistence

A shared cookie jar allows the application to reuse session cookies between portal requests. The current implementation authenticates during startup but does not automatically renew an expired session.

### Layered architecture

Separating routes, controllers, services, and clients makes the code easier to navigate and maintain. It also creates clearer boundaries for future automated tests.

### No separate database

The wrapper retrieves data directly from the portal. This avoids maintaining a duplicate database, but it means availability and response latency depend on the upstream service.

### Documentation

Swagger UI supports interactive exploration, while `openapi.json` provides a static API contract. `README.md`, `PROTOCOL.md`, and this reflection document explain setup, investigation, and implementation decisions.

## 8. Current Limitations and Self-Critique

The implementation achieves the core objective of exposing selected portal functionality through a REST API. However, it is not yet production-hardened.

The main weaknesses are:

- No automated unit or integration tests.
- No automatic session renewal after authentication expires.
- No response caching or explicit freshness policy.
- Limited structured logging and upstream failure diagnostics.
- Dependence on internal portal endpoints that may change.
- OpenAPI schemas that may need further refinement as additional response variations are investigated.
- No verified production deployment in the current completion pass.

The most important next step would be to add automated tests around the controllers, validation behavior, authentication failures, and upstream errors. That would reduce the risk of regressions as the wrapper evolves.

## 9. What I Would Improve With Another Day

With one additional day, I would prioritize the work as follows:

1. **Automated testing:** Add unit and integration tests for successful responses, invalid parameters, missing meters, and upstream failures.
2. **Authentication resilience:** Detect expired sessions and implement controlled re-authentication.
3. **Error handling:** Improve upstream timeout handling, error classification, and diagnostic logging without exposing sensitive information.
4. **API contract:** Validate the OpenAPI document and expand response schemas using additional verified examples.
5. **Caching and freshness:** Evaluate whether caching is useful for frequently requested data and define suitable invalidation rules.
6. **Deployment:** Containerize the application and verify its configuration in a deployment environment.

I would prioritize correctness and reliability before adding more features.

## 10. Key Takeaways

This assignment helped me develop a more systematic approach to understanding an existing application's backend behavior.

The most valuable lesson was to investigate network requests before implementing an integration. By reproducing the portal's authentication flow, preserving its session cookies, and identifying the relevant JSON endpoints, I was able to build a modular API wrapper without scraping HTML or maintaining a separate database.

The assignment also reinforced the importance of validating assumptions, documenting observed behavior, testing changes after editing files, and clearly identifying the limitations of a working implementation.
