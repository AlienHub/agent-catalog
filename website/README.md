# Website

静态浏览界面。构建时读取仓库根目录的 `data/` 与 `assets/icons/`，不在 `website/` 内存第二份数据快照。

```sh
npm run build:website
python3 -m http.server 4173 --directory website-dist
```

顶部可在 **Agent 应用** 与 **模型供应商/中转站** 之间切换。

## 免责声明

模型供应商 / 中转站目录只记录公开可访问的服务站点与 API 地址，**收录不等于推荐、合作、担保或法律意见**。

- 开源后端（one-api、new-api、sub2api 等）只作为探测到的属性，不作为目录条目。
- 第三方代理与社区中转可能与上游服务条款或当地法规冲突。
- 探测仅使用 HTTP 与 `/api/status` 指纹，不注册、不付费、不使用 API key，也不表示接口可调用。
- 站点开闭很快，请以各站当前公示为准。
