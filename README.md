# Test Impact Evidence

[简体中文](README.zh-CN.md) · MIT · Agent Skill

Turn an AI-assisted code change into a reviewable test plan. Test Impact Evidence connects changed files, test coverage maps, dependency evidence and CI results, then writes a JSON handoff and a readable Markdown explanation.

**Version 1.0.0 supports [iPolloWork](https://github.com/Devin-AXIS/iPolloWork).** File import, actual Skill/reference loading, four report scenarios, upgrade, window reload and reinstall were verified on iPolloWork 0.50.12 / macOS arm64 / OpenCode / GPT-5.5. See the [desktop acceptance record](docs/desktop-acceptance.md).

## Who it helps

Developers using Claude Code or other coding agents often have a patch and some test results, but still need to decide which checks cover the current change. Reviewers need to see why a suite was selected or omitted. CI maintainers need to distinguish a fresh selector snapshot from one that merely looks healthy.

Use this Skill for a pull request, a local change snapshot, or an exported CI evidence packet. It is useful when a new test is absent from an old map, a deleted module still has consumers, or a delayed result makes a cached summary misleading.

## What it produces

- `test-impact-plan.json`: change identity, freshness findings, proposed checks, justified omissions, evidence references and remaining actions.
- `test-impact-plan.md`: the same decision in a format suitable for a review handoff.
- A clear distinction between **bounded**, **fallback** and **blocked** plans, and between supplied passing logs and tests executed during the current task.

The Skill preserves required checks. It can recommend a small package suite when the evidence is complete, or a broader existing command when narrowing is unsupported. Missing commands remain unknown. It does not modify CI, run tests, merge code or deploy by itself.

## Inputs and workflow

Provide the base/head or snapshot IDs, changed paths, relevant current package scripts/workflows, test inventory and dependency evidence. Add selection-map metadata and CI logs when they are available. Text excerpts are enough for planning; a model with file access can inspect a checkout instead. Avoid including credentials in exported logs.

1. Load the Skill and its `references/plan-format.md` resource.
2. Identify the change and attribute each fact to a source and revision.
3. Check map scope, new tests, selector lag and result ordering.
4. Select supported scope, preserve required checks and explain any omission.
5. Export both reports. Run proposed tests only under the user's existing authorization, then update the report from actual results.

A current source map is useful evidence, not a substitute for required CI checks. A passing old-head log does not verify a new head. A late success from an older run must not erase a newer failed run.

## Install and use in iPolloWork

Prerequisites: the iPollo desktop app, a local project and an already configured model/engine that can read project files and installed skills. The Skill needs no new account, MCP server or package installation. Model usage uses your existing host configuration.

1. Obtain `test-impact-evidence-1.0.0.ipollowork-plugin` from [Releases](https://github.com/sykdhqk/test-impact-evidence/releases), or build it below. Use the installation archive, not the source ZIP.
2. Open **Extensions → Plugins → Add → File**, choose the archive and inspect the name, publisher `sykdhqk`, version and one Skill resource. In the Chinese UI these controls are **扩展 → 插件 → 添加 → 文件**.
3. Install, confirm that the Skill is enabled, select your local project, and reload as prompted.
4. Copy `examples/checkout-change.md` into that project. Start a new task with:

   > Use test-impact-evidence and its plan-format reference to analyze checkout-change.md. Do not run tests. Write test-impact-plan.json and test-impact-plan.md in this project. Distinguish supplied logs from execution in this task.

5. Confirm that the task actually loaded the installed Skill and reference file. Inspect both generated reports; a visible installed entry alone is not invocation evidence.
6. Keep or export the reports from your project directory. They are business output, separate from the installed Skill files.

For a Chinese task:

> 使用 test-impact-evidence 技能，读取它的 plan-format 参考文件和 checkout-change.md。不要执行测试，在当前项目生成 test-impact-plan.json 和 test-impact-plan.md，用中文说明选择范围、证据来源和下一步。

Alternative folder import: extract `test-impact-evidence-<version>-skill.zip`; in the local project's Skills page choose **Import local Skill / 导入本地 Skill**, then select the `test-impact-evidence` folder directly containing `SKILL.md`. Do not select the ZIP, one Markdown file, or the entire source repository. Prefer one installation method to avoid duplicates.

## Complete example

`examples/checkout-change.md` describes a synthetic cart change at `h101`, a new coupon test, an old map and a selector behind its committed journal. The supplied cart log belongs to `b100`.

Expected decisions:

- `mode = fallback`, `verification = not-verified`.
- Select the current `npm run test:all` command plus the required security check.
- Identify the added coupon boundary test and selector lag of 20 events.
- Do not use the old passing cart result as proof for `h101`.
- Keep unsupported omissions empty. An optional fast cart run does not replace the full fallback.

This repository's `examples/expected-plan.json` and `.md` show a sample handoff produced during independent agent evaluation. They are synthetic planning outputs; no example test command was executed. Different wording is fine when the decisions, attribution and report contract agree.

The actual iPollo outputs are [checkout](examples/desktop-checkout.md), [missing commands](examples/desktop-missing.md), [bounded docs](examples/desktop-bounded.md) and [out-of-order results](examples/desktop-stream.md), each with a JSON companion. Only local input/output filenames were normalized to the repository example names.

## Build and check

For development only: Node.js 22+, `zip` and `unzip` on PATH. No npm dependencies or installation step is needed.

```sh
npm test
npm run package
node scripts/validate-report.mjs examples/expected-plan.json
```

`dist/` receives the installation archive and complete Skill ZIP. The installation payload contains the root `ipollowork.plugin.json` and the entire declared Skill directory, including its reference. It contains no executable service or credential configuration. The report checker is a repository development utility, not a host-installed tool.

Packaging normalizes timestamps, file permissions and ordering. Identical payloads produce identical archive bytes. Once a version is published, change the semantic version before changing its payload. Keep the package ID, publisher and update ID stable.

Source ZIP and `SHA256SUMS` are separate release assets. After downloading, verify hashes with `shasum -a 256 -c SHA256SUMS` in the asset directory. A checksum verifies file identity, not runtime behavior.

## FAQ and validation scope

**Does this connect to Claude Code or CI?** No service connection is installed. It supports analysis of their exported evidence or an accessible checkout. The Topics describe the intended development workflow, not a vendor affiliation.

**Why is a command null?** Current configuration does not establish it, or it is a CI-managed check. The report explains how to resolve it instead of inventing a command.

**Why not always run everything?** Complete current evidence can support bounded checks. An incomplete graph, shared configuration change or stale selector can require wider scope.

**The Skill is installed but not used.** Confirm the selected project and enabled resource, reload/start a new task, explicitly name `test-impact-evidence`, and ask the model to read its reference. If access is unavailable, the model should report that limitation.

**Does the JSON checker prove the plan is correct?** It checks contract structure, evidence links and some status/provenance consistency. It cannot verify log authenticity, dependency completeness, dirty-tree identity or the truth of an omission. Review the evidence.

**The report fails validation.** Give the model the checker error and ask it to reread the installed reference. Keep historical results in evidence/freshness; only target-head checks belong in checks. An omission means a check actually permitted to be skipped, not a rejected request to skip one. Revalidate the regenerated report.

See [desktop acceptance](docs/desktop-acceptance.md) and [local validation](docs/validation.md) for observed results. Other host versions, platforms and engines, full application process restart and live CI integrations are untested. The Skill does not guarantee regression coverage or approval to merge.

## License

[MIT](LICENSE). Independent project; not an official Anthropic or iPolloWork product.
