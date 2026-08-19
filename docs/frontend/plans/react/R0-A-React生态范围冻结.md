# R0-A：React 生态范围冻结

> 核验日期：2026-08-08
> 冻结时状态：R0-A、R0-B1、R0-B2、RC1、RC2 已完成；RC3 已冻结并达到 1/24
> 适用范围：React SPA 与客户端生态
> 冻结时快照：`main`，`203f0dbf9116bc86cc17f715eb0e3ce05fa9e9bb`
> 文档性质：React 生态范围的历史冻结记录；范围决策继续有效，原阶段顺序已被 2026-08-19 决定替代
> 现行状态：React Core 74/74；React Core Reference 0；Gate RC、Gate R Pending

## 1. 冻结结论

本项目中的“React 全家桶”不是全部 React 社区包，也不是 React 全栈框架。Gate R 固定由以下五项
组成：

1. React Core 与 React DOM。
2. React Router。
3. Redux Toolkit + React Redux 主线，以及 Zustand 完整分支。
4. TanStack Query 服务端数据管理主线。
5. React Demo Adapter 及其按需加载、同源展示和卸载合同。

运行时 Module 固定为 `react/core`、`react/router`、`react/state`、`react/data`。用户已确认
`react/state` 同时正式交付 Redux Toolkit + React Redux 与 Zustand，`react/data` 正式交付 TanStack
Query；RS0、RD0 仍须分别冻结精确版本、课程和 Reference 分母。

Gate R 关闭后才进入通用测试、交付、性能与质量阶段。Next.js、独立 Remix 教学、React Native、
UI 组件库、i18n 和独立表单库不属于 Gate R。

## 2. R0-A 执行时仓库基线

- Vue Core、Vue Router、Pinia、TypeScript 和 Vite 已按路线进入维护状态，Gate V 已通过。
- R0-A 执行时，`package.json` 没有 `react`、`react-dom`、React Router、React 状态库或服务端数据管理库
  依赖。
- 当前宿主使用 Vue、TypeScript 与 Vite；R0-A 不安装依赖，不创建 Catalog、路由、manifest、正文或
  Demo。
- 工作区存在既有 staged、unstaged 和 untracked 资产。本阶段只新增本冻结文档，并最小更新前端状态
  文档；不清理、回退、暂存或格式化其他文件。
- React 精确稳定版本、源码 tag/commit、宿主依赖与 API 分母必须在对应后续 R0 重新实时核验，不能
  从 2026-08-08 的网页显示或搜索摘要直接继承。

## 3. R0-A 职责与非职责

R0-A 只回答四个问题：

1. Gate R 要交付哪些能力。
2. 每项能力由哪个 Module 或宿主 adapter 负责。
3. 后续 R0 用什么证据冻结版本、官方分母和第三方库选择。
4. 哪些内容属于观察、延期或明确排除。

R0-A 不承担：

- 冻结 React、React Router 或第三方库的精确版本。
- 建立 React Core 或任何第三方库的 officialKey 清单。
- 决定课程数量、Reference 数量、批次条目或 Demo 数量。
- 安装依赖、设计具体文件结构或实现 React Demo Adapter。
- 发布课程、Reference、Demo、空 Module 卡片或计划状态的运行时入口。

## 4. Gate R 能力边界

### 4.1 纳入 Gate R

| 能力 | Gate R 责任 |
| --- | --- |
| React Core | JSX/TSX、组件、Props、State、事件、组合、Hooks、并发 UI 与稳定公开 React 能力 |
| React DOM | 浏览器 DOM 宿主、root 挂载与卸载、事件/表单/portal 等稳定公开 Web 能力 |
| React Router | SPA 导航、匹配、嵌套、URL 状态，以及 Data 模式下的 loader/action/错误与并发边界 |
| 客户端状态 | Redux Toolkit + React Redux 讲系统状态模型；Zustand 讲轻量外部 store，两者均完整交付 |
| 服务端数据 | TanStack Query 讲 query key、缓存、失效、mutation、分页、预取与并发边界 |
| Demo 宿主 | React runtime 按需加载、TSX Demo 真实挂载、源码同源、离开时可靠卸载 |

React 内建 State、Reducer 与 Context 是 Core 的基线，不算第三方状态库。React Router 的 loader
数据和服务端数据管理库必须在 RD0 明确分工，不能让同一请求同时拥有两套无说明的缓存所有权。

