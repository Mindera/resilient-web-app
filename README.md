# Building Resilient Spring Boot Apps with Resilience4j

A hands-on workshop where you'll learn to protect your microservices from cascading failures using retry, circuit breaker, and distributed retry patterns.

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Service A          │  HTTP   │   Service B          │
│   Product Catalog    │────────>│   Pricing Service    │
│   (port 8080)        │         │   (port 8081)        │
│                      │         │                      │
│   GET /products      │         │   GET /pricing/{id}  │
│   GET /products/{id} │         │   POST /admin/...    │
└─────────────────────┘         └─────────────────────┘
```

**Service A** serves a product catalog. For each product, it calls **Service B** to get the current price. Service B has an admin API that lets you simulate different failure scenarios.

---

## Prerequisites

- Java 21
- Maven 3.9+
- Docker & Docker Compose
- A REST client (curl, Postman, or IntelliJ HTTP client)

---

## Quick Start

### Option 1: Run locally (recommended for development)

```bash
# Build both services
mvn clean package -DskipTests

# Terminal 1: Start Service B (Pricing)
cd service-b-pricing
mvn spring-boot:run

# Terminal 2: Start Service A (Product Catalog)
cd service-a-product-catalog
mvn spring-boot:run
```

### Option 2: Run with Docker

```bash
# Build the jars first
mvn clean package -DskipTests

# Start both services
docker-compose up --build
```

### Verify it works

```bash
# Get all products with prices
curl http://localhost:8080/products

# Get a single product
curl http://localhost:8080/products/PROD-001

# Check Service B status
curl http://localhost:8081/admin/status
```

---

## Service B Admin API (Failure Toggle)

Use these endpoints to simulate different failure scenarios:

| Command | Effect |
|---------|--------|
| `curl -X POST http://localhost:8081/admin/healthy` | Normal operation |
| `curl -X POST http://localhost:8081/admin/slow` | 10-second delay on every request |
| `curl -X POST http://localhost:8081/admin/fail` | 500 error on every request |
| `curl -X POST "http://localhost:8081/admin/random?rate=40"` | 40% of requests fail randomly |
| `curl http://localhost:8081/admin/status` | Check current failure mode |

---

## Phase 1: The Chaos (20 min)

**Goal:** Understand what happens when a downstream service fails and there's no resilience in place.

### Challenge 1: Observe the Disaster

You're on-call. The pricing service is having issues. Document what happens.

1. Start both services and verify `GET http://localhost:8080/products` works
2. Toggle Service B to **slow mode**:
   ```bash
   curl -X POST http://localhost:8081/admin/slow
   ```
3. Hit `/products` from multiple browser tabs simultaneously. What happens? How long does each request take?
4. Toggle Service B to **error mode**:
   ```bash
   curl -X POST http://localhost:8081/admin/fail
   ```
5. Hit `/products` again. What do you see?
6. **Bonus:** If using Docker, stop Service B entirely:
   ```bash
   docker stop service-b-pricing
   ```
   What happens now? Is this different from the slow failure?

**Think about:**
- How many concurrent requests does it take to make Service A unresponsive?
- Which is worse: a slow service or a dead service? Why?
- What happens to Service A's thread pool when Service B is slow?

Don't forget to reset Service B when you're done:
```bash
curl -X POST http://localhost:8081/admin/healthy
```

---

## Phase 2: The Retry (45 min)

**Goal:** Handle transient failures by retrying failed requests. Then learn why naive retries can make things worse.

### Challenge 2: Basic Retry

**Mission:** Service B fails randomly 40% of the time. Add retry logic so most user requests succeed.

```bash
# Set Service B to random failure mode (40%)
curl -X POST "http://localhost:8081/admin/random?rate=40"
```

Now hit `GET /products` several times. You'll see failures. Fix it with a retry.

**Where to add it:** `service-a-product-catalog/src/main/java/com/workshop/catalog/client/PricingClient.java`

**What to do:**
1. Add the `@Retry` annotation to the `getPrice` method
2. Configure the retry in `application.yml`

<details>
<summary>Hint 1: The annotation</summary>

```java
@Retry(name = "pricingService")
public Map<String, Object> getPrice(String productId) {
```

</details>

