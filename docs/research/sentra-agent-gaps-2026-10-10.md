# Sentra 未匹配的 38 个注册项调查

核验日期：2026-10-10。本文保存补录前调查结论；后续 v0.6 已按结论新增 38 条形态记录，实际 ID 与暂缓项见 [补录清单](sentra-gap-update-2026-10-10.json)。资料核验不代表安装测试。

## 结论

此前的「缺少 38 个」指 88 个 Sentra 注册 ID 中，有 38 个未通过现有目录名称/别名匹配；它不是 38 个已确认的新产品。产品身份、产品形态和 Sentra 检测能力需要分别判断。

|处理建议|数量|
|---|---:|
|建议新增|26|
|补充已有产品形态|2|
|历史收录|2|
|待核实身份/形态|5|
|不作为独立 Agent 新增|3|

建议新增清单：DeepSeek Harness / dsh、LingCode、MonkeyCode、Loomy、AiderDesk、IBM Bob、CodeMaker AI、Syncfusion Code Studio、Command Code、Snowflake Cortex Code / CoCo CLI、Crush、Deep Agents Code / Deep Agents CLI、Firebender、ForgeCode、Jazz、Kode CLI、Xum（原 Mux）、Neovate Code、Ona（原 Gitpod）、Pochi、DeepSeek-Reasonix / Reasonix、Rovo Dev CLI、Tabnine CLI、TinyCloud、Zencoder、Zenflow Code（by Zencoder）。

## 核验基线与能力边界

- Sentra Core：`88a8132c698f09ee5c2ccab8d814c4e0ecf87429`；采用其 Cargo.toml 锁定的 sentra-lib revision `2cdefd26c0f5f1cebec0aeab33d0a9c84ae9558f`，不是另一份本地 sentra-lib 工作树。
- 当前目录：241 条形态记录、157 个 product_id。快照 SHA-256：`ec5a57cabd5d7107ddca062de12f3c750d18db174c11e3716d214b2d82cf5c59`。
- 本报告完整覆盖下面的 38 个 ID；剩余 50 个名称匹配项未在本报告逐项复审，名称匹配也不能证明全部区域/版本/界面形态已覆盖。
- 其中 27 个走 generic adapter。`src/agents/general/mod.rs` 的 asset_for_type 只提供 Meta 和 Skill；其他资源类型为空。另有通用会话适配，但不能据此推断 MCP、provider、进程行为或事件检测全部支持。
- `.vscode`、`.zencoder` 等目录并不唯一：宿主目录、共享目录和历史残留都可能导致身份误判。
- 官方页面/上游仓库用于产品身份和公开形态核验；未安装、启动、登录、测试兼容性或验证服务实际可用。未核实的许可证、法律主体和平台不猜测。下面的「身份置信度」指与 Sentra 注册 ID 的对应程度，不是质量评分。

## 优先处理

1. 先补明确的国内桌面/工作 Agent：DeepSeek Harness、LingCode、MonkeyCode、Loomy，以及 QoderWake、TRAE 插件两项产品形态。
2. 再补来源明确的编码产品：AiderDesk、IBM Bob、Cortex Code、Crush、ForgeCode、Kode、Xum、Neovate Code、Pochi、Rovo Dev CLI、Tabnine CLI、Zencoder、Zenflow Code。其余建议新增项按清单完成字段与图标证据核验。
3. iFlow CLI 和 Roo Code 单独维护历史状态；不进入活跃产品推荐。Coder、Marvis、WorkBuddy AI、Moxby、Terramind 暂缓身份绑定。
4. 正式补录须同步 dataset/evidence/collections/metadata，按实际版本核验商业与许可信息，使用可追溯 SVG；调查阶段只生成研究文件；后续实施按上述要求更新规范数据。

## 逐项调查

### 01. sentra → Sentra

