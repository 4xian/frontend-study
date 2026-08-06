# IT 学习站前端路线计划

> 版本：v1.2
> 日期：2026-08-05
> 状态：TypeScript T2-2 已完成；内容架构迁移已完成，下一内容批次为 T3-1
> 权威规范：[`IT学习站前端规范.md`](./IT学习站前端规范.md)

## 1. 计划目标

本计划只管理 IT 学习站的前端内容域。已完成的 Vue 生态保持维护状态；新内容严格
按照 TypeScript → Vite → React Core → React Router → 状态管理 → 数据管理 → 测试与交付的依赖
顺序推进。Next.js 和 Nuxt 不进入本计划。

## 2. 执行规则

1. 每个模块从只读 R0 开始，冻结官方范围、版本、课程顺序、Reference 索引、Demo seam 和批次。
2. 一批完成调研、实现、临时反馈环、浏览器验证、复审和状态登记后，才能开始下一批。
3. 课程和 Reference 使用独立模板；Reference 不机械地为每个官方名称创建长文。
4. 新模块先建立总览、manifest 和最小垂直切片，再按冻结批次扩展。
5. 外部事实使用 Tavily 查找并回到官方来源；源码固定 tag 或 commit。
6. 不修改已完成 Vue 内容，除非新工作暴露真实回归或官方维护任务。
7. 普通前端内容批次不修改 `docs/backend/`、后端内容或后端审计资产。
8. 不主动提交、推送或创建 PR。
9. Gate 关闭后提取长期事实并删除该模块的调研和实施计划。
10. 当前架构已经切换完成，后续批次不得恢复旧目录、旧 URL 或 TypeScript 正文模式。

## 3. 当前基线

| 模块 | 课程 | Reference | 状态 |
| --- | ---: | ---: | --- |
| Vue Core | 31 | 官网索引 206/206 | 完成，进入维护 |
| Vue Router | 15 | 稳定 118/118；Experimental 86 项观察清单 | 完成，进入维护 |
| Pinia | 14 | 稳定 41/41；restricted 26/26 已说明 | 完成，进入维护 |
| TypeScript | 16/24 | 0/200 planned | T2-2 已完成，下一批为 T3-1 |
| Vite | 0 | 0 | 等待 TypeScript Gate |
| React 生态 | 0 | 0 | 等待 Vite Gate |

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
      -> R0 React 宿主与官方范围冻结
      -> RC React Core 课程与 Reference
      -> RR React Router 课程与 Reference
      -> RS React 状态管理课程与 Reference
      -> RD React 数据管理课程与 Reference
      -> Gate R
        -> Q 测试、交付、性能与质量
        -> UI 前端入口与前端路径验收