<details>
<summary>Hint 2: The YAML config</summary>

Add this to `service-a-product-catalog/src/main/resources/application.yml`:

```yaml
resilience4j:
  retry:
    instances:
      pricingService:
        maxAttempts: 3
        waitDuration: 500ms
```

</details>

<details>
<summary>Hint 3: Don't forget the import!</summary>

```java
import io.github.resilience4j.retry.annotation.Retry;
```

</details>

**Test it:** With 40% failure rate and 3 attempts, what's the probability of all 3 attempts failing? (Answer: 0.4^3 = 6.4%. So ~94% of requests should succeed now!)

**Check your metrics:**
```bash
curl http://localhost:8080/actuator/retries
curl http://localhost:8080/actuator/retryevents
```

**Stuck?** `git checkout step-1-retry-basic`

---

### Challenge 3: The Retry Storm

**Mission:** Your retry works, but you're making things worse. Fix it.

1. Toggle Service B to **slow mode**:
   ```bash
   curl -X POST http://localhost:8081/admin/slow
   ```
2. Send 10 concurrent requests:
   ```bash
   for i in {1..10}; do curl -s http://localhost:8080/products/PROD-001 & done; wait
   ```
3. Check Service B's logs. How many requests did it receive? (Hint: with 3 retries, it's up to 30!)

**Problem:** Your retries are hammering an already struggling service. This is called a **retry storm**.

**Fix it:** Add exponential backoff and jitter.

<details>
<summary>Hint 1: What is exponential backoff?</summary>

Instead of retrying every 500ms, each retry waits longer:
- 1st retry: 500ms
- 2nd retry: 1000ms (500ms * 2)
- 3rd retry: 2000ms (500ms * 2 * 2)

This gives the failing service time to recover.

</details>

<details>
<summary>Hint 2: What is jitter?</summary>

If 100 clients all retry at exactly the same intervals, they'll all hit the server at the same time (thundering herd). Jitter adds randomness to the wait time so retries are spread out.

</details>

<details>
<summary>Hint 3: The YAML config</summary>

```yaml
resilience4j:
  retry:
    instances:
      pricingService:
        maxAttempts: 3
        waitDuration: 500ms
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
        enableRandomizedWait: true
        randomizedWaitFactor: 0.5
```

</details>

**Bonus Challenge:** Only retry on server errors (5xx), NOT on client errors (4xx). A 400 Bad Request will never succeed no matter how many times you retry.

<details>
<summary>Bonus Hint: Exception filtering</summary>

```yaml
resilience4j:
  retry:
    instances:
      pricingService:
        maxAttempts: 3
        waitDuration: 500ms
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
        enableRandomizedWait: true
        randomizedWaitFactor: 0.5
        retryExceptions:
          - org.springframework.web.reactive.function.client.WebClientResponseException.InternalServerError
          - org.springframework.web.reactive.function.client.WebClientResponseException.ServiceUnavailable
          - org.springframework.web.reactive.function.client.WebClientResponseException.BadGateway
          - java.io.IOException
          - java.util.concurrent.TimeoutException
        ignoreExceptions:
          - org.springframework.web.reactive.function.client.WebClientResponseException.BadRequest
          - org.springframework.web.reactive.function.client.WebClientResponseException.NotFound
```

</details>

**Stuck?** `git checkout step-1-retry-complete`

---

## Phase 3: The Circuit Breaker (55 min)

**Goal:** When a service is consistently failing, stop calling it entirely. Fail fast and provide a fallback.

### Challenge 4: Basic Circuit Breaker

**Mission:** Service B is down. Instead of waiting and retrying (wasting time and resources), detect the failure pattern and stop calling it.

```bash
# Set Service B to fail mode
curl -X POST http://localhost:8081/admin/fail
```

**Where to add it:** Same file — `PricingClient.java`

**What to do:**
1. Add the `@CircuitBreaker` annotation to the `getPrice` method
2. Configure it in `application.yml`
3. Send requests repeatedly and watch the circuit breaker open

<details>
<summary>Hint 1: The annotation</summary>

```java
@CircuitBreaker(name = "pricingService")
public Map<String, Object> getPrice(String productId) {
```

</details>

