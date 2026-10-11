# 2026-10-09 候选入库审查

本记录说明项目数据转换边界；完整逐字段 [Markdown 研究](./2026-10-09-batch1.md)和[研究 JSON](./2026-10-09-batch1.json)与规范项目数据分开保存，不用研究 Schema 替换 `data/schema.json`。所有来源核验日期为2026-10-09，未安装候选产品。

## 第一批已入库

- Coder Community：新增 `coder-community-web`，明确是 Community 自托管 Web 分发。原生 Agent loop 位于 [coderd/x/chatd](https://github.com/coder/coder/blob/main/coderd/x/chatd/ARCHITECTURE.md)，[AGPL 服务入口](https://github.com/coder/coder/blob/main/coderd/coderd.go)直接初始化该模块；[enterprise 目录](https://github.com/coder/coder/blob/main/LICENSE.enterprise)另受商业许可。Premium/AI Premium 留在证据中，管理 CLI/IDE 连接不虚构为独立 Agent。
- LingCode：新增 Mac IDE、CLI、Web、移动伴随和 Baby 桌面条目。Windows/Linux 完整 Mac IDE 未核实；移动端只读及远程控制。官网运营商与 App Store seller 不强行合并为同一法人。源码许可未知，不添加开源 sidecar。来源：[开发者页](https://lingcode.dev/developers.html)、[CLI](https://lingcode.dev/cli.html)、[Web](https://lingcode.dev/try.html)、[移动商店](https://apps.apple.com/us/app/lingcode/id6757243830)、[独立 Baby 产品](https://lingcode.dev/baby.html)。
- MonkeyCode：新增 SaaS Web、自托管 Web、Work 桌面、移动端，同一 product_id。仅相应公开源码 AGPL，不外推 SaaS 合同；Linux Work 为源码构建支持，未证明有 Linux 已发布安装包。来源：[官方仓库](https://github.com/chaitin/MonkeyCode)、[桌面源码](https://github.com/chaitin/MonkeyCode/blob/main/desktop/README.md)、[发行资产](https://github.com/chaitin/MonkeyCode/releases/tag/v26072801)。
- WorkBuddy AI：腾讯官方用语，为现有 WorkBuddy 的别名；保留 `workbuddy` 和 `workbuddy-cn`，新增 `workbuddy-mobile-cn`。中国桌面新增系统有各自限制，小程序/IM 已在既有条目中，不重复计算。来源：[腾讯官方命名](https://intl.cloud.tencent.com/document/product/1316/84487)、[移动端说明](https://www.workbuddy.cn/docs/workbuddyapp/Overview)。

## 第一批待审，未进入正式数据

### code-server

身份及 MIT 已确认，但它是浏览器 VS Code 编辑器；未核实内置端到端 AI Agent。与 Coder 为独立产品，不作为别名，不用 Coder Logo 冒充专属标识。来源：[官方区别 FAQ](https://coder.com/docs/code-server/FAQ)、[仓库](https://github.com/coder/code-server)、[MIT](https://github.com/coder/code-server/blob/main/LICENSE)。

### Marvis / MarvisX

[justaskmarvis](https://justaskmarvis.com/) / [emiliomartucci/marvis](https://github.com/emiliomartucci/marvis) 是 Agent 记忆/治理/工作管理配套产品；MarvisX 为企业商业层。它与 [腾讯 Marvis](https://marvis.qq.com/) 是同名异物，缺少原检测标识不能静默匹配。核心使用 [BUSL-1.1](https://github.com/emiliomartucci/marvis/blob/main/LICENSE)，当前为 source-available，未来转 Apache-2.0 不等于现在已开源。`marvis console` 是本地 Web GUI，不能称为已核实原生桌面安装包；付费 Cloud 档位仍 waitlist / No charge today，不宣称目前可购买。待身份标识和目录范围明确后再定。

## 去重与保留原则

保留全部241个既有稳定 ID，仅修改有新证据的相关条目。许可证按实际分发形态归属；会员层/模型额度不增加产品数；有名称相似性不等于同一产品。完整各批研究与映射已追加如下。

## 已有产品补形态

完整资料见 [研究 Markdown](./2026-10-09-existing-forms.md)与[研究 JSON](./2026-10-09-existing-forms.json)。新增 `trae-ide-extension`、`coze-desktop-cn`、`qingyan-desktop`，都沿用既有 product_id；没有增加独立产品。Kimi 本来已含 Windows/macOS GUI，只补 `kimi` 的 Work 模式别名与证据，不新建重复桌面条目，不修改四条 Kimi Code 形态。原目录不存在 MarsCode 条目，因此 TRAE 插件没有可复用的旧插件 ID；保留 Marketplace 的 `MarsCode.marscode-extension` 和历史品牌为消歧证据。中国版扣子桌面证据不外推国际版 Coze。

## 最终结果

- 全量研究：[Markdown](./2026-10-09-full-research.md) / [研究 JSON](./2026-10-09-full-research.json)：41条研究记录、99个研究变体
- 正式数据：295条形态、181个产品；新增54条形态、24个产品，只修改 Kimi / WorkBuddy 国际版 / WorkBuddy 中国版3条既有记录
- 所有241个原 ID 保留；两个项目 Schema 未改变。125个真实 SVG 文件；96条记录无 SVG，缺失不伪造
- [逐候选映射](./2026-10-09-catalog-mapping.json)覆盖41条记录；13条 review-only 均没有正式目录 ID

### 额外入库边界

- DeepSeek Harness 为预览应用，独立于聊天；Loomy iOS/小程序尚未发布不列平台；QoderWake CN 独立于 Qoder/QoderWork
- VS Code 只新增微软官方 Desktop Agent-capable IDE；不把 Code-OSS / vscode.dev / 既有 Copilot 重复入库
- AiderDesk 独立于 Aider，CLI 依赖 server 且 OS 未知；Tabnine CLI 独立于 Tabby
- Crush 的 Hyper、ForgeCode Services、Pochi 托管模型/门户属于可选服务，不新增重复 CLI 或假想完整 Agent 应用
- Pochi 包级保留所有权利与 CLI 根 Apache 许可严格拆分；Crush 当前 FSL，不提前标 MIT
- Neovate 已归档旧 Code Desktop 只留研究；当前 Desktop 核实 v0.1.2 Mac/Windows 安装包，VS Code extension 仅源码分发证据
- Reasonix 1.x 维护线与2.x开发线均有实际发布资产，按稳定/开发线和 GUI/CLI/本地 Web 区分；IDE 集成依赖1.x。开发线发行 non-prerelease 不消除 README 的 active-development 定位
- Zenflow Code/Work 同一安装包只建一个 GUI；Zencoder 仍为独立 IDE 产品，共享订阅不等于重命名
- Rovo Dev 当前可运行，界面显示已宣布的迁移/退役计划；没有编造 EOL 日期，12月3日 Code Reviewer 计费改变不当停服日

### 第二批待审或历史，未正式入库

- **Bob**：身份未决；至少 IBM Bob 与 Bob 翻译/OCR 两个独立且相关的最终用户 AI 产品。只有 Bob 名字不足以锁定厂商。保留 canonical_name/vendor/official_url 为 null，等待原始候选 URL、厂商或截图。variants 此处是清楚标注的互斥身份候选，不是同一产品形态，工程导入时不得自动建产品或合并别名。两个候选均有第一方活动与功能证据，不应用搜索排名选择其一。
- **CodeMaker**：独立编码辅助产品；不是 Tabby 或其他编辑器的别名。身份和客户端许可证已确认，适合目录范围，但当前服务运营/定价未确认：codemaker.ai 与 beta.codemaker.ai 的本次直接请求均返回 502，第一方文档与源码仍可检索。502 或旧提交本身不证明停止运营，也不应据第三方报价标付费/免费。暂标 needs-review/unknown，保留已证实的三个 MIT 客户端和独立托管服务；没有证据认定整个平台开源。
- **CodeStudio**：身份未决；Syncfusion Code Studio、Zoho Analytics Code Studio 等同名形态不能自动合并。Syncfusion 是已确认存在且符合 AI IDE 范围的候选，但仅 CodeStudio 一个名字无法排除 Zoho 等同名产品。canonical_name/vendor/official_url 留 null；需要原始 URL 或厂商后再决定收录。variants 为消歧资料而非同一产品的多个版本，不能一次全部导入。若确认 Syncfusion，可用候选 A 单独建产品，产品许可证/源码状态仍保留未知。
- **Cortex**：仅有 Cortex 裸名不足以在多家互不相关产品中选定身份。保留 canonical_name/vendor/official_url/license/pricing/svg 为 null；要求补充候选官方 URL 或发布者后再处理，不把多个同名项目当作一个产品的 variants。这里唯一 variant 是消歧证据占位，不能发布为实际产品。 去重范围说明：未对现有仓库逐项去重；仅按本候选核实身份及官方形态。
- **Firebender**：产品身份及付费插件形态已核实，但官方首页/博客目前均显示2026-10-31结束服务的公告，建议先 needs-review 或历史/即将停服区，并在发布时显著显示日期，不能无警告新增为长期活跃推荐。当前核验日2026-10-09尚未到终止日，因此标准状态记为 active，并在本说明保留计划终止日期。未核实独立地区版、应用源码仓库或官方SVG。 去重范围说明：未对现有仓库逐项去重；仅按本候选核实身份及官方形态。 证据限制：停服日期仅由官方页面搜索索引/摘要交叉印证；本轮没有完整读取终止公告，不能把它表述为已通读公告全文。
- **iFlow CLI**：不能作为仍活跃的免费 Agent 新增。建议进入 discontinued/历史目录或暂列 needs-review；若目录仅收活跃产品应排除。官方公告证明历史个人服务完全免费，但关闭后的当前总使用成本取决于自定义模型提供商，所以 commercial_status 仍留 unknown；不把心流AI助手会员或 Qoder 定价套给 CLI。 去重范围说明：未对现有仓库逐项去重；仅按本候选核实身份及官方形态。
- **MCPJam**：独立产品；不是 MCP 协议本身，也不是仅一个 SDK。身份与分发已核实，但核心定位是 MCP 测试、调试、评估平台，建议单独开发者工具区或人工确认产品收录边界；不能直接当通用自主 Agent。更不能因 README 简写 Apache-2.0 忽略 EE 许可 carve-outs。
- **Mux**：候选名存在多个不相关产品；原候选缺 URL，不能自动指定厂商。必须取得原候选 URL/厂商后才能归一化。若目标是 coder/mux，应以 Xum 为当前名、Mux 为历史别名；若是 usemux.ai，则是 Joel Christner 的 MIT 多形态编码 Agent；usemux.com 又是另一套产品。mux.com 是视频基础设施，也不能误收为同一编码工具。以上 variants 是消歧证据，不是一个产品的合并发行版。
- **Roo**：产品关系：Roo 是 Roo Code 简称；Roo Cline 为历史旧名。源于 Cline，但不是 Cline 的别名；roocode.com 转向 Roomote 不足以把两个产品合并。 Roo Code 仅作历史/已停运审查记录，不应新增至活动产品目录；若已有 Roo Code 则补别名和生命周期并撤下活动推荐。已确认扩展 2026-05-15 停运/归档；Cloud/Router 的精确关停公告原页当前不可读，因此不额外声称其具体关停日期。开源归档仍可被分叉，不等于厂商继续支持。尚未核实当前托管服务价格或产品 SVG 之外的图标；未执行安装。
- **TerraMind**：产品关系：可明确识别为 terramind.com 的 Agent 应用家族；同名 IBM TerraMind 地球观测模型完全无关。Nucleus/Spaces 是该公司的具体产品，不是 Codex/Claude Code 的别名。 候选未提供原始规则 URL，TerraMind 可指应用家族或 IBM/ESA 地球观测模型，因此必须保留 needs-review，不能自动把检测候选映射为 terramind.com。以下 Nucleus / Spaces 等事实仅核实该官网的应用，不证明用户原候选身份；取得规则的具体身份依据后再决定是否纳入。Mac Intel 文案与 FAQ 存在不完整/不一致，保守只登记 Apple silicon。未核实仓库、原生移动 App、地区版本及网页专属价格；无安装测试。
- **TinyCloud**：产品关系：TinyCloud Labs 是基础设施/协议与 SDK，不是已证实的同名通用 Agent；tinycloud.io 是另一家数字产品工作室。不得混入 TinyClaw/TinyAgent 等近名产品。 目前可确定的 TinyCloud 是主权数据/私有计算基础设施及 SDK，未证明候选是可直接使用的端用户 AI Agent，因此留待审，不作为新增通用 Agent。源代码可见但 EGPL 有生产限制，明确 source-available 而非 open-source。候选原 URL、真正所指产品、托管价格和官方 SVG 未核实。若用户指 TinyChat/Listener，应作为新候选另审，不能静默改名。

完整 source、license、pricing、SVG 与不确定性仍在研究 JSON 中。候选建议与实施决定分开保存，未用“当前未读到”推断永久不存在或停止运营。

### Pochi 图标包装说明

本批两条 Pochi 记录的 `icon` 均留空，没有打包 Pochi SVG，也没有替代 Logo。[官方来源](https://raw.githubusercontent.com/TabbyML/pochi/main/packages/vscode/assets/icons/pochi-logo.svg)仍保留在完整研究和条目来源中；仅图标包装调整，产品、平台、许可和功能资料不变。
