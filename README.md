# Agent Catalog

供项目复用的私有 AI 应用目录：一份规范数据源，一个 `@alienhub/agent-catalog` 包，按需使用核心查询、React 图标组件和 SVG 资源。

- **核心入口**：结构化元数据、筛选、搜索、来源与集合查询；零运行时依赖，不依赖 React
- **`/icons`**：按应用 ID 获取真实 SVG、Data URI 和原始资源路径
- **`/react`**：React 18 / 19 的 `AppIcon`，自带缺失图标回退
- **原始资源**：JSON 与 SVG 子路径导出，便于其他工具链复用
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
} from '@alienhub/agent-catalog';

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
| `edition` | `edition` 原值 |
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
} from '@alienhub/agent-catalog/icons';

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

未知应用或没有可靠 SVG 的应用，`getAppIcon()` 返回 `undefined`。不要将元数据中的相对 `icon` 路径直接当作你的站点已部署 URL；可使用 `dataUri`，或通过构建工具将原始 SVG 发布到自己的资源目录。使用 Data URI 时，站点的内容安全策略需要允许相应的 `img-src data:`。

### React

```tsx
import { AppIcon } from '@alienhub/agent-catalog/react';

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

`AppIcon` 接受 `appId`、`size`（默认 `24`）、`alt`、`title`、`decorative`（默认 `false`）及 `fallback`。缺失 SVG 时默认显示文本首字占位，不生成或冒充官方 Logo；可传入自定义 React 节点，或用 `fallback={null}` 隐藏缺失图标。图标仅装饰旁边已有的文字时可使用 `decorative`。

## 原始数据与 SVG 子路径

公开包入口包含：

```text
@alienhub/agent-catalog
@alienhub/agent-catalog/react
@alienhub/agent-catalog/icons
@alienhub/agent-catalog/dataset.json
@alienhub/agent-catalog/evidence.json
@alienhub/agent-catalog/schema.json
@alienhub/agent-catalog/collections.json
@alienhub/agent-catalog/metadata.json
@alienhub/agent-catalog/icons/<filename>.svg
```

支持 JSON import attributes 的运行时可直接加载 JSON：

```js
import dataset from '@alienhub/agent-catalog/dataset.json' with { type: 'json' };
```

其他环境请按其 JSON/SVG 加载规则配置；原始 SVG 导出不是 React 组件。原始 JSON 是文件资源，不经过核心模块的运行时冻结。如果只需要查询，请优先使用核心入口。

## 数据含义与限制

当前导入快照为 v0.4（2026-10-02），SDK 包版本独立演进。规范文件位于 `data/`，图标位于 `assets/icons/`；`data/metadata.json` 记录快照版本、日期、源提交及核验范围。`website/` 中不维护第二份数据。

- `id` 标识应用的具体条目、形态或版本；已有 ID 应保持稳定
- `product_id` 关联同一产品的不同条目，`vendor_id` 关联供应商，不能用条目数量冒充独立产品数量
- `interfaces` 描述 CLI、桌面 GUI、Web、IDE 扩展等交互形态；`platforms` 描述支持系统
- `edition` 表示产品版本定位，不保证某地区可访问、可注册或有资格使用
- `evidence.json` 中的 `sources`、`notes` 和 `verified_at` 保留来源、核验日期及例外说明；官网资料核对不代表安装或运行测试
- 缺失可靠 SVG 的记录保留空 `icon` 与相应 `svg_status`；不能用位图改后缀或猜测的图形补齐
- 这是版本化快照，不是实时服务状态；维护时需复核来源，保留停服、迁移或未确认事项的说明

## 本地开发与网站构建

```sh
npm install
npm test
npm run verify
npm run build:website
```

`npm run build:website` 从 `website/` 读取界面源码，直接复制规范的 JSON、SVG 和原始许可文本，输出到 `website-dist/`。同时从这些规范源文件生成完整数据 ZIP 与 CSV，保留页面的整包下载功能。它不会从旧站点或旧 ZIP 重新导入数据，也不会自动发布网站。

预览构建结果：

```sh
python3 -m http.server 4173 --directory website-dist
```

然后访问 `http://localhost:4173`。请通过 HTTP 预览，直接打开 HTML 文件可能因浏览器限制无法 `fetch` JSON。

```text
data/                  规范 JSON 数据、来源、集合和原始 Schema
assets/icons/          原始 SVG 文件
src/                   核心查询、图标入口和 React 组件源码
licenses/              随附原始第三方许可文本
website/               静态站点源码，不含数据副本
scripts/               生成与校验脚本
website-dist/          可重新生成的静态站点输出
```

更新流程与贡献要求见 [CONTRIBUTING.md](./CONTRIBUTING.md)。代码为私有 `UNLICENSED`；第三方素材保留原有声明和权利边界。
