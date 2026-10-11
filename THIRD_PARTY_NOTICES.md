# 第三方素材与权利声明

本仓库含应用元数据、核验记录，以及来自官方站点或注明来源的第三方项目的 SVG 与 PNG 品牌标识。各条记录的具体来源、核验日期与限制说明见 [`data/evidence.json`](./data/evidence.json)；构建后的静态站点使用同内容的 `evidence.json`。

## 本仓库的授权边界

`@alienhub/agent-atlas` 是私有软件包，仓库代码标记为 `UNLICENSED`。此标记不改变第三方材料本身适用的授权条款，也不表示本仓库拥有或向使用者授予第三方商标、品牌、Logo 或其他权利。

Logo、产品名称和商标归各自权利人所有。公开可下载、保存在本仓库或出现在图标库中，均不等于获得品牌使用、背书、再授权或商标许可。使用者应结合具体素材的来源及品牌使用规则评估其用途。记录只用于识别相应产品，不暗示与供应商存在合作或获得其认可。

## 随附原始声明

以下文件保留导入数据集随附的完整许可文本，不以本页的概述替代：

| 来源 | 原始文本 | 随附声明 |
| --- | --- | --- |
| LobeHub Icons | [`licenses/lobehub.txt`](./licenses/lobehub.txt) | MIT License；Copyright (c) 2023 LobeHub |
| LobeHub Icons，中国厂商相关素材批次 | [`licenses/lobehub-china.txt`](./licenses/lobehub-china.txt) | MIT License；Copyright (c) 2023 LobeHub |
| SVGL | [`licenses/svgl.txt`](./licenses/svgl.txt) | MIT License；Copyright (c) 2022 Pablo Hdez |
| Simple Icons | [`licenses/simple-icons.txt`](./licenses/simple-icons.txt) | CC0 1.0 Universal |

`lobehub.txt` 与 `lobehub-china.txt` 来自原始素材的不同收集批次，均予保留。上述授权文本只适用于各自覆盖的材料，不是整个仓库或全部图标的统一许可证。Simple Icons 随附的 CC0 文本也明确不授予商标或专利权。

官方来源的 SVG 仍以其来源与权利人的适用规则为准；不能因为本仓库同时包含 MIT 或 CC0 文本，就将这些条款推定应用于官方素材。

## 数据与核验限制

- 应用 `id` 标识具体条目或版本；`product_id` 用于关联同一产品，`vendor_id` 用于关联供应商
- `evidence.json` 记录官网及来源资料的核对，不代表安装、运行、性能或安全测试
- `verified_at` 是相应记录的资料核对日期，不是未来持续有效或实时状态保证；保留每条记录的 `notes` 与 `sources`
- 未找到可靠 Logo 的条目保留空 `icon`；PNG 标注位图格式及 SVG 缺失状态；界面显示的首字或自定义占位元素不是官方 Logo
- 元数据、服务状态及品牌素材可能变化；请结合每条记录的原始来源核对当前情况

维护数据时应同步维护来源，分发随附素材时应保留适用的原始声明。网站构建会将以上 `licenses/*.txt` 与本文件一并复制到输出目录。

## PR #1 吸收的官方品牌素材