```

## 5. TypeScript 阶段

### T0：官方调研与实施冻结

先核对当前 TypeScript 稳定版、Handbook、Reference、TSConfig Reference、发布说明、标准库声明和
固定源码。建立官方主题到站内课程/Reference 的覆盖矩阵，冻结课程 ID、前置关系、难度、唯一 Demo
或临时编译 fixture、批次数量和 Gate。R0 结束前不发布正文。

T0 已于 2026-08-05 冻结：官方稳定版为 TypeScript `7.0.2`，课程为 24 课，稳定 Reference 为 200 个
映射键。权威交付物为
[`T0-官方调研与实施冻结.md`](./plans/typescript/T0-官方调研与实施冻结.md) 与
[`TypeScript官方覆盖矩阵.md`](./coverage-matrices/TypeScript官方覆盖矩阵.md)。T1 与 T2 已按冻结范围
开放十六课；T2-2 已通过独立双轴复审。T3-1 尚未开始，是迁移关闭后的下一内容批次，仍须按本计划
单独执行完整 Gate。

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
- 开发服务器、插件和生产构建的结论由对应阶段的真实临时 fixture 验证。
- 现有 Vue 应用构建、懒加载、Demo 源码和 chunk 行为无回归。
- TypeScript 课程可作为 Vite 配置与插件课程的真实前置关联。

## 7. React Core 阶段

### R0：官方范围与宿主冻结

核对 React、React DOM 和 JSX/TypeScript 配置的当前稳定范围及固定源码。设计 React Demo Adapter：
动态加载 runtime，挂载 TSX Demo，切换或离开时 `unmount`，并继续用 `?raw` 展示同源源码。先证明
访问 Vue、TypeScript 或 Vite 页面不会提前加载 React runtime。

同时冻结 React Core 课程与稳定 Reference；experimental、canary 和框架专属能力进入独立观察清单，
不计入稳定完成度。

### RC1：基础课程

顺序为 JSX → 组件 → Props → 条件与列表 → 事件 → State → 表单 → 组件组合。示例默认 TypeScript，
只关联已完成的 TypeScript 课程，不在 React 课程中重复讲完整类型系统。

### RC2：中级课程

进入状态建模、更新队列、Reducer、Context、Ref、Effect、资源清理和自定义 Hook。Effect 放在能够
先区分事件与渲染计算之后，避免把它教成通用同步工具。

### RC3：高级课程

覆盖错误边界、Suspense、Transition、外部 store 接入、可复用组合、性能分析、服务端能力边界和
第三方库 interface。仅讲稳定公开能力；版本敏感内容由 R0 决定状态。

### RCA：React Core Reference

按官方 Components、Hooks、APIs 与 React DOM 分类建立稳定索引。每个条目区分纯函数规则、渲染期
规则、事件期行为和宿主 DOM 行为；合并相关 overload 或类型，不为每个导出机械创建长文。

## 8. React Router 阶段

在 React Core 组件、State、Effect 和 Context 之后进入。R0 核对当前稳定版本、模式与官方索引，
然后按路由配置与导航 → Params/Query/嵌套 → Loader/Action/错误与并发 → 鉴权、懒加载、滚动、类型和
部署递进。课程与 Reference 独立完成 Gate，不把 Vue Router 结构直接复制过来。

## 9. React 状态管理阶段

模块 ID 保持 `react/state`，不提前绑定 vendor。R0 对候选库的官方维护状态、TypeScript 体验、学习
成本、运行模型和生态采用情况做短决策记录，只选择一个主讲方案；其他方案进入对比或后续计划。

课程顺序为局部状态边界 → 共享状态建模 → selector 与派生状态 → 异步 action → 持久化、调试、测试
和 SSR 边界。Reference 只覆盖选定主线的稳定公开 interface，并明确与 React Context、Reducer 和
服务端数据管理的分工。

## 10. React 数据管理阶段

模块 ID 保持 `react/data`。R0 决定首批服务端状态库，课程按查询键与缓存 → 加载/错误 → mutation
与失效 → 分页与无限加载 → optimistic update → 预取、并发、SSR 与测试递进。不得把所有远程数据
复制到客户端状态 store。

表单与校验先作为 React Core 和数据 mutation 的组合专题；只有 R0 证明独立库具有足够教学深度和
稳定官方 Reference 时，才新增单独模块，不在总计划中预创建空入口。

### Gate R

- React Core、Router、状态管理、数据管理均有独立课程总览和 Reference 总览。
- TSX Demo 真实运行、源码同源、正确卸载，不产生重复 root 警告。
- React runtime 只在进入 React 内容或 Demo 时按需加载。
- 四条路线的关联只指向真实可用条目，Next.js 未混入。
- 桌面、390px、键盘、reduced motion、搜索和跨生态切换通过代表路径验证。

## 11. 测试、交付与质量阶段

在 TypeScript、Vite 和 React 均有真实内容后，开放通用工程化模块：

1. **测试**：Vitest、Vue Test Utils、Testing Library 和 Playwright，按单元、模块 interface、集成、
   E2E 分工组织。
2. **构建部署**：环境配置、构建产物、静态部署、缓存、source map、错误回滚和 CI 基础。
3. **性能与质量**：bundle、懒加载、渲染性能、可访问性、lint、format、类型门禁和依赖治理。

课程必须围绕已有 Vue/React 项目验证，不建立与实际宿主脱节的命令百科。

## 12. 前端入口与体验验收

前述模块关闭 Gate 后，再统一复验技术中心中的前端入口、Module 总览、课程与 Reference
详情、Demo 视图、搜索、进度、深链、构建 chunks、390px、键盘和降级模式。视觉工作不能反向改变
内容 ID、课程顺序、Reference 覆盖或全站信息架构。

## 13. 下一任务

下一内容批次固定为 TypeScript T3-1，高级范围和 T0 冻结结论不变。开始前仍需按执行规则冻结本批
范围、反馈环和停止边界；本次架构迁移不自动授权创建 T3-1 调研、条目、Demo、持久化 fixture 或
测试文件。
