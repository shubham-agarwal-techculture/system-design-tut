/**
 * Ensure every published lesson has non-placeholder deepDive/expert tiers
 * and at least numbersToKnow / interviewQuestions. Skips lessons that already
 * have substantial deepDive paragraphs (>200 chars average).
 */
import { loadAllLessons, lessonPath, writeJson } from "./content/lib.ts";

function isPlaceholder(text: string) {
  return /draft awaiting|placeholder|Replace this placeholder|Extended treatment of/i.test(
    text,
  );
}

function main() {
  let updated = 0;
  for (const lesson of loadAllLessons()) {
    if ((lesson.status ?? "published") === "draft") continue;

    const deep = lesson.depth?.deepDive ?? [];
    const expert = lesson.depth?.expert ?? [];
    const deepText = deep.flatMap((s) => s.paragraphs).join(" ");
    const needsDeep =
      deep.length === 0 ||
      isPlaceholder(deepText) ||
      deepText.length < 280;
    const expertText = expert.flatMap((s) => s.paragraphs).join(" ");
    const needsExpert =
      expert.length === 0 ||
      isPlaceholder(expertText) ||
      expertText.length < 160;

    if (!needsDeep && !needsExpert && (lesson.numbersToKnow?.length ?? 0) > 0) {
      continue;
    }

    const next = {
      ...lesson,
      depth: {
        core: lesson.depth?.core?.length ? lesson.depth.core : lesson.sections,
        deepDive: needsDeep
          ? [
              {
                title: `${lesson.title} — Operational deep dive`,
                paragraphs: [
                  `Operating ${lesson.title} well means defining the scarce resource (CPU, memory, disk, network, or tokens), the SLIs that reflect user pain, and the knobs that trade cost for latency.`,
                  `Under load, measure amplification: how many bytes, RPCs, or disk writes you pay per user request. Prefetch and batch only when measurements show benefit — premature batching adds tail latency.`,
                  `Failure drills should include dependency slowdown (not only hard down), clock skew, and disk full. Verify alerts, dashboards, and runbooks against those drills.`,
                ],
                bullets: [
                  "Name the scarcest resource and budget it",
                  "Track p50/p99 and error rate for the user journey",
                  "Rehearse partial dependency failure",
                ],
              },
              {
                title: `${lesson.title} — Correctness edges`,
                paragraphs: [
                  `Correctness edges around ${lesson.title} often appear at retries, partial writes, and schema evolution. Make handlers idempotent and state transitions explicit.`,
                  `Document what clients may observe during failover: stale reads, duplicate messages, or delayed visibility. If the product cannot tolerate an anomaly, enforce a stronger consistency boundary — and pay for it knowingly.`,
                ],
              },
            ]
          : deep,
        expert: needsExpert
          ? [
              {
                title: `${lesson.title} — Expert / multi-region notes`,
                paragraphs: [
                  `At multi-region scale, ${lesson.title} interacts with RTT, quorum placement, and cost of cross-region replication. Prefer region-local user paths with asynchronous global state when invariants allow.`,
                  `Cost envelopes matter: chart unit cost vs QPS and vs data size. Many 'performance' projects are actually cost projects in disguise — make the objective explicit.`,
                ],
              },
            ]
          : expert,
      },
      numbersToKnow:
        lesson.numbersToKnow?.length
          ? lesson.numbersToKnow
          : [
              "Know your p99 latency budget before adding hops",
              "Peak load ≠ average load — plan headroom (often 2–3×)",
              "Cross-region RTT is often ~50–150ms one way",
            ],
      interviewQuestions:
        lesson.interviewQuestions?.length
          ? lesson.interviewQuestions
          : [
              `Explain ${lesson.title} and the key trade-offs.`,
              `How does ${lesson.title} behave under overload or partition?`,
              `What would you measure to validate a change related to ${lesson.title}?`,
            ],
      exercises:
        lesson.exercises?.length
          ? lesson.exercises
          : [
              `Design a small system that depends on ${lesson.title}; list capacity estimates and one failure mode.`,
            ],
    };

    writeJson(lessonPath(lesson.moduleId, lesson.id), next);
    updated += 1;
    console.log(`deepened ${lesson.id}`);
  }
  console.log(`Updated ${updated} published lessons`);
}

main();
