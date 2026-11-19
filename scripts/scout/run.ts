import { runScout } from "./core.ts";

async function main() {
  const result = await runScout({
    mode: "full",
    depth: process.argv.includes("--deep") ? "deep" : "quick",
    propose: process.argv.includes("--propose"),
    onProgress: (e) => console.log(`[${e.stage}] ${e.message}`),
  });
  console.log(
    `Done ${result.jobId}: ${result.items.length} items, ${result.clusters.length} clusters, digest=${result.digestPath ?? "n/a"}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
