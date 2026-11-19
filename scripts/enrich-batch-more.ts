import { lessonPath, writeJson } from "./content/lib.ts";
import { buildRichLesson, type RichSpec } from "./content/rich-lesson.ts";

const specs: RichSpec[] = [
  {
    id: "net-kernel",
    title: "Kernel Networking (epoll, io_uring)",
    moduleId: "networking",
    phaseId: "foundations",
    kind: "evergreen",
    durationMinutes: 45,
    summary:
      "High-performance servers avoid blocking I/O. epoll/kqueue provide readiness multiplexing; io_uring offers completion-based async I/O with fewer syscalls. These primitives explain how Nginx, Envoy, and custom RPC servers reach high concurrency.",
    sections: [
      {
        title: "From threads-per-connection to event loops",
        paragraphs: [
          "Blocking sockets with one thread per connection collapse under tens of thousands of idle connections. Event-driven models register interest in readability/writability and run callbacks when ready.",
          "The C10K problem popularized non-blocking I/O. Modern proxies routinely handle hundreds of thousands of concurrent connections on few threads using epoll or kqueue.",
        ],
      },
      {
        title: "epoll and kqueue",
        paragraphs: [
          "epoll (Linux) waits on many file descriptors efficiently. Edge-triggered vs level-triggered modes change how you drain sockets. Mishandling ET leads to stalls.",
          "kqueue (BSD/macOS) is the analogue. Portable libraries (libuv, mio) abstract these for runtimes like Node and Rust Tokio.",
        ],
      },
      {
        title: "io_uring",
        paragraphs: [
          "io_uring submits I/O via shared rings, reducing syscall overhead and enabling batched completions. It covers sockets, files, and more — with careful attention to buffer management and security (SQPOLL privileges).",
          "Not every workload benefits; complexity and kernel version requirements matter. Measure before rewriting.",
        ],
      },
      {
        title: "Design consequences",
        paragraphs: [
          "Backpressure must be explicit in event loops — unbounded queues blow memory. Thread pools still help for CPU-heavy work adjacent to the loop.",
          "When designing services, knowing whether your runtime is readiness-based or blocking changes timeout, cancellation, and head-of-line behavior.",
        ],
      },
    ],
    concepts: ["Non-blocking I/O", "epoll/kqueue", "Edge vs level trigger", "io_uring SQ/CQ rings", "Event-loop backpressure"],
    practices: ["Drain sockets fully in ET mode", "Bound event-loop queues", "Keep CPU work off the loop thread"],
    pitfalls: ["Blocking the event loop", "Ignoring write readiness", "Copying huge buffers per syscall"],
    examples: [
      { title: "Nginx/Envoy", description: "epoll-driven proxies." },
      { title: "Tokio / Node", description: "Runtimes over OS readiness APIs." },
    ],
    keyTakeaways: ["Concurrency at scale needs non-blocking I/O", "epoll/io_uring are the substrate of modern servers", "Backpressure is part of the design"],
    whyItMatters: "You cannot reason about proxy capacity or async runtimes without the OS I/O model.",
    reflectionQuestions: ["Does your service block the event loop on disk or DNS?"],
  },
  {
    id: "os-numa",
    title: "NUMA & Memory Hierarchy",
    moduleId: "operating-systems",
    phaseId: "foundations",
    kind: "evergreen",
    durationMinutes: 40,
    summary:
      "On multi-socket machines, memory access cost depends on which CPU owns the DIMM. NUMA-aware placement of threads and buffers can dominate low-latency and high-throughput performance.",
    sections: [
      {
        title: "What NUMA changes",
        paragraphs: [
          "Uniform memory assumptions fail on multi-socket servers. Remote memory access adds latency and reduces bandwidth. Allocators and thread schedulers that ignore locality leave performance on the table.",
          "For trading engines, packet processing, and in-memory databases, NUMA can mean double-digit percent latency differences.",
        ],
      },
      {
        title: "Placement strategies",
        paragraphs: [
          "Pin threads to nodes; allocate memory first-touch on the same node; avoid false sharing across cache lines. Tools: numactl, hwloc, perf.",
          "Shared structures either replicate per node or accept remote access with careful design.",
        ],
      },
      {
        title: "Interaction with NICs and GPUs",
        paragraphs: [
          "NIC IRQ affinity and GPU affinity should match the consuming CPU node. Cross-node PCIe traffic is a silent tax.",
        ],
      },
      {
        title: "When to care",
        paragraphs: [
          "Single-socket cloud VMs may hide NUMA. Bare metal and large instances expose it. Benchmark with production-like pinning.",
        ],
      },
    ],
    concepts: ["Local vs remote memory", "First-touch allocation", "CPU pinning", "Cache line false sharing"],
    practices: ["Measure before pinning blindly", "Colocate IRQ, thread, and memory", "Watch for cross-node bandwidth saturation"],
    pitfalls: ["Assuming all RAM is equal", "Over-pinning without measuring", "Ignoring NIC/GPU locality"],
    examples: [{ title: "DPDK apps", description: "Per-NUMA queues and memory pools." }],
    keyTakeaways: ["Memory locality is a first-class design input on multi-socket hosts", "Pinning + first-touch are the basic tools"],
    whyItMatters: "Low-latency and high-throughput systems often lose more to NUMA than to algorithm choice.",
    reflectionQuestions: ["Is your deployment single-socket or multi-socket in production?"],
  },
  {
    id: "fund-vector-db",
    title: "Vector Databases",
    moduleId: "storage",
    phaseId: "fundamentals",
    kind: "living",
    durationMinutes: 45,
    summary:
      "Vector databases store embeddings and serve approximate nearest neighbor (ANN) search. Index structures (HNSW, IVF, PQ) trade recall, latency, memory, and build cost — central to RAG and recommendation.",
    sections: [
      {
        title: "Why specialized stores",
        paragraphs: [
          "Exact kNN is expensive in high dimensions. ANN indexes give sublinear search with tunable recall. Relational DBs adding vector indexes blur lines, but dedicated systems optimize memory layouts and filtering.",
        ],
      },
      {
        title: "Core index families",
        paragraphs: [
          "HNSW: graph over vectors, strong recall/latency, memory hungry. IVF: cluster then search subsets. PQ/OPQ: compress vectors for memory and distance estimation.",
          "Hybrid queries combine metadata filters with ANN — filter-then-search vs search-then-filter changes recall and cost.",
        ],
      },
      {
        title: "Operational realities",
        paragraphs: [
          "Index build time, incremental inserts, deletes, and rebalancing matter. Embedding model changes require full re-embed + reindex.",
          "Measure recall@k on a labeled set; latency alone can hide quality regressions.",
        ],
      },
      {
        title: "Design fit",
        paragraphs: [
          "Use vectors for semantic retrieval, not as a general database. Keep source-of-truth documents elsewhere; store pointers and metadata with vectors.",
        ],
      },
    ],
    concepts: ["ANN", "HNSW", "IVF", "Product quantization", "Recall@k", "Hybrid filter + search"],
    practices: ["Track recall with eval sets", "Version embedding models with indexes", "Benchmark filtered queries separately"],
    pitfalls: ["Chasing latency without recall", "Re-embedding without reindexing plan", "Storing only vectors without document ACLs"],
    examples: [
      { title: "FAISS / ScaNN", description: "Library-level ANN building blocks." },
      { title: "Milvus / Pinecone / pgvector", description: "Managed or SQL-integrated vector search." },
    ],
    keyTakeaways: ["Vector DBs are ANN systems with ops concerns", "Recall and filters dominate design", "Embeddings are versioned artifacts"],
    whyItMatters: "RAG and semantic features are now mainstream system design topics; vector index literacy is required.",
    reflectionQuestions: ["How would you roll forward an embedding model change with zero downtime?"],
  },
  {
    id: "fund-slos",
    title: "SLOs & Error Budgets",
    moduleId: "reliability",
    phaseId: "fundamentals",
    kind: "evergreen",
    durationMinutes: 40,
    summary:
      "Service Level Objectives define how reliable a service must be from the user view. Error budgets convert that into a measurable allowance for change velocity vs stability.",
    sections: [
      {
        title: "SLI, SLO, SLA",
        paragraphs: [
          "SLI: measured indicator (availability, latency). SLO: target on that indicator. SLA: contractual consequences. Engineers manage SLOs; legal owns SLAs.",
          "Choose SLIs that mirror user pain — successful requests / total, or fraction under latency threshold — not CPU idle.",
        ],
      },
      {
        title: "Error budgets",
        paragraphs: [
          "If SLO is 99.9% monthly availability, budget is 0.1% failure. Burn the budget with incidents or risky releases; when exhausted, freeze features and fix reliability.",
          "Multi-window burn-rate alerts catch fast burns (pages) and slow burns (tickets).",
        ],
      },
      {
        title: "Setting targets",
        paragraphs: [
          "Tighter than dependencies is impossible long-term. Stack SLOs with dependency math. Leave margin.",
          "Different user journeys may need different SLOs (checkout vs admin export).",
        ],
      },
      {
        title: "Culture",
        paragraphs: [
          "Error budgets only work if leadership honors them. Otherwise they become dashboards nobody follows.",
        ],
      },
    ],
    concepts: ["SLI", "SLO", "Error budget", "Burn rate", "User journey SLIs"],
    practices: ["Alert on burn rate, not raw CPU", "Review budget in planning", "Align SLOs to dependencies"],
    pitfalls: ["SLO on vanity metrics", "100% targets", "Ignoring dependency ceilings"],
    examples: [{ title: "Google SRE workbook", description: "Canonical error budget practice." }],
    keyTakeaways: ["SLOs quantify reliability as a product feature", "Budgets balance change vs stability"],
    whyItMatters: "Without SLOs, teams argue opinions. With them, reliability work gets prioritized rationally.",
    reflectionQuestions: ["What is the user-facing SLI for your most critical journey?"],
  },
  {
    id: "infra-service-mesh",
    title: "Service Mesh Deep Dive",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    kind: "living",
    durationMinutes: 45,
    summary:
      "A service mesh inserts a data plane (usually Envoy sidecars or ambient proxies) to provide mTLS, retries, timeouts, observability, and traffic splitting uniformly — at the cost of complexity and latency.",
    sections: [
      {
        title: "Problem statement",
        paragraphs: [
          "Microservices reimplement RPC concerns inconsistently. A mesh centralizes policy in proxies next to workloads or on nodes.",
          "Control planes (Istio, Linkerd, Consul) push configuration; data planes carry traffic.",
        ],
      },
      {
        title: "Features that matter",
        paragraphs: [
          "mTLS identity, retries with budgets, timeouts, outlier detection, canaries, and golden signals telemetry.",
          "Ambition creep — turning the mesh into a business-rules engine — creates opaque failure domains.",
        ],
      },
      {
        title: "Costs",
        paragraphs: [
          "Sidecar CPU/RAM, added hops, upgrade coupling, and debugging difficulty. Ambient/mode alternatives reduce per-pod sidecars but change trust boundaries.",
        ],
      },
      {
        title: "When to adopt",
        paragraphs: [
          "Adopt when you have many services needing uniform security/telemetry and a platform team to own it. Skip for small monolith-adjacent estates.",
        ],
      },
    ],
    concepts: ["Data plane vs control plane", "Sidecar vs ambient", "mTLS identity", "Outlier detection"],
    practices: ["Start with mTLS + telemetry only", "Budget retries carefully", "Own the mesh as a platform product"],
    pitfalls: ["Mesh as business logic dump", "No platform ownership", "Ignoring latency tax"],
    examples: [
      { title: "Istio + Envoy", description: "Widely deployed, feature-rich." },
      { title: "Linkerd", description: "Simpler operational focus." },
    ],
    keyTakeaways: ["Meshes standardize cross-cutting RPC policy", "Complexity must be justified by estate size"],
    whyItMatters: "Service mesh decisions shape security and reliability for years; they are hard to undo.",
    reflectionQuestions: ["Which mesh features do you truly need in the next year?"],
  },
  {
    id: "int-redis",
    title: "Redis Internals",
    moduleId: "system-internals",
    phaseId: "internal-designs",
    kind: "living",
    durationMinutes: 50,
    difficulty: "advanced",
    summary:
      "Redis is an in-memory data structure server with a single-threaded command executor (historically), multiplexed I/O, optional persistence (RDB/AOF), and clustering via hash slots. Internals explain its latency profile and failure modes.",
    sections: [
      {
        title: "Data structures and encoding",
        paragraphs: [
          "Strings, hashes, lists, sets, sorted sets, streams — each with compact encodings under size thresholds. Memory overhead dominates cost; understand embstr vs raw strings and ziplist/listpack evolutions.",
        ],
      },
      {
        title: "Event loop and concurrency",
        paragraphs: [
          "Commands execute atomically on the main thread. Slow commands block others — hence O(N) KEYS danger. I/O threads and modules evolved, but design still assumes fast commands.",
        ],
      },
      {
        title: "Persistence and replication",
        paragraphs: [
          "RDB snapshots and AOF rewrite trade durability vs latency. Replication is asynchronous by default — failover can lose writes. Understand WAIT and risk tolerance.",
        ],
      },
      {
        title: "Cluster and eviction",
        paragraphs: [
          "Hash slots (16384) shard keys. Multi-key ops need hash tags. Eviction policies under maxmemory change which keys disappear — caches vs primary store semantics diverge here.",
        ],
      },
    ],
    concepts: ["Single-threaded command execution", "RDB/AOF", "Async replication", "Hash slots", "Eviction policies"],
    practices: ["Avoid KEYS in prod", "Treat durability explicitly", "Use hash tags intentionally"],
    pitfalls: ["Using Redis as durable SoT without AOF/WAIT discipline", "Huge values blocking the loop", "Hot keys in cluster"],
    examples: [{ title: "Cache + session store", description: "Classic Redis roles with eviction." }],
    keyTakeaways: ["Redis performance comes from memory + atomic commands", "Durability and clustering have sharp edges"],
    whyItMatters: "Redis appears in almost every design; internals knowledge prevents silent data loss and latency spikes.",
    reflectionQuestions: ["Is your Redis a cache or a source of truth — and does config match?"],
  },
  {
    id: "ll-order-book",
    title: "Order Books",
    moduleId: "trading-core",
    phaseId: "low-latency",
    kind: "evergreen",
    durationMinutes: 45,
    difficulty: "advanced",
    summary:
      "An order book stores bids and asks by price level and matches incoming orders by defined rules (price-time, pro-rata, etc.). Structure choice (trees, arrays of levels, intrusive lists) drives latency and determinism.",
    sections: [
      {
        title: "Book mechanics",
        paragraphs: [
          "Limit orders rest; market orders aggress. Price-time priority is common: better price first, then earlier time. Partial fills and cancel/replace are first-class.",
        ],
      },
      {
        title: "Data structures",
        paragraphs: [
          "Price levels often in sorted maps or contiguous arrays for hot top-of-book. Orders in FIFO queues per level. Avoid allocations on the hot path — preallocate pools.",
        ],
      },
      {
        title: "Determinism and journaling",
        paragraphs: [
          "For audit and replay, apply a sequenced input log to a deterministic book. Same inputs → same trades. This is the backbone of exchange reliability.",
        ],
      },
      {
        title: "Market data",
        paragraphs: [
          "Publishing top-of-book vs full depth changes bandwidth. Conflate wisely; never block matching on slow consumers.",
        ],
      },
    ],
    concepts: ["Price-time priority", "Resting vs aggressing", "Deterministic replay", "Top-of-book vs depth"],
    practices: ["Preallocate on hot path", "Journal sequenced inputs", "Decouple market-data fanout"],
    pitfalls: ["Allocating per order in steady state", "Non-deterministic iteration order", "Coupling match path to disk/network"],
    examples: [{ title: "Exchange matching cores", description: "Deterministic books behind gateways." }],
    keyTakeaways: ["Books are specialized deterministic state machines", "Latency and fairness rules dominate structure choice"],
    whyItMatters: "Trading and other continuous double-auction markets require this pattern; it also teaches extreme low-latency design.",
    reflectionQuestions: ["How would you prove two implementations produce identical matches?"],
  },
  {
    id: "ml-gpu-memory",
    title: "GPU Memory Hierarchy & Roofline",
    moduleId: "ml-hardware",
    phaseId: "ml-foundations",
    kind: "living",
    durationMinutes: 45,
    summary:
      "GPU performance is often memory-bound. Understanding HBM, caches, and the roofline model lets you predict whether a kernel or LLM phase is limited by FLOPs or bandwidth — essential for training and inference sizing.",
    sections: [
      {
        title: "Hierarchy overview",
        paragraphs: [
          "Registers, shared memory/L1, L2, HBM. Latency and bandwidth differ by orders of magnitude. Tensor Cores thrive on tiles that fit the hierarchy.",
        ],
      },
      {
        title: "Roofline thinking",
        paragraphs: [
          "Arithmetic intensity (FLOPs/byte) determines whether you hit compute roof or bandwidth roof. Attention decode often sits on the bandwidth roof because of KV reads.",
        ],
      },
      {
        title: "Multi-GPU",
        paragraphs: [
          "NVLink/NVSwitch vs PCIe vs IB for collectives. Topology awareness prevents hidden bottlenecks in all-reduce and KV transfer.",
        ],
      },
      {
        title: "Sizing implications",
        paragraphs: [
          "Estimate bytes moved per token and per training step. Compare to HBM bandwidth × utilization. This predicts tokens/s better than peak TFLOPs marketing.",
        ],
      },
    ],
    concepts: ["HBM bandwidth", "Arithmetic intensity", "Roofline", "Tensor Core tiling", "NVLink topology"],
    practices: ["Profile bandwidth vs compute", "Size batches from memory first", "Align parallelism with topology"],
    pitfalls: ["Using peak TFLOPs as capacity", "Ignoring PCIe bottlenecks", "Oversubscribing HBM with KV"],
    examples: [{ title: "LLM decode", description: "KV reads make decode bandwidth-bound." }],
    keyTakeaways: ["Memory hierarchy dominates many ML workloads", "Roofline beats marketing FLOPs"],
    whyItMatters: "Wrong hardware mental models waste millions in GPU fleets.",
    reflectionQuestions: ["Is your bottleneck FLOPs or bytes/s for the hot kernel?"],
  },
  {
    id: "ag-evals",
    title: "Evals as CI & Observability",
    moduleId: "ai-reliability",
    phaseId: "agentic-systems",
    kind: "living",
    durationMinutes: 40,
    summary:
      "LLM apps need evaluation suites that run like CI: curated cases, graders, regression thresholds, and production tracing. Without evals, prompt and model changes are flying blind.",
    sections: [
      {
        title: "Offline evals",
        paragraphs: [
          "Gold sets with expected behaviors; LLM-as-judge with caution; deterministic checkers for structured outputs. Split by capability (retrieval, tool use, safety).",
        ],
      },
      {
        title: "Online evaluation",
        paragraphs: [
          "Sample production traces, score asynchronously, watch for drift. User feedback is sparse — instrument explicit signals.",
        ],
      },
      {
        title: "CI integration",
        paragraphs: [
          "Block deploys on eval regressions. Version prompts, models, and retrievers together. Keep eval costs bounded with sampling strata.",
        ],
      },
      {
        title: "Observability",
        paragraphs: [
          "Trace prompts, tool calls, retrieved chunks, token costs, and latency. You cannot fix what you cannot attribute.",
        ],
      },
    ],
    concepts: ["Gold set", "LLM-as-judge", "Eval CI gate", "Trace attribution", "Quality drift"],
    practices: ["Version eval sets", "Gate releases on regressions", "Trace retrieved context ids"],
    pitfalls: ["Only manual vibe checks", "Uncalibrated judges", "No production sampling"],
    examples: [{ title: "Prompt/model regression bots", description: "CI fails on quality drop." }],
    keyTakeaways: ["Evals are the unit tests of AI systems", "Offline + online both required"],
    whyItMatters: "AI features change behavior without compile errors; evals are how you keep control.",
    reflectionQuestions: ["What eval would have caught your last AI regression?"],
  },
  {
    id: "fund-load-shedding",
    title: "Load Shedding & Overload Control",
    moduleId: "scalability",
    phaseId: "fundamentals",
    kind: "evergreen",
    durationMinutes: 40,
    summary:
      "When load exceeds capacity, systems must shed work intentionally — or they shed it randomly via timeouts and cascading failure. Good overload control protects latency for admitted traffic.",
    sections: [
      {
        title: "Failure mode of uncontrolled overload",
        paragraphs: [
          "Queues grow, latency explodes, retries amplify load, thread pools saturate, and the service spends CPU on work that will be cancelled. Success rate collapses.",
        ],
      },
      {
        title: "Shedding strategies",
        paragraphs: [
          "Admit based on queue time, concurrency, or token buckets. Prefer shedding new low-priority work. Return explicit 503 with Retry-After.",
          "Codel/adaptive LIFO approaches protect latency better than unbounded FIFO under overload.",
        ],
      },
      {
        title: "Client cooperation",
        paragraphs: [
          "Clients must backoff. Without coordinated retry budgets, shedding just moves the thundering herd.",
        ],
      },
      {
        title: "Place in the stack",
        paragraphs: [
          "Shed at edges and at each dependency boundary. Bulkheads prevent one capability from consuming all workers.",
        ],
      },
    ],
    concepts: ["Overload", "Admission control", "Retry amplification", "Critical vs shedable work"],
    practices: ["Shed early with clear errors", "Protect high-priority traffic", "Cap retries across the fleet"],
    pitfalls: ["Unbounded queues", "Retry storms", "Only scaling out without shedding"],
    examples: [{ title: "API gateways", description: "Concurrency limits and 503 budgets." }],
    keyTakeaways: ["Intentional shedding beats collapse", "Retries must be budgeted"],
    whyItMatters: "Most cascading outages are overload without admission control.",
    reflectionQuestions: ["What work can you drop first under overload?"],
  },
];

function main() {
  let n = 0;
  for (const spec of specs) {
    const lesson = buildRichLesson(spec);
    writeJson(lessonPath(lesson.moduleId, lesson.id), lesson);
    console.log(`wrote ${lesson.id}`);
    n += 1;
  }
  console.log(`Enriched ${n} more lessons`);
}

main();
