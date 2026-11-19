import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./content/lib.ts";

const path = join(root, "content/challenges.json");
const challenges = JSON.parse(readFileSync(path, "utf8")) as { id: string }[];
const ids = new Set(challenges.map((c) => c.id));

const extras = [
  {
    id: "news-feed",
    title: "News Feed",
    difficulty: "intermediate",
    description:
      "Design a personalized news feed that supports follow graphs, ranking, and fanout at scale.",
    hints: ["Push vs pull fanout", "Celebrity problem", "Ranking features"],
    checklist: [
      "Follow graph model",
      "Fanout strategy",
      "Ranking approach",
      "Caching",
      "Pagination",
    ],
    estimatedMinutes: 50,
    rubric: [
      "Fanout trade-offs clear",
      "Hot-key handling",
      "Consistency of feed explained",
      "Failure modes covered",
    ],
    scaleVariants: ["10x DAU", "Multi-region"],
    tags: ["social"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "job-scheduler",
    title: "Distributed Job Scheduler",
    difficulty: "intermediate",
    description:
      "Design a durable scheduler for cron and one-off jobs with exactly-once execution intents and retries.",
    hints: ["Lease/heartbeat", "Partition work", "Idempotent handlers"],
    checklist: [
      "Job API",
      "Storage model",
      "Worker leasing",
      "Retries/DLQ",
      "Observability",
    ],
    estimatedMinutes: 45,
    rubric: [
      "Lease correctness",
      "No double-run under network partition",
      "Scale-out story",
      "Ops/metrics",
    ],
    scaleVariants: ["1M jobs/min", "Multi-tenant quotas"],
    tags: ["batch"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "metrics-platform",
    title: "Metrics / Time-Series Platform",
    difficulty: "advanced",
    description:
      "Design a metrics system for high-cardinality ingest, rollups, and query with retention tiers.",
    hints: ["Write path batching", "Downsampling", "Cardinality explosion"],
    checklist: [
      "Ingest API",
      "Storage layout",
      "Query model",
      "Retention",
      "Alerting integration",
    ],
    estimatedMinutes: 60,
    rubric: [
      "Cardinality plan",
      "Write amplification considered",
      "Query latency path",
      "Cost/retention tiers",
    ],
    scaleVariants: ["10x series", "Long retention"],
    tags: ["observability"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "collab-doc",
    title: "Collaborative Document Editor",
    difficulty: "advanced",
    description:
      "Design multiplayer document editing with conflict resolution, presence, and durable history.",
    hints: ["CRDT vs OT", "Presence channel", "Snapshot+ops"],
    checklist: ["Sync protocol", "Conflict strategy", "Presence", "Persistence", "ACLs"],
    estimatedMinutes: 65,
    rubric: [
      "Conflict model sound",
      "Offline support considered",
      "Security/ACL",
      "Scale of rooms",
    ],
    scaleVariants: ["10k concurrent editors on one doc", "Org-wide ACLs"],
    tags: ["realtime"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "video-streaming",
    title: "Video Streaming Service",
    difficulty: "advanced",
    description:
      "Design upload, transcoding, packaging, and CDN delivery for adaptive bitrate video.",
    hints: ["ABR ladders", "Origin shield", "DRM optional"],
    checklist: ["Upload", "Transcode pipeline", "Packaging", "CDN", "Analytics"],
    estimatedMinutes: 70,
    rubric: [
      "Pipeline durability",
      "CDN cacheability",
      "Startup latency path",
      "Cost awareness",
    ],
    scaleVariants: ["Live streaming add-on", "Global PoPs"],
    tags: ["media"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "feature-flags",
    title: "Feature Flag Service",
    difficulty: "intermediate",
    description:
      "Design a feature-flag platform with targeting, percentage rollouts, and low-latency evaluation.",
    hints: ["Client-side vs server eval", "Config push", "Sticky bucketing"],
    checklist: [
      "Flag model",
      "Targeting rules",
      "Eval latency",
      "Audit log",
      "Kill switch",
    ],
    estimatedMinutes: 40,
    rubric: [
      "Eval performance",
      "Consistency of bucketing",
      "Safety controls",
      "Multi-env story",
    ],
    scaleVariants: ["Edge evaluation", "100k flags"],
    tags: ["platform"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "webhook-delivery",
    title: "Webhook Delivery System",
    difficulty: "intermediate",
    description:
      "Design reliable outbound webhook delivery with signing, retries, and partner isolation.",
    hints: ["At-least-once + idempotency keys", "Backoff", "Per-tenant queues"],
    checklist: ["Signing", "Retry policy", "DLQ", "Isolation", "Delivery logs"],
    estimatedMinutes: 40,
    rubric: [
      "Retry correctness",
      "Noisy-neighbor isolation",
      "Security of signing secrets",
      "Observability",
    ],
    scaleVariants: ["Multi-region egress", "10x partners"],
    tags: ["integration"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "distributed-lock",
    title: "Distributed Lock Service",
    difficulty: "intermediate",
    description:
      "Design fencing-token locks for coordinating critical sections across services.",
    hints: ["Fencing tokens", "Lease TTL", "Avoid locks when possible"],
    checklist: [
      "API",
      "Fencing",
      "Expiry",
      "Fault tolerance",
      "Client usage rules",
    ],
    estimatedMinutes: 35,
    rubric: [
      "Fencing explained",
      "Expiry correctness",
      "Failure modes",
      "Misuse warnings",
    ],
    scaleVariants: ["Multi-region (or why not)"],
    tags: ["coordination"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "typeahead",
    title: "Typeahead / Autocomplete",
    difficulty: "beginner",
    description:
      "Design low-latency prefix search for queries with personalization and abuse controls.",
    hints: ["Trie/prefix index", "Edge cache", "Rate limits"],
    checklist: [
      "Index structure",
      "Update pipeline",
      "Latency budget",
      "Personalization",
      "Abuse",
    ],
    estimatedMinutes: 30,
    rubric: [
      "Latency path credible",
      "Freshness strategy",
      "Scale of suggestions",
      "Safety",
    ],
    scaleVariants: ["10x QPS", "Multi-language"],
    tags: ["search"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "payment-ledger",
    title: "Payment Ledger",
    difficulty: "expert",
    description:
      "Design a double-entry ledger with strong invariants, idempotent posts, and auditability.",
    hints: ["Immutable entries", "Idempotency", "Reconciliation"],
    checklist: [
      "Account model",
      "Posting API",
      "Invariants",
      "Idempotency",
      "Audit/reconciliation",
    ],
    estimatedMinutes: 80,
    rubric: ["Invariants airtight", "Idempotency", "Audit story", "Failure/recovery"],
    scaleVariants: ["Multi-currency", "Multi-region read replicas"],
    tags: ["fintech"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "secret-manager",
    title: "Secret Manager",
    difficulty: "advanced",
    description:
      "Design a secret storage and dynamic credentials system with rotation and audit.",
    hints: ["Envelope encryption", "Short-lived creds", "Break-glass"],
    checklist: [
      "Storage model",
      "KMS integration",
      "Rotation",
      "Access policy",
      "Audit",
    ],
    estimatedMinutes: 55,
    rubric: [
      "Key hierarchy",
      "Rotation without downtime",
      "AuthZ model",
      "Audit completeness",
    ],
    scaleVariants: ["Multi-region HA", "Dynamic DB creds"],
    tags: ["security"],
    status: "published",
    phaseId: "design-systems",
  },
  {
    id: "llm-tool-chat",
    title: "LLM Chat with Tools",
    difficulty: "advanced",
    description:
      "Design a ChatGPT-like service with tool calling, streaming, memory, and cost controls.",
    hints: ["Stream tokens", "Tool sandbox", "Prompt injection"],
    checklist: [
      "Chat API",
      "Streaming",
      "Tools/sandbox",
      "Memory",
      "Rate/cost limits",
    ],
    estimatedMinutes: 70,
    rubric: ["Streaming design", "Tool security", "Memory/ACL", "Cost controls"],
    scaleVariants: ["Enterprise tenants", "Long-running agents"],
    tags: ["ai"],
    status: "published",
    phaseId: "agentic-systems",
  },
];

let added = 0;
for (const e of extras) {
  if (!ids.has(e.id)) {
    challenges.push(e);
    added += 1;
  }
}
writeFileSync(path, JSON.stringify(challenges, null, 2) + "\n");
console.log(`added ${added}; total ${challenges.length}`);
