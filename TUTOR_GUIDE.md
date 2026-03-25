# Tutor Guide: Building Resilient Spring Boot Apps with Resilience4j

**This document is for the workshop facilitator only. Do NOT share with participants.**

---

## Table of Contents

1. [Workshop Timeline](#workshop-timeline)
2. [Setup Checklist](#setup-checklist)
3. [Phase-by-Phase Facilitation Guide](#phase-by-phase-facilitation-guide)
4. [FAQ & Common Questions](#faq--common-questions)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Key Concepts Cheat Sheet](#key-concepts-cheat-sheet)
7. [Talking Points & Stories](#talking-points--stories)
8. [Emergency Recovery Plan](#emergency-recovery-plan)

---

## Workshop Timeline

| Time | Phase | Your Role | Participant Activity |
|------|-------|-----------|---------------------|
| 0:00 - 0:10 | Introduction | Present slides / whiteboard | Listen |
| 0:10 - 0:12 | Phase 1 intro | Explain the scenario (2 min) | Listen |
| 0:12 - 0:30 | Phase 1: Chaos | Walk around, help with setup | Explore failures, take notes |
| 0:30 - 0:35 | Phase 1 debrief | Lead group discussion | Share observations |
| 0:35 - 0:37 | Phase 2 intro | Explain retry concept (2 min) | Listen |
| 0:37 - 1:15 | Phase 2: Retry | Walk around, give hints | Solve challenges 2-3 |
| 1:15 - 1:23 | Phase 2 debrief | Show metrics, discuss retry storms | Share solutions |
| 1:23 - 1:25 | Phase 3 intro | Explain circuit breaker states (2 min) | Listen |
| 1:25 - 2:15 | Phase 3: Circuit Breaker | Walk around, give hints | Solve challenges 4-6 |
| 2:15 - 2:35 | Wrap-up: Distributed Retry | Present + code walkthrough | Listen, ask questions |
| 2:35 - 2:45 | Q&A / Closing | Facilitate discussion | Ask questions |

**Total: ~2h 45min** (with buffer for slow phases)

### Time Management Tips

- If Phase 1 runs long (setup issues), cut the debrief short — the lesson is self-evident
- If Phase 2 runs long, skip the bonus challenge (exception filtering) — it's in the solution branch
- Phase 3 is the most important. If you're running behind, skip Challenge 6 (combining patterns) and just show it
- The distributed retry wrap-up can be shortened to 10 min if needed — just show the architecture diagram and key code

---

## Setup Checklist

### Before the Workshop (Day Before)

- [ ] Clone the repo and verify `mvn clean package` works
- [ ] Verify Docker is running and `docker-compose up --build` works
- [ ] Test all failure modes (healthy, slow, fail, random)
- [ ] Test all solution branches compile and run
- [ ] Prepare a slide deck or whiteboard for the intro (optional)
- [ ] Have the Actuator URLs bookmarked in your browser
- [ ] Pre-download Maven dependencies (participants may have slow internet)

### Room Setup

- [ ] Ensure WiFi can handle all participants downloading Maven dependencies simultaneously
- [ ] Have the repo URL ready to share (whiteboard, Slack, etc.)
- [ ] Consider having a USB drive with the repo + Maven local repo (.m2) as backup

### Participant Prerequisites (Share Before Workshop)

Send this to participants at least 1 day before:
```
Please have the following installed before the workshop:
- Java 21 (verify: java -version)
- Maven 3.9+ (verify: mvn -version)
- Docker & Docker Compose (verify: docker --version && docker compose version)
- Git (verify: git --version)
- Your favorite IDE (IntelliJ IDEA recommended)
- A REST client (curl, Postman, or IntelliJ HTTP client)

Clone the repo and run: mvn clean package -DskipTests
This will pre-download all dependencies.
```

---

## Phase-by-Phase Facilitation Guide

### Introduction (10 min)

**Key points to cover:**

1. **Why resilience matters:** "In a microservices architecture, your system is only as strong as its weakest link. One slow service can take down everything."

2. **The patterns we'll learn today:**
   - Retry: "Try again — maybe it was just a blip"
   - Circuit Breaker: "Stop trying — it's clearly broken, protect yourself"
   - (Bonus) Distributed Retry: "Remember to try again later, even if I crash"

3. **Draw the architecture on the whiteboard:**
   ```
   User → Service A (Product Catalog) → Service B (Pricing)
                                              ↑
                                         This one breaks!
   ```

4. **Set expectations:** "This is challenge-driven. You'll get a mission, some hints, and solution branches if you get stuck. Work at your own pace."

---

### Phase 1: The Chaos (20 min)

**Your intro (2 min):**
> "Both services are running. Service A calls Service B for every product's price. Right now there's zero resilience — no timeouts, no retries, no circuit breakers. Your mission: break things and observe what happens."

**What to watch for while walking around:**
- Participants who can't get the services started → help with setup
- Participants who don't understand what "slow mode" does → explain thread blocking
- Participants who finish early → ask them to try the concurrent request test

**Debrief talking points (5 min):**

Ask the group: "What did you observe?"

Expected answers and your responses:
- "Service A hung for 10 seconds" → "Right. Every thread in Service A is blocked waiting for Service B. With a default thread pool of 200 threads, 200 concurrent requests = complete lockup."
- "I got 500 errors" → "Service B returned 500, and Service A just passed it through. No graceful degradation."
- "Stopping the container was different" → "Great observation. A dead service fails fast (connection refused). A slow service is worse because it holds threads hostage. **Slow is worse than dead.**"

**Key lesson to emphasize:**
> "Without resilience, one slow service kills the entire system. This is called **cascading failure**. It's the #1 cause of microservice outages."

---

### Phase 2: The Retry (45 min)

**Your intro (2 min):**
> "Retry is the simplest resilience pattern. If a call fails, try again. But as you'll discover, naive retries can actually make things worse."

**Challenge 2 (Basic Retry) — What to watch for:**
- The most common mistake: forgetting the `@Retry` import
- Second most common: putting the annotation on a private method (won't work with AOP)
- Third: not restarting the application after changing `application.yml`

**If someone asks "Why do I need the annotation AND the YAML?":**
> "The annotation tells Resilience4j which method to wrap. The YAML configures how the retry behaves. You can also configure via code, but YAML is easier to tweak without recompiling."

**Challenge 3 (Retry Storm) — What to watch for:**
- Some participants won't understand why retries are bad → draw it on the whiteboard:
  ```
  Without retry: 10 requests → 10 calls to Service B
  With 3 retries: 10 requests → up to 30 calls to Service B
  Service B is already struggling... and now it gets 3x the traffic!
  ```

**Debrief talking points:**
- Show the retry metrics: `curl http://localhost:8080/actuator/retryevents`
- "Exponential backoff gives the failing service breathing room"
- "Jitter prevents the thundering herd — without it, all retries happen at the same millisecond"
- "Exception filtering prevents wasting retries on errors that will never succeed"

**Transition to Phase 3:**
> "Retry handles transient failures — a quick blip, a momentary overload. But what if Service B is down for 5 minutes? Retrying 3 times every request for 5 minutes is still a lot of wasted calls. We need something smarter."

---

### Phase 3: The Circuit Breaker (55 min)

**Your intro (2 min):**

Draw the state machine on the whiteboard:
```
         failures > threshold
  CLOSED ──────────────────> OPEN
    ^                          │
    │                          │ wait duration expires
    │                          v
    └──────────────────── HALF_OPEN
         success threshold       │
         met                     │ failures > threshold
                                 v
                               OPEN
```

> "Think of it like an electrical circuit breaker in your house. When there's a problem, it trips to protect the system. After some time, it lets a little current through to test if the problem is fixed."

**Challenge 4 (Basic CB) — What to watch for:**

**THE #1 PITFALL:** If someone moves the `@CircuitBreaker` annotation to a method in `ProductService` and calls it from within the same class, it won't work. This is because Spring AOP uses proxies — internal method calls bypass the proxy.

**How to explain it:**
> "When Spring creates a bean with AOP annotations, it wraps it in a proxy. When you call `pricingClient.getPrice()` from `ProductService`, the call goes through the proxy and the circuit breaker kicks in. But if you call a method within the same class, you're calling `this.method()` — which bypasses the proxy entirely."

**If someone asks "How do I fix it if I need the annotation in the same class?":**
> "Three options: (1) Extract the method to a separate bean (recommended), (2) Inject the bean into itself using `@Lazy`, (3) Use `AopContext.currentProxy()`. Option 1 is the cleanest."

**Challenge 5 (Fallback) — What to watch for:**
- Fallback method signature must match: same params + Throwable
- Common mistake: wrong return type on the fallback
- Common mistake: making the fallback method `static` (won't work)

**Challenge 6 (Combining) — What to watch for:**
- The aspect order is the trickiest concept. Draw it:
  ```
  Request → CircuitBreaker (order 1) → Retry (order 2) → Actual Call
  
  If circuit is OPEN:
    Request → CircuitBreaker → REJECTED → Fallback (no retry attempted!)
  
  If circuit is CLOSED:
    Request → CircuitBreaker → Retry → Call fails → Retry → Call fails → Retry → Call succeeds
                                                                                    ↓
                                                                          CircuitBreaker counts as SUCCESS
  ```

**Key insight to share:**
> "The circuit breaker counts the FINAL result after all retries. So if the call fails twice but succeeds on the third retry, the circuit breaker sees a success. This is exactly what we want."

---

### Wrap-up: Distributed Retry (15-20 min)

**This is a presentation, not hands-on.** Walk through the code in the `solution` branch.

**Key points:**

1. **The problem with in-memory retry:**
   > "Everything we've built today lives in memory. If Service A crashes or restarts, all pending retries are lost. In production, you might have 5 instances of Service A — who retries what?"

2. **The solution — persist to database:**
   ```
   User → Service A → Service B (fails)
                ↓
           Save to DB (retry_requests table)
                ↓
           @Scheduled job (every 30s)
                ↓
           ShedLock ensures only 1 instance runs
                ↓
           Retry from DB → Service B
   ```

3. **Show the key code:**
   - `RetryRequest.java` — the JPA entity
   - `DistributedRetryService.java` — the scheduled job
   - The `@SchedulerLock` annotation from ShedLock

4. **Why ShedLock?**
   > "Without ShedLock, if you have 5 instances of Service A, all 5 will run the scheduled job simultaneously. That means each failed request gets retried 5 times instead of once. ShedLock uses a database lock to ensure only one instance runs the job."

5. **ShedLock alternatives:**
   - Redis-based locking (if you already have Redis)
   - Quartz Scheduler (heavier, but more features)
   - Spring Integration with a distributed lock

---

## FAQ & Common Questions

### General Questions

**Q: Why Resilience4j and not Hystrix?**
> Hystrix is in maintenance mode (Netflix stopped active development in 2018). Resilience4j is the recommended replacement. It's lighter, modular, and designed for Java 8+ with functional programming support. Spring Cloud Circuit Breaker also defaults to Resilience4j.

**Q: Can I use Resilience4j with RestTemplate instead of WebClient?**
> Yes. The annotations (`@Retry`, `@CircuitBreaker`) work with any method, regardless of the HTTP client. We used WebClient because it's the modern Spring recommendation, but RestTemplate works identically with the annotations.

**Q: What's the difference between COUNT_BASED and TIME_BASED sliding windows?**
> - COUNT_BASED: looks at the last N calls (e.g., last 10 calls). Simple and predictable.
> - TIME_BASED: looks at all calls in the last N seconds (e.g., last 60 seconds). Better for services with variable traffic.
> For this workshop we use COUNT_BASED because it's easier to demonstrate (you can count the requests).

**Q: Should I use annotations or programmatic configuration?**
> For most cases, annotations + YAML config is simpler and more readable. Use programmatic configuration when you need dynamic behavior (e.g., different configs per tenant) or when you're working in a reactive pipeline without blocking.

**Q: What about Bulkhead and Rate Limiter?**
> - **Bulkhead:** Limits concurrent calls to a service. Prevents one slow service from consuming all threads. Think of it as "reserving" threads.
> - **Rate Limiter:** Limits the rate of calls (e.g., max 100 calls/second). Useful for protecting downstream services or respecting API rate limits.
> Both are important but we skip them for time. Mention them in the wrap-up as "homework."

**Q: Does the circuit breaker work across multiple instances of Service A?**
> No! Each instance has its own circuit breaker state. If you have 5 instances, each one independently tracks failures and opens/closes its own circuit. For shared state, you'd need an external store (Redis, etc.) — but in practice, independent circuit breakers work fine because each instance experiences the same downstream failures.

### Retry Questions

**Q: What's a good maxAttempts value?**
> 3 is the most common default. The math: with a 30% failure rate, 3 attempts gives you 0.3^3 = 2.7% chance of total failure. 4 attempts = 0.81%. Diminishing returns after 3-4. More retries = more load on the downstream service.

**Q: Should I retry on timeouts?**
> Yes, but with caution. If the timeout is because the service is overloaded, retrying makes it worse. Combine with exponential backoff and a circuit breaker. Also consider: is the operation idempotent? If not, retrying a timeout is dangerous (the first call might have succeeded).

**Q: What about idempotency?**
> Critical question! If `Service B` is a payment service and you retry a payment, you might charge the customer twice. Solutions:
> - Make the operation idempotent (use an idempotency key)
> - Only retry on errors where you KNOW the operation didn't execute (connection refused, timeout before response)
> - Never retry on 2xx or ambiguous errors

**Q: What's the difference between `retryExceptions` and `ignoreExceptions`?**
> - `retryExceptions`: whitelist — ONLY retry on these exceptions (default: retry on all)
> - `ignoreExceptions`: blacklist — retry on everything EXCEPT these
> You can use both together. `ignoreExceptions` takes precedence.

### Circuit Breaker Questions

**Q: How do I choose the right `failureRateThreshold`?**
> - 50% is a good default for most services
> - Lower (e.g., 25%) = more sensitive, opens faster, more false positives
> - Higher (e.g., 80%) = more tolerant, takes longer to open
> Consider: what's worse for your users — occasional errors or the circuit opening too aggressively?

**Q: What counts as a "failure"?**
> By default, any exception. You can customize with `recordExceptions` (whitelist) and `ignoreExceptions` (blacklist). For example, a 404 is usually not a "failure" — the service is working fine, the resource just doesn't exist.

**Q: The circuit opened but Service B is back. How long until it closes?**
> After `waitDurationInOpenState` (default 60s, we set 10s), the circuit moves to HALF_OPEN. It then allows `permittedNumberOfCallsInHalfOpenState` test calls. If enough succeed (based on `failureRateThreshold`), it closes. If they fail, it opens again.

**Q: Can I manually open/close the circuit breaker?**
> Yes, via Actuator:
> ```bash
> # Force open
> curl -X POST http://localhost:8080/actuator/circuitbreakers/pricingService -H "Content-Type: application/json" -d '{"updateState": "FORCE_OPEN"}'
> # Force close
> curl -X POST http://localhost:8080/actuator/circuitbreakers/pricingService -H "Content-Type: application/json" -d '{"updateState": "CLOSE"}'
> ```
> Note: you need to enable the circuit breaker actuator endpoint for write operations.

**Q: Why does my `@CircuitBreaker` annotation not work?**
> Top 3 reasons:
> 1. **AOP proxy trap:** Calling the annotated method from within the same class
> 2. **Missing dependency:** `spring-boot-starter-aop` not in pom.xml
> 3. **Wrong name:** The name in the annotation doesn't match the name in `application.yml`

### Distributed Retry Questions

**Q: Why not just use a message queue (RabbitMQ, Kafka)?**
> You absolutely can, and for high-throughput systems, a message queue is better. The database approach is simpler to set up and understand, and works well for moderate volumes. In production, consider:
> - Low volume (< 1000 retries/min): Database is fine
> - High volume: Use a message queue with dead letter queues
> - Very high volume: Use Kafka with retry topics

**Q: What if the scheduled job itself fails?**
> ShedLock's `lockAtMostFor` ensures the lock is released even if the job crashes. The next execution will pick up where it left off. The `max_attempts` column prevents infinite retries.

**Q: Why ShedLock and not `@Scheduled` with a distributed lock from Spring?**
> Spring doesn't provide distributed scheduling out of the box. `@Scheduled` runs on every instance. ShedLock is the simplest way to add distributed locking. Alternatives: Quartz (heavier), Spring Integration (more complex), or a custom Redis lock.

---

## Troubleshooting Guide

### "Maven build fails"

```bash
# Clean everything and rebuild
mvn clean install -DskipTests

# If dependency issues, force update
mvn clean install -DskipTests -U
```

### "Port already in use"

```bash
# Find what's using the port
lsof -i :8080
lsof -i :8081

# Kill it
kill -9 <PID>

# Or change the port in application.yml
```

### "Service A can't connect to Service B"

- If running locally: make sure Service B is started first and running on port 8081
- If running with Docker: make sure `docker-compose up` started both services
- Check the `pricing-service.base-url` in Service A's `application.yml`

### "Docker build fails"

```bash
# Make sure jars are built first
mvn clean package -DskipTests

# Then build Docker images
docker-compose up --build
```

### "@Retry / @CircuitBreaker not working"

1. Check the import is correct (`io.github.resilience4j.retry.annotation.Retry`)
2. Check the method is `public` (AOP requires public methods)
3. Check the method is called from a different bean (AOP proxy trap!)
4. Check `spring-boot-starter-aop` is in the dependencies
5. Check the instance name in the annotation matches the YAML config
6. Restart the application (YAML changes require restart)

### "Actuator endpoints return 404"

Check `application.yml` has:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,retries,circuitbreakers,circuitbreakerevents,retryevents
```

### "Fallback method not found"

The fallback method must:
- Be in the **same class** as the annotated method
- Have the **exact same parameters** plus a `Throwable` (or specific exception type) as the last parameter
- Have the **same return type**
- NOT be `static`

---

## Key Concepts Cheat Sheet

### Retry

```
Call fails → Wait → Retry → Wait longer → Retry → Give up or succeed
              ↑                ↑
          waitDuration    exponentialBackoff
                          (waitDuration * multiplier)
```

**Config values for the workshop:**
- `maxAttempts: 3` — try 3 times total (1 original + 2 retries)
- `waitDuration: 500ms` — wait 500ms before first retry
- `exponentialBackoffMultiplier: 2` — double the wait each time (500ms → 1s → 2s)
- `randomizedWaitFactor: 0.5` — add up to 50% random jitter

### Circuit Breaker States

```
CLOSED (normal)
  ↓ failure rate > threshold
OPEN (all calls rejected immediately)
  ↓ wait duration expires
HALF_OPEN (allow N test calls)
  ↓ test calls succeed → CLOSED
  ↓ test calls fail → OPEN
```

**Config values for the workshop:**
- `slidingWindowSize: 10` — evaluate the last 10 calls
- `failureRateThreshold: 50` — open if 50%+ fail
- `waitDurationInOpenState: 10s` — stay open for 10 seconds
- `permittedNumberOfCallsInHalfOpenState: 3` — allow 3 test calls

### Aspect Order (Retry + Circuit Breaker)

```
Lower number = higher priority = outer wrapper

circuitBreakerAspectOrder: 1  (outer)
retryAspectOrder: 2           (inner)

Execution: CircuitBreaker → Retry → Actual Call
```

**Why this order?**
- If circuit is OPEN → reject immediately, don't waste time retrying
- If circuit is CLOSED → retry on failure, circuit breaker counts the final result

---

## Talking Points & Stories

### For the Introduction

**The Amazon Story:**
> "Amazon found that every 100ms of latency cost them 1% in sales. In a microservices architecture with 10 services in the call chain, a 100ms delay in one service becomes a 1-second delay for the user. Now imagine that service isn't just slow — it's hanging for 10 seconds."

**The Netflix Story:**
> "Netflix pioneered many of these patterns. They built Hystrix (the predecessor to Resilience4j) after experiencing cascading failures in production. One service going down would take out dozens of others. The circuit breaker pattern was their solution — and it's now an industry standard."

### For the Retry Phase

**The Thundering Herd:**
> "Imagine a concert venue. The doors open and 10,000 people rush in at once. The entrance can handle 100 people per minute. Without any coordination, everyone pushes and nobody gets in. That's what happens when all your retries fire at the same time. Jitter is like giving everyone a random ticket number — 'you enter at minute 1, you at minute 3' — spreading the load."

### For the Circuit Breaker Phase

**The Electrical Analogy:**
> "Your house has a circuit breaker panel. When there's a short circuit, the breaker trips to prevent a fire. You don't keep flipping it back on while the wire is still sparking. You wait, fix the problem, then carefully flip it back. That's exactly what our software circuit breaker does."

### For the Wrap-up

**The Real World:**
> "In production, you'll combine all of these patterns. A typical setup: Circuit Breaker (outer) → Retry (inner) → Timeout → Bulkhead. Plus monitoring and alerting on circuit breaker state changes. When a circuit opens, your ops team should know about it."

---

## Emergency Recovery Plan

If things go badly wrong during the workshop:

### "Nobody can get the project running"

1. Have participants clone a fresh copy
2. Run `mvn clean package -DskipTests` from the root
3. If Maven is the problem, have a pre-built JAR on a USB drive

### "We're running out of time"

**Cut list (in order):**
1. Skip Challenge 3 bonus (exception filtering) — mention it exists
2. Skip Challenge 6 (combining patterns) — show it on your screen instead
3. Shorten the distributed retry wrap-up to 5 min — just show the architecture
4. Skip the debrief discussions — let the code speak

**Never cut:**
- Phase 1 (the chaos) — it's the emotional hook
- Challenge 4 (basic circuit breaker) — it's the main event
- Challenge 5 (fallback) — it's the payoff

### "Someone is way ahead of everyone else"

Give them bonus challenges:
1. "Add a TimeLimiter so the WebClient call times out after 2 seconds"
2. "Add a Bulkhead to limit concurrent calls to Service B to 5"
3. "Write a custom event listener that logs every circuit breaker state change"
4. "Make the fallback smarter — return cached prices if available, default prices if not"

### "Someone is completely stuck"

1. First: check if it's a setup issue (wrong Java version, missing dependency)
2. Second: point them to the specific hint in the README
3. Third: have them checkout the solution branch and study the diff
4. Last resort: pair them with someone who's further along

---

## Post-Workshop

### Follow-up Resources to Share

- [Resilience4j Documentation](https://resilience4j.readme.io/docs)
- [Spring Cloud Circuit Breaker](https://spring.io/projects/spring-cloud-circuitbreaker)
- [Martin Fowler: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Microsoft: Retry Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry)
- [Microsoft: Circuit Breaker Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- [ShedLock GitHub](https://github.com/lukas-krecan/ShedLock)

### Suggested Homework

1. Add a `TimeLimiter` to the WebClient call
2. Add a `Bulkhead` to limit concurrent calls
3. Replace H2 with PostgreSQL for the distributed retry
4. Add Prometheus + Grafana for monitoring
5. Implement the distributed retry with a message queue instead of a database
