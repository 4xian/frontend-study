# Redux Toolkit + React Redux 课程计划

> 版本：v1.0
> 日期：2026-08-19
> 状态：课程地图已确认；完成状态以复选框为准
> 课程总数：48

## 1. 课程定位

本模块从零基础进入现代 Redux 开发，最终达到能够设计、实现、调试、测试和维护生产级 React 客户端
状态系统的程度。课程以本科阶段常用前端开发能力为范围，按基础、中级、高级递进；每个阶段包含 14 节
知识课和 2 节实战课，共 48 课。

Redux Toolkit 负责 store、slice、reducer、action、异步逻辑和 middleware，React Redux 负责 Provider、
Hooks、组件订阅和渲染边界。两者作为同一教学主线实施，但每课必须明确包职责和 API 来源。RTK Query
只讲定位与选择边界；服务端状态完整教学属于后续 TanStack Query 课程。

## 2. 执行规则

- 统一遵守 [`课程内容规范.md`](../../standards/课程内容规范.md)、
  [`调研与来源规范.md`](../../standards/调研与来源规范.md)、
  [`质量门禁规范.md`](../../standards/质量门禁规范.md) 和
  [`React技术补充规范.md`](../../standards/react/React技术补充规范.md)。
- 每次只实施一课。当前课完成前，不调研、编写或登记下一课。
- 本计划不固定 Redux Toolkit 或 React Redux 版本；每课实施时实时核对当时最新稳定版官方资料，再确定
  该课的详细内容、Demo、易错点和边界。
- 属于本课的内容尽量完整覆盖，不限制正文行数或字数；语言直接、准确，不堆叠修饰和重复说明。
- 课程正文和左侧标题只描述本课知识，不出现本计划编号、完成进度、批次或其他课程的实施内容。
- 不保存逐课调研、临时验证、复审、signoff 或执行日志；全部适用门禁通过后只勾选本清单对应课程。

## 3. 基础课程

- [ ] 01. 现代 Redux 技术栈
- [ ] 02. Redux 单向数据流
- [ ] 03. configureStore
- [ ] 04. Provider
- [ ] 05. createSlice
- [ ] 06. Action 与 Payload
- [ ] 07. Reducer 与 Immer
- [ ] 08. useSelector
- [ ] 09. useDispatch
- [ ] 10. TypeScript 与预类型 Hooks
- [ ] 11. 多 Slice 与 RootState
- [ ] 12. Redux 状态所有权
- [ ] 13. Redux DevTools
- [ ] 14. Feature 目录与模块组织
- [ ] 15. 实战：任务筛选面板
- [ ] 16. 实战：购物车状态中心

## 4. 中级课程

- [ ] 01. Selector
- [ ] 02. createSelector
- [ ] 03. useSelector 结果身份与订阅
- [ ] 04. Thunk 异步逻辑
- [ ] 05. createAsyncThunk
- [ ] 06. 异步生命周期状态
- [ ] 07. 异步错误与 rejectWithValue
- [ ] 08. 异步取消与请求条件
- [ ] 09. extraReducers 与 Action Matcher
- [ ] 10. Middleware 执行链
- [ ] 11. 默认 Middleware 检查
- [ ] 12. Listener Middleware
- [ ] 13. 标准化状态
- [ ] 14. createEntityAdapter
- [ ] 15. 实战：异步内容管理工作区
- [ ] 16. 实战：实体关系管理台

## 5. 高级课程

- [ ] 01. 大型应用状态架构
- [ ] 02. Redux Toolkit 高级 TypeScript
- [ ] 03. 预类型异步与监听工具
- [ ] 04. 参数化 Selector 与 Selector Factory
- [ ] 05. 订阅边界与渲染性能
- [ ] 06. 异步并发与请求身份
- [ ] 07. 乐观更新与回滚
- [ ] 08. 状态持久化与版本迁移
- [ ] 09. 自定义 Middleware 与可观测性
- [ ] 10. 动态 Reducer 与代码分割
- [ ] 11. Store Factory 与依赖注入
- [ ] 12. SSR 与 Hydration
- [ ] 13. Redux 应用测试
- [ ] 14. 旧 Redux 与 connect 迁移边界
- [ ] 15. 实战：模块化管理后台
- [ ] 16. 实战：生产级协作状态平台

## 6. 范围边界

- `createStore`、手写不可变更新和旧式 Redux 样板只用于原理理解或迁移，不作为实现主线。
- `connect`、`mapStateToProps` 和 `mapDispatchToProps` 只用于识别与迁移旧项目。
- Redux Saga、Redux Observable 不进入本课程主线。
- RTK Query 只说明与客户端状态、Thunk 和 TanStack Query 的职责边界，不展开完整 API 教学。
- Thunk 主要处理业务流程、命令式异步任务和非缓存型请求，不把所有服务端数据长期复制进 Redux store。
- Redux Toolkit 与 React Redux API Reference 统一后置到 React 生态 API Reference 阶段。

## 7. 完成条件

48 个课程复选框全部勾选后，Redux Toolkit + React Redux 课程阶段完成。完成只表示课程正文、必要 Demo、
运行时登记和适用质量门禁已经逐课通过，不表示两套库的 API Reference 已完成。