<details>
<summary>Hint 2: The YAML config</summary>

```yaml
resilience4j:
  circuitbreaker:
    instances:
      pricingService:
        registerHealthIndicator: true
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3
        slidingWindowType: COUNT_BASED
```

What this means:
- Look at the last 10 calls (`slidingWindowSize`)
- If 50% or more failed (`failureRateThreshold`), open the circuit
- Stay open for 10 seconds (`waitDurationInOpenState`)
- Then allow 3 test calls (`permittedNumberOfCallsInHalfOpenState`)
- If those succeed, close the circuit again

</details>

<details>
<summary>Hint 3: Import</summary>

```java
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
```

</details>

**Watch the state transitions:**
```bash
# Check circuit breaker state
curl http://localhost:8080/actuator/circuitbreakers

# Check circuit breaker events
curl http://localhost:8080/actuator/circuitbreakerevents
```

**WARNING: The #1 Workshop Pitfall!**

If your `@CircuitBreaker` annotation doesn't seem to work, check this: Spring AOP proxies do NOT intercept method calls within the same class. If `ProductService` calls a `@CircuitBreaker` method that's also in `ProductService`, the annotation is ignored!

The annotation must be on a method in a **different Spring bean** that is called from outside. That's why we put it on `PricingClient` (called by `ProductService`).

**Stuck?** `git checkout step-2-circuitbreaker-basic`

---

### Challenge 5: The Fallback

**Mission:** When the circuit is open, users see an ugly error. Give them something useful instead.

**What to do:**
1. Add a `fallbackMethod` to your `@CircuitBreaker` annotation
2. The fallback should return a default price with a `"priceStale": true` flag
3. Test it: toggle Service B to fail, wait for the circuit to open, then hit `/products`

<details>
<summary>Hint 1: The annotation with fallback</summary>

```java
@CircuitBreaker(name = "pricingService", fallbackMethod = "getPriceFallback")
public Map<String, Object> getPrice(String productId) {
    // ... existing code
}
```

</details>

<details>
<summary>Hint 2: The fallback method signature</summary>

The fallback method must:
- Be in the **same class**
- Have the **same parameters** as the original method, plus a `Throwable` parameter
- Have the **same return type**

```java
private Map<String, Object> getPriceFallback(String productId, Throwable t) {
    log.warn("Fallback triggered for product {}: {}", productId, t.getMessage());
    return Map.of(
        "productId", productId,
        "price", 0,
        "currency", "EUR",
        "discount", 0,
        "finalPrice", 0,
        "priceStale", true,
        "error", "Price temporarily unavailable"
    );
}
```

</details>

<details>
<summary>Hint 3: Bonus — cache the last known good price</summary>

Add a simple in-memory cache to `PricingClient`:

```java
private final Map<String, Map<String, Object>> priceCache = new ConcurrentHashMap<>();

public Map<String, Object> getPrice(String productId) {
    // ... existing WebClient call
    Map<String, Object> response = // ... call Service B
    priceCache.put(productId, response); // Cache successful responses
    return response;
}

private Map<String, Object> getPriceFallback(String productId, Throwable t) {
    Map<String, Object> cached = priceCache.get(productId);
    if (cached != null) {
        Map<String, Object> result = new HashMap<>(cached);
        result.put("priceStale", true);
        return result;
    }
    // No cached price available
    return Map.of(
        "productId", productId,
        "price", 0,
        "currency", "EUR",
        "discount", 0,
        "finalPrice", 0,
        "priceStale", true,
        "error", "Price temporarily unavailable"
    );
}
```

</details>

**Stuck?** `git checkout step-2-circuitbreaker-complete`

---

### Challenge 6: Combine Retry + Circuit Breaker

**Mission:** Use both patterns together. But the order matters!

**The question:** If you have both `@Retry` and `@CircuitBreaker` on the same method, which one executes first?

**The wrong order:** Retry wraps Circuit Breaker
- Circuit opens → Retry still tries 3 times → Each attempt is instantly rejected → Wasted effort

**The right order:** Circuit Breaker wraps Retry
- Circuit open? → Don't even bother retrying, go straight to fallback
- Circuit closed? → Try the call, retry on failure, count the final result

<details>
<summary>Hint 1: How to control the order</summary>

