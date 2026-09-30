# TanStack Query 课程计划

> 版本：v1.0
> 日期：2026-08-19
> 状态：课程地图已确认；完成状态以复选框为准
> 课程总数：48

## 1. 课程定位

本模块从服务端状态基础开始教学 TanStack Query，最终达到能够设计、实现、调试、测试和维护生产级
React 服务端数据层的程度。课程以本科阶段常用前端开发能力为范围，按基础、中级、高级递进；每个
阶段包含 14 节知识课和 2 节实战课，共 48 课。

课程以 React 项目最常用的开发模式为主线：使用浏览器原生 `fetch` 编写 Query Function，通过
`QueryClientProvider` 提供客户端，使用 `useQuery` 读取数据并使用 `useMutation` 修改数据。查询缓存、
失效、分页、乐观更新和按业务模块封装属于基础与中级重点；Suspense、Router 深度集成、离线持久化和
SSR/hydration 等能力统一放在高级阶段。

## 2. 执行规则

- 统一遵守 [`课程内容规范.md`](../../standards/课程内容规范.md)、
  [`调研与来源规范.md`](../../standards/调研与来源规范.md)、
  [`质量门禁规范.md`](../../standards/质量门禁规范.md) 和
  [`React技术补充规范.md`](../../standards/react/React技术补充规范.md)。
- 每次只实施一课。当前课完成前，不调研、编写或登记下一课。
- 本计划不固定 TanStack Query 版本；每课实施时实时核对当时最新稳定版官方资料，再确定该课的详细
  内容、Demo、易错点和边界。
- 属于本课的内容尽量完整覆盖，不限制正文行数或字数；语言直接、准确，不堆叠修饰和重复说明。
- 课程正文和左侧标题只描述本课知识，不出现本计划编号、完成进度、批次或其他课程的实施内容。
- 不保存逐课调研、临时验证、复审、signoff 或执行日志；全部适用门禁通过后只勾选本清单对应课程。

## 3. 基础课程

- [x] 01. 服务端状态与 TanStack Query
- [x] 02. Query Client 与 Provider
- [x] 03. 第一个 useQuery
- [x] 04. Query Function 与 fetch
- [x] 05. Query Key
- [x] 06. 查询状态
- [x] 07. 查询错误处理
- [x] 08. 查询缓存与数据共享
- [x] 09. staleTime 与数据新鲜度
- [x] 10. 后台重新获取
- [x] 11. 缓存生命周期与 gcTime
- [x] 12. 条件查询
- [x] 13. TypeScript 查询
- [x] 14. React Query Devtools
- [x] 15. 实战：用户信息面板
- [x] 16. 实战：文章列表与详情

## 4. 中级课程

- [x] 01. Query Key 组织
- [x] 02. 查询配置复用
- [x] 03. 依赖查询
- [x] 04. 并行查询
- [x] 05. 查询重试
- [x] 06. 查询取消
- [x] 07. 初始数据与占位数据
- [x] 08. 分页查询
- [x] 09. useMutation
- [x] 10. Mutation 生命周期
- [x] 11. 查询失效
- [x] 12. Mutation 响应更新缓存
- [x] 13. 乐观更新与回滚
- [x] 14. 数据 Hooks 与模块组织
- [x] 15. 实战：分页内容管理
- [x] 16. 实战：CRUD 管理工作区

## 5. 高级课程

- [x] 01. 无限查询
- [x] 02. 无限查询内存控制
- [x] 03. 查询预取
- [x] 04. React Router 数据集成
- [x] 05. 请求瀑布优化
- [x] 06. 查询渲染优化
- [x] 07. Query Client 与缓存操作
- [x] 08. 并发 Mutation 状态
- [x] 09. Suspense 查询
- [x] 10. Query Error Boundary
- [x] 11. 离线查询与缓存持久化
- [x] 12. SSR 与 Hydration
- [x] 13. TanStack Query 测试
- [x] 14. 生产级数据层架构
- [x] 15. 实战：协作内容平台
- [x] 16. 实战：生产级服务端数据中心

## 6. 范围边界

- TanStack Query 管理服务端状态的请求、缓存、新鲜度、失效和同步，不替代 React 局部 State、Redux
  或 Zustand 的客户端状态职责。
- 浏览器原生 `fetch` 是课程默认请求实现；Axios、GraphQL 客户端和其他请求库只说明适配方式，不建立
  独立教学分支。TanStack Query 不承担 HTTP 客户端的完整教学。
- React Router 负责路由匹配、导航生命周期、Loader、Action 和 URL 状态；TanStack Query 负责跨页面
  缓存、后台刷新、失效、重试和 Mutation 协调。
- `useQuery`、`useMutation` 和显式加载、错误状态是基础与中级主线；Suspense 查询和 Query Error
  Boundary 放在高级阶段。
- RTK Query 与 SWR 只用于技术选择边界，不建立课程分支。标记为 Experimental 的插件和 API 不进入
  稳定教学主线。
- Next.js、React Server Components 和框架专属流式渲染不进入课程主线；SSR/hydration 只讲 React 与
  TanStack Query 的通用数据一致性边界。
- TanStack Query API Reference 统一后置到 React 生态 API Reference 阶段。

## 7. 完成条件

48 个课程复选框全部勾选后，TanStack Query 课程阶段完成。完成只表示课程正文、必要 Demo、运行时
登记和适用质量门禁已经逐课通过，不表示 TanStack Query API Reference 已完成。
