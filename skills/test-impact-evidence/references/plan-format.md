# Plan contract, version 1

Use this contract for a small reviewable report. The JSON is a handoff format, not a command runner or CI configuration. The companion Markdown explains the same conclusions in the user's language. Do not include credentials, private CI URLs or raw logs containing secrets.

## Inputs to collect

| Evidence | Record | Why it changes the plan |
|---|---|---|
| Change identity | base, head, dirty working-tree state, complete diff scope | Results at another state do not verify this state. |
| Changed paths | added/modified/deleted paths, old and new rename paths | Deleted and renamed interfaces can affect existing consumers. |
| Execution configuration | current manifest/workflow and exact command | An old README is insufficient to assert that a command exists now. |
| Inventory and dependency evidence | revision, included scope, completeness, consumer edges | Empty matches mean unknown when the inventory is incomplete. |
| Selection map | collected revision and a complete bridge if different from head | Include new or changed tests absent from the original map. |
| Selector stream | collector counters, committed and selected offsets, capture consistency | Counts and different offset namespaces are not interchangeable. |
| Test results | test, head/state, run ID, attempt, authoritative order, result and origin | Receipt time is not execution order; retries are scoped to a run. |
| Required checks | current CI rule/workflow, quarantine approval if relevant | Impact selection must not silently remove a required check. |

For user-supplied excerpts, use identifiers such as `checkout-change.md#selection-map`. For repository reads, use a relative path and line or JSON pointer plus its revision. Clearly identify supplied assumptions. Never manufacture hashes, line numbers, timestamps or dependency edges. For a snapshot without Git history, use the supplied snapshot ID and leave unknown revision fields null.

## JSON shape

All top-level fields below are required. Use empty arrays when there are no entries. Field descriptions are not literal output values.

```json
{
  "schemaVersion": 1,
  "base": "b100",
  "head": "h101",
  "workingTree": "unknown",
  "mode": "fallback",
  "verification": "not-verified",
  "changedPaths": [],
  "evidence": [],
  "freshness": [],
  "checks": [],
  "omissions": [],
  "gaps": [],
  "nextActions": []
}
```

- `base`, `head`: supplied/resolved identifiers, or null.
- `workingTree`: `clean`, `dirty`, `snapshot`, or `unknown`. Use `snapshot` for an exported input packet; it does not attest the live checkout.
- `mode`: `bounded` when supported scope allows narrowing; `fallback` when broader validation is needed and its commands are known; `blocked` when missing configuration prevents a runnable plan.
- `verification`: `not-verified`, `supplied-passing`, or `executed-passing`. The latter two require current-state evidence covering all required checks. Never equate them with merge or deployment approval. If any required check fails or is pending, use `not-verified` and describe it in `checks`.
- `changedPaths`: objects `{ "status": "A|M|D|R|unknown", "path": "...", "previousPath": null }`; `previousPath` is required and non-null for a rename. When a packet says only "changed" without establishing the operation, use `unknown` instead of assuming `M`; explain whether that uncertainty affects scope.
- `evidence`: objects `{ "id": "E1", "origin": "supplied|inspected|executed", "source": "...", "revision": null, "summary": "..." }`. `executed` means actually run in this task, not supplied by someone else. Cite these IDs in the arrays below. Inspecting a log does not make its test execution yours.
- `freshness`: objects `{ "subject": "selector", "status": "current|stale|unknown|not-needed", "reason": "...", "evidenceIds": ["E1"] }`. `not-needed` is appropriate when no selector-dependent claim is made.
- `checks`: objects `{ "id": "cart-suite", "scope": "...", "command": null, "required": true, "status": "planned|blocked|supplied-pass|supplied-fail|executed-pass|executed-fail", "reason": "...", "evidenceIds": ["E1"] }`. This list is exclusively about the target head/state, including optional checks. Put historical runs in `evidence` and mark their age in `freshness`, never in `checks`. Every passing check must cite matching-head evidence with the stated origin. Null command means the command is not established or the check is run through CI. Explain how to obtain/trigger it. A known command should include the working directory in `scope` or `reason` when needed.
- `omissions`: objects `{ "scope": "...", "reason": "...", "evidenceIds": ["E1"] }`. Each entry declares a check or redundant invocation that this plan actually allows the user to omit. Rejected requests to skip checks belong in `gaps` or the relevant check's reason, never here. Use `[]` when no omission is justified. For example, if security must run, "skipping security is not allowed" is NOT an omission entry; security stays in `checks`. Omitting a redundant cart invocation already covered by a full-suite command is a valid entry if that inclusion is evidenced.
- `gaps`, `nextActions`: arrays of nonempty strings. State what would resolve each blocking gap. Do not repeatedly request already supplied information.

`mode` concerns the plan, while `verification` concerns actual results: a bounded plan can still be unverified. A full fallback command includes its sub-suites; do not require redundant runs merely to make the report longer. Include separate required checks not covered by that command.

## Selection examples

- Map at base, new test at head, selector behind committed journal: broader known command plus required checks; mark old passing logs as historical, not current verification.
- Deleted shared module, root compiler configuration changed, no current scripts: blocked executable plan; identify all supported consumers and request current configuration. Do not recommend `npm test` solely because an old README mentions it.
- Complete head-specific dependency and inventory evidence, no shared changes, all required package checks have head-specific supplied passing logs: bounded, supplied-passing. Do not require the full monorepo suite without another reason.
- U20 attempt 2 arrives after U21 attempt 1, but U21 started later and failed: the old green arrival does not supersede the newer failure. A passing retry of C7 within the same run can supersede C7's earlier failed attempt. Equal journal offsets establish consumption, not correct result ordering.

## Markdown companion

Write a short conclusion, change identity, scope and evidence table, exact known commands, justified omissions, unresolved inputs and next actions. Mark proposed commands as not run. Do not claim universal completeness, estimated time savings or compatibility not demonstrated by the evidence. Link to the JSON output and include the same verification status.

## Host invocation

The host model needs access to this installed reference and the supplied inputs. If it cannot read the reference or write files, say so and provide the report inline without claiming that files exist. No external login or added service is needed. Running project tests may require that project's dependencies and permission; the Skill itself installs none.
