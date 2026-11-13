# Web foundation

Requires Node.js 20.9 or newer. From this directory run `npm ci`, copy `.env.example` to `.env.local` if changing the API address, and run `npm run dev`. Open http://localhost:3000. The web server requests the API's `GET /health` with a three-second timeout, validates `{ "status": "ok" }`, and displays an unavailable state for errors. The URL is server-side configuration and must point to a trusted API. `GET /health` on the web server reports only web process health.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` for checks. This early page has semantic headings and responsive styling; manual keyboard, assistive technology, contrast and small-screen verification remain necessary. No personal or synthetic user data is collected by this page.
