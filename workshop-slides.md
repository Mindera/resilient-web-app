---
marp: true
theme: default
paginate: true
backgroundColor: #1a1a2e
color: #ffffff
style: |
  section {
    background-color: #1a1a2e;
    font-family: 'Segoe UI', sans-serif;
  }
  h1 {
    color: #e94560;
    font-size: 2.5em;
  }
  h2 {
    color: #e94560;
    font-size: 1.8em;
  }
  h3 {
    color: #0f3460;
  }
  strong {
    color: #e94560;
  }
  code {
    color: #ffd700;
    background-color: #16213e;
    padding: 2px 6px;
    border-radius: 4px;
  }
  pre code {
    color: #a8e6cf;
    background-color: #16213e;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    background-color: #e94560;
    color: white;
  }
  td, th {
    border: 1px solid #0f3460;
    padding: 8px;
  }
  tr:nth-child(even) {
    background-color: #16213e;
  }
  section.title {
    text-align: center;
    justify-content: center;
  }
  section.title h1 {
    font-size: 3em;
    color: #e94560;
    margin-bottom: 0.5em;
  }
  section.title h2 {
    color: #a8e6cf;
    font-weight: normal;
  }
  section.title p {
    color: #888;
    font-size: 1.2em;
    margin-top: 2em;
  }
  section.title .subtitle {
    color: #ffd700;
    font-size: 1.4em;
    margin-top: 0.5em;
  }
---

<!-- _class: title -->

# Building Resilient Spring Boot Apps

### with Resilience4j

---

<!-- _class: title -->

## Workshop Overview

**Duration:** 2h 30min — 3h

**Format:** Challenge-driven, hands-on

**You'll build:** A product catalog that gracefully handles pricing service failures

---

## Agenda

| Time | Phase |
|------|-------|
| 10 min | Introduction |
| 20 min | Phase 1: The Chaos |
| 45 min | Phase 2: The Retry |
| 55 min | Phase 3: The Circuit Breaker |
| 20 min | Wrap-up: Distributed Retry |
| 10 min | Q&A |

---

<!-- _class: title -->

# What is Resilience?

---

## The Problem

```
User → Service A → Service B → Database
```

- Service B is slow → Service A waits → User waits
- Service B is down → Service A fails → User gets error
- Service B returns errors → Service A propagates them

**One slow or failing service can take down your entire system.**

---

## Cascading Failure

```
Without resilience:
                    Service B
                        ↓
Service A ←←←←←←←←←←←←←←←←←←←←
   ↓
Thread pool exhausted
   ↓
All requests blocked
   ↓
Service A is DOWN
```

---

## What is Resilience?

**The ability of a system to handle failures gracefully and recover automatically.**

Patterns we'll learn today:

1. **Retry** — try again when things go wrong
2. **Circuit Breaker** — stop calling what's broken
3. **Distributed Retry** — retry even when you crash

---

<!-- _class: title -->

# The Architecture

---

## Our System

```
┌────────────────────────┐         ┌────────────────────────┐
│  Product Catalog        │  HTTP   │  Pricing Service        │
│  Service               │────────▶│  (Service B)           │
│  (Service A)           │         │                        │
│                        │         │  GET /pricing/{id}     │
│  GET /products         │         │  POST /admin/slow      │
│  GET /products/{id}    │         │  POST /admin/fail      │
└────────────────────────┘         └────────────────────────┘
         port 8080                          port 8081
```

---

## Service B: The Unreliable Provider

Admin API to simulate failures:

| Endpoint | Effect |
|----------|--------|
| `POST /admin/healthy` | Normal operation |
| `POST /admin/slow` | 10-second delay |
| `POST /admin/fail` | 500 errors |
| `POST /admin/random?rate=40` | 40% random failures |

---

<!-- _class: title -->

# Phase 1

## The Chaos

---

## Phase 1: Observe the Disaster

**No code changes. Just observe.**

