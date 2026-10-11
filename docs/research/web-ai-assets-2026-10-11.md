# Web AI 覆盖与资产核验 — 2026-10-11

基线：main `7f8166a`，321 条应用、190 个产品，129 条 Web 应用，其中 27 条缺 Logo。此分支新增 25 条独立 Web 应用（25 个新产品），为 5 条现有 Web 记录补图，不重命名、不移除、不修改 Schema/SDK/UI/快照版本。分支结果 346 条应用、215 个产品、154 条 Web；

## 新增范围

| 类别 | 独立应用 |
| --- | --- |
| 搜索/研究/文档 | Consensus、Elicit、SciSpace、ChatPDF、Felo |
| 通用任务工作空间 | Manus、Genspark |
| 写作 | Jenni、JotBot、DeepL Write |
| 开发原型 | Google AI Studio |
| 演示/设计 | Beautiful.ai、Slidesgo、Uizard |
| 图像/视频 | Krea、fal、Higgsfield |
| 音频/音乐 | Fish Audio、AIVA、SOUNDRAW |
| Agent/工作流 | Relevance AI、Lindy、n8n、Zapier Agents、Gumloop |

这些条目由官网可操作 Web 界面、产品页和官网指向的登录入口核验；营销页作为产品证据，不将纯 API 或模型页面当作独立应用。Google AI Studio 使用 `aistudio.google.com/welcome` 应用入口与官方开发文档双重证据；fal 官网页面包含模型 Playground，收录浏览器交互面而非为每个 API 或模型新增应用。n8n 收录云端及自托管同一 Web 应用，未将源码可见许可标为 OSI 开源。

## Logo 与分类

23 个新增应用取得官方素材；SciSpace 与 Genspark 产品身份/功能可确认，但下载渠道在本次环境返回 403，因此 Logo 留空。补图已有 Dola、Dreamina、HeyGen、Gamma、商汤秒画共 5 条。共 28 个新素材文件：8 SVG、20 PNG，所有原始字节、来源和 SHA-256 见同名 JSON。PNG 明确标注位图，不计为 SVG。Dola/Dreamina 独立品牌；DeepL Write/Zapier Agents 使用官方产品页中的共用品牌 Logo，明确不是专属产品标识。Gamma 来源为官方帮助中心，未使用名称相近的 gammaai.jp。

10 条 Web 服务由官方付费套餐/按量价格核验商业分类；其他新增记录保持未知，未从公司名或免费层推断。核验说明不代表登录运行、兼容性或地域可用性测试。

## 去重与暂缓

- NotebookLM 官网重定向至 Gemini Notebook，已有 `gemini-notebook`，不重复新增。
- 百度 `chat.baidu.com` 重定向至现有文心，未另建百度 AI 搜索。
- 腾讯混元当前官网主要模型/开发门户，未确认独立消费者 Web 助手。
- You.com 当前官网以 API 为主，`for.you.com` 为连接 AI 助手的搜索入口；未确认独立 Web 聊天形态继续服务，暂缓。
- Tome 官网 404，不把历史品牌当作现行服务新增。SlidesAI 主要为 Google Slides/PowerPoint 宿主应用，不直接认定独立 Web。Spline/Google Flow 入口重定向未完成本轮核验，留待后续。
- Leonardo 帮助中心 favicon 是 Intercom 通用图标，不误录为 Leonardo Logo。Liblib/WPS AI/万相等仍待可靠原始资产。

剩余缺 Logo：新增 2 条，加基线未补 22 条，共 24 条 Web 应用。完整 ID 可由 `dataset.json` 筛选 `interfaces=['Web']` 且 `icon=''` 复现。

## 验证

- `npm run validate`
- `npm test`
- `npm run build:cloudflare`
- `node scripts/verify-website.mjs`
- `git diff --check`

数量断言比较生成结果与规范 JSON，仍校验产品去重和原始字段；不硬编码快照数量。未执行真实供应商登录/运行测试，也未手动发布部署；交由主代理 PR 验收统一发版。
