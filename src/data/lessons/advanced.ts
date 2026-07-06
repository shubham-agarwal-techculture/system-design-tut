import { lesson } from "./helpers";

export const advancedLessons = [
  lesson({
    id: "patterns-core",
    title: "Essential Design Patterns",
    moduleId: "software-patterns",
    phaseId: "design-patterns",
    durationMinutes: 40,
    summary:
      "Design patterns are reusable solutions to recurring problems in software architecture — not copy-paste recipes, but a shared vocabulary for discussing trade-offs. This lesson covers the patterns that appear most often in production systems and system design interviews: creational patterns for object lifecycle, structural patterns for composition, and behavioral patterns for communication and responsibility.",
    sections: [
      {
        title: "Why Patterns Matter in System Design",
        paragraphs: [
          "A design pattern names a problem-solution pair that experienced engineers recognize instantly. When someone says 'we used a circuit breaker here' or 'this is a classic observer setup,' the entire team understands the constraints, failure modes, and alternatives without a whiteboard session from scratch.",
          "Patterns sit at the intersection of code and architecture. Singleton and Factory appear in application code; Circuit Breaker, Bulkhead, and Saga span service boundaries. Learning patterns trains you to see structural similarities across domains — a payment retry queue and a notification dispatcher both implement variations of the same publish-subscribe and retry idioms.",
          "Patterns are not goals. Applying every pattern from the Gang of Four catalog to a simple CRUD app is over-engineering. The skill is recognizing when a recurring force — varying object creation, decoupling senders from receivers, isolating failure domains — makes a named pattern the simplest correct solution.",
          "In interviews, patterns demonstrate that you think in abstractions transferable across companies and stacks. In production, they give you proven starting points with documented pitfalls, so you spend design time on domain specifics rather than reinventing structural solutions.",
        ],
        bullets: [
          "Pattern = recurring problem + context + proven solution + consequences",
          "GoF (1994): 23 classic OOP patterns — still relevant at architectural scale",
          "Enterprise patterns (Fowler, Hohpe): messaging, integration, domain logic",
          "Cloud-native patterns: sidecar, ambassador, anti-corruption layer",
        ],
      },
      {
        title: "Creational Patterns: Controlling Object Creation",
        paragraphs: [
          "Creational patterns manage how objects are instantiated — critical when construction is expensive, configuration varies, or you need to enforce a single shared instance. Factory Method and Abstract Factory delegate creation to subclasses or factory objects, letting you swap implementations (PostgreSQL vs. DynamoDB repository) without changing callers.",
          "Builder separates construction of a complex object from its representation. You see this in fluent API clients (AWS SDK builders), SQL query builders, and HTTP request construction. It prevents telescoping constructors with twelve optional parameters and makes immutable objects practical.",
          "Singleton guarantees one instance — useful for connection pool managers, configuration registries, and metric collectors. The danger is hidden global state: singletons make testing hard, create hidden coupling, and in distributed systems, 'singleton' is a lie unless backed by leader election. Prefer dependency injection with a scoped lifetime over static singletons in modern codebases.",
          "Prototype clones existing objects instead of building from scratch — valuable when object creation requires parsing configs or deep copying is cheaper than re-fetching. Object pools (borrow/return instead of new/GC) are creational cousins common in database drivers and thread pools.",
        ],
        bullets: [
          "Factory Method: subclass decides which concrete type to instantiate",
          "Abstract Factory: families of related objects (UI toolkit, storage backend)",
          "Builder: step-by-step construction with validation at build() time",
          "Singleton: one instance — use sparingly; prefer DI container scoping",
        ],
      },
      {
        title: "Structural Patterns: Composition and Adaptation",
        paragraphs: [
          "Structural patterns organize classes and objects into larger structures while keeping them flexible and efficient. Adapter wraps an incompatible interface so legacy code works with new APIs — the classic integration pattern when you cannot rewrite the vendor SDK or third-party service.",
          "Decorator adds behavior dynamically without subclass explosion. Middleware stacks in Express, Koa, and gRPC interceptors are decorator chains: logging wraps auth wraps rate limiting wraps the handler. Each layer implements the same interface and delegates to the inner layer.",
          "Facade provides a simplified interface to a complex subsystem. An API gateway is a distributed facade: clients call one endpoint; the gateway routes to dozens of internal services. Inside a monolith, a service layer facade hides repository, cache, and messaging details from controllers.",
          "Proxy controls access to another object — lazy loading, access control, caching, or remote calls. Smart references in ORMs that lazy-load associations, caching proxies in Redis clients, and RPC stubs are all proxies. Composite treats individual objects and groups uniformly — useful for tree structures like org charts, file systems, and UI component trees.",
        ],
        bullets: [
          "Adapter: translate one interface to another (legacy integration)",
          "Decorator: stack behaviors without modifying original class",
          "Facade: single entry point hiding subsystem complexity",
          "Proxy: indirection for lazy load, cache, security, or remote access",
        ],
      },
      {
        title: "Behavioral Patterns: Communication and Responsibility",
        paragraphs: [
          "Behavioral patterns govern how objects interact and distribute responsibility. Observer defines a one-to-many dependency: when one object changes state, dependents are notified. Event buses, WebSocket push, React state updates, and domain event publishing are observer variants at different scales.",
          "Strategy encapsulates interchangeable algorithms. Payment processing (credit card vs. PayPal vs. crypto), compression codecs, and routing algorithms all use strategy so runtime configuration swaps behavior without conditional spaghetti. Dependency injection makes strategy trivial — inject the interface, not the implementation.",
          "Command encapsulates a request as an object, enabling undo, queuing, logging, and retry. Job queues (Sidekiq, SQS consumers) process command objects. CQRS command handlers are named commands with idempotent execution. Template Method defines a skeleton algorithm with overridable steps — base class handles the flow, subclasses fill in specifics.",
          "Chain of Responsibility passes a request along a handler chain until someone processes it — middleware pipelines, servlet filters, and approval workflows. State pattern lets an object alter behavior when its internal state changes — order lifecycle (pending → paid → shipped) without giant switch statements.",
        ],
        bullets: [
          "Observer: publish-subscribe within and across process boundaries",
          "Strategy: swap algorithms at runtime via interface injection",
          "Command: requests as first-class objects — queue, log, undo, retry",
          "Chain of Responsibility: middleware and filter pipelines",
        ],
      },
      {
        title: "Patterns at Architectural Scale",
        paragraphs: [
          "Many 'microservice patterns' are behavioral and structural patterns scaled to the network. Circuit Breaker (from Release It!) stops calling a failing dependency after a threshold, failing fast instead of hanging threads. Bulkhead isolates thread pools or connection pools so one slow dependency cannot exhaust all resources.",
          "Saga coordinates long-running distributed transactions through a sequence of local transactions with compensating actions — the distributed cousin of Command + undo. Outbox pattern combines Observer with transactional integrity: write events to a database table in the same transaction as business data, then a relay publishes to Kafka.",
          "Anti-Corruption Layer (from DDD) is an Adapter at bounded-context boundaries — translate external models into your domain language so legacy systems do not leak their terminology into your core model. Sidecar and Ambassador (from cloud-native patterns) attach cross-cutting concerns (logging, TLS, retries) without polluting application code.",
          "The meta-pattern: choose the pattern that minimizes the cost of the change you expect. If algorithms vary, use Strategy. If wiring varies, use Factory. If failure isolation matters, use Bulkhead and Circuit Breaker. Name your choices so the next engineer understands intent.",
        ],
      },
    ],
    concepts: [
      "Factory Method / Abstract Factory: delegate creation to swap implementations",
      "Builder: construct complex objects step-by-step with validation",
      "Singleton: single instance — global state risk in tests and distributed systems",
      "Adapter: wrap incompatible interfaces for integration",
      "Decorator: add behavior via composable wrapper chains (middleware)",
      "Observer: one-to-many notification — events, pub/sub, reactive UI",
      "Strategy: interchangeable algorithms selected at runtime",
      "Command: encapsulate requests for queue, retry, undo, audit",
      "Circuit Breaker: fail fast when a dependency is unhealthy",
      "Saga: distributed transaction via compensating local steps",
    ],
    practices: [
      "Name patterns in design docs so reviewers instantly grasp structure and trade-offs",
      "Prefer composition (Decorator, Strategy) over deep inheritance hierarchies",
      "Use Factory or DI to swap implementations — never hard-code concrete types in business logic",
      "Apply Circuit Breaker and Bulkhead on every synchronous cross-service call",
      "Replace switch-on-type with Strategy or polymorphism when behavior varies by category",
      "Use Command objects for async work — enables retry, idempotency keys, and dead letter queues",
      "Avoid Singleton for testability; inject shared instances through your DI container",
    ],
    pitfalls: [
      "Pattern obsession: adding indirection when a simple function or module suffices",
      "Singleton abuse: hidden global state, untestable code, false 'single instance' in distributed systems",
      "Wrong pattern for the force: using Observer when polling or batch processing is simpler",
      "Leaky abstraction: Decorator chains so deep that debugging requires tracing ten layers",
      "Ignoring consequences: Saga compensations are hard — not every workflow fits choreographed events",
      "Copy-paste from tutorials without adapting to domain constraints and failure modes",
    ],
    examples: [
      {
        title: "Express middleware as Decorator chain",
        description:
          "An Express app stacks middleware functions — each implements (req, res, next), adds behavior (auth check, body parsing, logging), and calls next(). The final route handler sits at the innermost layer. Adding rate limiting means inserting a new decorator without touching existing handlers.",
      },
      {
        title: "Netflix Hystrix → Resilience4j Circuit Breaker",
        description:
          "When a downstream recommendation service latency spikes, the circuit breaker opens after error/latency thresholds. Callers receive fallback responses immediately instead of blocking threads. After a cooldown, half-open probes test recovery. This is the Circuit Breaker pattern applied at service mesh scale.",
      },
      {
        title: "E-commerce order Saga",
        description:
          "PlaceOrder → ReserveInventory → ChargePayment → ShipOrder. If payment fails after inventory reservation, a compensating ReleaseInventory command runs. Each step is a local transaction; the saga coordinator (or choreographed events) ensures the workflow completes or rolls back logically — not via a single distributed lock.",
      },
    ],
    keyTakeaways: [
      "Patterns are a shared vocabulary for proven solutions to recurring design forces",
      "Creational patterns control object lifecycle; structural patterns organize composition; behavioral patterns govern interaction",
      "Middleware, event buses, and job queues are production-scale Command, Decorator, and Observer",
      "Circuit Breaker, Bulkhead, and Saga are essential architectural patterns for distributed systems",
      "Choose patterns based on expected change — not to fill a catalog checklist",
      "Every pattern has consequences; name them in design reviews so trade-offs stay visible",
      "Dependency injection makes Strategy, Factory, and test doubles natural in modern codebases",
    ],
    whyItMatters:
      "Senior engineers communicate design intent in pattern names and apply proven structures instead of reinventing fragile ad-hoc solutions. In interviews and architecture reviews, recognizing patterns — and knowing when not to use them — signals maturity and saves teams months of debugging implicit design decisions.",
    reflectionQuestions: [
      "Identify three patterns in a codebase you know. For each, what problem force does it address, and what are its consequences?",
      "When would you choose a Saga over a two-phase commit? What compensating actions would an order cancellation require?",
      "Draw the middleware chain for an HTTP request in your stack. Which layers are Decorator, which are Chain of Responsibility?",
      "Where have you seen Singleton cause testing or scaling problems? What would you use instead?",
    ],
    resources: [
      "Design Patterns: Elements of Reusable Object-Oriented Software (Gamma et al.)",
      "Patterns of Enterprise Application Architecture (Martin Fowler)",
      "Enterprise Integration Patterns (Gregor Hohpe, Bobby Woolf)",
      "Release It! — Stability patterns (Michael Nygard)",
      "microservices.io — Chris Richardson's pattern catalog",
    ],
  }),

  lesson({
    id: "internals-redis-postgres",
    title: "Redis & PostgreSQL Internals",
    moduleId: "system-internals",
    phaseId: "internal-designs",
    durationMinutes: 42,
    summary:
      "Redis and PostgreSQL sit at opposite ends of the data store spectrum — in-memory structures vs. durable relational pages — yet both appear together in nearly every production stack. Understanding their internal architectures explains why Redis is fast (single-threaded event loop, O(1) structures) and why Postgres queries behave as they do (MVCC, buffer pool, WAL, query planner).",
    sections: [
      {
        title: "Redis: In-Memory Data Structures and Single-Threaded Execution",
        paragraphs: [
          "Redis is primarily an in-memory key-value store with rich data structures: strings, lists, sets, sorted sets, hashes, streams, and more. Each type is implemented with optimized internal encodings — a small hash might use a ziplist (compact contiguous memory) and automatically upgrade to a hash table as it grows.",
          "The core Redis server process is single-threaded for command execution. One event loop (epoll/kqueue) handles thousands of client connections; commands are processed sequentially, eliminating lock contention on data structures. This design is why Redis achieves sub-millisecond latency — no mutex overhead on the hot path.",
          "Persistence is optional and configurable. RDB snapshots fork a child process (copy-on-write) to dump memory to disk periodically. AOF (Append-Only File) logs every write command and replays on restart — fsync policy (always, everysec, no) trades durability for throughput. Most production setups use both: RDB for fast restarts, AOF for minimal data loss.",
          "Eviction policies (allkeys-lru, volatile-ttl, etc.) kick in when maxmemory is reached. Redis is not a cache by default — without maxmemory and eviction, it grows until OOM. Treat explicit TTLs and memory limits as mandatory operational configuration, not optional tuning.",
        ],
        bullets: [
          "Single-threaded command execution — no locks on data structures",
          "Encodings upgrade automatically (ziplist → hashtable, intset → set)",
          "RDB: point-in-time snapshot; AOF: command replay log",
          "Streams: log-like structure with consumer groups (Kafka-lite)",
        ],
      },
      {
        title: "Redis: Replication, Cluster, and Common Pitfalls",
        paragraphs: [
          "Primary-replica replication is asynchronous by default. Replicas connect to the primary, receive a full sync (RDB transfer) or partial resync (backlog buffer), then stream incremental commands. Read-your-writes is not guaranteed on replicas — a write to primary may not appear on replica for milliseconds, causing stale reads if you route reads to replicas blindly.",
          "Redis Cluster shards data across 16,384 hash slots. Each master owns a slot range; replicas failover via gossip and majority quorum. MOVED and ASK redirects tell clients the correct node. Cluster mode adds operational complexity — multi-key transactions only work within the same hash slot (use hash tags {user:123}.profile and {user:123}.sessions).",
          "Lua scripts and MULTI/EXEC provide atomicity on a single node. There is no cross-slot distributed transaction in cluster mode. For distributed locks, Redlock is controversial — understand clock skew and fencing tokens before trusting Redis locks for financial correctness.",
          "Memory fragmentation, big keys, and hot keys are production killers. A single 100 MB hash key blocks the event loop during deletion. MONITOR and KEYS commands block production — use SCAN instead. Pipeline batches commands to amortize round-trip latency without changing atomicity semantics.",
        ],
        bullets: [
          "Async replication → possible stale reads on replicas",
          "Hash slots: 16384 slots partitioned across cluster masters",
          "Hash tags {id} force related keys to same slot for multi-key ops",
          "Pipeline: batch commands; Transaction (MULTI/EXEC): atomic batch on one node",
        ],
      },
      {
        title: "PostgreSQL: Pages, Buffer Pool, and MVCC",
        paragraphs: [
          "PostgreSQL stores data in 8 KB pages (blocks) organized in tables and indexes (B-tree default). The shared buffer pool caches hot pages in memory — identical in concept to an OS page cache but managed by Postgres. A sequential scan reads pages from buffer or disk; repeated access benefits from cache warmth.",
          "MVCC (Multi-Version Concurrency Control) lets readers never block writers and writers never block readers. Each row has xmin (inserting transaction) and xmax (deleting/updating transaction) system columns. UPDATE creates a new row version; the old version becomes dead tuple until vacuum reclaims space.",
          "Vacuum (autovacuum) is not optional housekeeping — it prevents transaction ID wraparound, reclaims dead tuple space, and updates visibility map bits for index-only scans. Bloat from long-running transactions holding old snapshots is a top Postgres performance incident: a forgotten open transaction blocks vacuum from cleaning millions of dead rows.",
          "Indexes are separate B-tree structures pointing to heap tuples. A query may index scan + heap fetch (random I/O) or bitmap index scan for moderate selectivity. Covering indexes (INCLUDE columns) enable index-only scans when visibility map confirms tuples are visible — a major optimization for read-heavy workloads.",
        ],
        bullets: [
          "8 KB pages in shared_buffers — Postgres-managed cache",
          "MVCC: row versions with xmin/xmax; UPDATE = insert new + mark old dead",
          "VACUUM reclaims dead tuples; autovacuum must keep pace with write rate",
          "B-tree index: default for equality and range; GIN/GiST for full-text, JSON, geo",
        ],
      },
      {
        title: "PostgreSQL: WAL, Checkpoints, and the Query Planner",
        paragraphs: [
          "Every change goes to the Write-Ahead Log (WAL) before data pages are flushed to disk. WAL is sequential append — fast on SSD and HDD. On crash recovery, Postgres replays WAL to bring data files to a consistent state. WAL also feeds logical replication and physical streaming replicas.",
          "Checkpoints flush dirty buffer pool pages to data files and create a recovery starting point. Too frequent checkpoints increase I/O; too infrequent checkpoints lengthen crash recovery and increase WAL size. tuning checkpoint_completion_target spreads flush I/O to avoid latency spikes.",
          "The query planner estimates cost using statistics (ANALYZE). It chooses nested loop (small inner), hash join (equi-joins, large tables), or merge join (pre-sorted inputs). Bad plans from stale statistics — a column went from uniform to skewed — cause catastrophic seq scans on billion-row tables. EXPLAIN (ANALYZE, BUFFERS) is your primary diagnostic tool.",
          "Connection model matters: Postgres uses one process per connection. Thousands of idle connections consume memory and hurt performance — use PgBouncer (transaction or session pooling) in front of the database. Long transactions hold locks and prevent vacuum — set statement_timeout and idle_in_transaction_session_timeout.",
        ],
        bullets: [
          "WAL: durability and replication source; sequential writes",
          "Checkpoints: periodic flush of dirty pages to data files",
          "Planner: cost-based; depends on pg_statistic from ANALYZE",
          "PgBouncer: pool connections — essential at high client counts",
        ],
      },
      {
        title: "Using Redis and Postgres Together",
        paragraphs: [
          "The canonical pattern: Postgres is the source of truth; Redis is cache, session store, rate limiter, or pub/sub layer. Cache-aside: read Redis first, on miss query Postgres, populate Redis with TTL. Invalidate on write (delete cache key) rather than update-in-place to avoid race conditions.",
          "Write-through and write-behind are alternatives when consistency requirements differ. Sessions and rate limits tolerate loss on Redis failure — rebuild from login or reset counters. Financial balances belong in Postgres with ACID guarantees; never rely on Redis alone for authoritative ledger state.",
          "Hot key mitigation in Redis: local in-process cache (Caffeine) in front of Redis, read replicas for read-heavy keys, or application-level sharding of a hot counter into multiple keys summed at read time. In Postgres: partition large tables, partial indexes for active subsets, and read replicas for analytics (with lag awareness).",
          "Understanding internals lets you tune intentionally: Redis maxmemory-policy and key design; Postgres shared_buffers (~25% RAM), effective_cache_size, work_mem for sorts, and index strategy matched to query patterns. Blind defaults work until scale proves otherwise.",
        ],
      },
    ],
    concepts: [
      "Redis single-threaded event loop: no lock contention, sequential command execution",
      "Redis encodings: ziplist, intset, skiplist — adaptive internal representations",
      "RDB vs AOF persistence: snapshot vs command log; fsync durability trade-offs",
      "Redis Cluster: 16384 hash slots, hash tags, MOVED redirects",
      "Postgres MVCC: row versions, xmin/xmax, readers don't block writers",
      "VACUUM / autovacuum: dead tuple reclamation, XID wraparound prevention",
      "WAL: write-ahead logging for durability and replication",
      "Query planner: cost-based joins and scans driven by ANALYZE statistics",
      "Buffer pool (shared_buffers): Postgres page cache in memory",
      "Cache-aside pattern: Postgres as source of truth, Redis as ephemeral acceleration",
    ],
    practices: [
      "Set Redis maxmemory and an eviction policy; always use TTLs on cache keys",
      "Use SCAN not KEYS; pipeline batch commands to reduce round-trip latency",
      "Route critical reads to Postgres primary when replica lag is unacceptable",
      "Monitor Postgres dead tuples, autovacuum lag, and long-running transactions",
      "Run EXPLAIN ANALYZE on slow queries; keep statistics fresh with ANALYZE after bulk loads",
      "Use PgBouncer when connection count exceeds a few hundred",
      "Invalidate cache on write (delete key) rather than update cache synchronously",
    ],
    pitfalls: [
      "Treating Redis as durable primary storage without AOF fsync=always — data loss on crash",
      "Reading from Redis replicas immediately after write to primary — stale data",
      "Big keys and hot keys blocking Redis single thread — shard or local-cache mitigations",
      "Neglecting Postgres vacuum — table bloat, XID wraparound emergencies",
      "One process per connection at 5000 app instances — connection exhaustion without pooling",
      "Missing indexes or stale stats causing seq scans on large tables under production load",
    ],
    examples: [
      {
        title: "Session store in Redis, orders in Postgres",
        description:
          "User sessions (TTL 24h, JSON blob) live in Redis for fast lookup on every request. Order placement writes to Postgres in a transaction, then deletes the user's cart cache key in Redis. Session loss on Redis restart forces re-login — acceptable. Order loss would not be — Postgres WAL ensures durability.",
      },
      {
        title: "Postgres bloat from a long transaction",
        description:
          "A BI tool opens a read transaction at 9 AM and holds it until 5 PM. Autovacuum cannot reclaim dead tuples from millions of updates that day. Table bloat grows 40%; queries slow from seq scans and heap fetches. Fix: idle_in_transaction_session_timeout + read replica for analytics queries.",
      },
      {
        title: "Cache stampede on popular product page",
        description:
          "A flash sale product key expires simultaneously across 10,000 clients. All miss cache, hammer Postgres, and repopulate Redis at once. Mitigation: probabilistic early expiration, request coalescing (single-flight lock in Redis), or pre-warming cache before sale start.",
      },
    ],
    keyTakeaways: [
      "Redis speed comes from in-memory structures and single-threaded execution — avoid blocking operations and big keys",
      "Postgres durability and concurrency rest on MVCC, WAL, and vacuum — operational discipline required",
      "Use Redis for ephemeral acceleration; Postgres for authoritative, transactional state",
      "Replication in both systems is asynchronous — design for replica lag and stale reads",
      "Postgres query performance depends on indexes, statistics, and connection pooling",
      "Cache-aside with TTL and invalidation-on-write is the safest default caching pattern",
      "EXPLAIN ANALYZE and Redis SLOWLOG are essential production diagnostics",
    ],
    whyItMatters:
      "Redis and PostgreSQL appear in almost every backend architecture interview and production stack. Knowing their internals — not just their APIs — lets you explain latency spikes, design cache strategies that do not corrupt data, tune Postgres before incidents, and make credible storage choices under load.",
    reflectionQuestions: [
      "For a read-heavy profile page (user info + recent posts), what would you cache in Redis and what stays in Postgres? What TTL and invalidation strategy?",
      "What happens in Postgres when two transactions UPDATE the same row concurrently? Walk through MVCC step by step.",
      "Your Redis latency p99 jumped from 1ms to 50ms. What internal Redis factors would you investigate?",
      "When would you choose Redis Streams over Kafka for event delivery?",
    ],
    resources: [
      "Redis documentation — memory optimization, persistence, cluster spec",
      "PostgreSQL Internals (Hans-Jürgen Schönig) or 'The Internals of PostgreSQL'",
      "Designing Data-Intensive Applications — Chapters 3, 5, 6 (Martin Kleppmann)",
      "Use The Index, Luke — SQL indexing and tuning (Markus Winand)",
      "pgMustard / explain.dalibo.com — EXPLAIN visualization",
    ],
  }),

  lesson({
    id: "internals-kafka-nginx",
    title: "Kafka & Nginx Internals",
    moduleId: "system-internals",
    phaseId: "internal-designs",
    durationMinutes: 40,
    summary:
      "Kafka and Nginx are infrastructure workhorses — one moves events at scale, the other terminates HTTP at the edge. Kafka's log-structured partitions and consumer groups enable durable, replayable event streams. Nginx's master/worker event-driven model serves millions of connections with minimal memory. Understanding both internals is essential for designing reliable pipelines and high-throughput web tiers.",
    sections: [
      {
        title: "Kafka: Distributed Commit Log Architecture",
        paragraphs: [
          "Kafka is a distributed, partitioned, replicated commit log. Producers append records to topic partitions — ordered, immutable sequences identified by offset. Unlike traditional message queues that delete messages after consumption, Kafka retains records for a configurable period (or size), allowing replay and multiple independent consumer groups.",
          "Each partition is an ordered log stored as segment files on disk (index + .log). Sequential disk writes achieve throughput comparable to memory when batching and page cache cooperate. Partitions are the unit of parallelism: more partitions mean more parallel consumers and producers, up to broker and cluster limits.",
          "Brokers are Kafka server processes. A cluster has many brokers; each partition has one leader broker handling reads/writes and zero or more follower replicas syncing data. ISR (In-Sync Replicas) is the set of followers caught up within a configurable lag. If the leader dies, a follower from ISR is elected — availability and durability depend on replication factor and acks setting.",
          "ZooKeeper (legacy) or KRaft (Kafka Raft metadata mode) manages cluster metadata: broker registration, partition leadership, consumer group offsets (offsets now stored in internal __consumer_offsets topic). KRaft removes the ZooKeeper dependency, simplifying operations in modern Kafka versions.",
        ],
        bullets: [
          "Topic → partitions → ordered, append-only log segments",
          "Offset: monotonic position within a partition",
          "Leader + followers; ISR = replicas eligible for leadership",
          "Retention by time (log.retention.hours) or size — not consume-and-delete",
        ],
      },
      {
        title: "Kafka: Producers, Consumers, and Delivery Semantics",
        paragraphs: [
          "Producers choose a partition via key hash (same key → same partition → per-key ordering) or round-robin. Batching (linger.ms, batch.size) amortizes network overhead. acks=0 fire-and-forget; acks=1 leader ack; acks=all waits for all ISR — the durability vs latency trade-off.",
          "Consumer groups distribute partitions among group members — each partition consumed by at most one consumer in the group. Rebalance occurs when members join or leave; during rebalance, consumption pauses (unless using cooperative sticky assignors). Scale consumers up to partition count; extra consumers sit idle.",
          "Delivery semantics: at-most-once (commit offset before process — may lose messages), at-least-once (process then commit — may duplicate), exactly-once (Kafka transactions + idempotent producer — higher overhead, limited to Kafka Streams / specific flows). Production systems almost always implement at-least-once with idempotent consumers.",
          "Log compaction retains the latest record per key — useful for changelog topics (KTables, config propagation). Tombstone records (null value) delete keys after delete.retention.ms. Compact + delete retention policies can coexist on different topics.",
        ],
        bullets: [
          "Partition key → consistent hashing → per-key ordering guarantee",
          "Consumer group: one consumer per partition within a group",
          "Rebalance: partition reassignment on membership change",
          "Idempotent producer: dedup via PID + sequence number per partition",
        ],
      },
      {
        title: "Nginx: Master/Worker and the Event Loop",
        paragraphs: [
          "Nginx uses a master process (reads config, manages workers, binds ports) and one or more worker processes (handle connections). Workers are single-threaded with an event-driven loop — epoll on Linux, kqueue on BSD. Thousands of idle connections cost kilobytes each (connection state), not megabytes per thread.",
          "The event loop: register socket events (readable, writable), wait via epoll_wait, dispatch handlers. Non-blocking I/O is mandatory — a blocking read in one worker stalls all connections that worker manages. Proxy upstream calls use the same non-blocking model with retry and timeout logic.",
          "Accept mutex (older versions) or SO_REUSEPORT (modern) distributes incoming connections across workers. SO_REUSEPORT lets each worker bind the same port; the kernel load-balances accepts — better CPU utilization on multi-core hosts.",
          "Static file serving uses sendfile (zero-copy from disk to socket, bypassing user-space buffer copies). gzip/brotli compression, caching headers, and open_file_cache reduce disk and CPU for repeat assets. These optimizations explain why Nginx dominates static content and reverse proxy roles.",
        ],
        bullets: [
          "Master/worker: workers are single-threaded event loops",
          "epoll/kqueue: O(1) readiness notification for many connections",
          "sendfile: zero-copy static file delivery",
          "SO_REUSEPORT: kernel-level accept load balancing across workers",
        ],
      },
      {
        title: "Nginx: Reverse Proxy, Load Balancing, and TLS",
        paragraphs: [
          "As a reverse proxy, Nginx terminates client connections and opens separate upstream connections to backend servers. proxy_pass, upstream blocks, and keepalive connections to upstreams reduce TCP handshake overhead. Health checks (commercial Plus or open-source modules) remove failed backends from rotation.",
          "Load balancing methods: round-robin (default), least_conn, ip_hash (session stickiness), hash (consistent hashing on URI or custom key). Weighted backends support heterogeneous capacity. For WebSocket and HTTP/2, proxy modules handle protocol upgrade and multiplexing.",
          "TLS termination at Nginx offloads crypto from application servers. ssl_session_cache (shared across workers) and session tickets reduce handshake cost. HTTP/2 and HTTP/3 (QUIC) modules push protocol handling to the edge. Certificate management (Let's Encrypt, cert-manager sidecars) integrates at this layer.",
          "Rate limiting (limit_req, limit_conn), WAF integration, and request buffering protect backends from abuse and slow clients. Large upload buffering to disk prevents memory exhaustion when clients send slowly — a classic slowloris mitigation combined with timeouts (client_body_timeout, proxy_read_timeout).",
        ],
        bullets: [
          "upstream keepalive: reuse backend TCP connections",
          "least_conn vs round-robin: match algorithm to workload skew",
          "TLS session cache/tickets: reduce full handshake frequency",
          "limit_req: token bucket rate limiting per IP or key",
        ],
      },
      {
        title: "Kafka and Nginx in System Architecture",
        paragraphs: [
          "A common pattern: Nginx at the edge terminates TLS, serves static assets, load-balances to API servers, and enforces rate limits. API servers publish domain events to Kafka; downstream consumers (search indexer, analytics, email) process independently with at-least-once semantics and idempotent handlers.",
          "Backpressure flows differently in each system. Nginx returns 502/503 when upstreams are saturated — clients see immediate failure or retry. Kafka absorbs write spikes in the log (disk-bound retention) but slow consumers fall behind (consumer lag metric). Monitor lag, rebalance frequency, and under-replicated partitions as Kafka SLOs.",
          "Ordering guarantees: Kafka orders within a partition, not across partitions. Design partition keys so related events co-locate (user_id, order_id). Nginx does not guarantee sticky routing unless ip_hash or consistent hash — session state belongs in Redis or JWT, not local worker memory.",
          "Operational maturity: Kafka needs capacity planning for disk (retention × throughput), partition count, and replication. Nginx needs worker count (usually = CPU cores), connection limits (worker_connections × workers), and upstream timeout tuning aligned with application p99 latency.",
        ],
      },
    ],
    concepts: [
      "Kafka partition: ordered log; unit of parallelism and per-key ordering",
      "Consumer group: cooperative partition assignment with rebalance on membership change",
      "ISR and acks=all: durability vs latency trade-off on produce",
      "At-least-once + idempotent consumer: practical delivery guarantee",
      "Nginx master/worker: single-threaded event loop per worker process",
      "epoll event-driven I/O: scale connections without thread-per-connection",
      "Reverse proxy: TLS termination, load balancing, upstream keepalive",
      "sendfile: zero-copy static file serving",
      "Consumer lag: backlog metric — primary Kafka health indicator",
      "SO_REUSEPORT: kernel distributes accepts across Nginx workers",
    ],
    practices: [
      "Size Kafka partitions for target parallelism; key by entity ID for ordering",
      "Use acks=all and min.insync.replicas=2 for durable production produces",
      "Implement idempotent consumers with dedup keys or upsert semantics",
      "Monitor consumer lag, under-replicated partitions, and broker disk usage",
      "Set Nginx worker_processes to CPU count; tune worker_connections for peak load",
      "Enable upstream keepalive and align proxy timeouts with application p99",
      "Terminate TLS at Nginx; use limit_req to protect backends from abuse",
    ],
    pitfalls: [
      "Too few Kafka partitions — cannot scale consumers beyond partition count",
      "Consumer rebalance storms from frequent pod restarts — tune session.timeout.ms and use cooperative assignor",
      "Treating Kafka as a task queue with per-message delete — wrong tool; use SQS or dedicated queue",
      "Blocking operations in Nginx Lua or misconfigured upstreams stalling worker event loops",
      "No upstream keepalive — TCP handshake overhead dominates short API calls",
      "Ignoring consumer lag until disk fills or analytics is days behind",
    ],
    examples: [
      {
        title: "Event-driven order pipeline",
        description:
          "Order API (behind Nginx) writes to Postgres and publishes OrderPlaced to Kafka partition keyed by order_id. Inventory, email, and analytics services each consume in separate consumer groups — all receive every event, process at their own pace, and commit offsets after successful handling. Nginx rate-limits checkout endpoints during flash sales.",
      },
      {
        title: "Nginx edge with microservices upstream",
        description:
          "Nginx terminates TLS, applies WAF rules, and routes /api/users to user-service, /api/orders to order-service via location blocks. Upstream keepalive pools 32 connections per backend. least_conn balances skewed request durations. Static assets served via sendfile with 1-year cache headers — 90% of bytes never hit application servers.",
      },
      {
        title: "Kafka replay for bug fix deployment",
        description:
          "A bug in the search indexer corrupted documents for 6 hours. Because Kafka retains 7 days of events, the team resets the consumer group offset to the incident start time and replays OrderPlaced events idempotently (upsert by document ID). Without log retention and idempotent writes, manual backfill would take days.",
      },
    ],
    keyTakeaways: [
      "Kafka is a replayable commit log — retention and partitions define scale and ordering",
      "Consumer groups enable parallel processing; max consumers = partition count per group",
      "At-least-once with idempotent consumers is the production default for delivery semantics",
      "Nginx scales via event-driven workers — non-blocking I/O and sendfile for efficiency",
      "Edge proxy handles TLS, load balancing, rate limiting — protect and offload backends",
      "Monitor Kafka consumer lag and Nginx upstream 5xx/latency as primary health signals",
      "Partition key design determines ordering scope — choose keys aligned with business invariants",
    ],
    whyItMatters:
      "Kafka and Nginx form the data plane and control edge of most modern backends. Interview questions about event ordering, consumer lag, and reverse proxy configuration assume you understand internals, not just configuration snippets. Production incidents in both systems trace directly to partition design, rebalance behavior, worker limits, and timeout mismatches.",
    reflectionQuestions: [
      "You need global ordering of all payment events. Can Kafka provide this? How would you redesign if not?",
      "What happens to in-flight requests when an Nginx worker receives SIGUSR1 reload? What about SIGQUIT shutdown?",
      "Design partition count and consumer group topology for 100K events/sec with 5 downstream processors.",
      "When would you bypass Nginx and expose a service directly behind a cloud load balancer?",
    ],
    resources: [
      "Kafka: The Definitive Guide (Neha Narkhede, Gwen Shapira, Todd Palino)",
      "Apache Kafka documentation — design, operations, KRaft",
      "Nginx Admin Guide — connection processing, load balancing, caching",
      "High Performance Browser Networking — Ch. 14 (Ilya Grigorik)",
      "Confluent blog — partitioning, consumer lag, exactly-once semantics",
    ],
  }),

  lesson({
    id: "framework-requirements",
    title: "Requirements & Capacity Estimation",
    moduleId: "design-framework",
    phaseId: "designer-mindset",
    durationMinutes: 40,
    summary:
      "Every system design begins before boxes and arrows: clarify requirements, define success metrics, and estimate scale. This lesson teaches a structured approach to functional vs non-functional requirements, back-of-the-envelope capacity math, and the assumptions you must state explicitly so your architecture stands up to scrutiny in interviews and design reviews.",
    sections: [
      {
        title: "Functional vs Non-Functional Requirements",
        paragraphs: [
          "Functional requirements describe what the system does: users can post tweets, search products, transfer money. Non-functional requirements (NFRs) describe how well: latency under 200ms p99, 99.99% availability, GDPR compliance, support 10M DAU. Architecture is driven as much by NFRs as by features — a chat app and a batch analytics pipeline share 'store messages' but diverge radically on latency and consistency.",
          "Explicitly categorize requirements into must-have (MVP), should-have (near-term), and could-have (future). In a 45-minute interview, scope to must-haves plus one differentiating NFR. Ask clarifying questions: Who are the users? Read vs write ratio? Geographic distribution? Durability expectations if a datacenter fails?",
          "Constraints narrow the solution space: budget, team size, existing tech stack, regulatory environment, time to market. A startup with three engineers should not design Google-scale sharding on day one. Document constraints as actively as requirements — they explain why you chose a monolith over 50 microservices.",
          "Success metrics translate NFRs into measurable targets: p50/p95/p99 latency, error rate, throughput (QPS), availability (nines), data durability (RPO/RTO), cost per request. Without numbers, 'fast' and 'scalable' are meaningless and impossible to validate after build.",
        ],
        bullets: [
          "Functional: features and behaviors",
          "Non-functional: latency, availability, consistency, durability, compliance",
          "MoSCoW prioritization: Must, Should, Could, Won't (this session)",
          "RPO/RTO: acceptable data loss and recovery time on failure",
        ],
      },
      {
        title: "Back-of-the-Envelope Estimation",
        paragraphs: [
          "Capacity estimation grounds architecture in physics and economics. Start with daily active users (DAU), actions per user per day, and peak-to-average ratio (often 2–3×, higher for events like New Year's Eve). Convert to peak QPS: if 100M DAU each post 2 times/day, writes = 200M/day ≈ 2,300 avg QPS; at 3× peak ≈ 7,000 write QPS.",
          "Know handy constants: 1 day ≈ 86,400 seconds (~100K for quick math); 1 million seconds ≈ 11.5 days; 1 GB = 10^9 bytes (or 2^30 for memory — state which). SSD random read ~100 μs; sequential ~1 GB/s; datacenter round trip ~0.5 ms same region, ~150 ms cross-continent; memory ~100 ns access.",
          "Storage estimation: average object size × objects retained × replication factor. 500 bytes per tweet × 500M tweets/day × 365 days × 3 replicas ≈ 274 TB/year before compression. Does it fit one Postgres instance? No — partition, archive, or object storage.",
          "Bandwidth: average response size × QPS. 10 KB response × 100K QPS = 1 GB/s egress — significant cost and CDN requirement. Estimation reveals bottlenecks early: a 1 KB write triggering 50 KB of fan-out read is a architectural red flag at scale.",
        ],
        bullets: [
          "Peak QPS = (DAU × actions/day × peak factor) / 86400",
          "Storage = object_size × volume × retention × replication",
          "Bandwidth = response_size × read_QPS (+ upload for writes)",
          "Memory cache: working set size — what fraction of data is hot?",
        ],
      },
      {
        title: "Capacity Planning for Compute, Storage, and Cache",
        paragraphs: [
          "Compute: a single modern server handles ~1–10K simple HTTP req/s depending on work. 100K read QPS / 5K per server ≈ 20 app servers + load balancer overhead. CPU-bound workloads (video encode, ML inference) scale differently — profile per core throughput.",
          "Database sizing: Postgres comfortable ~5–10K simple reads/s or ~1–2K writes/s on tuned hardware before sharding. Redis ~100K ops/s per node for simple commands. Disk IOPS limits random write throughput — WAL and index updates matter. Don't assume linear scale; measure knee points.",
          "Cache hit ratio dramatically reduces backend load. If 90% of reads hit CDN/Redis, 100K read QPS becomes 10K database QPS — the difference between one cluster and ten. Estimate working set: if 20% of users are active daily and each accesses 50 keys, that's DAU × 0.2 × 50 hot keys (with skew — 80/20 rule applies).",
          "State assumptions explicitly: 'assuming 100M DAU, 10:1 read/write, 500 byte records, 5 year retention, 99.9% availability.' Reviewers and future you can revisit when assumptions change. Wrong assumptions are fine; unstated ones cause production surprises.",
        ],
      },
      {
        title: "API Design and Data Model Implications",
        paragraphs: [
          "Requirements drive API shape. Read-heavy feeds favor cursor pagination and precomputed timelines. Write-heavy logs favor append-only ingestion and async processing. Search requirements imply inverted indexes (Elasticsearch) beyond primary storage.",
          "Entity relationships emerge from use cases: User posts Tweet, User follows User, Tweet has Likes. Identify access patterns before schema: 'get timeline for user' (read fan-out), 'get likes for tweet' (counter or aggregate), 'search tweets by keyword' (secondary index). Each pattern maps to storage and cache choices.",
          "Consistency requirements per operation: liking a post can be eventually consistent (count off by one briefly); bank transfer cannot. Classify operations into strong consistency, read-your-writes, or eventual — this directly determines database choice, cache invalidation, and sync vs async boundaries.",
          "Multi-tenancy, permissions, and audit requirements add columns, row-level security, or separate schemas. Compliance (HIPAA, PCI) may mandate encryption at rest, network isolation, and retention policies — non-negotiable constraints that affect every layer.",
        ],
        bullets: [
          "Access patterns first: how data is read/written drives schema and indexes",
          "Pagination: offset (small datasets) vs cursor (infinite feeds)",
          "Consistency tier per operation — not one global setting",
          "Audit trail: append-only event log vs mutable rows with history tables",
        ],
      },
      {
        title: "Documenting and Presenting Estimates",
        paragraphs: [
          "In interviews, spend 5–10 minutes on requirements and estimation before drawing architecture. Verbalize math aloud; round aggressively; sanity-check orders of magnitude. Interviewers care about structured thinking, not exact digits.",
          "A one-page capacity summary for design reviews includes: traffic (peak QPS read/write), storage (GB/TB per year), bandwidth, cache working set, and growth assumptions (2× per year?). Tie each number to a component: '7K write QPS → Kafka 20 partitions, 3 brokers; 100K read QPS → CDN + 10 Redis nodes + 5 read replicas.'",
          "Identify the first bottleneck: usually single-database writes, hot partition, or egress cost. Propose mitigation in the design: sharding key, read replicas, CDN, async pipeline. Estimation without bottleneck analysis is arithmetic, not engineering.",
          "Re-estimate after MVP launch with real metrics. Capacity planning is continuous — load tests validate assumptions; production traffic reveals skew and long-tail behavior estimates miss.",
        ],
      },
    ],
    concepts: [
      "Functional vs non-functional requirements (NFRs)",
      "Peak QPS: DAU × actions/day × peak factor / 86400",
      "Read/write ratio: drives cache, replica, and CDN strategy",
      "Working set: fraction of data actively accessed — cache sizing input",
      "RPO/RTO: recovery point/time objectives for disaster planning",
      "Availability nines: 99.9% = 8.7 hours downtime/year",
      "Replication factor: storage and write amplification multiplier",
      "Access patterns: query shapes that determine schema and indexes",
      "Consistency tiers: strong vs eventual per operation, not globally",
      "Back-of-envelope: orders-of-magnitude sanity check before detailed design",
    ],
    practices: [
      "Ask clarifying questions before designing — scope, users, read/write mix, latency targets",
      "State all assumptions explicitly; round numbers to one significant figure",
      "Compute peak QPS, storage/year, and bandwidth before drawing components",
      "Classify each operation's consistency and durability requirements",
      "Identify the first bottleneck and design mitigation for it",
      "Use MoSCoW to prevent scope creep in time-boxed design sessions",
      "Revisit estimates with load test results after implementation",
    ],
    pitfalls: [
      "Skipping requirements and jumping to microservices diagram — misses NFR-driven choices",
      "Using average QPS instead of peak — systems fail at peak",
      "Ignoring fan-out: one write triggering N reads multiplies load invisibly",
      "Forgetting replication and index overhead in storage math",
      "Treating estimation as precise — false precision hides uncertain assumptions",
      "One global consistency model — over-provisions sync where eventual suffices",
    ],
    examples: [
      {
        title: "Twitter-like timeline (interview classic)",
        description:
          "300M DAU, 200M tweet/day, 5:1 read/write for timeline fetches. Write QPS ≈ 2,300 avg, 7K peak. Timeline read: 300M DAU × 20 views/day = 6B reads/day ≈ 70K avg, 200K peak. Storage: 280 bytes/tweet × 200M/day × 365 × 3 replicas ≈ 60 TB/year. Conclusion: write path is easy; fan-out read path drives cache (Redis timelines) and CDN for media.",
      },
      {
        title: "URL shortener capacity",
        description:
          "100:1 read/write ratio, 100M new URLs/month, 10B redirects/month. Write ≈ 40/s avg; read ≈ 4,000/s avg, 12K peak. Storage: 500 bytes/URL × 1.2B URLs/year ≈ 600 GB/year — fits one DB with sharding by hash. Cache: 20% URLs get 80% traffic — Redis working set ~120M keys × 100 bytes ≈ 12 GB. Bottleneck: read QPS → Redis + CDN redirect at edge.",
      },
      {
        title: "Video upload platform",
        description:
          "1M uploads/day, average 500 MB file. Ingress bandwidth: 1M × 500 MB / 86400 ≈ 5.8 GB/s peak ~15 GB/s. Storage: 500 TB/day raw — object storage (S3), not database. Transcoding: async worker pool; 10 min video × 5 renditions = compute-bound pipeline. Requirements drive async upload → queue → workers architecture.",
      },
    ],
    keyTakeaways: [
      "Requirements and NFRs precede architecture — clarify before you draw",
      "Back-of-envelope math reveals bottlenecks at orders-of-magnitude level",
      "Peak QPS, not average, determines provisioning and failure behavior",
      "Read/write ratio and fan-out dominate caching and replication strategy",
      "State assumptions explicitly so designs can be validated and revised",
      "Consistency and durability requirements vary per operation — classify each",
      "Capacity planning is iterative — validate with load tests and production metrics",
    ],
    whyItMatters:
      "Interviewers and principal engineers expect you to anchor architecture in numbers. Systems that skip estimation over-provision expensively or under-provision catastrophically. Structured requirements and capacity math turn vague 'build a social network' prompts into defensible designs with explicit trade-offs.",
    reflectionQuestions: [
      "Estimate peak QPS and storage for a note-taking app with 10M DAU, 5 notes created/user/week, 20 reads/user/day. What is the first bottleneck?",
      "Which operations in a ride-sharing app need strong consistency vs eventual? List five and justify each.",
      "Your estimate assumed 10:1 read/write but production shows 2:1. Which architecture components are now over- or under-provisioned?",
      "How do RPO and RTO differ for a messaging app vs a payment ledger?",
    ],
    resources: [
      "Grokking the System Design Interview — estimation frameworks",
      "System Design Interview Vol 1 & 2 (Alex Xu)",
      "Google SRE Book — Ch. 26 (Capacity Planning)",
      "High Scalability blog — real-world architecture postmortems",
      "Latency numbers every programmer should know (Jeff Dean)",
    ],
  }),

  lesson({
    id: "framework-architecture",
    title: "Architecture, Failures & Trade-offs",
    moduleId: "design-framework",
    phaseId: "designer-mindset",
    durationMinutes: 38,
    summary:
      "Architecture is the art of choosing trade-offs under constraints. No design optimizes everything — you balance latency vs consistency, availability vs durability, simplicity vs flexibility. This lesson provides a framework for structuring designs, reasoning about failure modes, and articulating trade-offs clearly in reviews and interviews.",
    sections: [
      {
        title: "A Structured Approach to System Design",
        paragraphs: [
          "After requirements and estimation, proceed in layers: (1) high-level components and data flow, (2) API and data model, (3) deep dives on the hardest problems, (4) bottlenecks and scale plan, (5) failure modes and monitoring. This sequence keeps interviews organized and ensures you don't optimize details before defining scope.",
          "Start with a simple design that meets functional requirements for moderate scale — single app server, one database, cache optional. Then evolve: 'at 10× traffic, the database becomes the bottleneck → read replicas and cache; at 100×, shard by user_id.' Iterative scaling narrative shows you won't over-engineer day one but have a credible growth path.",
          "Draw data flow for critical paths: user action → API → business logic → storage → async side effects. Mark sync vs async boundaries, cache layers, and external dependencies. One diagram for happy path; annotate failure behavior on the same diagram.",
          "Identify the 2–3 core entities and their relationships. Resist designing every feature — depth on timeline generation beats breadth on 15 minor endpoints. Interviewers probe where you go deep, not how many boxes you draw.",
        ],
        bullets: [
          "Layer 1: clients, load balancer, app tier, storage, async pipeline",
          "Layer 2: API contracts, schema, indexes for access patterns",
          "Layer 3: deep dive — the hardest NFR (feed, search, consistency)",
          "Evolution narrative: what breaks at 10×, 100×, 1000×",
        ],
      },
      {
        title: "CAP, PACELC, and Consistency Models",
        paragraphs: [
          "CAP theorem: in a network partition, you choose Consistency (all nodes see same data) or Availability (every request gets a response). Partition tolerance is mandatory in distributed systems — the real choice is CP (ZooKeeper, etcd, strongly consistent DB during partition) vs AP (Cassandra, Dynamo-style, available with divergent state merged later).",
          "PACELC extends CAP: else (even without partition), you choose Latency or Consistency. Most systems are PA/EL — available during partition, low latency when network is fine, accepting eventual consistency. This matches most user-facing products where 100ms matters more than immediate global consistency.",
          "Consistency models in practice: strong (linearizable reads/writes), causal (see your own writes and related ordering), read-your-writes (session stickiness or version check), eventual (converge after delay). Pick per operation: inventory deduction strong; view count eventual; user profile read-your-writes.",
          "Don't cite CAP as excuse without specifics. Say: 'like counts use eventual consistency with periodic sync — stale by seconds is acceptable; payment status uses strong consistency via synchronous DB transaction.' Tie model to user-visible behavior.",
        ],
        bullets: [
          "CP: consistent during partition, may reject requests (etcd, Spanner)",
          "AP: available during partition, reconcile later (Cassandra, DynamoDB)",
          "PACELC: without partition, latency vs consistency trade-off",
          "Per-operation consistency — not one choice for entire system",
        ],
      },
      {
        title: "Designing for Failure",
        paragraphs: [
          "Everything fails: servers, disks, networks, deployments, humans. Design assumes failure is normal. Redundancy: N+1 or N+2 for critical tiers — multiple app instances across AZs, database with automatic failover, multi-AZ object storage. Single points of failure (one Redis node, one cron leader) must be identified and eliminated or accepted with documented risk.",
          "Timeouts everywhere: client → service, service → database, service → external API. Without timeouts, one slow dependency blocks thread pools and cascades. Retries with exponential backoff and jitter for idempotent operations — never unbounded retry storms. Circuit breakers fail fast when downstream is unhealthy.",
          "Idempotency keys for writes: client sends Idempotency-Key header; server deduplicates within TTL window. Essential for payment APIs and any at-least-once delivery (Kafka consumers, webhook retries). Without idempotency, retries double-charge or duplicate records.",
          "Graceful degradation: if recommendations fail, show popular items; if search is down, browse categories. Define fallback behavior per dependency. Bulkheads isolate thread pools so one slow dependency cannot exhaust all resources. Health checks and load balancer draining remove unhealthy instances before total collapse.",
        ],
        bullets: [
          "Failover: automatic promotion of replica (RDS, Redis Sentinel)",
          "Blast radius: limit impact of one failure (AZ isolation, cell architecture)",
          "Chaos engineering: inject failures to validate assumptions (Netflix Simian Army)",
          "Runbooks: documented response for each alert — not improvised during outage",
        ],
      },
      {
        title: "Common Architectural Trade-offs",
        paragraphs: [
          "Push vs pull for fan-out: push (write-time fan-out to follower timelines) gives fast reads but expensive writes for celebrities; pull (assemble timeline at read time) saves writes but slow reads; hybrid (push for normal users, pull for celebrities) is Twitter's approach. Trade-off: read latency vs write amplification vs implementation complexity.",
          "SQL vs NoSQL: relational for ACID, joins, complex queries; document/wide-column for horizontal scale, flexible schema, high write throughput. Polyglot persistence is normal — Postgres for transactions, Elasticsearch for search, Redis for cache, S3 for blobs.",
          "Sync vs async: sync simplifies client mental model (request → response includes result) but couples latency and availability; async (queue, webhook, polling) decouples and absorbs spikes but complicates UX (job status, notifications). Choose async when side effects are slow, optional, or fan out to many systems.",
          "Build vs buy: managed services (RDS, SQS, CloudFront) reduce ops burden and accelerate MVP; self-hosted (Kafka cluster, custom CDN) offers control and cost at scale. Trade-off: engineering time vs operational ownership vs vendor lock-in.",
        ],
        bullets: [
          "Write amplification vs read optimization — pick based on read/write ratio",
          "Normalization vs denormalization — joins vs duplicate data for read speed",
          "Strong consistency cost: coordination, latency, reduced availability during partition",
          "Operational complexity: microservices vs monolith team velocity trade-off",
        ],
      },
      {
        title: "Presenting and Defending Your Design",
        paragraphs: [
          "Lead with the core flow, then justify each major component: 'Redis cache here because 95% of reads are hot keys; 90% hit rate cuts DB load 10×.' Anticipate challenges: 'What if cache fails? DB absorbs load — we have headroom to 2×; alerts fire; degrade non-critical features.'",
          "Name trade-offs explicitly: 'We chose eventual consistency for likes because strong consistency would require distributed locking on every click, adding 50ms latency for negligible user benefit.' Unnamed trade-offs look like oversights.",
          "Scope management: when interviewer adds 'also support real-time notifications,' acknowledge, prioritize against MoSCoW, extend diagram incrementally rather than restarting. 'I'll add a WebSocket gateway and notification service fed by the existing event bus — deferring mobile push provider integration to phase 2.'",
          "Close with monitoring and success criteria: metrics, alerts, SLIs/SLOs. Architecture without observability is incomplete — you cannot operate what you cannot measure.",
        ],
      },
    ],
    concepts: [
      "Layered design: components → API/schema → deep dive → scale → failures",
      "CAP / PACELC: consistency vs availability vs latency trade-offs",
      "Idempotency: safe retries without duplicate side effects",
      "Circuit breaker, bulkhead, timeout: fault isolation patterns",
      "Graceful degradation: reduced functionality vs total outage",
      "Push vs pull fan-out: write amplification vs read latency",
      "Polyglot persistence: right storage for each access pattern",
      "Blast radius: contain failure impact via redundancy and isolation",
      "SLI/SLO: service level indicators and objectives for reliability targets",
      "Evolution narrative: credible scaling path without premature complexity",
    ],
    practices: [
      "Start simple; add complexity only when estimation or NFRs demand it",
      "Assign consistency model per operation with user-visible justification",
      "Set timeouts and retries on every external call; use circuit breakers",
      "Require idempotency keys on all non-read APIs that mutate state",
      "Identify single points of failure; eliminate or document accepted risk",
      "Name trade-offs aloud in reviews — push vs pull, sync vs async, SQL vs NoSQL",
      "Define SLIs, alerts, and runbooks alongside architecture diagrams",
    ],
    pitfalls: [
      "Analysis paralysis: endless alternatives without committing to a design",
      "Golden hammer: Kafka/microservices for every problem regardless of scale",
      "Ignoring failure modes until 'phase 2' — outages happen in phase 1",
      "Unbounded retries causing retry storms that amplify outages",
      "Strong consistency everywhere — unnecessary latency and availability cost",
      "Diagram without data flow numbers — architecture disconnected from capacity",
    ],
    examples: [
      {
        title: "Hybrid timeline fan-out (Twitter model)",
        description:
          "Normal users (< 10K followers): push tweets to follower timeline Redis lists on write — O(followers) write, O(1) read. Celebrities: pull at read time from celebrity's tweet list merged with pushed timelines. Trade-off: bounded write amplification while keeping read latency under 200ms for 99% of users.",
      },
      {
        title: "Payment service CP design",
        description:
          "During network partition, payment service rejects writes rather than risk double-spend or inconsistent balances. Strong consistency via Postgres serializable isolation + idempotency keys. Availability sacrificed for financial correctness — explicit CP choice with user-facing 'try again' messaging.",
      },
      {
        title: "Circuit breaker on third-party SMS",
        description:
          "SMS provider latency degrades from 200ms to 30s. Circuit breaker opens after 50% error rate in 10s window. Notification service queues messages locally, returns success to user ('notification pending'), drains queue when circuit half-open probes succeed. Graceful degradation — email fallback if SMS unavailable > 5 min.",
      },
    ],
    keyTakeaways: [
      "Architecture is structured trade-off decisions anchored in requirements and scale",
      "Design for failure first — timeouts, idempotency, redundancy, degradation",
      "Consistency and availability choices apply per operation, not globally",
      "Push vs pull, sync vs async, SQL vs NoSQL are context-dependent trade-offs",
      "Evolve design in layers: simple first, then credible 10×/100× scaling narrative",
      "Name trade-offs explicitly — unnamed choices look like blind spots in reviews",
      "Observability (SLIs, alerts, runbooks) is part of architecture, not an afterthought",
    ],
    whyItMatters:
      "Senior system design is less about knowing every technology and more about reasoning under constraints. Interviewers and architecture review boards test whether you anticipate failures, justify consistency choices, and articulate what you sacrificed. Frameworks for structure and trade-off vocabulary separate thoughtful designers from diagram collectors.",
    reflectionQuestions: [
      "Pick a system you use daily. Identify one AP and one CP component and explain what happens during a network partition.",
      "Design graceful degradation for an e-commerce site when the recommendation service is down. What does the user see?",
      "For a bank transfer vs a 'like' button, compare consistency requirements, failure handling, and idempotency needs.",
      "What is the blast radius if your single Redis cluster fails? How would you reduce it?",
    ],
    resources: [
      "Designing Data-Intensive Applications (Martin Kleppmann) — consistency and fault tolerance",
      "System Design Interview Vol 2 (Alex Xu) — case studies and trade-offs",
      "Google SRE Book — Ch. 3 (Embracing Risk), Ch. 28 (Handling Overload)",
      "AWS Architecture Center — Well-Architected Framework pillars",
      "Fallacies of Distributed Computing (Peter Deutsch)",
    ],
  }),

  lesson({
    id: "framework-iteration",
    title: "The Design → Build → Measure Loop",
    moduleId: "design-framework",
    phaseId: "designer-mindset",
    durationMinutes: 35,
    summary:
      "System design does not end at deployment. The best architects treat design as a continuous loop: hypothesize, build minimally, measure against SLOs, learn, and iterate. This lesson connects design frameworks to operational reality — load testing, observability, postmortems, and evolutionary architecture that adapts as requirements and traffic change.",
    sections: [
      {
        title: "From Design Doc to MVP",
        paragraphs: [
          "A design document captures intent: requirements, architecture diagram, data model, failure modes, and open questions. It is a proposal, not a contract. The MVP implements must-have functional requirements at modest scale with explicit non-goals — 'no multi-region, no full-text search, single AZ database with nightly backups.'",
          "Build the simplest architecture that validates the core hypothesis: do users want this feature? Can we meet latency targets at 1K QPS? Premature optimization wastes weeks; missing critical path design (wrong data model, unshardable schema) wastes months. Focus MVP engineering on reversible decisions and hard-to-change foundations (data model, API contracts).",
          "Feature flags decouple deployment from release — ship code dark, enable for 1% of users, measure, expand. Strangler patterns apply within monoliths: new code path behind flag, old path default, migrate traffic incrementally. Design docs should specify flag strategy and rollback plan for risky changes.",
          "Define 'done' for MVP with measurable criteria: p99 < 300ms at 500 QPS load test, error rate < 0.1%, core user journey E2E tests pass. Without exit criteria, MVP scope creeps indefinitely.",
        ],
        bullets: [
          "Design doc: requirements, diagram, schema, risks, open questions",
          "MVP: must-haves only; explicit non-goals documented",
          "Reversible vs irreversible decisions — invest design time accordingly",
          "Feature flags: deploy != release; enable gradual rollout",
        ],
      },
      {
        title: "Measuring What Matters: SLIs, SLOs, and Error Budgets",
        paragraphs: [
          "SLI (Service Level Indicator) is a measured metric: request latency, availability, throughput, correctness. SLO (Service Level Objective) is a target: 99.9% of requests complete in < 200ms over 30 days. SLAs are contractual SLOs with penalties — internal teams use SLOs without legal binding.",
          "Error budget = 100% - SLO. At 99.9% availability, you have 0.1% budget (~43 minutes downtime/month). Budget exhausted → freeze features, focus on reliability. Budget healthy → take more deployment risk. This framework aligns product velocity with reliability mathematically.",
          "Choose SLIs users feel: availability (successful responses / total), latency (p99 of server-side duration), freshness (age of data in async pipeline). Avoid vanity metrics (CPU average) as primary SLOs — correlate to user experience.",
          "Instrument from day one: structured logs, metrics (Prometheus/Datadog), distributed tracing (OpenTelemetry). Design docs should list golden signals (latency, traffic, errors, saturation) per component before build starts — retrofitting observability is expensive.",
        ],
        bullets: [
          "Four golden signals: latency, traffic, errors, saturation (Google SRE)",
          "SLO: target over rolling window (30 days common)",
          "Error budget: remaining allowable unreliability before SLO breach",
          "RED method: Rate, Errors, Duration for request-driven services",
        ],
      },
      {
        title: "Load Testing and Validation",
        paragraphs: [
          "Load tests validate capacity assumptions before users do. Types: smoke (minimal, CI), load (expected peak), stress (beyond peak to find breaking point), soak (sustained hours — memory leaks, connection exhaustion), spike (sudden 10× burst). Match test profile to estimated traffic shape.",
          "Test in production-like environment — staging with 10% of prod data size often lies about query plans and cache behavior. Use anonymized production data snapshots or synthetic generators that reproduce skew (hot keys, celebrity users).",
          "Measure during tests: p50/p95/p99 latency, error rate, resource saturation (CPU, memory, disk IOPS, connection pool usage, Kafka lag). Compare against design doc estimates. Gap analysis drives next iteration: 'estimated 10K QPS; stress test knee at 4K — database write lock contention.'",
          "Chaos and fault injection in staging: kill a replica, inject latency to dependencies, partition network. Validate failover, circuit breakers, and degradation paths designed on paper actually work. A design untested under failure is hope, not engineering.",
        ],
        bullets: [
          "k6, Locust, Gatling — programmatic load test scripts in CI",
          "Production traffic shadowing/mirroring — test new path with real traffic safely",
          "Gradual rollout: canary 1% → 10% → 50% → 100% with automated rollback",
          "Load test failure is success — you found the bottleneck before users did",
        ],
      },
      {
        title: "Learning from Production: Postmortems and Iteration",
        paragraphs: [
          "Blameless postmortems document incidents: timeline, root cause, contributing factors, action items. Focus on systems and processes, not individuals. 'Database failover took 15 minutes because runbook was stale' → action: automate failover + quarterly drill.",
          "Postmortem action items feed the design loop: add cache layer, increase timeout, fix idempotency bug, shard hot table. Architecture evolves from production pain — the best designs are revised, not born perfect.",
          "Continuous profiling (CPU, memory, lock contention) in production finds regressions invisible in averages. A deployment that adds 5ms p99 doesn't trip error alerts but erodes SLO over weeks. Compare canary metrics to baseline automatically during rollout.",
          "Capacity review cadence: quarterly re-run estimation with growth metrics. Traffic 3× in six months? Revisit shard plan before emergency. Technical debt register tracks shortcuts taken in MVP with remediation triggers ('shard when write QPS > 5K').",
        ],
        bullets: [
          "Blameless culture: fix systems, not punish people",
          "Five whys: dig from symptom to root cause",
          "Action items: specific, owned, dated — tracked to completion",
          "Game days: scheduled disaster recovery exercises",
        ],
      },
      {
        title: "Evolutionary Architecture and Knowing When to Redesign",
        paragraphs: [
          "Evolutionary architecture supports guided change: fitness functions (automated architecture tests) enforce rules ('domain layer cannot import infrastructure'). Modular monoliths evolve into services when metrics justify — not on a calendar.",
          "Recognize redesign triggers: sustained SLO breach despite optimization, org structure outgrows architecture (Conway's Law), fundamental schema change needed, cost curve nonlinear. Incremental refactor (Strangler Fig) beats rewrite unless technical debt is existential.",
          "Document architecture decision records (ADRs): context, decision, consequences, status. Future teams understand why Kafka was chosen over RabbitMQ in 2024 and when to revisit. Design loop includes revisiting ADRs when assumptions change.",
          "The meta-skill: hold design lightly. Measure ruthlessly. Iterate quickly. Systems that survive are not the most elegant initial design — they are the ones whose teams learned fastest from reality.",
        ],
      },
    ],
    concepts: [
      "Design doc → MVP → measure → iterate — continuous loop",
      "SLI/SLO/error budget: reliability targets tied to product velocity",
      "Golden signals: latency, traffic, errors, saturation",
      "Load testing types: smoke, load, stress, soak, spike",
      "Canary deployment: gradual rollout with automated rollback",
      "Blameless postmortem: learn from incidents without finger-pointing",
      "Feature flags: decouple deployment from user-visible release",
      "Fitness functions: automated checks enforcing architectural constraints",
      "ADR (Architecture Decision Record): document decisions and revisit triggers",
      "Strangler Fig: incremental migration over big-bang rewrite",
    ],
    practices: [
      "Write a one-page design doc with explicit MVP non-goals before coding",
      "Define SLIs and SLOs for core user journeys before launch",
      "Run load tests at estimated peak before major releases",
      "Use canary rollouts with automatic rollback on SLO regression",
      "Conduct blameless postmortems within 48 hours of significant incidents",
      "Re-estimate capacity quarterly using production growth metrics",
      "Maintain ADRs for significant technology and architecture choices",
    ],
    pitfalls: [
      "Design doc as shelf-ware — no validation against production metrics",
      "Vanity metrics (CPU, request count) without latency and error SLOs",
      "Skipping load tests — discovering limits during Black Friday",
      "Blame culture — hides root causes; incidents repeat",
      "Big-bang rewrite instead of incremental Strangler migration",
      "Observability as phase 2 — flying blind during critical early iterations",
    ],
    examples: [
      {
        title: "MVP → scale iteration for a startup API",
        description:
          "MVP: monolith + Postgres, SLO 99.5% / 500ms p99. Month 3: p99 degrades to 800ms at 2K QPS — load test reproduces; add Redis cache for hot reads, p99 back to 200ms. Month 9: write QPS nears 3K — add read replica, async job queue for emails. Month 18: shard users table by user_id. Each step triggered by SLO breach or capacity review, not premature planning.",
      },
      {
        title: "Error budget freeze before holiday season",
        description:
          "E-commerce platform has 99.95% availability SLO. October error budget at 15% remaining before Black Friday freeze. Team defers risky database migration to January, focuses on load test remediation and runbook drills. December traffic 5× — SLO met. Budget framework prevented a risky change during critical window.",
      },
      {
        title: "Postmortem-driven architecture change",
        description:
          "Outage: payment webhook consumer fell behind, 4-hour delay in order confirmations. Root cause: single-threaded consumer, no dead letter queue, poison message blocked partition. Actions: horizontal consumer scaling, DLQ, idempotency keys, alert on consumer lag > 1 min. Design loop turned incident into durable architecture improvement.",
      },
    ],
    keyTakeaways: [
      "System design is a continuous loop — MVP, measure, learn, iterate",
      "SLIs, SLOs, and error budgets connect reliability to engineering priorities",
      "Load and chaos testing validate design assumptions before users pay the price",
      "Blameless postmortems convert incidents into architecture improvements",
      "Feature flags and canaries enable safe iteration in production",
      "Revisit capacity estimates and ADRs as traffic and org structure evolve",
      "The best architecture emerges from measured iteration, not upfront perfection",
    ],
    whyItMatters:
      "Interview designs are static; production systems are living. Engineers who close the design-build-measure loop ship reliable systems and learn faster than teams that treat architecture as a one-time diagram. This mindset distinguishes staff-level ownership from feature-level implementation.",
    reflectionQuestions: [
      "What SLIs and SLOs would you define for a food delivery app's order tracking feature?",
      "Your load test shows p99 latency acceptable but p99.9 terrible. Is the system ready to launch? Why or why not?",
      "Describe a postmortem action item that would change architecture, not just fix a bug.",
      "When would you trigger a full redesign vs incremental Strangler migration?",
    ],
    resources: [
      "Google SRE Book — Ch. 4 (SLOs), Ch. 15 (Postmortem Culture)",
      "Accelerate (Forsgren, Humble, Kim) — DORA metrics and iteration",
      "Building Evolutionary Architectures (Ford, Parsons, Kua)",
      "Architecture Decision Records (adr.github.io)",
      "The Phoenix Project — DevOps learning loop narrative",
    ],
  }),
];
