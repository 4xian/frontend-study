# IT 学习站前端路线计划

> 版本：v1.11
> 日期：2026-08-19
> 状态：React Core 74/74；Router、Redux、Zustand 与 Data 课程地图已确认；API Reference 统一后置
> 权威规范：[`IT学习站前端规范.md`](./IT学习站前端规范.md)

## 1. 计划目标

本计划只管理 IT 学习站的前端内容域。已完成的 Vue 生态保持维护状态；新内容严格按照 TypeScript →
Vite → React Core 课程 → React Router 课程 → Redux Toolkit/React Redux 课程 → Zustand 课程 →
TanStack Query 课程 → React 生态 API Reference → 测试与交付 → 生产级综合项目的依赖顺序推进。
Next.js 和 Nuxt 不进入本计划。

## 2. 执行规则

1. 每个技术模块先确认一份课程计划，只冻结阶段、课程顺序和学习终点；每课实施时再核对当前版本和官方资料。
2. 一课完成实时调研、实现、临时反馈环、浏览器验证、按风险复审并勾选计划后，才能开始下一课。
3. 课程和 Reference 使用独立模板；Reference 不机械地为每个官方名称创建长文。
4. 新模块先建立总览、manifest 和最小垂直切片，再按冻结批次扩展。
5. 外部事实使用 Tavily 查找并回到官方来源；源码固定 tag 或 commit。
6. 不修改已完成 Vue 内容，除非新工作暴露真实回归或官方维护任务。
7. 普通前端内容批次不修改 `docs/backend/`、后端内容或后端审计资产。
8. 不主动提交、推送或创建 PR。
9. 调研、验证和复审不建立仓库记录；模块课程计划长期保留，并只用复选框登记单课完成状态。
10. 当前架构已经切换完成，后续批次不得恢复旧目录、旧 URL 或 TypeScript 正文模式。

## 3. 当前基线

| 模块 | 课程 | Reference | 状态 |
| --- | ---: | ---: | --- |
| Vue Core | 31 | 官网索引 206/206 | 完成，进入维护 |
| Vue Router | 15 | 稳定 118/118；Experimental 86 项观察清单 | 完成，进入维护 |
| Pinia | 14 | 稳定 41/41；restricted 26/26 已说明 | 完成，进入维护 |
| TypeScript | 24/24 | 199/199 available；0 planned；11 个观察范围 | Gate T 已通过，进入维护 |
| Vite | 24/24 | 175/175 available；0 planned；15 个观察项；4 个 deferred | Gate V 已通过，进入维护 |
| React 生态 | Core 74/74；Router/Redux/Data 各 48 课；Zustand 36 课 | 全部 Module 0 | 课程完成状态以各模块计划复选框为准；API Reference 统一后置 |

已有 Vue 内容、目录、搜索、进度、课程/Reference layout 和交互 registry 是后续模块复用的宿主能力。
目录、Markdown、Catalog 和 URL 以全站架构为准；不能据此跳过新生态的 adapter、按需加载和卸载
验证。

## 4. 总体顺序

```text
T3 TypeScript 高级课程
  -> TA TypeScript Reference
  -> Gate T
    -> V0 Vite 调研冻结
      -> V1-V3 Vite 基础/中级/高级课程
      -> VA Vite Reference
      -> Gate V
      -> R0-A React 生态范围冻结
      -> R0-B1 React Core/DOM/宿主范围冻结
      -> 停止并确认
      -> R0-B2 宿主 admission 与最小垂直切片
      -> RC React Core 74 课
      -> RR0 React Router 冻结
      -> RR React Router 课程
      -> RS0 Redux Toolkit/React Redux 与 Zustand 冻结
      -> RS-R Redux Toolkit + React Redux 课程
      -> RS-Z Zustand 课程
      -> RD0 TanStack Query 冻结
      -> RD TanStack Query 课程
      -> RA React 生态 API Reference 集中阶段
        -> RCA React Core Reference
        -> RRA React Router Reference
        -> RSA Redux Toolkit/React Redux 与 Zustand Reference
        -> RDA TanStack Query Reference
        -> Gate RC / Gate RR / Gate RS / Gate RD
      -> GT-R React 生态集成验收
      -> Gate R
        -> Q 测试、交付、性能与质量
        -> RP React 生产级综合项目
        -> Gate RP
        -> UI 前端入口与前端路径验收
```

