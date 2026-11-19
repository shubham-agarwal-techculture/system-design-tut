import { lessonPath, writeJson } from "./content/lib.ts";
import { buildRichLesson, type RichSpec } from "./content/rich-lesson.ts";

const specs: RichSpec[] = [
  {
    id: "fund-caching",
    title: "Caching Layers & Strategies",
    moduleId: "caching",
    phaseId: "fundamentals",
    durationMinutes: 45,
    summary:
      "Caching stores computed or fetched data closer to the consumer to cut latency and load. Strategy choice — cache-aside, read-through, write-through, write-back — and invalidation design determine correctness under update.",
    sections: [
      {
        title: "Where caches live",
        paragraphs: [
          "Browser/CDN caches absorb public GETs. Application memory caches remove RPC hops. Distributed caches (Redis/Memcached) share state across instances. Database buffer pools cache pages. Each layer has different coherence and TTL semantics.",
          "Stacking caches without a coherence story creates subtle stale reads. Draw the write path before celebrating hit-rate wins.",
        ],
      },
      {
        title: "Read/write strategies",
        paragraphs: [
          "Cache-aside: app reads cache, on miss loads DB and populates. Write-through: write cache and DB together. Write-back: write cache, flush later — fast, riskier. Read-through embeds load logic in the cache library.",
          "Invalidation beats complex TTL-only schemes for mutable data, but invalidation can miss. Versioned keys and short TTLs as safety nets help.",
        ],
      },
      {
        title: "Failure modes",
        paragraphs: [
          "Stampede: many misses refill together — use singleflight/locking. Hot keys: shard or local+remote tiers. Thundering herd after flush: warm critical keys.",
          "Treating a cache as source of truth without durability guarantees causes silent loss on restart.",
        ],
      },
      {
        title: "Measuring success",
        paragraphs: [
          "Track hit rate, occupancy, eviction causes, and origin QPS. A high hit rate on useless keys is a vanity metric — measure origin load and user latency.",
        ],
      },
    ],
    concepts: ["Cache-aside", "Write-through/back", "TTL vs explicit invalidation", "Stampede", "Hot key"],
    practices: ["Design invalidation with the write path", "Protect against stampede", "Monitor origin QPS not just hit rate"],
    pitfalls: ["Cache as SoT without durability", "Unbounded keys", "Global flush as routine ops"],
    examples: [
      { title: "CDN + origin", description: "Edge caching for static and cacheable APIs." },
      { title: "Redis aside cache", description: "Common app-tier pattern with TTL safety nets." },
    ],
    keyTakeaways: ["Coherence is the hard part", "Strategy must match write patterns", "Measure origin relief"],
    whyItMatters: "Caching is in every hot-path design; incorrect coherence causes the worst production bugs — wrong data at scale.",
    reflectionQuestions: ["What is your invalidation trigger on update?"],
  },
  {
    id: "fund-messaging",
    title: "Queues, Pub/Sub & Event Streaming",
    moduleId: "messaging",
    phaseId: "fundamentals",
    durationMinutes: 45,
    summary:
      "Asynchronous messaging decouples producers and consumers. Queues distribute work; pub/sub fans out notifications; logs/streams retain ordered history for replay. Choosing among them is a durability and consumer model decision.",
    sections: [
      {
        title: "Work queues vs pub/sub vs logs",
        paragraphs: [
          "Queues (SQS, RabbitMQ competing consumers) deliver each message to one worker. Pub/sub delivers to many subscriptions. Event logs (Kafka) retain a partitioned append-only history for many independent consumers with offsets.",
          "If you need replay and multiple evolving consumers, prefer a log. If you need simple task distribution with ack/delete, a queue fits.",
        ],
      },
      {
        title: "Delivery and ordering",
        paragraphs: [
          "At-least-once is default under retries. Ordering is typically per partition/key. Global order is expensive and rarely needed.",
          "Poison messages need DLQs and alerting — infinite retry loops take down consumers.",
        ],
      },
      {
        title: "Backpressure and lag",
        paragraphs: [
          "Consumer lag is an SLO. Scale consumers, shed load, or slow producers. Unbounded retries without budgets amplify outages.",
        ],
      },
      {
        title: "Schema and contracts",
        paragraphs: [
          "Events are APIs. Evolve schemas with compatibility rules. Without contracts, consumers break silently.",
        ],
      },
    ],
    concepts: ["Competing consumer", "Fan-out", "Partitioned log", "Offset/commit", "DLQ"],
    practices: ["Define ordering keys", "Monitor lag SLOs", "Version event schemas"],
    pitfalls: ["Using Kafka as an ephemeral queue without retention thinking", "No DLQ", "Dual writes without outbox"],
    examples: [
      { title: "Kafka event backbone", description: "Many consumer groups, replayable history." },
      { title: "SQS workers", description: "Simple scalable task processing." },
    ],
    keyTakeaways: ["Pick queue vs log based on replay and fan-out needs", "Lag is a first-class metric", "Events need contracts"],
    whyItMatters: "Almost every scalable architecture uses async messaging; wrong primitive choice creates years of pain.",
    reflectionQuestions: ["Do your consumers need replay?"],
  },
  {
    id: "fund-distributed",
    title: "CAP, Consensus & Consistency",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    durationMinutes: 50,
    difficulty: "advanced",
    summary:
      "Distributed systems trade consistency, availability, and partition tolerance. CAP is a teaching lens; real designs pick consistency models and failure modes deliberately — consensus when you need one truth, weaker models when you need scale.",
    sections: [
      {
        title: "Partitions are inevitable",
        paragraphs: [
          "Networks fail in messy ways. During a partition you cannot have both perfect availability and linearizability across sides. PACELC adds: even without partitions, latency vs consistency trades remain.",
        ],
      },
      {
        title: "Consistency spectrum",
        paragraphs: [
          "Linearizability, sequential, causal, read-your-writes, eventual. Pick the weakest model that preserves product invariants — stronger models cost latency and availability.",
        ],
      },
      {
        title: "Consensus role",
        paragraphs: [
          "Raft/Paxos give a single committed history for small metadata. Do not put bulk data through consensus; shard and use weaker coordination where safe.",
        ],
      },
      {
        title: "Practical selection",
        paragraphs: [
          "Leader election for configuration; quorum reads/writes for medium strength; CRDTs for mergeable concurrent updates; saga/compensation when you cannot hold cross-service locks.",
        ],
      },
    ],
    concepts: ["CAP/PACELC", "Linearizability", "Quorum", "Consensus", "Eventual consistency"],
    practices: ["Name the consistency model per API", "Keep consensus for metadata", "Test partition behavior"],
    pitfalls: ["'We are CA'", "One global strongly consistent database for everything", "Ignoring client-side staleness"],
    examples: [
      { title: "etcd/ZooKeeper", description: "Consensus for coordination." },
      { title: "Dynamo-style stores", description: "Tunable quorums, eventual with repair." },
    ],
    keyTakeaways: ["Partitions force trade-offs", "Match model to invariants", "Consensus is precious and slow"],
    whyItMatters: "Consistency mistakes cause rare, catastrophic data bugs that tests miss.",
    reflectionQuestions: ["Which user-visible invariant requires strong consistency in your product?"],
  },
  {
    id: "fund-security",
    title: "AuthN, AuthZ, Encryption & Secrets",
    moduleId: "security",
    phaseId: "fundamentals",
    durationMinutes: 45,
    summary:
      "Authentication establishes identity; authorization decides permissions; encryption protects data in transit and at rest; secrets management prevents credential sprawl. System designs that bolt these on late leak.",
    sections: [
      {
        title: "AuthN patterns",
        paragraphs: [
          "Sessions, JWTs, mTLS for service identity, OAuth/OIDC for delegated user login. Know token lifetime, revocation, and audience restrictions.",
        ],
      },
      {
        title: "AuthZ models",
        paragraphs: [
          "RBAC, ABAC, ReBAC. Enforce on every data path — UI checks are not security. Central policy engines help, but local enforcement must fail closed.",
        ],
      },
      {
        title: "Encryption",
        paragraphs: [
          "TLS everywhere in transit. At rest: disk encryption plus field-level for sensitive columns. Key rotation and envelope encryption are part of the design.",
        ],
      },
      {
        title: "Secrets",
        paragraphs: [
          "No secrets in images or git. Use a vault/KMS with short-lived credentials. Audit access. Rotate on incident without redeploying everywhere.",
        ],
      },
    ],
    concepts: ["OIDC/OAuth", "JWT claims", "RBAC/ABAC", "mTLS", "Envelope encryption", "Secret rotation"],
    practices: ["Fail closed on authz errors", "Short-lived credentials", "Encrypt in transit by default"],
    pitfalls: ["Unsigned/weak JWT verification", "Authz only in UI", "Long-lived static cloud keys"],
    examples: [
      { title: "OIDC login + API gateway", description: "User identity propagated as verified claims." },
      { title: "SPIFFE/mTLS mesh", description: "Workload identity without static keys." },
    ],
    keyTakeaways: ["Identity and policy must cover every path", "Secrets are a lifecycle, not a string"],
    whyItMatters: "Security design failures become breaches; they are system design topics, not optional polish.",
    reflectionQuestions: ["Where can an internal service call another without identity?"],
  },
  {
    id: "db-modeling",
    title: "Data Modeling for Scale",
    moduleId: "databases",
    phaseId: "foundations",
    durationMinutes: 45,
    summary:
      "At scale, data models optimize for access patterns and partition keys, not only normalization purity. Good models make hot queries local and cheap; bad models force scatter-gather forever.",
    sections: [
      {
        title: "Access patterns first",
        paragraphs: [
          "List reads/writes with QPS and latency. Model around those paths. In partitioned stores, the partition key is the most important decision.",
        ],
      },
      {
        title: "Normalization vs denormalization",
        paragraphs: [
          "Normalize to protect write integrity; denormalize to protect read latency. Duplication requires clear update rules — CDC and application dual updates are options with different failure modes.",
        ],
      },
      {
        title: "Keys and hotspots",
        paragraphs: [
          "Monotonic keys create write hotspots. High cardinality + even access is ideal. Tenant+time composites need care to avoid skew.",
        ],
      },
      {
        title: "Evolving schemas",
        paragraphs: [
          "Expand/contract migrations, dual writes, and backfills. Avoid locking migrations on huge tables without a plan.",
        ],
      },
    ],
    concepts: ["Access-pattern modeling", "Partition key", "Denormalization", "Hot partition", "Expand/contract"],
    practices: ["Write access patterns before ER diagrams", "Avoid monotonic hot keys", "Plan migrations as first-class work"],
    pitfalls: ["Pretty schemas that cannot be sharded", "Unbounded fan-out reads", "Blocking DDL in peak"],
    examples: [
      { title: "DynamoDB single-table", description: "Access-pattern oriented design." },
      { title: "Postgres + read models", description: "Normalized OLTP + denormalized projections." },
    ],
    keyTakeaways: ["Scale models start from access paths", "Partition keys dominate", "Migrations need strategy"],
    whyItMatters: "You cannot fix a bad key choice with more hardware alone.",
    reflectionQuestions: ["What is the partition key for your hottest entity?"],
  },
  {
    id: "fund-consistency-models",
    title: "Consistency Models",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    durationMinutes: 45,
    difficulty: "advanced",
    summary:
      "Consistency models specify what observations clients may make. From linearizability to eventual consistency, each model enables and forbids certain anomalies — learn them to pick storage and API guarantees.",
    sections: [
      {
        title: "Linearizability and sequential consistency",
        paragraphs: [
          "Linearizability: operations appear instantaneously at a single point between invocation and response, globally. Sequential consistency allows reordering across clients but preserves each client's order.",
        ],
      },
      {
        title: "Causal and session models",
        paragraphs: [
          "Causal consistency preserves cause-before-effect. Session guarantees (read-your-writes, monotonic reads) are often what users actually need for a single device/login.",
        ],
      },
      {
        title: "Eventual consistency",
        paragraphs: [
          "If updates stop, replicas converge. During churn, stale reads and conflicts happen. Pair with conflict resolution (LWW, CRDT, app merge).",
        ],
      },
      {
        title: "Choosing per API",
        paragraphs: [
          "Payments capture may need strong guarantees; feed ranking may tolerate staleness. Document guarantees in API specs so clients do not invent them.",
        ],
      },
    ],
    concepts: ["Linearizability", "Sequential consistency", "Causal consistency", "Session guarantees", "Eventual consistency"],
    practices: ["Declare per-endpoint guarantees", "Test under delay/partition", "Avoid accidental stronger-than-needed costs"],
    pitfalls: ["One global model for all data", "Client retries assuming linearizability", "Hiding conflict resolution"],
    examples: [
      { title: "Spanner", description: "External consistency with TrueTime." },
      { title: "Dynamo", description: "Eventual with quorums and repair." },
    ],
    keyTakeaways: ["Models are product contracts", "Stronger ≠ always better", "Session guarantees cover many UX needs"],
    whyItMatters: "Misstated consistency is how you get heisenbugs and angry users after failover.",
    reflectionQuestions: ["Which of your APIs accidentally promise linearizability?"],
  },
  {
    id: "arch-event-cqrs",
    title: "Event-Driven, CQRS & Event Sourcing",
    moduleId: "architecture-patterns",
    phaseId: "architecture",
    durationMinutes: 50,
    difficulty: "advanced",
    summary:
      "Event-driven architectures communicate via events. CQRS separates write and read models. Event sourcing stores state as an append-only event log. Powerful patterns — easy to overcomplicate.",
    sections: [
      {
        title: "Event-driven integration",
        paragraphs: [
          "Services publish facts about what happened. Consumers update their own state. Loose coupling improves autonomy; debugging becomes distributed.",
        ],
      },
      {
        title: "CQRS",
        paragraphs: [
          "Writes optimize for invariants; reads optimize for queries via projections. Eventual consistency between sides is normal — design UX for it.",
        ],
      },
      {
        title: "Event sourcing",
        paragraphs: [
          "State = fold(events). Auditing and replay shine; schema evolution and snapshots become mandatory ops. Not every domain wants this complexity.",
        ],
      },
      {
        title: "When not to",
        paragraphs: [
          "CRUD with modest scale often needs a modular monolith first. Introduce events at real integration boundaries.",
        ],
      },
    ],
    concepts: ["Domain event", "Projection", "CQRS", "Event store", "Snapshotting"],
    practices: ["Keep events business-meaningful", "Version events", "Make projections rebuildable"],
    pitfalls: ["Event soup of technical notifications", "Unrebuildable read models", "CQRS everywhere by dogma"],
    examples: [
      { title: "Banking ledgers", description: "Natural event-sourced domains." },
      { title: "Shopping cart projections", description: "CQRS read models for queries." },
    ],
    keyTakeaways: ["Events decouple at a cost of complexity", "CQRS/ES need rebuild and versioning discipline"],
    whyItMatters: "These patterns dominate modern service design discussions; misuse creates distributed monoliths of events.",
    reflectionQuestions: ["Where do you need rebuildable audit history vs simple CRUD?"],
  },
  {
    id: "int-kafka",
    title: "Apache Kafka Internals",
    moduleId: "system-internals",
    phaseId: "internal-designs",
    kind: "living",
    durationMinutes: 55,
    difficulty: "advanced",
    summary:
      "Kafka is a distributed append-only log. Partitions, replicas, ISR, consumer groups, and the storage format explain its throughput and ordering guarantees — and its operational footguns.",
    sections: [
      {
        title: "Log and partitions",
        paragraphs: [
          "Topics split into partitions; each is an ordered log. Producers pick partitions (key hash or sticky). Ordering is per partition only.",
        ],
      },
      {
        title: "Replication and ISR",
        paragraphs: [
          "Leaders serve reads/writes; followers replicate. ISR is the in-sync set. acks=all with min.insync.replicas defines durability. Under-replicated partitions are a red alert.",
        ],
      },
      {
        title: "Consumers",
        paragraphs: [
          "Groups divide partitions among members. Rebalances pause work — avoid frequent membership churn. Commits mark progress; auto-commit can skip or duplicate.",
        ],
      },
      {
        title: "Storage and KRaft",
        paragraphs: [
          "Segments on disk, retention by time/size, compaction for changelog topics. KRaft replaces ZooKeeper for metadata in modern deployments.",
        ],
      },
    ],
    concepts: ["Partition log", "ISR", "Consumer group", "Offset commit", "Log compaction", "KRaft"],
    practices: ["Size partitions for parallelism without oversharing", "Alert on under-replicated", "Tune retention explicitly"],
    pitfalls: ["Assuming global order", "Tiny messages without batching", "Rebalance storms"],
    examples: [{ title: "Event backbone", description: "Multi-team consumer groups on shared topics." }],
    keyTakeaways: ["Kafka = partitioned replicated log", "Ordering and durability are configurable", "Ops is half the product"],
    whyItMatters: "Kafka underpins many event-driven designs; internals knowledge prevents data loss and lag outages.",
    reflectionQuestions: ["What is your durability setting — and have you tested broker loss?"],
  },
  {
    id: "ti-batching",
    title: "Continuous Batching & Paged Attention",
    moduleId: "inference-serving",
    phaseId: "training-inference",
    kind: "living",
    durationMinutes: 50,
    difficulty: "advanced",
    summary:
      "Continuous batching keeps GPUs busy by admitting new requests as others finish tokens. Paged attention makes the KV memory layout practical at high concurrency — the core of modern LLM serving efficiency.",
    sections: [
      {
        title: "From static to continuous batching",
        paragraphs: [
          "Static batching waits for an entire batch to finish before admitting new work — short requests pad behind long ones. Continuous (iteration-level) batching schedules at each decode step, so finished sequences free slots immediately.",
          "The scheduler must account for KV memory, fairness, and latency SLOs. Without memory awareness, admitting too many sequences causes OOM; without fairness, long generations starve short interactive requests.",
        ],
      },
      {
        title: "Paged attention",
        paragraphs: [
          "Paged attention stores KV in non-contiguous blocks tracked by a block table, similar to OS virtual memory. This cuts waste from reserving max-context contiguous buffers per sequence and enables sharing blocks for identical prefixes.",
        ],
      },
      {
        title: "Scheduling policy",
        paragraphs: [
          "FCFS vs priority vs SLO classes. Preemption and chunked prefill change TTFT. Production systems expose separate pools for interactive vs batch.",
        ],
      },
      {
        title: "Autoscaling signals",
        paragraphs: [
          "GPU util alone misleads. Queue time, KV memory headroom, and tokens/s per SLO class are better signals.",
        ],
      },
    ],
    deepDive: [
      {
        title: "Prefix caching",
        paragraphs: [
          "Shared system prompts can reuse KV blocks across requests. Measure hit rate; cold starts still hurt TTFT.",
        ],
      },
      {
        title: "Failure and restart",
        paragraphs: [
          "In-flight generations die with the worker unless you checkpoint. Design client retry with idempotent chat continuation.",
        ],
      },
    ],
    concepts: ["Continuous batching", "KV block table", "Prefix cache", "TTFT vs TPOT", "Admission control"],
    practices: ["Expose KV memory metrics", "Separate SLO classes", "Load test with realistic length mixes"],
    pitfalls: ["Autoscaling on GPU util only", "Ignoring fragmentation without paging", "One pool for batch and interactive"],
    examples: [{ title: "vLLM", description: "Paged attention + continuous batching reference design." }],
    keyTakeaways: ["Serving efficiency is scheduling + memory layout", "KV is the scarce resource"],
    whyItMatters: "Cost per token at scale depends more on batching/KV than peak TFLOPs.",
    reflectionQuestions: ["What signals would you use to autoscale an inference pool?"],
  },
  {
    id: "ag-rag-core",
    title: "Chunking, Hybrid Search & Reranking",
    moduleId: "rag-systems",
    phaseId: "agentic-systems",
    kind: "living",
    durationMinutes: 50,
    summary:
      "RAG quality is dominated by retrieval design: how you chunk, what you index, how you fuse lexical and dense signals, and how you rerank before generation.",
    sections: [
      {
        title: "Chunking is an API contract",
        paragraphs: [
          "Chunk size, overlap, and metadata (title, section path, ACLs, timestamps) determine what the model can cite. Over-long chunks dilute embeddings; over-short chunks lose context. Structure-aware chunking usually beats fixed character windows.",
        ],
      },
      {
        title: "Hybrid retrieval",
        paragraphs: [
          "Lexical search handles rare identifiers; dense vectors handle paraphrase. Fuse with RRF or learned fusion, then rerank a shortlist.",
        ],
      },
      {
        title: "ACLs and grounding",
        paragraphs: [
          "Enforce document ACLs before prompt construction. Log chunk ids with answers for debugging. Require citations when stakes are high.",
        ],
      },
      {
        title: "Eval loop",
        paragraphs: [
          "Build a retrieval eval set before endless prompt tweaking. Most 'model' failures are retrieval failures.",
        ],
      },
    ],
    concepts: ["Chunking", "Hybrid search", "Reranker", "ACL filtering", "Citation"],
    practices: ["Eval retrieval quality", "Structure-aware chunking", "Log retrieved ids"],
    pitfalls: ["Bigger model to fix bad retrieval", "No ACL filter", "Chunks without metadata"],
    examples: [{ title: "Enterprise search copilots", description: "Hybrid + rerank + ACL." }],
    keyTakeaways: ["RAG is IR plus an LLM", "Evals beat vibes"],
    whyItMatters: "Production RAG failures are usually retrieval and permissioning failures.",
    reflectionQuestions: ["How would you detect a retrieval regression in CI?"],
  },
];

function main() {
  let n = 0;
  for (const spec of specs) {
    writeJson(lessonPath(spec.moduleId, spec.id), buildRichLesson(spec));
    console.log(`wrote ${spec.id}`);
    n++;
  }
  console.log(`Enriched ${n} fundamentals/advanced lessons`);
}

main();