### 4.2 观察范围

以下内容必须登记状态和官方来源，但不自动计入稳定完成度：

- React Canary 与 Experimental 发布渠道。
- `unstable_`、legacy、deprecated、removed、internal 和未文档化能力。
- React Server Components、Server Functions/Actions 及其 bundler、server runtime 合同。
- React Router Framework 模式、SSR、静态渲染和部署 adapter。
- `react-dom/server`、`react-dom/static` 中超出当前 SPA 宿主可真实验证的能力。
- React Compiler、React DevTools 与 React 专用 lint/tooling。
- Jotai、RTK Query、SWR 等未进入正式交付范围的稳定 API。

观察项采用独立统计，不得为提高覆盖率混入稳定 Reference 分母。能够在 SPA 中独立成立的稳定共享
API，由对应 R0 判断是否进入分母；“某框架已采用”不等于当前宿主可验证。

### 4.3 不纳入 Gate R

- Next.js，以及其路由、缓存、渲染、Server Components 和部署教学。
- 独立 Remix Module。React Router 官方已经把 Declarative、Data、Framework 作为三种模式，Gate R
  只讲当前 SPA 主线；Remix 历史和 Framework 模式只作为边界事实。
- React Native、Expo 与原生平台组件。
- Material UI、Ant Design、Chakra UI、shadcn/ui 等 UI 体系。
- CSS-in-JS、动画库、图表库、富文本编辑器和拖拽库。
- i18n、认证 SDK、GraphQL 专用客户端和实时协议的独立课程。
- React Hook Form、Formik 等独立表单库。表单先由 React Core 和数据 mutation 组合专题承担。
- Vitest、Testing Library、MSW、Playwright、CI、部署和综合性能课程；这些属于后续 Q 阶段。

## 5. Module 身份与责任

| Technology / Module | 稳定 ID 前缀 | 责任 | 禁止承担 |
| --- | --- | --- | --- |
| `react/core` | `react.core` | React、React DOM、JSX/TSX 与组件运行模型 | Router、第三方 store、远程缓存完整教学 |
| `react/router` | `react.router` | URL、导航、路由树、Data 模式和 SPA 部署边界 | 复制 React Core；建立第二套通用查询缓存 |
| `react/state` | `react.state` | 被选主线的客户端共享状态 | 将服务端数据长期复制进 client store |
| `react/data` | `react.data` | 被选主线的服务端状态、缓存与 mutation | 通用本地 UI 状态；绑定具体后端业务 API |

Module ID 不绑定 vendor。将来更换候选库时必须保留公开 Module 身份，并通过新的调研与迁移 Gate，
不能把 vendor 名静默写进稳定 ID 或 URL。

## 6. 发布渠道与覆盖状态策略

发布渠道和项目范围是两个正交维度：

| 官方状态 | 项目处理 |
| --- | --- |
| Latest / stable 且在当前 Module 范围 | 可进入该 R0 的稳定分母，仍需固定版本和官方键 |
| stable 但 framework-specific | 登记为观察或 deferred；除非 R0 证明 SPA 宿主可独立验证 |
| Canary | 只进入观察清单；即使官方支持 curated setup，也不进入本站稳定主线 |
| Experimental | 只用于事实观察，不发布为可依赖课程或稳定 Reference |
| legacy / deprecated / removed | 记录迁移边界，不计入稳定完成度 |
| internal / undocumented | 标记 restricted，禁止当作公共合同教学 |
| 未选第三方候选 | Jotai、RTK Query、SWR 只保留决策证据，不创建 Reference 分母或空 Module |
| 无匹配环境的稳定能力 | 标记 `Deferred/not-run`，不能用普通 SPA smoke 冒充通过 |

React 官方说明 Latest 遵循 semver；Canary 需要固定版本且可能发生破坏性变化；Experimental 不保证
跨版本稳定。因此 Gate R 的课程与稳定 Reference 只使用后续 R0 固定的 Latest/稳定版本。

## 7. 后续 R0 冻结合同

### 7.1 R0-B：React Core、React DOM 与宿主冻结

R0-B 必须冻结：

