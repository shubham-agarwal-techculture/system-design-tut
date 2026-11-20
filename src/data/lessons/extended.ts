import { lesson } from "./helpers";

export const extendedLessons = [
  lesson({
    id: "dist-partitioning-hashing",
    title: "Partitioning, Sharding & Consistent Hashing",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    durationMinutes: 38,
    summary:
      "Partitioning divides a dataset so storage and request load can grow across nodes. A good partition key distributes work, keeps common queries local, and can be changed without destabilizing the whole fleet. This guide compares common partition schemes, consistent hashing, hot-key defenses, and the operational cost of rebalancing.",
    sections: [
      {
        title: "Partitioning starts with access patterns",
        paragraphs: [
          "A partition (or shard) owns a subset of records and usually handles reads and writes for those records. Partitioning increases aggregate capacity only when requests and storage are spread across partitions; it does not make one expensive query cheaper if that query still scans every shard.",
          "Choose a key by examining the dominant reads, writes, ordering needs, and tenant boundaries. A user ID can keep a user's records together, while a time key can make range scans efficient. The same choices can create hot partitions: one popular user or the current time bucket may receive far more traffic than the rest.",
        ],
        bullets: [
          "Range partitioning preserves key order and helps range scans, but adjacent writes can concentrate on the newest range.",
          "Hash partitioning spreads keys more evenly, but loses natural ordering and can require scatter-gather queries.",
          "Directory-based partitioning makes placement flexible, at the cost of a lookup service and another consistency boundary.",
        ],
      },
      {
        title: "Consistent hashing and placement",
        paragraphs: [
          "In a basic hash ring, both keys and nodes map to positions on a circular hash space; a key belongs to the next node clockwise. Adding or removing one node moves only the keys between affected ring positions rather than remapping almost every key as modulo-N hashing would.",
          "Virtual nodes assign each physical host multiple ring positions, reducing imbalance when the fleet is small or hardware differs. A production design still needs explicit replication, membership changes, and a way to move data safely: the ring chooses placement, but does not itself copy data, elect leaders, or guarantee availability.",
        ],
      },
      {
        title: "Rebalancing without surprising the system",
        paragraphs: [
          "Rebalancing consumes network, disk, and CPU while serving normal traffic. Move data in bounded batches, throttle background transfer, verify checksums or record counts, and switch reads only after the destination is ready. Keep a rollback path until the new placement is proven.",
          "A shard map is part of the serving path. Version it, distribute updates safely, and make clients handle stale maps with bounded retries or redirects. For large systems, split logical partitions independently of physical hosts so partitions can move gradually as capacity changes.",
        ],
      },
      {
        title: "Hot keys, skew, and query locality",
        paragraphs: [
          "A mathematically even hash distribution does not guarantee even workload: a celebrity account, viral post, or tenant-wide report can dominate one key. Replicate read-heavy immutable data, add a controlled salt to split hot writes, or isolate large tenants; each technique changes read fan-out or application semantics.",
          "Track per-partition request rate, bytes, latency, storage, and queue depth rather than relying on fleet averages. Before adding shards, check whether indexes, query shape, caching, batching, or vertical capacity solve the actual bottleneck with less operational complexity.",
        ],
      },
    ],
    concepts: [
      "Partition key: determines data placement and often query locality",
      "Range, hash, and directory-based partitioning",
      "Consistent hashing limits remapping during membership changes",
      "Virtual nodes smooth placement across physical hosts",
      "Hot partitions and skew can dominate otherwise balanced fleets",
      "Rebalancing is a throttled data migration, not merely a hash calculation",
    ],
    practices: [
      "Choose and test partition keys against real query and write distributions",
      "Keep logical partitions independently movable between physical hosts",
      "Measure per-partition skew and headroom before capacity is exhausted",
      "Throttle, verify, and make partition movement resumable",
      "Document cross-partition query and transaction behavior as an explicit API constraint",
    ],
    pitfalls: [
      "Assuming a hash function alone solves replication, failover, or data migration",
      "Using a monotonically increasing key that directs all new writes to one range",
      "Ignoring tenant or celebrity hotspots because average shard utilization looks healthy",
      "Rebalancing at full speed and competing with foreground requests for disk and network",
    ],
    examples: [
      {
        title: "Tenant-partitioned SaaS events",
        description:
          "A product stores events by tenant ID to make tenant exports local and access checks straightforward. A few exceptionally large tenants are split into sub-partitions, while a routing directory maps each tenant to its current placement.",
      },
    ],
    caseStudies: [
      {
        title: "Rebalancing a growing activity feed",
        context:
          "A social product stores posts and feed material for tens of millions of accounts. Storage is growing steadily, and a small set of highly active accounts produces a disproportionate share of writes and reads.",
        constraints:
          "The feed API must remain available during migration. User timelines need chronological reads, and a single user's recent activity should not require contacting every shard.",
        design:
          "Partition feed rows by account ID and time bucket, with a directory mapping accounts to logical partitions. Keep logical partitions smaller than physical hosts, replicate popular read-only profile data, and split oversized accounts into a bounded number of write lanes that are merged by timestamp on reads.",
        tradeoffs:
          "Account locality makes common reads simple, but exceptionally active accounts need a special path. The directory adds operational state; time buckets bound scans but require a retention and archival policy.",
        failureModes:
          "A hot account can overload its write lane; a stale directory can route requests to a moved partition; an aggressive split can create too many tiny partitions. Monitor partition-level load and retain the prior mapping until verification completes.",
        outcome:
          "Capacity grows incrementally without forcing all users onto a global scatter-gather path. The design accepts targeted complexity for hot accounts instead of penalizing every request.",
      },
    ],
    keyTakeaways: [
      "Partition for the dominant access patterns; placement and query design are coupled",
      "Consistent hashing reduces key movement but does not perform replication or migration",
      "Average balance can hide hot keys and large-tenant skew",
      "Rebalancing needs throttling, verification, observability, and rollback",
      "Prefer the simplest storage layout that meets measured capacity and availability needs",
    ],
    whyItMatters:
      "Partitioning is one of the hardest choices to reverse after data and clients depend on it. Thinking about placement, hot keys, and movement together helps avoid shard designs that scale storage while making every useful query more expensive.",
    reflectionQuestions: [
      "Which query would become cross-partition if you chose a hash of the primary key?",
      "How would you detect and relieve a hot key without changing the meaning of the data?",
      "What must be true before a shard-map update is safe to roll back?",
    ],
    resources: [
      "Designing Data-Intensive Applications — partitioning and replication",
      "Database Internals — distributed storage and partitioning",
    ],
  }),

  lesson({
    id: "dist-transactions-outbox-saga",
    title: "Distributed Transactions, Sagas & the Outbox",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    durationMinutes: 40,
    summary:
      "A business workflow can span databases and services even though a single ACID transaction cannot. This guide separates local atomicity from cross-service coordination, then develops practical patterns—transactional outbox, idempotent consumers, sagas, and compensation—without pretending that retries create exactly-once execution.",
    sections: [
      {
        title: "Keep local transactions local",
        paragraphs: [
          "A database transaction can atomically update records owned by that database. Once a workflow calls another service or publishes to a broker, there is no shared transaction by default. A process can crash after one side effect succeeds and before it records that success, leaving the caller uncertain about what happened.",
          "Two-phase commit coordinates participants through prepare and commit phases, but participants and a coordinator must support the protocol. It can hold resources while waiting and makes availability dependent on coordination. It is appropriate in some controlled environments, but is not a generic feature that can be layered over arbitrary HTTP services.",
        ],
      },
      {
        title: "The transactional outbox",
        paragraphs: [
          "The outbox solves the dual-write gap between a database update and message publication. In one local transaction, write business state and an event row to an outbox table. A relay later publishes pending rows; consumers process the event and acknowledge or deduplicate it.",
          "The relay may publish more than once if it crashes after publishing but before marking a row delivered. Give events stable IDs and make consumers idempotent. Monitor outbox age and backlog, define retention and cleanup, and decide how schema versions remain readable during rolling deployments.",
        ],
      },
      {
        title: "Sagas and compensation",
        paragraphs: [
          "A saga is a sequence of local transactions where each committed step has a compensating action if a later step cannot proceed. An order workflow may reserve stock, authorize payment, and schedule shipment; cancellation can release stock and void the authorization. Compensation is a new business action, not a time machine that erases history.",
          "An orchestrator centralizes progress and decisions, which can make audits and timeouts easier to follow. Choreography lets services react to events with less central coupling, but ownership and end-to-end status can become hard to see. In either model, persist workflow state, use deadlines, and define what happens when compensation also fails.",
        ],
      },
      {
        title: "Retries, deduplication, and reconciliation",
        paragraphs: [
          "At-least-once delivery is often the useful contract: a message is retried until accepted, so consumers must tolerate duplicates. An idempotency key identifies the logical request; persist its result and scope it to the caller and operation. Deduplication records need a retention period that covers realistic retry and replay windows.",
          "Some outcomes remain uncertain—for example, a payment provider times out after charging a card. Do not blindly repeat an irreversible operation. Query the provider using a stable idempotency key, reconcile provider records against local state, and expose an explicit pending or unknown state until the outcome is resolved.",
        ],
      },
    ],
    concepts: [
      "Local ACID transaction versus cross-service workflow",
      "Transactional outbox closes the database-to-broker dual-write gap",
      "At-least-once delivery requires idempotent consumers",
      "Saga steps commit locally and use compensating business actions",
      "Orchestration and choreography trade centralized visibility for coupling",
      "Reconciliation resolves outcomes that remain uncertain after timeouts",
    ],
    practices: [
      "Persist business state and its outbox event in the same database transaction",
      "Give each command and event a stable ID and enforce idempotency at the receiver",
      "Model workflow state transitions, deadlines, retries, and compensation explicitly",
      "Use reconciliation for external side effects that cannot be reliably queried inline",
      "Keep event schemas versioned and compatible with rolling deployments",
    ],
    pitfalls: [
      "Claiming exactly-once side effects when the receiver cannot participate in the transaction",
      "Publishing to a broker before committing the database and losing one side on a crash",
      "Treating compensation as a guaranteed inverse for an irreversible action",
      "Retrying a timed-out payment with a new idempotency key",
      "Letting outbox backlog or stuck sagas grow without age-based alerts",
    ],
    examples: [
      {
        title: "Inventory reservation event",
        description:
          "An order transaction reserves stock and writes InventoryReserved to its outbox. A relay publishes it, and the fulfillment consumer stores the event ID with its local update so replaying the message does not create a second shipment.",
      },
    ],
    caseStudies: [
      {
        title: "Checkout across inventory and payments",
        context:
          "An online store must reserve items, collect payment, and arrange shipment across independently owned services. Traffic spikes create timeouts, and customers can retry checkout while the original request is still in flight.",
        constraints:
          "Inventory cannot be oversold, payment attempts must not be duplicated, and the customer needs a stable order status even when a provider response is delayed.",
        design:
          "Create the order and an outbox command in one transaction. A durable workflow reserves inventory, authorizes payment with a stable provider idempotency key, then requests fulfillment. Persist each step and use a deadline; if authorization fails, release the reservation. A reconciliation worker queries uncertain provider outcomes before retrying.",
        tradeoffs:
          "The workflow is eventually consistent and requires explicit pending states. The outbox and workflow store add operational components, but preserve auditability and let each service own its local data.",
        failureModes:
          "Duplicate messages are deduplicated by event ID; a stuck reservation expires or is compensated; a provider timeout is reconciled instead of charged again. Compensation failures create an operator-visible task with safe retry controls.",
        outcome:
          "Customers see a durable order lifecycle rather than a misleading all-or-nothing response. The system favors correctness and recoverability over pretending distributed work completes synchronously.",
      },
    ],
    keyTakeaways: [
      "Atomicity stops at the boundary of the database or protocol that provides it",
      "The outbox makes state change and event intent atomic, not delivery exactly once",
      "Idempotency is required wherever retries can repeat side effects",
      "Sagas need durable state, bounded timeouts, and meaningful compensations",
      "Reconciliation is a first-class path for ambiguous external outcomes",
    ],
    whyItMatters:
      "Distributed workflows fail at the seams between systems, especially during timeouts and process crashes. Making those seams explicit turns invisible partial failure into state that can be retried, compensated, audited, and repaired.",
    reflectionQuestions: [
      "At which exact point can your workflow crash after a side effect but before recording success?",
      "Which operations have true compensations, and which require manual or forward recovery?",
      "How long must an idempotency record live to cover retries, delayed messages, and replay?",
    ],
    resources: [
      "Designing Data-Intensive Applications — transactions and stream processing",
      "microservices.io — Transactional Outbox and Saga patterns",
    ],
  }),

  lesson({
    id: "storage-search-indexing",
    title: "Search Systems & Indexing",
    moduleId: "storage",
    phaseId: "fundamentals",
    durationMinutes: 36,
    summary:
      "Search is a pipeline, not just a database query: documents are ingested, analyzed, indexed, ranked, and returned under a latency budget. This guide explains inverted indexes, text analysis, relevance, update consistency, and the operational trade-offs between a search index and the system of record.",
    sections: [
      {
        title: "From documents to an inverted index",
        paragraphs: [
          "A relational index maps ordered values to rows; a full-text inverted index maps analyzed terms to the documents containing them. During indexing, a tokenizer splits text, normalization folds selected differences, and postings record document IDs plus optional positions, frequencies, or field information.",
          "At query time, the engine analyzes the request, retrieves postings for terms, combines them, applies filters, and ranks candidates. Prefix, fuzzy, phrase, and autocomplete queries use different structures and have different costs. Search behavior therefore depends on analyzer choices as much as on the storage engine.",
        ],
        bullets: [
          "Tokenization and language analyzers determine which terms can match.",
          "An inverted index makes term lookup efficient but consumes extra storage.",
          "Filters, facets, and sorting may need dedicated indexed fields.",
        ],
      },
      {
        title: "Relevance and query budgets",
        paragraphs: [
          "A ranking function estimates which results best answer the query; term frequency, document frequency, field boosts, freshness, and business rules are common signals. Tune relevance with representative queries and judged results rather than choosing weights based on a handful of examples.",
          "A broad query across many shards can be expensive even if each shard is fast. Set limits for query complexity, result window, timeout, and response size. Apply authorization and tenant filters in the search request itself, and validate that ranking or aggregations cannot reveal restricted records.",
        ],
      },
      {
        title: "Index freshness and the source of truth",
        paragraphs: [
          "Most search indexes are derived projections, not the authoritative record. Changes arrive through a batch build, change-data capture, or event stream, so the index may lag the source. Define a freshness objective and show users when a recently changed record might not yet be searchable.",
          "Rebuilds need versioned indexes and an alias or routing switch so queries can move to a complete index atomically. During reindexing, account for concurrent updates through a change log or dual-write strategy, verify counts and sampled documents, and retain the old index until the new one is healthy.",
        ],
      },
      {
        title: "Sharding, replicas, and operations",
        paragraphs: [
          "Shards distribute index storage and query work; replicas improve read availability and throughput but consume storage and increase indexing work. Too many small shards add coordination and file-handle overhead, while oversized shards make recovery and relocation slow.",
          "Track indexing lag, rejected writes, merge or compaction pressure, query latency by shape, shard health, and disk watermarks. Back up the source of truth first; a search index can often be rebuilt, but the rebuild time and source load still matter to recovery planning.",
        ],
      },
    ],
    concepts: [
      "Inverted index: term-to-document postings",
      "Analyzer: tokenizer and normalization pipeline",
      "Relevance ranking and judged-query evaluation",
      "Search index as an eventually consistent projection",
      "Versioned reindexing with atomic alias or routing switch",
      "Shard count affects query fan-out, recovery, and resource overhead",
    ],
    practices: [
      "Keep the authoritative record outside the derived search index",
      "Test analyzers with real multilingual, punctuation, and domain-specific examples",
      "Measure freshness lag and query latency by query pattern",
      "Build and validate a replacement index before directing production traffic",
      "Enforce tenant and authorization filters as part of the search boundary",
    ],
    pitfalls: [
      "Treating search results as transactionally current without a freshness contract",
      "Reindexing without capturing concurrent writes and silently losing updates",
      "Using unbounded wildcard or deep-pagination queries on the interactive path",
      "Adding shards to fix latency without determining whether the bottleneck is I/O, analysis, or fan-out",
    ],
    examples: [
      {
        title: "Product catalog with typo tolerance",
        description:
          "A catalog indexes normalized product names and selected attributes. Exact SKU matches receive a separate high-priority path; fuzzy matching is limited to short user queries, while price and availability filters use structured fields.",
      },
    ],
    caseStudies: [
      {
        title: "Rebuilding a marketplace catalog index",
        context:
          "A marketplace has millions of listings, frequent price and availability changes, and a weekly analyzer update that must improve multilingual search without taking the storefront offline.",
        constraints:
          "The source database remains authoritative. Search should reflect most changes within minutes, tenant and region filters must always apply, and a failed rebuild must not disrupt the live index.",
        design:
          "Publish listing changes to a durable change stream and apply them to a versioned search index. Build the new index from a consistent snapshot, replay changes from the snapshot watermark, verify document counts and sampled queries, then switch a read alias. Keep the prior index available for rollback.",
        tradeoffs:
          "The stream and dual index temporarily increase storage and operational cost. Search is eventually consistent, but the freshness target is measurable and the source database is not burdened with complex relevance queries.",
        failureModes:
          "If indexing falls behind, alert on lag and keep serving the last healthy index. If validation fails, do not switch aliases. If a change event is duplicated, use listing ID and version to make projection updates repeatable.",
        outcome:
          "The team can evolve analyzers and ranking independently of transactional writes, with a controlled cutover and a clear rollback path.",
      },
    ],
    keyTakeaways: [
      "Search architecture includes analysis, indexing, ranking, filtering, and freshness",
      "The index is usually a rebuildable projection, not the source of truth",
      "Reindexing must account for writes that happen during the rebuild",
      "Query complexity and shard fan-out need explicit budgets",
      "Evaluate relevance using real queries and access-control constraints",
    ],
    whyItMatters:
      "Search often becomes a critical product surface while remaining a derived data system. A deliberate indexing and rebuild strategy prevents relevance changes from risking the source of truth or taking search offline.",
    reflectionQuestions: [
      "What is the allowed delay between a source update and searchable visibility?",
      "How would you validate a new analyzer before switching the production index?",
      "Which query types could become expensive or expose data across tenant boundaries?",
    ],
    resources: [
      "Elasticsearch documentation — text analysis and inverted indices",
      "Designing Data-Intensive Applications — derived data and stream processing",
    ],
  }),

  lesson({
    id: "storage-object-media-delivery",
    title: "Object Storage, Uploads & Media Delivery",
    moduleId: "storage",
    phaseId: "fundamentals",
    durationMinutes: 35,
    summary:
      "Large files belong on a storage path designed for durable blobs, not in application-server disks or relational rows by default. This guide covers object storage, safe upload flows, metadata, multipart transfers, CDN delivery, lifecycle policies, and the consistency boundary between file bytes and business records.",
    sections: [
      {
        title: "Separate blob bytes from metadata",
        paragraphs: [
          "Object storage exposes durable objects by key, often across multiple failure domains, and is optimized for large immutable or versioned payloads. A relational database is usually a better home for ownership, permissions, status, checksums, and references than for the full media body.",
          "Object keys should be generated by the service rather than trusted from users. Keep user-supplied filenames as validated metadata, enforce ownership at every access path, and treat bucket names and unguessable URLs as identifiers—not authorization controls.",
        ],
      },
      {
        title: "Reliable upload and processing workflows",
        paragraphs: [
          "A common upload flow creates a pending record, issues a short-lived scoped upload capability, and lets the client upload directly to object storage. The client confirms completion; the service verifies object size, checksum, ownership, and expected metadata before marking the record ready.",
          "Multipart upload supports large files and retries individual parts, but incomplete uploads consume storage and need expiration cleanup. For asynchronous processing, emit a durable event or write an outbox record after validation; workers should be idempotent because notifications and retries can duplicate work.",
        ],
      },
      {
        title: "Delivery, caching, and transformations",
        paragraphs: [
          "A CDN caches objects near users, reducing origin bandwidth and latency. Cache keys, immutable versioned URLs, and purge behavior determine whether users receive the intended version. Private content needs signed delivery or an authorization-aware edge path; a long-lived public cache must not outlive a permission change.",
          "Transcoding and thumbnail generation are asynchronous workloads. Store source and derived artifacts with explicit relationships, track each processing state, and bound concurrency by CPU, memory, and codec capacity. Keep the original until derived outputs are validated and retention policy allows deletion.",
        ],
      },
      {
        title: "Durability, lifecycle, and recovery",
        paragraphs: [
          "Object durability does not replace backup policy, access controls, or deletion workflows. Define retention classes, versioning, replication scope, legal holds, and lifecycle transitions with the product and compliance requirements in mind.",
          "A database row can point to an object that failed to upload, or an object can remain after a database transaction fails. Model pending and deleting states, run reconciliation for orphaned objects and dangling references, and make deletion retries observable rather than assuming two stores change atomically.",
        ],
      },
    ],
    concepts: [
      "Object storage separates blob bytes from queryable metadata",
      "Direct-to-storage upload using scoped, short-lived capabilities",
      "Multipart transfer, checksums, and incomplete-upload cleanup",
      "CDN cache keys, versioned URLs, and private content authorization",
      "Asynchronous transcoding and idempotent processing",
      "Reconciliation for cross-store orphan and dangling-reference states",
    ],
    practices: [
      "Validate size, checksum, content type, ownership, and processing state server-side",
      "Use immutable object keys or version IDs for cache-safe updates",
      "Expire incomplete multipart uploads and monitor orphan cleanup",
      "Keep authorization independent of object-key secrecy",
      "Test restoration and deletion workflows, not only successful uploads",
    ],
    pitfalls: [
      "Writing uploads to ephemeral application-server disks",
      "Treating a successful upload URL response as proof that the object is valid",
      "Caching private media publicly or beyond a permission change",
      "Deleting the source before all derived media and backups are verified",
    ],
    examples: [
      {
        title: "User-generated video",
        description:
          "A client uploads a source video directly to a private bucket using a scoped capability. A validator checks size and checksum, then a queue schedules thumbnail and bitrate renditions; each output receives an immutable versioned URL served through a CDN.",
      },
    ],
    caseStudies: [
      {
        title: "Resumable video ingestion at launch",
        context:
          "A creator platform expects large video uploads from variable mobile networks. Processing can take several minutes, while creators need clear progress and viewers must not see partial output.",
        constraints:
          "Application servers have limited bandwidth, uploads must resume after disconnects, and processing jobs may be delivered more than once.",
        design:
          "Create a pending upload record and scoped multipart session. The client reports completion; the service verifies the object and transitions it to accepted. An outbox event starts idempotent transcode jobs. Renditions become visible only after validation, and a CDN serves immutable output keys.",
        tradeoffs:
          "Direct upload reduces app bandwidth but adds multipart lifecycle and reconciliation work. Eventual processing means the product must expose pending and failed states rather than promise immediate playback.",
        failureModes:
          "Expired multipart sessions are cleaned up; failed transcodes retry with bounded attempts and move to an operator-visible dead-letter state; object and metadata discrepancies are repaired by reconciliation.",
        outcome:
          "The service can absorb upload bursts independently from CPU-heavy transcoding, and users receive an explicit lifecycle for every uploaded asset.",
      },
    ],
    keyTakeaways: [
      "Store large bytes separately from transactional metadata",
      "Treat upload completion and media readiness as distinct states",
      "Use checksums, scoped access, and idempotent asynchronous processors",
      "CDN caching must match the privacy and versioning model",
      "Reconcile object storage and database state because they do not share a transaction",
    ],
    whyItMatters:
      "File and media features combine untrusted input, large payloads, long-running work, and multiple storage systems. Explicit states and reconciliation prevent partial uploads and orphaned data from becoming invisible production incidents.",
    reflectionQuestions: [
      "Which system owns the authoritative state that an uploaded object is ready to use?",
      "How can a user revoke access to an object that is already cached at the edge?",
      "What cleanup detects objects with no database record and records with no object?",
    ],
    resources: [
      "AWS S3 documentation — multipart upload and lifecycle management",
      "Cloudflare documentation — cache keys and cache invalidation",
    ],
  }),

  lesson({
    id: "reliability-rate-limiting",
    title: "Rate Limiting, Quotas & Fairness",
    moduleId: "reliability",
    phaseId: "fundamentals",
    durationMinutes: 32,
    summary:
      "Rate limits protect shared capacity and make resource use predictable, but a counter alone is not a complete policy. This guide compares fixed and sliding windows, token and leaky buckets, distributed enforcement, quota accounting, client feedback, and the distinction between overload control and product entitlements.",
    sections: [
      {
        title: "Define the policy before the algorithm",
        paragraphs: [
          "Specify who is limited (IP, user, tenant, API key, or operation), what is counted (requests, bytes, concurrent work, or cost), the time horizon, and whether bursts are allowed. A per-IP rule can punish users behind shared NAT; a per-user rule can be bypassed by creating accounts.",
          "Separate a short-term safety limit from a longer-term quota. A safety limit protects service capacity and may shed load during an incident. A quota represents an entitlement or billing policy and needs durable accounting, customer visibility, and a well-defined reset boundary.",
        ],
      },
      {
        title: "Choose an algorithm with known behavior",
        paragraphs: [
          "A fixed window is easy to implement but permits a boundary burst: a client can spend its full allowance just before and after the reset. A sliding log is precise but stores many timestamps. A sliding-window counter approximates a rolling limit using adjacent buckets.",
          "A token bucket accumulates tokens up to a burst capacity and spends tokens per request; it supports controlled bursts at a steady refill rate. A leaky bucket or paced queue smooths output. Choose based on whether the requirement is to reject excess work promptly or queue it for later.",
        ],
      },
      {
        title: "Distributed enforcement and failure behavior",
        paragraphs: [
          "A centralized counter provides a shared decision but adds a network hop and a dependency. Local counters are fast but allow aggregate overshoot across instances. Approximate local budgets can reduce coordination, while a shared atomic store provides tighter enforcement at the cost of latency and availability coupling.",
          "Define the limiter's own failure policy. Fail-open preserves availability but risks overload or abuse; fail-closed protects capacity but can block legitimate traffic. Apply timeouts, bound key cardinality, protect the counter store, and keep a local emergency limit for catastrophic dependency failure.",
        ],
      },
      {
        title: "Fairness, feedback, and observability",
        paragraphs: [
          "Return a consistent rejection status and useful retry metadata, and document client backoff behavior. Randomized exponential backoff prevents synchronized clients from retrying at the same instant. For queued work, distinguish a rate limit from a temporary capacity rejection.",
          "Measure allowed and denied requests by policy, tenant, and endpoint; track limiter latency, store errors, and key cardinality. Avoid logging sensitive raw identifiers. Test boundary bursts, clock changes, hot tenants, and multi-region traffic rather than validating only the happy path.",
        ],
      },
    ],
    concepts: [
      "Fixed window, sliding log, and sliding-window counter",
      "Token bucket permits bounded bursts at a controlled refill rate",
      "Leaky bucket smooths work rather than only rejecting requests",
      "Safety limits differ from durable customer quotas",
      "Centralized accuracy trades off latency and dependency availability",
      "Fail-open and fail-closed are explicit product and reliability choices",
    ],
    practices: [
      "Write the policy in terms of identity, cost unit, burst, and reset behavior",
      "Return Retry-After or equivalent client guidance and expect retries to be jittered",
      "Bound key cardinality and protect limiter state from untrusted identifiers",
      "Use local emergency protection when the shared limiter is unhealthy",
      "Test clock boundaries, concurrent updates, and regional overshoot",
    ],
    pitfalls: [
      "Using one request count when endpoints have very different compute costs",
      "Assuming per-instance limits enforce a global quota",
      "Failing closed during a limiter outage without considering user impact",
      "Returning retry guidance that causes every client to retry simultaneously",
      "Storing unbounded attacker-controlled keys in a shared counter service",
    ],
    examples: [
      {
        title: "API with separate safety and plan limits",
        description:
          "An API applies a fast token bucket per credential to protect the service and a durable monthly usage ledger for plan entitlements. Exceeding the first produces short backoff; approaching the second is visible in the account dashboard.",
      },
    ],
    caseStudies: [
      {
        title: "Protecting a multi-tenant report API",
        context:
          "A SaaS report endpoint runs expensive database queries. One customer can submit many simultaneous exports, causing latency spikes for unrelated tenants.",
        constraints:
          "Small customers need predictable access, large customers may buy higher limits, and long-running exports should not occupy request threads while waiting.",
        design:
          "Apply a per-tenant token bucket to submission requests and a separate concurrency cap to active exports. Enqueue accepted work into tenant-aware queues with weighted scheduling. Keep plan quota accounting in a durable ledger; use a local emergency request cap if the shared limiter is unavailable.",
        tradeoffs:
          "Queueing improves fairness but adds wait time and status polling. Weighted scheduling is more complex than a global FIFO, while strict global counters would add latency to every request.",
        failureModes:
          "A tenant cannot monopolize workers because concurrency is bounded; retries use jitter; limiter-store failure activates conservative local protection and emits an alert. The system does not silently count failed submissions against a long-term entitlement.",
        outcome:
          "Expensive work is admitted and scheduled independently, preserving interactive API capacity while keeping customer quotas explainable.",
      },
    ],
    keyTakeaways: [
      "The limit policy and identity scope matter more than the chosen counter implementation",
      "Token buckets are useful when bounded bursts are acceptable",
      "Use separate mechanisms for capacity protection and contractual quotas",
      "Distributed enforcement always chooses a point on the accuracy/latency/availability spectrum",
      "Fairness and overload behavior should be observable and tested",
    ],
    whyItMatters:
      "Without admission control, one noisy client or a retry storm can consume capacity for everyone. A deliberate policy preserves fairness while making the availability impact of limiter failures explicit.",
    reflectionQuestions: [
      "Should your expensive operation be rejected, queued, or charged against a quota?",
      "How much aggregate overshoot is acceptable when each region uses a local limiter?",
      "What should happen to legitimate traffic if the shared counter store becomes unavailable?",
    ],
    resources: [
      "RFC 6585 — 429 Too Many Requests",
      "Designing Data-Intensive Applications — stream processing and time",
    ],
  }),

  lesson({
    id: "reliability-multi-region-dr",
    title: "Multi-Region Architecture & Disaster Recovery",
    moduleId: "reliability",
    phaseId: "fundamentals",
    durationMinutes: 40,
    summary:
      "Running in multiple regions can reduce user latency and survive regional outages, but it does not automatically make data highly available or consistent. This guide distinguishes active-passive and active-active designs, defines RTO and RPO, and covers failover, replication lag, traffic control, and recovery testing.",
    sections: [
      {
        title: "Start with recovery objectives",
        paragraphs: [
          "Recovery Time Objective (RTO) is how long a service may be unavailable after a disruption. Recovery Point Objective (RPO) is how much recent data loss is acceptable. These are product and business requirements that drive topology, replication, backup frequency, and operational staffing.",
          "A second region does not provide a recovery plan unless dependencies, credentials, DNS or traffic management, capacity, and runbooks work there. Map the failure domains you intend to tolerate—zone, region, control plane, or account—and avoid promising protection against failures the architecture shares.",
        ],
      },
      {
        title: "Active-passive and active-active",
        paragraphs: [
          "In active-passive, one region serves writes while another is warm or cold standby. It simplifies ownership and conflict handling, but failover takes time and the standby must have enough capacity. Test promotion, traffic shift, and return to normal operation.",
          "Active-active serves traffic in multiple regions. It can reduce latency and survive some regional outages without a full cold start, but concurrent writes require conflict handling or ownership partitioning. Global synchronous coordination adds latency and can make a network partition affect availability.",
        ],
      },
      {
        title: "Replication and failover semantics",
        paragraphs: [
          "Asynchronous replication reduces write latency but creates a replication lag window in which acknowledged data may not yet exist elsewhere. Synchronous replication can reduce that loss window but adds latency and may block writes when a required replica is unreachable.",
          "Failover must fence the old writer before a new writer accepts updates; otherwise a partition can create split brain. Use leases or epochs with clear authority, verify the promoted copy's position, and understand how clients discover the new endpoint without replaying unsafe writes.",
        ],
      },
      {
        title: "Recovery operations and testing",
        paragraphs: [
          "Backups protect against deletion, corruption, and some account-level failures that replication faithfully copies. Keep backups isolated, define restore points, and measure actual restore time; a backup that cannot be restored within the RTO is not a useful recovery control.",
          "Practice failover and failback with game days, including partial failures and dependency loss. Confirm that runbooks, staff permissions, capacity, secrets, and observability are available during an incident. After recovery, reconcile delayed events and avoid an unsafe immediate failback that repeats the same failure.",
        ],
      },
    ],
    concepts: [
      "RTO: target time to restore service",
      "RPO: target maximum loss of acknowledged data",
      "Active-passive reduces write conflicts but needs tested promotion",
      "Active-active improves locality but requires conflict or ownership strategy",
      "Replication lag and write fencing define failover safety",
      "Backups address corruption and deletion, not only infrastructure loss",
    ],
    practices: [
      "Set RTO and RPO per critical workflow rather than per platform in general",
      "Capacity-test the surviving region against failover load",
      "Fence the previous writer before promoting a new one",
      "Test restore from isolated backups and record measured recovery time",
      "Practice failover, failback, and partial dependency failure regularly",
    ],
    pitfalls: [
      "Calling asynchronous replication zero-data-loss protection",
      "Failing over without preventing the old primary from accepting writes",
      "Replicating accidental deletions or corruption and assuming replication is backup",
      "Testing only traffic routing while ignoring credentials, quotas, and downstream dependencies",
      "Failing back immediately without reconciling writes accepted during the incident",
    ],
    examples: [
      {
        title: "Read-local, single-writer service",
        description:
          "A global application serves reads from regional replicas but routes writes to a designated home region. During a region outage, the team promotes a replica only after fencing the prior writer and accepting the documented recovery point.",
      },
    ],
    caseStudies: [
      {
        title: "Regional outage for a subscription platform",
        context:
          "A subscription service operates in two regions. The business requires core account reads to recover quickly, while billing state must not accept conflicting writes from two regions.",
        constraints:
          "The service targets a 30-minute RTO and a five-minute RPO for billing updates. A full synchronous cross-region database write on every request is not acceptable for normal latency.",
        design:
          "Run stateless APIs in both regions with a single write-primary for billing and asynchronous replication to a warm standby. Keep tested backups in a separate account. During failover, stop or fence the original writer, inspect replica position, promote the standby, then shift write traffic; record any transactions inside the RPO window for reconciliation.",
        tradeoffs:
          "The design accepts bounded data loss in a rare regional event in exchange for lower normal write latency. Reads can be local, but billing writes depend on the primary region until a controlled promotion.",
        failureModes:
          "If the control plane is unavailable, documented manual traffic steps remain available. If replication lag exceeds the objective, alert before an outage and reassess readiness. If the old region returns, it stays fenced until data is reconciled.",
        outcome:
          "Recovery behavior is explicit and measurable instead of relying on automatic DNS failover to solve database ownership and data consistency.",
      },
    ],
    keyTakeaways: [
      "Multi-region topology follows RTO, RPO, latency, and conflict requirements",
      "Replication is not a substitute for isolated backups",
      "Failover requires safe writer ownership and a known recovery point",
      "The surviving region must have real capacity for the shifted workload",
      "Regular restore and failover exercises validate the complete operational path",
    ],
    whyItMatters:
      "Disaster recovery is an end-to-end operational capability, not a diagram with two regions. Explicit recovery objectives expose which data can be delayed or lost and which workflows need stronger safeguards.",
    reflectionQuestions: [
      "What user-visible behavior changes when the system has crossed its RPO?",
      "How does the architecture prove the former primary cannot keep accepting writes?",
      "When was the last restore test, and how did its measured time compare with the RTO?",
    ],
    resources: [
      "Google SRE Book — emergency response and managing incidents",
      "AWS Well-Architected Framework — reliability pillar",
    ],
  }),

  lesson({
    id: "infra-observability-slos",
    title: "Observability, SLIs & SLOs",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    durationMinutes: 38,
    summary:
      "Production observability connects user-visible behavior to the internal signals that explain it. This guide distinguishes metrics, logs, and traces; defines service-level indicators and objectives; and shows how to build alerts around actionable symptoms instead of collecting telemetry without an operating model.",
    sections: [
      {
        title: "Signals answer different questions",
        paragraphs: [
          "Metrics summarize numeric behavior over time and are efficient for trends and alerting. Logs preserve discrete events with contextual fields. Distributed traces connect a request across service boundaries and reveal where latency or errors accumulated. None replaces the others.",
          "Instrument stable dimensions such as service, operation, region, and outcome. High-cardinality values—user IDs, request IDs, raw URLs—can make metrics expensive or unusable; put request-specific context in logs and traces with appropriate privacy controls.",
        ],
      },
      {
        title: "Define SLIs and SLOs from user outcomes",
        paragraphs: [
          "A Service Level Indicator (SLI) is a measured user-relevant property, such as successful request ratio or latency below a threshold. A Service Level Objective (SLO) is the target over a window. Define the eligible event population and exclude only cases users would agree are outside the service promise.",
          "An error budget is the tolerated unreliability implied by the SLO. It helps teams balance feature delivery and reliability work, but only when the SLI is trustworthy and stakeholders agree how budget consumption changes decisions. A service-level target is not a guarantee that every request meets the threshold.",
        ],
      },
      {
        title: "Alert on symptoms and actionable risk",
        paragraphs: [
          "Page on a user-impacting symptom that needs prompt human action; use tickets or dashboards for slower-moving causes and capacity risks. Multi-window burn-rate alerts can detect both rapid budget exhaustion and sustained degradation while avoiding noisy alerts on isolated blips.",
          "Every alert should identify impact, likely ownership, and a first response. If no one can act on it, it is not a useful page. Pair alerts with runbooks and review false positives, missed incidents, and alert fatigue after changes.",
        ],
      },
      {
        title: "Trace the critical path and control cost",
        paragraphs: [
          "Trace context should propagate across HTTP, RPC, and messaging boundaries. A consumer span may start long after the producer request ends, so include message identity and causal links where supported. Sampling can reduce volume, but preserve error and tail-latency traces so rare failures remain diagnosable.",
          "Telemetry pipelines need their own limits, retention, access controls, and failure behavior. Avoid blocking user requests on a remote telemetry backend; buffer within bounds and drop or sample according to priority when overloaded. Instrumentation is part of the production design and should be tested like other dependencies.",
        ],
      },
    ],
    concepts: [
      "Metrics aggregate numeric time series; logs capture events; traces connect request paths",
      "SLI measures an agreed user-visible outcome",
      "SLO sets a target over a defined measurement window",
      "Error budget quantifies tolerated unreliability",
      "High-cardinality labels can overwhelm metric storage",
      "Sampling, retention, and telemetry failure behavior are design decisions",
    ],
    practices: [
      "Define availability and latency SLIs at the user-facing boundary",
      "Use bounded metric labels and correlate detailed context through traces",
      "Alert on actionable user impact and SLO burn rather than every cause metric",
      "Propagate trace context through asynchronous messages",
      "Bound telemetry buffering and test application behavior when the backend is unavailable",
    ],
    pitfalls: [
      "Counting server success responses that returned unusable or incomplete results",
      "Using unbounded identifiers as metric labels",
      "Paging on resource saturation without checking user impact or remaining headroom",
      "Treating an SLO as a promise without an agreed measurement definition",
      "Sampling away the slow or failed traces that explain incidents",
    ],
    examples: [
      {
        title: "Checkout availability objective",
        description:
          "A checkout SLI counts eligible attempts that return a valid order outcome within the latency budget. A dashboard breaks down failures by dependency, while a burn-rate alert pages only when the monthly error budget is being consumed quickly.",
      },
    ],
    caseStudies: [
      {
        title: "Finding a hidden checkout latency regression",
        context:
          "A retail team sees complaints that checkout is slow, but host CPU and average request latency look normal. A synchronous inventory dependency has occasional long-tail responses.",
        constraints:
          "The team needs to detect customer impact quickly without paging on every transient dependency spike, and telemetry costs must remain bounded.",
        design:
          "Define a latency SLI at the checkout boundary using a customer-relevant threshold and eligible attempts. Propagate trace context through inventory calls, keep bounded service and region metric labels, and use tail-based retention for slow and failed traces. Alert on sustained SLO burn and show dependency timing in the incident dashboard.",
        tradeoffs:
          "Tail-based sampling requires a collector path and more operational care than uniform sampling. The SLI is more meaningful than host health but requires clear handling for client cancellation and validation errors.",
        failureModes:
          "If the trace backend is unavailable, checkout continues with bounded local buffering and prioritized drops. If a label change causes cardinality growth, ingestion alerts and a rollback protect the metrics backend.",
        outcome:
          "The on-call engineer can distinguish dependency tail latency from broad capacity pressure and respond to sustained customer harm without reacting to every isolated spike.",
      },
    ],
    keyTakeaways: [
      "Observability signals are complementary and should answer specific operational questions",
      "SLIs and SLOs must reflect outcomes users care about",
      "Alert on actionable impact, not every internal metric deviation",
      "High-cardinality telemetry and unbounded buffering can become outages themselves",
      "Instrument and test asynchronous boundaries as well as synchronous calls",
    ],
    whyItMatters:
      "A system that cannot explain its own behavior is expensive to operate and slow to recover. SLO-oriented instrumentation turns a pile of telemetry into shared evidence for prioritizing reliability and diagnosing incidents.",
    reflectionQuestions: [
      "Which user-visible event is the denominator of your availability SLI?",
      "What evidence would distinguish a slow dependency from saturation in your own service?",
      "What happens to request latency and memory if your telemetry backend stops accepting data?",
    ],
    resources: [
      "Google SRE Book — Service Level Objectives",
      "OpenTelemetry documentation — traces, metrics, and context propagation",
    ],
  }),

  lesson({
    id: "security-multitenancy-isolation",
    title: "Multi-Tenant Architecture & Isolation",
    moduleId: "security",
    phaseId: "fundamentals",
    durationMinutes: 36,
    summary:
      "Multi-tenancy lets many customers share an application and infrastructure, but shared execution must never imply shared authority. This guide compares tenant data layouts, establishes tenant context at trusted boundaries, and covers noisy-neighbor controls, isolation tiers, and verification of cross-tenant access.",
    sections: [
      {
        title: "Establish tenant identity and authority",
        paragraphs: [
          "Tenant identity should come from authenticated claims or a server-side membership lookup, not from an untrusted request field accepted as fact. Resolve the caller's role and tenant membership at the boundary, then pass a typed tenant context through application layers.",
          "Authorization must be enforced on every object access, including background jobs, exports, search, caches, and administrative APIs. A resource ID is not proof of permission. Where possible, make tenant scoping part of repository interfaces and database constraints so a forgotten filter is harder to introduce.",
        ],
      },
      {
        title: "Choose a data isolation model",
        paragraphs: [
          "A shared schema with tenant IDs is operationally efficient but requires reliable row scoping, tenant-aware unique constraints, and careful backups and exports. Separate schemas or databases offer stronger logical boundaries but increase migration, connection, and operational overhead.",
          "A hybrid model can keep most tenants shared and move regulated or high-volume tenants to dedicated storage. Plan the placement abstraction before introducing tiers, and verify that moving a tenant preserves IDs, permissions, encryption keys, and recovery requirements.",
        ],
      },
      {
        title: "Prevent leakage through derived systems",
        paragraphs: [
          "Caches need tenant-aware keys; search indexes need mandatory tenant filters; event payloads need explicit tenant identity and access policy. Logs and traces can contain personal or confidential data, so define redaction and access controls before broad instrumentation.",
          "Tenant context must survive asynchronous boundaries. Include the authorized tenant and operation in durable job metadata, then revalidate permissions where a user-triggered job executes. Never trust a stale client-supplied tenant ID merely because it was stored in a queue message.",
        ],
      },
      {
        title: "Noisy neighbors and tiered isolation",
        paragraphs: [
          "One tenant can consume shared CPU, database connections, queue capacity, or cache memory. Apply per-tenant quotas, concurrency limits, fair scheduling, and usage visibility. Capacity protection and contractual billing limits may use different counters and retention rules.",
          "Higher isolation tiers can dedicate compute or storage to customers with stronger regulatory, performance, or residency requirements. Isolation does not remove shared control-plane risks; keep administrative access audited and test tenant migration, deletion, and restore paths.",
        ],
      },
    ],
    concepts: [
      "Trusted tenant context derived from authentication and membership",
      "Shared schema, separate schema, and dedicated database trade-offs",
      "Tenant scoping across APIs, jobs, caches, search, and observability",
      "Noisy-neighbor controls: quotas, concurrency, and fair scheduling",
      "Tiered isolation for different residency, compliance, or performance needs",
      "Cross-tenant authorization tests as a security invariant",
    ],
    practices: [
      "Require tenant context explicitly in data-access and job APIs",
      "Add tenant-aware unique keys and database-level safeguards where possible",
      "Test cross-tenant read, write, export, cache, and search access",
      "Include tenant identity in asynchronous work and revalidate authority at execution",
      "Define tenant deletion, backup, restore, and migration behavior before launch",
    ],
    pitfalls: [
      "Trusting a tenant ID directly from a URL or request body",
      "Scoping primary database queries but forgetting caches, search, or background jobs",
      "Assuming separate database schemas also isolate shared credentials and operators",
      "Using only global rate limits so one tenant can exhaust shared resources",
      "Logging tenant data broadly without retention and access controls",
    ],
    examples: [
      {
        title: "Tenant-aware cache key",
        description:
          "A profile cache uses a key composed from tenant ID, object ID, and representation version. This prevents identical object identifiers in separate tenants from resolving to the same cached value.",
      },
    ],
    caseStudies: [
      {
        title: "Isolating a large enterprise tenant",
        context:
          "A collaboration SaaS starts with a shared relational database and later signs a large enterprise whose data-residency and workload requirements differ from smaller customers.",
        constraints:
          "Existing tenant isolation must remain correct during migration. The enterprise needs a dedicated database in a specific region, while product releases should not require separate code branches.",
        design:
          "Introduce a server-side tenant placement directory and a storage interface that resolves a tenant to its approved database. Move data with a snapshot plus change capture, verify row counts and checksums, then atomically switch placement. Keep tenant context mandatory in queries and background jobs.",
        tradeoffs:
          "The placement layer adds routing and operational complexity, but supports shared and dedicated tiers with one application release. Cross-tenant analytics must use an explicitly governed aggregation path.",
        failureModes:
          "A stale placement entry is detected by versioned routing and bounded retries; incomplete migration does not switch traffic; exports and jobs are paused or routed using the same placement rules. Access logs preserve an audit trail without recording sensitive payloads.",
        outcome:
          "The enterprise receives stronger data placement without weakening shared-tenant boundaries or forking the application.",
      },
    ],
    keyTakeaways: [
      "Tenant identity is an authorization context, not a client-controlled selector",
      "Every derived store and asynchronous path must preserve tenant scope",
      "Data isolation models trade cost and operational simplicity against blast-radius reduction",
      "Fairness requires tenant-aware quotas and concurrency controls",
      "Migration and restore processes must preserve the same isolation guarantees as steady state",
    ],
    whyItMatters:
      "A single cross-tenant data leak can undermine the trust model of an entire SaaS product. Designing tenant boundaries into APIs, storage, jobs, and operations makes isolation testable instead of dependent on every caller remembering an ad hoc filter.",
    reflectionQuestions: [
      "Where does tenant identity become trusted, and can a caller override it later in the request?",
      "Which caches, search paths, and jobs could bypass the database's tenant filter?",
      "How would you migrate one tenant without pausing all tenants or mixing their data?",
    ],
    resources: [
      "AWS SaaS Architecture Fundamentals — tenant isolation models",
      "OWASP Authorization Cheat Sheet",
    ],
  }),

  lesson({
    id: "messaging-workflow-orchestration",
    title: "Workflow Orchestration & Durable Jobs",
    moduleId: "messaging",
    phaseId: "fundamentals",
    durationMinutes: 36,
    summary:
      "Background jobs and long-running workflows outlive the process that starts them. This guide explains durable workflow state, queues versus workflow engines, retries and deadlines, human steps, and the design needed to resume safely after worker or dependency failure.",
    sections: [
      {
        title: "A queue is not the whole workflow",
        paragraphs: [
          "A queue buffers work and distributes messages to consumers. It is useful for independent tasks, but a multi-step workflow also needs durable progress, branching, deadlines, compensation, and a way to answer what happened to a particular request.",
          "A simple worker can persist job status in a database. As workflows gain timers, waits, parallel branches, human approvals, or compensation, a workflow engine can make state transitions explicit. The engine is another dependency, so evaluate its persistence, upgrade path, operational model, and failure recovery.",
        ],
      },
      {
        title: "Make work durable and idempotent",
        paragraphs: [
          "Persist the intent to run work before acknowledging the caller. A transactional outbox or a single durable job store prevents a process crash from losing the request between database commit and queue publish.",
          "Workers can crash after a side effect but before acknowledging the message. Give each logical task an idempotency key, store completed results, and make external calls repeatable where possible. If a side effect cannot be repeated safely, query its outcome before retrying.",
        ],
      },
      {
        title: "Retries, timeouts, and queues",
        paragraphs: [
          "Retry only failures that may recover, use exponential backoff with jitter, and set an overall deadline so a workflow cannot live forever by resetting its per-step timeout. Separate poison messages into a dead-letter or operator-review path with enough context to diagnose the failure.",
          "Queue depth alone is insufficient: monitor oldest-message age, processing duration, retry rate, and remaining deadline. Scale workers only when downstream capacity can absorb them; otherwise autoscaling can turn a backlog into a database or vendor outage.",
        ],
      },
      {
        title: "Orchestration, choreography, and human work",
        paragraphs: [
          "An orchestrator records the sequence and current state, making the workflow easier to inspect but centralizing control logic. Choreography lets each service react to events, but the overall process may be difficult to understand without a correlation view and clear ownership.",
          "Human approval is a durable wait state, not a sleeping thread. Persist the request, approver, timeout, and allowed transition; re-check authorization when the approval arrives. Design cancellation, duplicate callbacks, and late responses explicitly.",
        ],
      },
    ],
    concepts: [
      "Queue distributes tasks; workflow state coordinates multiple durable steps",
      "Transactional job creation prevents lost work between commit and publish",
      "Idempotency makes worker redelivery safe",
      "Retry policy needs jitter, attempt limits, and an overall deadline",
      "Dead-letter handling needs diagnosis and controlled replay",
      "Human approvals and timers are persisted workflow states",
    ],
    practices: [
      "Assign stable workflow and step IDs for correlation and deduplication",
      "Persist progress before acknowledging work or returning success",
      "Set per-step timeouts and an end-to-end deadline",
      "Monitor queue age and downstream saturation before adding workers",
      "Make replay and manual repair auditable and safe",
    ],
    pitfalls: [
      "Using an in-memory background task for work that must survive process restart",
      "Retrying every error forever with no deadline or poison-message path",
      "Autoscaling consumers without considering the database or provider bottleneck",
      "Treating a human approval as a long-lived request thread",
      "Replaying an event without preserving idempotency and audit context",
    ],
    examples: [
      {
        title: "Document approval workflow",
        description:
          "A document submission moves through validation, reviewer assignment, approval, and publication. Each transition is stored with its actor and timestamp; an overdue review schedules a reminder without occupying a worker.",
      },
    ],
    caseStudies: [
      {
        title: "Reliable month-end invoice generation",
        context:
          "A billing platform generates invoices for millions of accounts at month end. Jobs involve reading usage, computing totals, rendering documents, and sending notifications through an external provider.",
        constraints:
          "A run may take hours, workers can restart, one account's failure should not stop the batch, and invoices must not be duplicated or silently skipped.",
        design:
          "Create a durable run record and per-account job IDs. Workers claim bounded batches, persist each step, and write invoice records with a unique billing-period/account key. Rendering and notification use idempotent tasks; transient failures retry with jitter, while invalid data enters an operator queue.",
        tradeoffs:
          "Per-account state adds storage and status complexity, but isolates failures and supports resume. A workflow engine could simplify timers and visibility if the platform already operates one; otherwise a database-backed state machine may be sufficient.",
        failureModes:
          "A worker crash releases its lease and the job is retried; duplicate delivery hits the unique invoice key; provider timeouts are reconciled by idempotency key. Run-level progress is derived from durable jobs rather than an in-memory counter.",
        outcome:
          "The batch can resume after partial failure, while operators can identify delayed accounts and customers never receive duplicate invoices due only to a worker retry.",
      },
    ],
    keyTakeaways: [
      "Durable workflows need persisted progress, not just a queue message",
      "Assume tasks can be delivered again after any side effect",
      "Bound retries with jitter, deadlines, and a human repair path",
      "Scale consumers according to downstream headroom and queue age",
      "Use a workflow engine when its durable capabilities justify its operational cost",
    ],
    whyItMatters:
      "Many important operations run longer than an HTTP request and cross unreliable process boundaries. Durable workflow design makes progress recoverable and gives users and operators a truthful view of incomplete work.",
    reflectionQuestions: [
      "What state proves that a job was accepted before its queue message is acknowledged?",
      "How do you distinguish a retryable failure from a poison message?",
      "Which downstream service would saturate first if worker count doubled?",
    ],
    resources: [
      "Temporal documentation — durable execution and workflow retries",
      "Designing Data-Intensive Applications — stream processing",
    ],
  }),

  lesson({
    id: "infra-feature-flags-config",
    title: "Feature Flags & Dynamic Configuration",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    durationMinutes: 32,
    summary:
      "Feature flags and dynamic configuration separate deployment from exposure, but introduce a distributed control plane that can fail or drift. This guide covers safe rollout, evaluation location, configuration versioning, kill switches, flag lifecycle, and the boundary between release controls and authorization.",
    sections: [
      {
        title: "Separate deploy from release",
        paragraphs: [
          "A feature flag lets code deploy before behavior is enabled for every user. Gradual rollout can reduce blast radius, support experiments, or provide an emergency disable switch. It does not replace code review, compatibility, or a rollback plan.",
          "Flags have distinct purposes: release flags control incomplete features, operational flags disable risky paths, experiment flags compare variants, and permission checks enforce access. Do not use a client-visible feature flag as an authorization boundary; server-side policy must remain authoritative.",
        ],
      },
      {
        title: "Evaluation and propagation",
        paragraphs: [
          "A remote evaluation call on every request adds latency and a runtime dependency. Local evaluation with a cached ruleset is faster and can continue during a control-plane outage, but introduces propagation delay and stale configuration. Choose a bounded staleness target and define what happens when a rule expires.",
          "Version configuration documents, validate schemas, and publish updates atomically. Roll out to a small cohort, observe health, and expand gradually. Use stable user or tenant hashing for consistent cohorts; avoid random per-request assignment that causes behavior to flicker.",
        ],
      },
      {
        title: "Safe kill switches and defaults",
        paragraphs: [
          "A kill switch should disable a specific risky capability while preserving a safe fallback. Define its default for missing, stale, malformed, or unavailable configuration. The safest behavior depends on the function: payment authorization should not fail open, while an optional recommendation panel can disappear.",
          "For emergency controls, keep the operational path available when the main control plane is impaired. Audit who changed a flag, when, why, and to what value; require authorization and optionally a second reviewer for high-impact changes.",
        ],
      },
      {
        title: "Flag cleanup and configuration hygiene",
        paragraphs: [
          "Every temporary flag creates branches in the behavior space and needs an owner, purpose, and removal date. Delete obsolete code paths after rollout instead of letting flags become permanent undocumented configuration.",
          "Test both enabled and disabled behavior, plus stale and invalid config. Observe exposure and outcome together so a rollout can be paused based on user impact rather than percentage alone.",
        ],
      },
    ],
    concepts: [
      "Deployment and release are separate control points",
      "Release, operational, experiment, and authorization controls have different roles",
      "Local evaluation trades low latency for bounded configuration staleness",
      "Versioned configuration should validate and switch atomically",
      "Kill-switch defaults depend on the risk of each capability",
      "Flags need ownership, audit, and removal lifecycle",
    ],
    practices: [
      "Set an owner, purpose, and expiration date for each temporary flag",
      "Use stable cohort assignment and monitor outcome metrics during rollout",
      "Define behavior for stale, missing, and malformed configuration",
      "Keep authorization checks server-side and independent of release flags",
      "Test kill switches and safe fallback paths during failure exercises",
    ],
    pitfalls: [
      "Calling a flag service synchronously on every critical request without a fallback",
      "Using a feature flag as the only access-control mechanism",
      "Making a global change without staged rollout, audit, or rollback",
      "Allowing temporary flags to persist indefinitely and multiply code paths",
      "Using a fail-open default for security-sensitive behavior",
    ],
    examples: [
      {
        title: "Gradual search backend migration",
        description:
          "A service routes a small stable cohort to a new search backend, compares latency and result quality, and expands exposure only while error and relevance indicators remain within agreed bounds. A server-side kill switch returns traffic to the old backend.",
      },
    ],
    caseStudies: [
      {
        title: "Rolling out a new checkout calculation",
        context:
          "A commerce team changes tax and discount calculation logic. The new implementation has been deployed but needs validation across regions and a rapid fallback if totals diverge.",
        constraints:
          "The rollout must be consistent for a cart, auditable for financial support, and safe if the flag control plane becomes unreachable during checkout.",
        design:
          "Evaluate a versioned server-side rule using tenant and cart attributes, pin the chosen calculation version to the order, and start with an internal cohort. Compare shadow results without charging the alternate value, then expand by region with alerts on mismatch and checkout errors. Keep a tested fallback to the prior calculation.",
        tradeoffs:
          "Shadow evaluation costs additional compute and may expose differences that need investigation. Pinning the version improves auditability but means a cart can retain an older rule until its lifecycle ends.",
        failureModes:
          "Stale rules use a conservative validated default; the control plane is not on the per-request path. A mismatch pauses rollout automatically, and the kill switch disables only the new calculation while retaining order records and audit context.",
        outcome:
          "The change is released incrementally with measurable correctness signals, and support can identify exactly which calculation version produced an order.",
      },
    ],
    keyTakeaways: [
      "Flags reduce release blast radius but add configuration and behavioral complexity",
      "Keep authorization separate from feature exposure",
      "Choose local or remote evaluation based on latency and staleness needs",
      "Make risky changes gradual, observable, auditable, and reversible",
      "Remove temporary flags once their rollout is complete",
    ],
    whyItMatters:
      "A flag system is a control plane that can affect every request. Designing its defaults, propagation, audit, and cleanup paths is essential to prevent a release mechanism from becoming a new reliability or security failure.",
    reflectionQuestions: [
      "What does this feature do if the latest configuration is unavailable?",
      "Which flags are actually authorization checks in disguise?",
      "How can you prove a user received the same behavior for the full lifetime of a workflow?",
    ],
    resources: [
      "Martin Fowler — Feature Toggles",
      "OpenFeature specification — vendor-neutral feature flagging",
    ],
  }),
];
