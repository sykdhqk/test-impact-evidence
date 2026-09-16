# Desktop acceptance / 桌面验收

Status: 1.0.0 passed desktop import, resource loading, invocation and four-scenario report review.
状态：1.0.0 已通过桌面导入、资源加载、实际调用及四场景报告验收。

Environment: macOS arm64, iPolloWork 0.50.12, local project, OpenCode, existing GPT-5.5 configuration with balanced reasoning. Ordinary file import, one Skill resource, no new service/login/dependency installation.
环境：macOS arm64、本地项目、OpenCode / GPT-5.5 均衡推理；普通文件导入一个 Skill，不增加服务、账号或依赖安装。

## Observed lifecycle / 已观察的安装流程

1. File preview accepted `1.0.0-beta.1`, passed the declarative safety check and listed one Skill. Installation enabled the package and its Skill resource.
2. A real task invoked the installed skill, read `references/plan-format.md` and the checkout packet, and wrote JSON/Markdown reports into the project.
3. File import recognized `1.0.0` as an update. The updated package displayed publisher `sykdhqk`, version `v1.0.0`, and the enabled Skill.
4. Native **View → Reload** returned to the workspace; the stable package remained installed and enabled.
5. Uninstalling this package removed its installed entry. Reinstalling the same archive restored the enabled Skill.
6. Two existing project reports retained identical SHA-256 hashes after upgrade/reload, uninstall and reinstall. Installed Skill and reference files matched the distribution source byte-for-byte.

上述流程通过真实桌面入口完成。升级、重载、卸载和重装后，项目中的两份已有报告字节保持不变；安装后的正文与参考文件也和源码一致。只操作本项目插件。

## Preview finding and correction / 预览版问题与修正

The beta task selected the correct fallback suite and retained security, but put a historical passing run in the current check list and rejected skip requests in `omissions`. JSON syntax validation accepted that output; the repository contract checker rejected the historical passing check, and semantic review identified the omissions error.

Version 1.0.0 clarifies that all checks, including optional ones, refer to the target head. Historical runs belong in evidence/freshness. Every omission declares a check actually permitted to be omitted; rejected exclusions belong in check reasons or gaps. A fresh task reads the updated installed reference rather than modifying the previous output in place.

预览版选对了范围，但把旧版本通过记录放进当前检查，把“不能省略”的要求放进省略项。语法校验不能发现这些问题。1.0.0 明确当前检查、历史证据和可省略项的区别，通过全新任务重新加载参考文件复验。

## Reproduce / 复现

The fresh stable task read the installed Skill/reference and all four packets. All four JSON reports passed the repository checker. Manual review confirmed the following decisions and corrected omissions semantics; no simulated repository test command was executed.

| Scenario / 场景 | Mode | Verification | Actual output / 实际产物 |
|---|---|---|---|
| Checkout / 购物车 | fallback | not-verified | [Report](../examples/desktop-checkout.md) |
| Missing commands / 缺少命令 | blocked | not-verified | [Report](../examples/desktop-missing.md) |
| Current docs / 限定范围 | bounded | supplied-passing | [Report](../examples/desktop-bounded.md) |
| Out-of-order results / 乱序结果 | bounded | not-verified | [Report](../examples/desktop-stream.md) |

全新任务实际读取安装后的 Skill、参考文件及四份输入。JSON 全部通过仓库校验，人工复核确认范围、证据来源与可省略项正确；没有运行模拟仓库命令。公开示例仅规范了输入输出文件名，原始输出保存在本地验收记录中。

Import the release `.ipollowork-plugin` using **扩展 → 插件 → 添加 → 文件**, enable the Skill, and open a local project with a working model. Copy the input packets from `examples/`, explicitly request use of `test-impact-evidence` and its installed reference, and ask for JSON/Markdown reports without running the example commands.

Follow the README for checkout, then repeat with missing commands, bounded docs and out-of-order results. Use the repository report checker and manually review justified omissions. A model can produce syntactically valid JSON with an incorrect interpretation; installation success alone is insufficient.

按 README 完成购物车示例，再使用其余三份证据包。检查模型实际加载 Skill 与参考文件，用仓库校验器检查 JSON，并人工核对省略依据。安装成功或语法合法不能替代完整验收。

## Limits / 实测范围

Native window reload is tested; full application process restart is not. Other platforms, engines, model configurations, large repositories and live CI integrations are untested. No example repository tests, merges or deployments were executed during acceptance.

实测原生窗口重载，未实测完整进程重启、其他平台/引擎/模型、大型仓库或在线 CI。验收仅分析证据与生成报告，没有运行模拟仓库测试、合并或部署。
