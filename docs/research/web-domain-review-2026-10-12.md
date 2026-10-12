# Web AI 实际域名覆盖审计 · 2026-10-12

原有 168 条 Web 应用均完成结构性审计；新增 5 条。当前 173 条中：73 条实际入口已核验，15 条本地／自托管没有统一公共域名，85 条实际入口仍待核验。未完成全面域名覆盖。

官网 website 与实际入口 web_url 分离；web_domains 使用完整主机名。HTTP 成功不等于应用入口成立，403／超时不等于停服，候选链接不自动收录。API、CDN、SSO 不属于此字段。ChatGPT 与 Codex 共享主机名时需结合路径识别。

## 已纠正的典型入口

|应用|官网|实际入口|
|---|---|---|
|Adobe Firefly|https://www.adobe.com/products/firefly.html|https://firefly.adobe.com/|
|Codex Cloud|https://openai.com/codex/|https://chatgpt.com/codex/|
|Dify|https://dify.ai/|https://cloud.dify.ai/|
|Kagi Assistant|https://help.kagi.com/kagi/ai/assistant.html|https://assistant.kagi.com/|
|Leonardo.Ai|https://leonardo.ai/|https://app.leonardo.ai/|
|MiniMax Agent CN|https://agent.minimaxi.com/|https://agent.minimax.cn/|
|Runway|https://runway.com/|https://app.runwayml.com/|
|可灵AI|https://app.klingai.com/|https://klingai.com/app/|

## 待核验条目

以下条目保留在目录但不声称拥有已核验应用域名。需要逐项通过官网登录链接、官方文档或应用界面确认，禁止直接拿官网主机名填充。

