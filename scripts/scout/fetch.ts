import { fetchAll } from "./core.ts";

async function main() {
  const items = await fetchAll({
    mode: "full",
    depth: "quick",
    onProgress: (e) => console.log(`[${e.stage}] ${e.message}`),
  });
  console.log(`Stored ${items.length} items`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
