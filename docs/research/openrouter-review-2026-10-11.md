# OpenRouter 应用采集与核验（2026-10-11）

公开来源：[OpenRouter Apps](https://openrouter.ai/apps)。抓取时间与页面SHA-256见 `openrouter-apps-2026-10-11.json`。采集热门、趋势、类别榜以及日/周/月全球榜的公开服务器数据，合计273个去重OpenRouter应用ID。服务器载荷包含比首屏列表更多的条目；273不是首屏显示数，不是完整平台或全市场应用数。

榜单只代表选择公开用量追踪的项目。不同来源ID可同名，也可能是框架、模型代理、内部任务、评测或数据生成脚本。排名、类别和用量均不进入规范应用身份字段。采集器只解析JSON，不执行页面脚本、不请求候选URL、不直接写入目录，页面结构变化时明确失败。

## 已收录

| 产品 | 独立形态 | 核验要点 |
| --- | --- | --- |
| Step Code | CLI | 官方终端应用，Windows原生beta与WSL说明保留；地区登录配置不拆产品；MIT及Pi衍生声明单独核验 |
| Freebuff | GUI、CLI、Web | 官方桌面下载、npm CLI与Web/Cloud/Chat入口；Web同站用途合并说明；Codebuff框架不是额外应用 |
| omp | CLI | Stencil Labs官方终端文档及Windows原生支持；内置IDE工具不等于IDE插件 |
| CodeGPT | IDE 插件（VS Code） | 官网直接关联DanielSanMedium.dscodegpt；JetBrains链接本次404，CLI未完成独立发行核验 |
| Strix | CLI、Web | CLI源码与独立app.strix.ai托管平台；Apache-2.0不推定托管服务开源 |
| SillyTavern | Web | 可本地部署的浏览器前端，不收作原生GUI；核验AGPL许可 |
| Lemonade | Web | lemonade.gg游戏创作平台，不是同名模型运行器；官网供应商Lemonade Labs, Inc. |
| Proto | GUI | 官网明确桌面alpha、macOS/Windows/Linux；营销站和榜单类别不额外制造Web/CLI记录 |
| ISEKAI ZERO | Web | 旧isekai.world迁移至isekaizero.ai；仅确认品牌，未推定法律实体 |
| Craft | Web | RPG创作及Orbit助手，不是同名文档软件；供应商采用官网品牌 |
| Digen AI | Web | 实际Web视频Agent；OpenRouter的CLI标签不作为CLI发行依据 |
| Framer | Web | 官网AI design agent与网页设计产品 |
| GDevelop | GUI、Web | 桌面三个系统及editor.gdevelop.io；不收移动端；AI能力属于本体 |
| Rosebud AI | Web | 官网及lab浏览器游戏创建入口 |
| Fliki | Web | 官网视频、AI语音创建入口 |
| Websim | Web | 当前官方品牌及创建游戏/应用页面；榜单名websim agent保留别名 |
| HighLevel | Web | 官网AI营销、销售与工作流平台；应用内能力不逐个拆产品 |
| Letta | CLI、GUI、Web | 当前桌面发行文档仅核验macOS Apple Silicon，README更多平台声明不替代可确认下载；CLI与chat.letta.com经官方交叉确认 |

新增24条应用、18个产品。CLI系统兼容性未完整核验的列表留空，不因npm/Python跨平台就推断支持所有系统。所有应用ID由本目录定义，OpenRouter ID只保留在发现和映射文档中。

## 素材与许可

15份原始Logo：4 SVG、11 PNG，保留来源页、原始下载URL、尺寸、字节数和SHA-256。PNG按位图标注，不计入SVG。没有把ICO转换或重新描画为SVG。

Step Code未确认专属Logo，留空。Digen原始favicon视觉上没有可识别品牌图形，不收作Logo。Letta许可证明确将名称、Logo、图像及ASCII排除于代码许可，因此本轮未收其品牌素材。GDevelop许可明确品牌归Florian Rival，按原始品牌素材记录，不宣称MIT授权覆盖Logo。

开源标记按具体可运行实现核验：Step Code、Freebuff CLI/桌面、Strix CLI、SillyTavern本地Web、GDevelop桌面、Letta CLI。托管平台未自动继承源码许可；维护状态保持未知，不凭提交活跃度推定持续维护。CodeGPT付费套餐有官网依据，其他商业分类未补则表示未知。

## 暂缓与剩余候选

Janitor官网本次403；Minds只有营销页身份，实际应用入口及IM渠道未核验；CodeGPT JetBrains安装链接本次404。它们保留为候选，不伪造当前发行信息。

Nous Research API是API入口，LangChain是框架；Portkey独立AI交互应用范围需另查；Mira是Telegram原生助手，IM按接入渠道处理。其他候选尚未核验；公开载荷里的内部域名、评测、数据生成任务及代理名称没有被访问或按品牌词自动关联。

所有已收录应用的逐项官方URL与说明在 `data/evidence.json`，来源ID映射及素材哈希在 `openrouter-review-2026-10-11.json`。采集快照始终保留为发现时的未验证数据，核验决策独立保存，便于后续复查。
