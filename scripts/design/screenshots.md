# Visual regression screenshots

To capture each skin × mode:

1. `npm run dev` and `npm run server` in separate terminals.
2. Open `/design` and `/appearance`.
3. For each skin (drafting, transit, riso, instrument) and mode (light, dark), take a Playwright screenshot:

```bash
npx playwright install chromium
npx playwright screenshot http://localhost:5173/design --filename=artifacts/design-drafting-light.png
```

Automate further with a Playwright script under `scripts/design/playwright-skins.ts` once Playwright is added as a devDependency.
