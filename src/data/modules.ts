import type { Module } from "@/types";

export const modules: Module[] = [
  // Phase 1: Foundations
  {
    id: "networking",
    phaseId: "foundations",
    title: "Networking",
    description: "How data moves across machines — the foundation of every distributed system.",
    order: 1,
    resources: [
      "Computer Networking: A Top-Down Approach",
      "TCP/IP Illustrated, Volume 1",
    ],
  },
  {
    id: "operating-systems",
    phaseId: "foundations",
    title: "Operating Systems",
    description: "Processes, memory, I/O, and concurrency — what your code actually runs on.",
    order: 2,
    resources: [
      "Operating Systems: Three Easy Pieces",
      "Modern Operating Systems",
    ],
  },
  {
    id: "databases",
    phaseId: "foundations",
    title: "Databases",
    description: "How data is stored, indexed, replicated, and queried reliably at scale.",
    order: 3,
    resources: [
      "Designing Data-Intensive Applications",
      "Database Internals",
    ],
  },

  // Phase 2: Fundamentals
  {
    id: "scalability",
    phaseId: "fundamentals",
    title: "Scalability",
    description: "Growing systems vertically, horizontally, and managing state.",
    order: 1,
  },
  {
    id: "storage",
    phaseId: "fundamentals",
    title: "Storage",
    description: "Choosing the right storage for SQL, NoSQL, time-series, and object data.",
    order: 2,
  },
  {
    id: "caching",
    phaseId: "fundamentals",
    title: "Caching",
    description: "Speed through locality — from browser cache to distributed Redis.",
    order: 3,
  },
  {
    id: "messaging",
    phaseId: "fundamentals",
    title: "Messaging",
    description: "Decoupling services with queues, pub/sub, and event streaming.",
    order: 4,
  },
  {
    id: "distributed-systems",
    phaseId: "fundamentals",
    title: "Distributed Systems",
    description: "CAP, consensus, replication, and the trade-offs of distributed state.",
    order: 5,
  },
  {
    id: "apis",
    phaseId: "fundamentals",
    title: "APIs",
    description: "How services communicate — REST, GraphQL, gRPC, and streaming.",
    order: 6,
  },
  {
    id: "reliability",
    phaseId: "fundamentals",
    title: "Reliability",
    description: "Building systems that survive failures gracefully.",
    order: 7,
  },
  {
    id: "security",
    phaseId: "fundamentals",
    title: "Security",
    description: "Authentication, authorization, encryption, and secrets.",
    order: 8,
  },

  // Phase 3: Architecture
  {
    id: "architecture-patterns",
    phaseId: "architecture",
    title: "Architecture Patterns",
    description: "Structural patterns from monolith to serverless.",
    order: 1,
  },

  // Phase 4: Infrastructure
  {
    id: "infra-core",
    phaseId: "infrastructure",
    title: "Infrastructure & Ops",
    description: "Containers, orchestration, CI/CD, and observability.",
    order: 1,
  },

  // Phase 5: Design Patterns
  {
    id: "software-patterns",
    phaseId: "design-patterns",
    title: "Software Design Patterns",
    description: "Reusable object-oriented and behavioral patterns.",
    order: 1,
  },

  // Phase 6: Internal Designs
  {
    id: "system-internals",
    phaseId: "internal-designs",
    title: "System Internals",
    description: "Deep dives into how production systems are built internally.",
    order: 1,
  },

  // Phase 7: Design Systems (challenges module)
  {
    id: "design-challenges",
    phaseId: "design-systems",
    title: "Design Challenges",
    description: "Hands-on system design exercises at increasing difficulty.",
    order: 1,
  },

  // Phase 8: Designer Mindset
  {
    id: "design-framework",
    phaseId: "designer-mindset",
    title: "The Design Framework",
    description: "A repeatable process for approaching any system design problem.",
    order: 1,
  },
];
