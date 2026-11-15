# Private contact journey — issue #17

Owner: Frontend / assistance. Branch `feat/m7-private-journey`, stacked on guided finder.

Contact preparation works without AI or an API: choose a documented starting point, review a question-based draft and checklist, open the official source to choose a channel, and record a next step, outcome and optional follow-up date. No messages or reminders are sent. A directory link is not a provider recommendation.

All tracker data exists in React memory only. Browser history may restore a page session; explicit deletion clears the page state. Explicit JSON export downloads private notes locally; delete controls remove page entries but cannot erase downloaded copies. No storage, telemetry, fetch, URL parameters or model calls carry notes. Users are asked not to enter identity/account numbers. The browser, extensions, screen visibility and downloaded files remain trust boundaries.

Source checks expire after 30 days. Invalid/future dates also need review. Until the client clock is known, descriptions are conservatively withheld. Stale records retain only their official link and request a current source check. This is a maintenance threshold, not evidence of availability. Underlying source URLs and verification dates are inherited unchanged from M4.

Tests cover draft uncertainty, export isolation and date boundaries. Manual browser keyboard/mobile/assistive-technology review remains required. M7 as a whole remains incomplete: no AI, multilingual interface or persisted reminders are claimed.

Independent Astra source review identified impossible-date validation, removed-control focus recovery and session-retention wording; all three were corrected. Automated browser review remains pending.

Browser follow-up: Chromium and WebKit automated synthetic journeys verified keyboard activation, deletion focus restoration, JSON export contents, deletion, no sentinel in requests, empty browser storage and zero axe violations. See the M3 CSV evidence for engine versions and Firefox environment failure. PR #18 API and web CI checks passed on 9ac2bea.

The finder explains each result using its maintained source record. A citation must match both a registered ID and its exact source URL. Unknown IDs and mismatched URLs are rejected. Dates outside the review window suppress the descriptive explanation and prompt readers to confirm details at the source. The explanation runs locally and uses fixed copy and registry data; there is no model call, external text processing or eligibility assessment.
