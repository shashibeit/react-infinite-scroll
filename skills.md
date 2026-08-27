# Stateful to Stateless SPA CSRF Migration Skill

## Objective

Migrate the existing React + Spring Boot application's CSRF implementation from a server-session-dependent model to a stateless SPA-compatible CSRF model using Spring Security's `CookieCsrfTokenRepository`.

The application is deployed across multiple OpenShift/OCP clusters and requests may be routed to different pods/clusters.

Current problem:

```text
React SPA
   |
   v
Load Balancer / Akamai / Edge Router
   |
   +------> OCP DEV1
   |
   +------> OCP DEV2
```

The current CSRF implementation is suspected to depend on `HttpSession`.

A CSRF token generated or stored while a request hits DEV1 may fail validation when the next request hits DEV2.

Target design:

```text
React SPA
    |
    | Cookie:
    | XSRF-TOKEN=<token>
    |
    | Header:
    | X-XSRF-TOKEN=<token>
    |
    v
Akamai / Edge / OCP Router
       /          \
      /            \
 OCP DEV1        OCP DEV2
    |               |
    +---------------+
            |
CookieCsrfTokenRepository

No CSRF state stored in HttpSession.
No shared Redis.
No sticky-session dependency.
```

---

# Important Rules

Before changing any code:

1. Inspect the existing Spring Security configuration.
2. Inspect the existing React CSRF implementation.
3. Identify the current authentication mechanism.
4. Identify whether `HttpSession`, `JSESSIONID`, or session-backed security state is still used.
5. Do not remove or redesign authentication unless required for this CSRF migration.
6. Do not disable CSRF globally.
7. Preserve all existing endpoint authorization rules.
8. Preserve all existing authentication providers and filters unless they directly depend on server-side session state.
9. Make changes incrementally.
10. Add tests before declaring the migration complete.

Do not assume class names or file locations.

Search the repository and determine the actual implementation.

---

# Phase 1 — Analyze Existing Backend Security

Search the Spring Boot application for:

```text
SecurityFilterChain
WebSecurityConfigurerAdapter
HttpSecurity
csrf(
HttpSessionCsrfTokenRepository
CsrfTokenRepository
CsrfToken
CsrfFilter
CsrfTokenRequestHandler
SessionCreationPolicy
sessionManagement
SecurityContextRepository
HttpSessionSecurityContextRepository
RequestCache
JSESSIONID
HttpSession
getSession(
```

Also search for custom classes containing terms such as:

```text
Csrf
XSRF
SecurityFilter
SecurityConfig
AuthenticationFilter
AuthorizationFilter
TokenFilter
```

Create an analysis summary before modifying code.

The summary should identify:

```text
Security configuration class:
Current Spring Security version:
Current Spring Boot version:

Current CSRF repository:
Current CSRF request handler:

Current CSRF cookie name:
Current CSRF header name:

Current session policy:

Authentication mechanism:
- Bearer token
- JWT
- OAuth2
- OIDC
- session authentication
- custom authentication
- other

Does application create HttpSession?
YES / NO

Does authentication depend on HttpSession?
YES / NO / UNKNOWN

Does CSRF depend on HttpSession?
YES / NO

Frontend HTTP library:
Axios / fetch / custom client

Current frontend CSRF handling:
<description>
```

Do not begin implementation until this analysis is complete.

---

# Phase 2 — Identify Existing CSRF Flow

Trace the current CSRF lifecycle end-to-end.

Determine:

```text
1. Where CSRF token is generated.
2. Where it is persisted.
3. How React obtains the token.
4. Where React stores the token.
5. Which request header React sends.
6. Which Spring component validates the token.
7. Whether login regenerates/removes the CSRF token.
8. Whether logout clears the token.
```

Document the current flow.

Example only:

```text
GET /csrf
   |
Spring generates token
   |
HttpSessionCsrfTokenRepository
   |
Session stores token
   |
React receives token
   |
React sends X-CSRF-TOKEN
   |
POST /api/*
```

Identify precisely which parts must be removed or replaced.

---

# Phase 3 — Remove Session-Based CSRF Storage

If the application explicitly uses:

```java
new HttpSessionCsrfTokenRepository()
```

remove that repository.

Also remove CSRF-specific code that:

```text
stores CSRF tokens in HttpSession
reads CSRF tokens from HttpSession
creates HttpSession only for CSRF
returns CSRF values from session attributes
```

Do NOT remove session-related code that authentication still legitimately requires without first determining its impact.

The goal is specifically:

```text
CSRF token state != HttpSession
```

---

# Phase 4 — Configure CookieCsrfTokenRepository

Configure Spring Security to use:

```java
CookieCsrfTokenRepository.withHttpOnlyFalse()
```

Expected defaults:

