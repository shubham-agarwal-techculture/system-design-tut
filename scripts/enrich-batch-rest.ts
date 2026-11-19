import { lessonPath, writeJson } from "./content/lib.ts";
import { buildRichLesson, type RichSpec } from "./content/rich-lesson.ts";

const specs: RichSpec[] = [
  {
    id: "net-lb-proxy",
    title: "Load Balancing & Reverse Proxies",
    moduleId: "networking",
    phaseId: "foundations",
    durationMinutes: 45,
    summary:
      "Load balancers distribute traffic across backends; reverse proxies terminate client connections and apply routing, TLS, and policy. L4 vs L7 choice, health checks, and algorithm selection define availability and latency.",
    sections: [
      {
        title: "L4 vs L7",
        paragraphs: [
          "L4 balances connections/packets by IP/port — cheap and protocol-agnostic. L7 understands HTTP: path routing, header-based canaries, authn hooks, and compression. L7 costs more CPU per request.",
          "Many architectures stack both: L4 at the edge VIP, L7 at the application gateway.",
        ],
      },
      {
        title: "Algorithms and health",
        paragraphs: [
          "Round-robin, least-conn, Maglev/consistent hashing for cache friendliness and connection stickiness. Passive checks must match real readiness — accepting connections ≠ able to serve.",
          "Slow-start and connection draining prevent thundering herds during deploys.",
        ],
      },
      {
        title: "Failure domains",
        paragraphs: [
          "Misconfigured health checks flap backends. Retry storms from proxies amplify outages — budget retries. Timeouts must be tighter than upstream client timeouts.",
        ],
      },
      {
        title: "Proxy as policy point",
        paragraphs: [
          "Modern proxies (Envoy, Nginx, HAProxy) implement mTLS, WAF rules, rate limits, and observability. Keep business logic out of the proxy when possible.",
        ],
      },
    ],
    concepts: ["L4/L7", "Consistent hashing", "Active health checks", "Connection draining", "Retry budget"],
    practices: ["Align timeout budgets end-to-end", "Drain before shutdown", "Health-check the real dependency path"],
    pitfalls: ["Retries without budgets", "Shallow health checks", "Sticky sessions as a crutch for bad state design"],
    examples: [
      { title: "AWS ALB/NLB", description: "Managed L7/L4 balancers." },
      { title: "Envoy gateway", description: "L7 policy and observability." },
    ],
    keyTakeaways: ["Pick L4 vs L7 deliberately", "Health + retries define outage shape", "Proxies are policy, not business logic"],
    whyItMatters: "Every multi-instance service needs balancing; poor LB design causes cascading failures.",
    reflectionQuestions: ["Where do retries live in your stack — and are they budgeted?"],
  },
  {
    id: "net-realtime",
    title: "WebSockets & gRPC",
    moduleId: "networking",
    phaseId: "foundations",
    durationMinutes: 40,
    summary:
      "WebSockets provide full-duplex browser-friendly streams over HTTP upgrades. gRPC provides efficient HTTP/2 (and HTTP/3) RPCs with protobuf contracts, streaming, and deadlines — the workhorses of realtime and service-to-service calls.",
    sections: [
      {
        title: "WebSockets",
        paragraphs: [
          "After an HTTP upgrade, frames flow both ways. Great for collaborative apps and live feeds. Proxies must support idle timeouts, sticky routing or shared pubsub for multi-node fanout, and backpressure.",
        ],
      },
      {
        title: "gRPC basics",
        paragraphs: [
          "Protobuf contracts, code generation, deadlines/cancellation, and unary or streaming RPCs. HTTP/2 multiplexing reduces connection sprawl vs naive HTTP/1.1.",
        ],
      },
      {
        title: "Operational concerns",
        paragraphs: [
          "Load balancers need HTTP/2 awareness. Deadlines must propagate. Large streams need flow control. Browser clients often use gRPC-Web.",
        ],
      },
      {
        title: "Choosing",
        paragraphs: [
          "Browser realtime UX → WebSockets/SSE. Service mesh RPC → gRPC. Public third parties → often JSON HTTP for simplicity.",
        ],
      },
    ],
    concepts: ["HTTP upgrade", "HTTP/2 multiplexing", "Protobuf", "Deadlines", "Bidirectional streaming"],
    practices: ["Propagate deadlines", "Plan multi-node fanout for sockets", "Version protobuf APIs carefully"],
    pitfalls: ["Ignoring proxy idle timeouts", "No deadline propagation", "Chatty unary RPCs that should stream"],
    examples: [
      { title: "Chat/presence", description: "WebSocket fanout with Redis/NATS." },
      { title: "Microservice RPC", description: "gRPC with deadlines and retries." },
    ],
    keyTakeaways: ["Realtime needs first-class connection management", "gRPC shines with contracts and streaming"],
    whyItMatters: "Interactive products and internal RPC meshes depend on these protocols.",
    reflectionQuestions: ["How do you fan out a WebSocket event across many nodes?"],
  },
  {
    id: "db-replication-sharding",
    title: "Replication & Sharding",
    moduleId: "databases",
    phaseId: "foundations",
    durationMinutes: 50,
    difficulty: "advanced",
    summary:
      "Replication copies data for durability and read scale; sharding splits data for write/storage scale. Together they define how databases grow — and how consistency and operational complexity grow with them.",
    sections: [
      {
        title: "Replication topologies",
        paragraphs: [
          "Primary-replica async replication is common: fast writes, possible loss on failover. Semi-sync and quorum replication reduce loss windows. Multi-primary increases conflict complexity.",
        ],
      },
      {
        title: "Sharding strategies",
        paragraphs: [
          "Hash, range, and directory-based sharding. Resharding is the expensive part — plan early. Cross-shard transactions should be rare.",
        ],
      },
      {
        title: "Read your writes",
        paragraphs: [
          "Async replicas cause stale reads. Session stickiness, primary reads for critical paths, or causal tokens mitigate.",
        ],
      },
      {
        title: "Ops realities",
        paragraphs: [
          "Failover automation, replica lag alerts, backup per shard, and schema change coordination dominate real-world success.",
        ],
      },
    ],
    concepts: ["Async vs sync replication", "Failover", "Hash/range sharding", "Resharding", "Replica lag"],
    practices: ["Alert on lag", "Avoid cross-shard transactions", "Automate failover carefully"],
    pitfalls: ["Sharding before needed", "Ignoring reshard cost", "Reading replicas for strong consistency paths"],
    examples: [
      { title: "Postgres primary + replicas", description: "Read scale with lag awareness." },
      { title: "Vitess/Cockroach", description: "Sharded or distributed SQL approaches." },
    ],
    keyTakeaways: ["Replication ≠ free consistency", "Sharding keys are destiny", "Resharding must be planned"],
    whyItMatters: "Database scale-out is where many systems hit a wall; these are the levers.",
    reflectionQuestions: ["What is your shard key — and what query cannot use it?"],
  },
  {
    id: "fund-cdn",
    title: "CDN Design",
    moduleId: "caching",
    phaseId: "fundamentals",
    durationMinutes: 40,
    summary:
      "CDNs push content to edge PoPs to cut latency and origin load. Cache keys, TTLs, purge, and dynamic vs static splitting determine hit rates and correctness.",
    sections: [
      {
        title: "What CDNs optimize",
        paragraphs: [
          "RTT to nearby PoPs, TLS termination, and absorption of traffic spikes/DDoS. Origins see fewer requests when cacheability is high.",
        ],
      },
      {
        title: "Cacheability rules",
        paragraphs: [
          "Cache-Control, Vary, and signed URLs. Personalized content needs careful keys or origin shielding. One bad Vary can destroy hit rate.",
        ],
      },
      {
        title: "Purge and consistency",
        paragraphs: [
          "Hard purge vs soft TTL. Global purge latency is not zero. Versioned URLs often beat emergency purge dependency.",
        ],
      },
      {
        title: "Dynamic acceleration",
        paragraphs: [
          "Even uncacheable APIs benefit from edge TCP/TLS and Argo-like routing. Split static and API hostnames consciously.",
        ],
      },
    ],
    concepts: ["PoP", "Cache key / Vary", "Origin shield", "Purge", "TLS termination at edge"],
    practices: ["Version static assets", "Separate cookie-less static hosts", "Measure edge hit ratio"],
    pitfalls: ["Caching personalized HTML globally", "Purge as the only release mechanism", "Ignoring Vary"],
    examples: [{ title: "Cloudflare/Fastly/Akamai", description: "Edge networks with rich cache APIs." }],
    keyTakeaways: ["CDN is a global cache + ingress", "Keys and TTLs define correctness", "Versioning beats panic purge"],
    whyItMatters: "User-perceived latency often dies or thrives at the edge.",
    reflectionQuestions: ["What percentage of your bytes are cacheable today?"],
  },
  {
    id: "fund-crdts",
    title: "CRDTs",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    durationMinutes: 45,
    difficulty: "advanced",
    summary:
      "Conflict-free Replicated Data Types merge concurrent updates without coordination. They enable local-first and multi-master designs when you can accept their semantics and metadata costs.",
    sections: [
      {
        title: "Why CRDTs",
        paragraphs: [
          "When replicas accept writes offline, conflicts happen. CRDTs mathematically guarantee convergence with defined merge functions — G-Counter, OR-Set, LWW-Register, and richer text types.",
        ],
      },
      {
        title: "State vs operation based",
        paragraphs: [
          "State-based (CvRDT) gossip full state merges; op-based (CmRDT) reliably deliver operations. Trade bandwidth vs delivery assumptions.",
        ],
      },
      {
        title: "Costs and limits",
        paragraphs: [
          "Metadata growth (tombstones, version vectors) needs compaction. Not every business invariant is mergeable — money transfer is the classic counterexample without extra constraints.",
        ],
      },
      {
        title: "Fit",
        paragraphs: [
          "Collaborative editing, presence, feature flags, shopping carts — good fits. Banking ledgers — usually not without additional protocol.",
        ],
      },
    ],
    concepts: ["Strong eventual consistency", "OR-Set", "LWW", "Tombstones", "Local-first"],
    practices: ["Pick CRDT type matching invariants", "Plan compaction", "Test concurrent merges"],
    pitfalls: ["Using LWW for everything", "Unbounded tombstones", "Assuming CRDTs replace all consensus"],
    examples: [
      { title: "Automerge/Yjs", description: "Collaborative document CRDTs." },
      { title: "Redis CRDTs / Riak", description: "Data-store embedded types." },
    ],
    keyTakeaways: ["CRDTs converge without locks", "Semantics and metadata cost matter", "Not universal"],
    whyItMatters: "Offline-first and multi-region active-active designs need conflict strategies — CRDTs are a primary tool.",
    reflectionQuestions: ["Which of your data types are naturally mergeable?"],
  },
  {
    id: "fund-distributed-tx",
    title: "Distributed Transactions (2PC, Sagas)",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    durationMinutes: 45,
    difficulty: "advanced",
    summary:
      "Cross-service atomicity is hard. Two-phase commit coordinates strong atomicity at high cost; sagas use sequenced local transactions with compensations for practical workflows.",
    sections: [
      {
        title: "2PC mechanics",
        paragraphs: [
          "Prepare then commit. Blocking on coordinator failure is the classic weakness. XA works in narrow environments; across microservices and heterogeneous stores it is painful.",
        ],
      },
      {
        title: "Sagas",
        paragraphs: [
          "Each step commits locally; on failure, run compensations. Orchestration vs choreography styles. Idempotency is mandatory.",
        ],
      },
      {
        title: "Outbox pairing",
        paragraphs: [
          "Transactional outbox starts reliable saga messages. Without it, dual writes reopen the original consistency hole.",
        ],
      },
      {
        title: "Choosing",
        paragraphs: [
          "Prefer single-service transactions when possible. Use sagas for long business workflows. Reserve 2PC for tightly controlled homogeneous systems.",
        ],
      },
    ],
    concepts: ["2PC", "Compensation", "Orchestration vs choreography", "Idempotent steps", "Outbox"],
    practices: ["Design compensations explicitly", "Make steps idempotent", "Prefer local ACID when possible"],
    pitfalls: ["Distributed monolith via chatty 2PC", "Non-idempotent compensations", "No timeout/repair path"],
    examples: [
      { title: "Order → payment → inventory", description: "Classic saga." },
    ],
    keyTakeaways: ["Avoid distributed tx when you can", "Sagas trade atomicity for availability", "Compensations are product behavior"],
    whyItMatters: "Microservices without a transaction story create inconsistent business state.",
    reflectionQuestions: ["What is the compensation for each step in your checkout flow?"],
  },
  {
    id: "pat-saga",
    title: "Saga & Process Managers",
    moduleId: "software-patterns",
    phaseId: "design-patterns",
    durationMinutes: 40,
    summary:
      "Process managers/sagas coordinate multi-step business workflows across services with explicit state machines, timeouts, and compensations — a pattern-level view of distributed transactions.",
    sections: [
      {
        title: "Process manager role",
        paragraphs: [
          "A process manager listens to events, advances a workflow state machine, and commands participants. It owns the workflow state, not the domain aggregates' invariants.",
        ],
      },
      {
        title: "State and timeouts",
        paragraphs: [
          "Persist workflow state. Timeouts trigger probes or compensations. Humans may be in the loop for exceptional paths.",
        ],
      },
      {
        title: "Implementation tips",
        paragraphs: [
          "Use durable workflow engines (Temporal, Cadence) or carefully built state machines. Exactly-once side effects still need idempotency keys.",
        ],
      },
      {
        title: "Anti-patterns",
        paragraphs: [
          "God orchestrators that encode all business logic. Prefer managers that coordinate while domains keep invariants.",
        ],
      },
    ],
    concepts: ["Process manager", "Workflow state", "Compensation", "Durable execution"],
    practices: ["Persist state transitions", "Timeout every step", "Keep domains authoritative"],
    pitfalls: ["Orchestrator as monolith", "Lost workflow state on crash", "Missing compensations"],
    examples: [{ title: "Temporal workflows", description: "Durable process managers as code." }],
    keyTakeaways: ["Sagas are state machines with compensations", "Durability and idempotency are required"],
    whyItMatters: "Long-running business processes are everywhere in real systems.",
    reflectionQuestions: ["Where do you store workflow progress today?"],
  },
  {
    id: "ml-attention-kv",
    title: "Attention Cost & KV Cache",
    moduleId: "ml-transformers",
    phaseId: "ml-foundations",
    kind: "evergreen",
    durationMinutes: 50,
    summary:
      "Transformers spend memory and compute on attention. The KV cache is the dominant serving-memory cost during decode — system designers must treat it as a first-class resource.",
    sections: [
      {
        title: "Why attention dominates the systems budget",
        paragraphs: [
          "Self-attention lets every token attend to earlier tokens. Autoregressive decode reuses prior keys/values via the KV cache so they are not recomputed.",
          "Cache size grows with batch × layers × heads × sequence × dtype — frequently the binding constraint on GPU memory before FLOPs are exhausted.",
        ],
        bullets: ["Prefill: compute-heavy", "Decode: memory-bandwidth heavy", "KV cache: stored keys/values per layer"],
      },
      {
        title: "Design implications",
        paragraphs: [
          "Paged attention treats KV like virtual memory pages. Prefix caching reuses shared prompts. Prefill/decode split can raise utilization for mixed traffic.",
          "Capacity models start from concurrent sequences × context × bytes per KV element × layers vs HBM.",
        ],
      },
      {
        title: "Quantization and speculation",
        paragraphs: [
          "KV quantization and speculative decoding change the cost curve but do not remove the need for memory budgets.",
        ],
      },
      {
        title: "Product trade-offs",
        paragraphs: [
          "Longer context windows are a memory product decision as much as a model decision. Price and rate-limit accordingly.",
        ],
      },
    ],
    concepts: ["KV cache", "Prefill vs decode", "Paged attention", "Prefix cache", "HBM budget"],
    practices: ["Budget GPU memory from KV first", "Measure prefix cache hit rates", "Separate TTFT and decode SLOs"],
    pitfalls: ["Sizing fleets from FLOPs alone", "Ignoring fragmentation", "Unlimited context without pricing"],
    examples: [{ title: "vLLM paged attention", description: "Practical KV memory management." }],
    keyTakeaways: ["KV often limits LLM serving", "Systems tricks manage it", "Context is a cost dial"],
    whyItMatters: "Without KV-aware capacity models, inference platforms OOM under realistic concurrency.",
    reflectionQuestions: ["How would you estimate max concurrent 8k-context sessions on an 80GB GPU?"],
  },
  {
    id: "ag-tools",
    title: "Tool Calling & Planner/Executor",
    moduleId: "agent-architectures",
    phaseId: "agentic-systems",
    kind: "living",
    durationMinutes: 45,
    summary:
      "Agents act by calling tools. Planner/executor patterns separate deciding what to do from doing it — with schemas, permissions, and retries that look a lot like distributed systems design.",
    sections: [
      {
        title: "Tools as APIs",
        paragraphs: [
          "Each tool needs a schema, authz, timeout, and idempotency story. The LLM proposes calls; your runtime validates and executes.",
        ],
      },
      {
        title: "Planner vs executor",
        paragraphs: [
          "Planners produce steps; executors run tools and return observations. Loops continue until stop conditions. Bound steps and tokens.",
        ],
      },
      {
        title: "Safety",
        paragraphs: [
          "Least privilege tools. Human approval for irreversible actions. Sandbox code execution. Log every call for audit.",
        ],
      },
      {
        title: "Reliability",
        paragraphs: [
          "Tool failures need retries with budgets. Partial success in multi-tool plans needs compensating actions — sagas again.",
        ],
      },
    ],
    concepts: ["Tool schema", "Planner/executor", "Step budget", "Least privilege", "Approval gates"],
    practices: ["Validate tool args", "Bound loops", "Approve high-risk tools"],
    pitfalls: ["Unsandboxed shell tools", "Unbounded agent loops", "No audit log"],
    examples: [{ title: "Coding agents", description: "Editor/tools with sandboxed terminals." }],
    keyTakeaways: ["Tools are secured APIs", "Agents need budgets and approvals", "Failures need compensations"],
    whyItMatters: "Agent products are distributed systems that can take irreversible actions — design them accordingly.",
    reflectionQuestions: ["Which tools require human approval in your agent?"],
  },
  {
    id: "infra-observability-deep",
    title: "Metrics, Logs, Traces & Exemplars",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    durationMinutes: 45,
    summary:
      "Observability explains system behavior from outside: metrics for aggregates, logs for events, traces for request journeys, exemplars linking them. Designing telemetry is part of system design.",
    sections: [
      {
        title: "Three pillars — and linking them",
        paragraphs: [
          "Metrics alert and dashboard. Logs debug specifics. Traces show causal paths across services. Exemplars and trace IDs connect a metric spike to example requests.",
        ],
      },
      {
        title: "Golden signals and SLIs",
        paragraphs: [
          "Latency, traffic, errors, saturation. Define SLIs from user journeys, not only host CPU.",
        ],
      },
      {
        title: "Cardinality and cost",
        paragraphs: [
          "High-cardinality labels explode metric cost. Sample traces; structure logs; drop noisy fields. Telemetry has a budget.",
        ],
      },
      {
        title: "Instrumentation practice",
        paragraphs: [
          "Propagate context across async boundaries. Prefer OpenTelemetry. Make dashboards and alerts owned by the same team as the service.",
        ],
      },
    ],
    concepts: ["Golden signals", "Cardinality", "Distributed tracing", "Exemplars", "OpenTelemetry"],
    practices: ["Budget telemetry cost", "Propagate trace context", "Alert on SLIs/burn rates"],
    pitfalls: ["Metric label explosion", "Logs without request ids", "Dashboards nobody owns"],
    examples: [{ title: "OTel + Prometheus + Jaeger", description: "Common open stack." }],
    keyTakeaways: ["Telemetry is a product requirement", "Link pillars", "Control cardinality"],
    whyItMatters: "You cannot operate what you cannot see — and blind systems fail longer.",
    reflectionQuestions: ["Can you jump from an SLO burn alert to an example trace in two clicks?"],
  },
];

function main() {
  let n = 0;
  for (const spec of specs) {
    writeJson(lessonPath(spec.moduleId, spec.id), buildRichLesson(spec));
    console.log(`wrote ${spec.id}`);
    n++;
  }
  console.log(`Enriched ${n} lessons`);
}

main();
