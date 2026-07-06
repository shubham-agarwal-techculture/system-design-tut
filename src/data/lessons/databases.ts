import { lesson } from "./helpers";

export const databaseLessons = [
  lesson({
    id: "db-storage-engines",
    moduleId: "databases",
    phaseId: "foundations",
    title: "B+ Trees & LSM Trees",
    durationMinutes: 45,
    summary:
      "Storage engines define how databases organize data on disk and in memory. B+ trees optimize for read-heavy, in-place update workloads (PostgreSQL, MySQL InnoDB). LSM trees optimize for write-heavy, append-only workloads (RocksDB, Cassandra, LevelDB). Choosing the wrong engine shape for your access pattern is one of the costliest architectural mistakes.",
    sections: [
      {
        title: "Why Storage Engine Design Matters",
        paragraphs: [
          "A database is not a monolith — at its core sits a storage engine responsible for persisting rows or key-value pairs, maintaining indexes, and recovering after crashes. The engine's on-disk layout determines read latency, write throughput, compression efficiency, and how the system behaves under compaction or vacuum.",
          "Two families dominate modern systems: update-in-place B+ trees and append-only LSM (Log-Structured Merge) trees. Neither is universally superior. PostgreSQL's B+ tree excels at complex queries with range scans and secondary indexes. Cassandra's LSM tree excels at high-volume sequential writes and horizontal scaling — but range queries and updates are expensive.",
          "Every storage engine also implements a WAL (Write-Ahead Log): before applying changes to data structures, append an durable log record. On crash, replay the WAL to recover. The WAL is sequential write — fast on both HDD and SSD — and is the foundation of durability (the D in ACID).",
          "When designing a system, your read/write ratio, update frequency, range query needs, and tolerance for write amplification during compaction should drive engine selection — not brand familiarity or what your team used last project.",
        ],
      },
      {
        title: "B+ Trees: Read-Optimized, Update-in-Place",
        paragraphs: [
          "A B+ tree is a balanced tree where data lives only in leaf nodes; internal nodes store keys for navigation. Leaves are linked for efficient range scans. Each node typically matches a disk page (4–16 KB), so a tree of height 3–4 can index billions of keys with only 3–4 disk reads.",
          "To insert or update, the engine finds the leaf, modifies it in place (or splits the page if full), and propagates splits upward. Reads follow the root-to-leaf path — predictable latency, excellent for point lookups and ORDER BY on indexed columns. Secondary indexes in PostgreSQL and MySQL are separate B+ trees pointing to primary key tuples.",
          "Random writes to B+ tree pages cause write amplification at the filesystem level — updating one row may dirty an entire page. SSDs handle this better than HDDs, but sustained random write loads still wear flash and trigger garbage collection in the FTL. Buffer pools cache hot pages in RAM, minimizing disk reads.",
          "PostgreSQL stores rows in heap files (unordered) with B+ tree indexes on top. MySQL InnoDB clusters the primary key — data rows live in the PK B+ tree leaf pages, making PK lookups very fast but secondary index lookups require two tree traversals (secondary index → PK → row).",
        ],
        bullets: [
          "Page-oriented: one node = one disk page, fits in buffer pool",
          "Range scan: follow leaf sibling pointers left to right",
          "Page split: insert into full page splits node, may cascade upward",
          "Clustered vs non-clustered index: row data in PK tree (InnoDB) vs separate heap (PostgreSQL)",
        ],
      },
      {
        title: "LSM Trees: Write-Optimized, Append-Only",
        paragraphs: [
          "LSM trees invert the B+ tree trade-off. Writes go to an in-memory sorted structure (memtable, often a skip list or red-black tree) and an append-only WAL on disk. When the memtable fills, it is flushed as an immutable sorted SSTable (Sorted String Table) file on disk.",
          "Reads check memtable, then search SSTables newest-to-oldest, often using Bloom filters to skip SSTables that definitely do not contain the key. Without compaction, read amplification grows linearly with the number of SSTables — unacceptable for production.",
          "Compaction merges SSTables in the background — rewriting data to reduce duplicates (updates and deletes become tombstones), remove expired tombstones, and organize data into fewer, larger files. Compaction strategies (leveled, tiered, size-tiered) trade write amplification, read amplification, and space amplification differently.",
          "Cassandra, RocksDB, LevelDB, and ScyllaDB use LSM variants. They shine when writes are inserts or append-only events, when you partition data so each node handles a subset of keys, and when you can tolerate eventual visibility of data during compactions.",
        ],
        bullets: [
          "Memtable: in-memory write buffer, sorted by key",
          "SSTable: immutable on-disk sorted file, never modified in place",
          "Bloom filter: probabilistic 'key definitely not here' to skip SSTables",
          "Tombstone: deletion marker removed only after compaction",
        ],
      },
      {
        title: "Amplification and Compaction Trade-offs",
        paragraphs: [
          "Write amplification: bytes written to disk per byte of application data. LSM compaction rewrites the same key multiple times as it moves through levels — 10–30× write amplification is common in leveled compaction. SSD endurance and cloud IOPS billing make this a real cost.",
          "Read amplification: disk reads per logical read. B+ tree is typically 1–3 page reads. LSM may check memtable + multiple SSTable levels + Bloom filter false positives. Read-heavy workloads on LSM without sufficient RAM for block cache suffer.",
          "Space amplification: disk usage vs logical data size. Tombstones, duplicate versions during compaction, and snapshot isolation retain old versions until compaction cleans them.",
          "Leveled compaction (LevelDB, RocksDB default): SSTables in level L are ~10× larger than L-1; each key appears in at most one SSTable per level — bounded read amplification, higher write amplification. Size-tiered compaction (Cassandra STCS): merge similar-sized SSTables — lower write amp, higher read amp and space amp. Incremental strategies (DTCS, ICS) target time-series data.",
        ],
      },
      {
        title: "Choosing and Operating Storage Engines",
        paragraphs: [
          "Choose B+ tree engines when: complex queries with joins and range scans dominate, updates modify existing rows frequently, strong single-node consistency is required, and working set fits mostly in buffer pool. PostgreSQL, MySQL, SQL Server fit this profile.",
          "Choose LSM engines when: write throughput is the bottleneck, data is naturally partitioned by key, access is mostly primary-key get/put, or you need embedded storage (RocksDB inside Kafka Streams, Cockroach's Pebble). Cassandra, DynamoDB (conceptually), TiKV/RocksDB fit here.",
          "Hybrid systems exist: MyRocks (MySQL on RocksDB) for write-heavy MySQL workloads. CockroachDB and TiDB use LSM (Pebble/RocksDB) with distributed SQL layers. ClickHouse uses merge-tree structures optimized for analytics — yet another design point.",
          "Operational implications: B+ trees need VACUUM (PostgreSQL) or purge (InnoDB) to reclaim space from dead tuples. LSM trees need compaction tuning — stalled compaction causes read degradation and disk fill. Monitor compaction pending bytes, SSTable count, and write stall events in RocksDB.",
        ],
      },
    ],
    concepts: [
      "B+ tree: balanced tree, data in leaves, range scan via leaf links",
      "LSM tree: memtable + immutable SSTables, append-only writes",
      "WAL (Write-Ahead Log): durable sequential log for crash recovery",
      "Write amplification: disk bytes written per application byte",
      "Read amplification: disk reads per logical read operation",
      "Compaction: background merge of SSTables to bound read cost",
      "Bloom filter: skip SSTables that cannot contain a key",
      "Buffer pool / block cache: RAM cache for hot pages or blocks",
      "Clustered index: row data stored in primary key B+ tree (InnoDB)",
      "Tombstone: deletion marker in LSM, removed during compaction",
    ],
    practices: [
      "Match engine to access pattern: read/update-heavy → B+ tree; write/insert-heavy → LSM",
      "Size buffer pool or block cache to hold hot working set — avoids disk on every read",
      "Monitor LSM compaction lag, pending compaction bytes, and write stalls",
      "Run PostgreSQL VACUUM or autovacuum tuning for B+ tree heap bloat",
      "Prefer sequential write patterns (batch inserts, append-only events) on LSM systems",
      "Use Bloom filter and block cache hit rates as leading indicators of LSM read health",
      "Test with production-like data volume — amplification effects appear only at scale",
    ],
    pitfalls: [
      "Using Cassandra for heavy range scans or frequent updates — LSM penalty on reads and compactions",
      "Ignoring write amplification on cloud SSD — IOPS limits cause throttling during compaction",
      "Assuming all 'NoSQL' uses LSM — MongoDB WiredTiger uses B-trees, different trade-offs",
      "Undersizing RAM on LSM — without block cache, every read hits multiple SSTables",
      "Disabling or starving autovacuum in PostgreSQL — table bloat degrades scans and wastes disk",
      "Treating WAL as optional — it is the durability backbone; sync policy matters",
    ],
    examples: [
      {
        title: "PostgreSQL heap + B+ tree index",
        description:
          "An UPDATE in PostgreSQL creates a new row version (MVCC) in the heap and updates index entries pointing to the new tuple. Old versions remain until VACUUM reclaims them. Heavy UPDATE workloads cause bloat — autovacuum must keep pace. Index-only scans avoid heap fetches when visibility map confirms all tuples on a page are visible — a B+ tree optimization for read-heavy analytics.",
      },
      {
        title: "Cassandra write path",
        description:
          "A write goes to commit log (WAL) + memtable. When memtable exceeds memtable_flush_after, it flushes to SSTable on disk. Reads merge memtable + SSTables. With size-tiered compaction, many SSTables accumulate; read latency grows until compaction merges them. Production clusters tune compaction strategy, gc_grace_seconds, and concurrent_compactors based on write rate and read SLA.",
      },
      {
        title: "RocksDB in Kafka Streams state store",
        description:
          "Kafka Streams embeds RocksDB for local state (aggregations, joins). Changelog topics provide durability — RocksDB can rebuild from Kafka on restore. Compaction and block cache sizing directly affect stream processing latency during repartitioning or recovery. This shows LSM as an embedded component, not just a standalone database.",
      },
    ],
    keyTakeaways: [
      "B+ trees: update-in-place, great reads and range scans, used by most relational DBs",
      "LSM trees: append-only writes, great write throughput, compaction manages read cost",
      "WAL provides durability for both engine families — sequential append before data structure change",
      "Write/read/space amplification quantify engine trade-offs — measure at production scale",
      "Compaction is the defining operational concern for LSM; VACUUM/bloat for B+ tree heaps",
      "Engine choice follows access patterns — not SQL vs NoSQL labels",
      "Hybrid and specialized engines (ClickHouse merge-tree) exist for analytics workloads",
    ],
    whyItMatters:
      "Storage engine choice affects every downstream decision: shard key design, hardware sizing, latency SLAs, and operational runbooks. Saying 'we'll use PostgreSQL' without understanding B+ tree behavior under write-heavy UPDATE load, or choosing Cassandra without planning for compaction, leads to expensive re-architecture. Interviewers probe storage engines because they reveal whether you understand what happens below the SQL or API layer.",
    reflectionQuestions: [
      "Your write-heavy event ingestion (1M events/sec) needs durable storage. Compare PostgreSQL bulk insert vs Cassandra vs Kafka + RocksDB. Trade-offs?",
      "RocksDB write stalls appear during peak traffic. What is happening internally, and what knobs would you tune?",
      "Why does PostgreSQL need VACUUM but Cassandra needs compaction — what problem is each solving?",
      "When would MyRocks (LSM under MySQL) be preferable to InnoDB (B+ tree)?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapters 3 and 4 (Martin Kleppmann)",
      "Database Internals — Storage engines (Alex Petrov)",
      "RocksDB Wiki — Compaction, Write Stalls, Tuning Guide",
      "PostgreSQL documentation — Index Types and Routine Vacuuming",
    ],
  }),

  lesson({
    id: "db-transactions",
    moduleId: "databases",
    phaseId: "foundations",
    title: "Transactions & Isolation Levels",
    durationMinutes: 42,
    summary:
      "Transactions group operations into atomic units that succeed or fail together. Isolation levels control what concurrent transactions can observe — trading consistency guarantees for performance. Understanding ACID, anomalies, MVCC, and locking strategies is essential for payment systems, inventory, and any shared mutable state.",
    sections: [
      {
        title: "ACID: The Contract Transactions Provide",
        paragraphs: [
          "Atomicity: all operations in a transaction commit or none do. If transferring money debits account A but crashes before crediting B, the database rolls back the debit. Implemented via WAL and undo logs — on failure, replay undo records to restore prior state.",
          "Consistency: transactions take the database from one valid state to another — constraints, foreign keys, and triggers hold. Note: 'C' is partly application responsibility; the DB enforces declared constraints, not all business rules.",
          "Isolation: concurrent transactions behave as if they ran serially (in some level of approximation). The real world runs transactions in parallel for performance — isolation levels define acceptable anomalies.",
          "Durability: once committed, data survives crashes. WAL fsync before commit acknowledgment ensures log records reach stable storage. Replication adds another durability dimension — a commit on the leader may not yet be on followers.",
        ],
        bullets: [
          "BEGIN / COMMIT / ROLLBACK: transaction boundaries",
          "Single-statement auto-commit: each statement is its own transaction by default",
          "Distributed transactions (2PC): atomicity across nodes — costly, avoided in modern microservices",
          "Saga pattern: application-level compensation instead of 2PC across services",
        ],
      },
      {
        title: "Isolation Levels and Anomalies",
        paragraphs: [
          "SQL standard defines four isolation levels, from weakest to strongest: Read Uncommitted, Read Committed, Repeatable Read, Serializable. Each prevents some anomalies but not others, with increasing locking or versioning overhead.",
          "Dirty read: transaction T2 reads data written by T1 that T1 has not committed. If T1 rolls back, T2 acted on garbage. Prevented by Read Committed and above.",
          "Non-repeatable read: T1 reads a row, T2 updates and commits it, T1 reads again and gets a different value. Prevented by Repeatable Read and above.",
          "Phantom read: T1 runs a range query, T2 inserts a new row matching the range and commits, T1 re-runs the query and sees new rows. Prevented by Serializable (or snapshot isolation with careful handling in PostgreSQL).",
          "Lost update: two transactions read-modify-write the same row; one overwrites the other without seeing its change. Not fully solved by isolation level alone — needs optimistic locking (version column) or SELECT FOR UPDATE.",
        ],
      },
      {
        title: "MVCC: Multi-Version Concurrency Control",
        paragraphs: [
          "MVCC avoids read-write blocking by keeping multiple versions of rows. Readers see a snapshot as of transaction start; writers create new versions without overwriting visible data. PostgreSQL and Oracle use MVCC; readers never block writers and writers rarely block readers.",
          "PostgreSQL implements this with xmin/xmax system columns and tuple visibility rules. UPDATE creates a new row version; old version remains until VACUUM. Repeatable Read uses a snapshot taken at first statement (or transaction start in PostgreSQL) — same row read twice returns the same version.",
          "MySQL InnoDB MVCC uses undo logs to reconstruct older row versions for Read View. Repeatable Read is the default — phantoms possible on index ranges without gap locks. Gap locks and next-key locks prevent phantoms but increase deadlock risk.",
          "Snapshot isolation (SI) is often stronger than Read Committed but weaker than full Serializable — it prevents dirty and non-repeatable reads but historically allowed write skew (two transactions read disjoint sets, make consistent-looking updates that violate an invariant together). PostgreSQL 9.1+ Serializable uses SSI (Serializable Snapshot Isolation) to detect dangerous structures.",
        ],
        bullets: [
          "Read snapshot: transaction sees consistent view frozen at start",
          "Write creates new version; old version visible to older snapshots",
          "VACUUM / purge: reclaim versions no longer visible to any transaction",
          "Write skew: concurrent transactions pass row checks but violate global invariant",
        ],
      },
      {
        title: "Pessimistic vs Optimistic Locking",
        paragraphs: [
          "Pessimistic locking: lock rows before modifying (SELECT FOR UPDATE, SELECT FOR SHARE). Other transactions block until lock released. Prevents lost updates and ensures exclusive access — but reduces concurrency and risks deadlocks.",
          "Optimistic locking: read without lock, check version at commit (UPDATE ... WHERE id = ? AND version = ?). If version changed, retry. Good for low-contention workloads — no blocking, but retries under high contention.",
          "Application-level locks: Redis SETNX, ZooKeeper ephemeral nodes, or advisory locks (PostgreSQL pg_advisory_lock) coordinate across services when transaction boundaries span systems. These are not ACID with the database — design idempotency and timeout carefully.",
          "In microservices, each service owns its database — cross-service 'transactions' use sagas (choreography or orchestration) with compensating actions (cancel reservation, refund payment) rather than distributed 2PC, which blocks on failure and does not scale.",
        ],
      },
      {
        title: "Transactions in System Design",
        paragraphs: [
          "Payment and ledger systems demand Serializable or careful serial execution per account — double-spend and negative balance are unacceptable. Inventory systems need to prevent overselling — pessimistic lock on stock row or atomic decrement with CHECK (quantity >= 0).",
          "Read-heavy dashboards can use Read Committed or even read replicas with lag acceptance — stale analytics is tolerable. Session state and shopping carts tolerate eventual consistency; checkout does not.",
          "Long-running transactions are dangerous: they hold locks or old snapshots, block VACUUM (PostgreSQL xact wraparound risk), and increase deadlock probability. Keep transactions short — do validation and external API calls outside the transaction when possible.",
          "When interviewing, state your isolation choice explicitly: 'Bank transfer: Serializable or SELECT FOR UPDATE on both accounts in consistent order to prevent deadlock.' 'Social feed like count: eventual consistency, no transaction needed.' This demonstrates intentional trade-offs.",
        ],
      },
    ],
    concepts: [
      "ACID: Atomicity, Consistency, Isolation, Durability",
      "Isolation levels: Read Uncommitted → Committed → Repeatable Read → Serializable",
      "Dirty read, non-repeatable read, phantom read, lost update",
      "MVCC: multi-version concurrency, snapshot reads without blocking writes",
      "SELECT FOR UPDATE: pessimistic row lock",
      "Optimistic locking: version column check at update time",
      "WAL and undo log: atomicity and crash recovery mechanisms",
      "Write skew: anomaly under snapshot isolation",
      "Saga: distributed transaction alternative with compensating actions",
      "2PC: two-phase commit for cross-node atomicity — high latency, blocking",
    ],
    practices: [
      "Use the weakest isolation level that meets correctness requirements — do not default to Serializable everywhere",
      "Keep transactions short — no external HTTP calls or user think-time inside BEGIN...COMMIT",
      "Prevent lost updates with version columns or SELECT FOR UPDATE on contested rows",
      "Acquire locks in consistent order (account ID ascending) to prevent deadlocks",
      "Use idempotency keys for retried operations in payment and order flows",
      "Monitor long-running transactions and lock wait times in production",
      "Prefer sagas over 2PC for cross-service workflows; design compensating actions",
    ],
    pitfalls: [
      "Assuming READ COMMITTED prevents lost updates — it does not without explicit locking",
      "Long transactions blocking VACUUM in PostgreSQL — leads to table bloat and txid wraparound",
      "Serializable isolation without handling serialization failures — apps must retry on 40001",
      "Distributed transactions (2PC) across microservices — blocks, fragile, avoid in favor of sagas",
      "Optimistic locking under high contention — retry storms degrade performance",
      "Reading from async replica for financial balance checks — replication lag causes wrong decisions",
    ],
    examples: [
      {
        title: "Bank transfer with row locks",
        description:
          "Transfer $100 from A to B: BEGIN; SELECT balance FROM accounts WHERE id IN (A,B) ORDER BY id FOR UPDATE; validate A >= 100; UPDATE accounts SET balance = balance - 100 WHERE id = A; UPDATE accounts SET balance = balance + 100 WHERE id = B; COMMIT. Lock ordering by ID prevents deadlock when two transfers cross (A→B and B→A simultaneously). Serializable isolation would also work but may retry on conflict.",
      },
      {
        title: "Inventory oversell with Read Committed",
        description:
          "Two checkout requests read stock=1 concurrently under Read Committed. Both pass validation. Both decrement. stock=-1. Fix: UPDATE products SET stock = stock - 1 WHERE id = ? AND stock >= 1 RETURNING stock — atomic check-and-decrement, or SELECT FOR UPDATE before decrement. Isolation level alone is insufficient; the write must be conditional.",
      },
      {
        title: "E-commerce order saga",
        description:
          "Place order spans Order Service, Payment Service, Inventory Service. Instead of 2PC: Order creates pending order → Payment charges card → Inventory reserves stock → Order confirms. On payment failure: compensating cancel order. On inventory failure: refund payment, cancel order. Each step is local ACID; global consistency is eventual with defined failure paths.",
      },
    ],
    keyTakeaways: [
      "ACID defines transaction guarantees — durability and atomicity rely on WAL",
      "Weaker isolation = better performance but more anomalies — choose intentionally",
      "MVCC enables concurrent reads and writes without blocking — PostgreSQL's core model",
      "Lost updates require explicit locking or conditional writes, not just isolation level",
      "Keep transactions short; long transactions harm VACUUM, locks, and throughput",
      "Microservices use sagas with compensation, not distributed 2PC",
      "Match isolation to business risk: payments strict, analytics relaxed",
    ],
    whyItMatters:
      "Every system with shared mutable state — wallets, inventory, seat booking, idempotency keys — depends on transaction design. Bugs from wrong isolation level cause double charges, overselling, and data corruption that no amount of caching or load balancing fixes. Interviewers ask 'how do you prevent double-spend' and 'what isolation level' because these separate engineers who understand concurrency from those who treat the database as a black box.",
    reflectionQuestions: [
      "Design the transaction flow for a concert ticket booking system with 10K concurrent users for 100 remaining seats.",
      "What isolation level would you use for a financial ledger, and how would you handle serialization failures?",
      "Explain write skew with a concrete example (e.g., on-call schedule, budget approval).",
      "When is a saga with compensating transactions preferable to a single database transaction?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapter 7: Transactions (Martin Kleppmann)",
      "PostgreSQL documentation — Transaction Isolation and Explicit Locking",
      "MySQL InnoDB locking and MVCC documentation",
      "Microservices Patterns — Saga chapter (Chris Richardson)",
    ],
  }),

  lesson({
    id: "db-indexes-replication",
    moduleId: "databases",
    phaseId: "foundations",
    title: "Indexes, Replication & Sharding",
    durationMinutes: 40,
    summary:
      "Indexes accelerate queries at the cost of write overhead and storage. Replication provides availability, fault tolerance, and read scaling. Sharding partitions data across nodes for write scaling — but introduces cross-shard query complexity and hot spot risk. These three mechanisms are the primary toolkit for scaling databases.",
    sections: [
      {
        title: "Indexes: How Queries Find Data Fast",
        paragraphs: [
          "Without an index, finding a row by email requires a full table scan — O(n) pages read. A B+ tree index on email reduces this to O(log n) — typically 3–4 page reads for billions of rows. Indexes are separate data structures (usually B+ trees) storing indexed columns plus a pointer to the row (primary key or physical location).",
          "Composite indexes (a, b, c) support queries filtering on prefix columns — useful for WHERE a = ? AND b = ? but not WHERE b = ? alone (left-prefix rule). Column order matters: put equality filters first, range filters last.",
          "Covering index: the index contains all columns needed by the query — the engine satisfies the query from the index alone (index-only scan), avoiding heap/table lookups. CREATE INDEX ... INCLUDE (col) in PostgreSQL adds non-key columns to leaf pages.",
          "Index trade-offs: every INSERT/UPDATE/DELETE must update affected indexes — more indexes = slower writes and more storage. Partial indexes (WHERE active = true) and expression indexes (LOWER(email)) target specific query patterns efficiently.",
        ],
        bullets: [
          "Primary key index: unique, often clustered (InnoDB) or separate (PostgreSQL)",
          "Secondary index: non-unique, points to PK or row location",
          "Hash index: O(1) equality only, no range scans (PostgreSQL hash, Redis)",
          "GIN/GiST: specialized indexes for full-text, JSON, geospatial (PostgreSQL)",
        ],
      },
      {
        title: "Query Planning and Index Selection",
        paragraphs: [
          "The query optimizer (planner) estimates cost of execution plans — seq scan vs index scan vs bitmap scan — using statistics (row counts, value distribution, index correlation). Outdated statistics cause bad plans; ANALYZE (PostgreSQL) or AUTO ANALYZE keeps them fresh.",
          "Index scan: walk B+ tree to find matching keys, fetch rows. Bitmap index scan: collect TID bitmap from index, sort by physical location, fetch in batch — reduces random I/O for moderate selectivity. Seq scan: read all pages — often faster for large fraction of table (optimizer threshold ~5–30% depending on config).",
          "EXPLAIN ANALYZE is your diagnostic tool — shows actual vs estimated rows, index usage, and sort methods. 'Seq Scan on users' on a 10M row table for a high-selectivity query means missing or unused index.",
          "Anti-patterns: indexing every column, redundant indexes (a,b) when (a,b,c) suffices for prefix queries, functions on indexed columns without expression index (WHERE LOWER(email) = ? bypasses index on email).",
        ],
      },
      {
        title: "Replication: Availability and Read Scaling",
        paragraphs: [
          "Replication copies data from a leader (primary) to followers (replicas). Purposes: failover when leader dies, read scaling by routing SELECTs to replicas, geographic distribution for low-latency reads.",
          "Synchronous replication: leader waits for follower acknowledgment before commit — no data loss on failover but higher write latency and availability risk if follower is slow. Asynchronous: leader commits immediately, replicates in background — lower latency but possible data loss if leader fails before replication (RPO > 0).",
          "Leader-follower (primary-replica) is most common: PostgreSQL streaming replication, MySQL binlog replication, Redis replication. Multi-leader: writes to any node, conflict resolution needed — rare, used in multi-datacenter (CouchDB, some CRDT systems). Leaderless (Dynamo-style): write to W of N nodes, read from R of N; R + W > N gives read-your-writes consistency.",
          "Replication lag: async replicas fall behind under write load. Reading stale data from replica causes 'post redirect GET shows old profile' bugs. Monitor lag (seconds behind primary); route consistency-sensitive reads to primary or use quorum reads.",
        ],
        bullets: [
          "Failover: promote replica to leader — manual or automatic (Patroni, Orchestrator)",
          "Split-brain: two nodes think they are leader — use fencing, quorum, or STONITH",
          "Read replica: scale reads, not writes — all writes still go to leader",
          "Chain replication: A → B → C reduces leader fan-out",
        ],
      },
      {
        title: "Sharding: Horizontal Partitioning for Write Scale",
        paragraphs: [
          "When a single node cannot handle write throughput or storage, partition data across shards — each shard is an independent database holding a subset of keys. Application or proxy layer routes queries by shard key.",
          "Shard key choice is the most critical decision. Good key: high cardinality, even distribution, aligns with query patterns (most queries filter by shard key). Bad key: low cardinality (country=US for 95% of users), monotonically increasing (timestamp — all writes hit last shard), or unrelated to access pattern (causes cross-shard joins).",
          "Cross-shard queries are expensive: aggregating across all shards, JOINs between sharded tables, global secondary indexes (maintained asynchronously). Design schemas so co-located data shares a shard key — user_id shards user profile, orders, and settings together.",
          "Resharding: when adding nodes, remapping keys requires moving data. Consistent hashing minimizes remapping — only K/n keys move when adding K nodes to n existing. Virtual nodes improve balance. Tools: Vitess, Citus, MongoDB sharding, application-level routing.",
        ],
      },
      {
        title: "Putting It Together in Production",
        paragraphs: [
          "Typical evolution: single PostgreSQL with indexes → add read replicas for analytics and read-heavy endpoints → cache hot data in Redis → shard when write/storage limits hit. Each step adds operational complexity — do not shard prematurely.",
          "Hot spots: even with good shard key, celebrity users or viral content concentrate load on one shard. Mitigations: sub-sharding hot keys, read replicas for hot shard, application-level fan-out, or splitting hot entity across synthetic keys.",
          "Global systems combine replication (availability, geo-reads) and sharding (write scale). CockroachDB and Spanner shard automatically with distributed consensus. Application-level sharding (Vitess, custom) offers control at the cost of routing logic.",
          "For interviews: articulate index strategy for access patterns, replication mode for RPO/RTO requirements, and shard key with awareness of hot spots and cross-shard query cost. Draw the data flow: write → leader → async replica → cache invalidation.",
        ],
      },
    ],
    concepts: [
      "B+ tree index: logarithmic lookup, supports range scans",
      "Composite index left-prefix rule: (a,b) helps WHERE a=?, not WHERE b=? alone",
      "Covering index: query satisfied from index without table access",
      "Query optimizer: cost-based plan selection using statistics",
      "Leader-follower replication: single write leader, async/sync followers",
      "Replication lag: stale reads from async replicas",
      "Shard key: determines data distribution and query routing",
      "Consistent hashing: minimal key remapping when nodes added/removed",
      "Hot spot: uneven load on one shard despite good average distribution",
      "RPO/RTO: recovery point/time objectives drive sync vs async replication",
    ],
    practices: [
      "Index columns used in WHERE, JOIN, ORDER BY — verify with EXPLAIN ANALYZE",
      "Choose shard key matching dominant query filter — co-locate related data",
      "Monitor replication lag; route consistency-critical reads to primary",
      "Use partial and composite indexes deliberately — avoid indexing low-selectivity columns alone",
      "Plan failover: automated promotion, connection string updates, split-brain prevention",
      "Add shards before hitting 70–80% capacity on largest node — resharding under fire is painful",
      "Cache invalidation on write — replicas alone do not solve cache consistency",
    ],
    pitfalls: [
      "Bad shard key (timestamp, boolean, low-cardinality enum) — hot shards and uneven growth",
      "Assuming read replicas scale writes — they do not; all writes hit the leader",
      "Ignoring replication lag — users see stale data after their own writes",
      "Over-indexing — write path slows, storage bloats, optimizer may choose wrong plan",
      "Cross-shard JOINs in application without performance budget — N shard queries per request",
      "Automatic failover without fencing — split-brain corrupts data with dual writes",
    ],
    examples: [
      {
        title: "Twitter/X user timeline shard key",
        description:
          "User-centric data (profile, tweets by user, followers) shards by user_id — most reads are 'get user' or 'get user's tweets.' Global trending is harder — separate service aggregates, or fan-out on write to follower timelines (write amplification vs read optimization). Celebrity tweets create hot spots — dedicated caching and async fan-out pipelines handle disproportionate follower counts.",
      },
      {
        title: "PostgreSQL read replica for reporting",
        description:
          "Production app writes to primary. Nightly analytics and admin dashboards query read replica. Async lag of 1–5 seconds is acceptable for reports but not for 'did my payment go through' — those reads hit primary. Connection pooler (PgBouncer) routes by query type or separate connection strings per role.",
      },
      {
        title: "Vitess sharding at YouTube scale",
        description:
          "Vitess sits in front of many MySQL shards, providing SQL routing, resharding, and connection pooling. Shard key (e.g., user_id) embedded in schema. VSchema defines routing rules. Cross-shard queries supported but discouraged for hot paths. Demonstrates managed sharding layer vs application DIY routing.",
      },
    ],
    keyTakeaways: [
      "Indexes speed reads, slow writes — design for query patterns, verify with EXPLAIN",
      "Replication provides failover and read scale; async lag means stale replica reads",
      "Sharding enables write scale but shard key choice is hard to change later",
      "Co-locate related data on the same shard to avoid cross-shard joins",
      "Consistent hashing eases resharding; hot spots need application-level mitigation",
      "Evolve gradually: indexes → replicas → cache → shard when metrics demand it",
      "RPO/RTO requirements determine sync vs async replication — not one-size-fits-all",
    ],
    whyItMatters:
      "Database scaling questions dominate system design interviews and production incidents. 'How would you scale this DB' expects indexes for query paths, replicas for read/failover trade-offs, and sharding for write limits — with explicit awareness of hot spots and consistency. Teams that shard too early drown in ops; teams that shard too late face painful migrations under load.",
    reflectionQuestions: [
      "Design indexes for a query: SELECT * FROM orders WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 20.",
      "Your async replica lag spikes to 30 seconds during peak. Which user-facing features break, and how do you mitigate?",
      "Choose a shard key for a multi-tenant SaaS app (tenants, users, documents). Justify and describe one cross-shard query you'd avoid.",
      "When would you choose sync replication over async despite the latency cost?",
    ],
    resources: [
      "Designing Data-Intensive Applications — Chapters 5, 6, 9 (Martin Kleppmann)",
      "Use The Index, Luke — Practical index and SQL tuning guide",
      "Vitess documentation — Sharding and VSchema design",
      "PostgreSQL EXPLAIN documentation and pg_stat_replication monitoring",
    ],
  }),
];