1. Start both services
2. Call `GET /products` — works fine
3. Toggle Service B to **slow mode**
4. Call `GET /products` again — what happens?
5. Toggle Service B to **error mode**
6. Call `GET /products` again
7. **Bonus:** `docker stop pricing-service`

---

## What Did You Observe?

- Service A **hung** for 10 seconds per request
- All threads got blocked waiting for Service B
- Service A became **completely unresponsive**

---

## The Key Lesson

> "A slow service is worse than a dead service."
> A dead service fails fast. A slow service holds your threads hostage.

---

<!-- _class: title -->

# Phase 2

## The Retry

---

## The Retry Pattern

```
Call fails
    ↓
Wait a bit
    ↓
Try again
    ↓
Wait longer
    ↓
Try again
    ↓
Success or give up
```

---

## Challenge: Add Retry

1. Toggle Service B to random failure mode:
   ```bash
   curl -X POST "http://localhost:8081/admin/random?rate=40"
   ```
2. Hit `GET /products` — you'll see failures
3. Add `@Retry` annotation to `PricingClient`
4. Configure in `application.yml`

---

## Exponential Backoff

Don't retry at the same interval every time.

```
Attempt 1 fails → wait 500ms → retry
Attempt 2 fails → wait 1s   → retry
Attempt 3 fails → wait 2s   → retry
                ↓
           Give up
```

`waitDuration × multiplier^attempt`

---

## Jitter: Prevent the Thundering Herd

```
Without jitter:     10 clients retry at t=0.5s, t=1s, t=2s
                     ↓
              All hit Service B at the same time!

With jitter:        10 clients retry at random intervals
                     ↓
              Requests are spread out
```

Jitter adds randomness: `wait × (0.5 + random(0,1))`

---

## Challenge: Fix the Retry Storm

Your retries are **making things worse.**

1. Service B in slow mode + 10 requests = 30 calls to Service B!
2. Add exponential backoff and jitter to the retry config

**Bonus:** Only retry on 5xx errors, NOT 4xx (400 will never succeed)

---

<!-- _class: title -->

# Phase 3

## The Circuit Breaker

---

## The Circuit Breaker Pattern

Inspired by electrical circuit breakers in your home.

```
CLOSED ────── failures > threshold ──────▶ OPEN
   ↑                                        │
   │                                        │ wait 10s
   │                                        ↓
   │                                   HALF_OPEN
   │                                        │
   └─────── test calls succeed ─────────────┘
```

---

## CLOSED State (Normal)

```
Circuit Breaker: CLOSED
─────────────────────────
Requests ──▶ Service B ──▶ Response
              (counted)
              ↓
   If failure rate > 50% (10 calls window):
     → Trip the breaker → OPEN
```

---

## OPEN State (Failing Fast)

```
Circuit Breaker: OPEN
─────────────────────────
Requests ──▶ [REJECTED] ──▶ Fallback
              (no call to Service B!)
              ↓
   After 10 seconds:
     → Let 3 test calls through → HALF_OPEN
```

---

## HALF_OPEN State (Testing)

```
Circuit Breaker: HALF_OPEN
─────────────────────────────
3 test calls allowed through
              ↓
   Success rate > 50% → CLOSED
   Success rate < 50% → OPEN again
```

---

## The Fallback

When the circuit is open, don't give the user an ugly error.

```java
@CircuitBreaker(name = "pricingService", fallbackMethod = "getPriceFallback")
public Map<String, Object> getPrice(String productId) { ... }

private Map<String, Object> getPriceFallback(String productId, Throwable t) {
    return Map.of(
        "price", cachedPrice,
        "priceStale", true,
        "error", "Price temporarily unavailable"
    );
}
```

---

## Challenge: Add Circuit Breaker

1. Toggle Service B to fail mode:
   ```bash
   curl -X POST http://localhost:8081/admin/fail
   ```
2. Send requests repeatedly — watch the circuit open
3. Check state: `GET /actuator/circuitbreakers`
4. Toggle Service B back to healthy — watch it recover