## 5. TypeScript 阶段

### T0：官方调研与实施冻结

先核对当前 TypeScript 稳定版、Handbook、Reference、TSConfig Reference、发布说明、标准库声明和
固定源码。建立官方主题到站内课程/Reference 的覆盖矩阵，冻结课程 ID、前置关系、难度、唯一 Demo
或临时编译 fixture、批次数量和 Gate。R0 结束前不发布正文。

TypeScript 官方基线于 2026-08-05 冻结为 `7.0.2`，课程为 24 课，稳定 Reference 为 199 个映射键；
长期统计与维护规则见
[`TypeScript官方覆盖矩阵.md`](./coverage-matrices/TypeScript官方覆盖矩阵.md)。课程现为 `24/24`，
稳定 Reference 为 `199/199 available`、`0 planned`，11 个观察范围已登记。GT-1 已完成，Gate T 已通过，
TypeScript 进入维护状态。

TypeScript 的“API”按 Reference 理解，至少区分：语言语法、类型操作符、Utility Types、模块与
声明文件、TSConfig、编译器行为。Compiler API 和语言服务属于高级/低频范围，由 T0 决定采用
详解、主题合并还是速查，不打断新手主线。

### T1：基础课程

按“类型推导 → 基本类型 → 对象与函数 → 数组与元组 → 联合与字面量 → 类型收窄 → type/interface
→ 模块”递进。示例使用普通 TypeScript，不要求先学 Vue 或 React；需要运行差异时使用最小编译
临时 fixture，不用浏览器输出冒充类型检查。

### T2：中级课程

进入泛型、约束、`keyof`、`typeof`、索引访问、映射类型、条件类型、模板字面量类型、类、模块解析、
错误处理与第三方类型。课程继续优先讲问题建模，不按关键字字典排列。

### T3：高级课程

覆盖复杂推导、`infer`、分布式条件类型、类型设计取舍、声明文件、包导出、配置分层、类型性能、库
作者边界和与 Vue/React 类型的连接方式。装饰器及版本敏感能力必须由 T0 按当前官方状态决定位置。

### TA：Reference 覆盖

按官方主题建立可搜索总览；高频类型操作符提供完整签名、示例、易错点和推导，相关 Utility Types
可合并到主题页，TSConfig 选项按官方分类提供速查。每个 available 索引项必须指向真实正文和唯一
锚点。

### Gate T

- 基础、中级、高级路线均有明确起点、终点、前置和练习。
- 官方冻结索引全部有结构化状态，不存在无说明遗漏或伪链接。
- 编译期示例由真实 `tsc` 和临时 fixture 验证；交互 Demo 只承担运行期可观察行为。
- 搜索、总览、深链、390px、键盘和 200% 文本通过代表路径验证。
- 最少临时反馈环、type-check、范围内 lint/format 和受影响构建通过。

## 6. Vite 阶段

### V0：官方调研与实施冻结

核对 Vite 当前稳定版、Guide、Config Reference、Plugin API、JavaScript API、HMR API、环境变量、
SSR 和构建文档，并固定源码。冻结浏览器内 Demo 与必须使用独立临时 fixture/build 的验证边界。

### V1：基础课程

从项目入口、开发服务器、模块图、静态资源、路径别名、环境变量与 mode、CSS/JSON/资源导入和 HMR
开始。课程解释 Vite 解决的开发与构建问题，不把命令列表当作完整课程。

### V2：中级课程

覆盖配置文件、插件钩子、依赖预构建、代理、Glob Import、Worker、资源 URL、共享配置和多环境差异。
所有配置结论绑定适用版本，插件示例同时说明开发与构建阶段。

### V3：高级课程

覆盖生产构建、chunk 策略、库模式、SSR 接口、后端集成、性能诊断、安全边界和迁移。无法在当前 SPA
真实执行的 SSR、代理或部署能力使用独立临时 fixture，不以静态说明冒充运行验证。

### VA：Reference 覆盖

按官方 Config、Server、Build、Preview、Dependency Optimization、SSR、Worker、Plugin、HMR 和
JavaScript API 分类建立索引。核心配置详解，相关选项主题合并，低频平台参数速查。

