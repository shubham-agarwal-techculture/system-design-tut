/**
 * Expand curriculum offline:
 * 1) Sync phases/modules JSON with syllabus
 * 2) Stub missing syllabus lessons
 * 3) Deepen existing lessons with deepDive/expert placeholders
 * 4) Add AI-track / trading challenges
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  contentDir,
  lessonPath,
  loadAllLessons,
  loadSyllabus,
  stubLesson,
  writeJson,
  readJson,
} from "./content/lib.ts";
import type { DesignChallenge, Module, Phase } from "../src/content/schema.ts";

function deepenOffline(lesson: ReturnType<typeof loadAllLessons>[number]) {
  const hasDeep = (lesson.depth?.deepDive?.length ?? 0) > 0;
  const hasExpert = (lesson.depth?.expert?.length ?? 0) > 0;
  if (hasDeep && hasExpert) return null;

  return {
    ...lesson,
    depth: {
      core: lesson.depth?.core?.length ? lesson.depth.core : lesson.sections,
      deepDive: hasDeep
        ? lesson.depth!.deepDive
        : [
            {
              title: `${lesson.title} — Deep Dive`,
              paragraphs: [
                `Extended treatment of ${lesson.title}: internals, operational knobs, and failure domains.`,
                "Tune based on measured bottlenecks rather than folklore. Prefer reversible changes.",
              ],
              bullets: [
                "Define SLIs before optimizing",
                "Know amplification costs (read/write/space/network)",
                "Document blast radius for each failure mode",
              ],
            },
          ],
      expert: hasExpert
        ? lesson.depth!.expert
        : [
            {
              title: `${lesson.title} — Expert Notes`,
              paragraphs: [
                `Expert considerations for ${lesson.title}: multi-region behavior, cost envelopes, and edge cases under overload.`,
              ],
            },
          ],
    },
    diagrams:
      lesson.diagrams?.length
        ? lesson.diagrams
        : [
            {
              id: `${lesson.id}-overview`,
              title: `${lesson.title} overview`,
              mermaid: `flowchart LR\n  Client --> Service\n  Service --> Dependency`,
            },
          ],
    numbersToKnow: lesson.numbersToKnow?.length
      ? lesson.numbersToKnow
      : ["Define p50/p99 latency and error budget before scaling"],
    interviewQuestions: lesson.interviewQuestions?.length
      ? lesson.interviewQuestions
      : [`Explain ${lesson.title} and the main trade-offs in 3 minutes.`],
    exercises: lesson.exercises?.length
      ? lesson.exercises
      : [`Design a small system that depends on ${lesson.title}; list 3 trade-offs.`],
  };
}

function syncCatalog() {
  const syllabus = loadSyllabus();
  const existingPhases = existsSync(join(contentDir, "phases.json"))
    ? readJson<Phase[]>(join(contentDir, "phases.json"))
    : [];
  const existingModules = existsSync(join(contentDir, "modules.json"))
    ? readJson<Module[]>(join(contentDir, "modules.json"))
    : [];

  const phaseById = new Map(existingPhases.map((p) => [p.id, p]));
  const moduleById = new Map(existingModules.map((m) => [m.id, m]));

  const phases: Phase[] = syllabus.phases.map((p) => {
    const prev = phaseById.get(p.id);
    return {
      id: p.id,
      number: p.number,
      title: p.title,
      subtitle: p.subtitle ?? prev?.subtitle ?? "",
      description: p.description ?? prev?.description ?? "",
      color: p.color ?? prev?.color ?? "graphite",
    };
  });

  const modules: Module[] = [];
  for (const p of syllabus.phases) {
    p.modules.forEach((m, idx) => {
      const prev = moduleById.get(m.id);
      modules.push({
        id: m.id,
        phaseId: p.id,
        title: m.title,
        description: m.description ?? prev?.description ?? m.title,
        order: prev?.order ?? idx + 1,
        resources: prev?.resources,
      });
    });
  }

  writeJson(join(contentDir, "phases.json"), phases);
  writeJson(join(contentDir, "modules.json"), modules);
  return { phases, modules, syllabus };
}

function addChallenges() {
  const path = join(contentDir, "challenges.json");
  const existing = readJson<DesignChallenge[]>(path);
  const ids = new Set(existing.map((c) => c.id));

  const extras: DesignChallenge[] = [
    {
      id: "llm-inference-platform",
      title: "LLM Inference Platform",
      difficulty: "advanced",
      description:
        "Design a multi-tenant LLM inference platform with continuous batching, autoscaling GPUs, and cost-per-token metering.",
      hints: [
        "Separate prefill and decode if traffic mix warrants it",
        "Track KV cache memory as a first-class resource",
        "Meter tokens, not only requests",
      ],
      checklist: [
        "Batching strategy",
        "GPU pool autoscaling",
        "Multi-tenant isolation",
        "Cost attribution",
        "Fallback across models",
      ],
      estimatedMinutes: 60,
      rubric: [
        "Correctly models KV cache / memory pressure",
        "Has a coherent autoscaling signal",
        "Addresses noisy-neighbor isolation",
        "Defines SLOs for latency and availability",
      ],
      scaleVariants: [
        "10x QPS with same GPU budget",
        "Add multi-LoRA adapters per tenant",
      ],
      tags: ["ai", "inference"],
      status: "published",
      phaseId: "training-inference",
    },
    {
      id: "enterprise-rag",
      title: "Enterprise RAG Search",
      difficulty: "advanced",
      description:
        "Design a RAG system over millions of private documents with hybrid retrieval, ACL-aware ranking, and evals.",
      hints: [
        "Chunking and metadata matter as much as the embedding model",
        "Enforce ACLs at retrieval time",
        "Evals as CI for regressions",
      ],
      checklist: [
        "Ingestion pipeline",
        "Hybrid search",
        "ACL filtering",
        "Reranking",
        "Evaluation harness",
      ],
      estimatedMinutes: 55,
      rubric: [
        "Security/ACL model is sound",
        "Retrieval quality measurable",
        "Clear failure modes for hallucination",
      ],
      scaleVariants: ["10x corpus", "Multi-lingual corpus"],
      tags: ["ai", "rag"],
      status: "published",
      phaseId: "agentic-systems",
    },
    {
      id: "coding-agent-platform",
      title: "Coding Agent Platform",
      difficulty: "expert",
      description:
        "Design a coding agent platform with sandboxed tool execution, durable workflows, and permissioning.",
      hints: [
        "Treat tool calls as idempotent where possible",
        "Sandbox untrusted code execution",
        "Persist agent state for long runs",
      ],
      checklist: [
        "Tool protocol",
        "Sandbox isolation",
        "Durable execution",
        "Permission model",
        "Observability/tracing",
      ],
      estimatedMinutes: 75,
      rubric: [
        "Security boundaries are explicit",
        "Durability and retries are designed",
        "Human-in-the-loop for sensitive actions",
      ],
      scaleVariants: ["10k concurrent agents"],
      tags: ["ai", "agents"],
      status: "published",
      phaseId: "agentic-systems",
    },
    {
      id: "matching-engine",
      title: "Exchange Matching Engine",
      difficulty: "expert",
      description:
        "Design a low-latency matching engine with fair ordering, deterministic replay, and risk checks.",
      hints: [
        "Determinism enables replay and audit",
        "Separate market data fanout from matching",
        "Pre-trade risk must not become a hidden latency cliff",
      ],
      checklist: [
        "Order book structure",
        "Matching rules",
        "Deterministic journal",
        "Market data dissemination",
        "Risk controls",
      ],
      estimatedMinutes: 90,
      rubric: [
        "Latency path is credible",
        "Determinism/replay addressed",
        "Risk and fairness considered",
      ],
      scaleVariants: ["10x order rate", "Multi-symbol sharding"],
      tags: ["trading", "low-latency"],
      status: "published",
      phaseId: "low-latency",
    },
  ];

  const merged = [...existing];
  for (const c of extras) {
    if (!ids.has(c.id)) merged.push(c);
  }

  // Enrich existing with empty rubric/scaleVariants if missing
  const enriched = merged.map((c) => ({
    ...c,
    rubric: c.rubric?.length
      ? c.rubric
      : [
          "Requirements and constraints stated",
          "Capacity estimation present",
          "Key trade-offs named",
          "Failure modes addressed",
        ],
    scaleVariants: c.scaleVariants?.length
      ? c.scaleVariants
      : ["Scale traffic 10x", "Add multi-region"],
    status: c.status ?? "published",
  }));

  writeJson(path, enriched);
  return enriched.length - existing.length;
}

function main() {
  const { syllabus } = syncCatalog();
  const existing = new Map(loadAllLessons().map((l) => [l.id, l]));

  let stubs = 0;
  let deepened = 0;

  for (const phase of syllabus.phases) {
    for (const mod of phase.modules) {
      for (const t of mod.lessons) {
        const path = lessonPath(mod.id, t.id);
        if (!existsSync(path)) {
          writeJson(
            path,
            stubLesson({
              id: t.id,
              title: t.title,
              moduleId: mod.id,
              phaseId: phase.id,
              kind: t.kind,
            }),
          );
          stubs += 1;
          continue;
        }
      }
    }
  }

  for (const lesson of loadAllLessons()) {
    const next = deepenOffline(lesson);
    if (next) {
      writeJson(lessonPath(lesson.moduleId, lesson.id), next);
      deepened += 1;
    }
  }

  // Seed a couple of rich AI-track lessons (not just stubs)
  seedRichLessons();

  const addedChallenges = addChallenges();
  console.log(
    `Expand complete: ${stubs} stubs, ${deepened} deepened, ${addedChallenges} new challenges.`,
  );
}

function seedRichLessons() {
  const rich = [
    {
      id: "ml-attention-kv",
      moduleId: "ml-transformers",
      phaseId: "ml-foundations",
      title: "Attention Cost & KV Cache",
      kind: "evergreen" as const,
      summary:
        "Transformers spend memory and compute on attention. The KV cache is the dominant serving-memory cost during decode — system designers must treat it as a first-class resource.",
      sections: [
        {
          title: "Why attention dominates the systems budget",
          paragraphs: [
            "Self-attention lets every token attend to every earlier token. Naively, that is quadratic in sequence length for compute and memory. Training can often afford full attention; autoregressive inference cannot casually ignore the growing key/value tensors.",
            "During decode, each new token reuses prior keys and values. Systems cache them (the KV cache) so they are not recomputed. Cache size grows with batch × layers × heads × sequence × dtype — frequently the binding constraint on GPU memory before FLOPs are exhausted.",
          ],
          bullets: [
            "Prefill: process the prompt (compute-heavy)",
            "Decode: emit tokens one-by-one (memory-bandwidth heavy)",
            "KV cache: stored keys/values per layer for prior tokens",
          ],
        },
        {
          title: "Design implications",
          paragraphs: [
            "Paged attention (as in vLLM) treats KV blocks like virtual memory pages to reduce fragmentation. Prefix caching reuses KV for shared prompt prefixes across requests. Separating prefill and decode onto different pools can improve utilization when traffic mixes long prompts with long generations.",
            "When estimating capacity, start from concurrent sequences × expected context × bytes per KV element × layers — then compare to HBM. Quantization (FP8/INT8/INT4) and speculative decoding change the cost curve but do not remove the need for this estimate.",
          ],
        },
      ],
      concepts: [
        "KV cache memory scales with context and concurrency",
        "Prefill vs decode have different bottlenecks",
        "Paged attention reduces KV fragmentation",
      ],
      practices: [
        "Budget GPU memory from KV before picking batch size",
        "Measure cache hit rates for prefix caching",
      ],
      pitfalls: [
        "Sizing fleets from FLOPs alone",
        "Ignoring fragmentation in naive contiguous KV allocation",
      ],
      keyTakeaways: [
        "KV cache is often the real capacity limit for LLM serving",
        "Systems tricks (paging, prefix cache, prefill/decode split) exist to manage it",
      ],
      whyItMatters:
        "Without a KV-aware capacity model, inference platforms overcommit memory and collapse under realistic context lengths.",
      reflectionQuestions: [
        "How would you estimate max concurrent 8k-context sessions on an 80GB GPU?",
      ],
    },
    {
      id: "ti-batching",
      moduleId: "inference-serving",
      phaseId: "training-inference",
      title: "Continuous Batching & Paged Attention",
      kind: "living" as const,
      summary:
        "Continuous batching keeps GPUs busy by admitting new requests as others finish tokens. Paged attention makes the KV memory layout practical at high concurrency.",
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
      ],
      concepts: [
        "Continuous batching schedules per decode step",
        "KV block tables enable paging and sharing",
      ],
      practices: [
        "Expose memory utilization as an autoscaling signal",
        "Separate SLO classes (interactive vs batch) in the scheduler",
      ],
      pitfalls: [
        "Autoscaling on CPU/GPU util alone while KV is the bottleneck",
      ],
      keyTakeaways: [
        "Serving efficiency is a scheduling + memory-layout problem",
      ],
      whyItMatters:
        "Throughput and cost-per-token at scale depend more on batching and KV layout than on raw model FLOPs.",
      reflectionQuestions: [
        "What signals would you use to autoscale an inference pool?",
      ],
    },
    {
      id: "ag-rag-core",
      moduleId: "rag-systems",
      phaseId: "agentic-systems",
      title: "Chunking, Hybrid Search & Reranking",
      kind: "living" as const,
      summary:
        "RAG quality is dominated by retrieval design: how you chunk, what you index, how you fuse lexical and dense signals, and how you rerank before generation.",
      sections: [
        {
          title: "Chunking is an API contract",
          paragraphs: [
            "Chunk size, overlap, and metadata (title, section path, ACLs, timestamps) determine what the model can cite. Over-long chunks dilute embeddings; over-short chunks lose context. Structure-aware chunking (headings, tables) usually beats fixed character windows.",
          ],
        },
        {
          title: "Hybrid retrieval and reranking",
          paragraphs: [
            "Lexical search (BM25) handles rare identifiers; dense vectors handle paraphrase. Fuse candidates (e.g. reciprocal rank fusion) then apply a cross-encoder or LLM reranker on a shortlist. Always enforce document ACLs before the prompt is built.",
          ],
        },
      ],
      concepts: [
        "Hybrid search = lexical + dense",
        "Rerankers trade latency for precision on a shortlist",
        "ACL filtering belongs in retrieval, not only in the UI",
      ],
      practices: [
        "Build an eval set before tuning chunk size",
        "Log retrieved chunk IDs with every answer for debugging",
      ],
      pitfalls: [
        "Prompting a larger model to compensate for bad retrieval",
        "Embedding without metadata filters",
      ],
      keyTakeaways: [
        "RAG is an information-retrieval system with an LLM on top",
      ],
      whyItMatters:
        "Most production RAG failures are retrieval and permissioning failures, not model failures.",
      reflectionQuestions: [
        "How would you detect a retrieval regression in CI?",
      ],
    },
    {
      id: "ll-matching",
      moduleId: "trading-core",
      phaseId: "low-latency",
      title: "Matching Engines",
      kind: "evergreen" as const,
      summary:
        "A matching engine applies deterministic rules to an order book under tight latency budgets. Correctness, fairness, and replayability dominate design.",
      sections: [
        {
          title: "Deterministic core",
          paragraphs: [
            "The matching loop consumes a sequenced input log and produces trades and book updates. Determinism enables replay for audit, debugging, and state reconstruction after failure. Shared-nothing per-symbol shards are common; cross-symbol constraints need careful design.",
          ],
        },
        {
          title: "Latency path",
          paragraphs: [
            "Hot path techniques include preallocated structures, avoidance of syscalls on the match path, and careful cache locality for price levels. Market data fanout and persistence are adjacent systems with their own SLOs — do not block matching on slow consumers.",
          ],
        },
      ],
      concepts: [
        "Sequenced input log + deterministic apply",
        "Per-symbol sharding",
        "Decouple matching from market-data fanout",
      ],
      practices: [
        "Journal inputs before effects when durability requires it",
        "Define fairness rules explicitly (price-time, pro-rata, etc.)",
      ],
      pitfalls: [
        "Hidden latency from synchronous risk or logging on the hot path",
      ],
      keyTakeaways: [
        "Matching engines are specialized deterministic state machines",
      ],
      whyItMatters:
        "Financial and other high-contention marketplaces fail catastrophically when ordering and replay semantics are vague.",
      reflectionQuestions: [
        "How would you recover matching state after a crash mid-batch?",
      ],
    },
  ];

  for (const r of rich) {
    const path = lessonPath(r.moduleId, r.id);
    const base = stubLesson({
      id: r.id,
      title: r.title,
      moduleId: r.moduleId,
      phaseId: r.phaseId,
      kind: r.kind,
    });
    writeJson(path, {
      ...base,
      ...r,
      status: "published",
      version: "1.0.0",
      depth: {
        core: r.sections,
        deepDive: [
          {
            title: `${r.title} — Deep Dive`,
            paragraphs: [
              `Operational detail for ${r.title}: metrics to watch, capacity knobs, and failure injection ideas.`,
            ],
          },
        ],
        expert: [
          {
            title: `${r.title} — Expert Notes`,
            paragraphs: [
              `Edge cases and multi-tenant considerations for ${r.title}.`,
            ],
          },
        ],
      },
      examples: [
        {
          title: "Production pattern",
          description: `Teams operating ${r.title.toLowerCase()} treat measurement and budgets as part of the design, not an afterthought.`,
        },
      ],
    });
  }
}

main();