---

## Challenge: Add Fallback

When the circuit opens, users should see **cached prices** with a "stale" flag, not an error.

Add a `fallbackMethod` to the `@CircuitBreaker` annotation.

---

## Combining Retry + Circuit Breaker

The order matters!

```
WRONG:  Retry → CircuitBreaker → Call
        (Circuit opens → retries still happen → wasted!)

RIGHT:  CircuitBreaker → Retry → Call
        (Circuit open → no retries → go straight to fallback)
```

```yaml
resilience4j:
  circuitbreaker:
    circuitBreakerAspectOrder: 1   # outer
  retry:
    retryAspectOrder: 2             # inner
```

---

<!-- _class: title -->

# Wrap-up

## Distributed Retry

---

## The Problem with In-Memory Retry

Everything we've built **dies with the process.**

- Service A crashes → all pending retries are lost
- 5 instances of Service A → who retries what?

We need **persistent retry.**

---

## The Distributed Retry Pattern

```
User → Service A → Service B (fails)
              ↓
         Save to DB (retry_requests)
              ↓
         @Scheduled job (every 30s)
              ↓
         ShedLock (only 1 instance runs)
              ↓
         Retry from DB → Service B (hopefully recovered)
```

---

## ShedLock: Distributed Locking

With 5 instances, without ShedLock:

```
Instance 1: runs scheduler @ 10:00
Instance 2: runs scheduler @ 10:00
Instance 3: runs scheduler @ 10:00
Instance 4: runs scheduler @ 10:00
Instance 5: runs scheduler @ 10:00
              ↓
         5x the retries per request!
```

ShedLock uses a database lock to ensure **only one instance** runs the scheduler.

---

## The Full Resilience Stack

```
Request
   ↓
Circuit Breaker (order 1) → OPEN? → Fallback → Cached/Stale
   ↓ CLOSED
Retry (order 2) → fail? → retry with backoff + jitter
   ↓
Call Service B
   ↓
Success → Cache price
   ↓
Fallback fired → Save to DB → Background retry via ShedLock
```

---

<!-- _class: title -->

# Key Takeaways

---

## What We Learned

1. **Retry** — handles transient failures with backoff + jitter
2. **Circuit Breaker** — fails fast when a service is consistently down
3. **Fallback** — graceful degradation for the user
4. **Distributed Retry** — persistent retry that survives crashes
5. **Composition** — order matters: CB → Retry → Call

---

## When to Use What

| Pattern | Use when |
|---------|----------|
| **Retry** | Failures are transient (network blips, brief overloads) |
| **Circuit Breaker** | Failures are sustained (service is down) |
| **Fallback** | You want graceful degradation |
| **Distributed Retry** | Operations must survive app restarts |
| **Bulkhead** | You want to isolate failures |
| **Rate Limiter** | You need to respect rate limits |

---

## Real-World Stories

- **Netflix** built Hystrix (Resilience4j's predecessor) after cascading failures took down their site
- **Amazon** found every 100ms of latency costs 1% in sales
- **The Chaos Monkey** at Netflix randomly kills services to test resilience

---

<!-- _class: title -->

# Resources

---

## References

- [Resilience4j Documentation](https://resilience4j.readme.io/)
- [Spring Cloud Circuit Breaker](https://spring.io/projects/spring-cloud-circuitbreaker)
- [Martin Fowler: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Microsoft: Retry Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry)
- [ShedLock](https://github.com/lukas-krecan/ShedLock)

---

## Solution Branches

| Branch | Content |
|--------|---------|
| `main` | Starter code (no resilience) |
| `step-1-retry` | Retry with backoff, jitter, exception filtering |
| `step-2-circuitbreaker` | Circuit breaker with fallback + cache |
| `solution` | Everything + distributed retry with ShedLock |

---

<!-- _class: title -->

# Questions?

**Let's break some services!**
