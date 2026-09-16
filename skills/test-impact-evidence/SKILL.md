---
name: test-impact-evidence
description: Use when planning tests for AI-assisted code changes, reviewing selective CI results, or deciding whether an impact map and existing test evidence justify omitting broader checks.
---

# Test Impact Evidence

Produce a test plan whose scope and status can be traced to evidence. This skill needs supplied change records or read access to the repository; it does not require a CI connection. Follow the user's requested language.

Read [references/plan-format.md](references/plan-format.md) before producing the JSON and Markdown handoff. It defines the evidence fields and report contract. Use repository tools available in the host; do not assume a particular client API.

## Establish the evidence

Identify base, head, changed paths (including both rename endpoints and deletions), current test commands, test inventory, reverse dependencies and required checks. Attribute each fact to its file, revision or supplied log. Unknown values stay unknown. Do not infer commands from an old README or filename convention.

Check map revision, scope completeness, newly added tests and changes since collection. A map at base can be used only with a complete, documented bridge to head. A recent timestamp or `complete=true` alone is insufficient. Record collector and selector watermarks separately: equal received/applied counts do not prove the selector consumed the latest committed event. Missing telemetry matters when the recommendation relies on that selector; it does not invalidate independent complete repository evidence.

For asynchronous results, separate arrival order from run order. Compare attempts within the same run; do not rank unrelated runs by attempt number. A late old success cannot overwrite a newer failure. If authoritative order cannot be established, record uncertainty.

## Decide scope

Start with changed tests and affected packages, then include supported reverse dependencies. Inspect shared configuration, lockfiles, generated inputs, deleted APIs and renamed paths. Preserve required checks and configured quarantine policy. Do not create exclusions from a deadline, historical flakiness or a green stale summary.

Use a bounded plan when current, complete evidence supports it. Otherwise recommend the available broader suite, explaining exactly which gap prevents narrowing. If no current command is known, provide the needed scope and missing input; do not invent an executable command. An optional fast first pass does not replace the broader required validation.

## Deliver

Write `test-impact-plan.json` and `test-impact-plan.md` using the reference contract. Include reasons for selected and omitted checks, evidence origin, remaining gaps and next actions. Distinguish supplied logs from commands actually executed during this task. A proposed command is never a passing result.

Planning does not itself authorize running tests, changing CI, quarantining failures, merging or deploying. Follow the user's existing authorization for any execution. Reassess evidence when head or working-tree content changes; commit identity alone does not describe uncommitted changes.