### Gate V

- Vite 课程与 Reference 均从总览可达，官方冻结范围全部登记。
- 开发服务器、插件和生产构建的结论均有对应验证证据。
- 现有 Vue 应用构建、懒加载、Demo 源码和 chunk 行为无回归。
- TypeScript 课程可作为 Vite 配置与插件课程的真实前置关联。

Vite 教学基线固定为 `8.2.1`。课程为 `24/24`，稳定 Reference 为
`175/175 available`、`0 planned`；15 个实验/弃用观察项和 4 个 deferred 外部证据项已登记。
Gate V 已通过，Vite 进入维护状态。

## 7. React Core 阶段

### R0-A：React 生态范围冻结

冻结 React 全家桶的能力边界、四个运行时 Module、候选状态库与服务端数据管理库、观察/延期/排除规则，
并定义 React Demo Adapter 的职责与后续 Gate 顺序。R0-A 不安装依赖、不冻结具体版本、课程数量或
Reference 分母，不创建运行时入口。完整冻结记录见
[`R0-A-React生态范围冻结.md`](./plans/react/R0-A-React生态范围冻结.md)。R0-A 已完成。

### R0-B1：React Core、React DOM 与宿主范围冻结

React/DOM `19.2.8`、类型 `19.2.18`/`19.2.4`、React 插件 `6.0.5`、52 个稳定 officialKey、11 个
deferred、初始 24 课、12 个 RCA 聚合 entry、Error Boundary legacy 例外和默认 StrictMode 已冻结。
后续 RC1、RC2 已分别重拆为 20 篇与 29 篇单知识点课程；完整记录见
[`R0-B-React-Core-DOM与宿主冻结.md`](./plans/react/R0-B-React-Core-DOM与宿主冻结.md)。R0-B1 已
完成，后续 R0-B2 已按独立授权闭环。

### R0-B2：宿主 admission 与最小垂直切片

已安装冻结的精确依赖并实现 React Demo Adapter：
动态加载 runtime，挂载 TSX Demo，切换或离开时 `unmount`，并继续用 `?raw` 展示同源源码。先证明
访问 Vue、TypeScript 或 Vite 页面不会提前加载 React runtime。

R0-B2 已完成临时反馈环、构建 manifest、浏览器网络、错误恢复、三轮生命周期、桌面/390px 与双轴
复审；React Demo Adapter 已作为 Core、Router、State 和 Data Module 的共享宿主基线。

### RC：React Core 74 课

React Core 已按调整后的路线完成 `74/74`：基础 `24/24`、中级 `21/21`、高级 `29/29`，共 `62` 节
知识课和 `12` 节实战课。课程覆盖 React 19.2 客户端 Core/DOM、稳定 Hooks、状态建模、Effect、Ref、
性能、异步边界、并发 UI、Action、Hydration 与宿主资源。现行课程数量、顺序、ID、合并迁移和最终
闭环记录统一见 [`React课程调整总计划.md`](./plans/react/React课程调整总计划.md)。

[`RC1-基础课程官方事实核验.md`](./plans/react/RC1-基础课程官方事实核验.md)、
[`RC2-中级课程单知识点计划.md`](./plans/react/RC2-中级课程单知识点计划.md) 和
[`RC3-高级课程单知识点计划.md`](./plans/react/RC3-高级课程单知识点计划.md) 只保留调整前的历史冻结、
逐课研究和验收证据，不再定义现行课程数量、顺序或下一任务。

React Core API Reference 不在课程完成后立即实施，统一后置到 RA 阶段；Gate RC 因此保持 Pending，
但不再阻塞 RR0 和后续课程阶段。

## 8. React Router 阶段

### RR0：React Router 课程计划确认

React Router 课程地图已确认，共 48 课，基础、中级、高级各 14 节知识课和 2 节实战课。课程使用 Data
Mode 作为唯一实现主线；Declarative Mode 只用于模式识别，Framework Mode 只说明能力边界与迁移。
精确版本、官方资料和每课内容在实施当前课时实时核对，不单独保存调研文档。完整顺序见
[`React-Router课程计划.md`](./plans/react/React-Router课程计划.md)。