Resilience4j uses aspect ordering. Lower number = higher priority (executes first, wraps the others).

```yaml
resilience4j:
  circuitbreaker:
    circuitBreakerAspectOrder: 1
  retry:
    retryAspectOrder: 2
```

With this config: CircuitBreaker (order 1) wraps Retry (order 2) wraps the actual call.

</details>

<details>
<summary>Hint 2: Both annotations together</summary>

```java
@CircuitBreaker(name = "pricingService", fallbackMethod = "getPriceFallback")
@Retry(name = "pricingService")
public Map<String, Object> getPrice(String productId) {
    // ... existing code
}
```

</details>

<details>
<summary>Hint 3: Full YAML config</summary>

```yaml
resilience4j:
  circuitbreaker:
    circuitBreakerAspectOrder: 1
    instances:
      pricingService:
        registerHealthIndicator: true
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3
        slidingWindowType: COUNT_BASED
  retry:
    retryAspectOrder: 2
    instances:
      pricingService:
        maxAttempts: 3
        waitDuration: 500ms
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
        enableRandomizedWait: true
        randomizedWaitFactor: 0.5
        retryExceptions:
          - org.springframework.web.reactive.function.client.WebClientResponseException.InternalServerError
          - org.springframework.web.reactive.function.client.WebClientResponseException.ServiceUnavailable
          - java.io.IOException
          - java.util.concurrent.TimeoutException
```

</details>

**Test the full flow:**
1. Service B healthy → all good
2. `curl -X POST "http://localhost:8081/admin/random?rate=40"` → retry saves you
3. `curl -X POST http://localhost:8081/admin/fail` → circuit opens → fallback kicks in
4. `curl -X POST http://localhost:8081/admin/healthy` → circuit goes half-open → closes again

**Stuck?** `git checkout step-3-combined`

---

## Wrap-up: Distributed Retry (Bonus)

**The Problem:** Everything we've built so far is in-memory. If Service A crashes, all pending retries are lost. In production with multiple instances, you need persistent retry.

**The Pattern:**
1. When the circuit breaker fallback fires, save the failed request to a database
2. A `@Scheduled` job polls the database and retries periodically
3. Use **ShedLock** to ensure only one instance runs the scheduler

This is implemented in the `solution` branch. Check it out to see the full implementation:

```bash
git checkout solution
```

Key files:
- `RetryRequest.java` — JPA entity for the retry queue
- `RetryRequestRepository.java` — Spring Data repository
- `DistributedRetryService.java` — Scheduled job with ShedLock
- `application.yml` — H2 + ShedLock configuration

---

## Useful Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET http://localhost:8080/products` | All products with prices |
| `GET http://localhost:8080/products/PROD-001` | Single product |
| `GET http://localhost:8080/actuator/health` | Health check (includes CB state) |
| `GET http://localhost:8080/actuator/retries` | Retry instances and config |
| `GET http://localhost:8080/actuator/retryevents` | Retry event log |
| `GET http://localhost:8080/actuator/circuitbreakers` | Circuit breaker states |
| `GET http://localhost:8080/actuator/circuitbreakerevents` | Circuit breaker event log |
| `GET http://localhost:8081/admin/status` | Service B failure mode |

## Solution Branches

If you get stuck, checkout the solution branch for that phase:

| Branch | Content |
|--------|---------|
| `main` | Starter code (no resilience) |
| `step-1-retry-basic` | Basic retry |
| `step-1-retry-complete` | Retry + exponential backoff + jitter + exception filtering |
| `step-2-circuitbreaker-basic` | Circuit breaker (no fallback) |
| `step-2-circuitbreaker-complete` | Circuit breaker + fallback with cache |
| `step-3-combined` | Retry + circuit breaker combined |
| `solution` | Everything + distributed retry with ShedLock |

---

## References

- [Resilience4j Documentation](https://resilience4j.readme.io/docs)
- [Spring Boot + Resilience4j Guide](https://resilience4j.readme.io/docs/getting-started-3)
- [Circuit Breaker Pattern (Martin Fowler)](https://martinfowler.com/bliki/CircuitBreaker.html)
- [ShedLock](https://github.com/lukas-krecan/ShedLock)
