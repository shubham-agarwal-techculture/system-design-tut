/**
 * Publish deep content for high-priority draft / new lessons.
 */
import { lessonPath, writeJson } from "./content/lib.ts";
import { buildRichLesson, type RichSpec } from "./content/rich-lesson.ts";

const specs: RichSpec[] = [
  {
    id: "net-quic",
    title: "QUIC Internals",
    moduleId: "networking",
    phaseId: "foundations",
    kind: "living",
    durationMinutes: 45,
    summary:
      "QUIC is a UDP-based multiplexed transport with TLS 1.3 integrated into the handshake. It removes head-of-line blocking at the stream layer, enables 0-RTT, and is the substrate for HTTP/3 — but it changes how middleboxes, load balancers, and debugging work.",
    prerequisites: ["net-tcp-ip", "net-http"],
    sections: [
      {
        title: "Why QUIC exists",
        paragraphs: [
          "TCP + TLS + HTTP/2 still suffers connection setup cost (multiple RTTs) and head-of-line blocking: a lost TCP packet stalls all multiplexed HTTP/2 streams because TCP delivers a single ordered byte stream. On lossy mobile networks this dominates tail latency.",
          "QUIC moves stream multiplexing into userspace over UDP. Each stream has independent flow control. A lost packet only blocks streams that need that data. Connection migration lets a client keep a connection ID when the IP/port changes (Wi-Fi to cellular).",
          "TLS 1.3 is baked into the QUIC handshake, reducing round trips. 0-RTT can send application data on the first flight using prior session keys — with replay risks you must design for.",
        ],
        bullets: [
          "UDP substrate + encrypted transport headers",
          "Stream-level multiplexing without TCP HOL blocking",
          "Connection IDs enable migration across network paths",
        ],
      },
      {
        title: "Packets, frames, and streams",
        paragraphs: [
          "QUIC packets contain frames: STREAM, ACK, MAX_DATA, CONNECTION_CLOSE, CRYPTO, and others. Stream frames carry application bytes with offsets. Flow control exists at connection and stream scope.",
          "Unlike TCP, much of the header is encrypted after the handshake, which breaks traditional middlebox parsing. Operators rely on Connection IDs, spin bit (limited), and endpoint telemetry rather than deep packet inspection of sequence numbers.",
          "Loss detection uses ACK frames and probe timeouts rather than classic TCP dup-ACK alone. Implementations (Chromium, quiche, mvfst, quic-go) differ in pacing and congestion controllers (often CUBIC or BBR variants).",
        ],
      },
      {
        title: "HTTP/3 and deployment realities",
        paragraphs: [
          "HTTP/3 maps requests onto QUIC streams. Alt-Svc / HTTPS DNS records advertise h3. Clients often race TCP and QUIC and prefer the winner — so your edge must handle both.",
          "Load balancing QUIC is harder: Connection IDs must be routed consistently, and retries after CID changes need shared state or CID-aware L4 balancers. UDP payload sizes and ICMP fragmentation interact poorly with poorly configured paths.",
          "Debugging shifts from tcpdump-friendly cleartext headers to qlog and endpoint metrics. Plan observability before a wholesale h3 cutover.",
        ],
      },
      {
        title: "When QUIC helps — and when it does not",
        paragraphs: [
          "QUIC shines for browsers, APIs over lossy links, and connection migration. It helps less when you already terminate TLS at a nearby edge over excellent networks, or when enterprise firewalls block UDP 443.",
          "gRPC and many internal RPC stacks still sit on HTTP/2 over TCP. Do not assume QUIC is universally available inside data centers — measure, then choose.",
        ],
      },
    ],
    deepDive: [
      {
        title: "0-RTT replay and application safety",
        paragraphs: [
          "0-RTT data can be replayed by an attacker who captured the first flight. Safe usage restricts 0-RTT to idempotent reads or servers that implement replay detection windows.",
          "Design APIs so non-idempotent POSTs require 1-RTT keys. Document this in your client SDK — libraries will eagerly enable early data if you let them.",
        ],
      },
      {
        title: "Congestion control and pacing",
        paragraphs: [
          "Userspace congestion control must coexist with fair sharing on the bottleneck. BBR-style controllers estimate bandwidth and RTT; mis-tuned pacing can burst and induce loss.",
          "Compare goodput and p99 under induced 1–2% loss against TCP+H2 before declaring victory.",
        ],
      },
    ],
    concepts: [
      "Stream multiplexing without TCP HOL blocking",
      "Connection ID vs 4-tuple identity",
      "Integrated TLS 1.3 handshake",
      "0-RTT / early data replay hazard",
      "HTTP/3 as application mapping on QUIC",
      "qlog for debugging",
    ],
    practices: [
      "Support h2 and h3 at the edge during migration",
      "Treat 0-RTT as opt-in for idempotent methods only",
      "Use CID-aware load balancing for UDP/443",
      "Collect qlog/metrics from both client and edge",
    ],
    pitfalls: [
      "Assuming UDP 443 is open everywhere",
      "Enabling 0-RTT for state-changing APIs",
      "Debugging with TCP-only tooling",
      "Ignoring MTU / UDP amplification limits",
    ],
    examples: [
      {
        title: "Chrome + Google edge",
        description: "Large-scale HTTP/3 deployment; connection migration across radio changes.",
      },
      {
        title: "Cloudflare / Fastly",
        description: "CDN edges terminating QUIC with careful CID routing and fallback to TCP.",
      },
    ],
    keyTakeaways: [
      "QUIC fixes TCP HOL blocking for multiplexed apps by moving streams above UDP",
      "Security handshake and transport are integrated — fewer RTTs, different ops model",
      "Deployment success hinges on UDP path, LB, and observability readiness",
    ],
    whyItMatters:
      "Modern public HTTP performance and mobile resilience increasingly depend on QUIC/HTTP/3. System designers who only reason about TCP will mis-predict latency and fail edge migrations.",
    reflectionQuestions: [
      "Which of your APIs are unsafe under 0-RTT replay?",
      "How would you load-balance QUIC without sticky 4-tuples?",
      "What metrics prove HTTP/3 improved p99 vs HTTP/2?",
    ],
    numbersToKnow: [
      "TCP+TLS 1.3: often 1–2 RTT before app data; QUIC can do 1-RTT (or 0-RTT)",
      "Mobile networks: loss and path change make HOL blocking costly",
      "UDP 443: commonly used; still blocked on some enterprise networks",
    ],
    diagram: {
      title: "QUIC vs TCP stacks",
      mermaid: `flowchart TB\n  App --> H3[HTTP/3]\n  H3 --> QUIC\n  QUIC --> UDP\n  App2[App] --> H2[HTTP/2]\n  H2 --> TLS\n  TLS --> TCP`,
    },
    sources: [
      { title: "RFC 9000 — QUIC", url: "https://www.rfc-editor.org/rfc/rfc9000" },
      { title: "RFC 9114 — HTTP/3", url: "https://www.rfc-editor.org/rfc/rfc9114" },
    ],
  },
  {
    id: "net-bgp-anycast",
    title: "BGP & Anycast",
    moduleId: "networking",
    phaseId: "foundations",
    kind: "evergreen",
    durationMinutes: 40,
    summary:
      "BGP is how autonomous systems exchange reachability. Anycast announces the same prefix from many locations so users hit a nearby PoP. Together they power CDNs, DNS, and DDoS absorption — and create failure modes that look like 'random' routing flaps.",
    prerequisites: ["net-tcp-ip"],
    sections: [
      {
        title: "Autonomous systems and BGP basics",
        paragraphs: [
          "The internet is a network of Autonomous Systems (AS). BGP advertises prefixes with AS paths. Policy — not pure shortest path — decides what you accept and export. That policy surface is why a single misconfiguration can blackhole traffic globally.",
          "iBGP distributes routes inside an AS; eBGP speaks between ASes. Route reflectors and confederations scale iBGP. Attributes like LOCAL_PREF, MED, and AS path length influence selection.",
          "For system designers, BGP matters when you run multi-homed services, anycast edges, or need to understand why traffic suddenly shifts regions.",
        ],
      },
      {
        title: "Anycast as a design tool",
        paragraphs: [
          "Anycast means many servers advertise the same IP prefix. Routers deliver packets to the 'nearest' announcement by routing metrics. DNS resolvers and CDN edges use this so clients land on a nearby PoP without an application-level directory.",
          "Anycast is great for request/response UDP/TCP services that tolerate connection resets on route change. It is a poor fit for long-lived connections that must pin to one backend unless you terminate quickly at the PoP.",
          "Health withdrawal is critical: if a PoP is sick but still announces, it becomes a blackhole. Couple BGP announcements with health-checked control planes.",
        ],
      },
      {
        title: "Failures and operational controls",
        paragraphs: [
          "Route leaks, hijacks, and RPKI invalid announcements are real. Monitoring control-plane (BMP, looking glasses) matters as much as data-plane latency.",
          "Traffic engineering uses prepends, communities, and selective announcements. Overuse creates brittle topologies that break during maintenance.",
        ],
      },
      {
        title: "Design implications",
        paragraphs: [
          "When designing a global API, decide whether geo-DNS, anycast, or client-side region selection owns steering. Mixing all three without a clear source of truth causes oscillation.",
          "State replication must match steering: if users flip PoPs, sticky server state will orphan sessions unless state is global or PoP-local with sticky routing.",
        ],
      },
    ],
    concepts: [
      "AS, eBGP, iBGP",
      "Prefix announcement and withdrawal",
      "Anycast vs unicast vs multicast",
      "RPKI / route origin validation",
      "PoP health coupled to routing",
    ],
    practices: [
      "Withdraw anycast on PoP health failure quickly",
      "Monitor control plane and data plane separately",
      "Prefer simple steering policies you can explain in an incident",
    ],
    pitfalls: [
      "Anycast + sticky in-memory sessions",
      "Announcing sick origins",
      "Assuming BGP converges instantly worldwide",
    ],
    examples: [
      {
        title: "Root DNS / public resolvers",
        description: "Anycast for availability and latency.",
      },
      {
        title: "CDN edges",
        description: "Anycast VIP in front of regional caches.",
      },
    ],
    keyTakeaways: [
      "BGP is policy-driven reachability between ASes",
      "Anycast steers users to nearby healthy announcements",
      "Steering and state placement must be designed together",
    ],
    whyItMatters:
      "Global systems fail in routing-shaped ways. If you cannot reason about BGP and anycast, you cannot design multi-region edges safely.",
    reflectionQuestions: [
      "When would you prefer geo-DNS over anycast?",
      "What happens to TCP connections when anycast routes shift mid-flow?",
    ],
    numbersToKnow: [
      "BGP convergence: seconds to minutes depending on failure",
      "Anycast: best for short connections / edge termination",
    ],
    diagram: {
      title: "Anycast announcement",
      mermaid: `flowchart LR\n  User --> ISP\n  ISP --> PoP_A\n  ISP --> PoP_B\n  PoP_A --> Origin\n  PoP_B --> Origin`,
    },
  },
  {
    id: "fund-estimation",
    title: "Back-of-Envelope Estimation",
    moduleId: "scalability",
    phaseId: "fundamentals",
    kind: "evergreen",
    durationMinutes: 45,
    summary:
      "Capacity estimation turns vague requirements into storage, QPS, bandwidth, and latency budgets. Good estimates are order-of-magnitude honest, explicit about assumptions, and revised when measurements arrive.",
    sections: [
      {
        title: "Why estimate before drawing boxes",
        paragraphs: [
          "Estimates force requirements into numbers: daily active users, read/write ratio, object size, retention, peak-to-average. Without them, architectures are fashion.",
          "Interview and production practice share the same skill: powers of ten, latency hierarchy, and stating assumptions out loud so others can challenge them.",
          "An estimate that is 2× wrong is often useful; one that hides assumptions is dangerous.",
        ],
      },
      {
        title: "The latency and throughput vocabulary",
        paragraphs: [
          "Know approximate costs: L1/L2 cache nanoseconds, DRAM ~100ns, SSD tens to hundreds of µs, HDD ms, same-rack network ~100µs–1ms, cross-region 50–150ms+. These bound how many hops your p99 can afford.",
          "QPS = concurrency / latency for a single server under saturation (Little's Law). If a handler averages 10ms and you want 10k QPS, you need ~100 concurrent in-flight requests — and enough CPU/IO to sustain them.",
          "Bandwidth: 1 MB objects at 1000 writes/s is ~1 GB/s before replication and indexes. Replication factor and erasure coding multiply storage and sometimes network.",
        ],
      },
      {
        title: "Storage math",
        paragraphs: [
          "Rows × average size × indexes × retention × replication. Indexes often dominate. Compression helps sequential analytics more than point-lookup OLTP.",
          "Time-series and logs: estimate ingest bytes/day and compaction overhead. 'Unlimited retention' is a cost decision, not a feature.",
        ],
      },
      {
        title: "Working the problem",
        paragraphs: [
          "Start from peak QPS and object size. Derive read QPS from write QPS × ratio. Check if a single shard fits; if not, partition. Check if cache can absorb reads given hit rate assumptions.",
          "Always leave headroom (often 2–3×) for spikes, rebalancing, and incident recovery. Publish the assumptions next to the diagram.",
        ],
      },
    ],
    concepts: [
      "Little's Law",
      "Peak vs average load",
      "Latency hierarchy",
      "Replication/storage amplification",
      "Assumption tracking",
    ],
    practices: [
      "Write assumptions before calculating",
      "Use powers of ten; avoid false precision",
      "Convert estimates into SLOs and capacity alerts",
    ],
    pitfalls: [
      "Ignoring indexes and replication in storage math",
      "Designing for average instead of peak",
      "Forgetting cross-region RTT in chatty APIs",
    ],
    examples: [
      {
        title: "URL shortener estimate",
        description: "Writes/day → storage; read:write → cache sizing.",
      },
      {
        title: "Chat fanout",
        description: "Online fanout vs inbox model driven by connection counts and QPS.",
      },
    ],
    keyTakeaways: [
      "Estimates are decision tools, not predictions",
      "Latency hierarchy constrains architecture more than brand names",
      "Always show assumptions",
    ],
    whyItMatters:
      "Every serious design review asks 'what scale?' Estimation is how you answer without hand-waving.",
    reflectionQuestions: [
      "What is the scarcest resource in your current service — CPU, RAM, disk, or network?",
      "How would a 10× traffic spike change your diagram?",
    ],
    numbersToKnow: [
      "DRAM ~100ns; SSD ~100µs; HDD ~10ms; cross-region ~100ms",
      "1 Gbps ≈ 125 MB/s",
      "Little's Law: L = λW",
    ],
  },
  {
    id: "fund-clocks",
    title: "Clocks (Lamport, Vector, HLC)",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    kind: "evergreen",
    durationMinutes: 45,
    summary:
      "Wall clocks lie across machines. Logical clocks (Lamport, vector) and hybrid logical clocks capture causality so distributed systems can order events without assuming synchronized time.",
    sections: [
      {
        title: "The problem with wall time",
        paragraphs: [
          "NTP synchronizes clocks imperfectly. Under failover and heavy load, clocks jump. Ordering events by `datetime.now()` across nodes creates false histories and lost updates.",
          "Google's Spanner uses TrueTime (GPS/atomic) to bound uncertainty — most systems do not have that. You need protocols that tolerate uncertainty or avoid wall-clock ordering.",
        ],
      },
      {
        title: "Lamport clocks",
        paragraphs: [
          "Each process keeps a counter. On send/local event, increment; on receive, set to max(local, message) + 1. If a→b causally, then L(a) < L(b). The converse is false: concurrent events can have ordered timestamps.",
          "Lamport clocks are cheap and good for fencing tokens and monotonic versions when you only need a total order consistent with causality.",
        ],
      },
      {
        title: "Vector clocks",
        paragraphs: [
          "A vector of counters — one per replica — tracks causal history. You can detect concurrency: incomparable vectors mean conflicts. Storage systems (Riak, Dynamo-style) use them for sibling reconciliation.",
          "Vectors grow with the number of actors. For large actor sets, dotted version vectors and other optimizations bound metadata size.",
        ],
      },
      {
        title: "Hybrid logical clocks",
        paragraphs: [
          "HLCs combine physical time with a logical component to keep causality while staying close to wall time for humans and TTL. CockroachDB and others use HLC variants.",
          "You still must handle clock uncertainty windows when comparing timestamps for linearizability-style guarantees.",
        ],
      },
    ],
    concepts: [
      "Causality vs concurrency",
      "Lamport clock",
      "Vector clock / DVV",
      "Hybrid logical clock",
      "TrueTime uncertainty interval",
    ],
    practices: [
      "Never use unsynchronized wall clocks as the sole conflict resolver",
      "Prefer causal mechanisms for multi-master writes",
      "Store enough metadata to explain conflicts to users",
    ],
    pitfalls: [
      "Assuming NTP makes clocks safe for distributed locks",
      "Unbounded vector growth",
      "Confusing total order with causal order",
    ],
    examples: [
      { title: "Riak/Dynamo siblings", description: "Vector clocks detect concurrent writes." },
      { title: "CockroachDB HLC", description: "Hybrid clocks for MVCC across nodes." },
    ],
    keyTakeaways: [
      "Wall clocks are not a distributed source of truth",
      "Logical clocks capture causality cheaply",
      "Choose clock type based on conflict detection needs",
    ],
    whyItMatters:
      "Incorrect time assumptions cause lost updates, broken locks, and corrupt analytics. Clock literacy is mandatory for distributed design.",
    reflectionQuestions: [
      "Where does your system order events by wall clock today?",
      "Would vector clocks or HLC fit your conflict model better?",
    ],
  },
  {
    id: "fund-exactly-once",
    title: "Delivery Semantics & Exactly-Once",
    moduleId: "messaging",
    phaseId: "fundamentals",
    kind: "evergreen",
    durationMinutes: 40,
    summary:
      "Networks retry. Exactly-once end-to-end is usually an illusion built from at-least-once delivery plus idempotent processing and transactional boundaries. Design for duplicates explicitly.",
    sections: [
      {
        title: "At-most-once, at-least-once, effectively once",
        paragraphs: [
          "At-most-once drops messages on failure. At-least-once retries until ack — duplicates happen. Exactly-once claims require a precise scope: once within a pipeline stage, once into a sink with idempotent keys, etc.",
          "Kafka transactions, Flink checkpoints, and inbox/outbox patterns create effective once processing relative to a defined side-effect boundary — not magic across the whole enterprise.",
        ],
      },
      {
        title: "Idempotency as the real tool",
        paragraphs: [
          "Give producers idempotency keys. Make consumers store processed keys or use natural unique constraints. Upserts beat blind inserts.",
          "Side effects (email, charges) need dedup stores with TTLs aligned to retry windows. Document the window.",
        ],
      },
      {
        title: "Transactional messaging patterns",
        paragraphs: [
          "Transactional outbox: write business row + outbox row atomically; publisher drains outbox. Inbox: consumer records message id before side effects.",
          "Dual writes to DB and queue without a transaction are a classic source of lost or double events.",
        ],
      },
      {
        title: "What to tell product stakeholders",
        paragraphs: [
          "Say 'at-least-once with idempotent handlers' instead of 'exactly once' unless you can name the boundary and the failure proof.",
        ],
      },
    ],
    concepts: [
      "At-least-once delivery",
      "Idempotency key",
      "Outbox / inbox",
      "Kafka EOS / transactions scope",
      "Dedup window",
    ],
    practices: [
      "Design consumers to be idempotent first",
      "Use outbox for DB+event atomicity",
      "Define and monitor duplicate rates",
    ],
    pitfalls: [
      "Believing the broker alone provides exactly-once side effects",
      "Dedup TTLs shorter than max retry duration",
      "Non-idempotent payment captures on retry",
    ],
    examples: [
      { title: "Stripe idempotency keys", description: "Safe retries for payment APIs." },
      { title: "Kafka transactions", description: "Atomic produce across partitions within a scope." },
    ],
    keyTakeaways: [
      "Duplicates are normal under retries",
      "Idempotency + transactional boundaries create effective once",
      "Name the exactly-once scope explicitly",
    ],
    whyItMatters:
      "Most 'random' production bugs in event-driven systems are duplicate or lost side effects from unclear delivery semantics.",
    reflectionQuestions: [
      "What side effects in your system are not idempotent?",
      "Where do you dual-write today without an outbox?",
    ],
  },
  {
    id: "fund-raft-deep",
    title: "Raft Deep Dive",
    moduleId: "distributed-systems",
    phaseId: "fundamentals",
    kind: "evergreen",
    durationMinutes: 50,
    difficulty: "advanced",
    summary:
      "Raft elects a leader and replicates a log for consensus. Understanding elections, terms, log matching, and commit rules is essential for etcd, Consul, and many coordination services.",
    sections: [
      {
        title: "Roles and terms",
        paragraphs: [
          "Nodes are followers, candidates, or leaders. Terms are monotonically increasing eras. A leader for a term handles client writes and replicates log entries.",
          "Heartbeats reset election timers. If followers time out, they become candidates and request votes. Majority wins; otherwise term increments and retry.",
        ],
      },
      {
        title: "Log replication",
        paragraphs: [
          "Clients write to the leader. Entries are appended locally then sent to followers. An entry is committed when stored on a majority; then applied to the state machine.",
          "The log matching property ensures consistency: if two logs have the same index and term, prior entries match. Conflicts are resolved by overwriting follower suffixes.",
        ],
      },
      {
        title: "Safety and availability",
        paragraphs: [
          "Raft remains available with majority. A network partition that isolates the leader causes a new election on the majority side; the old leader steps down on seeing a higher term.",
          "Membership changes need careful joint consensus. Mis-managed reconfiguration is a common outage class in real clusters.",
        ],
      },
      {
        title: "Using Raft in designs",
        paragraphs: [
          "Put Raft where you need strong leadership and a replicated log: metadata, configuration, small coordination state — not bulk data paths.",
          "etcd uses Raft for Kubernetes state; if you embed Raft, budget for disk fsync latency on the log.",
        ],
      },
    ],
    concepts: [
      "Leader election",
      "Term",
      "Commit index",
      "Log matching",
      "Majority quorum",
    ],
    practices: [
      "Persist log before acknowledging commits",
      "Separate bulk data from Raft-managed metadata",
      "Test partition behavior explicitly",
    ],
    pitfalls: [
      "Using Raft as a general-purpose database",
      "Ignoring fsync latency",
      "Unsafe membership changes",
    ],
    examples: [
      { title: "etcd", description: "Kubernetes control plane coordination." },
      { title: "Consul / TiKV", description: "Raft for metadata or regions." },
    ],
    keyTakeaways: [
      "Raft = elected leader + replicated log + majority commit",
      "Safety depends on term and log rules",
      "Use it for coordination, not high-volume data",
    ],
    whyItMatters:
      "Many 'CP' systems you depend on are Raft under the hood. Designing around them requires knowing what the log guarantees — and what it costs.",
    reflectionQuestions: [
      "What state in your design must be under consensus vs eventually consistent storage?",
    ],
  },
  {
    id: "db-cdc",
    title: "Change Data Capture",
    moduleId: "databases",
    phaseId: "foundations",
    kind: "living",
    durationMinutes: 40,
    summary:
      "CDC streams database changes from WAL/binlog into downstream systems without dual writes. It powers caches, search indexes, analytics, and event-driven integrations — with ordering, schema, and backfill challenges.",
    sections: [
      {
        title: "Why CDC beats dual writes",
        paragraphs: [
          "Application dual writes to DB and queue fail partially. CDC treats the database transaction log as the source of truth and emits ordered change events.",
          "Debezium, AWS DMS, and native logical decoding plug into WAL/binlog/oplog. Consumers rebuild read models asynchronously.",
        ],
      },
      {
        title: "Semantics and ordering",
        paragraphs: [
          "Events usually carry before/after images, transaction ids, and log coordinates (LSN). Ordering is per partition/key — not global across shards.",
          "Deletes, schema changes, and toasted/large values need explicit handling. Snapshot + streaming backfill must be coordinated to avoid gaps/duplicates.",
        ],
      },
      {
        title: "Operational concerns",
        paragraphs: [
          "Log retention must exceed consumer lag. Long downtime means re-snapshot. Privileges for replication slots are sensitive.",
          "Downstream must be idempotent; at-least-once is the common delivery mode.",
        ],
      },
      {
        title: "Design patterns",
        paragraphs: [
          "Use CDC for search indexing, cache hydration, and analytics lakes. Avoid using CDC as a hidden microservice choreography bus without schema contracts.",
        ],
      },
    ],
    concepts: [
      "WAL/binlog as event source",
      "Snapshot + stream",
      "LSN / binlog coordinates",
      "Schema evolution on change events",
      "Idempotent consumers",
    ],
    practices: [
      "Monitor replication slot lag",
      "Version change event schemas",
      "Plan re-bootstrap procedures",
    ],
    pitfalls: [
      "Assuming global order across shards",
      "Under-provisioning log retention",
      "Silent consumer lag during peak writes",
    ],
    examples: [
      { title: "Debezium + Kafka", description: "Popular open-source CDC pipeline." },
      { title: "Search index sync", description: "Postgres → Elasticsearch via CDC." },
    ],
    keyTakeaways: [
      "CDC makes the transaction log the integration backbone",
      "Ordering and backfill define correctness",
      "Treat lag as a first-class SLO",
    ],
    whyItMatters:
      "Modern data platforms and event-driven designs increasingly start from CDC rather than fragile dual writes.",
    reflectionQuestions: [
      "Which dual writes in your system could become CDC streams?",
    ],
  },
  {
    id: "ti-prefill-decode",
    title: "Prefill/Decode Disaggregation",
    moduleId: "inference-serving",
    phaseId: "training-inference",
    kind: "living",
    durationMinutes: 45,
    difficulty: "advanced",
    summary:
      "LLM inference has two phases with different bottlenecks: prefill (compute-heavy prompt processing) and decode (memory-bandwidth heavy token generation). Disaggregating them onto specialized pools can raise utilization — at the cost of KV transfer complexity.",
    sections: [
      {
        title: "Two phases, two bottlenecks",
        paragraphs: [
          "Prefill processes the prompt in parallel-friendly matmuls — often compute bound. Decode generates one token at a time while reading a growing KV cache — often memory-bandwidth bound.",
          "A single mixed batch forces GPUs to compromise. Long prompts stall short interactive decodes and vice versa.",
        ],
      },
      {
        title: "Disaggregation idea",
        paragraphs: [
          "Run prefill on compute-optimized nodes; ship KV cache (or references) to decode nodes optimized for bandwidth and concurrency. Schedulers route based on phase.",
          "The hard part is KV transfer latency, memory ownership, and failure handling mid-request.",
        ],
      },
      {
        title: "When it pays off",
        paragraphs: [
          "Workloads with long prompts and moderate output lengths, or highly variable mixes, benefit most. Short prompt/short output chat may not justify the complexity.",
          "Measure GPU goodput, KV bytes moved, and p99 end-to-end — not just theoretical FLOPs.",
        ],
      },
      {
        title: "Design checklist",
        paragraphs: [
          "Define SLOs separately for time-to-first-token and inter-token latency. Autoscaling signals should include KV memory and queue time per phase.",
        ],
      },
    ],
    concepts: [
      "Prefill vs decode",
      "KV cache transfer",
      "TTFT vs TPOT",
      "Phase-aware scheduling",
    ],
    practices: [
      "Split SLOs for TTFT and decode rate",
      "Benchmark KV transfer overhead before committing",
      "Keep a non-disaggregated fallback path",
    ],
    pitfalls: [
      "Disaggregating before measuring phase mix",
      "Ignoring failure mid-transfer",
      "Autoscaling on GPU util alone",
    ],
    examples: [
      {
        title: "vLLM / research systems",
        description: "Ongoing work on PD disaggregation and KV-aware routing.",
      },
    ],
    keyTakeaways: [
      "Prefill and decode stress hardware differently",
      "Disaggregation can help mixed workloads",
      "KV movement is the central design cost",
    ],
    whyItMatters:
      "Inference cost curves at scale are dominated by phase mix. Architects who treat 'LLM serving' as one uniform stage will mis-size fleets.",
    reflectionQuestions: [
      "What is your traffic's prompt length vs output length distribution?",
    ],
  },
  {
    id: "ag-memory",
    title: "Agent Memory Architectures",
    moduleId: "agent-architectures",
    phaseId: "agentic-systems",
    kind: "living",
    durationMinutes: 40,
    summary:
      "Agents need short-term working memory (context window) and long-term memory (stores retrieved across sessions). Designing memory poorly causes loops, leaks of private data, and unbounded cost.",
    sections: [
      {
        title: "Layers of memory",
        paragraphs: [
          "Working memory: the prompt/context. Summary memory: compressed history. Episodic stores: past tasks. Semantic stores: facts via RAG. Procedural: tools and skills.",
          "Each layer has different consistency, privacy, and TTL requirements. Do not dump everything into the prompt.",
        ],
      },
      {
        title: "Write paths and trust",
        paragraphs: [
          "Decide what the agent may write to long-term memory. User-private vs tenant-shared vs global. Poisoned memory is a real attack (indirect prompt injection via stored text).",
          "Prefer structured memories with provenance and expiry over free-form append-only blobs.",
        ],
      },
      {
        title: "Retrieval and compaction",
        paragraphs: [
          "Retrieve top-k memories with hybrid search; compact old threads with summaries that preserve decisions and open questions.",
          "Track tokens spent on memory vs new reasoning — memory can starve the model of room to think.",
        ],
      },
      {
        title: "Durability for long jobs",
        paragraphs: [
          "Long-running agents should checkpoint state in a workflow store (step, tool results, approvals) separate from LLM chat logs.",
        ],
      },
    ],
    concepts: [
      "Working vs long-term memory",
      "Memory poisoning",
      "Compaction/summarization",
      "Provenance and TTL",
      "Workflow checkpointing",
    ],
    practices: [
      "ACL every memory write/read",
      "Separate workflow state from chat transcripts",
      "Budget tokens for retrieved memory",
    ],
    pitfalls: [
      "Infinite transcript growth in the prompt",
      "Unscoped shared memories across tenants",
      "Trusting retrieved text as instructions",
    ],
    examples: [
      {
        title: "Coding agents",
        description: "Repo indexes + conversation summaries + durable task state.",
      },
    ],
    keyTakeaways: [
      "Memory is a multi-store design problem",
      "Privacy and poisoning dominate risk",
      "Checkpoint durable work outside the context window",
    ],
    whyItMatters:
      "Agent products live or die on memory quality. Context windows alone do not replace a designed memory architecture.",
    reflectionQuestions: [
      "What may your agent write to long-term memory without human approval?",
    ],
  },
  {
    id: "arch-multi-tenant",
    title: "Multi-Tenant Architecture",
    moduleId: "architecture-patterns",
    phaseId: "architecture",
    kind: "evergreen",
    durationMinutes: 45,
    summary:
      "Multi-tenancy trades isolation for efficiency. Choose among silo, bridge, and pool models for compute and data — and make noisy-neighbor, blast radius, and encryption boundaries explicit.",
    sections: [
      {
        title: "Isolation spectrum",
        paragraphs: [
          "Silo: dedicated resources per tenant (strong isolation, high cost). Pool: shared everything with logical separation (efficient, riskier). Bridge models mix — e.g., shared app tier, separate DB schemas/clusters for large tenants.",
          "The right point on the spectrum depends on threat model, compliance, and tenant size skew.",
        ],
      },
      {
        title: "Data plane concerns",
        paragraphs: [
          "Row-level tenancy needs ruthless discipline on every query (tenant_id predicates, RLS). Schema-per-tenant eases isolation but complicates migrations. Database-per-tenant maximizes isolation and operational load.",
          "Encryption keys per tenant, backup isolation, and restore procedures are part of the design — not afterthoughts.",
        ],
      },
      {
        title: "Control plane and noisy neighbors",
        paragraphs: [
          "Fair scheduling, per-tenant rate limits, and quotas prevent one tenant from exhausting shared pools. Load shedding should be tenant-aware.",
          "Observability must tag every metric/log/trace with tenant for cost attribution and incident scoping.",
        ],
      },
      {
        title: "Migration between models",
        paragraphs: [
          "Plan how a growing tenant graduates from pool to silo without downtime. Many outages happen during 'VIP tenant' exceptionalism without automation.",
        ],
      },
    ],
    concepts: [
      "Silo vs pool tenancy",
      "Row-level security",
      "Noisy neighbor",
      "Per-tenant quotas",
      "Tenant-aware observability",
    ],
    practices: [
      "Default-deny data access with tenant context",
      "Quota and rate-limit per tenant",
      "Automate pool→silo graduation",
    ],
    pitfalls: [
      "Missing tenant filters on a single query path",
      "Shared caches without tenant keys",
      "One giant tenant without isolation plan",
    ],
    examples: [
      { title: "Salesforce / Slack-style pool", description: "Logical tenancy at scale." },
      { title: "Enterprise silo offerings", description: "Dedicated stacks for compliance." },
    ],
    keyTakeaways: [
      "Tenancy is an isolation/cost trade-off",
      "Every layer must enforce tenant context",
      "Plan graduation paths early",
    ],
    whyItMatters:
      "Most SaaS products are multi-tenant. Weak tenancy design causes security incidents and chronic performance pain.",
    reflectionQuestions: [
      "Where could a missing tenant predicate leak data in your stack?",
    ],
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
  console.log(`Enriched ${n} lessons`);
}

main();