```text
Cookie name:
XSRF-TOKEN

Request header:
X-XSRF-TOKEN
```

Use the standard names unless the existing frontend contract requires different names.

Example target configuration:

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    CookieCsrfTokenRepository csrfTokenRepository =
            CookieCsrfTokenRepository.withHttpOnlyFalse();

    csrfTokenRepository.setCookiePath("/");

    http.csrf(csrf -> csrf
            .csrfTokenRepository(csrfTokenRepository)
    );

    return http.build();
}
```

However, do NOT stop here.

Check the Spring Security version because Spring Security 6+ SPA applications require special handling for deferred CSRF tokens and BREACH-protected token resolution.

---

# Phase 5 — Implement SPA-Compatible CsrfTokenRequestHandler

For Spring Security 6+, implement an SPA-compatible `CsrfTokenRequestHandler`.

Use Spring Security's SPA pattern.

Create a class similar to:

```java
final class SpaCsrfTokenRequestHandler
        implements CsrfTokenRequestHandler {

    private final CsrfTokenRequestHandler plain =
            new CsrfTokenRequestAttributeHandler();

    private final CsrfTokenRequestHandler xor =
            new XorCsrfTokenRequestAttributeHandler();

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            Supplier<CsrfToken> csrfToken) {

        this.xor.handle(request, response, csrfToken);

        // Force deferred token to be loaded so
        // CookieCsrfTokenRepository writes XSRF-TOKEN.
        csrfToken.get();
    }

    @Override
    public String resolveCsrfTokenValue(
            HttpServletRequest request,
            CsrfToken csrfToken) {

        String headerValue =
                request.getHeader(csrfToken.getHeaderName());

        if (StringUtils.hasText(headerValue)) {
            return this.plain.resolveCsrfTokenValue(
                    request,
                    csrfToken
            );
        }

        return this.xor.resolveCsrfTokenValue(
                request,
                csrfToken
        );
    }
}
```

Use the imports compatible with the project's Spring Security version.

Do not blindly paste incompatible APIs.

Compile after implementation.

---

# Phase 6 — Connect the SPA Handler to Spring Security

Configure:

```java
CookieCsrfTokenRepository csrfRepository =
        CookieCsrfTokenRepository.withHttpOnlyFalse();

csrfRepository.setCookiePath("/");
```

Then:

```java
http.csrf(csrf -> csrf
        .csrfTokenRepository(csrfRepository)
        .csrfTokenRequestHandler(
                new SpaCsrfTokenRequestHandler()
        )
);
```

Preserve all existing:

```text
authorizeHttpRequests
requestMatchers
authenticationProvider
oauth2Login
oauth2ResourceServer
exceptionHandling
cors
headers
custom filters
```

unless there is a proven reason to change them.

---

# Phase 7 — Evaluate SessionCreationPolicy

Inspect the existing authentication model before setting:

```java
SessionCreationPolicy.STATELESS
```

Only set `STATELESS` if authentication does not depend on the HTTP session.

Examples that are normally compatible with stateless security:

```text
Authorization: Bearer <JWT>

OAuth2 Resource Server bearer token

custom signed bearer token

