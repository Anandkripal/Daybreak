# Process health contract v1

`GET /health` returns HTTP 200 and JSON `{ "status": "ok" }` when the API process serves requests. It does not assert database readiness, external service availability or user eligibility. No input or personal information is required. The web client must tolerate timeouts, network failures and invalid responses.
