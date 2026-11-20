import type { DesignChallenge, GlobalResource } from "@/types";

export const designChallenges: DesignChallenge[] = [
  // Beginner
  {
    id: "url-shortener",
    title: "URL Shortener",
    difficulty: "beginner",
    description:
      "Design a service like bit.ly that takes long URLs and returns short, unique links that redirect to the original.",
    hints: [
      "Estimate: 100M URLs/month, 100:1 read-to-write ratio",
      "Use base62 encoding for short codes",
      "Cache popular redirects in Redis",
    ],
    checklist: [
      "Functional requirements defined",
      "Capacity estimation (QPS, storage)",
      "API design (create, redirect)",
      "Database schema and ID generation strategy",
      "Caching layer for hot URLs",
      "Analytics tracking approach",
    ],
    estimatedMinutes: 30,
  },
  {
    id: "pastebin",
    title: "Pastebin",
    difficulty: "beginner",
    description:
      "Design a text sharing service where users paste content and get a unique URL to share.",
    hints: [
      "Content can be large — consider object storage",
      "Expiration policies for old pastes",
      "Rate limit creation to prevent abuse",
    ],
    checklist: [
      "Max paste size and expiration policy",
      "Storage strategy for text content",
      "Unique key generation",
      "Read-heavy optimization",
      "Privacy and access control options",
    ],
    estimatedMinutes: 25,
  },
  {
    id: "rate-limiter",
    title: "Rate Limiter",
    difficulty: "beginner",
    description:
      "Design a distributed rate limiter that restricts API calls per user/IP to N requests per minute.",
    hints: [
      "Token bucket or sliding window algorithms",
      "Redis for distributed counter state",
      "Return 429 with Retry-After header",
    ],
    checklist: [
      "Rate limiting algorithm chosen",
      "Distributed state management",
      "Per-user vs per-IP vs per-API-key",
      "Handling burst traffic",
      "Response headers (X-RateLimit-Remaining)",
    ],
    estimatedMinutes: 20,
  },
  {
    id: "notification-service",
    title: "Notification Service",
    difficulty: "beginner",
    description:
      "Design a service that sends push notifications, emails, and SMS to users based on events.",
    hints: [
      "Queue-based async processing for each channel",
      "Template engine for message content",
      "User preference management (opt-out)",
    ],
    checklist: [
      "Multi-channel delivery architecture",
      "Message queue per channel or unified?",
      "Retry and dead letter handling",
      "User preference storage",
      "Delivery status tracking",
    ],
    estimatedMinutes: 30,
  },

  // Intermediate
  {
    id: "distributed-cache",
    title: "Distributed Cache",
    difficulty: "intermediate",
    description:
      "Design a distributed in-memory cache like Redis Cluster with consistent hashing and replication.",
    hints: [
      "Consistent hashing with virtual nodes",
      "Replication factor of 2-3 for availability",
      "Cache eviction: LRU or LFU",
    ],
    checklist: [
      "Sharding and consistent hashing strategy",
      "Replication and failover",
      "Cache eviction policy",
      "Cache invalidation approach",
      "Handling node additions/removals",
    ],
    estimatedMinutes: 45,
  },
  {
    id: "search-engine",
    title: "Search Engine",
    difficulty: "intermediate",
    description:
      "Design a web search engine that crawls, indexes, and ranks pages for user queries.",
    hints: [
      "Inverted index for term → document mapping",
      "MapReduce or streaming for index building",
      "PageRank or similar for ranking",
    ],
    checklist: [
      "Crawling strategy and politeness",
      "Inverted index design",
      "Query processing pipeline",
      "Ranking algorithm",
      "Handling billions of documents",
    ],
    estimatedMinutes: 60,
  },
  {
    id: "job-scheduler",
    title: "Distributed Job Scheduler",
    difficulty: "intermediate",
    description:
      "Design a system that schedules and executes millions of recurring and one-time jobs reliably.",
    hints: [
      "Time-wheel or priority queue for scheduling",
      "Leader election for scheduler coordination",
      "At-least-once execution with idempotency",
    ],
    checklist: [
      "Job storage and scheduling algorithm",
      "Worker pool management",
      "Failure recovery and retry",
      "Exactly-once vs at-least-once semantics",
      "Monitoring job execution status",
    ],
    estimatedMinutes: 45,
  },
  {
    id: "catalog-search",
    title: "Marketplace Catalog Search",
    difficulty: "intermediate",
    description:
      "Design a search service for a frequently updated catalog with typo tolerance, filters, relevance ranking, and a measurable freshness target.",
    hints: [
      "Treat the search index as a rebuildable projection of the source of truth",
      "Use a change stream or outbox to keep the index current",
      "Build and validate a replacement index before switching production traffic",
    ],
    checklist: [
      "Searchable fields, analyzers, and query types defined",
      "Index freshness objective and update pipeline",
      "Ranking evaluation with representative queries",
      "Tenant and authorization filters enforced",
      "Versioned reindexing and rollback plan",
      "Query complexity and shard fan-out bounded",
    ],
    estimatedMinutes: 45,
  },

  // Advanced
  {
    id: "chat-system",
    title: "Real-time Chat (WhatsApp/Slack)",
    difficulty: "advanced",
    description:
      "Design a messaging platform supporting 1:1 and group chats with real-time delivery and offline sync.",
    hints: [
      "WebSockets for real-time, push notifications for offline",
      "Message ordering within a conversation",
      "Fan-out on write vs fan-out on read for groups",
    ],
    checklist: [
      "Real-time delivery mechanism",
      "Message storage and sync protocol",
      "Group chat fan-out strategy",
      "Online/offline presence",
      "End-to-end encryption considerations",
      "Media message handling",
    ],
    estimatedMinutes: 60,
  },
  {
    id: "video-streaming",
    title: "Video Streaming (YouTube/Netflix)",
    difficulty: "advanced",
    description:
      "Design a video upload, transcoding, and streaming platform serving millions of concurrent viewers.",
    hints: [
      "CDN for video delivery, adaptive bitrate streaming",
      "Transcoding pipeline with job queues",
      "Separate metadata DB from blob storage",
    ],
    checklist: [
      "Upload and transcoding pipeline",
      "Storage strategy (original + encoded variants)",
      "CDN and adaptive streaming (HLS/DASH)",
      "Recommendation system integration",
      "View count and analytics at scale",
    ],
    estimatedMinutes: 60,
  },
  {
    id: "ride-sharing",
    title: "Ride Sharing (Uber)",
    difficulty: "advanced",
    description:
      "Design a ride-sharing platform matching riders with nearby drivers in real time.",
    hints: [
      "Geospatial indexing (QuadTree, Geohash, S2)",
      "WebSocket for driver location updates",
      "Surge pricing based on supply/demand",
    ],
    checklist: [
      "Driver location tracking and indexing",
      "Matching algorithm (nearest available driver)",
      "Trip lifecycle state machine",
      "Payment processing integration",
      "Surge pricing mechanism",
      "ETA calculation",
    ],
    estimatedMinutes: 60,
  },
  {
    id: "multi-region-subscriptions",
    title: "Multi-Region Subscription Service",
    difficulty: "advanced",
    description:
      "Design a subscription platform that serves global reads and recovers from a regional outage without allowing conflicting billing writes.",
    hints: [
      "Set explicit RTO and RPO before choosing replication topology",
      "Separate read locality from write ownership",
      "Fence the old writer before promoting a standby",
    ],
    checklist: [
      "Recovery objectives by critical workflow",
      "Active-passive or active-active topology justified",
      "Replication lag and write ownership handled",
      "Failover and failback runbooks",
      "Isolated backups and measured restore test",
      "Surviving-region capacity validated",
    ],
    estimatedMinutes: 60,
  },
  {
    id: "multi-tenant-saas",
    title: "Multi-Tenant Analytics SaaS",
    difficulty: "advanced",
    description:
      "Design an analytics product where many customers share infrastructure while maintaining tenant isolation, fair resource use, and an option for dedicated storage.",
    hints: [
      "Derive tenant identity from trusted authentication context",
      "Apply isolation consistently to jobs, search, caches, and storage",
      "Use a placement directory if some tenants need dedicated infrastructure",
    ],
    checklist: [
      "Tenant identity and authorization boundary",
      "Shared versus dedicated data isolation model",
      "Tenant-aware quotas and fair scheduling",
      "Background job and cache isolation",
      "Tenant migration and deletion workflow",
      "Cross-tenant access tests and audit trail",
    ],
    estimatedMinutes: 60,
  },
  {
    id: "durable-invoice-workflow",
    title: "Durable Invoice Workflow",
    difficulty: "advanced",
    description:
      "Design a month-end invoice pipeline that processes millions of accounts, survives worker crashes, and never silently skips or duplicates an invoice.",
    hints: [
      "Persist per-account workflow progress",
      "Use stable idempotency keys for invoice creation and notifications",
      "Monitor queue age and downstream capacity, not only queue depth",
    ],
    checklist: [
      "Durable run and per-account job model",
      "Idempotent steps and duplicate delivery handling",
      "Retry, deadline, and dead-letter policy",
      "Resume and manual repair workflow",
      "Downstream-aware worker scaling",
      "Auditability and customer-visible status",
    ],
    estimatedMinutes: 60,
  },

  // Expert
  {
    id: "distributed-db",
    title: "Distributed Database",
    difficulty: "expert",
    description:
      "Design a distributed SQL database with automatic sharding, replication, and cross-shard queries.",
    hints: [
      "Shard by tenant or hash of primary key",
      "Two-phase commit or Sagas for cross-shard transactions",
      "Raft for shard leader election",
    ],
    checklist: [
      "Sharding strategy and rebalancing",
      "Replication and consistency model",
      "Cross-shard query and transaction handling",
      "Query planner and optimizer",
      "Failure detection and recovery",
    ],
    estimatedMinutes: 90,
  },
  {
    id: "distributed-fs",
    title: "Distributed Filesystem",
    difficulty: "expert",
    description:
      "Design a distributed filesystem like Google File System or HDFS for storing petabytes across commodity hardware.",
    hints: [
      "Metadata server separate from data nodes",
      "Chunk replication (default 3x)",
      "Append-only writes for efficiency",
    ],
    checklist: [
      "Metadata management (namespace, file-to-chunk mapping)",
      "Chunk storage and replication",
      "Consistency model for concurrent writers",
      "Failure recovery and re-replication",
      "Client read/write protocol",
    ],
    estimatedMinutes: 90,
  },
];

