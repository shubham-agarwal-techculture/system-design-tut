import { lesson } from "./helpers";

export const architectureInfraLessons = [
  lesson({
    id: "arch-monolith-micro",
    title: "Monolith to Microservices",
    moduleId: "architecture-patterns",
    phaseId: "architecture",
    durationMinutes: 40,
    summary:
      "Most successful systems start as a monolith and evolve toward microservices only when organizational scale, deployment independence, or technical constraints demand it. This lesson teaches you how to recognize the right moment to split, how to decompose safely, and which complementary patterns — modular monoliths, event-driven architecture, CQRS, and event sourcing — fit each stage of growth.",
    sections: [
      {
        title: "The Monolith Spectrum: From Big Ball of Mud to Modular Monolith",
        paragraphs: [
          "A monolith is not a single architecture — it is a deployment model. At one end sits the 'big ball of mud': tangled code with no clear boundaries, where every change risks breaking unrelated features. At the other end is the modular monolith: one deployable unit with well-defined internal modules, explicit interfaces between them, and enforced dependency rules.",
          "The modular monolith gives you most of the development speed of a single codebase — shared types, atomic refactors, simple debugging — while preserving logical boundaries that can later become service boundaries. Teams that skip this step and jump straight to microservices often recreate the monolith's coupling across network calls, but now with latency, partial failures, and distributed transactions added on top.",
          "Before considering microservices, ask: can we enforce module boundaries in code? Can we deploy independently within the monolith using feature flags? Can we scale the entire application horizontally behind a load balancer? If yes, you may not need to split yet.",
        ],
        bullets: [
          "Single deployable artifact: one build pipeline, one runtime, one database (often)",
          "In-process calls: nanosecond latency, ACID transactions across modules",
          "Modular monolith: package-by-feature, dependency rules (e.g., domain cannot import infrastructure)",
          "Anti-pattern: 'distributed monolith' — many services that must deploy together",
        ],
      },
      {
        title: "When and How to Extract Microservices",
        paragraphs: [
          "Microservices earn their complexity when a bounded part of your system has genuinely different scaling, deployment, or team ownership needs. Classic signals include: one module needs 10× the CPU of everything else; one team wants daily deploys while another needs monthly stability; a component uses a different runtime (Python ML pipeline vs. Java API); or regulatory isolation requires separate audit boundaries.",
          "The Strangler Fig pattern is the safest extraction path: build a new service alongside the monolith, route a slice of traffic to it via a proxy or feature flag, migrate data incrementally, and retire the old code path only when the new service is proven. Never attempt a 'big bang' rewrite — history shows these fail more often than they succeed.",
          "Each extracted service should own its data. Shared databases between services recreate coupling and make independent deployment impossible. Start with read-heavy, loosely coupled domains (notifications, search indexing, reporting) before tackling core transactional paths like payments or inventory.",
        ],
        bullets: [
          "Identify bounded contexts (from DDD) as candidate service boundaries",
          "Extract along seams that already have async communication (events, queues)",
          "Use an API gateway or BFF (Backend for Frontend) to aggregate client-facing calls",
          "Plan for synchronous vs. asynchronous inter-service communication upfront",
        ],
      },
      {
        title: "Event-Driven Architecture and Loose Coupling",
        paragraphs: [
          "In a microservices landscape, direct HTTP calls between dozens of services create brittle dependency graphs — a failure in the recommendation service should not block checkout. Event-driven architecture decouples producers from consumers: the Order Service publishes an OrderPlaced event; Inventory, Email, Analytics, and Fraud services react independently.",
          "Message brokers (Kafka, RabbitMQ, SNS/SQS) provide durability, replay, and fan-out. Design events as past-tense facts ('OrderPlaced', 'PaymentCaptured') rather than commands ('ProcessOrder'), so multiple consumers can react without the producer knowing who listens.",
          "The trade-off is eventual consistency. When a user completes checkout, their order confirmation email may arrive seconds later. Your UX and business logic must tolerate this — show optimistic UI, use idempotent consumers, and design compensating transactions for failures.",
        ],
        bullets: [
          "Choreography: services react to events without a central orchestrator",
          "Orchestration: a saga coordinator sequences steps (use for complex multi-step flows)",
          "Outbox pattern: write events to a DB table in the same transaction as business data, then publish asynchronously",
          "Dead letter queues capture poison messages for investigation",
        ],
      },
      {
        title: "CQRS and Event Sourcing: When Reads and Writes Diverge",
        paragraphs: [
          "Command Query Responsibility Segregation (CQRS) separates the model used for writes (commands) from the model used for reads (queries). In a simple CRUD app, one model suffices. But when read patterns differ radically from write patterns — a write-heavy order system with complex analytics dashboards — separate models let you optimize each independently.",
          "Event sourcing takes this further: instead of storing current state, you store an append-only log of state-changing events. Current state is derived by replaying events. This gives you a complete audit trail, temporal queries ('what did the account look like on March 1?'), and natural integration with event-driven systems.",
          "These patterns add significant complexity. Use CQRS when read/write load profiles genuinely differ or when you need multiple read-optimized projections. Use event sourcing when auditability, replay, or temporal queries are core requirements — not because it sounds architecturally impressive.",
        ],
        bullets: [
          "Write model: normalized, enforces invariants, handles business rules",
          "Read model: denormalized projections optimized for specific queries (materialized views)",
          "Projections rebuild from the event log when schemas change",
          "Snapshots prevent replaying millions of events on every read",
        ],
      },
      {
        title: "Serverless and the Continuum of Decomposition",
        paragraphs: [
          "Serverless (FaaS) is the extreme end of decomposition: individual functions triggered by events, scaled to zero, billed per invocation. It fits spiky, stateless workloads — image processing, webhook handlers, scheduled jobs — but struggles with long-running processes, persistent connections, and cold-start-sensitive latency requirements.",
          "Architecture is a continuum, not a binary choice. A typical mature system might run a modular monolith for core business logic, microservices for independently scaling components, serverless for event reactions, and a shared event bus tying them together. The goal is the minimum decomposition that solves your actual constraints.",
          "Measure before splitting. If your monolith handles 500 req/s with p99 latency under 100ms and deploys weekly without conflict, microservices will slow you down. If three teams block each other on every release and one module consumes 80% of infrastructure budget, targeted extraction will pay for itself within quarters.",
        ],
      },
    ],
    concepts: [
      "Monolith: single deployable unit — simplest ops, hardest to scale teams independently",
      "Modular monolith: enforced internal boundaries without network overhead",
      "Microservices: independently deployable, scalable, and failure-isolated services",
      "Bounded context: a DDD boundary where a domain model is consistent and autonomous",
      "Strangler Fig pattern: incrementally replace monolith functionality with new services",
      "Event-driven architecture: services communicate via asynchronous domain events",
      "Saga pattern: coordinate distributed transactions via compensating actions",
      "CQRS: separate read and write models optimized for different access patterns",
      "Event sourcing: store state changes as an immutable append-only event log",
      "Serverless (FaaS): event-triggered functions with automatic scaling and pay-per-use billing",
    ],
    practices: [
      "Start with a modular monolith; enforce package boundaries and dependency rules from day one",
      "Extract services along existing bounded contexts, not along technical layers (don't split 'the database service')",
      "Each microservice owns its data store — no shared databases between services",
      "Publish domain events as past-tense facts; keep event schemas backward-compatible",
      "Use the Strangler Fig pattern for migration — never big-bang rewrite",
      "Design for failure: timeouts, retries with jitter, circuit breakers on every synchronous call",
      "Measure team velocity, deployment frequency, and infrastructure cost before and after splitting",
    ],
    pitfalls: [
      "Premature microservices: splitting before team size or scaling needs justify the operational overhead",
      "Distributed monolith: services so coupled they must deploy together, but now with network latency",
      "Shared database anti-pattern: multiple services writing to the same tables breaks independent deployment",
      "Chatty services: chains of synchronous HTTP calls that multiply latency and failure rates",
      "Ignoring eventual consistency: assuming distributed systems behave like a single ACID database",
      "Over-engineering with event sourcing when simple CRUD and audit logs would suffice",
    ],
    examples: [
      {
        title: "Shopify's Modular Monolith",
        description:
          "Shopify runs one of the largest Ruby on Rails monoliths in production, serving millions of merchants. They invest heavily in modular boundaries (component-based architecture) and horizontal scaling rather than premature service extraction. Their lesson: monoliths scale further than most teams assume when modularized well.",
      },
      {
        title: "Netflix's Microservices Evolution",
        description:
          "Netflix migrated from a monolithic DVD rental app to 700+ microservices on AWS. Each service owns its data, communicates via REST and async events, and deploys independently — thousands of times per day. They extracted services when scaling, fault isolation, and team autonomy demands exceeded what the monolith could support.",
      },
      {
        title: "Uber's Domain-Oriented Microservices",
        description:
          "Uber decomposed around business domains (Rider, Driver, Eats, Freight) rather than technical layers. Each domain team owns services end-to-end. Cross-domain communication uses gRPC for synchronous calls and Kafka for async events, with explicit schema registries to prevent breaking changes.",
      },
    ],
    keyTakeaways: [
      "Monoliths are a valid and often optimal choice for early-stage and mid-size systems",
      "Modular monoliths preserve simplicity while preparing clean extraction boundaries",
      "Split services when scaling, deployment, or team autonomy needs exceed monolith capacity",
      "Event-driven architecture decouples services but introduces eventual consistency",
      "CQRS and event sourcing are powerful but should be applied to specific problems, not by default",
      "The Strangler Fig pattern is the safest path from monolith to microservices",
      "Architecture is a continuum — mix monolith, microservices, and serverless where each fits best",
    ],
    whyItMatters:
      "Architecture style is one of the highest-impact and hardest-to-reverse decisions in system design. Premature microservices drain velocity with operational complexity; a neglected monolith becomes unmaintainable. Understanding the full spectrum — and the signals for when to move — lets you choose consciously and evolve gracefully as your system and organization grow.",
    reflectionQuestions: [
      "What signals in your current (or a hypothetical) project would indicate it's time to extract a microservice?",
      "Draw the dependency graph of services in a system you know. Where are the synchronous chains that would cause cascading failures?",
      "For an e-commerce checkout flow, which steps could be eventual (async) and which must be synchronous? Why?",
      "When would you choose event sourcing over a traditional database with an audit log table?",
    ],
    resources: [
      "Building Microservices (Sam Newman)",
      "Monolith to Microservices (Sam Newman)",
      "Designing Data-Intensive Applications — Chapters 11-12 (Martin Kleppmann)",
      "microservices.io patterns catalog (Chris Richardson)",
      "Shopify Engineering: Deconstructing the Monolith",
    ],
  }),

  lesson({
    id: "arch-clean-ddd",
    title: "Clean Architecture & DDD",
    moduleId: "architecture-patterns",
    phaseId: "architecture",
    durationMinutes: 38,
    summary:
      "Clean Architecture and Domain-Driven Design (DDD) organize code around business domains rather than technical frameworks. This lesson covers hexagonal architecture, dependency inversion, bounded contexts, aggregates, and the tactical patterns that keep core business logic testable, framework-independent, and aligned with how the business actually works.",
    sections: [
      {
        title: "Clean Architecture: Dependencies Point Inward",
        paragraphs: [
          "Robert Martin's Clean Architecture organizes code into concentric rings. The innermost ring is the domain — entities and business rules that would exist even if you had no database, no web framework, and no UI. Each outer ring depends on the inner rings, never the reverse. Frameworks, databases, and UI are details that belong on the outside.",
          "The Dependency Inversion Principle makes this work: high-level modules (business logic) define interfaces (ports); low-level modules (database adapters, HTTP handlers) implement them. Your OrderService depends on an IOrderRepository interface defined in the domain layer; PostgreSQLOrderRepository in the infrastructure layer implements it.",
          "The payoff is testability and longevity. You can unit-test business rules without spinning up a database. You can swap PostgreSQL for MongoDB by writing a new adapter. When your web framework releases a breaking version, the domain layer doesn't change.",
        ],
        bullets: [
          "Entities: core business objects with identity and lifecycle (Order, Customer, Account)",
          "Use cases / application services: orchestrate domain logic for a specific user action",
          "Interface adapters: controllers, presenters, gateways that translate between layers",
          "Frameworks & drivers: web framework, ORM, message broker — outermost, most replaceable",
        ],
      },
      {
        title: "Hexagonal Architecture: Ports and Adapters",
        paragraphs: [
          "Alistair Cockburn's Hexagonal Architecture (Ports and Adapters) expresses the same idea with a vivid metaphor: the application core is a hexagon with ports (interfaces) on each side. Adapters plug into those ports — a REST controller adapter on one side, a PostgreSQL repository adapter on another, a Kafka event publisher on a third.",
          "Primary (driving) adapters initiate interaction: HTTP controllers, CLI commands, message consumers. Secondary (driven) adapters respond to the core's needs: database repositories, email senders, external API clients. The core knows nothing about HTTP status codes or SQL syntax.",
          "This symmetry makes the architecture explicit in your folder structure: domain/ contains entities and ports; application/ contains use cases; adapters/inbound/ and adapters/outbound/ contain framework-specific code. New team members can navigate by business concept, not by technology.",
        ],
        bullets: [
          "Port: an interface the core defines (OrderRepository, PaymentGateway, EventPublisher)",
          "Adapter: a concrete implementation for a specific technology (PostgresOrderRepository, StripePaymentGateway)",
          "Primary adapter: drives the application (HTTP handler calls CreateOrderUseCase)",
          "Secondary adapter: driven by the application (use case calls repository.save())",
        ],
      },
      {
        title: "Domain-Driven Design: Strategic Patterns",
        paragraphs: [
          "Eric Evans' Domain-Driven Design distinguishes strategic design (how large systems are divided) from tactical design (how code is structured within a boundary). The strategic cornerstone is the bounded context: a explicit boundary within which a particular domain model is defined and consistent.",
          "In an e-commerce platform, 'Product' means different things in different contexts: the Catalog context cares about descriptions and images; the Inventory context cares about stock counts and warehouse locations; the Pricing context cares about cost, margin, and discounts. Forcing one Product model across all three creates confusion and coupling.",
          "Context maps document relationships between bounded contexts: Shared Kernel (shared code), Customer-Supplier (upstream/downstream), Conformist (downstream adopts upstream model), Anti-Corruption Layer (translates foreign models). These relationships guide integration decisions when building microservices or modular monoliths.",
        ],
        bullets: [
          "Ubiquitous language: developers and business stakeholders use the same terms in code and conversation",
          "Bounded context: scope where a domain model is internally consistent",
          "Context map: visual diagram of how bounded contexts relate and integrate",
          "Anti-corruption layer: translation layer preventing foreign domain models from leaking in",
        ],
      },
      {
        title: "Domain-Driven Design: Tactical Patterns",
        paragraphs: [
          "Within a bounded context, tactical patterns structure the domain model. Entities have identity that persists over time (Order #12345). Value objects are defined by their attributes, not identity — Money($10, USD), Address, DateRange. They are immutable and interchangeable.",
          "Aggregates are clusters of entities and value objects treated as a single consistency boundary. An Order aggregate contains OrderLineItems; you never modify a line item directly — you load the Order, call order.addItem(), and save the whole aggregate. This ensures invariants (total price matches sum of items) are always enforced.",
          "Domain events capture something meaningful that happened in the domain: OrderPlaced, PaymentFailed, InventoryReserved. They enable loose coupling between aggregates and bounded contexts. Domain services handle operations that don't naturally belong to a single entity (e.g., transferring funds between two Accounts).",
        ],
        bullets: [
          "Entity: object with unique identity (Customer, Order, Shipment)",
          "Value object: immutable, defined by attributes (Email, Money, GeoCoordinate)",
          "Aggregate root: the single entry point for modifying an aggregate (Order is root; LineItem is not accessed directly)",
          "Repository: persistence abstraction that retrieves and saves aggregates as whole units",
          "Domain event: record of a significant state change within the domain",
        ],
      },
      {
        title: "Applying Clean Architecture and DDD in Practice",
        paragraphs: [
          "These patterns are not all-or-nothing. A CRUD admin panel doesn't need aggregates and domain events. A payment processing core benefits enormously from them. Apply DDD tactically where business complexity is highest — the domain experts care deeply about correctness there.",
          "Common project structure: src/domain/ (entities, value objects, repository interfaces, domain events), src/application/ (use cases, DTOs, application services), src/infrastructure/ (database adapters, message broker adapters, external API clients), src/interfaces/ (HTTP controllers, GraphQL resolvers, CLI).",
          "Testing strategy follows naturally: unit tests for domain logic (fast, no I/O), integration tests for adapters (real database in test container), end-to-end tests for critical user flows. Most tests should live at the unit level because the domain layer contains the business rules that matter most.",
        ],
      },
    ],
    concepts: [
      "Clean Architecture: concentric layers with dependencies pointing inward toward the domain",
      "Dependency Inversion: high-level modules define interfaces; low-level modules implement them",
      "Hexagonal Architecture: application core connected via ports and adapters",
      "Bounded context: explicit boundary where a domain model is consistent",
      "Ubiquitous language: shared vocabulary between developers and domain experts",
      "Entity vs. value object: identity-based vs. attribute-based domain objects",
      "Aggregate: consistency boundary grouping entities and value objects under a root",
      "Domain event: immutable record of a significant business occurrence",
      "Anti-corruption layer: translation boundary protecting your domain from external models",
      "Repository pattern: abstract persistence behind a domain-centric interface",
    ],
    practices: [
      "Define ubiquitous language terms in a glossary shared with product and business teams",
      "Place business rules in the domain layer — never in controllers or database triggers",
      "Design aggregates small enough to load and save in one transaction",
      "Use value objects for concepts like Money, Email, and Address to enforce invariants at construction",
      "Define repository interfaces in the domain layer; implement them in infrastructure",
      "Publish domain events from aggregate roots when state changes meaningfully",
      "Apply DDD tactically to complex core domains; use simpler patterns for CRUD periphery",
    ],
    pitfalls: [
      "Anemic domain model: entities are data bags with all logic in service classes — defeats the purpose of DDD",
      "Over-sized aggregates: loading an entire Customer with all Orders, Payments, and Addresses kills performance",
      "Bounded context bleed: one team's model silently used by another without translation",
      "Framework-driven design: letting ORM annotations and controller decorators define your architecture",
      "Premature DDD: applying aggregates and context maps to a simple CRUD app adds complexity without benefit",
      "Ignoring the context map: integrating bounded contexts without explicit relationship strategy",
    ],
    examples: [
      {
        title: "Amazon's Bounded Contexts",
        description:
          "Amazon's platform spans dozens of bounded contexts — Catalog, Ordering, Fulfillment, Payments, Recommendations — each with its own model of core concepts. 'Product' in Catalog (marketing copy, images) differs from 'Product' in Fulfillment (weight, dimensions, hazmat flags). Anti-corruption layers translate between them at integration points.",
      },
      {
        title: "Clean Architecture in a Payment Service",
        description:
          "A payment service's domain layer defines Payment (entity), Money (value object), and PaymentGateway (port). The application layer has ProcessPaymentUseCase. Infrastructure provides StripeGateway and PostgresPaymentRepository. The domain can be fully tested with mock adapters — no Stripe API or database required.",
      },
    ],
    keyTakeaways: [
      "Organize code around business domains, not technical layers or frameworks",
      "Dependencies must point inward — the domain never imports infrastructure",
      "Bounded contexts prevent a single overloaded model from serving every use case",
      "Aggregates enforce consistency boundaries — always modify through the root",
      "Ports and adapters make the core testable and technology-swappable",
      "Apply DDD where business complexity is high; keep CRUD areas simple",
      "Ubiquitous language bridges the gap between code and business stakeholders",
    ],
    whyItMatters:
      "Systems outlive frameworks. The average web framework has a 5–10 year dominance cycle; business rules persist for decades. Clean Architecture and DDD protect your most valuable asset — business logic — from being entangled with replaceable infrastructure. In system design interviews and real projects, demonstrating domain-centric thinking signals senior-level engineering judgment.",
    reflectionQuestions: [
      "Identify two bounded contexts in a system you know. How does the same concept (e.g., 'User' or 'Product') differ between them?",
      "Where in your current codebase does business logic leak into controllers or ORM models? How would you move it inward?",
      "Design an aggregate for a library book lending system. What is the root? What invariants must it enforce?",
      "When would an anti-corruption layer be necessary vs. simply calling another service's API directly?",
    ],
    resources: [
      "Domain-Driven Design (Eric Evans)",
      "Implementing Domain-Driven Design (Vaughn Vernon)",
      "Clean Architecture (Robert C. Martin)",
      "Domain-Driven Design Distilled (Vaughn Vernon)",
      "Hexagonal Architecture article (Alistair Cockburn)",
    ],
  }),

  lesson({
    id: "infra-containers-k8s",
    title: "Docker, Kubernetes & Service Mesh",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    durationMinutes: 42,
    summary:
      "Containers standardize how applications are packaged and run. Kubernetes orchestrates containers at scale across clusters of machines. Service meshes add a dedicated infrastructure layer for service-to-service communication, security, and observability. This lesson walks through each layer — from Dockerfile best practices to Kubernetes primitives to Istio/Linkerd — and when each is worth the operational investment.",
    sections: [
      {
        title: "Docker: Images, Containers, and the Build Pipeline",
        paragraphs: [
          "A Docker image is a layered, immutable filesystem snapshot containing your application, runtime, and dependencies. A container is a running instance of an image — isolated via Linux namespaces and cgroups, sharing the host kernel but with its own process tree, network stack, and filesystem view.",
          "Images are built from Dockerfiles. Best practices: use multi-stage builds (compile in one stage, copy only the binary to a minimal runtime image), pin base image versions, run as a non-root user, minimize layer count, and use .dockerignore to exclude unnecessary files. A Go binary in a distroless image might be 15 MB; the same app in a full Ubuntu image could be 500 MB.",
          "Container registries (Docker Hub, ECR, GCR, Harbor) store and distribute images. Tag images with git SHA or semver, not just 'latest'. Scan images for CVEs in CI before deployment. Immutable tags ensure that what you tested is exactly what runs in production.",
        ],
        bullets: [
          "Image layers: each Dockerfile instruction creates a cached layer — order matters for build speed",
          "Multi-stage builds: separate build environment from runtime for smaller, more secure images",
          "Container vs. VM: containers share the kernel (lighter, faster start); VMs have full OS isolation",
          "docker-compose: local multi-container development; not for production orchestration",
        ],
      },
      {
        title: "Kubernetes Core Concepts: Pods, Deployments, and Services",
        paragraphs: [
          "Kubernetes (K8s) orchestrates containers across a cluster of nodes. The pod is the smallest deployable unit — one or more containers sharing network and storage. You rarely create pods directly; instead, you declare desired state via higher-level objects and K8s reconciles reality to match.",
          "A Deployment manages ReplicaSets that maintain a desired number of pod replicas. Rolling updates replace pods incrementally (maxUnavailable, maxSurge control the pace). Rollbacks are one command away. StatefulSets handle stateful workloads (databases) with stable network identities and persistent volumes.",
          "Services provide stable network endpoints for pods. ClusterIP (internal only), NodePort (exposes on each node's IP), LoadBalancer (cloud provider external IP). Ingress controllers (Nginx, Traefik, AWS ALB) route HTTP traffic to services based on host and path rules, terminating TLS at the edge.",
        ],
        bullets: [
          "Pod: one or more containers sharing network namespace and volumes",
          "Deployment: declarative rolling updates with desired replica count",
          "Service: stable DNS name and load balancing across pod replicas",
          "Ingress: HTTP/HTTPS routing rules to services with TLS termination",
          "ConfigMap / Secret: inject configuration and sensitive data into pods",
          "Namespace: logical cluster partition for environments or teams",
        ],
      },
      {
        title: "Scaling, Scheduling, and Resource Management",
        paragraphs: [
          "The Horizontal Pod Autoscaler (HPA) scales pod replicas based on CPU, memory, or custom metrics (requests per second from Prometheus). Vertical Pod Autoscaler adjusts resource requests/limits. Cluster Autoscaler adds or removes nodes when pods can't be scheduled.",
          "Every pod declares resource requests (guaranteed minimum) and limits (maximum allowed). Without requests, the scheduler can't pack pods efficiently. Without limits, one runaway container can starve others on the same node. Set requests based on measured p95 usage; set limits at 2–3× requests.",
          "Probes keep services healthy: liveness probes restart crashed containers, readiness probes remove unready pods from service load balancing, startup probes protect slow-starting apps from premature liveness kills. Always define probes — K8s defaults to 'always healthy' if you don't.",
        ],
        bullets: [
          "HPA: scale replicas on metrics — target 70% CPU utilization is a common starting point",
          "Resource requests/limits: requests for scheduling, limits for enforcement (OOM kill)",
          "Liveness probe: 'is the process alive?' — failure triggers restart",
          "Readiness probe: 'can it handle traffic?' — failure removes from service endpoints",
          "PodDisruptionBudget: minimum available pods during voluntary disruptions (node drain, upgrades)",
        ],
      },
      {
        title: "Service Mesh: Istio, Linkerd, and the Data Plane",
        paragraphs: [
          "As microservice count grows, cross-cutting concerns — mTLS, retries, circuit breaking, traffic splitting, distributed tracing — become painful to implement in every service. A service mesh extracts these into a dedicated infrastructure layer: a sidecar proxy (Envoy in Istio, Linkerd's micro-proxy) injected alongside each pod handles all inter-service traffic.",
          "The control plane (Istiod, Linkerd control plane) configures proxies centrally. The data plane (sidecar proxies) executes policies without application code changes. Enable mTLS between all services with a single policy. Route 5% of traffic to a canary version via VirtualService rules. Inject trace headers automatically.",
          "Service meshes add latency (typically 1–3ms per hop) and operational complexity. They're justified at 20+ services with strict security requirements, frequent canary deployments, or multi-cluster setups. For smaller deployments, Kubernetes Services plus a well-configured ingress may suffice.",
        ],
        bullets: [
          "Sidecar proxy: intercepts all inbound and outbound pod traffic",
          "mTLS: mutual TLS authentication and encryption between every service pair",
          "Traffic management: weighted routing, fault injection, circuit breaking via config",
          "Observability: automatic metrics, access logs, and trace propagation",
          "Istio: feature-rich, Envoy-based — higher resource overhead",
          "Linkerd: lightweight Rust micro-proxy — lower latency, simpler ops",
        ],
      },
      {
        title: "Infrastructure as Code and GitOps",
        paragraphs: [
          "Manual kubectl apply doesn't scale across environments and teams. Infrastructure as Code (IaC) tools — Terraform for cloud resources, Pulumi for general-purpose IaC — declare desired infrastructure in version-controlled files. Every change is reviewed, tested, and auditable.",
          "For Kubernetes specifically, GitOps (ArgoCD, Flux) treats Git as the single source of truth. You commit K8s manifests (or Helm charts, Kustomize overlays) to a repo; the GitOps controller continuously reconciles the cluster to match. Drift is detected and auto-corrected. Rollbacks are git revert.",
          "Helm packages K8s resources into reusable charts with templated values. Kustomize overlays let you patch base manifests for dev/staging/prod without duplication. Choose based on team preference — both are production-proven.",
        ],
        bullets: [
          "Terraform: declarative cloud infrastructure (VPCs, clusters, databases, IAM)",
          "GitOps: Git repo drives cluster state — ArgoCD/Flux auto-sync on commit",
          "Helm charts: parameterized, versioned K8s application packages",
          "Kustomize: overlay-based manifest customization without templating",
        ],
      },
    ],
    concepts: [
      "Docker image: layered, immutable application package built from a Dockerfile",
      "Container: running instance of an image with isolated process, network, and filesystem",
      "Kubernetes pod: smallest deployable unit — one or more co-located containers",
      "Deployment: manages rolling updates and replica count for stateless applications",
      "Service: stable network endpoint with load balancing across pod replicas",
      "Ingress: HTTP routing and TLS termination at the cluster edge",
      "HPA: Horizontal Pod Autoscaler — scales replicas based on resource or custom metrics",
      "Service mesh: infrastructure layer for inter-service security, routing, and observability",
      "Sidecar proxy: injected container that handles all pod network traffic (Envoy, Linkerd)",
      "GitOps: continuous deployment driven by Git repository as the source of truth",
    ],
    practices: [
      "Use multi-stage Docker builds with minimal base images (distroless, alpine)",
      "Pin image tags to git SHA — never deploy untagged 'latest' to production",
      "Declare resource requests and limits on every pod; base requests on measured usage",
      "Configure liveness, readiness, and startup probes for every service",
      "Use namespaces to isolate environments (dev, staging, prod) or teams",
      "Store K8s manifests in Git and deploy via GitOps for auditable, reversible changes",
      "Adopt a service mesh when you have 20+ services or strict mTLS requirements — not before",
    ],
    pitfalls: [
      "Running containers as root — a container escape compromises the host node",
      "No resource limits: one memory-leaking pod OOM-kills neighbors on the same node",
      "Missing health probes: K8s routes traffic to pods that aren't ready to serve",
      "Using docker-compose patterns in production instead of proper orchestration",
      "Adopting a service mesh too early — operational overhead outweighs benefits for small deployments",
      "Storing secrets in ConfigMaps or plain Git — use Sealed Secrets, Vault, or cloud secret managers",
    ],
    examples: [
      {
        title: "Spotify's Kubernetes Migration",
        description:
          "Spotify migrated from bare-metal services to Kubernetes over several years, running thousands of microservices on K8s clusters. They built internal tooling (Titus) on top of K8s for developer experience, demonstrating that raw Kubernetes requires platform engineering investment to be productive at scale.",
      },
      {
        title: "Lyft's Envoy and Istio",
        description:
          "Lyft created Envoy as a high-performance sidecar proxy and contributed it to the CNCF. They use Istio service mesh for mTLS, traffic shifting during deployments, and observability across hundreds of microservices — validating the service mesh pattern at large scale.",
      },
      {
        title: "GitOps at Weaveworks",
        description:
          "Weaveworks pioneered GitOps with Flux: all cluster configuration lives in Git, changes are pull-request reviewed, and Flux automatically syncs approved commits to production. Rollbacks are instant git reverts — no manual kubectl required.",
      },
    ],
    keyTakeaways: [
      "Containers package applications consistently; Kubernetes orchestrates them at scale",
      "Declare desired state in YAML — K8s reconciles reality continuously",
      "Deployments, Services, and Ingress are the minimum K8s primitives every engineer should know",
      "Resource requests/limits and health probes are non-negotiable for production workloads",
      "Service meshes solve cross-cutting inter-service concerns but add complexity — adopt when justified",
      "GitOps and IaC make infrastructure changes auditable, repeatable, and reversible",
      "Invest in platform engineering — raw K8s is powerful but not developer-friendly out of the box",
    ],
    whyItMatters:
      "Kubernetes is the de facto standard for container orchestration in production. Whether you operate clusters directly or deploy to managed services (EKS, GKE, AKS), understanding pods, services, scaling, and deployment strategies is essential. Service mesh and GitOps knowledge distinguishes engineers who can design production-grade platforms from those who can only write application code.",
    reflectionQuestions: [
      "Walk through what happens when you kubectl apply a Deployment with 3 replicas — how does K8s achieve the desired state?",
      "Your service has p99 latency spikes during deployments. How would a service mesh help with canary releases?",
      "What would you put in a Dockerfile multi-stage build for a Node.js API vs. a Go microservice?",
      "When would managed container services (ECS Fargate, Cloud Run) be a better choice than self-managed Kubernetes?",
    ],
    resources: [
      "Kubernetes Documentation (kubernetes.io)",
      "Docker Deep Dive (Nigel Poulton)",
      "Kubernetes Up & Running (Kelsey Hightower)",
      "Istio documentation (istio.io)",
      "The GitOps Manifesto (gitops.tech)",
    ],
  }),

  lesson({
    id: "infra-cicd-observability",
    title: "CI/CD & Observability",
    moduleId: "infra-core",
    phaseId: "infrastructure",
    durationMinutes: 40,
    summary:
      "CI/CD automates the path from code commit to production deployment. Observability — metrics, logs, and traces — tells you what your system is actually doing under load. Together they form the feedback loop that makes reliable, fast-moving engineering teams possible. This lesson covers pipeline design, deployment strategies, the three pillars of observability, and SRE-inspired alerting practices.",
    sections: [
      {
        title: "Continuous Integration: Fast, Reliable Feedback",
        paragraphs: [
          "Continuous Integration (CI) means every code change triggers an automated pipeline that builds, tests, and validates the change before it merges. The goal is fast feedback: if a developer breaks the build, they know within minutes, not days.",
          "A well-designed CI pipeline runs in stages ordered by cost: lint and format check (seconds) → unit tests (seconds to minutes) → integration tests with test containers (minutes) → build artifact (minutes) → security scan (minutes). Fail fast — don't run expensive integration tests if unit tests already failed.",
          "Cache aggressively: dependency downloads (npm, Maven, Go modules), Docker layer caches, and test result caches cut pipeline time dramatically. Target under 10 minutes for CI on a typical change. Longer pipelines discourage small, frequent commits.",
        ],
        bullets: [
          "CI triggers: pull request opened/updated, merge to main, scheduled nightly builds",
          "Artifact registry: store built Docker images, JARs, or binaries with immutable tags",
          "Branch protection: require CI pass + code review before merge",
          "Flaky test quarantine: isolate unreliable tests rather than ignoring red builds",
        ],
      },
      {
        title: "Continuous Delivery and Deployment Strategies",
        paragraphs: [
          "Continuous Delivery (CD) extends CI: every merge to main produces a deployable artifact that passes all tests. Continuous Deployment goes further — every merge auto-deploys to production. Most teams use CD with manual approval for production; true continuous deployment suits high-test-coverage, low-blast-radius systems.",
          "Deployment strategies control risk. Rolling update replaces instances incrementally (K8s default). Blue-green deploys a parallel environment, switches traffic, and keeps the old version for instant rollback. Canary releases route a small percentage of traffic (1–5%) to the new version, monitor error rates and latency, then gradually increase.",
          "Feature flags decouple deployment from release: deploy code to production dark (flag off), then enable for internal users, then 1% of customers, then everyone. If something breaks, flip the flag off — no redeployment needed. This is the safest way to ship risky changes.",
        ],
        bullets: [
          "Rolling update: incremental replacement — simple but slow rollback",
          "Blue-green: instant traffic switch with immediate rollback capability",
          "Canary: gradual traffic shift with automated promotion or rollback on metric thresholds",
          "Feature flags: control feature visibility independently of deployment",
          "Database migrations: backward-compatible changes first, then code deploy, then cleanup",
        ],
      },
      {
        title: "Metrics: Measuring What Matters",
        paragraphs: [
          "Metrics are numeric measurements over time: request rate, error rate, latency, CPU usage, queue depth. They power dashboards, alerts, and autoscaling decisions. The RED method covers request-driven services: Rate (requests/sec), Errors (failed requests/sec), Duration (latency distribution). The USE method covers resources: Utilization, Saturation, Errors.",
          "Histograms and percentiles matter more than averages. Average latency of 50ms can hide the fact that 1% of requests take 5 seconds. Track p50, p95, and p99 latency. Alert on p99, not mean — users experience tail latency, not averages.",
          "Prometheus is the dominant open-source metrics system: pull-based scraping, PromQL query language, Grafana for visualization. OpenTelemetry provides vendor-neutral instrumentation that exports to Prometheus, Datadog, or CloudWatch. Define SLIs (Service Level Indicators) from metrics and set SLOs (Service Level Objectives) with error budgets.",
        ],
        bullets: [
          "RED: Rate, Errors, Duration — for request/response services",
          "USE: Utilization, Saturation, Errors — for CPU, memory, disk, network",
          "SLI: quantified measure of service reliability (e.g., '99.9% of requests succeed')",
          "SLO: target for an SLI (e.g., '99.9% availability over 30 days')",
          "Error budget: allowed unreliability before pausing feature work for reliability",
        ],
      },
      {
        title: "Logs and Distributed Tracing",
        paragraphs: [
          "Structured logging replaces free-text log lines with JSON objects containing consistent fields: timestamp, level, service, traceId, spanId, message, and contextual key-value pairs. Structured logs are searchable, filterable, and correlatable across services.",
          "Correlation IDs (trace IDs) link logs across services. When a request enters your system, generate or propagate a trace ID. Every log line, metric, and span includes it. When debugging a failed request, search by trace ID to see the complete journey across 15 microservices.",
          "Distributed tracing (Jaeger, Zipkin, Tempo via OpenTelemetry) records the path of a request through every service it touches. Each service creates spans (timed operations) nested under the trace. Traces reveal which service added 800ms of latency, where errors originated, and whether retries caused duplicate work.",
        ],
        bullets: [
          "Structured logging: JSON with consistent fields — never printf-style free text in production",
          "Correlation/trace ID: propagated through every service call and log line",
          "Span: a single timed operation within a trace (HTTP call, DB query, cache lookup)",
          "OpenTelemetry: vendor-neutral SDK for metrics, logs, and traces",
          "Log aggregation: ELK stack (Elasticsearch, Logstash, Kibana), Loki, or cloud-native (CloudWatch, Datadog)",
        ],
      },
      {
        title: "Alerting, On-Call, and the Observability Culture",
        paragraphs: [
          "Alert on symptoms, not causes. 'Error rate > 1% for 5 minutes' is actionable. 'CPU > 80%' is not — high CPU might be fine during a traffic spike. Every alert should require human action; if it doesn't, it's a dashboard metric, not an alert.",
          "Reduce alert fatigue: aggregate related alerts, use escalation policies, and review alert effectiveness monthly. If an alert fires and nobody acts on it, delete or downgrade it. On-call engineers should trust that every page is a real problem.",
          "Observability is a culture, not a tool. Instrument code during development, not as an afterthought. Run game days (chaos engineering) to validate that your metrics, logs, and traces actually help you diagnose injected failures. Post-incident reviews (blameless postmortems) feed improvements back into monitoring and architecture.",
        ],
        bullets: [
          "Symptom-based alerting: error rate, latency SLO breach, availability drop",
          "Runbooks: documented response steps linked from every alert",
          "Blameless postmortem: focus on systemic fixes, not individual fault",
          "Game days: inject failures (kill pods, add latency) to test observability and response",
          "Dashboard hierarchy: service overview → service detail → infrastructure detail",
        ],
      },
    ],
    concepts: [
      "CI pipeline: automated build, test, and validate on every code change",
      "CD: every merge produces a deployable artifact; deployment may be manual or automatic",
      "Canary deployment: route small traffic percentage to new version, monitor, then promote",
      "Feature flags: decouple code deployment from feature release visibility",
      "RED metrics: Rate, Errors, Duration for request-driven services",
      "USE metrics: Utilization, Saturation, Errors for infrastructure resources",
      "SLI/SLO: Service Level Indicator (measurement) and Objective (target threshold)",
      "Structured logging: machine-parseable JSON logs with consistent field names",
      "Distributed tracing: end-to-end request path visibility across services via spans",
      "OpenTelemetry: open standard for collecting metrics, logs, and traces",
    ],
    practices: [
      "Keep CI pipeline under 10 minutes; fail fast with cheap checks first",
      "Use canary or blue-green deployments for production — never big-bang deploy",
      "Deploy database migrations separately and make them backward-compatible",
      "Instrument the four golden signals: latency, traffic, errors, and saturation",
      "Use structured JSON logging with trace IDs in every service from day one",
      "Alert on user-facing symptoms (error rate, p99 latency) not infrastructure causes (CPU)",
      "Write a runbook for every alert; if you can't write one, the alert isn't actionable",
    ],
    pitfalls: [
      "No CI: manual testing and deployment leads to fear-driven release cycles",
      "Alert fatigue: too many non-actionable alerts cause on-call engineers to ignore real pages",
      "Logging PII or secrets: structured logs in aggregators become compliance liabilities",
      "Average latency monitoring: hides tail latency that ruins user experience for 1% of requests",
      "Observability as afterthought: retrofitting instrumentation after launch misses critical early data",
      "No rollback plan: deploying without tested rollback is gambling, not engineering",
    ],
    examples: [
      {
        title: "Google's SRE and Error Budgets",
        description:
          "Google's Site Reliability Engineering team defines SLOs with error budgets: if a service has 99.9% availability SLO, it gets 43 minutes of downtime per month. When the budget is exhausted, feature launches pause until reliability improves. This aligns product velocity with operational stability.",
      },
      {
        title: "Etsy's CI/CD and Feature Flags",
        description:
          "Etsy deploys to production dozens of times daily using continuous deployment with strong CI (thousands of tests), feature flags for gradual rollouts, and comprehensive observability. Their deployment pipeline includes automatic rollback when error rates exceed thresholds during canary phases.",
      },
      {
        title: "OpenTelemetry at Honeycomb",
        description:
          "Honeycomb pioneered observability-driven debugging using high-cardinality events (not just pre-aggregated metrics). OpenTelemetry instrumentation sends rich span data to their platform, enabling engineers to ask arbitrary questions about production behavior without pre-defining dashboards.",
      },
    ],
    keyTakeaways: [
      "CI provides fast feedback; CD ensures every merge is deployable",
      "Canary deployments and feature flags minimize the blast radius of bad releases",
      "Metrics (RED/USE), structured logs, and traces form the three pillars of observability",
      "Track p99 latency and error rates — averages hide the problems users actually feel",
      "Alert on symptoms that need human action; eliminate alerts that don't",
      "SLOs and error budgets balance feature velocity with reliability investment",
      "Observability must be built in from the start — retrofitting is expensive and incomplete",
    ],
    whyItMatters:
      "You cannot operate what you cannot see. CI/CD enables teams to ship quickly and safely; observability tells you whether what you shipped actually works. In system design, proposing a architecture without a deployment strategy or monitoring plan is incomplete — interviewers and production systems both demand this feedback loop.",
    reflectionQuestions: [
      "Design a CI pipeline for a microservice with unit tests, integration tests, and Docker build. What runs in which order and why?",
      "Your canary deployment shows 0.5% error rate (baseline is 0.1%). Walk through your decision: promote, hold, or rollback?",
      "What SLIs and SLOs would you define for a payment processing API?",
      "A user reports a slow checkout experience. How do trace IDs and structured logs help you diagnose which service is responsible?",
    ],
    resources: [
      "Site Reliability Engineering (Google SRE Book)",
      "The DevOps Handbook (Gene Kim et al.)",
      "Observability Engineering (Charity Majors et al.)",
      "OpenTelemetry documentation (opentelemetry.io)",
      "Continuous Delivery (Jez Humble & David Farley)",
    ],
  }),
];
