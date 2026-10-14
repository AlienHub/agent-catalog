# Agent Atlas

供项目复用的私有 AI 应用目录：一份规范数据源，一个 `@alienhub/agent-atlas` 包，按需使用核心查询、React 图标组件和 SVG/PNG 资源。

- **核心入口**：结构化元数据、筛选、搜索、来源与集合查询；零运行时依赖，不依赖 React
- **`/icons`**：按应用 ID 获取 SVG/PNG Logo、Data URI 和原始资源路径；SVG 专用查询保持兼容
- **`/react`**：React 18 / 19 的 `AppIcon`，自带缺失图标回退
- **原始资源**：JSON 与 SVG/PNG 子路径导出，便于其他工具链复用
- **`website/`**：静态浏览界面源码，构建时读取同一份 `data/` 与 `assets/icons/`

仓库：[AlienHub/agent-catalog](https://github.com/AlienHub/agent-catalog)。私有仓库访问权限不等于第三方品牌素材授权，详见 [第三方声明](./THIRD_PARTY_NOTICES.md)。

## 安装

构建和安装需要 Node.js 20.19 或更高版本。当前通过 Git 安装；调用方需要具有该私有仓库的访问权限，并已配置可用的 GitHub SSH 身份。不要将令牌、密码或其他凭据写入安装地址、代码或锁文件。

```sh
npm install git+ssh://git@github.com/AlienHub/agent-catalog.git
```

建议在应用中锁定经过验证的完整提交 SHA，并提交项目锁文件，避免默认分支的数据更新改变构建结果：

```sh
npm install 'git+ssh://git@github.com/AlienHub/agent-catalog.git#<commit-sha>'
```

只使用核心查询时，无需安装 React。需要 React 组件时，在使用方项目中安装 React 18 或 19：

```sh
npm install react@^19 react-dom@^19
```

## 核心用法

```ts
import {
  apps,
  catalogMeta,
  getApp,
  findApps,
  searchApps,
  getAppsByVendor,
  getAppsByProduct,
  getEvidence,
  getCollection,
} from '@alienhub/agent-atlas';

const chatgpt = getApp('chatgpt');
const sources = getEvidence('chatgpt');
const openaiApps = getAppsByVendor('openai');
const productVariants = getAppsByProduct('chatgpt');
const chineseAgents = getCollection('chinese_agents');

const desktopApps = findApps({
  interface: 'GUI',
  platform: ['macOS', 'Windows'],
  hasSvg: true,
});

const codingTools = searchApps('编程 CLI', { hasSvg: true });
console.log(catalogMeta.recordCount, catalogMeta.productCount, apps.length);
```

`apps`、记录中的数组及其他导出的元数据在运行时递归冻结，并提供只读类型。请复制到自己的对象后再修改；不要直接改变目录数据。查询结果保持源数据顺序，不按模糊相关度排序。

### 导出与查询

| 导出 | 含义 |
| --- | --- |
| `apps` | 全部应用条目 |
| `evidence` | 按应用 `id` 索引的来源与核验记录 |
| `collections` | 集合名称到应用 ID 数组的映射 |
| `schema` | 原始 JSON Schema |
| `catalogMeta` | 从规范数据计算的版本、计数及快照日期信息 |
| `getApp(id)` | 查询单条应用；未知 ID 返回 `undefined` |
| `getEvidence(id)` | 查询单条来源；未知 ID 返回 `undefined` |
| `findApps(filters?)` | 按结构化条件筛选；无条件返回全部条目 |
| `searchApps(query, filters?)` | 文本搜索，可叠加结构化筛选 |
| `getAppsByVendor(vendorId)` | 以供应商 ID 查询，不使用供应商展示名称 |
| `getAppsByProduct(productId)` | 查询同一产品的各形态或版本 |
| `getCollection(name)` | 获取集合中的应用；未知名称返回空数组 |

`catalogMeta` 包含 `schemaVersion`、`dataVersion`、`recordCount`、`productCount`、`vendorCount`、`svgRecordCount`、`svgFileCount`、`missingSvgRecordCount` 与 `verifiedAt`。其中 `verifiedAt` 为快照日期，逐条核验日期请读取相应 evidence 的 `verified_at`。应用条目、独立产品、拥有 SVG 的条目和 SVG 文件数是不同统计口径；多个条目可以共用同一个图标。请读取这些字段，不在业务代码中硬编码快照数量。

### 筛选与搜索语义

`CatalogFilters` 支持：

| 字段 | 匹配内容 |
| --- | --- |
| `vendorId` | `vendor_id` |
| `productId` | `product_id` |
| `interface` | `interfaces` 中的值，例如 `CLI`、`GUI`、`Web` |
| `type` | `type` 原值 |
| `platform` | `platforms` 中的值 |
| `collection` | 集合名称，例如 `chinese_agents` |
| `hasSvg` | 布尔值，是否有随包提供的 SVG |

`collection` 接受单个集合名称，`hasSvg` 接受布尔值，其余筛选字段可传单个字符串或只读字符串数组。同一字段的数组是“或”，不同字段之间是“且”；显式传入空数组会匹配零条记录。结构化筛选使用数据中的准确值。

文本搜索先执行 Unicode NFKC 规范化、去除首尾空白，再按空白分词，采用不区分大小写的子串匹配；所有词都需命中，但可分散命中不同字段。搜索范围包含名称、ID、别名、供应商、供应商 ID、产品 ID、类型、版本、交互形态和系统。它不是拼音、翻译或拼写纠错搜索。空查询只应用结构化筛选。

## 图标

```ts
import {
  getAppIcon,
  getIconSvg,
  getIconDataUri,
  iconPaths,
} from '@alienhub/agent-atlas/icons';

const icon = getAppIcon('chatgpt');
if (icon) {
  // icon = { appId, path, svg, dataUri }
  console.log(icon.path); // 资源相对路径，例如 icons/chatgpt.svg
  const img = document.createElement('img');
  img.src = icon.dataUri;
  img.alt = 'ChatGPT';
  document.body.append(img);
}

const firstPath = iconPaths[0];
if (firstPath) {
  const svgSource = getIconSvg(firstPath);
  const dataUri = getIconDataUri(firstPath);
}
```

未知应用或没有可靠 SVG 的应用，`getAppIcon()` 返回 `undefined`。读取两种格式请使用 `getAppLogo(appId)`，返回 `{ appId, path, format, mimeType, dataUri }`；`format` 明确为 `SVG` 或 `PNG`。不要将元数据中的相对 `icon` 路径直接当作你的站点已部署 URL；可使用 `dataUri`，或通过构建工具将原始 SVG 发布到自己的资源目录。使用 Data URI 时，站点的内容安全策略需要允许相应的 `img-src data:`。

### React

```tsx
import { AppIcon } from '@alienhub/agent-atlas/react';

export function Example() {
  return (
    <>
      <AppIcon appId="chatgpt" size={32} title="ChatGPT" />
      <AppIcon appId="chatgpt" size={24} decorative />
      <AppIcon appId="unknown-app" fallback={<span>暂无图标</span>} />
      <AppIcon appId="unknown-app" fallback={null} />
    </>
  );
}
```

`AppIcon` 接受 `appId`、`size`（默认 `24`）、`alt`、`title`、`decorative`（默认 `false`）及 `fallback`。缺失 SVG 和 PNG Logo 时默认显示文本首字占位，不生成或冒充官方 Logo；可传入自定义 React 节点，或用 `fallback={null}` 隐藏缺失图标。图标仅装饰旁边已有的文字时可使用 `decorative`。

## 原始数据与 SVG/PNG 子路径

公开包入口包含：

```text
@alienhub/agent-atlas
@alienhub/agent-atlas/react
@alienhub/agent-atlas/icons
@alienhub/agent-atlas/dataset.json
@alienhub/agent-atlas/evidence.json
@alienhub/agent-atlas/schema.json
@alienhub/agent-atlas/collections.json
@alienhub/agent-atlas/metadata.json
@alienhub/agent-atlas/icons/<filename>.svg
@alienhub/agent-atlas/icons/<filename>.png
```

支持 JSON import attributes 的运行时可直接加载 JSON：

```js
import dataset from '@alienhub/agent-atlas/dataset.json' with { type: 'json' };
```

其他环境请按其 JSON/SVG 加载规则配置；原始 SVG 导出不是 React 组件。原始 JSON 是文件资源，不经过核心模块的运行时冻结。如果只需要查询，请优先使用核心入口。

## 数据含义与限制

当前导入快照为 v0.20（2026-10-14），SDK 包版本独立演进。规范文件位于 `data/`，图标位于 `assets/icons/`；`data/metadata.json` 记录快照版本、日期、源提交及核验范围。`website/` 中不维护第二份数据。

- `id` 标识应用的具体条目、形态或版本；已有 ID 应保持稳定
- `product_id` 关联同一产品的不同条目，`vendor_id` 关联供应商，不能用条目数量冒充独立产品数量
- `interfaces` 只允许 GUI、CLI、IDE 插件、Web、浏览器插件、小程序，且每条记录只有一个值；每个形态独立定义为应用并拥有独立 `id`。`product_id` 关联产品，`platforms` 描述该应用支持系统。浏览器插件和小程序各自独立分类；钉钉内嵌 AI 能力归 GUI；IM 是接入渠道，不单独计为应用。
- `evidence.json` 中的 `sources`、`notes` 和 `verified_at` 保留来源、核验日期及例外说明；官网资料核对不代表安装或运行测试
- 缺失可靠 Logo 的记录保留空 `icon`；PNG 保留 `.png` 后缀并在 `svg_status` 标注位图及 SVG 缺失；不能用位图改后缀或猜测的图形补齐
- 这是版本化快照，不是实时服务状态；维护时需复核来源，保留停服、迁移或未确认事项的说明

## 本地开发与网站构建

```sh
npm install
npm test
npm run verify
npm run build:website
```

`npm run build:website` 从 `website/` 读取界面源码，直接复制规范的 JSON、SVG/PNG 和原始许可文本，输出到 `website-dist/`。同时从这些规范源文件生成完整数据 ZIP 与 CSV，保留页面的整包下载功能。它不会从旧站点或旧 ZIP 重新导入数据，也不会自动发布网站。

预览构建结果：

```sh
python3 -m http.server 4173 --directory website-dist
```

然后访问 `http://localhost:4173`。请通过 HTTP 预览，直接打开 HTML 文件可能因浏览器限制无法 `fetch` JSON。

```text
data/                  规范 JSON 数据、来源、集合和原始 Schema
assets/icons/          原始 SVG/PNG 文件
src/                   核心查询、图标入口和 React 组件源码
licenses/              随附原始第三方许可文本
website/               静态站点源码，不含数据副本
scripts/               生成与校验脚本
website-dist/          可重新生成的静态站点输出
```

更新流程与贡献要求见 [CONTRIBUTING.md](./CONTRIBUTING.md)。代码为私有 `UNLICENSED`；第三方素材保留原有声明和权利边界。


### 网站交互依赖与构建

网站使用独立的 `website/package.json` 与锁文件：React 19、Motion，以及自主实现的原生语义动作按钮。它们不进入核心 SDK 的运行时依赖或 npm 包导出；`prepare` 仍只构建 SDK。

```sh
npm ci
npm ci --prefix website
npm run verify
npm run build:website
```

界面按钮由项目自主实现，基于 Motion 提供轻微悬停/按压反馈。React、Motion 等保留各自许可，发布产物包含 `website-notices.txt`。系统“减弱动态效果”会关闭位移与缩放；原生 dialog 保留焦点约束、Escape 和关闭后的焦点恢复。

`tests/website.test.mjs` 执行编译后 React 应用的 JSDOM 交互与计算样式回归，以及动画控制器竞态测试。JSDOM 不等于浏览器视觉验收；真实移动端布局、原生焦点与动画视觉仍需浏览器测试。


### 开源应用与版本级授权元信息

v0.5 补录20个产品、29条CLI/Web/GUI/IDE形态；v0.6 完成 Sentra 缺口补录后，v0.6 为279条记录、185个产品；v0.7 拆分交互形态后为303条应用记录、185个产品。`data/dataset.json` 与当时13字段主schema不变；新增 `data/open-source.json` 以具体记录ID关联仓库、许可证、应用类别、维护状态及来源，`data/open-source-schema.json` 描述该独立结构。

- `open-source`：本轮核验了该发行形态的开源许可；不自动延伸到同品牌云服务或其他客户端
- `source-available`：源码可见但有附加用途/商标等限制，不进入“仅已核验开源”筛选
- 没有元信息：尚未核验，不等于闭源。维护状态unknown也不代表停止维护；仓库push时间不等于代码commit时间或仍受维护的证明
- 桌面/命令行平台是官方资料声明，未做安装、运行或区域可用性测试；缺SVG的新增项保持明确缺失

SDK原函数与 `CatalogApp` 结构不变，新增原始JSON子路径：

```js
import sourceMetadata from '@alienhub/agent-atlas/open-source.json' with { type: 'json' };
```

网站详情呈现仓库、许可证、类别和核验说明。完整ZIP包含两份新JSON及独立 `open-source.csv`；原 `dataset.csv` 的字段不变。当前56条元信息中52条开源、4条源码可见，未宣称穷尽全部开源软件。未将仍需复核的历史停维条目、开发框架、混合云/自托管版直接标为开源。


### Agent Atlas 命名迁移

项目展示名为 Agent Atlas，私有包名为 `@alienhub/agent-atlas`。从旧包名迁移时需更新 import/require 路径；核心API、数据结构与各子路径内容保持兼容。仓库地址仍为 `AlienHub/agent-catalog`，没有重命名仓库或发布npm包。现有private/UNLICENSED设置不变，公开分发与最终代码许可需另行决定。


### 可自托管趋势服务（尚未连接）

趋势服务位于 `services/trends`，使用 Cloudflare Workers + D1，统一网站、API、定时采集的部署说明见 `cloudflare/README.md`。代码与模板不代表已创建资源或已开始采集；当前网站 `website/trends-config.json` 的 `apiBaseUrl` 为 `null`，详情会明确显示“尚未连接采集服务”。没有模拟数据作为生产历史。

Cloudflare 构建使用同源 API，并在所有页面、资源与 API 前校验 owner-only Access 身份；未配置默认拒绝访问。原 Site 构建保持未连接状态。服务器端保存GitHub凭据；网站不包含token或直接调用GitHub认证接口。每日采样与页面访问分离，缺失日期留空；7/30天净变化缺少对应基准时显示“数据积累中”。Star曲线代表从首次采集起的每日实测总数，不把新增star事件累加成伪造的历史总量。提交统计与活动状态单独展示，202表示生成中而非零提交。

仓库仍为私有，npm仍禁止发布。本次没有创建Cloudflare资源、登录账号或启用采集Cron。

完整集成校验（开发环境使用Node 24；核心SDK运行时最低版本不变）：

```sh
npm run verify:all
```

其中趋势模块测试使用Node内置SQLite与模拟HTTP，验证迁移/采样/重试语义，不代表已连接Cloudflare或执行生产采集。

Unified private Cloudflare website + API deployment now lives in [cloudflare/README.md](cloudflare/README.md). Standalone trends deployment is retired; the current Site is unchanged.

### 网站开源与商业标签

“开源”和“商业”分别核验，允许同时成立。开源依据具体版本的代码仓库和许可证；商业依据该记录对应的官方付费套餐、订阅、按量计费或企业服务，而非公司名称、源码可见或非 OSI 许可证。免费层不排除商业服务。

`data/commercial.json` 为独立商业服务元数据，逐条记录核验日期、范围说明和官方来源。商业标签不推断闭源，也不保证某地区或形态一定可购买。不同地区版本分别核验，不按供应商或产品 ID 自动继承。尚无开源或商业分类依据的记录进入“未知”，不意味着它没有商业服务。2026-10-05 已核验 52 个产品的 81 条记录；尚未完成全目录商业服务核验。


### Sentra 缺口补录（v0.6）

2026-10-10 根据 sentra-lib revision `2cdefd26c0f5f1cebec0aeab33d0a9c84ae9558f` 的注册项调查，新增38条形态记录，涉及26个建议新增产品、2个历史产品及QoderWake/TRAE插件两类已有产品的新形态；新增28个product_id，目录总计279条记录、185个产品。38条形态记录来自30个待补录的Sentra注册ID，不代表原先38个缺口已全部解决。

- iFlow CLI与Roo Code按历史项目收录；Tabnine CLI进入维护模式，官方计划2026-12-31后弃用，列表和详情显示对应提示。
- Mux采用现名Xum并保留旧名；Crush当前主分支为FSL-1.1-MIT源码可见，不标为OSI开源。
- Coder、Marvis、WorkBuddy AI、Moxby、Terramind仍待身份核验；Sentra自身、VS Code宿主和MCPJam不作为独立Agent新增。
- 部分产品只补已确认形态，MonkeyCode桌面/CLI等发行包仍待核验。未核实的系统支持清单为空，未取得可靠SVG的记录保留空icon；未做安装、运行或服务可用性测试。

完整调查见[38项调查](docs/research/sentra-agent-gaps-2026-10-10.md)，实际新增ID与Sentra映射见[补录清单](docs/research/sentra-gap-update-2026-10-10.json)。正式主schema和已有稳定ID保持不变。

## v0.7 交互形态迁移（历史规则，边界分类由 v0.8 更正）

每条应用只属于 GUI、CLI、IDE 插件、Web 之一。为保留 JSON 字段路径，`interfaces` 仍是数组，但 Schema 和 TypeScript 将其约束为单元素。现有单形态 ID 保留；原聚合 ID 归属迁移表中的首个应用，其余形态新增 ID。按产品聚合请使用 `getAppsByProduct(product_id)`，不要再把旧聚合 ID 当作完整产品。

同一产品、同一地区可以有多个 GUI 宿主应用（例如原生客户端与浏览器扩展）；桌面和移动系统暂仍通过 `platforms` 表达。浏览器扩展归 GUI 并单独保留应用记录，IM、小程序远程调度等渠道保留在核验说明中。Web 中的可视化界面不额外算 GUI。Dify、FastGPT 保留 Web 记录；Mistral Vibe 的开源许可只关联 CLI，不从 CLI 推断托管 Web 服务开源。

[迁移明细](interaction-form-migration-2026-10-11.json)记录原 ID、原形态和拆分后应用 ID；来源与许可证按应用范围保留。更新数据、SDK、CSV、ZIP 和网站时必须同步生成，不维护第二份页面数据。

## v0.8 交互形态边界更正

按用户明确的定义，浏览器插件从 GUI 移至独立类别（7条应用，ID保持不变），恢复 WorkBuddy CN微信小程序的独立应用记录 `workbuddy-cn-mini-program`。当前304条应用记录、185个产品；每条应用仍只有一种形态。钉钉内嵌AI能力属于钉钉GUI应用，保留核验说明，不创建额外插件形态。IM指即时通讯接入渠道，例如通过聊天工具触发Agent，不单独生成应用记录。

[更正明细](interaction-form-correction-2026-10-11.json)。v0.7迁移文档保留历史说明，当前分类以v0.8数据和Schema为准。

## v0.9 浏览器插件名称与商店身份

浏览器插件使用实际插件名称，不追加形态括号；形态仍由 `interfaces` 表示，已有应用 ID 保持稳定。Schema v3 在全部记录增加 `chrome_extension_id`、`edge_extension_id` 两个字符串字段，分别记录官方 Chrome Web Store 与 Microsoft Edge Add-ons 的32位插件ID。非浏览器插件为空；插件字段为空表示尚未确认官方商店条目，不表示确定未发布。兼容 Edge 安装不等于拥有 Edge 商店ID。

目前核验6个Chrome ID、2个Edge ID，来源保留在 `evidence.json`。千问插件的官方发布与正式名称尚未确认，保留原记录且ID留空；Grammarly的Chrome ID由官方安装链接确认，名称由官方Edge商店确认。SDK与网站支持按商店ID搜索，详情提供商店链接；JSON、CSV、ZIP同步包含新字段。

## v0.10 桌面端与浏览器收录范围

主目录仅关注桌面端与浏览器应用，不收录移动端。移除7条仅移动端应用，并从桌面与移动混合记录中移除 iOS、iPadOS、Android、Mobile 等移动平台信息；产品对应的 Web、CLI、IDE 插件与桌面记录保留。鸿蒙电脑使用 `HarmonyOS PC` 平台标签，小程序按既有要求保留。现有目录为297条应用、185个产品。

[范围调整记录](desktop-scope-migration-2026-10-11.json)保留移除的原记录与平台变更，供历史追溯；主数据、核验来源、集合、商业元信息、SDK与网站导出同步移除移动端应用。空缺平台不代表产品不存在移动版本，只表示不纳入本目录。

## v0.11 名称与 CN 版本规范（历史字段，由 v0.12 移除）

地区版本统一使用 `CN`；名称、别名、核验说明与网站字段说明同步使用 CN。应用名称去掉人为添加的 Web、GUI、IDE 插件及宿主等括号后缀，交互形态通过 `interfaces`、宿主通过 `platforms`、版本通过 `edition` 区分。产品本身的正式名称（例如 ChatGPT search、Qoder Desktop、Qwen Code Web UI）保留。不同形态允许同名，稳定应用 ID 与产品关联不变。

## v0.12 移除地区版本字段

Schema v4 删除 `edition` 字段，SDK 的 `CatalogApp`、`CatalogFilters` 同步删除该属性。网站去掉地区版本筛选、卡片标签、详情字段和字段字典项；JSON、CSV、ZIP中不再导出该字段。数据快照版本 `dataVersion` 仍用于追踪更新。已有名称中的 CN 标识、应用ID、产品ID和297条应用记录均保留。

这是数据结构变更：调用方需要移除 `edition` 属性访问及筛选条件，按稳定应用ID识别对应记录。

## v0.13 吸收 PR #1 数据与资产

对过时 PR #1 增量吸收，保留主分支既有ID及桌面/浏览器范围、单形态、CN命名、无edition字段的规范。新增24条应用记录，当前321条应用、190个产品。吸收7份官方SVG，逐一重新下载并匹配SHA-256；同步保留来源和许可。

修正Pochi IDE的包级许可（保留所有权利），不套用仓库根Apache-2.0；补充DeepSeek Harness、MonkeyCode等具体分发的源码证据。已有QoderWake、AiderDesk、TRAE、Zencoder和Pochi记录复用稳定ID；Reasonix CLI/Web不同版本线不重复建记录。移动端和待审候选不进入主目录。

[完整吸收映射](docs/research/pr-1-absorption-2026-10-11.json)与[原始研究归档](docs/research/pr-1-2026-10-09/README.md)保留候选、历史版本线、暂缓原因及素材来源，归档不参与网站/SDK生成。

## v0.14 编程工具品牌素材

补充 14 个 SVG Logo，包含 Kilo Code、Roo Code、JetBrains AI Assistant、Pi、Pochi、ForgeCode、Deep Agents、Rovo Dev、VS Code 等。来源与原始哈希见 [素材清单](docs/research/coding-logo-assets-2026-10-11.json)，剩余缺失项与原因见 [核验报告](docs/research/coding-logo-audit-2026-10-11.md)。

本版本也支持官方原始 PNG，补充 Plandex、MonkeyCode、AiderDesk、Crush、Neovate 5 个 PNG。卡片、下载与数据明确标注 PNG；`hasSvg`、SVG 计数和 `getAppIcon` 仍只针对 SVG，`getAppLogo` 与 React `AppIcon` 支持 SVG/PNG。PNG 原始文件通过 `@alienhub/agent-atlas/icons/*.png` 导出。Schema 版本为 5，数据字段不变。

## v0.15 浏览器与 Web AI 资产

新增 48 条应用：17 个浏览器插件、6 个浏览器 GUI、25 个 Web 应用。Chrome 与 Edge ID 分别核验，共补充 17 个 Chrome ID、9 个 Edge ID。保留共享产品关联，现有应用 ID 不变。Atlas 按官方已弃用的历史 macOS 应用收录，页面显示生命周期提示。

新增 51 份原始 Logo（12 SVG、39 PNG），并补齐 7 条已有应用的 Logo。PNG 始终明确标为位图，不计入 SVG。未确认商店 ID 或素材的字段留空，候选及暂缓原因见 [浏览器核验报告](docs/research/browser-ai-assets-2026-10-11.md) 和 [Web 核验报告](docs/research/web-ai-assets-2026-10-11.md)。来源及 SHA-256 见对应 JSON 清单。

## v0.16 OpenRouter 应用发现

采集 [OpenRouter Apps](https://openrouter.ai/apps) 的公开页面数据，包括热门、趋势、类别榜及日/周/月榜，去重保存273个候选。该快照不是全量AI应用，也不代表全市场热度；榜单仅包含选择公开追踪用量的项目。候选名称、分类和URL仅作线索，不自动导入目录，也不自动访问其URL。

首批通过官网、发行文档、源码/插件商店核验后新增24条应用、18个产品，目录共393条应用、253个产品。新增15份原始Logo（4 SVG、11 PNG）。本轮未确认的系统列表或Logo留空；Letta品牌资产明确排除于代码许可，未收录；Digen官网favicon缺少可辨认图形，未作为Logo入库。

- [采集快照](docs/research/openrouter-apps-2026-10-11.json)
- [核验记录和素材哈希](docs/research/openrouter-review-2026-10-11.json)
- [收录与暂缓说明](docs/research/openrouter-review-2026-10-11.md)

复用采集器时使用新的输出文件名，避免覆盖旧快照：

```sh
node scripts/collect-openrouter-apps.mjs --fetch /tmp/openrouter-apps-new.json
# 或使用已保存的公开HTML，离线解析，不执行页面脚本
node scripts/collect-openrouter-apps.mjs /tmp/openrouter-apps.html /tmp/openrouter-apps-offline.json
```

采集器在页面数据结构变化时明确失败，保留原快照；新的候选仍需人工核验。


## v0.17 Web 应用实际域名

独立保留官网 `website` 与实际应用入口 `web_url`。`web_domains` 仅包含已核验的完整主机名；`web_domain_status` 区分 verified、unverified、self-hosted、not-applicable，`web_domain_verified_at` 单独记录核验日期。空数组不是“不存在域名”。自托管／本地 UI 没有统一公共域名；未核验域名不推测、不从官网直接生成。应用域名不等于 API、CDN、SSO 域名清单，也不自动匹配子域名。共享域名如 ChatGPT 与 Codex 需结合入口路径区分，不能仅按域名唯一识别产品。

SDK 支持 `findApps({ webDomain: 'firefly.adobe.com' })` 精确查找，搜索与 CSV/JSON/ZIP 导出包含新字段。详情页显示核验状态、入口与日期。全部 Web 条目的审计、明确待核验清单及公开 HTTP 观察见 `docs/research/web-domain-review-2026-10-12.json`、`web-domain-http-audit-2026-10-12.json`；HTTP 403／超时不等于产品已停服。

## v0.18 Dropstone CLI、Muse Code 与 OpenCode 版本核验

新增 2 条 CLI 应用、2 个产品，目录共 400 条应用、260 个产品。主 Schema 与已有稳定 ID 不变。

- Dropstone CLI（Blankline）：官方终端编码 Agent。changelog API 核验日最新为 v1.0.59（2026-10-07）；产品页示意界面仍显示 v1.0.52，不作为当前发行版本。未收录未单独核验的 VS Code 扩展或 Dashboard。无可靠 SVG。
- Muse Code（Meta）：官方终端编码 Agent，2026-08-31 博文宣布退出 beta。changelog 核验日最新为 1.4.6。与已有 Meta AI 助手分产品。无可靠 SVG。
- OpenCode CLI：证据更新为官方 changelog v2.0.27（2026-10-12）。已有桌面与 IDE 记录及稳定 ID 保留。

仅核验公开官方资料，未做安装、运行或区域可用性测试。缺失 Logo 的记录保持空 `icon`。

## v0.19 日更候选、Logo 补录与开源元数据

新增 10 条应用、6 个产品，目录共 410 条应用、266 个产品。主 Schema 与已有稳定 ID 不变。Dropstone CLI、Muse Code、OpenCode 2.0 与 Manus Web 已在 v0.18 / 既有快照中，本轮去重后不再重复新增。

- Hermes Agent Desktop（Nous Research）：官方独立 GUI，macOS / Windows / Linux；Windows Store / MSIX 为同一桌面形态。CLI 证据刷新至 v0.21.7。
- XXL-AI 云版 Web 与 Desk 桌面端（许雪里 / XXL 开源社区）：v1.1.1。GPL-3.0 非 or-later，记 source-available。
- AgentOS Enterprise Web（openJiuwen）：自托管 jiuwenswarm 工作台，Apache-2.0。
- OpenPilot 桌面端：Windows 与 macOS 发行资产来自 GitHub Releases v1.0.5；仓库无 LICENSE 文件，不写入 open-source.json。
- Octo Web 与桌面端（明略科技）：Apache-2.0 自托管人机协作平台。
- 星辰超级智能体 TeleAgent 桌面端（中国电信）：Windows / macOS / 银河麒麟 / 统信 UOS。Android 与维护中的网页版未收录。
- guilds.run Web（CigaleAI）：AGPL-3.0 自托管多 Agent 平台。
- Manus Studio 桌面端：与已有 Manus Web 同产品；沿用已核验官方 SVG。

Logo：OpenClaw / Hermes Agent 使用 Lobe Icons 纯矢量 SVG；Agent Zero / QwenPaw / bolt.diy 使用官方仓库 SVG；扣子 CN 桌面端与智谱清言桌面端沿用已有品牌 SVG。AstrBot 官方 SVG 含 foreignObject，未打包。

开源元数据补录 Warp 客户端 AGPL-3.0、OpenHands、Ollama、LM Studio CLI、Pinokio、GPT4All、Cline CLI/桌面、OpenCode IDE、Qwen Code IDE、Jan CLI、AnythingLLM Web；Tabby 因 ee/ 记 source-available。全部 open-source.json 条目已用 GitHub API 刷新 `checked_at` / `last_push_at` / `github_archived`。

## v0.20 日更候选（2026-10-14）

新增 7 条应用、4 个产品，目录共 417 条应用、270 个产品。主 Schema 与已有稳定 ID 不变。相对 v0.19 / `catalog/daily-20261013`。

- Xiryn Web（Sourav Bera）：MIT 自托管个人 Agent；本机 Web UI `127.0.0.1:6796`。GitHub Releases **v0.4.1**。Telegram 为控制渠道，不单列。
- Kai Web 与 macOS 桌面端（Morgen）：官方行政助理。Web 入口 `web.hirekai.ai`；桌面下载页仅确认 Apple silicon / Intel .dmg，不填写 Windows/Linux。
- Sugabots Web（Nitric）：MIT 自托管人机协作工作区；官方 Quickstart 一键 Docker，访问 `localhost:3000`。GitHub Releases **v0.2.0**。
- Agency Orchestrator CLI / Web / 桌面端（jnMetaCode）：Apache-2.0。CLI 为 npm **0.20.0**；Web 为本地 `ao web` / Docker Studio；桌面端 **desktop-v0.4.12** 实际资产为 macOS 与 Linux，不据旧版填写 Windows。`agency-agents-zh` 仅为提示词库，不收录。

Logo 均为官方原始 SVG：Xiryn 官网 `icon.svg`、Kai 官网 `icon.svg`、Sugabots 仓库 `sugabots-logo.svg`（品牌资产不在 MIT 范围内）、Agency Orchestrator 仓库 `ao-mark.svg`。

仅核验公开官方资料，未做安装、运行或区域可用性测试。
