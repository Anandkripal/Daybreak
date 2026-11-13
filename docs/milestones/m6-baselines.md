# Retrospective baseline evaluation

After running the F5 ingestion, execute `python -m daybreak_api.evaluation` from `apps/api`. It reports one-month-ahead naive (last month) and seasonal naive (same month last year) errors over the final 12 available months. Each prediction uses only earlier observations in period order. MAE and RMSE are in percentage points, not percentages, and the script refuses missing or unordered months and insufficient history. This is a rolling one-step evaluation: once an actual month has occurred it can inform the next prediction.

The selected F5 series ends in 2020 in the documented retrieval. This is retrospective method evidence, not a present-day prediction or financial advice. Latest revised data may not have been available at each historic forecast origin; this evaluation does not establish a real-time backtest. No confidence intervals, ML candidate, model selection, anomaly detection or SHAP has been implemented. M6 remains open.
