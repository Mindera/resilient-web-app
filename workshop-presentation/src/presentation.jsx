import React from 'react';
import {
  Slide,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  CodeSpanPane,
  CodeSpanSpan,
  Box,
  FlexBox,
  Grid,
  Appear,
  Notes,
} from 'spectacle';
import { theme } from './theme';

// ============================================================
// CUSTOM DIAGRAM COMPONENTS
// ============================================================

const colors = theme.colors;

function ServiceBox({ title, subtitle, port, primary, highlight }) {
  const bg = primary || highlight ? colors.tertiary : colors.secondary;
  const borderColor = primary ? colors.quaternary : highlight ? colors.primary : colors.primary;
  return (
    <Box
      padding="15px 20px"
      border={`2px solid ${borderColor}`}
      borderRadius="12px"
      backgroundColor={bg}
      textAlign="center"
      minWidth="160px"
      boxShadow={`0 4px 20px ${borderColor}33`}
    >
      <Text
        fontSize="1.1em"
        fontWeight="bold"
        color="#fff"
        margin="0 0 5px 0"
      >
        {title}
      </Text>
      <Text fontSize="0.8em" color={colors.muted} margin="0">
        {subtitle}
      </Text>
      {port && (
        <Box
          backgroundColor={primary ? colors.quaternary : colors.primary}
          color={primary ? colors.background : '#fff'}
          padding="2px 10px"
          borderRadius="10px"
          fontSize="0.75em"
          marginTop="8px"
          display="inline-block"
        >
          {port}
        </Box>
      )}
    </Box>
  );
}

function Arrow({ direction = 'right', color }) {
  const style = {
    fontSize: '1.8em',
    color: color || colors.quinary,
    flexShrink: 0,
  };
  if (direction === 'down') return <Text style={{ ...style, display: 'block', textAlign: 'center' }}>↓</Text>;
  if (direction === 'downThin') return <Text style={{ ...style, fontSize: '1.2em', color: colors.muted, display: 'block', textAlign: 'center', margin: '2px 0' }}>↓</Text>;
  return <Text style={style}>→</Text>;
}

function Callout({ children, borderColor, bg }) {
  return (
    <Box
      backgroundColor={bg || colors.tertiary}
      borderLeft={`4px solid ${borderColor || colors.primary}`}
      padding="12px 18px"
      borderRadius="0 8px 8px 0"
      fontSize="0.9em"
      marginTop="15px"
    >
      {children}
    </Box>
  );
}

function SideBySide({ left, right }) {
  return (
    <FlexBox justifyContent="space-around" alignItems="start" gap="30px">
      <Box flex="1">{left}</Box>
      <Box flex="1">{right}</Box>
    </FlexBox>
  );
}

