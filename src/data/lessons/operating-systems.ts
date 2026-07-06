import { lesson } from "./helpers";

export const operatingSystemsLessons = [
  lesson({
    id: "os-processes-threads",
    moduleId: "operating-systems",
    phaseId: "foundations",
    title: "Processes & Threads",
    durationMinutes: 40,
    summary:
      "Processes are isolated execution units with their own virtual address space, file descriptors, and security context. Threads share a process's memory and resources, enabling parallelism within a single program — but introducing race conditions that every backend engineer must understand.",
    sections: [
      {
        title: "What Is a Process?",
        paragraphs: [
          "When you run a program — a web server, database, or Python script — the operating system creates a process to represent that running instance. A process is not the source code on disk; it is a live execution context with its own virtual memory space, open files, network sockets, signal handlers, and a unique process ID (PID).",
          "The OS kernel mediates every interaction between a process and hardware. When your code reads a file or allocates memory, it makes a system call — a controlled transition from user mode (restricted) to kernel mode (privileged). This boundary is what prevents one buggy application from corrupting another's memory or crashing the entire machine.",
          "Processes are created through fork() (copy-on-write clone of the parent) followed often by exec() (replace the image with a new program) on Unix-like systems, or CreateProcess on Windows. Parent and child processes are independent: killing the parent does not automatically kill children unless you configure process groups or use init/systemd as a reaper.",
          "From a system design perspective, every container, microservice instance, and worker process you deploy maps to one or more OS processes. Understanding this mapping helps you reason about memory limits, file descriptor exhaustion, and why 'one process per connection' architectures break at scale.",
        ],
        bullets: [
          "Process = program in execution with isolated address space",
          "PID, PPID (parent), UID/GID control identity and permissions",
          "Zombie processes: exited but not yet reaped by parent via wait()",
          "Orphan processes: reparented to init when parent dies first",
        ],
      },
      {
        title: "Threads: Shared Memory, Shared Risk",
        paragraphs: [
          "A thread is a lightweight unit of execution within a process. All threads in a process share the same heap, global variables, and open file descriptors — but each thread has its own stack (local variables, call frames) and program counter. This sharing makes inter-thread communication fast (just read/write shared memory) but dangerous without synchronization.",
          "The OS scheduler treats threads as schedulable entities. On Linux, threads are implemented as tasks sharing the same mm_struct (memory descriptor) — what pthreads expose to application code. Context switching between threads in the same process is cheaper than switching between processes because the MMU page tables stay mapped.",
          "Modern runtimes add another layer. Go goroutines, Java virtual threads (Project Loom), and Node.js async/await multiplex thousands of logical tasks onto a smaller pool of OS threads. The runtime handles scheduling, stack growth, and I/O polling — but underneath, OS threads still do the actual work and contend for CPU cores.",
          "When designing concurrent systems, ask: what is shared mutable state, and who can access it? Race conditions occur when two threads read-modify-write the same memory without coordination, producing results that depend on interleaving — a class of bugs that are notoriously hard to reproduce and fix.",
        ],
        bullets: [
          "User-space threading (N:1) vs kernel threading (1:1) vs hybrid (M:N)",
          "Thread pool: fixed workers pull tasks from a queue — bounds resource usage",
          "Work stealing: idle threads steal tasks from busy peers (ForkJoin, Go scheduler)",
          "Thread-local storage (TLS): per-thread copies of global-like variables",
        ],
      },
      {
        title: "Context Switching and CPU Cost",
        paragraphs: [
          "The CPU can execute only one thread at a time per core (ignoring SMT/hyper-threading nuances). When the OS scheduler preempts a running thread — because its time slice expired, a higher-priority thread became ready, or it blocked on I/O — it performs a context switch: save registers, switch page tables if needed, restore the next thread's state, and resume execution.",
          "Context switches are not free. Each switch flushes CPU caches and branch predictors to some degree, causing a 'cold start' penalty for the incoming thread. A system with thousands of runnable threads and few cores spends significant time switching rather than doing useful work. This is why blindly spawning one thread per request is a classic anti-pattern.",
          "Blocking syscalls are the other major cost. When a thread calls read() on a socket with no data available, the kernel puts it to sleep and schedules another thread. If you have 10,000 blocked threads, you pay memory for 10,000 stacks (typically 1–8 MB each on Linux unless overridden) plus scheduler overhead — even though most are idle.",
          "High-performance servers therefore minimize blocking threads and context switches. Event-driven architectures (discussed in the I/O lesson) handle many connections with few threads. CPU-bound workloads use a thread pool sized to the number of cores (or cores minus one) to maximize cache locality and minimize preemption.",
        ],
      },
      {
        title: "Concurrency Models in Production",
        paragraphs: [
          "Different languages and frameworks make different trade-offs. Java and C++ traditionally use thread pools for server workloads — e.g., Tomcat's connector thread pool serving HTTP requests. Oversizing the pool causes contention; undersizing causes queueing latency under load.",
          "Go's model is deceptively simple: go func() launches a goroutine, and the runtime multiplexes them onto GOMAXPROCS OS threads. Blocking syscalls may spawn additional threads automatically. This makes it easy to write concurrent code, but shared maps still need mutexes or sync.Map, and goroutine leaks (blocked forever) can exhaust memory.",
          "Node.js and Python asyncio use a single-threaded event loop for application code, delegating CPU-heavy or blocking work to thread/process pools. This eliminates data races in application logic but creates a different bottleneck: one slow synchronous operation blocks the entire loop.",
          "Process-based isolation (multiple worker processes behind a load balancer, as in Gunicorn, uWSGI, or Erlang/OTP) trades memory for fault isolation. One worker crash does not take down siblings. This pattern appears everywhere from Nginx master/worker model to Chrome's multi-process architecture.",
        ],
        bullets: [
          "Prefork: master creates N workers at startup, each handles requests independently",
          "Fork-after-bind: workers inherit a listening socket and accept() concurrently",
          "C10K problem: serving 10,000 concurrent clients required rethinking thread-per-connection",
        ],
      },
      {
        title: "Processes, Containers, and cgroups",
        paragraphs: [
          "Linux containers are processes with extra isolation. Docker and Kubernetes do not run 'mini VMs' — they run ordinary processes constrained by namespaces (PID, network, mount, UTS, IPC, user) and cgroups (CPU, memory, I/O limits). A container is a process tree with a restricted view of the host.",
          "When you set memory limits in Kubernetes (resources.limits.memory), the kernel's OOM killer terminates processes in the cgroup that exceed the limit. Understanding that your JVM, Node, or Go service is one or more OS processes inside a cgroup explains OOMKilled pods and why the host's view of memory differs from inside the container.",
          "Process signals (SIGTERM, SIGKILL, SIGHUP) are the OS's mechanism for lifecycle management. Kubernetes sends SIGTERM on pod deletion, waits terminationGracePeriodSeconds, then SIGKILL. Applications must handle SIGTERM to drain connections and flush state — a system design requirement, not just an ops detail.",
          "For interviews and architecture reviews, being able to trace from 'my API service' down to 'N worker processes × M threads × cgroup limits' demonstrates the kind of bottom-up reasoning that separates senior engineers from those who treat the runtime as a black box.",
        ],
      },
    ],
    concepts: [
      "Process: isolated address space, file descriptors, PID, security context",
      "Thread: shared heap and FDs, private stack, schedulable by the OS",
      "System call: controlled transition to kernel mode for I/O, memory, scheduling",
      "Context switch: CPU state save/restore when changing runnable threads",
      "Race condition: outcome depends on thread interleaving without synchronization",
      "Thread pool: bounded workers processing a shared task queue",
      "Copy-on-write fork: parent and child share pages until one writes",
      "Goroutines / async-await: user-space concurrency atop fewer OS threads",
      "cgroups and namespaces: how Linux containers limit and isolate processes",
      "Zombie and orphan processes: lifecycle edge cases in Unix process management",
    ],
    practices: [
      "Size thread pools based on workload type: ~num cores for CPU-bound, higher (but bounded) for I/O-bound with blocking calls",
      "Minimize shared mutable state; prefer message passing (channels, queues) over shared memory when possible",
      "Always set container memory and CPU limits — unbounded processes can take down the node",
      "Handle SIGTERM gracefully: stop accepting new work, drain in-flight requests, then exit",
      "Use process-level isolation (multiple workers) for fault tolerance in stateless services",
      "Profile context switch rates and runnable thread counts under load before scaling thread pools",
      "Document which resources are shared across threads (connection pools, caches) and how they are synchronized",
    ],
    pitfalls: [
      "Creating unbounded threads (one per request) — leads to memory exhaustion and scheduler thrashing",
      "Assuming goroutines or async code are race-free — shared state still needs locks or immutability",
      "Ignoring zombie processes in long-running daemons that fork but never call wait()",
      "Setting thread pool size to 500 'just to be safe' — oversubscription hurts CPU-bound workloads",
      "Forgetting that fork + multithreaded programs is dangerous (only async-signal-safe functions allowed in child)",
      "Treating containers as VMs — they share the kernel; a kernel panic or CVE affects all tenants",
    ],
    examples: [
      {
        title: "Nginx master/worker model",
        description:
          "Nginx runs one master process (reads config, manages workers) and several worker processes, each single-threaded with an event loop. Workers accept connections independently via SO_REUSEPORT or inherited socket. A crash in one worker does not kill others. This process-based design is why Nginx scales to hundreds of thousands of connections without thread-per-connection overhead.",
      },
      {
        title: "Java thread pool in a servlet container",
        description:
          "Tomcat's connector maintains a bounded thread pool (default 200). Each HTTP request borrows a thread for its duration. Under spike load, excess requests queue; if the queue fills, connections are rejected. Tuning maxThreads, acceptCount, and connectionTimeout is a direct application of process/thread resource management — and a common production incident source when defaults are left unchanged.",
      },
      {
        title: "Kubernetes pod OOMKill",
        description:
          "A Java service with a 512 MB container limit but -Xmx1024m exceeds its cgroup memory. The Linux OOM killer sends SIGKILL to the offending process. The pod restarts in a CrashLoopBackOff. Understanding that the JVM is an OS process inside a cgroup — and that heap is only part of memory usage — prevents this class of misconfiguration.",
      },
    ],
    keyTakeaways: [
      "Processes provide isolation; threads provide parallelism within a process at the cost of shared-state complexity",
      "Context switches and thread stacks have real cost — unbounded threading does not scale",
      "Modern runtimes (Go, async Node, Loom) multiplex many logical tasks onto fewer OS threads",
      "Containers are isolated process trees with resource limits, not lightweight VMs",
      "Production architecture choices (prefork, thread pool, event loop) map directly to OS process/thread models",
      "Graceful shutdown via signal handling is a system design requirement for zero-downtime deploys",
      "Always ask: what is shared, what is mutable, and what synchronizes access?",
    ],
    whyItMatters:
      "Every scalable backend you design — connection pools, worker counts, container limits, graceful shutdown — sits on top of OS processes and threads. Interviewers ask about 'how would you handle 100K concurrent connections' because the answer depends on whether you use processes, threads, or event loops, and how much each costs in memory and context switches. Production incidents from thread exhaustion, OOM kills, and race conditions trace directly to this layer.",
    reflectionQuestions: [
      "Your API server uses 200 threads and CPU is only 30% utilized, but p99 latency spikes under load. What might be happening, and how would processes vs event loops change your approach?",
      "Why would you choose multiple worker processes over multiple threads for a stateless HTTP service behind a load balancer?",
      "A goroutine leak causes memory to grow unbounded over days. How would you detect and debug it using OS-level tools?",
      "Design the concurrency model for a service that handles 50K long-lived WebSocket connections. How many OS threads would you expect?",
    ],
    resources: [
      "Operating Systems: Three Easy Pieces — Processes (Arpaci-Dusseau)",
      "The Linux Programming Interface — Chapters on processes and threads (Michael Kerrisk)",
      "Go blog: 'Concurrency is not Parallelism' — Rob Pike",
      "C10K problem — Dan Kegel (kegel.com/c10k.html)",
    ],
  }),

  lesson({
    id: "os-scheduling-memory",
    moduleId: "operating-systems",
    phaseId: "foundations",
    title: "Scheduling & Virtual Memory",
    durationMinutes: 42,
    summary:
      "The OS scheduler decides which process runs on each CPU core and for how long. Virtual memory gives every process the illusion of a large, private address space while the kernel maps virtual pages to physical RAM — or to disk when memory is scarce. Together, scheduling and memory management explain latency spikes, OOM kills, and why databases hate swapping.",
    sections: [
      {
        title: "How the CPU Scheduler Works",
        paragraphs: [
          "On a multicore machine, multiple processes and threads compete for CPU time. The scheduler's job is to pick the next runnable task for each core, balancing responsiveness (interactive apps feel snappy), throughput (batch jobs finish quickly), and fairness (no task starves indefinitely).",
          "Modern Linux uses CFS (Completely Fair Scheduler) for most tasks. CFS models an ideal processor that divides CPU equally among runnable tasks and tracks virtual runtime (vruntime) — how long each task has actually run. The task with the lowest vruntime runs next. Nice values (-20 to 19) bias share without strict priority inversion.",
          "Real-time schedulers (SCHED_FIFO, SCHED_RR) exist for latency-critical workloads — audio processing, industrial control — but misuse can starve normal processes. Kubernetes CPU requests and limits translate loosely to CFS shares and throttling via cgroup cpu.cfs_quota_us.",
          "Preemption means the kernel can interrupt a running task before it voluntarily yields — on timer tick, or when a higher-priority task becomes runnable. Cooperative multitasking (early Windows, green threads without preemption) fails when one task loops forever; preemptive scheduling is why runaway code can still be killed.",
        ],
        bullets: [
          "Runnable state: ready to run, sitting in the run queue",
          "Blocked/waiting: sleeping until I/O, lock, or timer completes",
          "Time slice: maximum continuous CPU before preemption (typically 4–100 ms range)",
          "Load average: exponentially decaying average of runnable + uninterruptible tasks",
        ],
      },
      {
        title: "Scheduling Policies and Latency",
        paragraphs: [
          "Different workloads need different scheduling behavior. Batch analytics wants maximum throughput — keep the CPU busy, minimize context switches. Interactive web services want low tail latency — a request should not wait behind a long-running background job.",
          "Priority inversion occurs when a low-priority task holds a lock a high-priority task needs, while a medium-priority task preempts the low one — delaying everyone. Priority inheritance mutexes (Linux PI-futex) temporarily boost the lock holder's priority to fix this; it matters in real-time and embedded systems.",
          "CPU affinity (pinning a process to specific cores) improves cache warmth — data stays in L1/L2 cache longer. NUMA (Non-Uniform Memory Access) adds another dimension: memory attached to a distant socket is slower, so schedulers try to run tasks on the node where their memory was allocated.",
          "For system design, scheduling appears as CPU throttling in containers (your pod gets 500m = 50% of one core), noisy neighbor problems in multi-tenant clouds, and why colocating latency-sensitive and batch workloads on the same nodes requires isolation (separate node pools, dedicated cores, or QoS classes in Kubernetes).",
        ],
      },
      {
        title: "Virtual Memory Fundamentals",
        paragraphs: [
          "Physical RAM is finite and fragmented. Virtual memory decouples the address space a program sees from physical frames in RAM. Each process has its own virtual address space (typically 48–64 bits on modern 64-bit systems, though only a portion is usable). The MMU (Memory Management Unit) translates virtual addresses to physical on every memory access via page tables.",
          "Memory is divided into fixed-size pages (usually 4 KB on x86; 2 MB and 1 GB huge pages exist for TLB efficiency). The page table is a multi-level tree — on x86-64, four levels — storing mappings from virtual page number to physical frame number, plus permission bits (read, write, execute, user/supervisor).",
          "When a process accesses a virtual address with no valid mapping, the CPU traps to the kernel. A soft page fault loads the page from disk (or allocates a zero page for first touch). A hard fault on a hot path destroys performance. TLB (Translation Lookaside Buffer) caches recent translations; TLB misses add latency.",
          "Virtual memory also enables security: processes cannot read each other's memory because page tables enforce boundaries. The kernel maps the same physical pages into multiple address spaces for shared memory (IPC) or copy-on-write after fork.",
        ],
        bullets: [
          "Page fault: trap when virtual page is not in physical RAM",
          "Demand paging: pages loaded only when first accessed",
          "Huge pages: reduce TLB pressure for large contiguous allocations (DB buffer pools)",
          "ASLR: randomize base addresses to make exploits harder",
        ],
      },
      {
        title: "Paging, Swapping, and Memory Pressure",
        paragraphs: [
          "When physical memory fills, the kernel must reclaim pages. The page replacement algorithm (approximated LRU with active/inactive lists in Linux) chooses victims to evict. Clean pages (unchanged since load, e.g., code segments) can be dropped and re-read from disk. Dirty pages must be written to backing store first.",
          "Swap space (partition or file on disk) extends effective memory. When a process has not touched a page recently, the kernel may swap it out — freeing the physical frame for someone else. If the process accesses it again, a major page fault reads it back from swap — orders of magnitude slower than RAM.",
          "Swapping is catastrophic for databases and latency-sensitive services. A single random disk read takes milliseconds; RAM access takes nanoseconds. PostgreSQL, Redis, and JVM heaps assume data stays resident. If your database swaps, p99 latency explodes and throughput collapses — often misdiagnosed as 'need more indexes' when the fix is more RAM or fewer competing processes.",
          "The OOM (Out-Of-Memory) killer is Linux's last resort when reclaim fails. It scores processes by memory usage, child processes, oom_score_adj, and kills the chosen victim with SIGKILL. In containers, the cgroup OOM killer fires first — terminating the container process that exceeded its limit.",
        ],
      },
      {
        title: "Memory from Application to Hardware",
        paragraphs: [
          "Application-level memory management interacts with virtual memory in subtle ways. malloc/new request virtual address space; physical pages are often committed on first write (lazy allocation). Freeing memory returns virtual pages to the allocator but may not immediately return physical frames to the OS — glibc malloc hoards arenas; Go returns memory slowly to the OS.",
          "Memory-mapped files (mmap) map disk files directly into the address space. Reads become page faults loading data from disk; the kernel's page cache serves hot regions from RAM. Databases and search engines use mmap for index files; the OS handles caching, but you lose explicit control over eviction.",
          "Garbage collectors create memory pressure patterns: allocation bursts, periodic STW (stop-the-world) pauses for marking, and heap growth. JVM -Xmx, Go GOGC, and .NET GC settings determine how much virtual memory the runtime holds. Container limits must account for heap + stack + metaspace + native memory + page cache share.",
          "When sizing infrastructure, work backwards: estimate working set size (data actively touched), add headroom for spikes and OS page cache, set container limits above working set but below node capacity, and monitor major page faults and swap usage as leading indicators of trouble.",
        ],
      },
    ],
    concepts: [
      "Preemptive scheduling: OS interrupts tasks via timer and priority",
      "CFS (Completely Fair Scheduler): Linux default, vruntime-based fairness",
      "Nice value and cgroup CPU quota: influence CPU share in containers",
      "Virtual address space vs physical RAM: MMU translation via page tables",
      "Page fault: soft (demand alloc) vs major (disk I/O required)",
      "TLB: cache for virtual-to-physical translations",
      "Swap: evict cold pages to disk, major fault on re-access",
      "OOM killer: reclaims memory by terminating processes",
      "Copy-on-write: fork shares pages until write",
      "Working set: pages actively used — keep this in RAM for performance",
    ],
    practices: [
      "Monitor major page faults and swap usage — non-zero swap on a database node is a red flag",
      "Set Kubernetes memory requests to expected working set; limits high enough to avoid OOM during spikes but low enough to prevent node exhaustion",
      "Use huge pages for large, long-lived allocations (database buffer pools) to reduce TLB misses",
      "Separate latency-sensitive and batch workloads onto different nodes or QoS tiers",
      "Profile GC and allocator behavior under load — virtual memory freed != physical memory returned",
      "Size RAM as working set + 20–30% headroom; never run memory-heavy services without limits",
      "Understand NUMA topology on bare metal — pin memory and CPU for HPC and large in-memory stores",
    ],
    pitfalls: [
      "Assuming free memory is wasted memory — Linux uses spare RAM for page cache, which speeds reads",
      "Setting JVM heap close to container limit without accounting for off-heap, threads, and metaspace",
      "Ignoring load average > core count sustained — indicates runnable queue backlog",
      "Running swap enabled on database or cache servers — masks memory pressure until catastrophic latency",
      "Overcommitting node memory (sum of pod limits >> node RAM) — guarantees OOM under pressure",
      "Confusing virtual size (VSZ) with resident set (RSS) when debugging memory leaks",
    ],
    examples: [
      {
        title: "PostgreSQL and shared_buffers",
        description:
          "PostgreSQL allocates shared_buffers (often 25% of RAM) as a buffer pool for page caching. The OS page cache holds additional copies of recently read data. If the machine swaps, both pools compete for scarce RAM and query latency spikes on buffer cache misses that become disk reads. Production tuning starts with ensuring shared_buffers + OS headroom fits in physical memory with swap disabled or minimized.",
      },
      {
        title: "Kubernetes CPU throttling",
        description:
          "A pod with cpu.limit=500m and a Java app doing GC or compilation bursts gets throttled by CFS quota — the process runs only half of each 100ms period. p99 latency rises even though average CPU looks low. The fix is raising limits, requesting guaranteed QoS, or using dedicated nodes — all scheduling and cgroup decisions, not application bugs.",
      },
      {
        title: "Major page fault in a cold start",
        description:
          "A serverless function or freshly restarted service maps a large binary and touches many code pages on first requests. Each cold page causes a soft fault loading from disk. Warm instances keep pages resident. This is why 'cold start latency' is a memory and paging phenomenon as much as initialization logic — and why provisioned concurrency or keeping instances warm helps.",
      },
    ],
    keyTakeaways: [
      "The scheduler balances fairness, throughput, and latency via preemptive time slicing",
      "Virtual memory isolates processes and enables demand paging, but page faults cost time",
      "Swapping moves cold pages to disk — fine for idle desktops, deadly for databases",
      "OOM killer and cgroup limits are safety valves when physical memory is exhausted",
      "Working set size drives RAM provisioning — measure RSS and page fault rates, not just heap settings",
      "Container CPU/memory limits are OS scheduling and cgroup mechanisms — understand them when tuning",
      "TLB and huge pages matter at scale for in-memory and database workloads",
    ],
    whyItMatters:
      "Capacity planning, container sizing, database tuning, and latency debugging all require understanding what happens when RAM runs out and how the CPU chooses what runs next. 'We need more CPUs' is often wrong — the runnable queue is empty but threads block on I/O. 'We need an index' is sometimes wrong — the working set exceeded RAM and the system swapped. Scheduling and virtual memory are the lens for these diagnoses.",
    reflectionQuestions: [
      "Your PostgreSQL node's swap usage is 2 GB and query p99 jumped 10×. Walk through what the kernel is doing and your remediation steps.",
      "A pod is OOMKilled repeatedly with a 1 GB limit. The app owner says 'the heap is only 512 MB.' What else consumes memory in a JVM or Node process?",
      "How would you isolate a batch ETL job from a payment API on the same Kubernetes cluster?",
      "Explain why load average of 8 on a 4-core machine indicates a problem even if CPU utilization shows 50%.",
    ],
    resources: [
      "Operating Systems: Three Easy Pieces — Scheduling and Memory (Arpaci-Dusseau)",
      "Linux Kernel Development — Scheduler and memory management chapters (Robert Love)",
      "Brendan Gregg: Linux performance observability tools (CPU, memory, page faults)",
      "Google SRE Book — Chapter on capacity planning",
    ],
  }),

  lesson({
    id: "os-io-sync",
    moduleId: "operating-systems",
    phaseId: "foundations",
    title: "I/O Models & Synchronization",
    durationMinutes: 38,
    summary:
      "I/O models determine how applications wait for network and disk operations — blocking threads, polling, or true async kernel interfaces. Synchronization primitives coordinate access to shared state across threads. Together they define how high-throughput systems like Redis, Kafka, and Nginx achieve performance without data corruption.",
    sections: [
      {
        title: "Blocking vs Non-Blocking I/O",
        paragraphs: [
          "When a thread calls read() on a TCP socket with no data available, the default behavior is blocking: the kernel puts the thread to sleep until data arrives. Simple to program, but one thread handles one connection — scaling to 10,000 connections means 10,000 threads and 10,000 stacks.",
          "Non-blocking I/O sets O_NONBLOCK on a file descriptor. read() returns immediately with EAGAIN/EWOULDBLOCK if no data is ready. The application must poll — loop over all sockets, try read/write on each, handle partial writes. This is the foundation of event-driven servers but pushes complexity into application code.",
          "The select(), poll(), and epoll() (Linux) / kqueue() (BSD/macOS) syscalls let the kernel notify which FDs are ready instead of scanning all of them. epoll_wait blocks until at least one registered socket has events — combining efficiency of blocking with scalability of non-blocking. Level-triggered vs edge-triggered modes affect how carefully you must drain buffers.",
          "io_uring (Linux 5.1+) is the modern evolution: submit I/O operations to shared ring buffers without syscalls per operation, poll completions asynchronously. It reduces syscall overhead for high-IOPS storage and network workloads — used in databases and proxies pushing millions of ops/sec.",
        ],
        bullets: [
          "Blocking I/O: thread sleeps, simple code, poor connection scalability",
          "Non-blocking + poll: scalable but O(n) scan without epoll/kqueue",
          "epoll/kqueue: O(1) readiness notification for many FDs",
          "io_uring: batch async I/O with reduced kernel transition cost",
        ],
      },
      {
        title: "The Reactor Pattern and Event Loops",
        paragraphs: [
          "The reactor pattern centralizes I/O demultiplexing: one thread (or a small pool) calls epoll_wait, gets a list of ready sockets, and dispatches handlers. Node.js libuv, Netty, Redis's ae event loop, and Nginx all follow this pattern. Application code registers callbacks; the loop invokes them when FDs become readable or writable.",
          "Proactor pattern (async I/O with IOCP on Windows, io_uring with IORING_OP_READ) goes further: the kernel performs the transfer and notifies on completion — the application does not loop on partial reads. Proactor maps naturally to async/await when the runtime integrates with the kernel.",
          "Single-threaded event loops eliminate locks in application logic — Redis processes commands sequentially in one thread, avoiding race conditions on its data structures. Throughput comes from batching, efficient data structures, and avoiding blocking syscalls. Any slow command (KEYS *, debug Lua script) blocks all clients.",
          "Scaling beyond one core requires sharding (Redis Cluster), multiple worker processes (Nginx), or careful partitioning of the event loop (Seastar framework, one loop per core with message passing between cores).",
        ],
      },
      {
        title: "Disk I/O and mmap",
        paragraphs: [
          "Disk I/O patterns differ from network I/O. Random reads on HDDs are slow (seek time); SSDs reduce but do not eliminate penalty. Sequential writes — append-only logs — achieve maximum throughput. This is why Kafka, WALs, and LSM-tree databases favor sequential I/O.",
          "Buffered I/O (read/write through libc) copies data user ↔ kernel ↔ page cache ↔ disk. Direct I/O (O_DIRECT) bypasses page cache for applications that manage their own caching (databases). mmap maps file pages into virtual memory — reads are page faults, writes go through page cache unless msync/msync.",
          "fsync() and fdatasync() force dirty pages to stable storage — the durability guarantee for databases. Every fsync is a potential latency spike because it waits for disk flush. Group commit batches multiple transactions into one fsync — a classic throughput vs latency trade-off in WAL design.",
          "When designing storage-heavy systems, ask: sequential or random? read-heavy or write-heavy? who owns the cache (app vs OS)? The answers drive choice of storage engine, filesystem (ext4 vs XFS), and whether to use direct I/O.",
        ],
      },
      {
        title: "Synchronization Primitives",
        paragraphs: [
          "When threads share mutable state, primitives coordinate access. Mutex (mutual exclusion lock): only one thread holds it; others block until release. Use for protecting invariants on shared data structures. Always pair lock with unlock on all paths — prefer RAII guards (std::lock_guard, defer in Go) to avoid leaks on panic/exception.",
          "Read-write lock (rwlock): multiple readers OR one writer. Good for read-heavy caches. Writer starvation is possible if readers continuously arrive. Condition variables pair with mutexes to wait for state changes (producer-consumer queues) — wait atomically releases lock and sleeps until signal.",
          "Semaphores count permits — useful for limiting concurrency (connection pool of N). Spinlocks busy-wait instead of sleeping — only appropriate for very short critical sections on multi-core where context switch cost exceeds spin time. Misused spinlocks waste CPU.",
          "Atomic operations (compare-and-swap, fetch-and-add) enable lock-free data structures for hot paths — lock-free queues, reference counting, hazard pointers. They trade complexity for avoiding mutex contention but require deep understanding of memory ordering (acquire, release, sequential consistency).",
        ],
        bullets: [
          "Mutex: exclusive access, blocks on contention",
          "Rwlock: concurrent reads, exclusive writes",
          "Condition variable: wait for predicate with atomic unlock/wait/signal",
          "Atomic CAS: foundation of lock-free algorithms",
        ],
      },
      {
        title: "Deadlocks, Livelocks, and Design Trade-offs",
        paragraphs: [
          "Deadlock requires four conditions (Coffman): mutual exclusion, hold-and-wait, no preemption, circular wait. Prevention: lock ordering (always acquire A before B), try-lock with backoff, or timeouts. Detection: track wait-for graphs in debuggers. Avoid nested locks when possible.",
          "Lock granularity matters. Coarse lock (one mutex for entire hash table) reduces complexity but serializes all operations. Fine-grained locks (per bucket) increase concurrency but risk deadlock if acquisition order varies. Lock-free structures avoid locks but are harder to verify.",
          "False sharing: two threads modify different variables on the same cache line — CPUs invalidate each other's caches, killing scalability. Padding structures to cache line boundaries (64 bytes) fixes this in hot counters.",
          "System design connection: Redis chose single-threaded to avoid synchronization entirely. PostgreSQL uses process-per-connection with shared buffer pool protected by locks and latches. Kafka partitions provide parallelism without shared mutable state per partition. The I/O and sync model follows from concurrency requirements.",
        ],
      },
    ],
    concepts: [
      "Blocking I/O: thread waits in kernel until data ready",
      "Non-blocking I/O: returns EAGAIN; app polls or uses event notification",
      "epoll/kqueue: scalable readiness notification for many file descriptors",
      "io_uring: Linux async I/O ring buffers for batch operations",
      "Reactor pattern: demultiplex I/O events to handlers in an event loop",
      "Mutex and rwlock: exclusive vs shared access to critical sections",
      "Condition variable: block until shared state meets a predicate",
      "Atomic operations and memory ordering: lock-free synchronization",
      "Deadlock: circular wait for locks — prevent via ordering or timeouts",
      "fsync/direct I/O/mmap: disk durability and caching trade-offs",
    ],
    practices: [
      "Use epoll/kqueue-based frameworks (Netty, libuv, async runtimes) for many concurrent connections",
      "Keep critical sections short — lock contention scales poorly",
      "Establish global lock ordering when multiple mutexes are needed",
      "Prefer immutability and message passing over shared mutable state",
      "Never block the event loop thread — offload CPU work to thread pools",
      "Use fsync strategically; batch commits where durability requirements allow",
      "Profile with lock contention tools (perf lock, Java thread dumps) before optimizing",
    ],
    pitfalls: [
      "Calling blocking I/O inside an event loop — stalls all connections",
      "Forgotten unlock on error paths — deadlock or resource leak",
      "Spinlock on single-core or long critical sections — wastes CPU",
      "Lock-free code without understanding memory ordering — subtle data races",
      "Edge-triggered epoll without draining buffers — missed events",
      "Assuming fsync on every write is free — destroys write throughput",
    ],
    examples: [
      {
        title: "Redis single-threaded event loop",
        description:
          "Redis uses ae (simple event loop) wrapping epoll/kqueue/evport. One thread reads commands from sockets, executes them atomically against in-memory structures, and writes responses. No mutexes on data paths. Pipelining and batching amortize syscall cost. Throughput hits 100K+ ops/sec because there is zero lock contention — the trade-off is no parallel command execution on one shard.",
      },
      {
        title: "Nginx and the C10K problem",
        description:
          "Nginx workers run epoll-based event loops handling thousands of idle keep-alive connections with minimal memory. When a socket is readable, the worker reads the request, proxies to upstream (also non-blocking), and queues response bytes. This architecture solved the C10K problem that thread-per-connection Apache struggled with — same OS primitives, different concurrency model.",
      },
      {
        title: "Kafka sequential disk I/O",
        description:
          "Kafka appends records to partition log segments sequentially and uses mmap or sendfile for zero-copy transfer to consumers. The OS page cache absorbs reads; sequential writes saturate disk bandwidth. fsync interval (log.flush.interval.messages) trades durability for throughput — unclean leader election if broker crashes before flush.",
      },
    ],
    keyTakeaways: [
      "Blocking I/O + one thread per connection does not scale; event loops + epoll do",
      "Reactor pattern: one thread demultiplexes many FDs to callbacks",
      "Single-threaded design eliminates sync overhead — Redis's core insight",
      "Mutexes protect invariants; keep critical sections short and ordered to avoid deadlock",
      "Disk performance depends on sequential vs random patterns and fsync frequency",
      "io_uring represents the next generation of Linux async I/O for extreme throughput",
      "Choose concurrency model (threads, events, processes) based on shared state and I/O pattern",
    ],
    whyItMatters:
      "When you design a service handling 50K WebSocket connections, recommend Redis, or debug 'the server freezes under load,' the answer lives in I/O models and synchronization. High-throughput systems are not magic — they combine non-blocking I/O, efficient event notification, and concurrency models that minimize lock contention. Interview questions about 'how does Kafka/Redis/Nginx scale' test this knowledge directly.",
    reflectionQuestions: [
      "Why does a single slow Redis command block the entire instance, and how would Redis Cluster change that?",
      "You have a Node.js API and one endpoint calls a synchronous filesystem API. What happens under concurrent load?",
      "Compare mutex + condition variable vs channel (Go) for a producer-consumer queue. Trade-offs?",
      "When would io_uring beat epoll for a database storage engine, and when would it not matter?",
    ],
    resources: [
      "The Linux Programming Interface — File I/O and Signals (Michael Kerrisk)",
      "UNIX Network Programming, Volume 1 — Nonblocking I/O (Stevens)",
      "Redis architecture documentation — event loop and single-threaded design",
      "Efficient IO with io-uring — Jens Axboe (kernel developer)",
    ],
  }),
];
