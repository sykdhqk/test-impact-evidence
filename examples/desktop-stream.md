# Out-of-order selector report

结论：当前计划 **bounded**，但验证状态为 **not-verified**。不能部署。已加载的 Skill 是 `test-impact-evidence`，并已读取参考 `references/plan-format.md`；本次没有执行示例测试命令。

JSON 报告：`desktop-stream.json`

## 变更身份

| 项目 | 值 |
|---|---|
| base | b400 |
| head | h401 |
| workingTree | snapshot |

## 范围与证据

| 证据 | 来源 | 结论 |
|---|---|---|
| E1-E2 | out-of-order-results.md#L5 | h401 完整图显示影响仅限 cart；必需检查为 cart-unit 和 cart-contract。 |
| E3 | out-of-order-results.md#L7 | 相等 offset 证明消费位置，不证明测试运行顺序。 |
| E4 | out-of-order-results.md#L9-L14 | cart-unit 的 U21 比 U20 晚创建且失败；旧 U20 pass 较晚到达不能覆盖。 |
| E5 | out-of-order-results.md#L9-L14 | cart-contract 同一 run C7 的 attempt 2 pass 可覆盖 attempt 1 fail。 |
| E6 | out-of-order-results.md#L16 | cached summary 将到达顺序误当运行顺序，因此结论不可靠。 |

## 已知命令（未运行）

- `npm run test:cart-unit`：当前必需检查，供应结果为失败；应作为最小下一步重跑/修复后重跑。
- `npm run test:cart-contract`：当前必需检查，供应结果为通过。
- `npm run test:all`：fallback 命令已知，但在完整 h401 证据下不是当前最小下一步。

## 合理省略

- `npm run test:all`：可以暂不运行，因为完整 h401 graph 和 map 将影响限定到 cart 的两个必需检查；当前真正阻塞的是 `cart-unit` failure。

## 未解决输入与下一步

- 阻塞：`cart-unit` 在 h401 最新独立 run 失败，且没有 quarantine 或排除批准。
- 下一步：不要部署；先修复或确认后重跑 `npm run test:cart-unit`。保留 `cart-contract` 的同 run 重试通过结论，除非 head 或配置变化。
