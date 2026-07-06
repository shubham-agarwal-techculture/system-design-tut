# System Design Journey

A structured web app for learning system design from first principles — built for learners who want to progress daily, whether they have 5 minutes or an hour.

## Features

- **8-phase curriculum** — Foundations → Fundamentals → Architecture → Infrastructure → Patterns → Internals → Design Challenges → Designer Mindset
- **Flexible study sessions** — Pick 5, 15, 30, or 60 minutes; get a personalized plan from your current progress
- **Progress tracking** — Lesson completion, streaks, time invested (stored locally in your browser)
- **Design challenges** — Beginner to expert system design problems with hints and checklists
- **Reflection notes** — Capture your thoughts on each lesson
- **Curated resources** — Books, engineering blogs, and open-source systems to study

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Curriculum overview

| Phase | Focus |
|-------|-------|
| 1. Foundations | Networking, OS, Databases |
| 2. Fundamentals | Scalability, Storage, Caching, Messaging, Distributed Systems, APIs, Reliability, Security |
| 3. Architecture | Monolith → Microservices, Clean Architecture, DDD |
| 4. Infrastructure | Docker, Kubernetes, CI/CD, Observability |
| 5. Design Patterns | Repository, Strategy, Observer, and more |
| 6. Internal Designs | Redis, PostgreSQL, Kafka, Nginx internals |
| 7. Design Systems | Hands-on challenges (URL shortener → distributed filesystem) |
| 8. Designer Mindset | Requirements, capacity estimation, trade-offs, iteration loop |

## Tech stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- React Router 7
- LocalStorage for progress persistence
