/**
 * Append additional lesson targets to content/syllabus.yaml and ensure
 * phases/modules catalog stays in sync via expand-curriculum afterward.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { root } from "./content/lib.ts";

const syllabusPath = join(root, "content/syllabus.yaml");
const syllabus = parseYaml(readFileSync(syllabusPath, "utf8")) as {
  version: string;
  updated: string;
  phases: {
    id: string;
    modules: {
      id: string;
      title: string;
      lessons: { id: string; title: string; kind: string }[];
    }[];
  }[];
};

function addLessons(
  moduleId: string,
  lessons: { id: string; title: string; kind: string }[],
) {
  for (const phase of syllabus.phases) {
    for (const mod of phase.modules) {
      if (mod.id !== moduleId) continue;
      const existing = new Set(mod.lessons.map((l) => l.id));
      for (const l of lessons) {
        if (!existing.has(l.id)) mod.lessons.push(l as never);
      }
      return;
    }
  }
  throw new Error(`Module not found: ${moduleId}`);
}

function ensureModule(
  phaseId: string,
  mod: { id: string; title: string; lessons: { id: string; title: string; kind: string }[] },
) {
  const phase = syllabus.phases.find((p) => p.id === phaseId);
  if (!phase) throw new Error(`Phase not found: ${phaseId}`);
  if (!phase.modules.some((m) => m.id === mod.id)) {
    phase.modules.push(mod as never);
  } else {
    addLessons(mod.id, mod.lessons);
  }
}

addLessons("networking", [
  { id: "net-congestion", title: "TCP Congestion Control & BBR", kind: "evergreen" },
  { id: "net-nat-firewall", title: "NAT, Firewalls & Hole Punching", kind: "evergreen" },
  { id: "net-multicast", title: "Multicast & Fanout Patterns", kind: "evergreen" },
  { id: "net-timeouts", title: "Timeouts, Retries & Tail Latency", kind: "evergreen" },
]);

addLessons("operating-systems", [
  { id: "os-cgroups", title: "cgroups, Namespaces & Isolation", kind: "evergreen" },
  { id: "os-perf", title: "Profiling & Performance Counters", kind: "evergreen" },
  { id: "os-virtualization", title: "Virtualization & Hypervisors", kind: "evergreen" },
]);

addLessons("databases", [
  { id: "db-query-optimizer", title: "Query Planners & Cost Models", kind: "evergreen" },
  { id: "db-isolation-deep", title: "Isolation Levels & Anomalies", kind: "evergreen" },
  { id: "db-connection-pooling", title: "Connection Pooling & Multiplexing", kind: "evergreen" },
  { id: "db-backup-pit", title: "Backup, PITR & Disaster Recovery", kind: "living" },
]);

addLessons("scalability", [
  { id: "fund-load-shedding", title: "Load Shedding & Overload Control", kind: "evergreen" },
  { id: "fund-sharding-strategies", title: "Sharding Strategies & Resharding", kind: "evergreen" },
]);

addLessons("storage", [
  { id: "fund-blob-storage", title: "Object/Blob Storage Design", kind: "evergreen" },
  { id: "fund-timeseries", title: "Time-Series Storage Patterns", kind: "living" },
]);

addLessons("caching", [
  { id: "fund-cache-coherence", title: "Cache Invalidation & Coherence", kind: "evergreen" },
  { id: "fund-cache-stampede", title: "Stampede, Thundering Herd & Hot Keys", kind: "evergreen" },
]);

addLessons("messaging", [
  { id: "fund-exactly-once", title: "Delivery Semantics & Exactly-Once", kind: "evergreen" },
  { id: "fund-schema-evolution", title: "Schema Evolution & Contracts", kind: "living" },
]);

addLessons("distributed-systems", [
  { id: "fund-raft-deep", title: "Raft Deep Dive", kind: "evergreen" },
  { id: "fund-partitioning", title: "Partitioning & Data Locality", kind: "evergreen" },
  { id: "fund-idempotency", title: "Idempotency Keys & Dedup", kind: "evergreen" },
]);

addLessons("apis", [
  { id: "fund-api-versioning", title: "API Versioning & Compatibility", kind: "evergreen" },
  { id: "fund-pagination", title: "Pagination, Filtering & Cursors", kind: "evergreen" },
]);

addLessons("reliability", [
  { id: "fund-bulkheads", title: "Bulkheads & Failure Isolation", kind: "evergreen" },
  { id: "fund-graceful-degradation", title: "Graceful Degradation", kind: "evergreen" },
]);

addLessons("security", [
  { id: "fund-zero-trust", title: "Zero Trust for Services", kind: "living" },
  { id: "fund-supply-chain", title: "Supply Chain Security", kind: "living" },
]);

addLessons("architecture-patterns", [
  { id: "arch-multi-tenant", title: "Multi-Tenant Architecture", kind: "evergreen" },
  { id: "arch-strangler", title: "Strangler Fig & Migration", kind: "evergreen" },
  { id: "arch-bff", title: "BFF & Experience APIs", kind: "evergreen" },
]);

addLessons("infra-core", [
  { id: "infra-service-mesh", title: "Service Mesh Deep Dive", kind: "living" },
  { id: "infra-observability-deep", title: "Metrics, Logs, Traces & Exemplars", kind: "evergreen" },
  { id: "infra-autoscaling", title: "Autoscaling Signals & Policies", kind: "living" },
  { id: "infra-networking", title: "Cloud Networking (VPC, LB, DNS)", kind: "living" },
]);

addLessons("software-patterns", [
  { id: "pat-saga", title: "Saga & Process Managers", kind: "evergreen" },
  { id: "pat-outbox", title: "Transactional Outbox", kind: "evergreen" },
]);

addLessons("system-internals", [
  { id: "int-s3", title: "Object Storage Internals", kind: "living" },
  { id: "int-zookeeper", title: "ZooKeeper / Coordination Internals", kind: "evergreen" },
]);

addLessons("design-framework", [
  { id: "mind-interview", title: "Interview Communication Patterns", kind: "evergreen" },
  { id: "mind-prod-readiness", title: "Production Readiness Reviews", kind: "evergreen" },
]);

addLessons("trading-core", [
  { id: "ll-colocation", title: "Colocation, Clocks & Fairness", kind: "living" },
  { id: "ll-fix", title: "FPGA / Hardware Acceleration Intro", kind: "living" },
]);

addLessons("ml-transformers", [
  { id: "ml-moe", title: "Mixture of Experts (Systems View)", kind: "living" },
  { id: "ml-tokenizer", title: "Tokenizers as System Boundaries", kind: "evergreen" },
]);

addLessons("ml-hardware", [
  { id: "ml-interconnect", title: "NVLink, InfiniBand & Topology", kind: "living" },
]);

addLessons("ml-data", [
  { id: "ml-eval-data", title: "Eval Sets & Data Quality Gates", kind: "living" },
]);

addLessons("distributed-training", [
  { id: "ti-fault-tolerance", title: "Training Fault Tolerance", kind: "living" },
]);

addLessons("inference-serving", [
  { id: "ti-prefill-decode", title: "Prefill/Decode Disaggregation", kind: "living" },
  { id: "ti-routing", title: "LLM Request Routing", kind: "living" },
]);

addLessons("rag-systems", [
  { id: "ag-eval-rag", title: "Evaluating RAG Quality", kind: "living" },
  { id: "ag-acl-rag", title: "ACL-Aware Retrieval", kind: "evergreen" },
]);

addLessons("agent-architectures", [
  { id: "ag-memory", title: "Agent Memory Architectures", kind: "living" },
  { id: "ag-planning", title: "Planning, ReAct & Tree Search", kind: "living" },
]);

addLessons("ai-reliability", [
  { id: "ag-redteam", title: "Red-Teaming LLM Applications", kind: "living" },
]);

ensureModule("fundamentals", {
  id: "edge-delivery",
  title: "Edge & Delivery",
  lessons: [
    { id: "fund-edge-compute", title: "Edge Compute Patterns", kind: "living" },
    { id: "fund-geo-routing", title: "Geo Routing & Latency Maps", kind: "evergreen" },
  ],
});

ensureModule("infrastructure", {
  id: "data-platform",
  title: "Data Platforms",
  lessons: [
    { id: "infra-lakehouse", title: "Lakehouse Architecture", kind: "living" },
    { id: "infra-batch-etl", title: "Batch ETL & Orchestration", kind: "evergreen" },
  ],
});

syllabus.updated = new Date().toISOString().slice(0, 10);
writeFileSync(syllabusPath, stringifyYaml(syllabus, { lineWidth: 0 }), "utf8");
console.log("Syllabus breadth expanded.");
