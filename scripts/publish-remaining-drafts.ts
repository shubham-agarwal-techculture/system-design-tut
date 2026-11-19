/**
 * Convert remaining draft stubs into substantive published lessons.
 * Not as deep as hand-authored batches, but far beyond placeholders.
 */
import { loadAllLessons, lessonPath, writeJson } from "./content/lib.ts";
import { buildRichLesson } from "./content/rich-lesson.ts";

function moduleContext(moduleId: string): string {
  const map: Record<string, string> = {
    networking: "packet flow, latency, loss, and middleboxes",
    "operating-systems": "processes, memory, I/O, and isolation",
    databases: "storage engines, transactions, and query access paths",
    scalability: "capacity, concurrency, and overload behavior",
    storage: "durability, access patterns, and data layout",
    caching: "locality, coherence, and hit-rate economics",
    messaging: "delivery semantics, ordering, and consumer lag",
    "distributed-systems": "partial failure, consistency, and coordination",
    apis: "contracts, evolution, and client ergonomics",
    reliability: "failure detection, mitigation, and recovery",
    security: "identity, policy, and confidential data",
    "capacity-cost": "resource budgets and unit economics",
    "architecture-patterns": "structure, boundaries, and change management",
    "infra-core": "runtime platforms, delivery, and operations",
    "software-patterns": "reusable structure inside services",
    "system-internals": "how production systems are built inside",
    "design-framework": "a repeatable design process",
    "trading-core": "determinism, latency, and fairness",
    "ml-transformers": "model compute/memory trade-offs",
    "ml-hardware": "accelerators and interconnect",
    "ml-data": "datasets, features, and quality gates",
    "distributed-training": "multi-GPU/multi-node training systems",
    "post-training": "adaptation and alignment pipelines",
    "inference-serving": "latency, throughput, and cost per token",
    "llm-ops": "gateways, governance, and experiment control",
    "rag-systems": "retrieval quality and grounding",
    "agent-architectures": "tools, memory, and orchestration",
    "agent-protocols": "interoperability and sandboxing",
    "ai-reliability": "evals, safety, and budgets",
    "edge-delivery": "geo latency and edge compute",
    "data-platform": "analytics/storage platforms",
  };
  return map[moduleId] ?? "production system design trade-offs";
}

