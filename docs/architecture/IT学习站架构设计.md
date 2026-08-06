# IT 学习站架构设计

> 版本：v1.2
> 日期：2026-08-06
> 状态：已实施，当前目录与路由为唯一运行架构

## 1. 目标与边界

本项目只保留一个面向学习者的“技术中心”。技术中心按前端、后端、网络三个领域组织已开放技术，
首页在每个 Technology 下按 Module 拆分知识类别货架；学习者可以直接进入知识类别的第一篇课程，
也可以进入 Module 总览学习知识点、查阅 Reference 或使用 Demo。

本架构定义目录、内容来源、目录聚合、菜单和路由边界。新增内容必须遵循对应领域路线，不得绕过
Technology 与 Module 准入流程。

站内内容类型固定为：

- `learn`：有前置关系和明确顺序的知识点课程，正文统一使用 Markdown。
- `reference`：面向查阅的 API、语法、配置和行为边界，正文统一使用 Markdown。
- Demo：Module 内显式登记的真实可运行源码或外部 HTTPS 地址，不属于 Markdown 正文或详情路由。

## 2. 统一术语

目录和路由统一使用以下层级：

```text
Domain -> Technology -> Module -> ContentType -> Slug
```

| 层级 | 含义 | 示例 |
| --- | --- | --- |
| Domain | 站点一级领域 | `frontend`、`backend`、`network` |
| Technology | 领域内的技术集合或技术生态，不单独提供总览页 | `vue`、`react`、`engineering`、`java`、`go` |
| Module | 技术内部的稳定学习与总览边界 | `core`、`router`、`pinia`、`typescript` |
| ContentType | Markdown 正文用途 | `learn`、`reference` |
| Slug | 模块内唯一的具体内容名称 | `setup-first-router` |

每个 Technology 必须至少有一个 Module。暂时无法继续细分时使用 `core`，不能省略模块层。基础、
中级、高级等学习阶段只属于 manifest 和 Markdown 元数据，不进入目录必选层级，也不进入 URL。

## 3. 目标目录

当前 `src/` 只保留应用装配、通用能力和技术类别三个主要边界：

```text
src/
├── main.ts
├── App.vue
├── app/
│   ├── directives/
│   ├── layouts/
│   ├── pages/
│   ├── router/
│   ├── stores/
│   └── styles/
├── common/
│   ├── catalog/
│   ├── content/
│   ├── markdown/
│   ├── progress/
│   └── ui/
└── categories/
    ├── manifest.ts
    ├── frontend/
    │   ├── vue/
    │   │   ├── manifest.ts
    │   │   ├── core/
    │   │   │   ├── manifest.ts
    │   │   │   ├── learn/
    │   │   │   ├── reference/
    │   │   │   └── demos/
    │   │   ├── router/
    │   │   └── pinia/
    │   └── engineering/
    │       ├── manifest.ts
    │       └── typescript/
    └── backend/
        └── java/
            ├── manifest.ts
            └── core/
                ├── manifest.ts
                └── learn/
```

职责固定如下：

- `app/`：应用入口、页面、布局、路由和全局装配，不保存具体技术正文。
- `common/`：不含领域知识的通用目录、Markdown、渲染、搜索、进度、UI 和工具能力。
- `categories/`：技术 manifest、课程 Markdown、Reference Markdown 和 Demo 源码。

依赖方向固定为 `app -> categories -> common`。`app` 也可以直接使用 `common`，但 `common` 不得导入
`categories` 或 `app`，`categories` 不得导入 `app`。通用能力只有在被多个模块复用或确实与领域无关
时才进入 `common`，不能把所有代码都移动进去形成新的杂物目录。

`learn/` 和 `reference/` 默认直接放 `<slug>.md`，学习阶段和 Reference 分组由 manifest 表达。单个
Demo 需要多个源码文件时，允许在 `demos/<slug>/` 下建立源码包；该目录不是新的导航层级。

## 4. 内容合同