### RR：React Router 课程

按已确认的 48 课清单从基础到高级逐课实施，完成状态只读取计划复选框。每课只讲本课知识，不把 Vue
Router 结构直接复制过来，也不在 Router 课程中承担 TanStack Query 的服务端缓存教学。

React Router API Reference 和 Gate RR 统一后置到 RA 阶段。课程阶段仍须独立验收深链刷新、静态部署
fallback 与代表浏览器路径，不能把 Reference 后置理解为降低课程 Gate。

## 9. React 状态管理阶段

### RS0：客户端状态双分支冻结

模块 ID 保持 `react/state`，不绑定单一 vendor。Redux Toolkit + React Redux 作为同一 Redux 技术栈的
系统主线，Zustand 作为独立的完整轻量分支；两个分支分别冻结课程和 Demo，Jotai 只进入观察。

RS0 完成后依次实施 Redux 与 Zustand 课程；两组稳定 Reference 和 Gate RS 统一后置到 RA 阶段。

### RS-R：Redux Toolkit + React Redux 课程

Redux Toolkit 负责 Redux 逻辑和 store 的标准写法，React Redux 负责 React 组件与 Redux store 的绑定。
课程按 store 与 Provider → slice、reducer 与 action → selector 与派生状态 → 异步 thunk 与 middleware
→ TypeScript、调试、测试和 SSR 边界递进，不教学旧式手写 Redux 样板作为主线。课程地图已确认为 48
课，完成状态只读取计划复选框；完整顺序见
[`Redux-Toolkit与React-Redux课程计划.md`](./plans/react/Redux-Toolkit与React-Redux课程计划.md)。

### RS-Z：Zustand 课程

Zustand 课程地图已确认为 36 课，基础、中级、高级各 10 节知识课和 2 节实战课。基础和中级只使用
React 绑定 Store 作为常用开发主线；Vanilla Store、作用域隔离、多实例和 SSR/hydration 后移到高级
阶段。完成状态只读取计划复选框；完整顺序见
[`Zustand课程计划.md`](./plans/react/Zustand课程计划.md)。Zustand API Reference 和 Gate RS 统一后置到
RA 阶段。

## 10. React 数据管理阶段

### RD0：TanStack Query 课程计划确认

模块 ID 保持 `react/data`。TanStack Query 是正式主线；RTK Query 与 SWR 只进入观察。课程地图不固定
具体版本，每课实施时实时核对最新稳定版，并明确与两个 client store 及 React Router Data 模式的
组合边界。

### RD：TanStack Query 课程

TanStack Query 课程地图已确认为 48 课，基础、中级、高级各 14 节知识课和 2 节实战课。课程以
`fetch`、`QueryClientProvider`、`useQuery` 和 `useMutation` 作为常用 React 开发主线，再进入失效、
分页、乐观更新、预取、Router 集成、SSR 与测试。完成状态只读取计划复选框；完整顺序见
[`TanStack-Query课程计划.md`](./plans/react/TanStack-Query课程计划.md)。不得把所有远程数据复制到客户端
状态 store；与 React Router Data 模式的缓存所有权必须保持明确。

表单与校验只作为 React Core 和数据 mutation 的组合专题；Gate R 不新增独立表单库 Module。未来如需
扩展，必须在 Gate R 之外重新调研、授权和冻结，不在本计划中预创建空入口。

TanStack Query 是独立课程路线，不并入 Redux、Zustand 或 Router 课程。API Reference 和 Gate RD 统一
后置到 RA 阶段；课程阶段仍须验收缓存、mutation、按需加载及跨模块所有权。

## 11. React 生态 API Reference 集中阶段

Router、Redux Toolkit + React Redux、Zustand 和 TanStack Query 课程全部完成后，再集中实施四个运行时
Module 的 API Reference。Reference 仍按 Module 独立登记、独立统计和独立验收，不合并成一篇大文档。

### RA0：Reference 范围复核

开始前重新核对各库当时的稳定版本、官方索引、公开 API、废弃项、实验项和源码固定点。课程阶段冻结的
候选分母只能作为输入，不能代替 Reference 实施前的当前事实复核。

### RCA：React Core Reference

