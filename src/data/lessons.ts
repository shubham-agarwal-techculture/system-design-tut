import type { Lesson } from "@/types";

export const lessons: Lesson[] = [
  // ─── Networking ───
  {
    id: "net-tcp-ip",
    title: "TCP/IP Fundamentals",
    moduleId: "networking",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "TCP/IP is the protocol suite that powers the internet. Understanding layers helps you reason about latency, reliability, and where failures occur.",
    concepts: [
      "Layer model: Application → Transport → Network → Link",
      "IP addresses route packets; ports identify services on a host",
      "TCP provides reliable, ordered delivery with flow control",
      "UDP is connectionless — fast but no delivery guarantees",
      "Three-way handshake (SYN, SYN-ACK, ACK) establishes TCP connections",
    ],
    whyItMatters:
      "Every API call, database connection, and message queue ultimately rides on TCP/IP. Knowing where reliability is guaranteed (TCP) vs. where you must handle it yourself (UDP) shapes your architecture.",
    reflectionQuestions: [
      "Why would a real-time game prefer UDP over TCP?",
      "What happens when a TCP packet is lost mid-transfer?",
    ],
  },
  {
    id: "net-http",
    title: "HTTP/1.1, HTTP/2 & HTTP/3",
    moduleId: "networking",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "HTTP is the application-layer protocol behind the web. Each version solved specific bottlenecks in connection and transfer efficiency.",
    concepts: [
      "HTTP/1.1: one request per connection (head-of-line blocking)",
      "HTTP/2: multiplexed streams over a single TCP connection",
      "HTTP/3: QUIC over UDP — faster handshakes, no TCP head-of-line blocking",
      "Methods: GET, POST, PUT, PATCH, DELETE",
      "Status codes: 2xx success, 4xx client error, 5xx server error",
      "Headers carry metadata: content-type, caching directives, auth tokens",
    ],
    whyItMatters:
      "API design, CDN configuration, and performance tuning all depend on understanding HTTP semantics and how modern versions reduce latency.",
    reflectionQuestions: [
      "When would you choose HTTP/2 over HTTP/1.1 for an API?",
      "How do caching headers affect your CDN strategy?",
    ],
  },
  {
    id: "net-tls-dns",
    title: "TLS & DNS",
    moduleId: "networking",
    phaseId: "foundations",
    durationMinutes: 10,
    summary:
      "TLS encrypts data in transit. DNS translates human-readable names to IP addresses — both are invisible but critical infrastructure.",
    concepts: [
      "TLS handshake negotiates encryption keys before data transfer",
      "Certificates prove identity (CA-signed or Let's Encrypt)",
      "DNS resolution: recursive resolver → TLD → authoritative nameserver",
      "DNS caching at OS, browser, and CDN layers reduces lookup latency",
      "DNS can be a single point of failure — use multiple providers",
    ],
    whyItMatters:
      "Security audits, certificate rotation, and global load balancing all require solid DNS and TLS knowledge.",
    reflectionQuestions: [
      "What happens if your TLS certificate expires in production?",
      "Why might you use a low TTL for DNS during a migration?",
    ],
  },
  {
    id: "net-load-balancing",
    title: "Load Balancing & Reverse Proxies",
    moduleId: "networking",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "Load balancers distribute traffic across servers. Reverse proxies sit in front of backends to terminate TLS, route, and cache.",
    concepts: [
      "L4 (transport) vs L7 (application) load balancing",
      "Algorithms: round-robin, least connections, consistent hashing",
      "Health checks remove unhealthy backends automatically",
      "Reverse proxies: Nginx, HAProxy, Envoy terminate TLS and route",
      "Sticky sessions vs stateless routing trade-offs",
    ],
    whyItMatters:
      "Horizontal scaling starts at the load balancer. It's the entry point for every high-availability architecture.",
    reflectionQuestions: [
      "When is consistent hashing better than round-robin?",
      "What problems do sticky sessions introduce?",
    ],
  },
  {
    id: "net-websockets-grpc",
    title: "WebSockets & gRPC",
    moduleId: "networking",
    phaseId: "foundations",
    durationMinutes: 10,
    summary:
      "Beyond request-response: WebSockets enable bidirectional streaming; gRPC uses HTTP/2 and Protocol Buffers for efficient RPC.",
    concepts: [
      "WebSockets: persistent, full-duplex connection over HTTP upgrade",
      "Ideal for chat, live feeds, collaborative editing",
      "gRPC: strongly typed contracts via .proto files",
      "Supports unary, server streaming, client streaming, bidirectional",
      "Binary serialization (Protobuf) is faster and smaller than JSON",
    ],
    whyItMatters:
      "Choosing the right communication protocol affects latency, developer experience, and inter-service compatibility.",
    reflectionQuestions: [
      "When would REST be simpler than gRPC for a microservice?",
      "How do you scale WebSocket connections across servers?",
    ],
  },

  // ─── Operating Systems ───
  {
    id: "os-processes-threads",
    title: "Processes & Threads",
    moduleId: "operating-systems",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "Processes are isolated execution units with their own memory. Threads share memory within a process — enabling parallelism but introducing race conditions.",
    concepts: [
      "Process: own address space, file descriptors, PID",
      "Thread: lightweight unit sharing process memory",
      "Context switching has CPU cost — too many threads hurt performance",
      "Goroutines (Go), async/await (Node) are user-space concurrency models",
      "Fork/exec model vs thread pool model",
    ],
    whyItMatters:
      "Concurrency bugs, connection pool sizing, and worker thread tuning all stem from how your runtime maps to OS threads.",
    reflectionQuestions: [
      "Why might a web server use a thread pool instead of one thread per request?",
      "What is a race condition and how do locks prevent it?",
    ],
  },
  {
    id: "os-scheduling-memory",
    title: "Scheduling & Virtual Memory",
    moduleId: "operating-systems",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "The OS scheduler decides which process runs. Virtual memory gives each process the illusion of contiguous memory while using physical RAM efficiently.",
    concepts: [
      "Preemptive scheduling: OS interrupts long-running processes",
      "Priority queues and CFS (Completely Fair Scheduler) in Linux",
      "Virtual memory: page tables map virtual → physical addresses",
      "Page faults trigger disk I/O — major performance hit",
      "Swap space extends RAM to disk when memory is exhausted",
    ],
    whyItMatters:
      "Memory leaks, OOM kills, and GC pauses are all visible through the lens of virtual memory and scheduling.",
    reflectionQuestions: [
      "What happens when a process exceeds its memory limit in a container?",
      "Why does swapping destroy database performance?",
    ],
  },
  {
    id: "os-io-sync",
    title: "I/O Models & Synchronization",
    moduleId: "operating-systems",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "Modern servers handle thousands of connections using epoll/kqueue/io_uring. Synchronization primitives coordinate access to shared state.",
    concepts: [
      "Blocking I/O: thread waits until data is ready",
      "Non-blocking I/O + event loop (epoll, kqueue)",
      "io_uring: Linux async I/O with reduced syscall overhead",
      "Locks: mutex, read-write lock, spinlock",
      "Lock-free structures and atomic operations for hot paths",
      "mmap: map files directly into memory address space",
    ],
    whyItMatters:
      "High-throughput servers (Nginx, Redis, Kafka) are built on efficient I/O models. Understanding them explains why certain architectures scale.",
    reflectionQuestions: [
      "Why does Redis use a single thread yet handle 100K+ ops/sec?",
      "When would you choose a spinlock over a mutex?",
    ],
  },

  // ─── Databases ───
  {
    id: "db-storage-engines",
    title: "B+ Trees & LSM Trees",
    moduleId: "databases",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "Storage engines organize data on disk. B+ trees (PostgreSQL, MySQL) optimize reads; LSM trees (RocksDB, Cassandra) optimize writes.",
    concepts: [
      "B+ tree: balanced tree, pages fit in memory, range queries efficient",
      "LSM tree: write to memtable, flush to sorted SSTables, periodic compaction",
      "Write amplification: LSM rewrites data during compaction",
      "Read amplification: LSM may check multiple SSTable levels",
      "WAL (Write-Ahead Log): durability before in-memory commit",
    ],
    whyItMatters:
      "Choosing between read-optimized and write-optimized storage engines is one of the most impactful database decisions you'll make.",
    reflectionQuestions: [
      "Why is Cassandra better suited for heavy write workloads?",
      "What is the trade-off of LSM compaction?",
    ],
  },
  {
    id: "db-transactions",
    title: "Transactions & Isolation Levels",
    moduleId: "databases",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "Transactions group operations into atomic units. Isolation levels control what concurrent transactions can see — trading consistency for performance.",
    concepts: [
      "ACID: Atomicity, Consistency, Isolation, Durability",
      "Read Uncommitted → Read Committed → Repeatable Read → Serializable",
      "Dirty read, non-repeatable read, phantom read anomalies",
      "MVCC: Multi-Version Concurrency Control (PostgreSQL approach)",
      "Optimistic vs pessimistic locking strategies",
    ],
    whyItMatters:
      "Payment systems, inventory management, and any shared mutable state require careful transaction design.",
    reflectionQuestions: [
      "What isolation level would you use for a bank transfer?",
      "How does MVCC allow reads without blocking writes?",
    ],
  },
  {
    id: "db-indexes-replication",
    title: "Indexes, Replication & Sharding",
    moduleId: "databases",
    phaseId: "foundations",
    durationMinutes: 15,
    summary:
      "Indexes accelerate queries. Replication provides availability and read scaling. Sharding partitions data across nodes for write scaling.",
    concepts: [
      "B-tree indexes, hash indexes, composite indexes, covering indexes",
      "Primary-replica replication: async vs sync trade-offs",
      "Leader-follower vs multi-leader vs leaderless replication",
      "Sharding keys determine data distribution — hot spots are dangerous",
      "Consistent hashing minimizes reshuffling when nodes are added",
    ],
    whyItMatters:
      "Scaling databases is often the hardest part of system design. These three mechanisms — indexes, replication, sharding — are your primary tools.",
    reflectionQuestions: [
      "What makes a bad shard key?",
      "When does async replication cause data loss?",
    ],
  },

  // ─── Scalability ───
  {
    id: "scale-vertical-horizontal",
    title: "Vertical vs Horizontal Scaling",
    moduleId: "scalability",
    phaseId: "fundamentals",
    durationMinutes: 10,
    summary:
      "Vertical scaling adds power to one machine. Horizontal scaling adds machines. Most production systems eventually need both — but horizontal is the path to massive scale.",
    concepts: [
      "Vertical scaling: bigger CPU/RAM/disk — simple but has limits",
      "Horizontal scaling: more nodes — requires load balancing and state management",
      "Stateless services scale horizontally easily",
      "Stateful services need replication, sharding, or external state stores",
      "Auto-scaling groups respond to traffic patterns dynamically",
    ],
    whyItMatters:
      "The first question in any design: can this component scale horizontally, or will it become a bottleneck?",
    reflectionQuestions: [
      "Why can't you vertically scale forever?",
      "What state must you externalize to scale a web app horizontally?",
    ],
  },
  {
    id: "scale-state-management",
    title: "Stateless Services & State Management",
    moduleId: "scalability",
    phaseId: "fundamentals",
    durationMinutes: 10,
    summary:
      "Stateless services can be added or removed freely. State must live in databases, caches, or distributed stores — never in application memory alone.",
    concepts: [
      "Session state → Redis or sticky sessions + DB",
      "Application state → externalized to databases and message queues",
      "Sticky sessions simplify state but reduce fault tolerance",
      "Shared-nothing architecture: each node is independent",
      "CAP theorem preview: partition tolerance is non-negotiable in distributed systems",
    ],
    whyItMatters:
      "Most scaling failures come from hidden state in application servers. Externalizing state early saves painful rewrites.",
    reflectionQuestions: [
      "Where should user session data live in a horizontally scaled app?",
      "What breaks if you kill a server with in-memory session state?",
    ],
  },

  // ─── Storage ───
  {
    id: "storage-types",
    title: "SQL, NoSQL & Specialized Storage",
    moduleId: "storage",
    phaseId: "fundamentals",
    durationMinutes: 15,
    summary:
      "Different data shapes need different storage. Relational for structured data, document for flexible schemas, time-series for metrics, object storage for blobs.",
    concepts: [
      "SQL (PostgreSQL, MySQL): ACID, joins, complex queries",
      "Document (MongoDB): flexible schema, nested documents",
      "Key-value (Redis, DynamoDB): fast lookups, simple access patterns",
      "Column-family (Cassandra): wide rows, write-heavy workloads",
      "Time-series (InfluxDB, QuestDB): optimized for timestamped data",
      "Object storage (S3): durable, cheap, eventually consistent",
    ],
    whyItMatters:
      "Polyglot persistence — using the right database for each job — is standard in modern architectures.",
    reflectionQuestions: [
      "When would you choose a document store over SQL?",
      "Why use object storage instead of a database for files?",
    ],
  },

  // ─── Caching ───
  {
    id: "cache-strategies",
    title: "Caching Strategies & Layers",
    moduleId: "caching",
    phaseId: "fundamentals",
    durationMinutes: 15,
    summary:
      "Caching trades freshness for speed at every layer — browser, CDN, application, and database.",
    concepts: [
      "Cache-aside: app checks cache, loads from DB on miss",
      "Write-through: write to cache and DB simultaneously",
      "Write-back: write to cache, async flush to DB",
      "Browser cache: Cache-Control, ETag, max-age headers",
      "CDN: edge caching for static assets and API responses",
      "Redis/Memcached: in-memory distributed cache for hot data",
      "Cache invalidation: the hardest problem in computer science",
    ],
    whyItMatters:
      "A well-designed cache can reduce database load by 10-100x. Poor cache design causes stale data bugs and thundering herds.",
    reflectionQuestions: [
      "What happens during a cache stampede when a popular key expires?",
      "When is write-through better than cache-aside?",
    ],
  },

  // ─── Messaging ───
  {
    id: "msg-queues-pubsub",
    title: "Queues, Pub/Sub & Event Streaming",
    moduleId: "messaging",
    phaseId: "fundamentals",
    durationMinutes: 15,
    summary:
      "Messaging decouples producers from consumers, enabling async processing, resilience, and event-driven architectures.",
    concepts: [
      "Point-to-point queues: one consumer per message (RabbitMQ, SQS)",
      "Pub/Sub: one message, many subscribers (Google Pub/Sub, SNS)",
      "Event streaming: durable log, replayable (Kafka, Pulsar)",
      "Dead Letter Queues: capture messages that fail repeatedly",
      "Retry policies: exponential backoff, max attempts, idempotency",
      "At-least-once vs exactly-once delivery semantics",
    ],
    whyItMatters:
      "Event-driven architectures depend on messaging. Understanding delivery guarantees prevents duplicate processing bugs.",
    reflectionQuestions: [
      "When would you choose Kafka over RabbitMQ?",
      "How do you handle a message that always fails processing?",
    ],
  },

  // ─── Distributed Systems ───
  {
    id: "dist-cap-consensus",
    title: "CAP, PACELC & Consensus",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    durationMinutes: 15,
    summary:
      "Distributed systems face unavoidable trade-offs. CAP and PACELC help you reason about consistency vs availability, and consensus algorithms keep replicas in agreement.",
    concepts: [
      "CAP: during a partition, choose Consistency or Availability",
      "PACELC: even without partition, Latency vs Consistency trade-off",
      "Strong consistency: all reads see latest write",
      "Eventual consistency: replicas converge over time",
      "Raft: understandable consensus — leader election + log replication",
      "Quorum: majority of nodes must agree for a write to commit",
    ],
    whyItMatters:
      "Every distributed database, cache, and coordination service makes CAP/PACELC trade-offs. You must choose consciously.",
    reflectionQuestions: [
      "Is Redis (single leader) CP or AP during a partition?",
      "Why does etcd use Raft for Kubernetes coordination?",
    ],
  },

  // ─── APIs ───
  {
    id: "api-styles",
    title: "REST, GraphQL, gRPC & Streaming",
    moduleId: "apis",
    phaseId: "fundamentals",
    durationMinutes: 10,
    summary:
      "API style affects client flexibility, performance, and team velocity. Each has strengths for different use cases.",
    concepts: [
      "REST: resource-oriented, HTTP verbs, cacheable, widely understood",
      "GraphQL: client-specified queries, single endpoint, avoids over-fetching",
      "gRPC: binary, typed, streaming — ideal for service-to-service",
      "Webhooks & SSE: server push for event notifications",
      "API versioning: URL path, header, or content negotiation",
    ],
    whyItMatters:
      "Public APIs often use REST or GraphQL; internal microservices increasingly use gRPC for performance.",
    reflectionQuestions: [
      "When does GraphQL's flexibility become a performance problem?",
      "Why do large companies use gRPC internally but REST externally?",
    ],
  },

  // ─── Reliability ───
  {
    id: "reliability-patterns",
    title: "Retries, Circuit Breakers & Backpressure",
    moduleId: "reliability",
    phaseId: "fundamentals",
    durationMinutes: 15,
    summary:
      "Production systems fail constantly. Reliability patterns prevent cascading failures and ensure graceful degradation.",
    concepts: [
      "Retries with exponential backoff and jitter",
      "Timeouts: always set them — unbounded waits kill systems",
      "Circuit breaker: stop calling a failing service (closed → open → half-open)",
      "Bulkheads: isolate failures to one pool of resources",
      "Rate limiting: protect services from overload (token bucket, sliding window)",
      "Backpressure: slow producers when consumers can't keep up",
      "Idempotency keys: safe retries for payment and order operations",
    ],
    whyItMatters:
      "Netflix's Hystrix, Google's SRE practices, and every resilient microservice use these patterns. They're non-negotiable for production.",
    reflectionQuestions: [
      "What happens if retries don't use jitter during an outage?",
      "How does a circuit breaker differ from a timeout?",
    ],
  },

  // ─── Security ───
  {
    id: "security-auth",
    title: "Authentication, Authorization & Encryption",
    moduleId: "security",
    phaseId: "fundamentals",
    durationMinutes: 15,
    summary:
      "Security is layered: authenticate users, authorize actions, encrypt data in transit and at rest, and manage secrets safely.",
    concepts: [
      "Authentication: OAuth 2.0, OpenID Connect, JWT tokens",
      "Authorization: RBAC (roles), ABAC (attributes), policy engines",
      "JWT structure: header.payload.signature — stateless but hard to revoke",
      "Encryption at rest (AES-256) and in transit (TLS)",
      "Secrets management: Vault, AWS Secrets Manager — never hardcode",
      "Principle of least privilege for service accounts",
    ],
    whyItMatters:
      "Security breaches often come from misconfigured auth, leaked secrets, or missing encryption — not exotic attacks.",
    reflectionQuestions: [
      "Why is JWT revocation difficult compared to server-side sessions?",
      "Where should API keys be stored in a production deployment?",
    ],
  },

  // ─── Architecture Patterns ───
  {
    id: "arch-monolith-micro",
    title: "Monolith to Microservices",
    moduleId: "architecture-patterns",
    phaseId: "architecture",
    durationMinutes: 15,
    summary:
      "Start simple with a monolith. Extract microservices when team size, deployment independence, or scaling needs justify the complexity.",
    concepts: [
      "Monolith: single deployable unit — simple to develop and debug",
      "Modular monolith: logical boundaries without network overhead",
      "Microservices: independent deploy, scale, and fail",
      "Event-driven: services communicate via events, loose coupling",
      "CQRS: separate read and write models for different optimization",
      "Event sourcing: store state changes as immutable events",
      "Serverless: functions as a service, pay per invocation",
    ],
    whyItMatters:
      "Premature microservices are a leading cause of engineering slowdown. Know when each pattern earns its complexity cost.",
    reflectionQuestions: [
      "What signals tell you it's time to split a monolith?",
      "When is event sourcing overkill?",
    ],
  },
  {
    id: "arch-clean-ddd",
    title: "Clean Architecture & DDD",
    moduleId: "architecture-patterns",
    phaseId: "architecture",
    durationMinutes: 10,
    summary:
      "Clean Architecture and Domain-Driven Design organize code around business domains, keeping core logic independent of frameworks.",
    concepts: [
      "Hexagonal (Ports & Adapters): core domain isolated from I/O",
      "Clean Architecture: dependencies point inward toward domain",
      "DDD: bounded contexts, aggregates, entities, value objects",
      "Ubiquitous language: code reflects business terminology",
      "Anti-corruption layer: protect domain from external model leaks",
    ],
    whyItMatters:
      "Well-structured codebases survive framework changes and team growth. These patterns pay off over years, not weeks.",
    reflectionQuestions: [
      "What is a bounded context in your current project?",
      "How does hexagonal architecture help with testing?",
    ],
  },

  // ─── Infrastructure ───
  {
    id: "infra-containers-k8s",
    title: "Docker, Kubernetes & Service Mesh",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    durationMinutes: 15,
    summary:
      "Containers package applications consistently. Kubernetes orchestrates them at scale. Service meshes handle inter-service communication.",
    concepts: [
      "Docker: image layers, Dockerfile, container vs VM isolation",
      "Kubernetes: pods, deployments, services, ingress, ConfigMaps",
      "Horizontal Pod Autoscaler scales based on CPU/memory/custom metrics",
      "Service mesh (Istio, Linkerd): mTLS, traffic routing, observability",
      "Infrastructure as Code: Terraform, Pulumi — reproducible environments",
    ],
    whyItMatters:
      "Most modern deployments run on Kubernetes. Understanding pods, services, and ingress is essential for any backend engineer.",
    reflectionQuestions: [
      "What problem does a service mesh solve that Kubernetes doesn't?",
      "Why use IaC instead of manual cloud console configuration?",
    ],
  },
  {
    id: "infra-cicd-observability",
    title: "CI/CD & Observability",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    durationMinutes: 15,
    summary:
      "CI/CD automates build, test, and deploy. Observability (metrics, logs, traces) tells you what's happening in production.",
    concepts: [
      "CI pipeline: lint → test → build → artifact",
      "CD: staging → canary → production with rollback",
      "Metrics: RED (Rate, Errors, Duration) and USE (Utilization, Saturation, Errors)",
      "Structured logging with correlation IDs across services",
      "Distributed tracing: Jaeger, Zipkin, OpenTelemetry spans",
      "Alerting: alert on symptoms (error rate), not causes (CPU)",
    ],
    whyItMatters:
      "You can't improve what you can't measure. Observability is how you close the design → build → measure → iterate loop.",
    reflectionQuestions: [
      "What's the difference between monitoring and observability?",
      "Why alert on p99 latency instead of average latency?",
    ],
  },

  // ─── Design Patterns ───
  {
    id: "patterns-core",
    title: "Essential Design Patterns",
    moduleId: "software-patterns",
    phaseId: "design-patterns",
    durationMinutes: 15,
    summary:
      "These patterns appear everywhere in production code — repositories, factories, strategies, and observers shape how you structure services.",
    concepts: [
      "Repository: abstract data access behind an interface",
      "Unit of Work: batch changes into a single transaction",
      "Factory/Builder: control object creation complexity",
      "Strategy: swap algorithms at runtime (payment providers, sorting)",
      "Observer: publish events to subscribers (domain events)",
      "Command: encapsulate requests as objects (undo, queue, logging)",
      "Adapter/Proxy/Decorator: wrap and extend behavior",
    ],
    whyItMatters:
      "Recognizing patterns in existing code accelerates onboarding. Applying them judiciously keeps services maintainable.",
    reflectionQuestions: [
      "Where have you seen the Strategy pattern in a codebase?",
      "When does the Repository pattern become unnecessary overhead?",
    ],
  },

  // ─── Internal Designs ───
  {
    id: "internals-redis-postgres",
    title: "Redis & PostgreSQL Internals",
    moduleId: "system-internals",
    phaseId: "internal-designs",
    durationMinutes: 15,
    summary:
      "Redis is a single-threaded in-memory data structure server. PostgreSQL is a full-featured relational engine with MVCC and extensible query planner.",
    concepts: [
      "Redis: dict + SDS strings, skip lists, intset, ziplist encodings",
      "Redis persistence: RDB snapshots + AOF append-only log",
      "PostgreSQL: heap files, B-tree indexes, query planner cost model",
      "PostgreSQL MVCC: xmin/xmax tuple versioning, vacuum",
      "WAL in PostgreSQL ensures durability before commit acknowledgment",
    ],
    whyItMatters:
      "Reading internals teaches you what 'fast' and 'durable' actually cost — invaluable when choosing and tuning data stores.",
    reflectionQuestions: [
      "Why is Redis single-threaded yet so fast?",
      "What does PostgreSQL VACUUM do and why is it needed?",
    ],
  },
  {
    id: "internals-kafka-nginx",
    title: "Kafka & Nginx Internals",
    moduleId: "system-internals",
    phaseId: "internal-designs",
    durationMinutes: 15,
    summary:
      "Kafka is a distributed commit log. Nginx is an event-driven reverse proxy handling millions of concurrent connections.",
    concepts: [
      "Kafka: partitions, offsets, consumer groups, ISR (in-sync replicas)",
      "Kafka log segments: sequential disk writes, zero-copy transfer",
      "Nginx: master + worker processes, epoll event loop",
      "Nginx: upstream load balancing, caching, SSL termination",
      "Zero-copy sendfile: data goes disk → socket without user-space copy",
    ],
    whyItMatters:
      "These systems are reference implementations of high-throughput design. Studying them builds engineering intuition.",
    reflectionQuestions: [
      "Why does Kafka use sequential writes instead of random I/O?",
      "How does Nginx handle 10K+ concurrent connections on one machine?",
    ],
  },

  // ─── Design Framework ───
  {
    id: "framework-requirements",
    title: "Requirements & Capacity Estimation",
    moduleId: "design-framework",
    phaseId: "designer-mindset",
    durationMinutes: 15,
    summary:
      "Every design starts with clear requirements and back-of-envelope math. Capacity estimation prevents over-engineering and reveals bottlenecks early.",
    concepts: [
      "Functional requirements: what the system must do",
      "Non-functional requirements: latency, availability, consistency, cost",
      "DAU → QPS: daily active users × actions / 86400 seconds",
      "Storage estimation: records × size × retention period",
      "Bandwidth: QPS × average payload size",
      "The 80/20 rule: optimize for the common case first",
    ],
    whyItMatters:
      "Interviewers and architects alike expect you to quantify assumptions. Vague designs fail under real load.",
    reflectionQuestions: [
      "Estimate QPS for 10M DAU each performing 20 actions/day.",
      "Which non-functional requirement would you prioritize for a payment system?",
    ],
  },
  {
    id: "framework-architecture",
    title: "Architecture, Failures & Trade-offs",
    moduleId: "design-framework",
    phaseId: "designer-mindset",
    durationMinutes: 15,
    summary:
      "Draw the boxes and arrows, then stress-test the design. Every choice has trade-offs — articulate them explicitly.",
    concepts: [
      "High-level diagram: clients → LB → services → data stores",
      "Data model: entities, relationships, access patterns drive schema",
      "API design: endpoints, request/response shapes, error handling",
      "Failure scenarios: node crash, network partition, dependency timeout",
      "Scaling strategy: what to scale first when load increases",
      "Monitoring: what metrics prove the system is healthy",
      "Trade-off documentation: why you chose X over Y",
    ],
    whyItMatters:
      "Senior engineers are valued for articulating trade-offs, not for picking the 'perfect' architecture — because it doesn't exist.",
    reflectionQuestions: [
      "What single component failure would take down your last design?",
      "Write three trade-offs you made and why.",
    ],
  },
  {
    id: "framework-iteration",
    title: "The Design → Build → Measure Loop",
    moduleId: "design-framework",
    phaseId: "designer-mindset",
    durationMinutes: 10,
    summary:
      "The most effective learning cycle: design a system, build a working version, load test it, add observability, and iterate based on data.",
    concepts: [
      "1. Learn one core concept (e.g., caching)",
      "2. Design a small system that requires it",
      "3. Implement a working version",
      "4. Load test to find bottlenecks",
      "5. Add metrics, logs, and tracing",
      "6. Improve based on measurements",
      "7. Compare with how large-scale systems solve the same problem",
    ],
    whyItMatters:
      "This loop develops engineering intuition far more effectively than studying architectures in isolation.",
    reflectionQuestions: [
      "What system could you build this week to practice caching?",
      "What metric would tell you your design is working?",
    ],
  },
];