### 4.1 Markdown

前端与后端共用 `common/markdown` 的解析、校验和受控渲染流程，不再保留“前端 TypeScript 正文、
后端 Markdown 正文”两套 authoring 模式。Markdown 必须包含可校验的 frontmatter，并转换为统一
的内部内容接口。

两类 Markdown 的共同元数据至少包含：

```text
id, type, title, summary, domain, technology, module,
related, tags, sources, appliesTo, verifiedAt
```

Lesson 另外必须包含 `stage`、`level`、`prerequisites` 和 `estimatedMinutes`；Reference 另外必须包含
`signature` 与 anchors。`stage` 只用于课程排序和展示，不属于 Reference 字段。后端的
`modernBaseline`、`legacyBaseline` 和 `projectEvidence` 是允许的领域扩展字段，其中
`projectEvidence` 只表示本地源码证据，不会创建项目内容类型。

Markdown 只允许受控语法和 directive。任意 HTML、未知 directive、未知 Demo ID、无效关联或缺失
必填来源必须 fail closed。页面只依赖统一内容接口，不直接读取文件路径或解析 frontmatter。

### 4.2 Demo

本地 Demo 必须使用真实源码运行，运行组件和源码展示指向同一份文件，禁止维护仅供展示的复制版本。
每个 Demo 使用模块内唯一 slug 和全局稳定 ID，并由模块 manifest 显式登记。

外部 Demo 只允许明确的 HTTPS URL，点击后使用新标签页打开并设置安全的 opener 隔离；不使用
`iframe`。外部站点不可用时不能影响技术中心、课程或 Reference 的正常访问。

## 5. Manifest 与 Catalog

Manifest 分两级维护：

- Technology `manifest.ts`：技术名称、摘要、模块顺序和正式可见状态。
- Module `manifest.ts`：课程、Reference、Demo、学习顺序、分组、关联、loader 和正文路径 slug。

`categories/manifest.ts` 只汇总已经正式实施的 Technology manifest。`common/catalog`
提供类型、校验、搜索、相邻条目和路径生成能力，并通过参数接收 manifests；它不能反向 import
具体类别。最终由 `app` 完成 Catalog 实例装配。

Catalog 是菜单、总览、搜索、前后篇、进度和正文加载的唯一外部接口。页面不得依赖目录遍历、
文件名排序、`import.meta.glob` 细节或某个技术的专用 manifest。

每次聚合必须校验：

- Technology、Module、条目和 Demo ID 全局不冲突。
- 同一 Module 与 ContentType 内的 slug 唯一。
- `prerequisites`、`related`、Reference anchor 和 Demo ID 指向真实可用目标。
- manifest 中的可用条目具有真实 loader，未实施候选不进入运行时 Catalog。

## 6. 路由与稳定身份

正文详情路径固定为：

```text
/<domain>/<technology>/<module>/<content-type>/<slug>
```

示例：

```text
/frontend/vue/router/learn/setup-first-router
/frontend/vue/core/reference/ref
/frontend/engineering/typescript/learn/type-system-and-inference
/backend/java/core/learn/development-environment-and-runtime
```

总览路径为：

```text
/
/<domain>/<technology>/<module>
```

文件夹名称不会自动成为路由。路由只根据显式 manifest 中的 `domain/technology/module/type/slug`
生成，因此移动文件会影响 import、loader、raw source registry 和验证入口，但不会自行改变 URL。

不存在 `/<domain>/<technology>` Technology 总览路由。该两段式 URL 和其他旧 URL 均不兼容也不
重定向，统一进入未命中页。

稳定 ID 不从路径或标题重新生成。移动内容必须保留现有 ID、课程前置、关联和进度绑定；路径变化由
Catalog 重新计算。localStorage 数据需要做 ID 级兼容验证，但不保存旧 URL。

## 7. 技术中心与菜单

