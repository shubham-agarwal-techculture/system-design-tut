import { openScoutDb, analyze } from "./core.ts";
import type { ScoutItem } from "./core.ts";

async function main() {
  const db = openScoutDb();
  const items = db
    .prepare(`SELECT url, title, date, source, text FROM items ORDER BY fetched_at DESC LIMIT 200`)
    .all() as ScoutItem[];
  db.close();
  const clusters = await analyze(items, {
    mode: "full",
    depth: "quick",
    onProgress: (e) => console.log(`[${e.stage}] ${e.message}`),
  });
  console.log(`Analyzed ${clusters.length} clusters`);
  for (const c of clusters.slice(0, 10)) {
    console.log(
      `- ${c.suggestedAction.padEnd(10)} ${c.label.slice(0, 70)} (n=${c.novelty.toFixed(2)})`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
