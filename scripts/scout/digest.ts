import { openScoutDb, analyze, writeDigest } from "./core.ts";
import type { ScoutItem } from "./core.ts";

async function main() {
  const db = openScoutDb();
  const items = db
    .prepare(`SELECT url, title, date, source, text FROM items ORDER BY fetched_at DESC LIMIT 200`)
    .all() as ScoutItem[];
  db.close();
  const clusters = await analyze(items, { mode: "full", depth: "quick" });
  const path = writeDigest(clusters);
  console.log(`Digest → ${path}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
