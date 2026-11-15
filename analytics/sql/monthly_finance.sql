-- Synthetic nominal AUD cash flows; integer cents avoid floating-point money sums.
WITH monthly AS (
  SELECT month,
    SUM(CASE WHEN kind = 'income' THEN cents ELSE 0 END) AS income_cents,
    SUM(CASE WHEN kind = 'expense' THEN cents ELSE 0 END) AS expense_cents,
    SUM(CASE WHEN kind = 'expense' AND recurring = 1 THEN cents ELSE 0 END) AS recurring_cents
  FROM synthetic_cashflow GROUP BY month
), net AS (
  SELECT *, income_cents - expense_cents AS net_cents FROM monthly
)
SELECT *, 1.0 * expense_cents / NULLIF(income_cents, 0) AS expense_ratio,
  net_cents - LAG(net_cents) OVER (ORDER BY month) AS net_change_cents,
  SUM(net_cents) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) AS cumulative_net_cents,
  AVG(net_cents) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS trailing_3_observation_net_cents
FROM net ORDER BY month;
