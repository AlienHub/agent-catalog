# 编程工具 Logo 核验（2026-10-11）

原有 47 条编程、开发、代码或 IDE 记录的 icon 为空。本次补充 14 个 SVG、5 个 PNG，覆盖 31 条应用、20 个产品。剩余 16 条记录待补充。

## 原因与格式约定

已有来源未打包（Pochi）、官方资源未追查（Kilo、Roo、JetBrains AI、Pi 等），以及之前目录仅接受独立 SVG，导致存在 PNG 的项目也显示占位符。

现在接受原始 SVG 和 PNG；页面卡片及下载标注实际格式。icon 路径保留文件扩展名，svg_status 对 PNG 明确标注“未收录 SVG · 已验证 PNG 位图”。仅有 SVG 筛选、SVG 数量和 SDK hasSvg 不计入 PNG。SVG 专用 getAppIcon/getIconSvg 接口保持原行为；新增 getAppLogo 读取两种格式，React AppIcon 支持两种格式。

原样保留素材，不重新绘制，不把 PNG 嵌入 SVG。Rovo Dev 原样提取自官网导航内嵌 SVG；VS Code 使用现有 SVGL 素材库，其余来自官方站点或源码仓库。来源、SHA-256、PNG 尺寸及应用映射见同目录 JSON。

## 已补充

- kilo-code（SVG）：kilo-code-cli, kilo-code-ide
- roo-code（SVG）：roo-code-vscode
- open-interpreter（SVG）：open-interpreter-cli
- deepagents-code（SVG）：deepagents-cli, deep-agents-code-cli
- xum（SVG）：xum-desktop
- pochi（SVG）：pochi-vscode, pochi-cli
- pi（SVG）：pi-cli
- lingcode（SVG）：lingcode-desktop, lingcode-cli, lingcode-web
- firebender（SVG）：firebender-ide
- syncfusion-codestudio（SVG）：syncfusion-codestudio
- vscode（SVG）：vscode-desktop
- rovo-dev（SVG）：rovo-dev-cli, rovo-dev-ide, rovo-dev-reviewer
- forgecode（SVG）：forgecode-cli, forgecode-ide
- jetbrains-ai（SVG）：jetbrains-ai
- plandex（PNG）：plandex-cli
- monkeycode（PNG）：monkeycode-web, monkeycode-work-desktop
- aider-desk（PNG）：aider-desk-desktop, aiderdesk-cli
- crush（PNG）：crush-cli
- neovate（PNG）：neovate-cli, neovate-ide, neovate-desktop

## 待补充

未使用通用 Electron、React 或其他产品 Logo 作为替代。CodeArts 官网 SVG 是系列标识，本次未认定为码道 Agent 专属 Logo。下面是当前仍缺少素材的完整清单，不代表产品不存在 Logo。

|应用 ID|名称|官方入口|
|---|---|---|
|codearts-agent-cli|华为云码道 CodeArts Agent CLI|https://codearts.huaweicloud.com/download.html|
|codearts-agent-ide|华为云码道 CodeArts Agent IDE|https://codearts.huaweicloud.com/|
|codearts-agent-ide-extension|华为云码道|https://codearts.huaweicloud.com/download.html|
|comate|文心快码|https://comate.baidu.com/|
|comate-ide-plugin|文心快码|https://comate.baidu.com/|
|ibm-bob-ide|IBM Bob IDE|https://bob.ibm.com/|
|ibm-bob-cli|IBM Bob Shell|https://bob.ibm.com/|
|codemaker-vscode|CodeMaker AI|https://docs.codemaker.ai/|
|codemaker-jetbrains|CodeMaker AI|https://docs.codemaker.ai/|
|codemaker-cli|CodeMaker AI CLI|https://docs.codemaker.ai/|
|snowflake-cortex-code-cli|Snowflake Cortex Code CLI|https://docs.snowflake.com/en/user-guide/cortex-code/cli-reference|
|iflow-cli|iFlow CLI|https://github.com/iflow-ai/iflow-cli|
|kode-cli|Kode CLI|https://github.com/shareAI-lab/Kode-CLI|
|tabnine-cli|Tabnine CLI|https://docs.tabnine.com/main/getting-started/tabnine-cli|
|zenflow-desktop|Zenflow Code|https://zencoder.ai/zenflow|
|lingcode-baby-desktop|LingCode Baby|https://lingcode.dev/baby.html|
