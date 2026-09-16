# 测试影响证据（Test Impact Evidence）

[English](README.md) · MIT · Agent Skill

把 AI 辅助生成的代码变更整理成可核查的测试计划。这个 Skill 关联变更文件、测试映射、依赖证据和 CI 结果，输出 JSON 交接记录及易读的 Markdown 说明。

**1.0.0 支持在 [iPolloWork](https://github.com/Devin-AXIS/iPolloWork) 中使用。** 已在 iPolloWork 0.50.12 / macOS arm64 / OpenCode / GPT-5.5 中验证文件导入、实际加载 Skill 与参考文件、四种报告场景、升级、窗口重载和重装。详见[桌面验收记录](docs/desktop-acceptance.md)。

## 适合谁使用

使用 Claude Code 等编程代理的开发者常常已经有代码和部分测试结果，但仍需确认哪些检查覆盖当前变更。审查者需要知道某个测试为什么被选择或省略；CI 维护者需要区分真正及时的测试选择状态与看起来正常的旧快照。

可以分析 PR、本地变更快照或导出的 CI 证据。典型场景包括：旧映射漏掉新测试；已删除模块仍被其他包引用；迟到的旧结果误导了缓存摘要。

## 核心产物

- `test-impact-plan.json`：变更标识、时效判断、建议检查、合理省略项、证据引用和后续行动。
- `test-impact-plan.md`：便于代码审查和交接的同一份结论。
- 明确区分 **bounded（限定范围）**、**fallback（扩大范围）**、**blocked（缺少信息）**，以及他人提供的通过日志和本任务实际执行的测试。

Skill 会保留必需检查。证据完整时可推荐小范围包测试；无法缩小范围时推荐仓库已有的更完整命令。未知命令保持未知。它本身不会修改 CI、执行测试、合并代码或部署。

## 输入和工作流程

提供 base/head 或快照标识、变更路径、当前包脚本和工作流、测试清单及依赖关系；有条件时附上测试映射元数据和 CI 日志。规划可以使用文本片段，也可以由具备文件权限的模型检查本地代码。导出日志时不要包含凭据。

1. 加载 Skill 和 `references/plan-format.md` 参考文件。
2. 确定变更范围，为每条事实记录来源及版本。
3. 检查映射范围、新增测试、选择器延迟和结果顺序。
4. 选择有依据的测试范围，保留必需检查并说明省略原因。
5. 导出两份报告。只有在已有用户授权范围内才执行建议测试，再根据实际结果更新记录。

当前映射不能替代必需 CI 检查；旧提交通过不能验证新提交；较早运行的成功结果即使晚到，也不能覆盖较新的失败结果。

## 在 iPolloWork 中安装和使用

前置条件：iPollo 桌面软件、本地项目，以及已经配置好、能读取项目文件和技能的模型/引擎。Skill 不需要额外账号、MCP 服务或安装依赖；模型调用使用现有宿主配置。

1. 从 [Releases](https://github.com/sykdhqk/test-impact-evidence/releases) 获取 `test-impact-evidence-1.0.0.ipollowork-plugin`，或按下文构建。选择安装包，不要把源码 ZIP 当作安装包。
2. 打开 **扩展 → 插件 → 添加 → 文件**，选择安装包，核对名称、发布者 `sykdhqk`、版本及一个 Skill 资源。英文界面对应 **Extensions → Plugins → Add → File**。
3. 安装后确认技能启用，选择本地项目，按提示重新加载。
4. 把 `examples/checkout-change.md` 放进项目，创建新任务并输入：

   > 使用 test-impact-evidence 技能，读取它的 plan-format 参考文件和 checkout-change.md。不要执行测试，在当前项目生成 test-impact-plan.json 和 test-impact-plan.md，用中文说明选择范围、证据来源和下一步。

5. 检查任务是否实际加载了安装后的 Skill 和参考文件，再检查生成的两份报告。插件列表中有条目不等于已经调用成功。
6. 在项目目录保存或导出报告。报告是项目资料，与安装后的技能文件分开保存。

英文调用示例：

> Use test-impact-evidence and its plan-format reference to analyze checkout-change.md. Do not run tests. Write test-impact-plan.json and test-impact-plan.md in this project. Distinguish supplied logs from execution in this task.

也可使用文件夹导入：解压 `test-impact-evidence-<版本>-skill.zip`，在本地项目技能页选择 **导入本地 Skill / Import local Skill**，选中直接包含 `SKILL.md` 的 `test-impact-evidence` 文件夹。不要选 ZIP、单独 Markdown 或整个源码仓库。建议选一种安装方式，避免重复安装。

## 完整示例

`examples/checkout-change.md` 是模拟购物车变更：当前版本 `h101` 新增优惠券测试，现有映射仍在旧版本，选择器落后于已提交日志；提供的购物车通过日志属于 `b100`。

预期结果：

- `mode = fallback`，`verification = not-verified`。
- 选择当前存在的 `npm run test:all`，并保留必需的安全检查。
- 指出新增优惠券边界测试，以及选择器落后 20 条事件。
- 不用旧版通过结果证明 `h101` 已验证。
- 没有证据的省略项保持为空。可选的购物车快速检查不能替代完整回退测试。

`examples/expected-plan.json` 和 `.md` 是独立代理评估中生成的示例交接结果。它们是模拟规划产物，没有实际执行示例中的测试命令。模型措辞可以不同，但决策、来源标注和输出格式应一致。

iPollo 实际输出包括[购物车](examples/desktop-checkout.md)、[缺少命令](examples/desktop-missing.md)、[限定范围](examples/desktop-bounded.md)和[乱序结果](examples/desktop-stream.md)，均有配套 JSON。仅把本地输入输出文件名规范为仓库示例名。

## 构建和检查

仅开发打包需要 Node.js 22+，以及 PATH 中的 `zip`、`unzip`。无需 npm 依赖，也无需先执行安装命令。

```sh
npm test
npm run package
node scripts/validate-report.mjs examples/expected-plan.json
```

`dist/` 会生成安装包和完整 Skill ZIP。安装包包含根目录的 `ipollowork.plugin.json` 与整个声明的 Skill 文件夹，包括参考文件；不含可执行服务或凭据配置。报告校验器是仓库开发工具，不会被当作宿主工具安装。

打包会统一时间戳、文件权限及顺序，相同内容产生相同压缩包字节。某个版本公开发布后，修改安装内容应递增语义版本；保持插件 ID、发布者和 updateId 稳定。

源码 ZIP、`SHA256SUMS` 作为独立发布附件。下载后在附件所在目录运行 `shasum -a 256 -c SHA256SUMS` 检查文件身份；校验和不能替代运行验收。

## 常见问题和验证范围

**会自动连接 Claude Code 或 CI 吗？** 不会安装服务连接。可以分析它们导出的证据或可访问的代码。Topics 描述适用的开发流程，不代表厂商关联。

**为什么命令是 null？** 当前配置未能证实命令，或该项由 CI 平台执行。报告会说明如何补足信息，不会凭空编写命令。

**为什么不总是全量测试？** 完整、当前的证据可以支持限定范围；不完整依赖图、共享配置变化或过期选择器可能需要更大范围。

**安装后没有调用技能？** 核对已选项目和启用资源，重新加载或新建任务，明确指定 `test-impact-evidence` 并要求读取参考文件。不能访问时，模型应说明原因。

**JSON 校验通过就代表计划正确吗？** 校验器只检查结构、证据引用及部分状态/来源一致性，不能证实日志真伪、依赖完整性、未提交文件状态或省略依据，需要继续审查证据。

**报告校验失败怎么办？** 把校验错误交给模型，要求重新读取安装后的参考文件。历史结果放入 evidence/freshness，checks 只描述目标版本；omissions 表示真正允许省略的检查，不能放入被拒绝的跳过请求。重新生成后再次校验。

实际记录见[桌面验收](docs/desktop-acceptance.md)和[本地验证](docs/validation.md)。其他宿主版本、平台和引擎、完整应用进程重启及在线 CI 连接未验证。Skill 不保证覆盖全部回归，也不代替合并审批。

## 许可证

[MIT](LICENSE)。独立项目，不是 Anthropic 或 iPolloWork 官方产品。
