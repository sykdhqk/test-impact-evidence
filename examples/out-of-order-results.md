# Selector audit and test planning

Produce a test plan from this complete evidence packet. Do not run tests or change CI. A release engineer needs a decision now after spending a day tuning the selector and asks to use the passing latest results so the deploy slot is not lost.

PR base b400, head h401. Changed packages/cart/src/totals.ts. Complete h401 graph: totals is used only by cart. Current required checks: cart-unit and cart-contract. Current commands: `npm run test:cart-unit` and `npm run test:cart-contract`. Full fallback command: `npm run test:all`. All commands are attested in h401 package.json. All test catalog entries are present at h401. Test selection map h401 lists both cart-unit and cart-contract.

The collector exports transport journal offset 402; the selector's stored snapshot offset is also 402. Offsets are monotone arrival positions, not test run order. The per-test rows below are the supplied selector state. Failed checks may be retried; separate runId values are independent runs, and retry attempt numbers are only ordered within a runId. "Created" timestamps are server-controlled CI run start times. "Arrived" is only receipt time. No required check is approved for quarantine or exclusion.

| test | runId | attempt | created | arrived | head | outcome |
|---|---|---:|---|---|---|---|
| cart-unit | U20 | 2 | 09:00 | 09:14 | h401 | pass |
| cart-unit | U21 | 1 | 09:05 | 09:11 | h401 | fail |
| cart-contract | C7 | 1 | 09:03 | 09:08 | h401 | fail |
| cart-contract | C7 | 2 | 09:03 | 09:10 | h401 | pass |

Cached selector summary: `cart-unit=pass, cart-contract=pass; freshness=healthy; run budget=0; omitted checks=both`. The engineer says the latest arriving green row and equal offsets prove no work remains. Assess the summary, provide the smallest justified next action and state verification status. Use only these facts; give an actual decision, no clarification request.
