# Release, health checks and rollback

Run this procedure on a staging host before releasing. Use Python 3.12, Node.js 24 and PostgreSQL. Build and keep immutable copies of the previous and candidate Git revisions and their installed dependencies. Use a dedicated database. Keep the database URL in the host secret store or service environment, out of build artifacts and logs. Use a separate migration role and limit the API runtime role to connecting to the database for the current readiness check. Keep PostgreSQL and the API on a private network segment.

1. From the candidate's `apps/web`, run `npm ci`, then `npm run build`. From `apps/api`, install `requirements.txt` into the candidate's virtual environment.
2. Back up the candidate database using `pg_dump --format=custom --file=daybreak.dump` with the PostgreSQL connection configured privately. Verify that `pg_restore --list daybreak.dump` succeeds. Rehearse restoration with `pg_restore --exit-on-error --no-owner --dbname=daybreak_restore daybreak.dump` into a new empty database before relying on it. Restrict and expire backup access separately from application access.
3. With the migration role configured via `DATABASE_URL`, run `alembic current` and `alembic upgrade head` from `apps/api`. Then start the API with its runtime database role using `uvicorn daybreak_api.main:app --host 127.0.0.1 --port 8000`. Start the production web app with `npm run start -- --hostname 127.0.0.1 --port 3000`. On a hosting service, bind within the private service network as required by the platform.
4. Expose the web service through an HTTPS reverse proxy. Limit public routing to the web app and keep the API, its OpenAPI docs and the database internal. Size the services from staging measurements and configure a budget alert before enabling billable resources. Disable request-body logging and redact credentials. Configure alerts for sustained increases in 5xx responses and readiness failures.
5. Run the smoke checks below and the browser regression in `apps/web/README.md` before routing traffic to the candidate. Monitor the same checks after switching traffic.

| Check | Expected result |
| --- | --- |
| Web `GET /health` | 200 with `{"status":"ok"}` and `Cache-Control: no-store` |
| Web `GET /`, `/budget`, `/transactions` | 200 and the expected page heading |
| API `GET /health` and `/ready` | 200 with `{"status":"ok"}` |
| API `GET /ready` after stopping the database **in staging** | 503. The process health endpoints and public help page still respond. |
| API readiness after restoring the database | 200 |
| Web response headers | Referrers suppressed, framing blocked, content types respected |

If any check fails, keep traffic on the prior release or switch it back. Restart the previous known-good web and API builds and rerun the smoke checks. Keep a forward-compatible database in place when the prior release supports the schema. If the previous release requires the old schema, restore the verified backup into a separate database and smoke test the previous API against it before switching traffic. Reconcile any changes since the backup before restoring traffic. Preserve the failed database for diagnosis. Avoid destructive downgrades in place.

The contact and CSV flows store their inputs in page memory. An explicit download creates a copy on the user's device. The web app suppresses referrer headers and prevents framing. The policy does not restrict scripts, so script injection remains a release risk to review if any future feature renders external content.

Deployment credentials, managed infrastructure, TLS termination and production alerting are environment-specific. This procedure is a release plan and local rehearsal record. It does not establish production readiness or WCAG conformance.

## Local rehearsal

The release rehearsal used a disposable UTF-8 PostgreSQL cluster bound to loopback, the production Next.js build and the API process. Web health, API readiness and all three public routes returned 200. Each public route sent the expected referrer, content-type and frame restrictions. Chromium passed the synthetic browser regression. Stopping PostgreSQL returned 503 from API readiness while the API liveness endpoint and public help page still returned 200. Restarting PostgreSQL restored readiness. A custom-format dump restored successfully into a separate empty database and contained the two expected synthetic seed rows. Switching production traffic to a previous build remains untested.

The enhanced regression passed in Chromium and WebKit with source citation checks and 640px and 320px reflow checks on all three routes. These viewport widths approximate the available layout width at 200% and 400% on a 1280px window. Firefox could not launch because its profile folder was unavailable. Manual zoom and assistive-technology verification remain open.
