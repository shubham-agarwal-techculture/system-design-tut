import { runScout } from "./core.ts";

async function main() {
  const result = await runScout({
    mode: "full",
    depth: "quick",
    propose: true,
    onProgress: (e) => console.log(`[${e.stage}] ${e.message}`),
  });
  console.log(
    `Job ${result.jobId}: ${result.clusters.filter((c) => c.suggestedAction === "draft").length} draft proposals`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
