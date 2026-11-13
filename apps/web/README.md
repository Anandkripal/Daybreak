# Web foundation

Requires Node.js 24. From this directory run `npm ci`, copy `.env.example` to `.env.local` if changing the API address, and run `npm run dev`. Open http://localhost:3000. The help page links directly to external organisations and works without the API. The health-client module retains a three-second timeout and validates the API response for future use. The configured API URL must point to a trusted API. `GET /health` on the web server reports only web process health.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` for checks. This early page has semantic headings and responsive styling; manual keyboard, assistive technology, contrast and small-screen verification remain necessary. No personal or synthetic user data is collected by this page.