顶部主导航固定展示“前端”“后端”“网络”，并通过悬浮下拉按
`ContentType -> Technology -> Module -> Group/Demo` 联动展开。桌面端完整沿用原宽幅目录的磨砂帘幕、
内容高度展开和列错峰过渡，顶部入口不显示下拉箭头；窄屏端在同一面板内纵向展示，不得产生横向溢出。
首页按 `Domain -> Technology -> Module 知识类别货架` 组织；每个 Module 右上角的“查看总览”进入
Module 总览，知识类别卡片直接进入该类别第一篇已上线课程。Module 总览默认展示知识内容且不再重复
显示内容类型 Tab；顶部菜单的末列只提供具体知识类别、API 分类或 Demo，并直接进入对应内容。只有已
正式可用的 Technology、Module 和内容分类才能点击；尚无正式内容的领域显示空状态。
首页仍是唯一技术中心，不增加营销落地页，也不存在 Technology 总览页。页面按前端、后端、网络分区，
领域标题、说明以及 Technology 标题、说明均居中展示；每个 Technology 下的 Module 拆成占满内容宽度
的独立横向货架，“查看总览”使用主题蓝色。首页卡片只展示知识类别，不展示 API 或 Demo，统一使用
白色背景、黑灰主文字和轻阴影，并以低饱和强调色区分阶段标签、知识点、编号和操作文字；桌面端在货架
悬浮时显示左右切换按钮，移动端使用原生横向滚动。领域、Technology 和 Module 货架进入视口时渐入，
并兼容 `prefers-reduced-motion`。空技术、只有候选计划的技术和未迁移完成的重复入口不得展示为可点击
卡片。

交互层级固定为：

```text
技术中心首页
  -> Domain 分区
    -> Technology 分组
      -> Module 知识类别货架 -> 知识类别首篇课程
      -> 查看总览 -> Module 总览
```

Module 总览默认展示知识内容，并可按 URL 选择 Reference 或 Demo，页面内不再提供内容类型 Tab。
课程阶段可以在模块页内分组展示，但点击正文条目后仍进入不含阶段的固定详情路径；Demo 直接在模块页
运行并展示同源源码。

## 8. 技术范围与准入

当前运行时只开放已经存在的内容：Vue Core、Vue Router、Pinia、TypeScript 和 Java Core。网络域
可以显示分区占位状态，但没有正式内容前不提供虚假可点击技术卡片。

以下仅为后续调研候选，不代表已经进入学习计划：

| Domain | Technology | 候选 Module |
| --- | --- | --- |
| frontend | `vue` | `core`、`router`、`pinia`，后续再评估 Nuxt 等独立边界 |
| frontend | `react` | `core`、`router`、`state`、`data` |
| frontend | `engineering` | `typescript`、`vite`、`testing`、`build` |
| backend | `java` | `core`、`spring`、`data`、`build`、`testing` |
| backend | `go` | `core`、`toolchain`、`stdlib-http`、`web`、`data`、`testing` |
| backend | `redis` | `core`、`data-structures`、`persistence`、`operations` |
| backend | `mysql` | `core`、`sql`、`indexing`、`transactions`、`operations` |
| backend | `postgresql` | `core`、`sql`、`indexing`、`transactions`、`operations` |
| network | `fundamentals` | `tcp-ip`、`routing`、`diagnostics` |
| network | `web` | `http`、`dns`、`tls`、`websocket` |

新增 Technology 或 Module 前必须单独完成范围调研，证明它有独立学习目标、可靠来源和非重复内容，
再进入路线计划。不得一次性创建整张候选目录、空 manifest 或空页面。

## 9. 文档权威与生效边界

发生冲突时按以下顺序处理：

1. 用户最新确认的范围与停止边界。
2. 本架构设计。
3. 前端或后端领域规范与路线。
4. 模块调研、覆盖矩阵和实施记录。

本文件描述当前唯一有效架构。历史审计和已完成批次可保留当时的路径作为证据，但不能作为新增代码
或运行时入口的依据。
