# 第三方素材与权利声明

本仓库含应用元数据、核验记录，以及来自官方站点或注明来源的第三方项目的 SVG 品牌标识。各条记录的具体来源、核验日期与限制说明见 [`data/evidence.json`](./data/evidence.json)；构建后的静态站点使用同内容的 `evidence.json`。

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
- `edition` 表示产品版本定位，不构成地域可访问性、服务资格、可用性或合规性保证
- `evidence.json` 记录官网及来源资料的核对，不代表安装、运行、性能或安全测试
- `verified_at` 是相应记录的资料核对日期，不是未来持续有效或实时状态保证；保留每条记录的 `notes` 与 `sources`
- 未找到可靠 SVG 的条目保留空 `icon` 和相应 `svg_status`；界面显示的首字或自定义占位元素不是官方 Logo
- 元数据、服务状态及品牌素材可能变化；请结合每条记录的原始来源核对当前情况

维护数据时应同步维护来源，分发随附素材时应保留适用的原始声明。网站构建会将以上 `licenses/*.txt` 与本文件一并复制到输出目录。