HTTP Basic where credentials are supplied every request
```

Potentially incompatible implementations include authentication that depends on:

```text
JSESSIONID
SecurityContext stored in HttpSession
formLogin session
server-side login state
saved request state
session-based SSO
```

If authentication is already stateless, configure:

```java
http.sessionManagement(session ->
        session.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
        )
);
```

Then verify no Spring Security authentication state is expected from the session.

Important:

`STATELESS` means Spring Security should neither create an HTTP session nor use it to retrieve the `SecurityContext`.

Do not introduce this setting solely because CSRF is being migrated.

First verify authentication compatibility.

---

# Phase 8 — Inspect React HTTP Client

Search the React application for:

```text
axios.create
axios.interceptors
fetch(
X-CSRF-TOKEN
X-XSRF-TOKEN
XSRF-TOKEN
document.cookie
credentials:
withCredentials
csrf
xsrf
```

Identify the common HTTP client.

Prefer changing one centralized API layer rather than individual API calls.

---

# Phase 9 — Configure React to Send the CSRF Token

Target browser flow:

```text
Spring response
      |
      | Set-Cookie:
      | XSRF-TOKEN=<token>
      v
Browser

React reads XSRF-TOKEN
      |
      | sends
      v
X-XSRF-TOKEN: <token>
```

If Axios already provides compatible XSRF functionality, use it instead of duplicating token handling.

Otherwise implement centralized handling.

Example:

```typescript
function getCookie(name: string): string | null {
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    return decodeURIComponent(
        cookie.substring(cookie.indexOf("=") + 1)
    );
}
```

Then:

```typescript
api.interceptors.request.use(config => {

    const method =
        config.method?.toUpperCase();

    const requiresCsrf =
        method &&
        !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

    if (requiresCsrf) {

        const token =
            getCookie("XSRF-TOKEN");

        if (token) {
            config.headers["X-XSRF-TOKEN"] = token;
        }
    }

    return config;
});
```

Prefer the existing HTTP client architecture if one already exists.

Do not add multiple interceptors if an appropriate centralized interceptor already exists.

---

# Phase 10 — Credential / Cookie Configuration

Determine whether frontend and backend are:

```text
same-origin
same-site
cross-origin
```

Do not blindly enable:

```typescript
withCredentials: true
```

Use it only if required by the deployment topology.

If cookies must travel cross-origin, inspect existing CORS configuration carefully.

Validate:

```text
Access-Control-Allow-Origin
Access-Control-Allow-Credentials
allowedHeaders
allowedMethods
```

Never configure:

```text
Access-Control-Allow-Origin: *
```

together with credentialed requests.

Use explicit trusted origins.

---

# Phase 11 — Cookie Security

Inspect existing deployment protocol and routing.

Production/OCP environments should normally use HTTPS.

Configure appropriate cookie attributes.

Evaluate:

```text
Secure
SameSite
Domain
Path
HttpOnly
```

`XSRF-TOKEN` needs to be readable by JavaScript when using:

```java
CookieCsrfTokenRepository.withHttpOnlyFalse()
```

Therefore:

```text
HttpOnly = false
```

is intentional for the CSRF token cookie.

This cookie must NOT contain authentication credentials.

Authentication cookies, if present, should follow their own stronger security requirements.

Prefer:

```text
Secure=true
```

in HTTPS environments.

Do not hard-code cookie domains until the actual OCP/Akamai hostname structure is inspected.

---

# Phase 12 — Remove Obsolete Frontend CSRF Logic

After the new flow works, remove code that:

```text
calls an endpoint solely to obtain an HttpSession CSRF token
stores CSRF token in localStorage
stores CSRF token in sessionStorage
manually synchronizes session identifiers
expects a CSRF token from HttpSession
depends on a specific OCP pod
```

Do not store CSRF tokens in:

```text
localStorage
sessionStorage
Redux persisted state
```

when the token is already provided through `XSRF-TOKEN`.

---

# Phase 13 — Handle Authentication Success

Spring Security can clear an existing CSRF token after successful authentication.

Verify that a fresh:

```text
XSRF-TOKEN
```

cookie becomes available after login.

The React application must not continue using a stale pre-authentication token.

Test:

```text
1. Open application.
2. Receive CSRF token A.
3. Login.
4. Previous CSRF token is cleared/rotated.
5. Receive CSRF token B.
6. POST using token B succeeds.
```

If authentication is performed outside Spring Security or through custom filters, inspect how CSRF rotation behaves before adding custom refresh logic.

---

# Phase 14 — Handle Logout

Verify logout behavior.

Expected sequence:

```text
User authenticated
      |
      | XSRF-TOKEN=A
      |
POST /logout
      |
Spring logout
      |
old CSRF token invalidated
      |
new CSRF token generated when required
```

After logout and subsequent login, React must not reuse the old CSRF value.

---

# Phase 15 — Add Backend Tests

Add integration tests covering at minimum:

## GET request

```text
GET /api/example
Expected:
200 or expected application status

CSRF header should not be required.
```

## POST without CSRF

```text
POST /api/example
No X-XSRF-TOKEN

Expected:
403
```

## POST with correct cookie/header pair

```text
Cookie:
XSRF-TOKEN=A

Header:
X-XSRF-TOKEN=A

Expected:
request passes CSRF validation
```

## Invalid token

```text
Cookie:
XSRF-TOKEN=A

Header:
X-XSRF-TOKEN=B

Expected:
403
```

Use Spring Security testing utilities where appropriate.

Prefer:

```java
MockMvc
spring-security-test
```

---

# Phase 16 — Add Frontend Tests

Test centralized HTTP-client behavior.

Verify:

```text
GET:
does not unnecessarily attach CSRF header

POST:
adds X-XSRF-TOKEN

PUT:
adds X-XSRF-TOKEN

PATCH:
adds X-XSRF-TOKEN

DELETE:
adds X-XSRF-TOKEN

OPTIONS:
does not attach CSRF header
```

Also test:

```text
missing XSRF-TOKEN cookie

token rotation

403 response

authentication/logout transition
```

---

# Phase 17 — Cross-Cluster Validation

This is the primary acceptance condition.

Run a test sequence where requests intentionally move between clusters.

Example:

```text
GET     -> DEV1
POST    -> DEV2
PUT     -> DEV1
DELETE  -> DEV2
```

Expected:

```text
All valid requests succeed.
No InvalidCsrfTokenException.
No MissingCsrfTokenException.
No dependency on JSESSIONID for CSRF validation.
```

Log temporarily:

```text
cluster/pod identifier
request URI
HTTP method
CSRF cookie presence
CSRF header presence
session ID if one exists
```

Never log the complete CSRF token in production.

For debugging, log only a masked value if necessary.

Example:

```text
csrfCookiePresent=true
csrfHeaderPresent=true
pod=dev2-xxxx
```

---

# Phase 18 — Verify No CSRF Session Dependency

After implementation, search again for:

```text
HttpSessionCsrfTokenRepository
_csrf session attribute
request.getSession
session.setAttribute
JSESSIONID
```

Classify every remaining usage.

Target:

```text
CSRF-related HttpSession dependency = NONE
```

If `JSESSIONID` continues to appear, determine whether it is required for authentication or some unrelated application feature.

Do not claim the application is completely stateless unless no required server-side request state remains.

---

# Phase 19 — Verify OCP / Akamai Behavior

Inspect whether proxies or routes modify:

```text
Cookie
Set-Cookie
X-XSRF-TOKEN
Origin
Host
X-Forwarded-Proto
X-Forwarded-Host
```

Verify that DEV1 and DEV2 receive the same browser-supplied CSRF cookie/header pair.

Validate that routing between clusters does not change cookie domain or path semantics.

Expected:

```text
Browser
   |
   | Cookie: XSRF-TOKEN=A
   | X-XSRF-TOKEN: A
   |
   +-------- DEV1 -> valid
   |
   +-------- DEV2 -> valid
```

Neither DEV1 nor DEV2 should need memory of which instance initially generated token A.

---

# Phase 20 — Failure Handling

Do not automatically retry an unsafe request after a `403` CSRF failure.

Never do:

```text
POST fails with 403
automatically retry POST blindly
```

because the original operation may not always be safely repeatable.

Instead:

1. identify whether the failure is CSRF-related;
2. ensure a fresh CSRF token exists;
3. retry only if application semantics make retry safe;
4. otherwise surface the error and allow the caller to decide.

---

# Acceptance Criteria

The migration is complete only when all of the following are true:

* `HttpSessionCsrfTokenRepository` is no longer used.
* `CookieCsrfTokenRepository` is used.
* `XSRF-TOKEN` cookie is issued to the browser.
* React sends the matching value through `X-XSRF-TOKEN`.
* POST requests without the token receive `403`.
* POST requests with a valid token succeed.
* PUT/PATCH/DELETE behave correctly.
* CSRF validation does not depend on OCP pod affinity.
* A request obtaining its CSRF cookie through DEV1 can successfully POST through DEV2.
* No shared Redis/session store is required for CSRF.
* Authentication behavior remains unchanged unless separately approved.
* Login CSRF rotation works.
* Logout CSRF rotation works.
* Existing authorization rules continue to work.
* Backend tests pass.
* Frontend tests pass.
* Existing application tests pass.
* No CSRF token is written to application logs.
* No authentication cookie is exposed to JavaScript as part of this migration.

---

# Expected Final Architecture

```text
                      React SPA
                          |
               +----------+----------+
               |                     |
        XSRF-TOKEN cookie      API request
               |                     |
               |             X-XSRF-TOKEN
               |                     |
               +----------+----------+
                          |
                    Akamai / Edge
                          |
                    OCP Routing
                     /         \
                    /           \
                 DEV1           DEV2
                  |               |
                  |               |
             Spring Security  Spring Security
                  |               |
                  +-------+-------+
                          |
              CookieCsrfTokenRepository

                 NO CSRF SESSION STATE
```

---

# Copilot Execution Instructions

Work through this migration incrementally.

For every phase:

1. inspect existing code;
2. explain what currently exists;
3. explain what needs to change;
4. modify the minimum number of files;
5. show the diff;
6. compile;
7. run relevant tests;
8. fix failures before proceeding.

Do not perform a broad rewrite of the security layer.

Do not disable CSRF.

Do not remove authentication.

Do not introduce Redis.

Do not introduce sticky-session routing as the solution.

Do not change externally visible API behavior unless required for the CSRF header/cookie migration.

At the end provide:

```text
Files changed

Backend changes

Frontend changes

Removed session dependencies

Remaining session dependencies

Authentication impact

CSRF cookie configuration

Cross-cluster readiness

Security considerations

Tests added

Tests executed

Open issues / assumptions
```

Most importantly, explicitly answer:

```text
Can a browser receive its XSRF-TOKEN while its request is served by DEV1
and then successfully perform a POST that is served by DEV2?

YES / NO

Evidence:
<tests/configuration>
```
