# Zustand 课程计划

> 版本：v1.0
> 日期：2026-08-19
> 状态：课程地图已确认；完成状态以复选框为准
> 课程总数：36

## 1. 课程定位

本模块从客户端状态基础开始教学 Zustand，最终达到能够设计、实现、调试、测试和维护生产级 React
客户端状态系统的程度。课程以本科阶段常用前端开发能力为范围，按基础、中级、高级递进；每个阶段
包含 10 节知识课和 2 节实战课，共 36 课。

基础和中级课程以 `create` 创建的 React 绑定 Store 为唯一主线，覆盖日常 React 项目最常用的状态、
Action、Selector、TypeScript、持久化、调试、订阅、模块组织和测试。Vanilla Store、作用域隔离、
Store Factory、多实例及 SSR/hydration 统一放在高级阶段，不与 React 绑定 Store 建立重复路线。

## 2. 执行规则

- 统一遵守 [`课程内容规范.md`](../../standards/课程内容规范.md)、
  [`调研与来源规范.md`](../../standards/调研与来源规范.md)、
  [`质量门禁规范.md`](../../standards/质量门禁规范.md) 和
  [`React技术补充规范.md`](../../standards/react/React技术补充规范.md)。
- 每次只实施一课。当前课完成前，不调研、编写或登记下一课。
- 本计划不固定 Zustand 版本；每课实施时实时核对当时最新稳定版官方资料，再确定该课的详细内容、
  Demo、易错点和边界。
- 属于本课的内容尽量完整覆盖，不限制正文行数或字数；语言直接、准确，不堆叠修饰和重复说明。
- 课程正文和左侧标题只描述本课知识，不出现本计划编号、完成进度、批次或其他课程的实施内容。
- 不保存逐课调研、临时验证、复审、signoff 或执行日志；全部适用门禁通过后只勾选本清单对应课程。

## 3. 基础课程

- [x] 01. 客户端状态与 Zustand
- [x] 02. 第一个 Store
- [x] 03. State 与 Action
- [x] 04. set 状态更新
- [x] 05. get 当前状态
- [x] 06. 组件订阅
- [x] 07. Selector
- [x] 08. 对象与数组更新
- [x] 09. TypeScript Store
- [x] 10. 状态所有权
- [x] 11. 实战：任务筛选器
- [x] 12. 实战：购物车状态

## 4. 中级课程

- [x] 01. 原子 Selector
- [x] 02. Selector 结果稳定性
- [x] 03. useShallow
- [x] 04. 派生状态
- [x] 05. 异步 Action
- [x] 06. 状态重置
- [x] 07. persist 持久化
- [x] 08. DevTools 调试
- [x] 09. subscribe 订阅
- [x] 10. Slices Pattern
- [x] 11. 实战：偏好设置中心
- [x] 12. 实战：内容管理工作区

## 5. 高级课程

- [x] 01. Vanilla Store
- [x] 02. Context 作用域
- [x] 03. Store Factory 与多实例
- [x] 04. Zustand 高级 TypeScript
- [x] 05. subscribeWithSelector
- [x] 06. 中间件组合
- [x] 07. Immer Middleware
- [x] 08. 持久化版本迁移
- [x] 09. Zustand 测试
- [x] 10. SSR 与 Hydration
- [x] 11. 实战：多实例编辑器
- [x] 12. 实战：生产级客户端状态平台

## 6. 范围边界

- React 绑定 Store 是基础和中级课程的默认实现方式；Vanilla Store 只在高级场景中教学。
- React 局部 State 继续负责组件私有状态，Context 继续负责依赖传递；不把所有状态迁入 Zustand。
- URL 参数、查询参数和导航状态属于 React Router；服务端缓存、失效、重试、分页和 mutation 属于
  TanStack Query。
- `redux` middleware、自动生成 Selector、自定义 middleware 和旧版本迁移不作为课程主线，按实际
  价值放入高级边界说明或后续 API Reference。
- Next.js 不进入课程主线；SSR/hydration 只讲 Zustand 与 React 的通用状态隔离和一致性边界。
- Zustand API Reference 统一后置到 React 生态 API Reference 阶段。

## 7. 完成条件

36 个课程复选框全部勾选后，Zustand 课程阶段完成。完成只表示课程正文、必要 Demo、运行时登记和适用
质量门禁已经逐课通过，不表示 Zustand API Reference 已完成。
