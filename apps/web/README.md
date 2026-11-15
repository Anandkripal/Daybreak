# Web foundation

Requires Node.js 24. From this directory run `npm ci`, copy `.env.example` to `.env.local` if changing the API address, and run `npm run dev`. Open http://localhost:3000. The help page links directly to external organisations and works without the API. The health-client module retains a three-second timeout and validates the API response for future use. The configured API URL must point to a trusted API. `GET /health` on the web server reports only web process health.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` for checks. This early page has semantic headings and responsive styling; manual keyboard, assistive technology, contrast and small-screen verification remain necessary. Optional private contact notes stay in page memory. Explicit JSON downloads contain those notes; deletion cannot remove downloaded copies. No notes are transmitted or persisted by the application.

Private CSV analysis is available at `/transactions`, linked from `/budget`. See [CSV contract and privacy](../../docs/milestones/m3-private-csv.md). Browser regression script: start a production build on port 3027, install `playwright` and `@axe-core/playwright` in an isolated tools directory, install the three Playwright browsers, and run `NODE_PATH=/path/to/tools/node_modules node e2e/private-journey.cjs`. It uses only synthetic input.
