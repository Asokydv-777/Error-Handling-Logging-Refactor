# Pair Session — Phase 5 Task 6

**Pair:** Lukash Napit & Ashok Yadav
**Repo:** phase5-error-handling-refactor
**Date:** Day 5 (afternoon)
**Format:** Driver / Navigator, swap every 15 minutes

---

## 1. Driver Log

| # | Time  | Driver         | Navigator      | Segment                                              |
|---|-------|----------------|----------------|------------------------------------------------------|
| 1 | 14:00 | Lukash Napit   | Ashok Yadav    | Audit + read-through of `before/app.js`              |
| 2 | 14:20 | Ashok Yadav    | Lukash Napit   | Add `AppError` class + `errorHandler` middleware     |
| 3 | 14:35 | Lukash Napit   | Ashok Yadav    | Add `requestLogger` middleware                       |
| 4 | 14:50 | Ashok Yadav    | Lukash Napit   | Refactor `GET /notes` and `GET /notes/:id`           |
| 5 | 15:05 | Lukash Napit   | Ashok Yadav    | Refactor `POST /notes` and `DELETE /notes/:id`       |
| 6 | 15:20 | Ashok Yadav    | Lukash Napit   | Add `notFoundHandler`, wire middleware order         |
| 7 | 15:35 | Lukash Napit   | Ashok Yadav    | Verify success paths unchanged + failure paths       |
| 8 | 15:50 | Ashok Yadav    | Lukash Napit   | Final review, README, cleanup                        |

Both partners drove four 15-minute segments each.

---

## 2. Audit Findings (before any code was changed)

### A. Error handling — per route

| Route                | Current behavior                                                 | Consistent?  |
|----------------------|------------------------------------------------------------------|--------------|
| `GET /notes`         | No error possible                                                | n/a          |
| `GET /notes/:id`     | Invalid id → `200` plain text "Invalid id"; not found → `404` plain text "Not found" | Inconsistent |
| `POST /notes`        | No validation; empty `{}` body accepted and stored               | Missing      |
| `DELETE /notes/:id`  | Always returns `200 {ok:true}` even when nothing was deleted     | Incorrect    |

### B. Logging

- Only two `console.log` calls, both plain text: `"GET /notes called"` and `"Creating note <body>"`.
- No logging on: `GET /notes/:id`, `DELETE /notes/:id`, any error path.
- No method / path / status / duration captured together.
- Logs are unstructured (plain strings) — not parseable by log aggregators.

### C. Silent failures / crash risks

- `GET /notes/:id` returns `200` with a plain-text body on invalid id — a client expecting JSON will fail to parse.
- `POST /notes` with `{}` or missing fields still inserts a note with `undefined` title/content.
- `DELETE /notes/:id` with id `abc` → `Number('abc')` is `NaN`, `n.id !== NaN` is always true, so nothing is deleted — but the route still responds `200 {ok:true}`. Silent no-op disguised as success.
- No 404 handler for unknown routes — Express returns its default HTML page, breaking API consistency.
- No error-handling middleware — any thrown error inside a route falls through to Express's default HTML stack-trace response (leaks internals in production).

### D. Refactor plan (derived from audit)

1. Add `AppError` class for operational errors with status + code.
2. Add centralized `errorHandler` middleware (4-arg signature, registered last).
3. Add `notFoundHandler` (registered after routes, before `errorHandler`).
4. Add structured `requestLogger` (method, path, status, duration, ip, timestamp as JSON).
5. Convert every route to `next(err)` for errors — no more `res.send` on error paths.
6. Preserve all success-path behavior exactly — this is a refactor, not a rewrite.
7. Test every original route + at least 2 failure modes to confirm the new uniform envelope.