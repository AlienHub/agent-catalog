# 维护与贡献

本仓库是私有数据与 SDK 项目。一次变更应保持规范 JSON、来源记录、集合、SVG、生成产物和说明的一致性。

## 1. 以规范源文件为准

- 应用元数据：`data/dataset.json`
- 来源、核验日期与限制说明：`data/evidence.json`
- 集合成员：`data/collections.json`
- 快照版本、日期、来源提交与 `provider_count`：`data/metadata.json`
- 字段约束：`data/schema.json`（不要为供应商目录改动此文件）
- 模型供应商 / 中转站：`data/providers.json`、`data/providers-schema.json`、`data/provider-evidence.json`
- SVG：`assets/icons/`
- 原始第三方许可：`licenses/`
- 浏览界面：`website/`

不要编辑生成的 SDK 文件或 `website-dist/` 来代替修改源文件，也不要在 `website/` 新增 JSON 快照。网站与包必须读取相同的规范数据。现有 `data/schema.json` 保持原样；数据修订不应顺带修改 Schema、放宽约束或改变已有字段含义。确需演进 Schema 时，另行提出兼容性方案与评审。

## 2. 更新记录与证据

1. 先检查是否已有同一产品或形态，避免重复条目
2. 保持现有 `id`、`product_id` 和 `vendor_id` 稳定；名称变化不应自动导致 ID 变化
3. 更新名称、别名、产品与供应商关联、类型、官网、系统、形态及版本等适用字段
4. 同时维护 `evidence.json` 中该 ID 的 `sources`、`notes` 和实际 `verified_at` 日期
5. 检查 `collections.json` 的成员是否需要更新，并确保每个成员 ID 都存在
6. 规范数据快照变更时同步更新 `metadata.json` 的版本、日期与来源信息，保留核验范围和版本定位的限制说明
7. 在变更说明中列出新增、修改、移除的条目与原因，注明证据不足的部分

只保留有依据的别名与支持系统。未知项应保持明确，不根据相近产品猜测。`edition` 描述产品版本定位，不代表地域访问保证。官网和资料核对不等于安装、运行、兼容性、性能或安全测试；不要将未执行的测试写入核验说明。

停服、迁移、旧版状态及其他重要例外应保留在记录来源说明中。当前网站还保留原站的条目提示；若相关状态变化，同时检查 `website/app.js` 的展示提示，避免与证据相矛盾。

## 3. 维护 SVG 与声明

- 只加入真实、可追溯的 SVG 矢量资源；不要将位图改后缀，也不要把猜测或生成的图形当作官方 Logo
- 记录素材来源；检查它是否来自官方或明确标注的第三方图标库
- 检查 SVG 是否含不必要的脚本、事件处理器、外部请求或其他主动内容
- 元数据 `icon` 使用 `icons/<filename>.svg`，实际源文件放入 `assets/icons/<filename>.svg`
- 找不到可靠 SVG 时保持空 `icon`，并用 `svg_status` 明确说明；保留文本或自定义界面回退
- 保留随附的原始授权声明。新增来源时，按其实际要求补充 `licenses/` 和 `THIRD_PARTY_NOTICES.md`
- MIT、CC0 或公开下载不代表取得品牌背书或商标许可；不要为第三方 Logo 添加本仓库无权授予的授权

## 4. 校验与构建

在仓库根目录执行：

```sh
npm install
npm test
npm run verify
npm run build:website
```

测试包含针对导入快照的数量及新增 ID 回归断言。合法增删记录时，同步审阅 `tests/catalog.test.mjs` 与 `tests/fixture/` 的预期，不要仅为通过测试而删除断言。

提交前确认：

- Schema 仍保持原样，规范 JSON 可解析，已有稳定 ID 未被意外改动
- 每条应用有对应来源记录，集合成员没有悬空 ID
- 非空 `icon` 路径都能找到实际 SVG，缺失 SVG 的回退行为明确
- 核心入口不引入 React 或其他运行时依赖；React 用法限于可选 `/react` 入口
- 搜索、筛选、未知 ID、未知集合、数组筛选、空值及运行时只读行为有相应测试
- 包导出包含核心、`/react`、`/icons`、原始 JSON（含 providers）与 SVG 子路径
- `website-dist/` 中的 JSON 与 `data/` 一致，SVG 来自 `assets/icons/`，原始许可文本随构建保留
- 完整 ZIP 下载由规范数据自动生成，包含 JSON、CSV、SVG、来源、集合和许可；原始数据、Schema 与来源链接可用

可用以下命令本地预览网站：

```sh
python3 -m http.server 4173 --directory website-dist
```

检查搜索、各维度筛选、集合切换、清除筛选、详情与字段说明开关、JSON/CSV 导出、有图标与缺失图标的条目，并检查窄屏布局。构建成功不等于完成浏览器或真实产品安装测试；在变更说明中区分已运行和未运行的验证。

## 5. 提交与使用方升级

提交说明应记录数据来源和变更原因、API 兼容性影响、验证结果及仍存在的限制。不要提交访问令牌、私钥、个人凭据或带凭据的 Git 地址。

私有仓库更新与对外发布是不同动作；本地构建不会发布 npm 包或部署站点。使用方推荐安装固定完整提交 SHA，并在升级时检查元数据与 API 变化。不要通过移动旧提交或更改稳定 ID 来隐藏破坏性变化。