export const globalResources: GlobalResource[] = [
  {
    title: "Designing Data-Intensive Applications",
    type: "book",
    note: "The single most important book for system design. Read it cover to cover.",
  },
  {
    title: "System Design Interview – An Insider's Guide",
    type: "book",
    note: "Practical interview-focused designs with clear diagrams.",
  },
  {
    title: "Database Internals",
    type: "book",
    note: "Deep dive into storage engines and distributed database architecture.",
  },
  {
    title: "Building Microservices",
    type: "book",
    note: "Sam Newman's guide to microservice architecture decisions.",
  },
  {
    title: "Site Reliability Engineering",
    type: "book",
    note: "Google's SRE practices — reliability as an engineering discipline.",
  },
  {
    title: "Release It!",
    type: "book",
    note: "Production-ready patterns: circuit breakers, bulkheads, stability.",
  },
  {
    title: "Netflix Engineering Blog",
    type: "blog",
    url: "https://netflixtechblog.com",
  },
  {
    title: "Uber Engineering Blog",
    type: "blog",
    url: "https://eng.uber.com",
  },
  {
    title: "Cloudflare Blog",
    type: "blog",
    url: "https://blog.cloudflare.com",
  },
  {
    title: "Stripe Engineering Blog",
    type: "blog",
    url: "https://stripe.com/blog/engineering",
  },
  {
    title: "Redis",
    type: "opensource",
    url: "https://github.com/redis/redis",
    note: "In-memory data structure store — study the single-threaded event model.",
  },
  {
    title: "Apache Kafka",
    type: "opensource",
    url: "https://github.com/apache/kafka",
    note: "Distributed commit log — study partition and consumer group design.",
  },
  {
    title: "PostgreSQL",
    type: "opensource",
    url: "https://github.com/postgres/postgres",
    note: "Full-featured RDBMS — study MVCC, query planner, and WAL.",
  },
  {
    title: "etcd",
    type: "opensource",
    url: "https://github.com/etcd-io/etcd",
    note: "Distributed key-value store using Raft — powers Kubernetes.",
  },
];
