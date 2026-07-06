import type { Phase } from "@/types";

export const phases: Phase[] = [
  {
    id: "foundations",
    number: 1,
    title: "Foundations",
    subtitle: "Before distributed systems",
    description:
      "Master networking, operating systems, and databases from first principles. Everything in system design rests on these pillars.",
    color: "indigo",
  },
  {
    id: "fundamentals",
    number: 2,
    title: "System Design Fundamentals",
    subtitle: "Core building blocks",
    description:
      "Scalability, storage, caching, messaging, distributed systems, APIs, reliability, and security — the vocabulary of every design discussion.",
    color: "violet",
  },
  {
    id: "architecture",
    number: 3,
    title: "Architecture Patterns",
    subtitle: "Structural choices",
    description:
      "Learn when to use monoliths, microservices, event-driven systems, CQRS, and other patterns — and when not to.",
    color: "purple",
  },
  {
    id: "infrastructure",
    number: 4,
    title: "Infrastructure",
    subtitle: "Running systems at scale",
    description:
      "Docker, Kubernetes, CI/CD, observability — how designs become running, monitored production systems.",
    color: "fuchsia",
  },
  {
    id: "design-patterns",
    number: 5,
    title: "Design Patterns",
    subtitle: "Reusable solutions",
    description:
      "Classic software patterns that appear inside services, libraries, and frameworks you'll design and maintain.",
    color: "pink",
  },
  {
    id: "internal-designs",
    number: 6,
    title: "Internal Designs",
    subtitle: "How great systems work inside",
    description:
      "Study Redis, PostgreSQL, Kafka, and other systems to build intuition for what happens under the hood.",
    color: "rose",
  },
  {
    id: "design-systems",
    number: 7,
    title: "Design These Systems",
    subtitle: "Practice by doing",
    description:
      "Progressive design challenges from URL shorteners to distributed filesystems — apply everything you've learned.",
    color: "orange",
  },
  {
    id: "designer-mindset",
    number: 8,
    title: "Think Like a Designer",
    subtitle: "The design framework",
    description:
      "A repeatable framework for any system: requirements, capacity, APIs, trade-offs, failure modes, and cost.",
    color: "amber",
  },
];