`assets/icons/coder.svg` 原样取自 [Coder 官方品牌页](https://coder.com/brand) 的 [Primary logo SVG](https://coder.com/brand/images/logo/sections/0/content/1/value/images/0/image.svg)，于2026-10-09取得并检查为独立矢量 SVG。该官方品牌资产不因 Coder 社区源码采用 AGPL-3.0 而被推定为 AGPL；品牌和商标权仍归权利人，不表示背书或获得额外商标使用授权。

### 第二批官方 SVG

所有新增 SVG 均原样保存，具体来源和 SHA-256 见 [素材来源清单](https://github.com/AlienHub/agent-catalog/blob/main/docs/research/pr-1-2026-10-09/2026-10-09-svg-sources.json)。品牌权利仍归各自权利人，公开可下载或仓库软件许可证不自动授予商标/背书授权。

- `assets/icons/deepseek-harness.svg`：[官方素材](https://www.deepseek.com/harness/favicon.svg)
- `assets/icons/loomy.svg`：[官方素材](https://loomy.xunfei.cn/assets/images/bottom_loomy.svg)
- `assets/icons/command-code.svg`：[官方素材](https://raw.githubusercontent.com/CommandCodeAI/command-code/refs/heads/main/.github/commandcode/symbols/symbol.svg)
- `assets/icons/ona.svg`：[官方素材](https://ona.com/ona-light-favicon.svg)
- `assets/icons/reasonix.svg`：[官方素材](https://raw.githubusercontent.com/esengine/DeepSeek-Reasonix/studio/docs/favicon.svg)
- `assets/icons/zencoder.svg`：[官方素材](https://zencoder.ai/hubfs/Logo-dark-1.svg)

Reasonix 仓库素材随附原始 [MIT 文本](./licenses/reasonix-mit.txt)。Pochi 官方 SVG 在 PR #1 吸收批次未打包，当时两个条目的图标字段均留空；官方来源 URL 仍在研究和证据中。Pochi IDE 包的原始 [包级版权声明](./licenses/pochi-vscode.txt)作为许可核验参考随附；未将仓库根 Apache-2.0 推定覆盖该包。其余官网品牌资产不据代码许可推定授权；识别用途不表示获得产品背书或商标许可。

## v0.14 编程工具 Logo 补充

来源、原始 SHA-256 与对应应用见 [素材清单](docs/research/coding-logo-assets-2026-10-11.json)。VS Code 图标来自 SVGL，适用随附 MIT 文本。其他素材来自相应官方站点或官方仓库，用于识别产品，商标和品牌权利归各自权利人；仓库代码许可证不自动赋予品牌许可。JetBrains AI Assistant 品牌标识归 JetBrains s.r.o.，品牌规则见 https://www.jetbrains.com/company/brand/ 。Pochi 本次补充官方 Logo，仍保留包级版权声明，不将仓库根 Apache-2.0 推定覆盖该资产。Rovo Dev 保留官网内嵌 SVG 的路径与属性，未重新绘制。

官方 PNG 原样保存为位图，格式、尺寸与哈希在同一素材清单中。Plandex、MonkeyCode、AiderDesk、Crush、Neovate 的品牌权利归各自权利人；未因源码许可证推定额外品牌授权。

## Web AI 资产补录（2026-10-11）

本批原始官方 SVG/PNG 的来源页、下载地址、格式、尺寸、SHA-256 和对应应用见 [素材核验清单](docs/research/web-ai-assets-2026-10-11.json)。官网使用的第三方托管 CDN 以来源页链接核实，不仅凭域名归属。素材未经重绘或位图矢量化。Dola、Dreamina 使用各自官网品牌，未直接套用豆包或即梦。DeepL Write 与 Zapier Agents 使用对应官方产品页的共用厂商品牌标识，未声称专属产品 Logo。n8n 素材来自 [官方品牌规则](https://n8n.io/brandguidelines/)，品牌使用规则继续适用。

这些素材用于识别产品，商标、版权和其他品牌权利归各自权利人。公开下载不等于再授权，不从源码许可或商业套餐推定品牌授权。本批没有添加未经确认的统一素材许可证。

## 浏览器 AI 资产补充（2026-10-11）

原始素材URL、SHA-256、格式、PNG尺寸与应用关联见 [素材清单](docs/research/browser-ai-assets-2026-10-11.json)。官方 Chrome 商店发布者图标、官网原始 SVG/PNG 均用于对应产品识别，商标、品牌与素材权利归各自权利人；公开可下载不意味着额外品牌或背书授权。Edge SVG 来自 SVGL 固定提交，沿用随附 [MIT 文本](licenses/svgl.txt)，不改变 Microsoft 商标权利。PNG 未转换成 SVG；Dia 官网内嵌位图的 favicon.svg 未作为独立矢量收录。

## OpenRouter 发现来源及品牌素材（2026-10-11）

OpenRouter Apps 的公开榜单仅作独立应用发现线索；名称、类别及URL来源保存于 `docs/research/openrouter-apps-2026-10-11.json`，没有下载或复用其第三方favicon代理缓存，也没有把选择公开追踪的用量当全市场统计。

15份新增品牌素材均原样来自核验官网明确引用的SVG/PNG URL，原始URL、字节数、格式、SHA-256和应用关联见 `docs/research/openrouter-review-2026-10-11.json`。所有商标和品牌权利归权利人，不从代码许可推定品牌授权。GDevelop名称和Logo归Florian Rival；Letta代码许可排除的品牌素材未收录。