- `jetbrains-air-web`：Air Teams · https://www.jetbrains.com/air/
- `amp-web`：Amp Web · https://ampcode.com
- `anythingllm-web`：AnythingLLM Cloud / 自托管 · https://anythingllm.com
- `augment-code-web`：Augment Code Cloud Agents · https://www.augmentcode.com
- `bolt`：Bolt · https://bolt.new
- `canva-ai`：Canva AI · https://www.canva.com/canva-ai/
- `claude-code-web`：Claude Code Web · https://code.claude.com
- `coze`：Coze · https://www.coze.com/
- `cursor-web`：Cursor Web · https://cursor.com
- `descript`：Descript · https://www.descript.com/
- `dola`：Dola · https://www.dola.com/chat/
- `dreamina`：Dreamina · https://dreamina.capcut.com/
- `elevenlabs`：ElevenLabs · https://elevenlabs.io/
- `fathom`：Fathom · https://www.fathom.ai/
- `gamma`：Gamma · https://gamma.app/
- `gemini-notebook`：Gemini Notebook · https://notebook.google/?hl=en-GB
- `github-copilot-web`：GitHub Copilot · https://github.com/features/copilot
- `gitlab-duo`：GitLab Duo Agent Platform · https://about.gitlab.com/gitlab-duo-agent-platform/
- `grammarly`：Grammarly · https://www.grammarly.com/
- `ima`：ima · https://ima.qq.com/
- `jules`：Jules · https://jules.google
- `kimi`：Kimi · https://www.kimi.com/
- `kimi-code-web`：Kimi Code Web · https://www.kimi.com/code/docs/en/kimi-code-cli/guides/web.html
- `liblib`：LiblibAI · https://www.liblib.art/
- `lovable-web`：Lovable · https://lovable.dev
- `maxclaw`：MaxClaw · https://agent.minimax.io/max-claw
- `meta-ai`：Meta AI · https://www.meta.ai/
- `microsoft-copilot`：Microsoft Copilot · https://copilot.microsoft.com/
- `midjourney`：Midjourney · https://www.midjourney.com/
- `napkin-ai`：Napkin AI · https://www.napkin.ai/
- `openhands`：OpenHands · https://www.openhands.dev
- `otter-ai`：Otter.ai · https://otter.ai/
- `quillbot`：QuillBot · https://quillbot.com/
- `replit-web`：Replit · https://replit.com
- `skywork`：Skywork · https://skywork.ai/
- `suno`：Suno · https://suno.com/
- `trae-work`：TraeWork · https://www.trae.ai/work
- `trae-work-cn`：TraeWork CN · https://work.trae.cn/
- `udio`：Udio · https://www.udio.com/
- `v0-web`：v0 · https://v0.app
- `vidu`：Vidu · https://www.vidu.com/
- `wordtune`：Wordtune · https://www.wordtune.com/
- `wps-ai`：WPS AI · https://ai.wps.cn/
- `wan`：万相 · https://wan.video/
- `qianwen`：千问 · https://www.qianwen.com/
- `miaohua`：商汤秒画 · https://miaohua.sensetime.com/
- `tiangong`：天工 · https://www.tiangong.cn/
- `get-biji`：得到大脑 · https://www.biji.com/
- `hailuo`：海螺AI · https://hailuoai.video/
- `baixiaoyi`：百小医 · https://yi.baichuan-ai.com/
- `baidu-wenku`：百度文库 · https://wenku.baidu.com/
- `gaoding`：稿定AI · https://www.gaoding.com/ai
- `yuanbao`：腾讯元宝 · https://yuanbao.tencent.com/
- `iflyrec`：讯飞听见 · https://www.iflyrec.com/
- `librechat-web`：LibreChat · https://librechat.ai/
- `langbot-web`：LangBot · https://space.langbot.app/cloud
- `deepseek-harness-web`：DeepSeek Harness Web Console · https://deepseek.com/en/harness/
- `qoder-wake-cn-web`：QoderWake CN Web Console · https://docs.qoder.cn/en/qoderwake/installation
- `ona-web`：Ona · https://ona.com/stories/gitpod-is-now-ona
- `lingcode-web`：LingCode Web · https://lingcode.dev/try.html
- `loomy-web`：Loomy · https://loomy.xunfei.cn/
- `rovo-dev-reviewer`：Rovo Dev Code Reviewer · https://www.atlassian.com/software/rovo-dev
- `consensus`：Consensus · https://consensus.app/
- `elicit`：Elicit · https://elicit.com/
- `scispace`：SciSpace · https://scispace.com/
- `chatpdf`：ChatPDF · https://www.chatpdf.com/
- `manus`：Manus · https://manus.im/
- `genspark`：Genspark · https://www.genspark.ai/genspark-landing.html
- `beautiful-ai`：Beautiful.ai · https://www.beautiful.ai/
- `slidesgo`：Slidesgo · https://slidesgo.com/ai/presentation-maker
- `krea`：Krea · https://www.krea.ai/
- `fal`：fal · https://fal.ai/
- `higgsfield`：Higgsfield · https://higgsfield.ai/
- `fish-audio`：Fish Audio · https://fish.audio/
- `aiva`：AIVA · https://www.aiva.ai/
- `soundraw`：SOUNDRAW · https://soundraw.io/
- `uizard`：Uizard · https://uizard.io/
- `gumloop`：Gumloop · https://www.gumloop.com/
- `freebuff-web`：Freebuff · https://freebuff.com/web
- `lemonade-web`：Lemonade · https://lemonade.gg/
- `isekai-zero-web`：ISEKAI ZERO · https://www.isekaizero.ai/
- `craft-rpgs-web`：Craft · https://www.craftrpgs.com/
- `framer-web`：Framer · https://www.framer.com/
- `rosebud-web`：Rosebud AI · https://rosebud.ai/
- `highlevel-web`：HighLevel · https://www.gohighlevel.com/ai

完整记录和来源见同名 JSON；原有全部官网的公开 HTTP 观察见 `web-domain-http-audit-2026-10-12.json`。此核验不包含登录、地区可用性和安装测试。
