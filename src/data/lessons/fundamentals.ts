import { lesson } from "./helpers";

export const fundamentalsLessons = [
  lesson({
    id: "scale-vertical-horizontal",
    moduleId: "scalability",
    phaseId: "fundamentals",
    title: "Vertical vs Horizontal Scaling",
    durationMinutes: 35,
    summary:
      "Scaling is how systems handle growth in traffic, data, and complexity. Vertical scaling adds power to a single machine; horizontal scaling adds more machines. Production architectures almost always combine both, but horizontal scaling — with stateless services and load balancing — is the path to massive, fault-tolerant scale.",
    sections: [
      {
        title: "What Scaling Means in Practice",
        paragraphs: [
          "When users, requests, or data volume grow, every component in your stack faces pressure: CPU, memory, disk I/O, network bandwidth, and connection limits. Scaling is the set of strategies you use to increase capacity without rewriting the entire system.",
          "The two fundamental approaches are vertical scaling (scale up) and horizontal scaling (scale out). Vertical scaling means upgrading the hardware or instance size of a single node — more cores, more RAM, faster SSDs. Horizontal scaling means running multiple copies of a service behind a load balancer and distributing work across them.",
          "Early-stage products often scale vertically because it requires no architectural changes: you resize the database instance or upgrade the app server. But vertical scaling has hard ceilings — single-machine limits, diminishing returns on cost, and a single point of failure. Horizontal scaling removes those ceilings but demands that your application, data layer, and deployment pipeline support distribution from the start or through deliberate refactoring.",
        ],
      },
      {
        title: "Vertical Scaling: Strengths and Limits",
        paragraphs: [
          "Vertical scaling is operationally simple. You change an instance type, restart services, and capacity increases. Databases especially benefit early on: a larger PostgreSQL instance with more RAM holds more of the working set in memory, reducing disk reads dramatically.",
          "The limits appear quickly at scale. Cloud providers cap instance sizes; beyond a certain point, doubling RAM costs more than doubling throughput. A single large database cannot survive zone failures without replication. Memory-bound workloads may not fit on any commercially available machine.",
          "Vertical scaling also creates upgrade windows: migrating from db.r5.2xlarge to db.r5.4xlarge often requires downtime or complex failover. Teams that rely exclusively on vertical scaling eventually hit a wall where the only option is a painful horizontal split — sharding, read replicas, or service extraction.",
        ],
        bullets: [
          "Best for: early growth, stateful monoliths, workloads that resist distribution",
          "Watch for: cost curves that outpace revenue, single points of failure, upgrade downtime",
        ],
      },
      {
        title: "Horizontal Scaling: Architecture Requirements",
        paragraphs: [
          "Horizontal scaling distributes load across N identical nodes. A load balancer — L4 (TCP) or L7 (HTTP) — routes incoming requests using algorithms like round-robin, least connections, or consistent hashing. Health checks remove unhealthy nodes automatically.",
          "For horizontal scaling to work, application servers must be stateless or share state through external stores. Session data in local memory breaks horizontal scale: killing one node loses sessions for users pinned to it. Externalize sessions to Redis, use JWTs, or accept sticky sessions with their trade-offs.",
          "Data layers scale horizontally through read replicas (scale reads), sharding (partition writes across nodes), or purpose-built distributed databases (Cassandra, DynamoDB). Each approach introduces consistency, query, and operational complexity that vertical scaling avoided.",
        ],
      },
      {
        title: "Auto-Scaling and Elastic Capacity",
        paragraphs: [
          "Modern cloud platforms offer auto-scaling groups that add or remove instances based on metrics — CPU utilization, request rate, queue depth, or custom CloudWatch/Prometheus signals. Elastic capacity matches cost to demand: fewer servers at 3 AM, more during peak events.",
          "Auto-scaling requires warm-up time. New instances must pass health checks, load application code, and establish connection pools before accepting traffic. Scale-out policies should trigger before saturation; scale-in policies should be conservative to avoid flapping during variable load.",
          "Design for scale-to-zero only when cold-start latency is acceptable (serverless functions). For latency-sensitive APIs, maintain a minimum fleet size and use predictive scaling for known traffic patterns like product launches or Black Friday.",
        ],
      },
      {
        title: "Choosing the Right Strategy",
        paragraphs: [
          "Start vertical when the team is small and traffic is predictable. Plan horizontal paths before you need them: stateless services, connection pooling, database read replicas, and clear service boundaries make future scale-out feasible.",
          "Use vertical scaling for components that are inherently hard to distribute — single-leader databases, legacy monoliths, or licensed software with per-core pricing. Use horizontal scaling for stateless APIs, worker pools, CDN edges, and stream processors.",
          "The best production systems combine both: vertically sized database primaries with horizontally scaled read replicas; horizontally scaled API tiers on moderately sized instances rather than one giant machine or hundreds of tiny ones.",
        ],
      },
    ],
    concepts: [
      "Vertical scaling (scale up): increase CPU, RAM, or disk on a single node",
      "Horizontal scaling (scale out): add nodes and distribute load",
      "Load balancers: L4 vs L7, health checks, routing algorithms",
      "Stateless services scale horizontally without session affinity",
      "Read replicas scale read-heavy workloads; sharding scales writes",
      "Auto-scaling groups: metric-driven elastic capacity",
      "Shared-nothing architecture: nodes do not share local memory or disk",
      "Diminishing returns and cost cliffs on large single instances",
      "Consistent hashing for cache and data partition stability",
    ],
    practices: [
      "Externalize session and application state before scaling web tiers horizontally",
      "Set up health checks and graceful shutdown so load balancers drain connections safely",
      "Define auto-scaling policies with cooldown periods to prevent thrashing",
      "Right-size instances: avoid both undersized nodes (constant CPU pressure) and oversized waste",
      "Load test before launch to find the first bottleneck — database, API, or network",
      "Use read replicas for read-heavy paths; monitor replication lag",
      "Document which components scale vertically vs horizontally in your architecture",
    ],
    pitfalls: [
      "Scaling the app tier while the database remains a single small instance — the DB becomes the bottleneck",
      "Assuming sticky sessions eliminate the need for shared session storage during node failures",
      "Aggressive scale-in that terminates nodes still processing long-running requests",
      "Ignoring connection pool limits — 100 new API instances can overwhelm a database with connections",
      "Vertical-only scaling until a mandatory rewrite is the only option",
      "Auto-scaling on CPU alone while the real constraint is memory, disk I/O, or downstream latency",
    ],
    examples: [
      {
        title: "E-commerce checkout API",
        description:
          "An checkout service runs as 20 stateless containers behind an ALB. Session carts live in Redis; orders write to a PostgreSQL primary with two read replicas for order history. During flash sales, auto-scaling adds API containers from 20 to 80 based on request count, while the database scales vertically once before adding read replicas.",
      },
      {
        title: "Video transcoding pipeline",
        description:
          "Transcoding is embarrassingly parallel: each video chunk is independent. A job queue (SQS) feeds a horizontally scaled worker fleet. Workers scale from 5 to 500 based on queue depth. No vertical scaling needed — each worker is a modest CPU-optimized instance.",
      },
      {
        title: "Legacy monolith migration path",
        description:
          "A Rails monolith on a single 32 GB server hits memory limits. Phase 1: vertical upgrade to 64 GB. Phase 2: extract file uploads to S3 and sessions to Redis. Phase 3: run 4 stateless app servers behind Nginx. Phase 4: introduce read replicas for reporting queries.",
      },
    ],
    keyTakeaways: [
      "Vertical scaling is simpler but bounded; horizontal scaling is the path to massive scale",
      "Stateless application tiers scale horizontally; state must live in external stores",
      "Load balancers and health checks are prerequisites for horizontal scale",
      "Auto-scaling aligns cost with demand but requires careful policy tuning",
      "Combine vertical and horizontal strategies per component — one size does not fit all",
      "Identify bottlenecks with load tests before scaling the wrong layer",
      "Plan horizontal paths early even if you scale vertically today",
    ],
    whyItMatters:
      "The scaling model you choose shapes every other architectural decision — database design, session handling, deployment strategy, and cost structure. Teams that defer horizontal readiness pay with emergency rewrites under traffic spikes. Interviewers and production incidents both start with: where is the bottleneck, and can this component scale out?",
    reflectionQuestions: [
      "Why can't you vertically scale a database forever, even with unlimited budget?",
      "What state must you externalize before horizontally scaling a web application?",
      "When would consistent hashing be preferable to round-robin at the load balancer?",
      "How would you scale a service that maintains a large in-memory cache of user permissions?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapter 1 (Scalability)",
      "AWS Well-Architected Framework — Performance Efficiency pillar",
      "Google SRE Book — Handling Overload",
      "Martin Fowler — Microservices and the First Law of Distributed Objects",
    ],
  }),

  lesson({
    id: "scale-state-management",
    moduleId: "scalability",
    phaseId: "fundamentals",
    title: "Stateless Services & State Management",
    durationMinutes: 38,
    summary:
      "Stateless services can be added, removed, and replaced freely — they are the foundation of elastic, fault-tolerant systems. State must be deliberately placed in databases, caches, message queues, or object stores. Misplaced state is the most common reason scaling efforts fail.",
    sections: [
      {
        title: "Stateless vs Stateful Services",
        paragraphs: [
          "A stateless service treats every request independently. It does not rely on data stored in local memory from a previous request on the same machine. Any instance can handle any request. This property enables horizontal scaling, rolling deployments, and instant recovery from node failure.",
          "A stateful service remembers context across requests or over time — in-memory session stores, local file caches, embedded databases, or workflow state tied to a specific process. Stateful services require sticky routing, replication, or leader election to scale and survive failures.",
          "Most production architectures push toward stateless application tiers while concentrating state in specialized, managed stores. The application becomes a thin orchestration layer: validate input, read/write state externally, return a response.",
        ],
      },
      {
        title: "Where State Should Live",
        paragraphs: [
          "User sessions belong in a distributed cache (Redis, Memcached) or a database — not in JVM heap or Node.js process memory. Redis offers TTL-based expiry, atomic operations, and sub-millisecond latency, making it the default session store for scaled web apps.",
          "Long-lived domain data lives in the primary database with ACID guarantees. Caches hold derived or hot data with explicit invalidation policies. Workflow and job state goes to durable queues or workflow engines (Temporal, Step Functions). Uploaded files go to object storage (S3), not local disk.",
          "Configuration and secrets belong in environment variables, config services, or secrets managers — injected at startup, not baked into images. Feature flags live in dedicated flag services so behavior can change without redeployment.",
        ],
        bullets: [
          "Session state → Redis / DynamoDB with TTL",
          "Domain data → PostgreSQL / MySQL / distributed DB",
          "Ephemeral hot data → in-memory cache with eviction policy",
          "Async work state → message queues or workflow engines",
        ],
      },
      {
        title: "Sticky Sessions and Their Trade-offs",
        paragraphs: [
          "Sticky sessions (session affinity) route a user to the same server using cookies or load balancer rules. They allow in-memory session storage without immediate externalization — a tempting shortcut during early development.",
          "The downsides are significant. Uneven load distribution occurs when some users are heavier than others. Node failure drops all sessions pinned to that node unless sessions are replicated (which reintroduces complexity). Rolling deployments require draining sticky connections carefully.",
          "Sticky sessions are acceptable for WebSocket connections where connection state is inherently tied to a node — but even then, teams use pub/sub backplanes (Redis) to broadcast messages across a cluster. For HTTP APIs, prefer external session stores over stickiness.",
        ],
      },
      {
        title: "Shared-Nothing Architecture",
        paragraphs: [
          "Shared-nothing means each node is self-sufficient: own CPU, memory, and local disk, with no shared memory or filesystem between application servers. Nodes communicate only through the network via databases, caches, and queues.",
          "This model maximizes fault isolation. One node's crash does not corrupt another's memory. Scaling is linear: add nodes, update load balancer, done. Google's Bigtable, Cassandra, and most microservice deployments follow shared-nothing principles.",
          "The trade-off is network round-trips for every state access. Poorly designed systems chatter excessively with Redis and the database. Connection pooling, batching, and local caching (with short TTLs) mitigate latency while preserving statelessness at the service level.",
        ],
      },
    ],
    concepts: [
      "Stateless service: no request depends on local memory from prior requests",
      "Stateful service: context persisted in process memory or local storage",
      "Session externalization: Redis, DynamoDB, or DB-backed sessions",
      "Sticky sessions (session affinity): load balancer pins users to one node",
      "Shared-nothing architecture: independent nodes, network-only communication",
      "Connection pooling: reuse DB/cache connections across requests",
      "Idempotent handlers: safe retries when state updates may duplicate",
      "CAP theorem preview: partition tolerance is mandatory in distributed deployments",
      "Twelve-factor app: treat processes as disposable, store state in backing services",
    ],
    practices: [
      "Store sessions in Redis with TTL matching your security policy",
      "Design APIs to be idempotent so retries after failures do not corrupt state",
      "Use health checks that verify connectivity to state stores, not just HTTP 200",
      "Avoid local filesystem for anything that must survive pod restarts",
      "Implement graceful shutdown: finish in-flight requests before SIGTERM timeout",
      "Partition state by domain — do not put everything in one Redis cluster",
      "Test failover by killing random nodes during load tests",
    ],
    pitfalls: [
      "In-memory sessions that work in development but break in multi-instance production",
      "Using sticky sessions as a permanent substitute for external session storage",
      "Storing uploaded files on local disk in containerized environments",
      "Global mutable static variables shared across requests in application code",
      "Assuming serverless functions maintain state between invocations",
      "Oversized session payloads that saturate Redis memory",
    ],
    examples: [
      {
        title: "JWT vs server-side sessions",
        description:
          "A mobile API uses signed JWTs for authentication — no server-side session store needed, enabling fully stateless API gateways. A web app with instant logout requirements uses Redis sessions instead, because JWTs cannot be revoked without a blocklist (which reintroduces state).",
      },
      {
        title: "Shopping cart during peak traffic",
        description:
          "Cart state lives in Redis keyed by user ID with a 7-day TTL. API servers are interchangeable. During a node failure, users retry and hit a different server — cart data is intact. Checkout transitions cart to an order in PostgreSQL atomically.",
      },
    ],
    keyTakeaways: [
      "Stateless application tiers are prerequisite for elastic horizontal scaling",
      "Every piece of state needs an explicit, durable home — never accidental local memory",
      "Sticky sessions are a bridge, not a destination; externalize sessions for resilience",
      "Shared-nothing architecture isolates failures and simplifies scaling",
      "Choose JWT for stateless auth; server-side sessions when revocation matters",
      "Kill nodes in testing to verify your state management actually works",
    ],
    whyItMatters:
      "Hidden state in application servers is the silent killer of scalability. Teams discover it during the first production scale-out or the first unplanned node restart. Getting state placement right early avoids expensive re-architecture and prevents session-loss incidents that erode user trust.",
    reflectionQuestions: [
      "Where should user session data live in a horizontally scaled application?",
      "What breaks if you terminate a server holding in-memory session state?",
      "When would you accept sticky sessions instead of externalizing state?",
      "How does idempotency interact with state management during retries?",
    ],
    resources: [
      "The Twelve-Factor App — Processes and Backing Services",
      "Designing Data-Intensive Applications — Chapter 7 (Transactions)",
      "Redis documentation — Session management patterns",
      "AWS Architecture Blog — Scaling session management",
    ],
  }),

  lesson({
    id: "storage-types",
    moduleId: "storage",
    phaseId: "fundamentals",
    title: "SQL, NoSQL & Specialized Storage",
    durationMinutes: 42,
    summary:
      "Different data shapes, access patterns, and consistency requirements demand different storage engines. Modern systems use polyglot persistence — SQL for transactional records, document stores for flexible schemas, key-value for speed, column-family for write-heavy workloads, time-series for metrics, and object storage for blobs.",
    sections: [
      {
        title: "Relational Databases (SQL)",
        paragraphs: [
          "Relational databases (PostgreSQL, MySQL, SQL Server) store data in tables with defined schemas, relationships, and constraints. SQL provides a powerful query language for joins, aggregations, filtering, and transactions spanning multiple rows.",
          "ACID transactions make relational databases the default for financial records, inventory, user accounts, and any domain where consistency and integrity are non-negotiable. PostgreSQL in particular offers JSON columns, full-text search, and extensions that blur the line with document stores.",
          "Scaling relational databases vertically is straightforward; horizontal scaling requires read replicas, partitioning, or sharding — each adding operational complexity. Schema migrations must be planned carefully in large teams.",
        ],
      },
      {
        title: "Document and Key-Value Stores",
        paragraphs: [
          "Document databases (MongoDB, Couchbase) store JSON-like documents with flexible schemas. They excel when entities are self-contained, schema evolves frequently, or nested structures avoid expensive joins. Indexing on nested fields requires thoughtful design.",
          "Key-value stores (Redis, DynamoDB, etcd) optimize for simple get/put/delete by key with predictable latency. Redis adds rich data structures (sorted sets, hashes) and optional persistence. DynamoDB offers managed, partition-key-driven scale with configurable consistency.",
          "Choose document stores when your access pattern is 'fetch entity by ID with all related fields.' Choose key-value when access is strictly by key and you need extreme speed or horizontal scale without joins.",
        ],
      },
      {
        title: "Column-Family and Wide-Column Stores",
        paragraphs: [
          "Column-family databases (Cassandra, HBase, ScyllaDB) organize data by partition key into wide rows with many columns. They optimize for high write throughput, geographic distribution, and time-ordered data within a partition.",
          "Cassandra's tunable consistency and peer-to-peer architecture suit write-heavy workloads: IoT telemetry, activity feeds, messaging metadata. Queries must be designed around partition keys — ad-hoc analytics require separate pipelines.",
          "These stores trade flexible querying for write scalability and availability. They are poor fits for workloads needing multi-row transactions or arbitrary ad-hoc joins.",
        ],
      },
      {
        title: "Time-Series and Object Storage",
        paragraphs: [
          "Time-series databases (InfluxDB, TimescaleDB, QuestDB) optimize for timestamped metrics: compression, downsampling, retention policies, and time-range queries. They power observability stacks, IoT analytics, and financial tick data.",
          "Object storage (Amazon S3, Google Cloud Storage, Azure Blob) stores unstructured blobs — images, videos, backups, data lake files. It offers durability (11 nines for S3), low cost per GB, and eventual consistency for overwrites. It is not a database: listing, querying, and small-object latency are weak points.",
          "Use time-series DBs for metrics and monitoring data that grows unbounded. Use object storage as the durable, cheap layer for anything that does not need millisecond random access.",
        ],
      },
      {
        title: "Polyglot Persistence in Practice",
        paragraphs: [
          "Real systems rarely use one database. An e-commerce platform might use PostgreSQL for orders and users, Redis for carts and rate limiting, Elasticsearch for product search, S3 for product images, and ClickHouse for analytics.",
          "Each store syncs through application code or change-data-capture (CDC) pipelines. The challenge is keeping derived views consistent and handling failures during multi-store writes. Saga patterns and outbox tables help coordinate without distributed transactions across heterogeneous stores.",
          "Choose storage based on access patterns, consistency needs, query flexibility, operational expertise, and cost — not hype. The best database is the one your team can operate reliably.",
        ],
      },
    ],
    concepts: [
      "ACID transactions: Atomicity, Consistency, Isolation, Durability",
      "SQL relational model: tables, joins, foreign keys, indexes",
      "Document store: flexible schema, nested JSON documents",
      "Key-value store: O(1) lookup by key, partition-key design",
      "Column-family: partition key + clustering columns, write-optimized",
      "Time-series: compression, retention, downsampling, range queries",
      "Object storage: durable blobs, high latency for small objects",
      "Polyglot persistence: multiple specialized stores in one system",
      "CAP/PACELC trade-offs vary by storage engine",
      "Change-data-capture (CDC) for syncing between stores",
    ],
    practices: [
      "Model access patterns first, then choose the storage engine",
      "Use PostgreSQL until proven otherwise — it handles most workloads well",
      "Design DynamoDB/Cassandra partition keys to avoid hot partitions",
      "Store files and large blobs in object storage, not database BLOB columns",
      "Define retention and archival policies for time-series and log data",
      "Use read replicas or materialized views for analytics without overloading primary DB",
      "Document which store is source of truth for each entity type",
    ],
    pitfalls: [
      "Choosing MongoDB for relational data requiring complex joins and transactions",
      "Storing multi-GB videos in PostgreSQL instead of S3",
      "Hot partition keys in DynamoDB causing throttling on a single shard",
      "Running analytics queries on the production OLTP primary",
      "Assuming eventual consistency is acceptable without defining convergence time",
      "Operating five databases when the team can reliably run one",
    ],
    examples: [
      {
        title: "Social media post storage",
        description:
          "Posts and user profiles live in Cassandra partitioned by user_id for fast timeline writes. Media files upload to S3. Search indexes sync to Elasticsearch via CDC. Follower counts are cached in Redis with periodic reconciliation from Cassandra.",
      },
      {
        title: "SaaS billing platform",
        description:
          "PostgreSQL holds subscriptions, invoices, and payment records with strict ACID. Stripe webhooks write to an outbox table; a worker publishes events to Kafka. Usage metrics land in TimescaleDB for billing aggregation and dashboards.",
      },
    ],
    keyTakeaways: [
      "Match storage to access patterns — there is no universal best database",
      "SQL remains the default for transactional, relational data",
      "NoSQL stores trade query flexibility for scale and schema flexibility",
      "Object storage is for blobs; time-series DBs are for metrics",
      "Polyglot persistence is normal — coordinate with CDC, sagas, and clear ownership",
      "Operational capability matters as much as theoretical performance",
    ],
    whyItMatters:
      "Storage choice is one of the hardest decisions to reverse. Wrong choices cause performance cliffs, data inconsistency, and runaway costs. Interviewers expect you to justify storage per component, and production systems fail when teams treat all data as rows in one MySQL instance.",
    reflectionQuestions: [
      "When would you choose a document store over SQL for a product catalog?",
      "Why store images in S3 instead of a database?",
      "What access pattern would lead you to Cassandra over PostgreSQL?",
      "How do you keep search indexes consistent with the primary database?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapters 2-3 (Data Models, Storage Engines)",
      "Amazon DynamoDB Developer Guide — Data modeling",
      "PostgreSQL documentation — When not to use PostgreSQL",
      "Martin Kleppmann — Turning the database inside out",
    ],
  }),

  lesson({
    id: "cache-strategies",
    moduleId: "caching",
    phaseId: "fundamentals",
    title: "Caching Strategies & Layers",
    durationMinutes: 40,
    summary:
      "Caching trades freshness for speed at every layer of the stack — browser, CDN, reverse proxy, application, and database. The right strategy depends on read/write ratios, consistency tolerance, and failure modes. Poor cache design causes stale data bugs, thundering herds, and memory exhaustion.",
    sections: [
      {
        title: "Why and Where to Cache",
        paragraphs: [
          "Caching stores copies of expensive-to-compute or expensive-to-fetch data closer to the consumer. A database query taking 50 ms might be served from Redis in 1 ms or from a browser cache in 0 ms. At scale, caching is not optional — it is how systems survive.",
          "Caches exist at multiple layers. Browser caches use HTTP headers (Cache-Control, ETag). CDNs cache static assets and cacheable API responses at edge PoPs globally. Reverse proxies (Nginx, Varnish) cache upstream responses. Application caches (Redis, Memcached) hold hot keys in memory. Database buffer pools cache pages internally.",
          "Each layer has different TTL semantics, invalidation mechanisms, and consistency guarantees. A coherent caching strategy defines what is cached where, how long it lives, and how it is invalidated when source data changes.",
        ],
      },
      {
        title: "Cache-Aside, Write-Through, and Write-Back",
        paragraphs: [
          "Cache-aside (lazy loading): the application checks the cache first. On miss, it loads from the database, populates the cache, and returns. On write, the application updates the database and deletes or updates the cache entry. This is the most common pattern — simple and flexible.",
          "Write-through: every write goes to cache and database synchronously. Reads always hit warm cache. Consistency is strong between cache and DB, but writes are slower. Used when read-heavy workloads demand guaranteed cache freshness.",
          "Write-back (write-behind): writes go to cache first; cache asynchronously flushes to the database. Maximizes write throughput but risks data loss if the cache fails before flush. Suitable for write-heavy, eventually-durable workloads like buffering analytics events.",
        ],
        bullets: [
          "Cache-aside: app manages cache; best general-purpose pattern",
          "Write-through: synchronous DB + cache write; strong consistency",
          "Write-back: async flush; high write throughput, durability risk",
        ],
      },
      {
        title: "Invalidation and the Thundering Herd",
        paragraphs: [
          "Cache invalidation is notoriously difficult. Time-based expiry (TTL) is simple but serves stale data until expiry. Event-driven invalidation (pub/sub, message queues) is precise but requires wiring every write path to emit invalidation events.",
          "The thundering herd (cache stampede) occurs when a popular key expires and thousands of concurrent requests miss the cache simultaneously, each hitting the database. Mitigations include probabilistic early expiration, request coalescing (single-flight pattern), and mutex locks per key.",
          "Versioned cache keys (e.g., product:123:v5) allow atomic invalidation by bumping a version counter instead of deleting keys. Negative caching stores 'not found' results to protect against repeated lookups for missing entities.",
        ],
      },
      {
        title: "Distributed Caching with Redis",
        paragraphs: [
          "Redis and Memcached provide shared, in-memory caches accessible to all application instances. Redis adds persistence options, rich data structures, pub/sub, and Lua scripting for atomic operations.",
          "Size caches appropriately: too small causes constant eviction and low hit rates; too large wastes memory and money. Monitor hit rate, eviction rate, memory usage, and latency p99. Target 90%+ hit rates for well-chosen keys.",
          "Redis Cluster and client-side consistent hashing distribute keys across shards. Hot keys — a single key receiving disproportionate traffic — require replication, local caching, or key splitting strategies.",
        ],
      },
    ],
    concepts: [
      "Cache hit vs miss and hit rate as primary metric",
      "Cache-aside, write-through, write-back patterns",
      "TTL-based vs event-driven invalidation",
      "Thundering herd and single-flight deduplication",
      "CDN edge caching and Cache-Control headers",
      "ETag and conditional requests for bandwidth savings",
      "Negative caching for absent keys",
      "Redis data structures: strings, hashes, sorted sets",
      "Hot key problem in distributed caches",
      "Cache penetration, breakdown, and avalanche scenarios",
    ],
    practices: [
      "Set TTLs on every cache entry — unbounded caches grow until they crash",
      "Use single-flight or locking to prevent thundering herds on hot keys",
      "Cache at the highest layer possible (CDN before Redis before DB)",
      "Monitor hit rate, eviction rate, and memory; alert on sudden drops",
      "Invalidate or version keys on write — do not rely on TTL alone for critical data",
      "Size Redis with headroom for peak traffic and avoid maxmemory-policy allkeys-lru without understanding evictions",
      "Test cache failure modes: what happens when Redis is entirely unavailable?",
    ],
    pitfalls: [
      "Caching without TTL and running out of memory",
      "Invalidating cache after DB write fails — serving stale data indefinitely",
      "Caching large objects that evict the entire working set",
      "Ignoring cache consistency during database failover",
      "Using the same TTL for rapidly changing and static data",
      "Caching personalized data at CDN layer without Vary headers",
    ],
    examples: [
      {
        title: "Product catalog with CDN + Redis",
        description:
          "Product images and static JSON are CDN-cached with 24-hour TTL. Product details are cache-aside in Redis with 5-minute TTL and event invalidation on price updates. Search results are not cached — they change too frequently and are user-specific.",
      },
      {
        title: "Leaderboard with write-back",
        description:
          "Game scores write to Redis sorted sets immediately for real-time leaderboard display. A background job flushes aggregated scores to PostgreSQL every 30 seconds. Acceptable data loss window: 30 seconds of scores if Redis fails — mitigated by Redis persistence (AOF).",
      },
      {
        title: "Preventing thundering herd on flash sale",
        description:
          "A popular product key uses single-flight: on cache miss, one request fetches from DB while others wait on the same promise. Combined with probabilistic early refresh (refresh at 90% of TTL), the DB never sees a spike of 10,000 concurrent queries.",
      },
    ],
    keyTakeaways: [
      "Cache at every layer — browser, CDN, app, database buffer pool",
      "Cache-aside is the default; write-through when read consistency is critical",
      "Invalidation is harder than population — design it with every write path",
      "Guard against thundering herds with single-flight and early expiration",
      "Monitor hit rates and plan for cache cluster failures",
      "Not everything should be cached — skip highly volatile or personalized data",
    ],
    whyItMatters:
      "A well-designed cache reduces database load by 10–100× and cuts user-facing latency dramatically. A poorly designed cache causes subtle stale-data bugs that are hard to reproduce and catastrophic overload events when caches fail open. Caching appears in virtually every system design interview and every production performance investigation.",
    reflectionQuestions: [
      "What happens during a cache stampede when a popular key expires?",
      "When is write-through preferable to cache-aside?",
      "How would you cache user-specific data without serving one user's data to another?",
      "What is your fallback when the entire Redis cluster is down?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapter 3 (Caching)",
      "Redis documentation — Memory optimization and eviction policies",
      "AWS CloudFront — Caching behavior and invalidation",
      "Facebook — Scaling Memcache at Facebook (paper)",
    ],
  }),

  lesson({
    id: "msg-queues-pubsub",
    moduleId: "messaging",
    phaseId: "fundamentals",
    title: "Queues, Pub/Sub & Event Streaming",
    durationMinutes: 41,
    summary:
      "Messaging decouples producers from consumers in time and space, enabling async processing, resilience, and event-driven architectures. Point-to-point queues, pub/sub fan-out, and durable event logs each solve different problems — with distinct delivery guarantees that your application must handle explicitly.",
    sections: [
      {
        title: "Why Messaging Matters",
        paragraphs: [
          "Synchronous request-response ties the caller's fate to the callee's availability and latency. If the email service is slow, the signup API waits — or times out. Messaging introduces a buffer: the producer publishes a message and continues; the consumer processes it when ready.",
          "Messaging enables load leveling (spiky traffic absorbed by a queue), service decoupling (producers do not know consumers), geographic distribution, and reliable retry without blocking users. Event-driven architectures treat state changes as facts that multiple services react to independently.",
          "The cost is complexity: delivery semantics, ordering guarantees, poison messages, schema evolution, and observability across async boundaries are harder than synchronous calls.",
        ],
      },
      {
        title: "Point-to-Point Queues",
        paragraphs: [
          "A message queue delivers each message to exactly one consumer (competing consumers model). RabbitMQ, Amazon SQS, and Azure Service Bus implement this pattern. Ideal for task distribution: image processing, email sending, order fulfillment.",
          "Queues provide natural load balancing — add more workers to drain faster. Messages persist until acknowledged (at-least-once) or until processed (with visibility timeouts in SQS). Dead Letter Queues (DLQ) capture messages that fail after max retries for manual inspection.",
          "Ordering is generally per-queue, not global. FIFO queues (SQS FIFO) guarantee order within a message group at the cost of throughput. Design consumers to be idempotent because redelivery happens.",
        ],
      },
      {
        title: "Pub/Sub and Fan-Out",
        paragraphs: [
          "Publish/subscribe delivers one message to many subscribers. Google Pub/Sub, Amazon SNS, and Redis pub/sub fan out events to multiple interested services. A 'OrderPlaced' event might trigger inventory, shipping, analytics, and notification services simultaneously.",
          "Pub/sub decouples event producers from the set of consumers — new subscribers can be added without changing the publisher. Message brokers handle subscription management and delivery retries per subscriber.",
          "Ephemeral pub/sub (Redis) drops messages if no subscriber is listening. Durable pub/sub (Kafka, Google Pub/Sub) persists messages for later consumption — critical for reliability.",
        ],
      },
      {
        title: "Event Streaming with Kafka",
        paragraphs: [
          "Event streaming platforms (Apache Kafka, Apache Pulsar, Amazon Kinesis) store messages in an append-only, partitioned log. Consumers track their offset and can replay history — enabling event sourcing, audit trails, and reprocessing after bug fixes.",
          "Kafka partitions provide ordering within a partition and parallel consumption across partitions. Partition key choice (e.g., user_id) ensures related events stay ordered. Retention is time- or size-based, not consumption-based — multiple consumer groups read independently.",
          "Kafka suits high-throughput event pipelines: click streams, CDC, log aggregation, and microservice choreography. Operational complexity is higher than SQS — you manage brokers, partitions, and consumer lag.",
        ],
      },
      {
        title: "Delivery Semantics and Idempotency",
        paragraphs: [
          "At-most-once: messages may be lost but never duplicated — fire and forget. At-least-once: messages are redelivered on failure — duplicates possible, consumers must be idempotent. Exactly-once: the holy grail — achieved in practice via idempotent consumers plus transactional outbox or Kafka transactions, not by the broker alone.",
          "Design every consumer to handle duplicate messages: idempotency keys, upsert operations, or deduplication tables. Retry policies use exponential backoff with jitter to avoid synchronized retry storms.",
          "Poison messages — permanently failing payloads — must route to DLQ after N attempts. Alert on DLQ depth. Never infinite retry loops that block queue processing.",
        ],
      },
    ],
    concepts: [
      "Point-to-point queue: one consumer per message",
      "Pub/sub fan-out: one message, many subscribers",
      "Event streaming: durable append-only log with replay",
      "Dead Letter Queue (DLQ) for failed messages",
      "At-least-once, at-most-once, exactly-once semantics",
      "Consumer idempotency for safe redelivery",
      "Kafka partitions and consumer groups",
      "Visibility timeout and acknowledgment models",
      "Exponential backoff with jitter for retries",
      "Transactional outbox pattern for reliable publishing",
    ],
    practices: [
      "Make all message handlers idempotent — assume duplicates will arrive",
      "Configure DLQs and alert when messages land in them",
      "Use exponential backoff with jitter on retries",
      "Choose partition keys that distribute load evenly",
      "Monitor consumer lag — growing lag signals processing bottlenecks",
      "Version event schemas and support backward-compatible evolution",
      "Use the outbox pattern to atomically write DB state and publish events",
    ],
    pitfalls: [
      "Assuming exactly-once delivery without idempotent consumers",
      "No DLQ — poison messages block the entire queue indefinitely",
      "Hot partitions in Kafka from poor partition key choice",
      "Synchronous chains disguised as async — blocking on message publish",
      "Unbounded queues that mask consumer failures until disk fills",
      "Ignoring message ordering requirements when scaling consumers",
    ],
    examples: [
      {
        title: "Order processing pipeline",
        description:
          "Checkout API writes order to PostgreSQL and an outbox row in one transaction. An outbox relay publishes OrderCreated to Kafka. Inventory, shipping, and email services consume from separate consumer groups — each processes independently with idempotent handlers keyed by order_id.",
      },
      {
        title: "Image thumbnail generation",
        description:
          "Upload triggers an SQS message with S3 object key. Auto-scaling worker fleet pulls messages, generates thumbnails, writes back to S3. Failed messages retry 3 times with backoff, then move to DLQ for manual review.",
      },
    ],
    keyTakeaways: [
      "Messaging decouples services in time — embrace async for non-critical paths",
      "Queues for task distribution; pub/sub for event fan-out; Kafka for durable streams",
      "At-least-once is the practical default — design idempotent consumers",
      "DLQs and consumer lag monitoring are non-negotiable operational requirements",
      "Partition key design determines Kafka ordering and load distribution",
      "The outbox pattern bridges reliable DB writes with event publishing",
    ],
    whyItMatters:
      "Event-driven architecture is the backbone of modern microservices, data pipelines, and real-time analytics. Misunderstanding delivery guarantees causes duplicate charges, lost orders, and stuck pipelines. Every senior engineer must articulate when to queue, when to stream, and how to handle failure.",
    reflectionQuestions: [
      "When would you choose Kafka over RabbitMQ or SQS?",
      "How do you handle a message that always fails processing?",
      "What makes exactly-once delivery difficult in distributed systems?",
      "How does the outbox pattern prevent lost events during DB failures?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapter 11 (Stream Processing)",
      "Apache Kafka documentation — Introduction and design",
      "Microservices.io — Transactional outbox pattern",
      "Amazon SQS Developer Guide — FIFO queues and DLQ",
    ],
  }),

  lesson({
    id: "dist-cap-consensus",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    title: "CAP, PACELC & Consensus",
    durationMinutes: 43,
    summary:
      "Distributed systems face unavoidable trade-offs between consistency, availability, and latency. CAP and PACELC frameworks help you reason about these trade-offs consciously. Consensus algorithms like Raft keep replicas in agreement — powering everything from etcd to distributed databases.",
    sections: [
      {
        title: "The Reality of Distributed Systems",
        paragraphs: [
          "When components run on multiple machines connected by a network, failures are normal — not exceptional. Networks partition, packets drop, nodes crash, clocks skew. A distributed system must continue operating (or fail gracefully) despite these failures.",
          "The fundamental challenge is maintaining shared state across unreliable nodes. Should all replicas agree before responding (consistency)? Should the system keep serving requests even if some replicas are unreachable (availability)? You cannot maximize both during a network partition.",
          "Understanding these trade-offs prevents you from choosing tools with wrong expectations — expecting strong consistency from an AP cache or five-nines availability from a CP coordination service during splits.",
        ],
      },
      {
        title: "CAP Theorem",
        paragraphs: [
          "CAP states that a distributed data store can provide at most two of three properties: Consistency (every read receives the most recent write or an error), Availability (every request receives a non-error response), and Partition tolerance (the system operates despite network partitions between nodes).",
          "In practice, partition tolerance is non-negotiable — networks fail. So the real choice during a partition is Consistency (CP) or Availability (AP). CP systems (etcd, ZooKeeper, traditional RDBMS with sync replication) may reject writes or reads to preserve consistency. AP systems (Cassandra, DynamoDB with eventual consistency) accept writes on both sides of a partition and reconcile later.",
          "CAP is often misunderstood as a static label. Systems can be mostly AP with tunable consistency, or mostly CP with read replicas that serve stale data. Context and configuration matter.",
        ],
      },
      {
        title: "PACELC Extension",
        paragraphs: [
          "PACELC extends CAP: if there is a Partition (P), choose between Availability (A) and Consistency (C); Else (E), choose between Latency (L) and Consistency (C). This captures the everyday trade-off even when the network is healthy.",
          "Even without partitions, synchronous replication to all replicas adds latency. Many systems default to reading from the nearest replica (low latency, eventual consistency) and offer optional linearizable reads (high latency, strong consistency) per request.",
          "DynamoDB is PA/EL by default (available during partition, low-latency eventually consistent reads). PostgreSQL with synchronous replication is PC/EC (consistent during partition, consistent but slower when healthy). Cassandra is PA/EL with tunable consistency per query.",
        ],
      },
      {
        title: "Consistency Models",
        paragraphs: [
          "Strong consistency (linearizability): every read sees the latest write — as if one copy exists. Eventual consistency: replicas converge over time; reads may return stale data temporarily. Causal consistency: preserves cause-effect ordering without full linearizability.",
          "Read-your-writes: a user always sees their own updates. Monotonic reads: a user never sees time go backward. These session guarantees are often sufficient and cheaper than global strong consistency.",
          "Choose consistency per operation: financial transfers need linearizability; social media like counts tolerate eventual consistency; shopping cart reads need read-your-writes.",
        ],
      },
      {
        title: "Consensus with Raft",
        paragraphs: [
          "Consensus algorithms ensure multiple nodes agree on a value or log sequence despite failures. Raft is the approachable standard: nodes are followers, one leader is elected, the leader replicates log entries to a majority quorum before committing.",
          "Quorum (majority of nodes) ensures any two quorums overlap — at least one node has the latest committed entry. Leader election uses randomized timeouts to avoid split-brain. etcd, Consul, and CockroachDB use Raft variants.",
          "Consensus is expensive — typically 3 or 5 nodes, limited write throughput compared to leaderless systems. Use it for coordination (service discovery, config, locks), not high-throughput data ingestion.",
        ],
      },
    ],
    concepts: [
      "CAP: Consistency, Availability, Partition tolerance — pick two during partition",
      "PACELC: Latency vs Consistency when network is healthy",
      "CP systems: etcd, ZooKeeper, Spanner (with TrueTime)",
      "AP systems: Cassandra, DynamoDB (default), Riak",
      "Linearizability vs eventual consistency",
      "Read-your-writes and monotonic reads session guarantees",
      "Raft consensus: leader election, log replication, quorum",
      "Quorum: majority agreement for commit",
      "Split-brain: two leaders during partition without quorum",
      "Fencing tokens to prevent stale leaders from writing",
    ],
    practices: [
      "Classify each data store in your architecture as CP or AP with PACELC",
      "Use consensus stores (etcd) only for coordination, not bulk data",
      "Request strong consistency only on operations that require it",
      "Run clock sync (NTP/Chrony) on all nodes — skew breaks TTL and ordering",
      "Test partition behavior with chaos engineering (iptables, toxiproxy)",
      "Monitor replication lag on read replicas before serving stale reads",
      "Use fencing tokens when relying on distributed locks",
    ],
    pitfalls: [
      "Labeling a system 'CP' or 'AP' without understanding tunable consistency",
      "Using etcd for high-throughput writes — it is a coordination store",
      "Assuming read replicas return latest data without lag monitoring",
      "Ignoring clock skew in TTL-based leases and lock expiration",
      "Split-brain from misconfigured quorum sizes (even number of nodes)",
      "Choosing strong consistency globally when only one operation needs it",
    ],
    examples: [
      {
        title: "Kubernetes etcd",
        description:
          "Kubernetes stores cluster state in etcd — a CP system using Raft. During a network partition, the minority partition becomes read-only. This is acceptable because cluster coordination demands consistency over availability. Application data lives elsewhere.",
      },
      {
        title: "DynamoDB global tables",
        description:
          "Multi-region DynamoDB global tables replicate asynchronously — AP with eventual consistency across regions. A user updating profile in US-East may see stale data in EU-West for seconds. Product accepts this for profile reads; payment uses single-region strong consistency.",
      },
      {
        title: "Bank transfer with quorum",
        description:
          "A bank uses a strongly consistent store requiring quorum writes for transfers. During partition, minority nodes reject writes — users see errors rather than double-spend. Availability is sacrificed for correctness on this critical path.",
      },
    ],
    keyTakeaways: [
      "Partition tolerance is mandatory — the real choice is consistency vs availability",
      "PACELC captures latency vs consistency trade-offs during normal operation",
      "Match consistency level to operation criticality — not everything needs linearizability",
      "Raft and quorum-based consensus power coordination services like etcd",
      "Test partition and failure scenarios — theoretical CAP choices meet reality in production",
      "Read replicas and caches introduce staleness — monitor lag explicitly",
    ],
    whyItMatters:
      "Every distributed database, cache, and coordination service embeds CAP/PACELC trade-offs. Misaligned expectations cause data corruption, double-spending, and split-brain incidents. System design interviews center on articulating these trade-offs for specific requirements.",
    reflectionQuestions: [
      "Is Redis Cluster CP or AP during a network partition?",
      "Why does etcd use Raft for Kubernetes instead of a simple key-value store?",
      "When is eventual consistency unacceptable for your application?",
      "How does PACELC apply to a read from a PostgreSQL async replica?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapters 5, 7, 9",
      "The Raft Consensus Algorithm — raft.github.io",
      "Brewer's CAP theorem revisited (2012)",
      "Daniel Abadi — PACELC theorem blog post",
    ],
  }),

  lesson({
    id: "api-styles",
    moduleId: "apis",
    phaseId: "fundamentals",
    title: "REST, GraphQL, gRPC & Streaming",
    durationMinutes: 38,
    summary:
      "API style shapes client flexibility, performance, team velocity, and operational complexity. REST dominates public HTTP APIs; GraphQL optimizes client-driven data fetching; gRPC excels at internal service-to-service RPC; streaming protocols handle real-time and high-throughput data flows.",
    sections: [
      {
        title: "REST: Resource-Oriented HTTP",
        paragraphs: [
          "REST (Representational State Transfer) models APIs as resources identified by URLs, manipulated with HTTP verbs (GET, POST, PUT, PATCH, DELETE), and described by standard status codes and headers. It leverages HTTP caching, CDN compatibility, and universal tooling.",
          "REST shines for public APIs, CRUD operations, and teams wanting simplicity and broad client support. Hypermedia (HATEOAS) is rarely implemented in practice; most REST APIs are pragmatic resource endpoints with JSON bodies.",
          "Challenges include over-fetching (returning entire objects when clients need one field), under-fetching (requiring multiple round trips), and inconsistent conventions across teams without strict API governance.",
        ],
      },
      {
        title: "GraphQL: Client-Specified Queries",
        paragraphs: [
          "GraphQL provides a single endpoint where clients send queries specifying exactly the fields they need. The server resolves a graph of types — reducing over-fetching and enabling rapid frontend iteration without backend changes for every UI tweak.",
          "GraphQL supports mutations (writes), subscriptions (real-time via WebSocket), and introspection for schema discovery. Tools like Apollo and Relay manage caching, batching, and optimistic updates on the client.",
          "Risks include N+1 query problems (mitigated by DataLoader batching), complex server-side resolvers, query depth/complexity attacks, and caching difficulty at the HTTP layer — POST requests bypass CDN caches by default.",
        ],
      },
      {
        title: "gRPC: High-Performance RPC",
        paragraphs: [
          "gRPC uses Protocol Buffers for compact binary serialization and HTTP/2 for multiplexed, bidirectional streaming. Service contracts are defined in .proto files, generating typed client and server stubs in multiple languages.",
          "gRPC supports unary (request-response), server streaming, client streaming, and bidirectional streaming. It is ideal for internal microservice communication where performance, type safety, and streaming matter more than browser compatibility.",
          "gRPC requires gRPC-Web or a proxy (Envoy) for browser clients. Debugging is harder than JSON REST — tools like grpcurl and reflection help. Load balancing uses client-side or proxy-based approaches (xDS, lookaside LB).",
        ],
      },
      {
        title: "Streaming: WebSockets, SSE, and Webhooks",
        paragraphs: [
          "Server-Sent Events (SSE) push server-to-client updates over a persistent HTTP connection — simpler than WebSockets, unidirectional, auto-reconnect built in. Ideal for live feeds, progress updates, and notifications.",
          "WebSockets provide full-duplex communication — chat, collaborative editing, gaming. Scaling WebSockets requires sticky connections or a pub/sub backplane to broadcast across server instances.",
          "Webhooks are server-to-server HTTP callbacks — event producers POST to consumer URLs when something happens. Simple to integrate but require retry logic, signature verification, and idempotent handlers on the receiving side.",
        ],
      },
      {
        title: "Choosing and Versioning APIs",
        paragraphs: [
          "Public mobile and web clients: REST or GraphQL depending on client diversity and data-fetching complexity. Internal service mesh: gRPC for performance. Real-time features: WebSockets or SSE. Third-party integrations: REST webhooks.",
          "Many organizations use REST/GraphQL at the edge and gRPC internally — an API gateway translates between them. Version APIs explicitly: URL path (/v2/users), header (Accept-Version), or schema evolution with backward compatibility.",
          "Document APIs with OpenAPI (REST), GraphQL schema SDL, or proto files. Contract testing (Pact, Buf) catches breaking changes before deployment.",
        ],
      },
    ],
    concepts: [
      "REST: resources, HTTP verbs, status codes, cacheable GET",
      "GraphQL: schema, queries, mutations, subscriptions, resolver graph",
      "gRPC: Protocol Buffers, HTTP/2, four streaming modes",
      "SSE: unidirectional server push over HTTP",
      "WebSockets: bidirectional persistent connection",
      "Webhooks: server-to-server event callbacks",
      "API versioning: URL, header, schema evolution",
      "Over-fetching vs under-fetching trade-offs",
      "DataLoader pattern for GraphQL N+1 prevention",
      "gRPC-Web for browser compatibility",
    ],
    practices: [
      "Use REST for public CRUD APIs with good HTTP semantics and caching",
      "Use GraphQL when many client types need different field subsets",
      "Use gRPC for internal services with high throughput requirements",
      "Define API contracts in OpenAPI, GraphQL SDL, or proto files — generate code",
      "Implement rate limiting and query complexity limits on GraphQL endpoints",
      "Verify webhook signatures (HMAC) and make handlers idempotent",
      "Version APIs before external consumers depend on them",
    ],
    pitfalls: [
      "GraphQL exposing entire database schema without authorization per field",
      "gRPC without deadlines/timeouts — cascading hangs across services",
      "REST APIs that ignore HTTP caching semantics (no ETag, no Cache-Control)",
      "WebSockets without a scale-out strategy — connections stuck on one node",
      "Breaking API changes without versioning or deprecation period",
      "Using POST for all GraphQL queries without complexity analysis — DoS vector",
    ],
    examples: [
      {
        title: "Netflix-style API layering",
        description:
          "Mobile and web clients hit a GraphQL BFF (Backend for Frontend) that aggregates data from internal gRPC microservices. The BFF handles auth, field resolution, and caching. Internal services communicate via gRPC with mTLS — never exposed publicly.",
      },
      {
        title: "Stripe-style webhooks",
        description:
          "Stripe POSTs signed webhook events to merchant endpoints on payment success. Merchants verify HMAC signatures, return 200 quickly, and process asynchronously via a queue. Idempotency keys prevent duplicate order fulfillment on webhook retry.",
      },
    ],
    keyTakeaways: [
      "REST is the default for public HTTP APIs — simple, cacheable, universal",
      "GraphQL gives clients query flexibility at the cost of server complexity",
      "gRPC is the internal workhorse for typed, high-performance RPC",
      "Streaming protocols (SSE, WebSockets) serve real-time use cases",
      "Version and document APIs from day one — contract tests prevent breakage",
      "Hybrid architectures (GraphQL edge + gRPC internal) are common at scale",
    ],
    whyItMatters:
      "API choices affect latency budgets, developer experience, security surface, and deployment coupling. Wrong choices create frontend bottlenecks (REST over-fetching), operational nightmares (unbounded GraphQL queries), or integration friction (gRPC exposed to browsers). Interviewers expect nuanced comparisons, not 'always use REST.'",
    reflectionQuestions: [
      "When does GraphQL's flexibility become a performance or security problem?",
      "Why do large companies use gRPC internally but REST or GraphQL externally?",
      "How would you scale WebSocket connections across a cluster of servers?",
      "What versioning strategy would you use for a public API with mobile clients?",
    ],
    resources: [
      "GraphQL specification — graphql.org",
      "gRPC documentation — Introduction and core concepts",
      "Roy Fielding's REST dissertation",
      "Microsoft REST API Guidelines",
    ],
  }),

  lesson({
    id: "reliability-patterns",
    moduleId: "reliability",
    phaseId: "fundamentals",
    title: "Retries, Circuit Breakers & Backpressure",
    durationMinutes: 40,
    summary:
      "Production systems fail constantly — networks blip, dependencies slow down, disks fill up. Reliability patterns prevent small failures from cascading into outages. Retries recover transient errors, circuit breakers stop calling broken services, bulkheads isolate blast radius, and backpressure prevents overload.",
    sections: [
      {
        title: "Designing for Failure",
        paragraphs: [
          "Every dependency will fail eventually: databases, payment gateways, third-party APIs, DNS, the network itself. Reliability engineering assumes failure is normal and designs systems to degrade gracefully rather than collapse entirely.",
          "The goal is not zero failures — it is bounded impact, fast recovery, and predictable degradation. Users may see slower responses or reduced features, but the core service stays available. SLOs (Service Level Objectives) define acceptable failure budgets.",
          "Reliability patterns are implemented in application code, client libraries (gRPC retries), service meshes (Istio circuit breaking), and infrastructure (load shedder, rate limiters). Consistency across services matters — one service without timeouts can hang an entire call chain.",
        ],
      },
      {
        title: "Retries, Timeouts, and Jitter",
        paragraphs: [
          "Retries recover from transient failures: network timeouts, 503 responses, connection resets. Always combine retries with timeouts — a retry without a timeout can wait forever. Set deadlines per request and per call chain.",
          "Exponential backoff increases delay between retries (1s, 2s, 4s, 8s) to give failing services time to recover. Jitter adds randomness to prevent synchronized retry storms — without jitter, thousands of clients retry simultaneously and re-overwhelm the recovering service.",
          "Retry only idempotent operations unless using idempotency keys. POST /charge without an idempotency key must not blind retry — you may double-charge. GET, PUT with idempotency keys, and DELETE are safer retry candidates.",
        ],
      },
      {
        title: "Circuit Breakers",
        paragraphs: [
          "A circuit breaker wraps calls to a dependency and tracks failure rates. Closed (normal): calls pass through. Open (tripped): calls fail fast without hitting the dependency — return fallback or error immediately. Half-open: allow a probe request to test recovery.",
          "Circuit breakers prevent cascading failures. When the payment service is down, the order service stops hammering it, returns a graceful error, and preserves threads and connection pools for healthy paths.",
          "Netflix Hystrix popularized this pattern; today Resilience4j, Polly, and service meshes provide implementations. Configure failure thresholds, reset timeouts, and fallbacks per dependency.",
        ],
      },
      {
        title: "Bulkheads, Rate Limiting, and Load Shedding",
        paragraphs: [
          "Bulkheads isolate resources — separate thread pools or connection pools per dependency so one slow service cannot exhaust all threads. Named after ship compartments that contain flooding.",
          "Rate limiting protects services from overload: token bucket and sliding window algorithms cap requests per client or globally. Return 429 Too Many Requests with Retry-After header. Rate limit at the edge (API gateway) and at critical internal services.",
          "Load shedding drops requests when the system is overloaded — prefer rejecting new work over failing all in-flight requests. Prioritize critical paths (checkout) over background jobs (recommendations).",
        ],
      },
      {
        title: "Backpressure",
        paragraphs: [
          "Backpressure signals upstream producers to slow down when downstream consumers cannot keep pace. Without backpressure, buffers grow unbounded until memory exhaustion — the slow consumer problem.",
          "Reactive streams (Project Reactor, RxJava), gRPC flow control, and Kafka consumer pause/resume implement backpressure. TCP itself applies backpressure via window sizes.",
          "In queue-based systems, monitor queue depth and scale consumers or throttle producers when depth exceeds thresholds. Unbounded queues are a reliability anti-pattern.",
        ],
      },
    ],
    concepts: [
      "Exponential backoff with jitter for retries",
      "Timeouts and deadlines on every outbound call",
      "Circuit breaker states: closed, open, half-open",
      "Bulkheads: isolated resource pools per dependency",
      "Rate limiting: token bucket, sliding window, leaky bucket",
      "Load shedding: drop low-priority work under pressure",
      "Backpressure: slow producers when consumers lag",
      "Idempotency keys for safe retries on mutations",
      "Fallback responses and graceful degradation",
      "Cascading failure and failure domain isolation",
    ],
    practices: [
      "Set timeouts on every HTTP, gRPC, and database call — no exceptions",
      "Use retry with exponential backoff + jitter; cap max attempts",
      "Implement circuit breakers on all external dependencies",
      "Use idempotency keys for payment, order, and booking operations",
      "Rate limit public APIs and expensive internal endpoints",
      "Monitor error rates, latency p99, and circuit breaker state per dependency",
      "Load test failure scenarios — kill dependencies and observe cascade behavior",
    ],
    pitfalls: [
      "Retrying without jitter during an outage — amplifies the failure",
      "Unbounded retries on non-idempotent POST requests",
      "No timeout — one hung dependency blocks all worker threads",
      "Circuit breaker thresholds too sensitive — flapping open/closed",
      "Unbounded queues masking consumer failure until OOM",
      "Fallback that returns stale or incorrect data without user indication",
    ],
    examples: [
      {
        title: "Payment service circuit breaker",
        description:
          "Order service wraps payment API calls in a circuit breaker. After 5 failures in 10 seconds, circuit opens — orders queue for later payment retry and users see 'payment processing.' Half-open after 30 seconds probes one request. Success closes circuit; failure reopens.",
      },
      {
        title: "Retry storm without jitter",
        description:
          "A DNS blip causes 500 errors. Ten thousand clients retry simultaneously every second with fixed 1s backoff. The recovering service is immediately overwhelmed again. Adding full jitter spreads retries over a window, allowing recovery.",
      },
      {
        title: "Kafka backpressure",
        description:
          "A consumer processing messages slower than production rate accumulates lag. Consumer pauses partition fetching when internal buffer is full — applying backpressure to the broker. Alert fires on lag > 100K; autoscaler adds consumer instances.",
      },
    ],
    keyTakeaways: [
      "Assume every dependency fails — design for graceful degradation",
      "Retries need backoff, jitter, timeouts, and idempotency",
      "Circuit breakers fail fast and prevent cascade overload",
      "Bulkheads and rate limits contain blast radius",
      "Backpressure prevents unbounded buffering and OOM",
      "Test failure modes — reliability patterns must be verified under chaos",
    ],
    whyItMatters:
      "Major outages at cloud providers and financial institutions often trace to missing timeouts, retry storms, or absent circuit breakers — not exotic bugs. These patterns are the difference between a blip and a multi-hour incident. They appear in every system design discussion about production readiness.",
    reflectionQuestions: [
      "What happens if retries do not use jitter during a widespread outage?",
      "How does a circuit breaker differ from a simple timeout?",
      "When should you not retry a failed request?",
      "How would you implement backpressure in a synchronous REST API?",
    ],
    resources: [
      "Release It! — Michael Nygard (stability patterns)",
      "Google SRE Book — Addressing Cascading Failures",
      "Netflix Hystrix wiki (archived) and Resilience4j docs",
      "AWS Architecture Blog — Exponential Backoff and Jitter",
    ],
  }),

  lesson({
    id: "security-auth",
    moduleId: "security",
    phaseId: "fundamentals",
    title: "Authentication, Authorization & Encryption",
    durationMinutes: 42,
    summary:
      "Security is layered defense: verify identity (authentication), enforce permissions (authorization), protect data in transit and at rest (encryption), and manage secrets safely. Most breaches stem from misconfigured auth, leaked credentials, and missing encryption — not sophisticated zero-day exploits.",
    sections: [
      {
        title: "Authentication: Proving Identity",
        paragraphs: [
          "Authentication answers 'who are you?' Common mechanisms include username/password (with bcrypt/argon2 hashing), multi-factor authentication (TOTP, WebAuthn), API keys, and federated identity via OAuth 2.0 and OpenID Connect (OIDC).",
          "OAuth 2.0 delegates authorization to an identity provider (Google, Okta, Auth0) without sharing passwords. OIDC adds an identity layer — ID tokens (JWTs) containing user claims. The authorization code flow with PKCE is the standard for web and mobile apps.",
          "JWTs (JSON Web Tokens) encode claims in a signed, base64 payload. Stateless verification is fast — no server-side session lookup. Downsides: revocation is hard (requires blocklists or short TTLs), tokens can be stolen if not stored securely, and payload is readable (not encrypted) unless using JWE.",
        ],
      },
      {
        title: "Authorization: Enforcing Permissions",
        paragraphs: [
          "Authorization answers 'what can you do?' Role-Based Access Control (RBAC) assigns permissions to roles (admin, editor, viewer) and roles to users. Simple and widely used for internal tools and SaaS products.",
          "Attribute-Based Access Control (ABAC) evaluates policies against attributes — user department, resource owner, time of day, IP range. More flexible for complex enterprise policies. Policy engines (OPA, Cedar) evaluate ABAC rules at runtime.",
          "Principle of least privilege: grant minimum permissions needed. Service accounts for machine-to-machine auth get scoped API keys or mTLS certificates — never root credentials. Regularly audit and rotate permissions.",
        ],
      },
      {
        title: "Encryption in Transit and at Rest",
        paragraphs: [
          "Encryption in transit protects data on the wire via TLS 1.2+ (HTTPS, mTLS for service-to-service). Terminate TLS at the load balancer or service mesh; enforce HSTS and modern cipher suites. Never transmit secrets or PII over unencrypted HTTP.",
          "Encryption at rest protects stored data: database TDE (Transparent Data Encryption), S3 server-side encryption (SSE-S3, SSE-KMS), disk encryption on VMs. Keys managed by KMS (AWS KMS, HashiCorp Vault) with rotation policies.",
          "Application-level encryption adds a layer for especially sensitive fields (SSN, credit card) — encrypt before storing so a database breach does not expose plaintext. Manage field-level keys separately from storage keys.",
        ],
      },
      {
        title: "Secrets Management",
        paragraphs: [
          "Secrets — API keys, database passwords, TLS private keys, encryption keys — must never appear in source code, Docker images, or git history. Use secrets managers: AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, Kubernetes Secrets (with encryption at rest enabled).",
          "Inject secrets at runtime via environment variables or mounted volumes. Rotate secrets automatically where supported. Audit access to secrets — who read which secret when.",
          "Development environments use separate secrets from production. .env files are for local dev only — add to .gitignore and use tools like git-secrets to prevent accidental commits.",
        ],
      },
      {
        title: "Security in System Design",
        paragraphs: [
          "Defense in depth: WAF at the edge, network segmentation (VPCs, security groups), auth at API gateway, authorization in services, encryption everywhere. No single layer is sufficient.",
          "Input validation and parameterized queries prevent injection attacks. Rate limiting and CAPTCHA mitigate brute force. Security headers (CSP, X-Frame-Options) reduce browser-side attacks. Log and alert on auth failures and privilege escalation attempts.",
          "Compliance frameworks (SOC 2, GDPR, PCI-DSS) mandate specific controls — understand which apply to your domain. Security is a continuous process: dependency scanning, penetration testing, and incident response plans.",
        ],
      },
    ],
    concepts: [
      "OAuth 2.0 authorization code flow with PKCE",
      "OpenID Connect (OIDC) ID tokens and user claims",
      "JWT structure: header.payload.signature; HS256 vs RS256",
      "RBAC: roles mapped to permissions",
      "ABAC: policy-based access with attributes",
      "TLS/mTLS for encryption in transit",
      "Encryption at rest: TDE, SSE-KMS, disk encryption",
      "Secrets managers: Vault, AWS Secrets Manager",
      "Principle of least privilege",
      "bcrypt/argon2 for password hashing — never plaintext or MD5",
    ],
    practices: [
      "Use OIDC/OAuth for user auth; never roll your own crypto",
      "Store JWTs in httpOnly, Secure, SameSite cookies — not localStorage",
      "Implement RBAC with least privilege; audit permissions quarterly",
      "Encrypt all data in transit (TLS 1.2+) and at rest (KMS-managed keys)",
      "Store secrets in a secrets manager; rotate automatically",
      "Use parameterized queries and input validation on all endpoints",
      "Enable MFA for admin and privileged accounts",
    ],
    pitfalls: [
      "JWT in localStorage — vulnerable to XSS theft",
      "Hardcoded API keys committed to git",
      "Shared service account credentials across all microservices",
      "Missing TLS on internal service communication ('we trust our network')",
      "Authorization checks only at the API gateway — internal services trust all callers",
      "MD5/SHA1 for password hashing — use bcrypt or argon2",
    ],
    examples: [
      {
        title: "SaaS multi-tenant authorization",
        description:
          "Users authenticate via Auth0 (OIDC). JWT contains user_id and org_id. API middleware extracts claims; each query filters by org_id for tenant isolation. Admin role checked via RBAC policy engine (OPA). Cross-tenant access returns 403.",
      },
      {
        title: "Microservice mTLS mesh",
        description:
          "Services in a Kubernetes cluster communicate via Istio service mesh with mutual TLS. Each service has a SPIFFE identity certificate. Unauthorized services cannot call internal APIs even if they reach the network — identity is verified on every request.",
      },
      {
        title: "PCI-compliant payment handling",
        description:
          "Credit card data never touches application servers — Stripe Elements tokenizes on the client. Tokens are sent to the backend, which calls Stripe API over TLS. Database stores only last-four digits. Secrets (Stripe API key) live in AWS Secrets Manager with 90-day rotation.",
      },
    ],
    keyTakeaways: [
      "Authenticate with established protocols (OAuth/OIDC) — do not build custom auth",
      "Authorize at every layer — gateway and service level",
      "Encrypt in transit (TLS) and at rest (KMS) by default",
      "Secrets belong in secrets managers, never in code or images",
      "JWTs enable stateless auth but complicate revocation — use short TTLs",
      "Least privilege for users and service accounts limits breach impact",
    ],
    whyItMatters:
      "Security breaches destroy trust, trigger regulatory fines, and end careers. Most incidents are basic misconfigurations — not APTs. Every system design must address auth, encryption, and secrets. Interviewers expect you to identify security gaps in architectures and propose concrete mitigations.",
    reflectionQuestions: [
      "Why is JWT revocation difficult compared to server-side sessions?",
      "Where should API keys be stored in a production deployment?",
      "How do you prevent one tenant from accessing another tenant's data?",
      "When would you choose mTLS over API keys for service-to-service auth?",
    ],
    resources: [
      "OAuth 2.0 RFC 6749 and OIDC Core specification",
      "OWASP Top 10 — Web application security risks",
      "HashiCorp Vault documentation — Secrets management",
      "NIST SP 800-63B — Digital identity guidelines",
    ],
  }),
];
