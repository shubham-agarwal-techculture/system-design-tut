import { argValue, hasFlag } from "../content/lib.ts";
import { runScout, type ScoutMode } from "./core.ts";

async function main() {
  const mode = (argValue("--mode") ?? "full") as ScoutMode;
  const query = argValue("--query") ?? process.argv.filter((a) => !a.startsWith("-")).slice(2).join(" ") || undefined;
  const lessonId = argValue("--lesson");
  const depth = (argValue("--depth") as "quick" | "deep") ?? "quick";
  const since = argValue("--since");
  const sinceDays = since?.endsWith("d") ? Number(since.slice(0, -1)) : undefined;

  const result = await runScout({
    mode,
    query: mode === "topic" ? query : undefined,
    lessonId: mode === "lesson" ? lessonId ?? query : undefined,
    depth,
    sinceDays,
    propose: hasFlag("--propose"),
    onProgress: (e) => console.log(`[${e.stage}] ${e.message}`),
  });

  if (result.briefing) {
    console.log("\n=== Briefing ===");
    console.log(JSON.stringify(result.briefing, null, 2));
  }
  console.log(
    `\nJob ${result.jobId}: ${result.items.length} items, ${result.clusters.length} clusters`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