- 建议：**不作为独立 Agent 新增**；身份置信度：高。
- 供应商/维护者：长亭科技。
- 公开形态：本地安全扫描工具。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：这是 Sentra 自身的注册项，不是新发现的第三方 AI Agent。
- 补录前处理：如目录要包含 Agent 安全工具，另设类别；不计入第三方 Agent 缺口。
- 一手来源：[来源 1](https://git.in.chaitin.net/endpoint-team/mvp/sentra-lib)。

### 02. coder → Coder / code-server；待区分 Coder Agents

- 建议：**待核实身份/形态**；身份置信度：低。
- 供应商/维护者：Coder Technologies。
- 公开形态：CLI、Web 开发环境；Coder Agents 为另一功能。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：Sentra 的 meta 同时探测 coder 和 code-server，说明为 Coder/code-server 配置；.config/coderv2 不能证明部署了 Coder Agents。官方明确区分开发环境、code-server 与 Coder Agents。
- 补录前处理：确认样本来自哪个产品；普通 code-server 不应新增为独立 AI Agent。
- 一手来源：[来源 1](https://coder.com/beta-docs/reference/glossary/)；[来源 2](https://github.com/coder/coder)。

### 03. deepseek-harness → DeepSeek Harness / dsh

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：DeepSeek。
- 公开形态：桌面端、CLI 启动的 Web 界面。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：官方 Harness 页面提供产品介绍、下载、Web 启动命令和官方源码链接；与已收录 DeepSeek 聊天产品是不同应用。
- 补录前处理：优先补独立 Harness 产品及界面；源码许可按所收录版本 LICENSE 核验，不能沿用聊天产品信息。
- 一手来源：[来源 1](https://deepseek.com/en/harness/)；[来源 2](https://github.com/deepseek-ai/deepseek-harness)。

### 04. lingcode → LingCode

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：LingCode 团队；法律主体待核实。
- 公开形态：macOS GUI、CLI；移动端和 Web 待分别建形态。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：官网有原生 Mac IDE 与 CLI 文档；Windows/Linux 的 LingCodeBaby 与主桌面应用不能混写。CLI 有单独跨平台安装指引。
- 补录前处理：先收 Mac GUI 和 CLI；分别核验 LingCodeBaby、移动端发行身份与许可，不把所有平台合成一条。
- 一手来源：[来源 1](https://lingcode.dev/?lang=en)；[来源 2](https://lingcode.dev/cli.html)；[来源 3](https://lingcode.dev/tutorials/install-and-use-the-lingcode-cli.html)。

### 05. marvis → Marvis / MarvisX CLI（候选）

- 建议：**待核实身份/形态**；身份置信度：中。
- 供应商/维护者：Emilio Martucci（公开项目）；Sentra 的腾讯探测信息存疑。
- 公开形态：CLI；Sentra 所指桌面端未确认。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：公开 marvisx-cli 使用 .marvis，作者和官方仓库可核对；BSL 1.1 属源码可见，不能直接标成开源。Sentra 却探测腾讯发行商及 Marvis.app/MarvisX.app，有身份冲突。
- 补录前处理：核对一份真实安装样本的签名、包名与 CLI 输出；在此之前暂不绑定腾讯或补桌面形态。
- 一手来源：[来源 1](https://github.com/emiliomartucci/marvis)；[来源 2](https://pypi.org/project/marvisx-cli/0.2.2/)；[来源 3](https://justaskmarvis.com/)。

### 06. monkeycode → MonkeyCode

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：长亭科技。
- 公开形态：Web、自托管、桌面端候选；CLI 另核验。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：长亭官方仓库明确为团队 AI 开发平台，包含 desktop 目录，发布记录出现桌面客户端下载；平台仓库标注 AGPL-3.0。另有官方 monkeycode-cli 仓库，不能把它的许可自动套到平台。
- 补录前处理：优先补 Web 平台与有官方发行证据的桌面端；CLI 按独立发行包核验，绑定 Sentra 的桌面包标识。
- 一手来源：[来源 1](https://github.com/chaitin/MonkeyCode)；[来源 2](https://github.com/chaitin/MonkeyCode/releases)；[来源 3](https://github.com/chaitin/monkeycode-cli)。

### 07. qoder-wake → QoderWake

- 建议：**补充已有产品形态**；身份置信度：高。
- 供应商/维护者：Qoder / 阿里巴巴。
- 公开形态：桌面安装服务、Web Console、CLI。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：官方国内文档覆盖 Mac/Windows/Linux，桌面安装包启动本地服务和 Web Console，并提供 qoderwake 命令。与 Qoder IDE、QoderWork 功能不同。
- 补录前处理：在 Qoder 产品族新增 Wake 形态，避免仅补别名；核验 .qoderwake-cn 与文档 .qoderwake 的版本/区域差异。
- 一手来源：[来源 1](https://docs.qoder.cn/en/qoderwake/installation)；[来源 2](https://qoder.com/en/qoderwake)。

### 08. loomy → Loomy

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：讯飞；官网主体为合肥科讯创想软件开发有限公司。
- 公开形态：macOS GUI、Windows GUI Beta。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：正确官方入口为 loomy.xunfei.cn，是工作助手而非同名照片应用；下载页列 Apple Silicon macOS 14+ 和 Windows 10+ x64 Beta。
- 补录前处理：补国内桌面助手；Windows 标记 Beta，不能据此填写 Linux。
- 一手来源：[来源 1](https://loomy.xunfei.cn/)；[来源 2](https://loomy.xunfei.cn/download)；[来源 3](https://loomy.xunfei.cn/docs/quick-start)。

### 09. trae-vscode-plugin → TRAE 插件（原 MarsCode 编程助手）

- 建议：**补充已有产品形态**；身份置信度：高。
- 供应商/维护者：TRAE；官网主体为北京引力弹弓科技有限公司。
- 公开形态：VS Code、JetBrains IDE 扩展。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：TRAE 官方插件页说明原 MarsCode 编程助手，有 VS Code/JetBrains 扩展及 Builder 模式。当前目录只有 TraeCode GUI，没有对应 IDE 扩展形态。
- 补录前处理：沿用 trae 产品关系，新增扩展条目；MarsCode 作有证据的旧名，不复制成新产品。
- 一手来源：[来源 1](https://www.trae.cn/plugin)。

### 10. vscode → Visual Studio Code Agent 宿主

- 建议：**不作为独立 Agent 新增**；身份置信度：高。
- 供应商/维护者：Microsoft。
- 公开形态：编辑器、Agent 界面。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：VS Code 官方支持 Agent 模式，但它也是多种 AI 扩展的宿主；仅 .vscode 目录或 VS Code 进程不足以识别具体 AI 产品。目录已有 GitHub Copilot 产品形态。
- 补录前处理：如需编辑器类别可单独收 VS Code；Agent 覆盖应核对 Copilot/具体扩展，不能重复算一个独立 Agent。
- 一手来源：[来源 1](https://code.visualstudio.com/docs/agents/overview)。

### 11. workbuddy-ai → WorkBuddy AI（Sentra 独立检测形态）

- 建议：**待核实身份/形态**；身份置信度：中。
- 供应商/维护者：Tencent（由 Sentra 探测与 WorkBuddy 官方资料支持；确切发行关系未确认）。
- 公开形态：桌面 GUI。
- Sentra 适配：dedicated；具体实现见下方本地源码定位。
- 调查结果：代码区分 WorkBuddyAI.exe、WorkBuddy AI.app 与经典 WorkBuddy，并使用 .workbuddy-ai；公开官网名称为 WorkBuddy，尚无足够官方资料解释两者版本关系。
- 补录前处理：核实官网安装包签名、Bundle ID、区域和迁移说明；随后在已有 WorkBuddy 产品下补形态或别名，不直接建第二产品。
- 一手来源：[来源 1](https://www.workbuddy.ai/)；[来源 2](https://www.workbuddy.cn/work/)；[来源 3](https://cloud.tencent.com/product/workbuddy)。

### 12. aider-desk → AiderDesk

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：HOTOVO。
- 公开形态：桌面 GUI。
- Sentra 适配：generic；注册目录 `.aider-desk`。
- 调查结果：官方上游为 hotovo/aider-desk，有 macOS/Windows/Linux 发布资产；产品已是 AI 软件工程师平台，不是 Aider 的别名。
- 补录前处理：新增独立产品，保留与 Aider 的关系；发行包许可、真实 SVG 分别核验。
- 一手来源：[来源 1](https://github.com/hotovo/aider-desk)；[来源 2](https://github.com/hotovo/aider-desk/releases)。

### 13. bob → IBM Bob

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：IBM。
- 公开形态：IDE、Bob Shell CLI。
- Sentra 适配：generic；注册目录 `.bob`。
- 调查结果：IBM 官方 Bob 页面与文档明确区分 IDE 和 Bob Shell；同名普通 Bob 软件不能作为来源。
- 补录前处理：分别补 IDE 与 CLI 形态；依据各版授权填写商业属性，不能标开源。
- 一手来源：[来源 1](https://bob.ibm.com/)；[来源 2](https://bob.ibm.com/docs/ide)；[来源 3](https://www.ibm.com/products/ai-coding-agent)。

### 14. codemaker → CodeMaker AI

- 建议：**建议新增**；身份置信度：中。
- 供应商/维护者：CodeMaker AI。
- 公开形态：VS Code、JetBrains 扩展、CLI。
- Sentra 适配：generic；注册目录 `.codemaker`。
- 调查结果：官方文档、官方 GitHub 组织和 CLI 仓库可交叉定位；公开资料部分较旧，服务当前维护程度不能仅凭网页存在判定。
- 补录前处理：可补候选产品；逐一确认插件现行发行、CLI 最近发布与账号服务可用性，维护状态保留未知。
- 一手来源：[来源 1](https://docs.codemaker.ai/)；[来源 2](https://github.com/codemakerai)；[来源 3](https://github.com/codemakerai/codemaker-cli)。

### 15. codestudio → Syncfusion Code Studio

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Syncfusion。
- 公开形态：AI IDE GUI。
- Sentra 适配：generic；注册目录 `.codestudio`。
- 调查结果：Syncfusion 官方 AI IDE 页面可定位；官方集成文档明确使用 .codestudio/mcp.json，与 Sentra 标记对应。
- 补录前处理：新增 Syncfusion 产品；排除同名设计公司/开发工作室。
- 一手来源：[来源 1](https://www.syncfusion.com/code-studio/)；[来源 2](https://ai.syncfusion.com/agent-setup/codestudio/)。

### 16. command-code → Command Code

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：CommandCodeAI。
- 公开形态：CLI。
- Sentra 适配：generic；注册目录 `.commandcode`。
- 调查结果：commandcode.ai 与 CommandCodeAI 官方仓库介绍终端编码 Agent、command-code 包和学习用户偏好的能力。
- 补录前处理：新增 CLI；核实 npm 包发布者与版本许可，不因为存在仓库就标全部开源。
- 一手来源：[来源 1](https://commandcode.ai/)；[来源 2](https://commandcode.ai/docs)；[来源 3](https://github.com/CommandCodeAI/command-code)。

### 17. cortex → Snowflake Cortex Code / CoCo CLI

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Snowflake。
- 公开形态：CLI。
- Sentra 适配：generic；注册目录 `.snowflake/cortex`。
- 调查结果：官方 CLI 参考文档使用 cortex 命令和 .snowflake/cortex/conversations，匹配 Sentra 注册目录；不是泛指 Cortex 模型 API。
- 补录前处理：新增 Cortex Code CLI；以后如补 Web 界面，单独核验，不能把整个 Snowflake 平台视为同一形态。
- 一手来源：[来源 1](https://docs.snowflake.com/en/user-guide/cortex-code/cli-reference)；[来源 2](https://www.snowflake.com/en/developers/guides/coco-foundations/)。

### 18. crush → Crush

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Charmbracelet。
- 公开形态：终端 CLI/TUI。
- Sentra 适配：generic；注册目录 `.config/crush`。
- 调查结果：官方仓库与发布页可定位终端编码助手；当前主分支 LICENSE 是 FSL-1.1-MIT，有竞争用途限制与未来 MIT 转换，并非直接 MIT。
- 补录前处理：优先新增；商业/开源字段按实际收录版本标源码可见，旧 MIT 版本不能代表当前版。
- 一手来源：[来源 1](https://github.com/charmbracelet/crush)；[来源 2](https://github.com/charmbracelet/crush/releases)；[来源 3](https://github.com/charmbracelet/crush/blob/main/LICENSE.md)。

### 19. deepagents → Deep Agents Code / Deep Agents CLI

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：LangChain。
- 公开形态：CLI。
- Sentra 适配：generic；注册目录 `.deepagents/agent`。
- 调查结果：官方仓库同时提供 Deep Agents SDK 和预构建的终端编码 Agent；发布名称、命令随版本演进。不能将 SDK 本身登记成桌面应用。
- 补录前处理：新增面向用户的 CLI 形态；保留 Deep Agents CLI 别名，锁定发行包/命令版本及 .deepagents/agent 对应关系。
- 一手来源：[来源 1](https://github.com/langchain-ai/deepagents)；[来源 2](https://www.langchain.com/blog/introducing-deepagents-cli)。

### 20. firebender → Firebender

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Firebender 团队。
- 公开形态：JetBrains / Android Studio IDE 扩展。
- Sentra 适配：generic；注册目录 `.firebender`。
- 调查结果：JetBrains 插件市场官方条目及 Firebender 文档可定位编码 Agent；不要用非官方代理站绑定厂商。
- 补录前处理：新增 IDE 扩展；系统按 IDE 与插件实际支持核验，定价与授权看具体版。
- 一手来源：[来源 1](https://plugins.jetbrains.com/plugin/25224-firebender)；[来源 2](https://docs.firebender.com/get-started/experimental)；[来源 3](https://firebender.com/pricing)。

### 21. forgecode → ForgeCode

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Tailcall。
- 公开形态：CLI/TUI、Shell 集成。
- Sentra 适配：generic；注册目录 `.forge`。
- 调查结果：官方上游 tailcallhq/forgecode 与 forgecode.dev 提供终端 Agent，使用 .forge；不是同名 Forge 平台。
- 补录前处理：新增 CLI；Shell 集成作为同产品能力而非重复产品。
- 一手来源：[来源 1](https://github.com/tailcallhq/forgecode)；[来源 2](https://forgecode.dev/)。

### 22. iflow-cli → iFlow CLI

- 建议：**历史收录**；身份置信度：高。
- 供应商/维护者：iFlow AI 团队。
- 公开形态：CLI。
- Sentra 适配：generic；注册目录 `.iflow`。
- 调查结果：官方仓库公告写明 2026-04-17（UTC+8）关停。源码/旧包仍可存在，公告不等于所有本地 BYOK 用法必然不能运行。
- 补录前处理：若追求检测覆盖，作为历史项目收录并附停服说明；不列入当前活跃推荐。
- 一手来源：[来源 1](https://github.com/iflow-ai/iflow-cli)。

### 23. jazz → Jazz

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：lvndry / Jazz 项目维护者。
- 公开形态：CLI、脚本、定时任务、消息平台集成。
- Sentra 适配：generic；注册目录 `.jazz`。
- 调查结果：官方仓库与项目文档描述通用自主 Agent；文档使用 .jazz/agents/<id>.json，能对应检测目录。
- 补录前处理：新增通用 CLI Agent；与同名数据库/音乐项目区分。
- 一手来源：[来源 1](https://github.com/lvndry/jazz)；[来源 2](https://jazz-cli.vercel.app/docs/getting-started/create-an-agent)。

### 24. kode → Kode CLI

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：ShareAI Lab。
- 公开形态：CLI。
- Sentra 适配：generic；注册目录 `.kode`。
- 调查结果：上游 shareAI-lab/Kode-CLI 使用 .kode、@shareai-lab/kode；仓库标 Apache-2.0。不是其他 Kode 同名项目或未经辨别的 fork。
- 补录前处理：新增 CLI；使用上游发布者身份，锁定包版本。
- 一手来源：[来源 1](https://github.com/shareAI-lab/Kode-CLI)。

### 25. mcpjam → MCPJam Inspector

- 建议：**不作为独立 Agent 新增**；身份置信度：高。
- 供应商/维护者：MCPJam。
- 公开形态：Web / 本地开发工具。
- Sentra 适配：generic；注册目录 `.mcpjam`。
- 调查结果：官方 Inspector 用于 MCP server/apps 调试、检查与评估，主要是开发工具，不是通常意义的通用编码 Agent。
- 补录前处理：如目录扩大到 MCP 开发工具可新增专属类型；此次不作为独立 Agent 缺口补入。
- 一手来源：[来源 1](https://github.com/MCPJam/inspector)。

### 26. moxby → Moxby（候选）

- 建议：**待核实身份/形态**；身份置信度：中。
- 供应商/维护者：Moxby；法律主体待核实。
- 公开形态：浏览器扩展、配套 Desktop Bridge。
- Sentra 适配：generic；注册目录 `.moxby`。
- 调查结果：moxby.com 的现行产品是浏览器 Mods/Missions/Chat 与付费 Desktop Bridge；尚未查到 .moxby 目录或对应 CLI 的官方绑定证据。
- 补录前处理：拿到桥接安装包/官方配置文档后确认身份；不要按 generic 注册名猜成终端编码 CLI。
- 一手来源：[来源 1](https://moxby.com/)；[来源 2](https://moxby.com/mods)。

### 27. mux → Xum（原 Mux）

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Coder。
- 公开形态：桌面 GUI、VS Code 扩展、Web 服务形态待分项核验。
- Sentra 适配：generic；注册目录 `.mux`。
- 调查结果：coder/mux 已重定向 coder/xum；官方 README 说明商标争议后改名 Xum，仓库 AGPL-3.0。不同于 usemux.ai 的同名项目。
- 补录前处理：新记录使用 Xum 名称并保留 Mux 旧名；检测映射保留 .mux，同时研究 .xum 新目录。
- 一手来源：[来源 1](https://github.com/coder/xum)；[来源 2](https://github.com/coder/mux)。

### 28. neovate → Neovate Code

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：NeovateAI。
- 公开形态：CLI；桌面产品另核验。
- Sentra 适配：generic；注册目录 `.neovate`。
- 调查结果：官方 neovateai/neovate-code 提供 @neovate/code，标 MIT；组织中旧 code-desktop 归档与后续 desktop 仓库并存，不能据此说整个产品停更。
- 补录前处理：优先补 CLI；桌面端核实新旧仓库和现行发行包后单独新增形态。
- 一手来源：[来源 1](https://github.com/neovateai/neovate-code)；[来源 2](https://github.com/neovateai)。

### 29. ona → Ona（原 Gitpod）

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Ona / Gitpod 团队。
- 公开形态：Web、云端工程 Agent、自托管基础设施。
- Sentra 适配：generic；注册目录 `.ona`。
- 调查结果：Ona 官方说明 Gitpod 于 2025-09-02 更名，产品定位为工程 Agent 与开发环境。旧 Gitpod 源码公开不能证明当前 Ona 服务全开源。
- 补录前处理：新增 Ona；Gitpod 作有证据的旧名；云 Agent 与环境管理的边界写清楚。
- 一手来源：[来源 1](https://ona.com/stories/gitpod-is-now-ona)；[来源 2](https://github.com/gitpod-io)。

### 30. pochi → Pochi

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：TabbyML。
- 公开形态：VS Code IDE 扩展、可选云服务。
- Sentra 适配：generic；注册目录 `.pochi`。
- 调查结果：TabbyML 官方 Pochi 仓库明确为开发 Agent，提供 VS Code 扩展和可选云/BYOK；与目录已有 Tabby 是不同产品。
- 补录前处理：新增独立 Pochi 产品；不并入 Tabby 名称或沿用其商业字段。
- 一手来源：[来源 1](https://github.com/TabbyML/pochi)；[来源 2](https://github.com/TabbyML/pochi/blob/main/packages/docs/content/docs/index.mdx)。

### 31. reasonix → DeepSeek-Reasonix / Reasonix

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：esengine / Huahui Yu。
- 公开形态：CLI；Studio GUI/Web 按分支发行分别确认。
- Sentra 适配：generic；注册目录 `.reasonix`。
- 调查结果：官方上游 esengine/DeepSeek-Reasonix 使用 .reasonix，标 MIT；2.x Studio 与 1.x 维护分支不同。名称含 DeepSeek 不代表 DeepSeek 官方出品。
- 补录前处理：先补稳定 CLI；Studio 按实际发行核验，不绑定 DeepSeek 供应商。
- 一手来源：[来源 1](https://github.com/esengine/DeepSeek-Reasonix)。

### 32. rovodev → Rovo Dev CLI

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Atlassian。
- 公开形态：CLI。
- Sentra 适配：generic；注册目录 `.rovodev`。
- 调查结果：官方支持文档说明通过 ACLI 安装和运行 Rovo Dev 功能，命令为 acli rovodev run；需要相应 Rovo Dev 订阅。
- 补录前处理：新增 Atlassian CLI Agent；以官方命令和订阅版识别，不猜开源。
- 一手来源：[来源 1](https://support.atlassian.com/rovo/docs/use-rovo-dev-cli/)；[来源 2](https://support.atlassian.com/rovo/docs/install-and-run-rovo-dev-cli-on-your-device/)。

### 33. roo → Roo Code

- 建议：**历史收录**；身份置信度：高。
- 供应商/维护者：Roo Code Inc.。
- 公开形态：VS Code IDE 扩展（历史）。
- Sentra 适配：generic；注册目录 `.roo`。
- 调查结果：官方仓库在 2026-05-15 归档，README 声明扩展 5 月 15 日停止服务；仍公开的源码不表示产品继续运营。
- 补录前处理：历史收录并标停止服务；ZooCode/Cline 为不同后续/来源项目，不能直接替换身份。
- 一手来源：[来源 1](https://github.com/RooCodeInc/Roo-Code)。

### 34. tabnine-cli → Tabnine CLI

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Tabnine。
- 公开形态：CLI。
- Sentra 适配：generic；注册目录 `.tabnine/agent`。
- 调查结果：Tabnine 官方 CLI 文档与平台页明确为独立终端编码入口；不是 Tabby，同名近似也不能合并。
- 补录前处理：新增 Tabnine 产品及 CLI；核实团队授权与系统安装限制，后续 IDE 扩展再分项补。
- 一手来源：[来源 1](https://docs.tabnine.com/main/getting-started/tabnine-cli)；[来源 2](https://www.tabnine.com/platform-cli/)。

### 35. terramind → Terramind / Atlas / Nucleus（候选映射）

- 建议：**待核实身份/形态**；身份置信度：低。
- 供应商/维护者：Terramind.com, Inc.。
- 公开形态：macOS 应用；具体 Sentra 检测形态待确认。
- Sentra 适配：generic；注册目录 `.terramind`。
- 调查结果：正确候选是 terramind.com 的 Agent 产品族，不是 IBM/ESA 同名地球观测模型；当前主页称 Nucleus/Spaces 为 Apple Silicon Mac 应用。旧子站仍有跨平台/候补宣传，且 .terramind 映射无公开确认。
- 补录前处理：先核实 .terramind 的实际创建程序、产品名称及签名；系统以现行发行包为准，不照抄旧子站。
- 一手来源：[来源 1](https://terramind.com/)；[来源 2](https://terramind.com/nucleus?from=home)；[来源 3](https://terramind.com/contact)。

### 36. tinycloud → TinyCloud

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Cloudglue。
- 公开形态：CLI、视频任务/Skills。
- Sentra 适配：generic；注册目录 `.tinycloud`。
- 调查结果：tinycloud.sh 给出 @cloudglue/tinycloud 包与 ~/.tinycloud/versions 路径，是视频工作 Agent；不是 tinycloud.io 同名机构。
- 补录前处理：新增视频/媒体 Agent 的 CLI，避免一律放入 AI 编程类；标明 Beta/服务依赖。
- 一手来源：[来源 1](https://www.tinycloud.sh/)。

### 37. zencoder → Zencoder

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Zencoder。
- 公开形态：VS Code、JetBrains IDE 扩展。
- Sentra 适配：generic；注册目录 `.zencoder`。
- 调查结果：Zencoder 官方下载页列 VS Code/JetBrains 扩展，文档有自定义 Agent；与传统视频编码服务同名，需要明确 AI 编程产品身份。
- 补录前处理：新增 IDE 扩展；不能因与 Zenflow 共用 .zencoder 就判重复或同时确认安装。
- 一手来源：[来源 1](https://zencoder.ai/download/all)；[来源 2](https://docs.zencoder.ai/features/custom-agents)。

### 38. zenflow → Zenflow Code（by Zencoder）

- 建议：**建议新增**；身份置信度：高。
- 供应商/维护者：Zencoder。
- 公开形态：桌面 Agent 编排应用。
- Sentra 适配：generic；注册目录 `.zencoder`。
- 调查结果：Zencoder 官方 Zenflow 页面与下载页定位为规格驱动的 Agent 编排产品；不是 zenflow.sh 框架或其他同名仓库。
- 补录前处理：新增独立产品并关联同供应商；逐项核验下载包支持系统，共享目录不是双产品安装证据。
- 一手来源：[来源 1](https://zencoder.ai/zenflow)；[来源 2](https://zencoder.ai/download/all)。

## 本地源码定位

- [注册列表](/Users/alien/.cargo/git/checkouts/sentra-lib-617629933b197066/2cdefd2/src/agents/entries.rs:688)
- [generic 能力分派](/Users/alien/.cargo/git/checkouts/sentra-lib-617629933b197066/2cdefd2/src/agents/general/mod.rs:16)
- [Coder 混合探测](/Users/alien/.cargo/git/checkouts/sentra-lib-617629933b197066/2cdefd2/src/agents/coder/meta.rs:38)
- [Marvis 供应商冲突](/Users/alien/.cargo/git/checkouts/sentra-lib-617629933b197066/2cdefd2/src/agents/marvis/meta.rs:60)
- [WorkBuddy AI 与经典版包名区分](/Users/alien/.cargo/git/checkouts/sentra-lib-617629933b197066/2cdefd2/src/agents/codebuddy/work_meta.rs:97)

结构化清单：同目录 `sentra-agent-gaps-2026-10-10.json`，包含全部 38 项、来源、建议、身份置信度及目录快照摘要。
