# Case A — test impact plan

**Decision:** use the known full suite and retain the separate required security job. **Mode:** `fallback`. **Verification:** `not-verified`. The requested quick merge answer is **no on this evidence**; no head-specific validation has passed.

Base `b100`, head `h101`; input is a supplied snapshot and does not attest the live checkout. Changes: modified `packages/cart/src/discount.ts`; added `packages/cart/test/coupon-boundary.test.ts`.

| Scope or evidence | Supplied basis | Consequence |
|---|---|---|
| Full available suite | E2: h101 package.json defines `test:all` | Run it to cover the supplied package test scope, including cart and the new boundary test. |
| Security | E3: separate required CI job | Retain it; a deadline or owner suggestion does not authorize omission. |
| Selection map | E4/E6: b100 map, new test absent, no complete bridge or dependency graph | It cannot justify selecting only discount.test.ts. |
| Selector | E5: received/applied 1200, snapshot 1180, committed 1200 | Collector equality does not cure selector lag. |
| Prior pass | E7: `npm run test:cart`, exit 0, at b100 | Historical only; it does not verify h101. |

Run from the repository root at h101:

```sh
npm run test:all
```

**Proposed, not run.** Also trigger the existing required security CI job. Its command is unknown; use its current configured workflow, obtaining trigger details if necessary. The exact known narrower command is `npm run test:cart`, but it is unnecessary as an additional run because `test:all` already includes its test glob.

Only that redundant cart invocation may be omitted. No required security check or individual test exclusion is justified.

To narrow later, obtain a complete head-specific map and dependency scope, or a documented complete bridge from b100, and bring the selector up to the committed journal. For the present fallback, collect h101 results for the suite and security and resolve failures. Reassess after head or working-tree changes. Supplied or future passes do not themselves authorize a merge.

Evidence origins and complete handoff: [test-impact-plan.json](expected-plan.json). All test evidence was supplied; this evaluation executed no tests.