function CompareBox({ title, items, bad, good }) {
  const borderColor = bad ? colors.primary : good ? colors.quaternary : colors.secondary;
  const titleColor = bad ? colors.primary : good ? colors.quaternary : '#fff';
  return (
    <Box
      backgroundColor={colors.tertiary}
      borderRadius="12px"
      padding="18px"
      border={`2px solid ${borderColor}`}
    >
      <Heading fontSize="1em" color={titleColor} margin="0 0 10px 0">
        {title}
      </Heading>
      <UnorderedList>
        {items.map((item, i) => (
          <ListItem key={i} fontSize="0.8em" margin="6px 0">{item}</ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
}

function StateBox({ name, subtitle, state }) {
  const borderColor =
    state === 'closed' ? colors.quaternary :
    state === 'open' ? colors.primary :
    colors.quinary;
  return (
    <Box
      border={`3px solid ${borderColor}`}
      borderRadius="50%"
      width="130px"
      height="130px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      padding="10px"
    >
      <Text fontWeight="bold" fontSize="1em" color={borderColor} margin="0">
        {name}
      </Text>
      <Text fontSize="0.75em" color={colors.muted} margin="5px 0 0 0">
        {subtitle}
      </Text>
    </Box>
  );
}

function ModeBox({ title, desc, state }) {
  const borderColor =
    state === 'healthy' ? colors.quaternary :
    state === 'slow' ? colors.quinary :
    state === 'fail' ? colors.primary :
    '#9b59b6';
  return (
    <Box
      backgroundColor={colors.tertiary}
      borderRadius="8px"
      padding="12px 15px"
      borderLeft={`4px solid ${borderColor}`}
    >
      <Text fontWeight="bold" fontSize="0.9em" color={borderColor} margin="0 0 4px 0">
        {title}
      </Text>
      <Text fontSize="0.8em" color={colors.muted} margin="0">{desc}</Text>
    </Box>
  );
}

function FlowStep({ label, type, highlight }) {
  const borderColor =
    highlight === 'success' ? colors.quaternary :
    highlight === 'fail' ? colors.primary :
    highlight === 'warn' ? colors.quinary :
    colors.quaternary;
  const textColor =
    highlight === 'success' ? colors.quaternary :
    highlight === 'fail' ? colors.primary :
    highlight === 'warn' ? colors.quinary :
    '#fff';
  return (
    <Box
      backgroundColor={colors.tertiary}
      border={`1px solid ${borderColor}`}
      borderRadius="8px"
      padding="10px 15px"
      textAlign="center"
      flex="1"
      fontSize="0.85em"
      color={textColor}
      margin="4px 0"
    >
      {label}
    </Box>
  );
}

function RetryAttempt({ attempt, wait, status }) {
  const statusColor = status === 'fail' ? colors.primary : status === 'wait' ? colors.quinary : colors.quaternary;
  return (
    <Box
      backgroundColor={colors.secondary}
      borderRadius="8px"
      padding="10px 15px"
      textAlign="center"
      minWidth="100px"
    >
      <Text fontWeight="bold" fontSize="0.9em" color={statusColor} margin="0 0 4px 0">
        {attempt}
      </Text>
      <Text fontSize="0.75em" color={colors.muted} margin="0">{wait}</Text>
    </Box>
  );
}

function ShedlockInstance({ name, status }) {
  const bgColor = status === 'run' ? colors.quaternary : colors.tertiary;
  const textColor = status === 'run' ? colors.background : colors.muted;
  return (
    <Box
      backgroundColor={colors.tertiary}
      borderRadius="8px"
      padding="12px 10px"
      textAlign="center"
    >
      <Text fontSize="0.85em" color="#fff" margin="0 0 5px 0">{name}</Text>
      <Box
        display="inline-block"
        backgroundColor={status === 'run' ? colors.quaternary : '#555'}
        color={status === 'run' ? colors.background : colors.muted}
        padding="2px 8px"
        borderRadius="10px"
        fontSize="0.75em"
      >
        {status === 'run' ? 'runs ✓' : 'skip'}
      </Box>
    </Box>
  );
}

function StackLayer({ title, desc, type }) {
  const borderColor =
    type === 'open' ? colors.primary :
    type === 'closed' ? colors.quaternary :
    type === 'retry' ? colors.quinary :
    colors.quaternary;
  return (
    <Box
      backgroundColor={colors.tertiary}
      borderRadius="8px"
      padding="10px 15px"
      margin="6px 0"
      borderLeft={`4px solid ${borderColor}`}
    >
      <Text fontWeight="bold" fontSize="0.85em" color={type === 'open' ? colors.primary : type === 'closed' ? colors.quaternary : type === 'retry' ? colors.quinary : '#fff'} margin="0 0 3px 0">
        {title}
      </Text>
      <Text fontSize="0.8em" color={colors.muted} margin="0">{desc}</Text>
    </Box>
  );
}

function DistRow({ items, arrows = true }) {
  return (
    <FlexBox justifyContent="center" alignItems="center" gap="15px" margin="6px 0">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <Box
            flex="1"
            backgroundColor={item.highlight ? colors.tertiary : colors.tertiary}
            border={`2px solid ${item.highlight ? colors.primary : item.success ? colors.quaternary : colors.secondary}`}
            borderRadius="8px"
            padding="10px 15px"
            textAlign="center"
          >
            <Text fontWeight="bold" fontSize="0.85em" color="#fff" margin="0 0 3px 0">{item.title}</Text>
            <Text fontSize="0.75em" color={colors.muted} margin="0">{item.sub}</Text>
          </Box>
          {arrows && i < items.length - 1 && <Arrow />}
        </React.Fragment>
      ))}
    </FlexBox>
  );
}

function PitfallBox({ wrong, code }) {
  return (
    <Box
      backgroundColor={colors.tertiary}
      borderRadius="12px"
      padding="18px"
      border={`2px solid ${colors.primary}`}
    >
      <Heading fontSize="0.95em" color={colors.primary} margin="0 0 10px 0">
        {wrong ? '❌ WRONG' : '✅ RIGHT'}
      </Heading>
      <CodeSpanPane fontSize="0.65em" language="java" showLineNumbers={false}>
        {code}
      </CodeSpanPane>
    </Box>
  );
}

// ============================================================
// SPEAKER NOTE helper
// ============================================================
function Note({ children }) {
  return <Notes>{children}</Notes>;
}

// ============================================================
// SLIDES
// ============================================================

const slides = [

  // ---- TITLE ----
  <Slide key="title" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary} margin="0 0 0.3em 0">
        Building Resilient<br />Spring Boot Apps
      </Heading>
      <Heading fontSize="1.4em" color={colors.quaternary} fontWeight="normal" margin="0 0 2em 0">
        with Resilience4j
      </Heading>
      <Text fontSize="1.1em" color={colors.muted}>Workshop — 2h 30min to 3h</Text>
    </FlexBox>
    <Note>
      ## Welcome
      - Welcome participants, introduce yourself
      - This is a hands-on, challenge-driven workshop
      - Work at your own pace — branches available if stuck
      - Prerequisites shared before the workshop: Java 21, Maven, Docker, Git
    </Note>
  </Slide>,

  // ---- AGENDA ----
  <Slide key="agenda" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Agenda</Heading>
    <Table fontSize="0.85em">
      <TableRow>
        <TableHeader><Text color="#fff">Time</Text></TableHeader>
        <TableHeader><Text color="#fff">Phase</Text></TableHeader>
      </TableRow>
      {[
        ['10 min', 'Introduction'],
        ['20 min', 'Phase 1: The Chaos'],
        ['45 min', 'Phase 2: The Retry'],
        ['55 min', 'Phase 3: The Circuit Breaker'],
        ['20 min', 'Wrap-up: Distributed Retry'],
        ['10 min', 'Q&A'],
      ].map(([t, p]) => (
        <TableRow key={t}>
          <TableCell><Text color={colors.muted}>{t}</Text></TableCell>
          <TableCell><Text color={p.includes('Phase') ? colors.quinary : '#fff'}>{p}</Text></TableCell>
        </TableRow>
      ))}
    </Table>
    <Callout>
      <Text color="#fff" fontSize="0.9em">
        <strong>Format:</strong> Challenge-driven, hands-on. Work at your own pace.<br />
        Solution branches available if you get stuck.
      </Text>
    </Callout>
    <Note>
      ## Introduction Script
      - **Say:** "In microservices, your system is only as strong as its weakest link. One slow service can take down everything."
      - **Draw on whiteboard:** User → Service A → Service B → DB
      - **Set expectations:** This is challenge-driven. You'll get missions with hints. Solution branches exist for every phase.
      - **Timing:** ~10 min intro total. Each phase has a 2-min intro from you, then participants work.
    </Note>
  </Slide>,

  // ---- SECTION: What is Resilience ----
  <Slide key="section-resilience" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary}>What is<br />Resilience?</Heading>
    </FlexBox>
  </Slide>,

  // ---- THE PROBLEM ----
  <Slide key="problem" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The Problem</Heading>
    <FlexBox justifyContent="center" alignItems="center" gap="15px" margin="1em 0">
      <ServiceBox title="User" subtitle="Browser / Client" />
      <Arrow />
      <ServiceBox title="Service A" subtitle="Product Catalog" port="port 8080" primary />
      <Arrow />
      <ServiceBox title="Service B" subtitle="Pricing Service" port="port 8081" />
    </FlexBox>
    <Callout>
      <Text color="#fff" fontSize="0.9em">
        <strong>One slow or failing service can take down your entire system.</strong>
      </Text>
    </Callout>
    <Note>
      ## The Problem
      - Ask: "Has anyone experienced a slow API call blocking their entire application?"
      - In a microservices architecture, Service A depends on Service B
      - If Service B is slow, Service A threads wait → thread pool exhausted → Service A is DOWN
      - This is called **cascading failure** — the #1 cause of microservice outages
      - **Key point:** Service A has no protection. It just passes through whatever Service B gives it.
    </Note>
  </Slide>,

  // ---- CASCADING FAILURE ----
  <Slide key="cascading" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Cascading Failure</Heading>
    <SideBySide
      left={
        <CompareBox
          title="❌ Without Resilience"
          items={[
            'Service B slows down',
            'Service A threads wait...',
            'Thread pool exhausted',
            <strong style={{ color: colors.primary }}>All requests blocked</strong>,
            <strong style={{ color: colors.primary }}>Service A is DOWN</strong>,
          ]}
          bad
        />
      }
      right={
        <CompareBox
          title="✓ With Resilience"
          items={[
            'Service B slows down',
            'Circuit breaker trips',
            'Service A fails fast',
            'Fallback: show cached data',
            <strong style={{ color: colors.quaternary }}>Service A stays UP</strong>,
          ]}
          good
        />
      }
    />
    <Note>
      ## Cascading Failure — Explain with Whiteboard
      - Draw the flow without CB: all threads blocked
      - Draw the flow with CB: fast fail → fallback → users see cached data
      - **Emotional hook:** "Imagine your e-commerce site during Black Friday. One pricing service slows down. Without resilience, your entire catalog becomes unresponsive. Every user sees a timeout. Revenue drops to zero."
    </Note>
  </Slide>,

  // ---- PATTERNS ----
  <Slide key="patterns" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Resilience Patterns We'll Learn</Heading>
    <Grid gridTemplateColumns="1fr 1fr" gap="20px" margin="0.5em 0">
      <CompareBox title="1. Retry" items={['Try again when things go wrong', 'With backoff + jitter', 'Handles transient failures']} good />
      <CompareBox title="2. Circuit Breaker" items={['Stop calling what\'s broken', 'Fail fast, use fallback', 'Handles sustained failures']} good />
    </Grid>
    <CompareBox
      title="3. Distributed Retry"
      items={['Retry even when you crash', 'Persistent queue + scheduled job + distributed lock']}
      good
    />
    <Note>
      ## Patterns Overview
      - **Retry:** Simple — if it fails, try again. Best for transient failures (network blips, brief overloads).
      - **Circuit Breaker:** Smarter — stop calling when it's clearly broken. Best for sustained failures.
      - **Distributed Retry:** Production-ready — retry survives app restarts and multi-instance deployments.
      - **Bonus patterns not covered (mention as homework):** Bulkhead, Rate Limiter, TimeLimiter
    </Note>
  </Slide>,

  // ---- SECTION: Architecture ----
  <Slide key="section-arch" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary}>The<br />Architecture</Heading>
    </FlexBox>
  </Slide>,

  // ---- OUR SYSTEM ----
  <Slide key="architecture" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Our System</Heading>
    <FlexBox justifyContent="center" alignItems="center" gap="15px" margin="1em 0">
      <ServiceBox title="Product Catalog" subtitle="Service A" port="port 8080" primary />
      <Arrow />
      <ServiceBox title="Pricing Service" subtitle="Service B" port="port 8081" />
    </FlexBox>
    <FlexBox flexDirection="column" alignItems="center" gap="8px" margin="1em 0">
      <FlowStep label="GET /products" />
      <Arrow direction="downThin" />
      <FlowStep label="Enrich with prices from Service B" />
      <Arrow direction="downThin" />
      <FlowStep label="Return product list with pricing" />
    </FlexBox>
    <Note>
      ## Architecture Overview
      - **Service A (Product Catalog):** Serves products. For each product, calls Service B for the price.
      - **Service B (Pricing Service):** Returns price info for a product ID.
      - **Domain:** E-commerce — product catalog with live pricing
      - Participants will modify Service A's `PricingClient` to add resilience patterns.
      - Service B is the "unreliable provider" — we'll control its failure modes via admin API.
    </Note>
  </Slide>,

  // ---- SERVICE B MODES ----
  <Slide key="modes" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Service B: Failure Modes</Heading>
    <Grid gridTemplateColumns="1fr 1fr" gap="15px" margin="1em 0">
      <ModeBox title="POST /admin/healthy" desc="Normal operation ✓" state="healthy" />
      <ModeBox title="POST /admin/slow" desc="10-second delay per request ⏱️" state="slow" />
      <ModeBox title="POST /admin/fail" desc="500 Internal Server Error ❌" state="fail" />
      <ModeBox title="POST /admin/random?rate=40" desc="40% of requests fail randomly 🎲" state="random" />
    </Grid>
    <Callout borderColor={colors.quaternary}>
      <Text color="#fff" fontSize="0.9em">
        These are your <strong>weapons</strong> for testing resilience patterns!
      </Text>
    </Callout>
    <Note>
      ## Service B Failure Modes
      - **healthy:** Normal operation. Use `curl -X POST http://localhost:8081/admin/healthy`
      - **slow:** Every request takes 10 seconds. Use to show thread blocking.
      - **fail:** Every request returns 500. Use to show error propagation.
      - **random:** Configurable % of failures. Use to test retry effectiveness.
      - **Tip:** Show participants how to use `curl` commands. Or use Postman/browser for GET requests and curl for POST.
    </Note>
  </Slide>,

  // ---- SECTION: Phase 1 ----
  <Slide key="section-p1" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary}>Phase 1</Heading>
      <Heading fontSize="1.4em" color={colors.quaternary} fontWeight="normal">The Chaos</Heading>
    </FlexBox>
  </Slide>,

  // ---- PHASE 1 CHALLENGE ----
  <Slide key="p1-challenge" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Observe the Disaster</Heading>
    <Text color="#fff" fontSize="0.9em" margin="0 0 1em 0">
      <strong>No code changes. Just observe.</strong>
    </Text>
    <UnorderedList fontSize="0.85em" color="#fff">
      <ListItem>1. Start both services (<CodeSpan>cd pricing-service && mvn spring-boot:run</CodeSpan> then <CodeSpan>cd product-catalog-service && mvn spring-boot:run</CodeSpan>)</ListItem>
      <ListItem>2. Call <CodeSpan>GET /products</CodeSpan> — verify it works</ListItem>
      <ListItem>3. Toggle Service B to <strong style={{ color: colors.quinary }}>slow mode</strong>: <CodeSpan>curl -X POST localhost:8081/admin/slow</CodeSpan></ListItem>
      <ListItem>4. Call <CodeSpan>GET /products</CodeSpan> from multiple browser tabs simultaneously</ListItem>
      <ListItem>5. Toggle Service B to <strong style={{ color: colors.primary }}>error mode</strong>: <CodeSpan>curl -X POST localhost:8081/admin/fail</CodeSpan></ListItem>
      <ListItem>6. Call <CodeSpan>GET /products</CodeSpan> again</ListItem>
      <ListItem>7. <strong>Bonus:</strong> <CodeSpan>docker stop pricing-service</CodeSpan></ListItem>
    </UnorderedList>
    <Note>
      ## Phase 1 Facilitation
      - **Time: 20 min** (intro 2 min + exploration 15 min + debrief 3 min)
      - Walk around and help participants get started. Setup issues are common.
      - If using Docker: `docker-compose up --build` is the simplest start
      - If running locally: start Service B first, then Service A
      - **Debrief questions:**
        - "What happened when Service B was slow?" (answer: Service A hung for 10+ seconds)
        - "How many requests did it take to make Service A unresponsive?" (varies by machine)
        - "Which was worse: slow or error mode?" (answer: slow — holds threads hostage)
    </Note>
  </Slide>,

  // ---- PHASE 1 DEBRIEF ----
  <Slide key="p1-debrief" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">What Did You Observe?</Heading>
    <SideBySide
      left={
        <CompareBox
          title="⏱️ Slow Mode"
          items={[
            'Service A hung for 10+ seconds',
            'All threads blocked',
            'Entire service became unresponsive',
          ]}
          bad
        />
      }
      right={
        <CompareBox
          title="❌ Error Mode"
          items={[
            '500 errors propagated to users',
            'No graceful degradation',
            'No fallback',
          ]}
          bad
        />
      }
    />
    <Callout>
      <Text color="#fff" fontSize="0.9em">
        <strong>Key insight:</strong> A <em>slow</em> service is <em>worse</em> than a dead service.<br />
        Dead = fails fast. Slow = holds your threads hostage.
      </Text>
    </Callout>
    <Note>
      ## Phase 1 Debrief — Key Talking Points
      - **"Slow is worse than dead"** — the most important lesson of Phase 1
        - Dead: connection refused → immediate failure → move on
        - Slow: threads blocked for 10s → thread pool fills up → all requests blocked
      - Ask: "How many concurrent requests before Service A became unresponsive?" (depends on thread pool size, usually 50-200)
      - The lesson: without resilience, one slow service kills the whole neighborhood.
    </Note>
  </Slide>,

  // ---- SECTION: Phase 2 ----
  <Slide key="section-p2" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary}>Phase 2</Heading>
      <Heading fontSize="1.4em" color={colors.quaternary} fontWeight="normal">The Retry</Heading>
    </FlexBox>
  </Slide>,

  // ---- RETRY PATTERN ----
  <Slide key="retry-pattern" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The Retry Pattern</Heading>
    <FlexBox justifyContent="center" gap="10px" margin="1em 0" flexWrap="wrap">
      <RetryAttempt attempt="Attempt 1" wait="Fail ❌" status="fail" />
      <Arrow />
      <RetryAttempt attempt="Wait 500ms" wait="Backoff" status="wait" />
      <Arrow />
      <RetryAttempt attempt="Attempt 2" wait="Fail ❌" status="fail" />
      <Arrow />
      <RetryAttempt attempt="Wait 1s" wait="Double" status="wait" />
      <Arrow />
      <RetryAttempt attempt="Attempt 3" wait="Success ✓" status="success" />
    </FlexBox>
    <Note>
      ## Retry Pattern — Explain
      - If a call fails, wait a bit, then try again.
      - If it fails again, wait longer, then try again.
      - Eventually succeed or give up.
      - **The math:** With 3 attempts and 40% failure rate: 0.4^3 = 6.4% chance all 3 fail → 93.6% success rate!
    </Note>
  </Slide>,

  // ---- CHALLENGE 1: BASIC RETRY ----
  <Slide key="c1-retry" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Challenge 1: Add Basic Retry</Heading>
    <UnorderedList fontSize="0.85em" color="#fff">
      <ListItem>1. Toggle Service B: <CodeSpan>curl -X POST "localhost:8081/admin/random?rate=40"</CodeSpan></ListItem>
      <ListItem>2. Hit <CodeSpan>GET /products</CodeSpan> — you see failures</ListItem>
      <ListItem>3. Add <CodeSpan>@Retry(name = "pricingService")</CodeSpan> to <CodeSpan>PricingClient.getPrice()</CodeSpan></ListItem>
      <ListItem>4. Configure in <CodeSpan>application.yml</CodeSpan></ListItem>
    </UnorderedList>
    <CodeSpanPane fontSize="0.7em" language="java" showLineNumbers={false}>
      {`@Retry(name = "pricingService")
public Map<String, Object> getPrice(String productId) { ... }`}
    </CodeSpanPane>
    <CodeSpanPane fontSize="0.7em" language="yaml" showLineNumbers={false}>
      {`resilience4j:
  retry:
    instances:
      pricingService:
        maxAttempts: 3
        waitDuration: 500ms`}
    </CodeSpanPane>
    <Note>
      ## Challenge 1: Basic Retry
      - **Time: ~15 min** for this challenge
      - Where to add: `product-catalog-service/src/main/java/com/workshop/catalog/client/PricingClient.java`
      - **Common mistakes:**
        - Forgetting the import: `import io.github.resilience4j.retry.annotation.Retry;`
        - Method must be `public` (AOP proxy requirement)
        - Restart needed after changing `application.yml`
      - **Test it:** Toggle to random mode, hit `/products` — most requests should succeed now.
      - Show metrics: `curl http://localhost:8080/actuator/retries`
    </Note>
  </Slide>,

  // ---- EXPONENTIAL BACKOFF ----
  <Slide key="backoff" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Exponential Backoff</Heading>
    <SideBySide
      left={
        <CompareBox
          title="❌ Without Backoff"
          items={[
            'All retries at 500ms',
            'Creates load spikes',
            'Can overload the failing service',
          ]}
          bad
        />
      }
      right={
        <CompareBox
          title="✓ With Backoff"
          items={[
            '500ms → 1s → 2s',
            'Gives service breathing room',
            'Better chance of recovery',
          ]}
          good
        />
      }
    />
    <Note>
      ## Exponential Backoff — Explain
      - Without backoff: all retries fire at the same interval → creates a spike
      - With backoff: each retry waits longer → spreads out the load
      - Formula: waitDuration × multiplier^attempt
      - **Analogy:** "Imagine a concert venue. The doors open and 10,000 people rush in. Without coordination, everyone pushes. With backoff, you give out random ticket times — much smoother."
    </Note>
  </Slide>,

  // ---- JITTER ----
  <Slide key="jitter" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Jitter: Prevent Thundering Herd</Heading>
    <SideBySide
      left={
        <CompareBox
          title="❌ Without Jitter"
          items={[
            '10 clients all retry at same time',
            'Spike at t=0.5s, t=1s, t=2s',
            'All hit Service B simultaneously',
            <strong style={{ color: colors.primary }}>Even worse than before!</strong>,
          ]}
          bad
        />
      }
      right={
        <CompareBox
          title="✓ With Jitter"
          items={[
            '10 clients retry at random intervals',
            'Requests spread out',
            'No thundering herd',
            <strong style={{ color: colors.quaternary }}>Smooth distribution</strong>,
          ]}
          good
        />
      }
    />
    <Note>
      ## Jitter — The Thundering Herd Problem
      - Even with backoff, if 100 clients all retry at the same time, they all hit at t=0.5s, t=1s, t=2s
      - This is the "thundering herd" problem
      - Jitter adds randomness: wait × (0.5 + random(0,1))
      - So actual wait might be 500ms, 750ms, 400ms, 620ms — spread out!
      - **Practical example:** Netflix found that without jitter, retries could amplify traffic 100x during an outage.
    </Note>
  </Slide>,

  // ---- CHALLENGE 2: RETRY STORM ----
  <Slide key="c2-storm" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Challenge 2: Fix the Retry Storm</Heading>
    <Text color="#fff" fontSize="0.9em" margin="0 0 1em 0">
      Your retries are making things <strong style={{ color: colors.primary }}>worse</strong>!
    </Text>
    <UnorderedList fontSize="0.85em" color="#fff">
      <ListItem>1. Service B in slow mode + 10 requests = <strong>30 calls</strong> to Service B!</ListItem>
      <ListItem>2. Add exponential backoff + jitter to the config</ListItem>
    </UnorderedList>
    <CodeSpanPane fontSize="0.65em" language="yaml" showLineNumbers={false}>
      {`resilience4j:
  retry:
    instances:
      pricingService:
        maxAttempts: 3
        waitDuration: 500ms
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
        enableRandomizedWait: true
        randomizedWaitFactor: 0.5`}
    </CodeSpanPane>
    <Callout>
      <Text color="#fff" fontSize="0.85em">
        <strong>Bonus:</strong> Only retry on 5xx errors — NOT 400 Bad Request!<br />
        (400 will <em>never</em> succeed, no matter how many times you retry)
      </Text>
    </Callout>
    <Note>
      ## Challenge 2: Fix the Retry Storm
      - **Time: ~15 min**
      - Show the problem: Send 10 concurrent requests with Service B in slow mode
      - Check Service B logs — how many calls? (Should be 30, not 10!)
      - **Bonus challenge:** Add `retryExceptions` and `ignoreExceptions` to only retry on 5xx
      - **Hint:** `ignoreExceptions` takes precedence. Configure:
        - `retryExceptions`: InternalServerError, ServiceUnavailable, BadGateway, IOException, TimeoutException
        - `ignoreExceptions`: BadRequest, NotFound
    </Note>
  </Slide>,

  // ---- SECTION: Phase 3 ----
  <Slide key="section-p3" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary}>Phase 3</Heading>
      <Heading fontSize="1.4em" color={colors.quaternary} fontWeight="normal">The Circuit Breaker</Heading>
    </FlexBox>
  </Slide>,

  // ---- CB PATTERN ----
  <Slide key="cb-pattern" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The Circuit Breaker Pattern</Heading>
    <FlexBox justifyContent="center" alignItems="center" gap="20px" margin="1em 0">
      <StateBox name="CLOSED" subtitle="Normal" state="closed" />
      <Box textAlign="center">
        <Arrow />
        <Text fontSize="0.7em" color={colors.muted} margin="5px 0">failures &gt; 50%</Text>
      </Box>
      <StateBox name="OPEN" subtitle="Failing fast" state="open" />
      <Box textAlign="center">
        <Arrow />
        <Text fontSize="0.7em" color={colors.muted} margin="5px 0">wait 10s</Text>
      </Box>
      <StateBox name="HALF_OPEN" subtitle="Testing" state="half" />
    </FlexBox>
    <Callout>
      <Text color="#fff" fontSize="0.9em">
        Think of it like an electrical circuit breaker in your house.<br />
        When there's a problem, it <strong>trips</strong> to protect the system.
      </Text>
    </Callout>
    <Note>
      ## Circuit Breaker — Explain with Whiteboard
      - Draw the state diagram on the whiteboard:
        - CLOSED (normal) → failures > 50% → OPEN (fail fast)
        - OPEN → wait 10s → HALF_OPEN (test calls)
        - HALF_OPEN → succeed? → CLOSED. Fail? → OPEN
      - **Analogy:** Your home circuit breaker. When there's a short, it trips. You don't keep flipping it back on while the wire is still sparking.
      - **Key insight:** In CLOSED state, the CB counts successes and failures. When failure rate > threshold, it trips to OPEN.
    </Note>
  </Slide>,

  // ---- CLOSED STATE ----
  <Slide key="closed-state" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">CLOSED State (Normal)</Heading>
    <FlexBox flexDirection="column" alignItems="center" gap="6px" margin="1em 0">
      <FlowStep label="Request comes in" />
      <Arrow direction="downThin" />
      <FlowStep label="Call Service B" />
      <Arrow direction="downThin" />
      <FlowStep label="Count success/failure" highlight="warn" />
      <Arrow direction="downThin" />
      <FlowStep label="After 10 calls: failures > 50%? → OPEN" highlight="warn" />
    </FlexBox>
    <Note>
      ## CLOSED State
      - Normal operation. Requests go through to Service B.
      - The CB counts each call (success or failure) in a sliding window of 10 calls.
      - When the window fills, if failures > 50%, the CB trips to OPEN.
      - Config: `slidingWindowSize: 10`, `failureRateThreshold: 50`
    </Note>
  </Slide>,

  // ---- OPEN STATE ----
  <Slide key="open-state" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">OPEN State (Failing Fast)</Heading>
    <FlexBox flexDirection="column" alignItems="center" gap="6px" margin="1em 0">
      <FlowStep label="Request comes in" />
      <Arrow direction="downThin" />
      <FlowStep label="Circuit OPEN → Reject immediately" highlight="fail" />
      <Arrow direction="downThin" />
      <FlowStep label="Call fallback (no Service B call!)" highlight="fail" />
      <Arrow direction="downThin" />
      <FlowStep label="After 10s → HALF_OPEN" highlight="warn" />
    </FlexBox>
    <Note>
      ## OPEN State
      - All requests are rejected immediately — no call to Service B.
      - Instead, the fallback is called.
      - After `waitDurationInOpenState` (we set 10s), the CB moves to HALF_OPEN.
      - **Key benefit:** Service B gets zero traffic while it's struggling to recover.
      - Without the fallback, users would see exceptions. With the fallback, they get cached/stale data.
    </Note>
  </Slide>,

  // ---- HALF_OPEN STATE ----
  <Slide key="half-state" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">HALF_OPEN State (Testing)</Heading>
    <FlexBox flexDirection="column" alignItems="center" gap="6px" margin="1em 0">
      <FlowStep label="3 test calls allowed through" />
      <Arrow direction="downThin" />
      <FlowStep label="If ≥2 succeed (67%+) → CLOSED ✓" highlight="success" />
      <Arrow direction="downThin" />
      <FlowStep label="If ≥2 fail → OPEN again ❌" highlight="fail" />
    </FlexBox>
    <Note>
      ## HALF_OPEN State
      - The CB lets a limited number of "test calls" through.
      - Config: `permittedNumberOfCallsInHalfOpenState: 3`
      - If 2+ succeed (67%+), the circuit closes → back to normal
      - If 2+ fail, the circuit opens again → back to rejecting
      - This prevents a "flapping" CB that keeps switching states.
    </Note>
  </Slide>,

  // ---- CHALLENGE 3: CB ----
  <Slide key="c3-cb" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Challenge 3: Add Circuit Breaker</Heading>
    <UnorderedList fontSize="0.85em" color="#fff">
      <ListItem>1. Toggle Service B: <CodeSpan>curl -X POST localhost:8081/admin/fail</CodeSpan></ListItem>
      <ListItem>2. Send requests repeatedly — watch the circuit open</ListItem>
      <ListItem>3. Check state: <CodeSpan>GET /actuator/circuitbreakers</CodeSpan></ListItem>
      <ListItem>4. Toggle back to healthy — watch it recover</ListItem>
    </UnorderedList>
    <CodeSpanPane fontSize="0.65em" language="java" showLineNumbers={false}>
      {`@CircuitBreaker(name = "pricingService")
public Map<String, Object> getPrice(String productId) { ... }`}
    </CodeSpanPane>
    <CodeSpanPane fontSize="0.65em" language="yaml" showLineNumbers={false}>
      {`resilience4j:
  circuitbreaker:
    instances:
      pricingService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s`}
    </CodeSpanPane>
    <Note>
      ## Challenge 3: Basic Circuit Breaker
      - **Time: ~20 min**
      - **WARNING — THE #1 WORKSHOP PITFALL:** The AOP proxy trap!
        - Explain: if you put the annotation on a method called from within the same class, it won't work.
        - Solution: keep the annotation on `PricingClient`, called by `ProductService`
      - Participants should watch the circuit state change in the Actuator endpoint
      - Show: `curl http://localhost:8080/actuator/circuitbreakers` — shows state (CLOSED/OPEN/HALF_OPEN)
      - **Tip:** Send requests rapidly (e.g., bash loop) to fill the sliding window quickly
    </Note>
  </Slide>,

  // ---- FALLBACK ----
  <Slide key="fallback" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The Fallback</Heading>
    <Text color="#fff" fontSize="0.9em" margin="0 0 1em 0">
      When the circuit opens, give users something <strong>useful</strong>, not an error.
    </Text>
    <CodeSpanPane fontSize="0.65em" language="java" showLineNumbers showLineNumbers startFrom={1}>
      {`@CircuitBreaker(name = "pricingService",
             fallbackMethod = "getPriceFallback")
public Map<String, Object> getPrice(String productId) {
    // ... WebClient call
}

private Map<String, Object> getPriceFallback(
        String productId, Throwable t) {
    return Map.of(
        "price", cachedPrice,
        "priceStale", true,
        "error", "Price temporarily unavailable"
    );
}`}
    </CodeSpanPane>
    <Callout>
      <Text color="#fff" fontSize="0.85em">
        The fallback method signature must match: <strong>same params + Throwable</strong> as last param.
      </Text>
    </Callout>
    <Note>
      ## The Fallback
      - Without fallback: users see ugly exceptions when the circuit is open
      - With fallback: users see cached prices or a friendly "price unavailable" message
      - The fallback is a method in the SAME class with the same params + a Throwable
      - The fallback can return cached data, default data, or even call a different service
      - **Bonus:** Implement an in-memory cache so the fallback returns the last known good price
    </Note>
  </Slide>,

  // ---- PITFALL ----
  <Slide key="pitfall" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The #1 Workshop Pitfall</Heading>
    <Callout borderColor={colors.primary}>
      <Text color="#fff" fontSize="0.9em">
        <strong>⚠️ @CircuitBreaker doesn't work when you call the annotated method from within the same class!</strong>
      </Text>
    </Callout>
    <FlexBox gap="20px" marginTop="1em">
      <PitfallBox
        wrong
        code={`@CircuitBreaker(name = "ps")
public void myMethod() {
    anotherMethod(); // internal call
}

public void anotherMethod() {
    // AOP proxy NOT used!
}`}
      />
      <PitfallBox
        wrong={false}
        code={`@Service
public class ProductService {
    @Autowired
    private PricingClient client;

    public void myMethod() {
        client.getPrice(id); // through proxy!
    }
}`}
      />
    </FlexBox>
    <Note>
      ## AOP Proxy Trap — Explain Clearly
      - Spring AOP uses proxies. When you call `client.getPrice()` from `ProductService`, the call goes through the proxy → CB kicks in.
      - But when you call a method within the same class, you're calling `this.method()` → bypasses the proxy entirely!
      - **Three ways to fix:**
        1. Extract to a separate bean (recommended) — we did this with `PricingClient`
        2. Inject the bean into itself with `@Lazy`
        3. Use `AopContext.currentProxy()` (ugly)
      - **This is the #1 reason workshop demos fail.** Warn participants early!
    </Note>
  </Slide>,

  // ---- CHALLENGE 4: COMBINE ----
  <Slide key="c4-combine" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Challenge 4: Combine Retry + Circuit Breaker</Heading>
    <Text color="#fff" fontSize="0.9em" margin="0 0 1em 0">
      The <strong>order matters</strong>!
    </Text>
    <SideBySide
      left={
        <CompareBox
          title="❌ Wrong Order"
          items={[
            '@Retry outer, @CircuitBreaker inner',
            'Circuit opens → retries still happen',
            <strong style={{ color: colors.primary }}>Wasted effort!</strong>,
          ]}
          bad
        />
      }
      right={
        <CompareBox
          title="✅ Right Order"
          items={[
            '@CircuitBreaker outer, @Retry inner',
            'Circuit open → skip retry',
            <strong style={{ color: colors.quaternary }}>Go straight to fallback</strong>,
          ]}
          good
        />
      }
    />
    <CodeSpanPane fontSize="0.65em" language="yaml" showLineNumbers={false}>
      {`resilience4j:
  circuitbreaker:
    circuitBreakerAspectOrder: 1   # outer
  retry:
    retryAspectOrder: 2             # inner`}
    </CodeSpanPane>
    <Note>
      ## Challenge 4: Combine Patterns
      - **Time: ~15 min**
      - **Critical concept:** Lower aspect order = higher priority = outer wrapper
      - CircuitBreaker (order 1) wraps Retry (order 2) wraps the actual call
      - **Why it matters:**
        - Wrong: CB → Retry → Call → Circuit opens after all retries → wasted retries
        - Right: CB → OPEN? → skip retry → fallback immediately
      - The CB counts the FINAL result after retries — if retry #3 succeeds, it's a success
      - **Test flow:**
        1. Service B healthy → all good
        2. Random failures → retry saves you
        3. Full outage → circuit opens → fallback
        4. Service B recovers → circuit goes half-open → closes
    </Note>
  </Slide>,

  // ---- SECTION: Wrap-up ----
  <Slide key="section-wrapup" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary}>Wrap-up</Heading>
      <Heading fontSize="1.4em" color={colors.quaternary} fontWeight="normal">Distributed Retry</Heading>
    </FlexBox>
  </Slide>,

  // ---- DISTRIBUTED RETRY PROBLEM ----
  <Slide key="dist-problem" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The Problem with In-Memory Retry</Heading>
    <CompareBox
      title="Everything dies with the process"
      items={[
        'Service A crashes → retries lost',
        '5 instances → who retries what?',
        'Failure lasts hours → give up too soon',
      ]}
      bad
    />
    <Callout>
      <Text color="#fff" fontSize="0.9em">
        We need <strong>persistent retry</strong>.
      </Text>
    </Callout>
    <Note>
      ## Distributed Retry — Present, Don't Hands-On
      - This is a code walkthrough, not a hands-on exercise
      - Everything we've built is in-memory → dies with the process
      - **Scenario:** Service A crashes while retrying. User loses the request.
      - **Scenario:** 5 instances of Service A. Who retries what?
      - **Scenario:** Failure lasts 2 hours. In-memory retries give up after a minute.
      - Solution: persist failed requests to a database, use a scheduled job to retry
    </Note>
  </Slide>,

  // ---- DISTRIBUTED RETRY PATTERN ----
  <Slide key="dist-pattern" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The Distributed Retry Pattern</Heading>
    <FlexBox flexDirection="column" alignItems="center" gap="4px" margin="1em 0">
      <DistRow
        items={[
          { title: 'User Request', sub: 'Call to Service B' },
          { title: 'Service B Fails', sub: 'Fallback triggered', highlight: true },
          { title: 'Save to DB', sub: 'retry_requests table' },
        ]}
      />
      <Arrow direction="down" />
      <DistRow
        items={[
          { title: 'Scheduled Job', sub: 'Every 30 seconds' },
          { title: 'ShedLock', sub: 'Only 1 instance runs', success: true },
          { title: 'Retry from DB', sub: 'Call Service B', success: true },
        ]}
      />
    </FlexBox>
    <Note>
      ## Distributed Retry Architecture
      - **Flow:**
        1. Fallback fires → save failed request to `retry_requests` DB table
        2. `@Scheduled` job runs every 30 seconds
        3. ShedLock ensures only 1 instance runs the job at a time
        4. On success: update cache, mark as COMPLETED
        5. On failure: increment attempt count, set next retry time (exponential backoff)
        6. After max attempts: mark as FAILED
      - **Why ShedLock?** Without it, all 5 instances would run the scheduler → 5x retries per request.
    </Note>
  </Slide>,

  // ---- SHEDLOCK ----
  <Slide key="shedlock" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">ShedLock: Distributed Locking</Heading>
    <FlexBox justifyContent="space-around" gap="10px" margin="1em 0">
      <ShedlockInstance name="Instance 1" status="run" />
      <ShedlockInstance name="Instance 2" status="skip" />
      <ShedlockInstance name="Instance 3" status="skip" />
      <ShedlockInstance name="Instance 4" status="skip" />
      <ShedlockInstance name="Instance 5" status="skip" />
    </FlexBox>
    <SideBySide
      left={
        <CompareBox
          title="❌ Without ShedLock"
          items={['5 instances run scheduler → 5x retries!']}
          bad
        />
      }
      right={
        <CompareBox
          title="✅ With ShedLock"
          items={['1 instance runs → exactly 1 retry']}
          good
        />
      }
    />
    <Note>
      ## ShedLock — Explain
      - ShedLock uses a database table (`shedlock`) to acquire a distributed lock
      - `lockAtLeastFor`: minimum time to hold the lock (prevents running too frequently)
      - `lockAtMostFor`: maximum time to hold the lock (auto-release if job crashes)
      - **Alternatives:** Redis-based locking, Quartz Scheduler, Spring Integration
      - In this workshop we use H2 (in-memory) + JDBC. In production, use PostgreSQL/MySQL.
    </Note>
  </Slide>,

  // ---- FULL STACK ----
  <Slide key="full-stack" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">The Full Resilience Stack</Heading>
    <StackLayer title="Circuit Breaker" desc="OPEN? → Fallback → Cached/Stale price" type="open" />
    <StackLayer title="CLOSED → Retry" desc="Fail? → retry with backoff + jitter" type="retry" />
    <StackLayer title="Success" desc="Cache price → Return response" type="success" />
    <StackLayer title="Fallback fired" desc="Save to DB → Background retry via ShedLock" type="open" />
    <Note>
      ## Full Stack — Walk Through Each Layer
      1. Request comes in
      2. Circuit Breaker checks: OPEN? → go to fallback immediately
      3. Circuit CLOSED → Retry attempts the call
      4. Call fails → retry with backoff + jitter
      5. Call succeeds → cache the price, return response
      6. Fallback fires → save to DB → ShedLock job handles background retry
      - This is production-grade resilience: fast fail + graceful degradation + persistent retry
    </Note>
  </Slide>,

  // ---- KEY TAKEAWAYS ----
  <Slide key="takeaways" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">When to Use What</Heading>
    <Table fontSize="0.85em">
      <TableRow>
        <TableHeader><Text color="#fff">Pattern</Text></TableHeader>
        <TableHeader><Text color="#fff">Use when</Text></TableHeader>
      </TableRow>
      {[
        ['Retry', 'Failures are transient (network blips, brief overloads)'],
        ['Circuit Breaker', 'Failures are sustained (service is down)'],
        ['Fallback', 'You want graceful degradation for users'],
        ['Distributed Retry', 'Operations must survive app restarts'],
        ['Bulkhead', 'You want to isolate failures between services'],
        ['Rate Limiter', 'You need to respect downstream rate limits'],
      ].map(([p, u]) => (
        <TableRow key={p}>
          <TableCell><Text color={colors.quinary} fontWeight="bold">{p}</Text></TableCell>
          <TableCell><Text color="#fff">{u}</Text></TableCell>
        </TableRow>
      ))}
    </Table>
    <Note>
      ## Key Takeaways
      - **Retry:** Simple, but can cause retry storms without backoff + jitter
      - **Circuit Breaker:** Essential for protecting against sustained failures
      - **Fallback:** The UX win — users never see ugly errors
      - **Distributed Retry:** Production requirement — in-memory dies with the process
      - **Bulkhead + Rate Limiter:** Not covered today, but important — mention as homework
    </Note>
  </Slide>,

  // ---- REAL WORLD ----
  <Slide key="realworld" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Real-World Stories</Heading>
    <Grid gridTemplateColumns="1fr 1fr" gap="20px" margin="1em 0">
      <CompareBox
        title="Netflix"
        items={[
          'Built Hystrix after cascading failures',
          'Created Chaos Monkey to test resilience',
          'Pioneered many resilience patterns',
        ]}
        good
      />
      <CompareBox
        title="Amazon"
        items={[
          'Every 100ms latency = 1% sales lost',
          '10 services in chain = 10x user latency',
          'Resilience = money',
        ]}
        good
      />
    </Grid>
    <Note>
      ## Real-World Stories
      - **Netflix:** After experiencing cascading failures that took down their site, they built Hystrix (predecessor to Resilience4j). They also created Chaos Monkey — a tool that randomly kills services to test resilience.
      - **Amazon:** Studies showed that every 100ms of latency costs 1% in sales. In a microservices architecture with 10 services in the call chain, a 10ms delay in one service becomes 100ms for the user.
      - **Key point:** Resilience isn't just technical — it's a business requirement.
    </Note>
  </Slide>,

  // ---- RESOURCES ----
  <Slide key="resources" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Resources</Heading>
    <Table fontSize="0.85em">
      <TableRow>
        <TableHeader><Text color="#fff">Resource</Text></TableHeader>
        <TableHeader><Text color="#fff">URL</Text></TableHeader>
      </TableRow>
      {[
        ['Resilience4j Docs', 'resilience4j.readme.io'],
        ['Spring Cloud Circuit Breaker', 'spring.io/projects/spring-cloud-circuitbreaker'],
        ['Martin Fowler: Circuit Breaker', 'martinfowler.com/bliki/CircuitBreaker.html'],
        ['Microsoft: Retry Pattern', 'learn.microsoft.com/azure/architecture/patterns/retry'],
        ['ShedLock', 'github.com/lukas-krecan/ShedLock'],
      ].map(([r, u]) => (
        <TableRow key={r}>
          <TableCell><Text color="#fff">{r}</Text></TableCell>
          <TableCell><CodeSpan fontSize="0.75em">{u}</CodeSpan></TableCell>
        </TableRow>
      ))}
    </Table>
  </Slide>,

  // ---- BRANCHES ----
  <Slide key="branches" backgroundColor={colors.background}>
    <Heading fontSize="1.8em" color={colors.primary} margin="0 0 0.5em 0">Workshop Branches</Heading>
    <Table fontSize="0.85em">
      <TableRow>
        <TableHeader><Text color="#fff">Branch</Text></TableHeader>
        <TableHeader><Text color="#fff">Content</Text></TableHeader>
      </TableRow>
      {[
        ['main', 'Starter code (no resilience)'],
        ['step-1-retry', 'Retry with backoff, jitter, and exception filtering'],
        ['step-2-circuitbreaker', 'Circuit breaker with fallback and in-memory price cache'],
        ['solution', 'Everything + distributed retry with ShedLock'],
      ].map(([b, c]) => (
        <TableRow key={b}>
          <TableCell><CodeSpan fontSize="0.8em">{b}</CodeSpan></TableCell>
          <TableCell><Text color="#fff">{c}</Text></TableCell>
        </TableRow>
      ))}
    </Table>
    <Callout>
      <Text color="#fff" fontSize="0.85em">
        Stuck? <CodeSpan>git checkout step-1-retry</CodeSpan> — then study the diff to understand the changes.
      </Text>
    </Callout>
    <Note>
      ## Branches Reminder
      - `main`: Starting point for everyone
      - `step-1-retry`: Challenge 1-2 solutions (basic retry through backoff+jitter)
      - `step-2-circuitbreaker`: Challenge 3-4 solutions (CB + fallback + combine)
      - `solution`: Everything including distributed retry
      - Tell participants: "If you're completely stuck, checkout the solution branch and read the diff. Understanding the solution is just as valuable as figuring it out yourself."
    </Note>
  </Slide>,

  // ---- Q&A ----
  <Slide key="qa" backgroundColor={colors.background}>
    <FlexBox height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <Heading fontSize="3em" color={colors.primary} margin="0 0 0.5em 0">Questions?</Heading>
      <Heading fontSize="1.4em" color={colors.quaternary} fontWeight="normal" margin="0 0 2em 0">
        Let's break some services!
      </Heading>
      <Text color={colors.muted} fontSize="1em">Thank you for attending!</Text>
    </FlexBox>
    <Note>
      ## Q&A / Closing
      - Open floor for questions
      - If time allows, show the distributed retry code in the `solution` branch
      - Share homework: add Bulkhead, Rate Limiter, TimeLimiter
      - Share post-workshop resources
      - Thank participants!
    </Note>
  </Slide>,

];

export default slides;