按官方 Components、Hooks、APIs 与 React DOM 分类建立稳定索引。每个条目区分纯函数规则、渲染期
规则、事件期行为和宿主 DOM 行为；合并相关 overload 或类型，不为每个导出机械创建长文。

### RRA：React Router Reference

按所选 Declarative、Data 与共享 API 范围建立索引，Framework 专属能力按 RR0 冻结结果登记为详解、
边界说明或观察项。

### RSA：Redux 与 Zustand Reference

Redux Toolkit、React Redux 和 Zustand 使用三个独立官方索引与统计分母。Redux Toolkit 与 React Redux
虽属于同一教学主线，但不能混淆各自导出的 API；Zustand 保持独立分支。

### RDA：TanStack Query Reference

按 React 适配层的查询、mutation、缓存、无限查询、hydration 与 Devtools 等稳定公开接口建立索引，
不把 Router 或客户端 store API 混入其分母。

### Module Gates 与 Gate R

- Gate RC：React Core 课程、Reference、观察项和 Demo Adapter 合同通过。
- Gate RR：Router 课程、Reference、深链、部署 fallback 和代表路径通过。
- Gate RS：Redux 与 Zustand 两个课程分支、各自 Reference、订阅清理和按需加载通过。
- Gate RD：TanStack Query 课程、Reference、缓存与 mutation 及跨模块所有权通过。

### GT-R 与 Gate R

- React Core、Router、状态管理、数据管理均有独立课程总览和 Reference 总览。
- TSX Demo 真实运行、源码同源、正确卸载，不产生重复 root 警告。
- React runtime 只在实际运行 React Demo 时按需加载；React 轻量总览不得提前加载。
- 四条路线的关联只指向真实可用条目，Next.js 未混入。
- 桌面、390px、键盘、reduced motion、搜索和跨生态切换通过代表路径验证。

GT-R 负责四个独立 Module Gate 的集成复验；Gate R 关闭后才进入 Q 阶段。当前 Gate R 为 Pending。

## 12. 测试、交付与质量阶段

在 TypeScript、Vite 和 React 均有真实内容后，开放通用工程化模块：

1. **测试**：Vitest、Vue Test Utils、Testing Library 和 Playwright，按单元、模块 interface、集成、
   E2E 分工组织。
2. **构建部署**：环境配置、构建产物、静态部署、缓存、source map、错误回滚和 CI 基础。
3. **性能与质量**：bundle、懒加载、渲染性能、可访问性、lint、format、类型门禁和依赖治理。

课程必须围绕已有 Vue/React 项目验证，不建立与实际宿主脱节的命令百科。

## 13. React 生产级综合项目阶段

Gate R 与 Q 阶段完成后，新增一个 React 生产级综合项目作为最终整合课程。项目只复用已经完成的
Core、Router、State、Data、测试与交付知识，不在项目中首次教学新的框架或库。项目至少整合多页面与
嵌套路由、URL 状态、真实 API、鉴权边界、CRUD、分页、缓存、mutation、客户端状态、表单、错误恢复、
组件/集成/E2E 测试、性能检查、构建和部署。

项目的业务主题、后端接口、状态库选择、课程拆分、验收矩阵和部署目标在独立 RP0 中冻结；未完成前置
Module Gate 时不得创建正文、Demo、依赖或空运行时入口。项目完成后单独关闭 Gate RP。

## 14. 前端入口与体验验收

前述模块关闭 Gate 后，再统一复验技术中心中的前端入口、Module 总览、课程与 Reference
详情、Demo 视图、搜索、进度、深链、构建 chunks、390px、键盘和降级模式。视觉工作不能反向改变
内容 ID、课程顺序、Reference 覆盖或全站信息架构。

## 15. 下一任务

React Core 课程已达到 `74/74 available`，调整路线的课程 Gate 已通过。React Core Reference 仍为
`0`，Gate RC 与 Gate R 保持 Pending，但 API Reference 已统一后置，不再阻塞课程路线。React Router、
Redux Toolkit + React Redux、TanStack Query 的 48 课地图与 Zustand 的 36 课地图均已确认，完成状态
以各模块计划复选框为准。后续按总路线顺序逐个实施课程，完成四条课程路线后再进入 API Reference。