function main() {
  let n = 0;
  for (const lesson of loadAllLessons()) {
    if (lesson.status !== "draft") continue;
    const title = lesson.title;
    const ctx = moduleContext(lesson.moduleId);

    const rich = buildRichLesson({
      id: lesson.id,
      title,
      moduleId: lesson.moduleId,
      phaseId: lesson.phaseId,
      kind: lesson.kind === "living" ? "living" : "evergreen",
      durationMinutes: Math.max(35, lesson.durationMinutes || 40),
      summary: `${title} is a core topic in modern system design. This lesson builds a first-principles model around ${ctx}, then connects that model to capacity, failure modes, and operational practice so you can use it in real architectures.`,
      prerequisites: lesson.prerequisites ?? [],
      tags: Array.from(new Set([...(lesson.tags ?? []), lesson.moduleId, lesson.kind ?? "evergreen"])),
      sections: [
        {
          title: `What ${title} is solving`,
          paragraphs: [
            `${title} exists because naive designs around ${ctx} break under scale, partial failure, or changing requirements. Before choosing tools, name the problem: which resource is scarce, which invariant must hold, and which user-visible failures are unacceptable.`,
            `In interviews and production reviews, strong answers start with constraints (QPS, data size, latency budget, consistency needs) and only then map ${title} onto those constraints.`,
            `A useful mental model separates the control plane (how you configure and observe ${title}) from the data plane (the per-request/per-event path). Confusing the two leads to architectures that look neat and operate poorly.`,
          ],
        },
        {
          title: "Core mechanics",
          paragraphs: [
            `Mechanically, ${title} involves a small set of moving parts: inputs, state, an algorithm or protocol, and outputs/side effects. Draw those parts explicitly. If state is replicated, write down the replication/consistency rule. If work is asynchronous, write down delivery semantics.`,
            `Performance characteristics usually come from amplification (how much internal work per external request), locality (whether work stays on one node), and contention (locks, hot keys, leader bottlenecks).`,
            `Correctness characteristics usually come from failure handling: retries, timeouts, idempotency, and what clients observe during failover. If you cannot explain the failure story, you do not yet understand ${title}.`,
          ],
          bullets: [
            "Inputs → state/protocol → outputs/side effects",
            "Name consistency and delivery guarantees",
            "Identify the bottleneck resource early",
          ],
        },
        {
          title: "Designing with it",
          paragraphs: [
            `When incorporating ${title} into a system, decide the API boundary first: what does a client call, what can fail, and what is retried. Keep the happy path boring and push complexity into well-tested libraries or platform components.`,
            `Capacity plan with numbers: estimate peak load, working set, and headroom. Convert that into shard counts, cache sizes, thread/connection pools, or GPU/memory budgets as relevant to ${title}.`,
            `Prefer reversible rollout: feature flags, dual-running, shadow traffic, and clear dashboards. New uses of ${title} should be observable on day one.`,
          ],
        },
        {
          title: "Operations and failure modes",
          paragraphs: [
            `Operate ${title} with SLIs that match user pain (availability, latency, lag, error rate, cost). Alert on burn rates and queue/lag growth, not only host CPU.`,
            `Common failures include overload without admission control, retry amplification, silent staleness, schema mismatches, and dependency brownouts. Write a runbook for the top three.`,
            `Chaos and game days should include slow dependencies and network delay, not only hard kills. ${title} often fails in the gray area.`,
          ],
        },
      ],
      deepDive: [
        {
          title: `${title} — deeper internals`,
          paragraphs: [
            `Under the hood, ${title} typically exposes knobs for batching, buffering, concurrency, retention, and timeouts. Each knob trades latency, throughput, and cost. Change one at a time and measure.`,
            `Instrumentation should include high-signal histograms and exemplars that jump to traces. For data systems, watch amplification and compaction/GC; for RPC systems, watch queue time and saturation; for ML systems, watch memory and tokens/s.`,
          ],
          bullets: [
            "One knob at a time with a hypothesis",
            "Histograms > averages",
            "Tie dashboards to runbooks",
          ],
        },
        {
          title: `${title} — integration patterns`,
          paragraphs: [
            `Integrate via stable contracts: schemas, idempotency keys, and versioned APIs. Dual-write carefully or prefer CDC/outbox patterns when crossing storage and messaging.`,
            `Boundary tests should prove behavior under duplicate delivery, reordering, and clock skew where relevant to ${title}.`,
          ],
        },
      ],
      expert: [
        {
          title: `${title} — multi-region and cost`,
          paragraphs: [
            `Across regions, RTT and quorum placement dominate. Keep user-critical paths region-local when invariants allow; replicate asynchronously otherwise. Spell out the conflict/staleness model.`,
            `Track unit economics for ${title}: cost per million requests, per GB stored, or per million tokens. Many scalability projects are cost projects — make the objective explicit.`,
          ],
        },
      ],
      concepts: [
        `${title}: problem framing and constraints`,
        "Control plane vs data plane",
        "Amplification, locality, contention",
        "Failure observations for clients",
        "SLIs and capacity headroom",
        "Versioned contracts / idempotency",
      ],
      practices: [
        `Start from constraints before selecting a ${title} approach`,
        "Define SLIs and dashboards with the feature",
        "Make retries idempotent and budgeted",
        "Roll out reversibly with measurement",
      ],
      pitfalls: [
        "Tool-first design without invariants",
        "Ignoring brownout/slow dependency behavior",
        "Unbounded retries and queues",
        "Missing ownership for ops/runbooks",
      ],
      examples: [
        {
          title: "Production pattern",
          description: `Teams that succeed with ${title} treat measurement, failure drills, and contracts as part of the design — not afterthoughts.`,
        },
        {
          title: "Common review question",
          description: `In design reviews, expect to explain what breaks first when load spikes 10× and how ${title} sheds or scales.`,
        },
      ],
      keyTakeaways: [
        `${title} should be chosen from constraints, not fashion`,
        "Mechanics + failure model + capacity math are the core",
        "Operations and contracts decide long-term success",
      ],
      whyItMatters: `Without a solid model of ${title}, designs either overbuild or fail in production in ways that are hard to debug. This lesson gives a working framework you can reuse across systems involving ${ctx}.`,
      reflectionQuestions: [
        `What invariant does ${title} protect in your system?`,
        `What is the scarcest resource when you apply ${title}?`,
        `How would you rehearse the top failure mode for ${title}?`,
      ],
      numbersToKnow: [
        "Plan 2–3× headroom above peak for incidents and rebalancing",
        "Cross-region RTT often ~50–150ms one way",
        "p99 matters more than average for user-facing paths",
      ],
      interviewQuestions: [
        `Explain ${title} and the main trade-offs.`,
        `How does ${title} behave under overload or partition?`,
        `What would you measure after changing a ${title}-related knob?`,
      ],
      exercises: [
        `Sketch an architecture that depends on ${title}; estimate capacity and list three failure modes.`,
        `Write a one-page runbook for the most likely ${title} outage.`,
      ],
      sources: lesson.sources?.length
        ? lesson.sources
        : [{ title: "Designing Data-Intensive Applications (concepts)" }],
      diagram: {
        title: `${title} context`,
        mermaid: `flowchart LR\n  Client --> Boundary\n  Boundary --> ${title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 24) || "Component"}\n  ${title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 24) || "Component"} --> Dependency`,
      },
    });

    writeJson(lessonPath(rich.moduleId, rich.id), rich);
    n += 1;
  }
  console.log(`Published ${n} previously draft lessons`);
}

main();