- `react`、`react-dom`、JSX runtime、TypeScript 类型和 Vite 宿主的精确稳定版本。
- 官方文档版本、官方 sidebar/Reference 集合、源码 tag/commit 和稳定 officialKey 分母。
- React、React DOM、client/server/static entry point 的纳入、观察和 deferred 边界。
- React Core 课程数量、ID、前置、批次和每批验证载体。
- TSX 编译、动态加载、raw 源码、root 生命周期和 adapter 失败边界。
- Canary、Experimental、framework-specific、legacy、removed 与 React Compiler 的观察清单。

R0-B 完成后才能进入 React Core 正文。

### 7.2 RR0：React Router 冻结

RR0 必须重新冻结 Router 精确稳定版本、源码、官方 API 分母和课程批次。模式以 Declarative 为基础、
Data 为 Gate R 主线；Framework 模式只登记共享 API 与框架边界，不自动引入全栈运行时。

RR0 还必须说明 Router loader/action 与 `react/data` 的缓存所有权、错误重试、失效、预取和导航并发
如何组合，并使用独立 SPA fixture 验证深链、刷新和静态部署 fallback。

### 7.3 RS0：客户端状态双分支冻结

`react/state` 正式交付两个相互独立的分支：

1. Redux Toolkit + React Redux 是系统主线，覆盖 store、slice、action、selector、middleware、
   TypeScript 与 React 订阅边界。
2. Zustand 是完整轻量分支，覆盖 store、selector、action、middleware、订阅、TypeScript 与 React
   并发边界，不只是对比文章。

RS0 必须分别冻结两组精确版本、源码、课程、稳定 Reference 分母和 Demo，并说明何时选择哪一组；同一
业务 Demo 不得无理由同时维护两套 client store。Jotai 只进入观察清单。选择 Redux Toolkit 不自动
选择 RTK Query。

### 7.4 RD0：TanStack Query 冻结

`react/data` 正式选择 TanStack Query。RD0 必须冻结其精确版本、源码、课程、稳定 Reference 分母和
Demo，并明确 query key、缓存生命周期、fresh/stale、mutation、失效、optimistic update、重试、取消、
分页、预取、SSR/hydration 与 Devtools 边界。

RD0 还必须说明 TanStack Query 与 React Router Data 模式、Suspense、并发渲染、Redux 和 Zustand 的
所有权分工。RTK Query 与 SWR 只进入对比/观察，不创建完整课程或稳定 Reference 分母。

## 8. React Demo Adapter 合同

Adapter 是 React Technology 的共享宿主能力，不是第五个运行时 Module。R0-B 必须用最小垂直切片
证明：

1. 只有进入 React 内容且需要运行 Demo 时才加载 React runtime 和目标 TSX chunk。
2. Vue、TypeScript、Vite 页面以及 React 总览的轻量元数据路径不会提前加载 React runtime。
3. Adapter 为每次挂载创建明确 root，切换 Demo、离开页面和宿主卸载时调用 `root.unmount()`。
4. 重复进入、切换和离开不产生重复 root warning、残留 DOM、listener、timer 或订阅。
5. 运行组件与展示源码来自同一源文件；Demo ID 使用完整限定名称。
6. adapter 失败被宿主隔离，不能破坏全站导航或污染其他 Technology。
7. 构建产物和 Playwright 网络证据共同证明拆包与按需加载，不能只检查动态 import 源码。

## 9. 阶段顺序与 Gate

以下为 R0-A 冻结时的历史顺序：

```text
R0-A 生态范围冻结
  -> 停止并确认
  -> R0-B1 React Core/DOM/宿主范围冻结
  -> 停止并确认
  -> R0-B2 宿主 admission 与最小垂直切片
  -> RC1-RC3 + RCA
  -> Gate RC
  -> RR0 -> RR 课程/Reference -> Gate RR
  -> RS0 双分支冻结 -> RS Redux/Zustand 课程/Reference -> Gate RS
  -> RD0 TanStack Query 冻结 -> RD 课程/Reference -> Gate RD
  -> GT-R React 生态集成验收 -> Gate R
  -> 停止；Q 阶段等待授权
```

2026-08-19 起，现行顺序调整为课程先行、API Reference 后置集中实施：

```text
RC React Core 课程
  -> RR0 -> RR React Router 课程
  -> RS0 -> RS-R Redux Toolkit + React Redux 课程 -> RS-Z Zustand 课程
  -> RD0 -> RD TanStack Query 课程
  -> RA0 -> RCA / RRA / RSA / RDA
  -> Gate RC / Gate RR / Gate RS / Gate RD
  -> GT-R -> Gate R
```

