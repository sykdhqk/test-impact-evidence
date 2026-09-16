# Local validation / 本地验证

These checks cover the 1.0.0 source and packages. Actual host results are recorded separately in [desktop acceptance](desktop-acceptance.md).
以下结果覆盖 1.0.0 源码和安装包，真实宿主结果另见桌面验收记录。

## Automated checks / 自动检查

Environment: Node.js 22.22.2, macOS arm64, system zip/unzip. `npm test`: 12 passing checks.

- Complete Skill and reference are present in both installation formats, and archive contents match source bytes.
- Repeated builds produce identical bytes.
- Symbolic links are rejected; ordinary-import manifest resources request no privileged capability.
- Reports reject historical passing evidence presented as current, planned checks presented as passing, supplied logs attributed to local execution, invalid evidence links and missing rename sources.
- Blocked plans preserve unknown commands; unspecified change operations can remain `unknown`.

安装内容、重复构建字节一致性和符号链接拒绝检查通过；报告校验覆盖旧结果冒充当前通过、计划冒充执行、证据来源混淆、无效引用、重命名旧路径缺失，以及未知命令/变更类型。

The upstream iPolloWork schemaVersion 2 strict validator and the Skill frontmatter validator accepted the package. Compatibility records the tested iPolloWork version 0.50.12. The schema validator was checked using iPolloWork types from commit `0aaa843a91cc4f67c1a673064b36305a2076ea6f`.

## Independent application scenarios / 独立应用场景

| Input | Observed decision | 观察结果 |
|---|---|---|
| Old map, added test, lagging selector | Fallback suite and required security; not verified | 扩大范围，保留安全检查，不采信旧提交通过记录 |
| Deleted shared API, rename, root configuration, absent scripts | Blocked runnable plan; retain consumers and unknown commands | 补齐当前脚本，保留 billing 等使用方，不能编造命令 |
| Complete current docs evidence and supplied required pass | Bounded scope, supplied-passing | 可限定范围，明确通过日志由外部提供 |
| Late old success, newer failure, passing retry in another check | Retry cart-unit; reuse contract pass; not verified | 区分到达顺序、运行顺序和同次运行的重试 |

A baseline without this Skill already reached correct scope decisions in these four cases. We do not claim an accuracy improvement over that baseline. The Skill adds a reusable input/evidence workflow and a consistent portable JSON/Markdown handoff. A separate evaluator loaded the Skill and its reference, produced four reports and passed them through the report checker. The synthetic commands were not executed.

未加载 Skill 的基线也能对这四个场景作出正确范围判断，因此不宣称判断准确率提升。Skill 提供可复用的证据流程及统一交接格式。另一独立评估加载技能与参考文件，生成四份报告并通过格式检查；没有执行模拟输入中的测试命令。

The first stream-case evaluation exposed a contract gap: a path described only as “changed” forced an inferred `M` operation. A failing regression test reproduced the inability to represent uncertainty. The contract and checker now accept `unknown`; the regression test passes. The reference instructs the model to preserve that uncertainty and assess whether it changes scope.

首次乱序结果场景暴露了格式缺口：“有变更”未说明操作类型，却被迫推测为 `M`。已用失败回归测试复现，增加 `unknown` 表达并使测试通过，同时要求模型说明该未知是否影响范围。

## Reproduce / 复现

```sh
npm test
npm run package
node scripts/validate-report.mjs examples/expected-plan.json
```

Use the four Markdown input packets in `examples/` for model evaluation. Assess decisions and evidence attribution, not wording. The report checker validates only structure and selected consistency rules; it cannot establish the authenticity or completeness of repository/CI evidence.

使用 `examples/` 中四份 Markdown 证据包复测。比较决策和来源归属，无需逐字相同；格式校验器不能证明仓库或 CI 证据真实完整。

## Not yet tested / 尚未验证

- Full application process restart (native window reload, upgrade, uninstall and reinstall were tested).
- Other operating systems, engines, models, very large repositories and real CI-provider integrations.
- Any regression coverage or performance improvement claim.

尚未验证完整应用进程重启、其他系统/引擎/模型、大型仓库或实际 CI 连接，也没有声称回归覆盖率或性能提升。
