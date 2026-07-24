## How I Approached the Assignment

Before writing any code, I spent some time understanding how the Urja Operations Portal worked. Since the assignment was about reverse engineering an existing application, I wanted to avoid making assumptions and instead understand how the portal actually communicated with its backend.

The first thing I did was log into the portal and keep Chrome Developer Tools open. I mainly used the **Network** tab to observe what happened whenever I opened the meter list, viewed a meter, checked energy data, or opened the geo location page.

After a while, a pattern became clear. The frontend wasn't generating this data itself—it was calling a few JSON endpoints in the background. Once I identified those endpoints, I knew I could build the API wrapper without scraping HTML pages.

---

## Authentication

Authentication took the most time.

At first, I tried reproducing the login request using Axios, but the request kept failing because my implementation didn't exactly match what the browser was sending. I compared the browser request with my own implementation until I was able to reproduce the same behavior.

Once the login succeeded, the portal returned a session cookie. I stored that cookie using **axios-cookiejar-support** and **tough-cookie**, which allowed every later request to reuse the authenticated session.

During this process I also discovered an issue on Windows where the environment variable `USERNAME` conflicted with my own `.env` variable. Renaming it to `PORTAL_EMAIL` fixed the problem.

---

## Endpoints I Identified

The following endpoints were enough to build the wrapper API.

```
POST /login

GET /portal/meters/search

GET /portal/meters/{meterId}/energy

GET /portal/meters/{meterId}/geo
```

Since these endpoints already returned JSON responses, I decided not to use browser automation or HTML scraping.

---

## Building the API

After authentication was working, I built a separate Express application around those endpoints.

I kept the project structure simple by separating responsibilities into different folders.

- Routes handle incoming requests.
- Controllers process the request.
- Services communicate with the legacy portal.
- Clients handle authentication and HTTP communication.
- Middleware is responsible for centralized error handling.

This made it easier to keep the code organized as the project grew.

---

## Design Decisions

While building the project I made a few decisions that I felt would keep the implementation simple and maintainable.

- Used Axios instead of browser automation because the portal already exposed JSON APIs.
- Logged into the portal once and reused the authenticated session.
- Added centralized error handling for consistent API responses.
- Added Swagger so the endpoints can be explored and tested easily.

---

## Challenges

The biggest challenge wasn't building the API itself—it was understanding how the portal authenticated users.

Once authentication was working, implementing the remaining endpoints became fairly straightforward because the portal already exposed structured JSON responses.

Another small issue I encountered was the Windows `USERNAME` environment variable conflicting with my own configuration, which I solved by using `PORTAL_EMAIL` instead.

---

## Final Thoughts

This assignment gave me a better understanding of how existing web applications communicate with their backend services. Rather than trying to imitate browser behavior, I focused on understanding the network traffic first and then building a clean API around the discovered endpoints.

If I were extending this project further, I would add automated tests, request validation, session refresh logic, and response caching.