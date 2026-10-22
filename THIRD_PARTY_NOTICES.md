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

## v0.19 Logo 补录（2026-10-13）

本批 SVG 均原样保存，未重绘。Lobe Icons 素材继续适用随附 [MIT 文本](./licenses/lobehub.txt)；官方仓库素材以其来源与权利人规则为准，仓库软件许可证不自动授予商标或背书授权。AstrBot 官方 `icon-no-shadow.svg` 含 `foreignObject`，未收录。

| 文件 | 来源 | SHA-256 |
| --- | --- | --- |
| `assets/icons/openclaw.svg` | [Lobe Icons `openclaw.svg`](https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/openclaw.svg) | `1f0b18833ccb1c7c21ae998d237856975fc90eb8eafc14f8db05198628e8da4d` |
| `assets/icons/hermes-agent.svg` | [Lobe Icons `hermesagent.svg`](https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/hermesagent.svg) | `02d43c0a91fc2ee41f2684fc39613ff6687de29a4b079665bace5303671dd63b` |
| `assets/icons/agent-zero.svg` | [agent0ai/agent-zero `webui/public/icon.svg`](https://raw.githubusercontent.com/agent0ai/agent-zero/main/webui/public/icon.svg) | `c1938a2903529c6fe7d86fc768bd953f9864ea14d7b0fe95a714669f64c896fc` |
| `assets/icons/qwenpaw.svg` | [agentscope-ai/QwenPaw `scripts/pack/assets/icon.svg`](https://raw.githubusercontent.com/agentscope-ai/QwenPaw/main/scripts/pack/assets/icon.svg) | `7fe3254bb6a25534937893688259602c12823e9c62fab0339af4259380492cf1` |
| `assets/icons/bolt-diy.svg` | [stackblitz-labs/bolt.diy `icons/logo.svg`](https://raw.githubusercontent.com/stackblitz-labs/bolt.diy/main/icons/logo.svg) | `244dc2cebe251a2b839ee09107308bbdfeeac4e2831f6f7c6ddffd96929eacbe` |

扣子 CN 桌面端沿用 `icons/coze-cn.svg`，智谱清言桌面端沿用 `icons/qingyan.svg`，Manus Studio 桌面端沿用已核验的 `icons/web-manus.svg`。Pochi 本批按既有决定不改动。

## v0.20 Logo 收录（2026-10-14）

本批 SVG 均原样保存，未重绘。官方站点或官方仓库素材以其来源与权利人规则为准，仓库软件许可证不自动授予商标或背书授权。Sugabots 官方声明品牌 Logo 不在其 MIT 软件许可范围内，本仓库仅作产品识别收录。

| 文件 | 来源 | SHA-256 |
| --- | --- | --- |
| `assets/icons/xiryn.svg` | [Xiryn 官网 `icon.svg`](https://xiryn.com/icon.svg) | `e2df098b8f0c31b86858540bb6bfa4ec3141458d643aad6300e466e28bd098d8` |
| `assets/icons/kai.svg` | [Kai 官网 `icon.svg`](https://hirekai.ai/icon.svg) | `2456f43a74656eaf69966411e8c0e07fa2bbe3b8600438b057fc7c9786721c25` |
| `assets/icons/sugabots.svg` | [nitrictech/sugabots `packages/avatars/assets/sugabots-logo.svg`](https://raw.githubusercontent.com/nitrictech/sugabots/main/packages/avatars/assets/sugabots-logo.svg) | `6206c3b176dd1577eb43a19d3c9ca7850a88f4e2c061d0c9266ce01562f574b2` |
| `assets/icons/agency-orchestrator.svg` | [jnMetaCode/agency-orchestrator `website/public/logo/ao-mark.svg`](https://raw.githubusercontent.com/jnMetaCode/agency-orchestrator/main/website/public/logo/ao-mark.svg) | `70c6adc54590a004cb4aa278aec64149bd8eabccf057c5b60c43c4710627ae4d` |

## v0.25 Logo 收录（2026-10-19）

本批 SVG 均原样保存，未重绘。官方站点或官方仓库素材以其来源与权利人规则为准，仓库软件许可证不自动授予商标或背书授权。

| 文件 | 来源 | SHA-256 |
| --- | --- | --- |
| `assets/icons/pilotdeck.svg` | [OpenBMB/PilotDeck `ui/public/favicon.svg`](https://raw.githubusercontent.com/OpenBMB/PilotDeck/main/ui/public/favicon.svg) | `faf9bf99a84f4c71aa871787d8a943068fc63f2e9e18174de015382d7c4510b8` |
| `assets/icons/craft-agents.svg` | [Craft Agents 官网 `favicon.svg`](https://agents.craft.do/favicon.svg) | `8034ba25c97ad91dab975f742be4638321e24488cba6733927ccd9f817efa655` |
| `assets/icons/talorys.svg` | [Talorys 官网 `favicon.svg`](https://rociiu.github.io/talorys/favicon.svg) | `724567dcf4d2a34ed36eb83dc83858c87d7b26ce7ec07e6308cda80732ca4ee0` |
| `assets/icons/reason-agent.svg` | [Reason 官网 `favicon.svg`](https://reasonmachines.com/favicon.svg) | `342a4a7f2f4ba9264d7359befd3cb1bc505bd979cc795f895dac085a6db06c1f` |

## v0.26 Logo 收录（2026-10-20）

本批 SVG 均原样保存，未重绘。官方站点或官方仓库素材以其来源与权利人规则为准，仓库软件许可证不自动授予商标或背书授权。

| 文件 | 来源 | SHA-256 |
| --- | --- | --- |
| `assets/icons/octop.svg` | [Octop 官方文档 `favicon.svg`](https://docs.octop.cloud/favicon.svg) | `c2a9114966e16370b4d33fab2f7519c9029942142f69102cf9f298d588a82895` |
| `assets/icons/starkomand.svg` | [Starkomand 官网 `favicon.svg`](https://starkomand.com/favicon.svg) | `9bde3499b872fd86912d3602d16391b07e4b4f26766c440391a5a401684e99a7` |
| `assets/icons/readywhen.svg` | [readywhen 官方品牌页 `readywhen-app-icon-on-light.svg`](https://readywhen.ai/public/images/logos/readywhen-app-icon-on-light.svg) | `c9d71ca429a76870ee8deb8fdd5fafe76caddf98c701a10a97c765a1343c5617` |

## v0.27 Logo 补齐（2026-10-20）

本批新增 SVG 均原样保存，未重绘。Lobe Icons 继续适用随附 [MIT 文本](./licenses/lobehub.txt)；Simple Icons 适用随附 [CC0 文本](./licenses/simple-icons.txt)。官方站点、官方仓库与官方 GitHub 组织头像以其来源与权利人规则为准，仓库软件许可证不自动授予商标或背书授权。PNG 原样保存为位图，未转换成 SVG。

| 文件 | 来源 | SHA-256 |
| --- | --- | --- |
| `assets/icons/aionui.svg` | [AionUi 官网 `favicon.svg`](https://www.aionui.com/favicon.svg) | `5c2b76de3a10d48acc11f34675a4159d371f5981d4044b3696b6741ef1ca7a01` |
| `assets/icons/scispace.svg` | [SciSpace 官网 favicon（实为 SVG）](https://scispace.com/favicon.ico) | `fee02038267cb67732982e47550c42bf0aaebfde568c1254c0224ca21e4c3578` |
| `assets/icons/ibm-bob.svg` | [IBM Bob 官网 `icon.svg`](https://bob.ibm.com/icon.svg?v=1) | `2d0239059a21146a37f2b1c365ae83724b564e078b78e1f57990537712ca01a6` |
| `assets/icons/tinycloud.svg` | [TinyCloud 官网 `icon.svg`](https://www.tinycloud.sh/icon.svg) | `ba5f83cd1633e40d72dbf99b409067160fa68742cb73b838526857e8c54a1486` |
| `assets/icons/letta.svg` | [Letta 文档站 `favicon.svg`](https://docs.letta.com/favicon.svg) | `5439e5ee0c214bca60f46451682caf4a274f56c9367bd87efa4435e5fcadac80` |
| `assets/icons/moxby.svg` | [Moxby 官网 `favicon.svg`](https://moxby.com/favicon.svg) | `e6d2e59b7b5bbb0342e0fb496dfc262decbfe4426bbb7b047aec8d467d1dc6f7` |
| `assets/icons/guilds.svg` | [guilds.run 官网 `icon.svg`](https://www.guilds.run/icon.svg) | `d391c70feaecbb79a46229e4df9750050978bf2225f9af35866c47b37333adab` |
| `assets/icons/openwork.svg` | [OpenWork 官网 `openwork-mark.svg`](https://openworklabs.com/openwork-mark.svg) | `c963967234ea1a9f90a4aa172309e12315ab7aa70de11e677eb90f4ee266479e` |
| `assets/icons/jazz.svg` | [lvndry/jazz `.github/assets/jazz-icon.svg`](https://raw.githubusercontent.com/lvndry/jazz/main/.github/assets/jazz-icon.svg) | `a111a33924ca630dd6dc8534d536a8dd7e52010aeb21533362aa2c1e31f2481e` |
| `assets/icons/astrbot.svg` | [AstrBot 仓库 `dashboard/public/favicon.svg`](https://raw.githubusercontent.com/AstrBotDevs/AstrBot/master/dashboard/public/favicon.svg) | `5f17f2a86bbee1f6e0751c138f4b4bf7eed65ecef93a4bfecdf14982224e26cb` |
| `assets/icons/snowflake-cortex-code.svg` | [Snowflake 文档 favicon（厂商品牌）](https://docs.snowflake.com/images/favicon/favicon.svg) | `239c3c8a8b300f19589dfcb8754603d8b8a4451c06e009529a76c1f8dc4b2fec` |
| `assets/icons/openmuse.svg` | [Lobe Icons `copilotkit-color.svg`（CopilotKit 厂商品牌）](https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/copilotkit-color.svg) | `2fd67f304ee2f4659be9a5304870b5bf6c0c3989f0d0420875595216a15fc17b` |
| `assets/icons/codearts-agent.svg` | [Lobe Icons `huaweicloud-color.svg`（华为云厂商品牌）](https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/huaweicloud-color.svg) | `8a5e4cb6452046ecaf3a500e3a89955efdf54bfd0bed46a9c364fbd5f13290e4` |
| `assets/icons/zhida.svg` | [Simple Icons `zhihu.svg`（知乎母品牌）](https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/zhihu.svg) | `3c8d91d4f30d220a8655f17aa4e119f5be8c0d66f5fcf939aecaed8699c628ce` |

## v0.28 Logo 收录（2026-10-21）

本批 SVG/PNG 均原样保存，未重绘或位图矢量化。官方站点或官方仓库素材以其来源与权利人规则为准，仓库软件许可证不自动授予商标或背书授权。OpenFilm [TRADEMARK.md](https://github.com/openfilm/openfilm/blob/main/TRADEMARK.md) 明确名称与 Logo 不在 MIT 软件许可范围内，本仓库仅作产品识别收录。

| 文件 | 来源 | SHA-256 |
| --- | --- | --- |
| `assets/icons/rea.svg` | [REA 官网 `favicon.svg`](https://rea.tools/assets/favicon.svg) | `08a51733fcb21788e8a2c554e694760c385f3aa89a62a1407108839428b724ae` |
| `assets/icons/openfilm.svg` | [OpenFilm 官网 `favicon.svg`](https://openfilm.dev/favicon.svg) | `d00791289a21116fa6930f3901902fcf1122016bb37135177499e0618ff164ac` |
| `assets/icons/craig.svg` | [Craig 官网 `favicon.svg`](https://craig-cli.com/favicon.svg) | `5582889afda3afd32aae209494f6b40ef9e4b2804f830a3e98d5fbb8da3a73d5` |
| `assets/icons/halis-code.png` | [binhdzs1tg/halis-code `apps/desktop/resources/icon.png`](https://raw.githubusercontent.com/binhdzs1tg/halis-code/main/apps/desktop/resources/icon.png) | `037c8b4c3c6133a412ce46c4f95118674d438b1f925cc2a3dab0d8b589c795f3` |
| `assets/icons/emdash.png` | [generalaction/emdash `apps/emdash-desktop/src/assets/images/emdash/icon-light.png`](https://raw.githubusercontent.com/generalaction/emdash/main/apps/emdash-desktop/src/assets/images/emdash/icon-light.png) | `8985ef02c5bb7ee17447c16fbc63c1fe5eb4a98e2cce9bb1b4ec252935ca73c2` |

## v0.29 Logo 收录（2026-10-22）

本批 SVG 均原样保存，未重绘。官方站点或官方仓库素材以其来源与权利人规则为准，仓库软件许可证不自动授予商标或背书授权。PNG 原样保存为位图，未转换成 SVG。Claude Duet 沿用已核验的 `icons/claude.svg`（Lobe Icons Claude 厂商品牌）。

| 文件 | 来源 | SHA-256 |
| --- | --- | --- |
| `assets/icons/pandacode.svg` | [aicodeking/pandacode `website/public/favicon.svg`](https://raw.githubusercontent.com/aicodeking/pandacode/main/website/public/favicon.svg) | `5bc10316aaa64079a9eecbc3adf41d32b30efc7283b2f6e936c1cf90b593a68d` |
| `assets/icons/band.svg` | [BAND 官网 `favicon.svg`](https://www.band.ai/favicon.svg) | `f2210d2032d181763f72b20ce55bc7d27307a6060ff8615415b32bb4eac215ce` |
| `assets/icons/aulos.png` | [Steve-pixel-cpu/aulos `static/icon-default.png`](https://raw.githubusercontent.com/Steve-pixel-cpu/aulos/main/static/icon-default.png) | `7a5264eacc56f55ac25632424a8e4042f5cadd860857b9d0330c23950c7106a0` |