每个课程分支仍须完成自己的调研、实施、验证、复审和课程 Gate 后才能进入下一分支；完整 Module Gate
在对应 Reference 完成后关闭。Reference 后置不允许课程批次跳过验收。

Gate R 只有在四个独立 Module Gate 均通过、Redux 与 Zustand 两个状态分支均完成、TanStack Query
保持唯一服务端数据主线、adapter 合同通过、跨模块关联只指向真实条目、稳定 officialKey 双向差集
为空、观察项独立、React runtime 按需加载、代表路径浏览器验证通过且临时资产零残留时才能关闭。

## 10. R0-A 自审

### Standards

- `PASS / 0 finding`：只使用官方文档、官方项目文档和官方仓库入口支撑外部事实。
- `PASS / 0 finding`：未安装依赖，未创建课程、Reference、Demo、manifest 或运行时空入口。
- `PASS / 0 finding`：Redux、Zustand 与 TanStack Query 的用户决策已记录，其他候选保持观察。
- `PASS / 0 finding`：稳定、framework-specific、Canary、Experimental、legacy 和 restricted 分开处理。

### Spec

- `PASS / 0 finding`：Gate R 纳入项、不纳入项、观察范围和四个 Module 责任已冻结。
- `PASS / 0 finding`：R0-B、RR0、RS0、RD0 的版本、分母与冻结职责已定义。
- `PASS / 0 finding`：React Demo Adapter 合同、独立 Gate 和最终 Gate R 已定义。
- `PASS / 0 finding`：R0-A 后停止边界明确，没有进入 R0-B。

## 11. 官方来源

- [React Versioning Policy](https://react.dev/community/versioning-policy) - Latest、Canary、Experimental
  的支持与稳定性边界。
- [React Reference Overview](https://react.dev/reference/react) - React、React DOM、Compiler、Rules 和
  Legacy 的官方分类。
- [React DOM APIs](https://react.dev/reference/react-dom) - Web DOM 能力与 client/server entry point。
- [Creating a React App](https://react.dev/learn/creating-a-react-app) - React 官方对框架与从零 SPA 的边界。
- [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction) - Compiler 的稳定构建期
  优化定位。
- [React Router: Picking a Mode](https://reactrouter.com/start/modes) - Declarative、Data、Framework
  三种模式及能力递进。
- [Redux: Getting Started](https://redux.js.org/introduction/getting-started) 与
  [Usage with TypeScript](https://redux.js.org/usage/usage-with-typescript) - Redux Toolkit 官方推荐路径与
  TypeScript 口径。
- [Zustand Introduction](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) 与
  [TypeScript Guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript) - 外部 store 候选模型与
  TypeScript 路径。
- [Jotai Documentation](https://jotai.org/docs) 与
  [TypeScript Guide](https://jotai.org/docs/guides/typescript) - 原子化候选模型与 TypeScript 路径。
- [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview) - 服务端状态、
  获取、缓存、同步和更新的官方定位。
- [RTK Query Overview](https://redux-toolkit.js.org/rtk-query/overview) - 数据获取/缓存定位及其与 Redux
  Toolkit 的依赖关系。
- [SWR](https://swr.vercel.app/) - 缓存、重新验证、请求去重与 mutation 的官方定位。
- [Next.js React Foundations](https://nextjs.org/learn/react-foundations/what-is-react-and-nextjs) - Next.js
  作为 React 框架的边界。
- [React Native](https://reactnative.dev/) - 原生平台宿主边界。
- [Merging Remix and React Router](https://remix.run/blog/merging-remix-and-react-router) - Remix 能力进入
  React Router Framework 模式的官方背景。

## 12. 历史停止点与现行边界

R0-A、R0-B1 与 R0-B2 完成时曾强制停止在 RC1 前；该停止点随后由用户明确解除。宿主 Adapter 和
admission Demo 已通过验收。本文记录的 RC1、RC2、RC3 数量和停止点只描述当时快照；React Core
后来按 [`React课程调整总计划.md`](./React课程调整总计划.md) 完成新路线 `74/74`。React Core
Reference 仍为 `0`，Gate RC 与 Gate R 均为 Pending。API Reference 已统一后置，现行下一阶段为
RR0；当前顺序以 [`IT学习站前端路线计划.md`](../../IT学习站前端路线计划.md) 为准。
