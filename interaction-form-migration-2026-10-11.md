# 交互形态规范迁移（2026-10-11）

> 本文记录v0.7的初始迁移。用户随后更正了边界：v0.8将浏览器插件独立分类，并恢复微信小程序记录；当前规范见[更正明细](interaction-form-correction-2026-10-11.json)。

v0.7：303 条应用记录、185 个产品；v0.6 为279条聚合/单形态记录。产品数不因形态拆分而增加。

## 定义

- GUI：安装或宿主运行的图形应用，包括原生客户端和独立浏览器扩展。桌面/移动系统以 `platforms` 表达；浏览器扩展保留独立应用 ID。
- CLI：命令行应用。
- IDE 插件：IDE 内的插件/集成入口；ACP 接入会在核验说明中明确，不声称存在独立自研插件安装包。
- Web：通过浏览器访问的应用，包括自托管 Web 应用。可视化 Web 页面不额外算 GUI。

每条应用只有一个形态，`interfaces` 保留数组路径但仅允许一个值；同一产品下的独立应用由 `product_id` 关联，`vendor_id` 关联供应商。地区版本继续独立记录。IM 为接入渠道，小程序/钉钉远程调度入口保留在证据说明中。

## 数量

| 形态 | 应用记录 |
| --- | ---: |
| GUI | 92 |
| CLI | 58 |
| IDE 插件 | 29 |
| Web | 124 |

## ID 兼容

全部279个原 ID 保留。聚合 ID 归属下表首个应用，新增形态有独立 ID；调用方需要完整产品时应改用 `getAppsByProduct(product_id)`。这一语义收窄以及 IDE 标签重命名属于 schemaVersion 2 的迁移，不声称完全无行为变化。

商业服务说明从原产品记录继承，迁移不等于新的功能、收费范围或安装核验。许可证不跨形态推断。Dify、FastGPT 的官方部署文档支持浏览器访问，取消旧 GUI 重复标签；Mistral Vibe 仓库的许可只关联 CLI，托管 Web 及 IDE 集成记录保留各自范围。

官方来源：[Dify](https://github.com/langgenius/dify)、[FastGPT](https://github.com/labring/FastGPT)、[Vibe 产品入口](https://mistral.ai/products/vibe/)、[Vibe CLI](https://github.com/mistralai/mistral-vibe)。

## 迁移表

| 原 ID | 原形态 | 当前应用 ID |
| --- | --- | --- |
| `jetbrains-air-ide` | IDE 扩展 | `jetbrains-air-ide` |
| `autoclaw` | GUI / IM | `autoclaw` |
| `autoclaw-cn` | GUI / IM | `autoclaw-cn` |
| `chatgpt` | Web / GUI / 浏览器扩展 | `chatgpt`, `chatgpt-gui`, `chatgpt-browser-extension` |
| `claude` | Web / GUI / 浏览器扩展 | `claude`, `claude-gui`, `claude-browser-extension` |
| `claude-code-ide` | IDE 扩展 | `claude-code-ide` |
| `cline` | IDE 扩展 | `cline` |
| `codebuddy-ide-extension` | IDE 扩展 | `codebuddy-ide-extension` |
| `codegeex` | IDE 扩展 | `codegeex` |
| `codex-ide` | IDE 扩展 | `codex-ide` |
| `deepseek` | Web / GUI | `deepseek`, `deepseek-gui` |
| `descript` | Web / GUI | `descript`, `descript-gui` |
| `dify` | Web / GUI | `dify` |
| `fastgpt` | Web / GUI | `fastgpt` |
| `fireflies-ai` | Web / GUI / 浏览器扩展 | `fireflies-ai`, `fireflies-ai-gui`, `fireflies-ai-browser-extension` |
| `gemini-code-assist` | IDE 扩展 | `gemini-code-assist` |
| `gemini-notebook` | Web / GUI | `gemini-notebook`, `gemini-notebook-gui` |
| `github-copilot` | IDE 扩展 | `github-copilot` |
| `grammarly` | Web / GUI / 浏览器扩展 | `grammarly`, `grammarly-gui`, `grammarly-browser-extension` |
| `jetbrains-ai` | IDE 扩展 | `jetbrains-ai` |
| `junie-ide` | IDE 扩展 | `junie-ide` |
| `kimi` | Web / GUI | `kimi`, `kimi-gui` |
| `kimi-code-ide` | IDE 扩展 | `kimi-code-ide` |
| `maxclaw` | Web / IM | `maxclaw` |
| `maxclaw-cn` | Web / IM | `maxclaw-cn` |
| `meta-ai` | Web / GUI | `meta-ai`, `meta-ai-gui` |
| `mistral-vibe` | Web / CLI / IDE 扩展 | `mistral-vibe`, `mistral-vibe-cli`, `mistral-vibe-ide-plugin` |
| `notion-ai` | Web / GUI | `notion-ai`, `notion-ai-gui` |
| `opencode-ide` | IDE 扩展 | `opencode-ide` |
| `otter-ai` | Web / GUI / 浏览器扩展 | `otter-ai`, `otter-ai-gui`, `otter-ai-browser-extension` |
| `qclaw` | GUI / IM | `qclaw` |
| `qclaw-cn` | GUI / IM | `qclaw-cn` |
| `qoder-cn-jetbrains` | IDE 扩展 | `qoder-cn-jetbrains` |
| `qoder-jetbrains` | IDE 扩展 | `qoder-jetbrains` |
| `qwen-code-ide` | IDE 扩展 | `qwen-code-ide` |
| `tabby` | IDE 扩展 | `tabby` |
| `trae-work` | Web / GUI | `trae-work`, `trae-work-gui` |
| `trae-work-cn` | Web / GUI | `trae-work-cn`, `trae-work-cn-gui` |
| `wordtune` | Web / 浏览器扩展 | `wordtune`, `wordtune-browser-extension` |
| `workbuddy` | GUI / IM | `workbuddy` |
| `workbuddy-cn` | GUI / IM / 小程序 | `workbuddy-cn` |
| `qianwen` | Web / GUI / 浏览器扩展 | `qianwen`, `qianwen-gui`, `qianwen-browser-extension` |
| `codearts-agent-ide-extension` | IDE 扩展 | `codearts-agent-ide-extension` |
| `comate` | GUI / IDE 扩展 | `comate`, `comate-ide-plugin` |
| `dingtalk-wukong` | GUI / 钉钉内嵌 | `dingtalk-wukong` |
| `kilo-code-ide` | IDE | `kilo-code-ide` |
| `trae-cn-vscode` | IDE 扩展 | `trae-cn-vscode` |
| `trae-cn-jetbrains` | IDE 扩展 | `trae-cn-jetbrains` |
| `codemaker-vscode` | IDE 扩展 | `codemaker-vscode` |
| `codemaker-jetbrains` | IDE 扩展 | `codemaker-jetbrains` |
| `firebender-ide` | IDE 扩展 | `firebender-ide` |
| `pochi-vscode` | IDE 扩展 | `pochi-vscode` |
| `roo-code-vscode` | IDE 扩展 | `roo-code-vscode` |
| `zencoder-vscode` | IDE 扩展 | `zencoder-vscode` |
| `zencoder-jetbrains` | IDE 扩展 | `zencoder-jetbrains` |

机器可读版本：[JSON](interaction-form-migration-2026-10-11.json)。历史 Sentra 调查报告保留原快照口径，不追溯改写。
