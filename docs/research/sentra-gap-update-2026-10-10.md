# Sentra 缺口补录 v0.6

2026-10-10 已更新本地规范数据、SDK 与网站构建产物。新增 **38 条形态记录 / 28 个产品**，总计 **279 条记录 / 185 个产品**。这是原调查中 30 个注册 ID 的产品目录映射，不代表原先 38 个注册项已全部解决，也不声明 Sentra 检测功能完全对齐。

- 26 个独立产品、2 个历史产品（iFlow CLI、Roo Code）；QoderWake 和 TRAE 插件补入已有产品族。
- Coder、Marvis、WorkBuddy AI、Moxby、Terramind仍待身份核验；Sentra自身、VS Code宿主、MCPJam不作为独立Agent新增。
- Mux使用现名Xum，保留旧名；Crush标为FSL-1.1-MIT源码可见；Tabnine CLI提示维护模式和2026-12-31后的弃用计划。
- 新增9条版本形态级许可证元信息和6条官方商业服务元信息；商业服务与源码许可独立维护。
- 34条新增记录尚无可靠SVG；22条尚未充分确认操作系统支持，保持空值并在evidence说明。未安装、运行或登录第三方产品。

验证完成：

- 规范数据与来源/集合/商业/许可校验；原241条记录逐字段保持不变，主schema不变。
- 核心、React和网站测试全部通过；新增产品关联、旧名检索、许可证边界与历史状态提示回归通过。
- npm tarball与本地Git依赖安装，ESM/CJS、TypeScript/React、SVG导出验证通过。打包验证采用临时npm缓存解决本机默认缓存权限问题。
- 网站构建与原数据/SVG/许可文件一致性、CSV/ZIP导出验证通过。ZIP为agent-atlas-v0.6.zip。

实际新增ID、注册ID映射、暂缓形态与空值清单见[结构化清单](sentra-gap-update-2026-10-10.json)；来源调查见[38项调查](sentra-agent-gaps-2026-10-10.md)。
