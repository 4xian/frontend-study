# IT 学习站前端文档入口

本目录管理前端内容域的长期规范、路线计划、覆盖基线与当前模块资料。跨前端、后端、网络的目录、
Catalog、路由和菜单由全站架构统一定义；普通前端内容任务不得修改后端内容或审计资产。

## 权威顺序

发生冲突时，按以下顺序处理：

1. [`IT学习站架构设计.md`](../architecture/IT学习站架构设计.md)：跨领域目录、内容类型、Catalog、
   路由和菜单边界。
2. [`IT学习站前端规范.md`](./IT学习站前端规范.md)：前端域稳定的内容和体验规则。
3. [`standards/`](./standards/)：统一的课程、Reference、Demo、来源和质量门禁规范，以及必要的技术补充规范。
4. [`IT学习站前端路线计划.md`](./IT学习站前端路线计划.md)：模块顺序、当前状态和阶段 Gate。
5. [`coverage-matrices/`](./coverage-matrices/)：官方内容范围和站内映射基线。
6. [`plans/`](./plans/)：各技术模块的课程地图、顺序和完成复选框。

代码中的 schema、manifest 和测试负责执行文档规则。文档与代码不一致时先停止内容扩展，查明是
规范过期还是实现偏离，不得静默选择一边。

## 文档生命周期

长期保留架构、通用规范、技术补充规范、总路线、覆盖基线和模块课程计划。新课程的实时调查、临时
验证和复审结果不作为仓库文档保存；既有历史路径只能解释当时证据，不能重新成为运行时入口。

## 当前入口

Vue Core、Vue Router 和 Pinia 已完成既定课程与 Reference 覆盖。TypeScript Gate T 已通过，课程为
`24/24`，稳定 Reference 为 `199/199 available`、`0 planned`，并进入维护状态。Vite Gate V 已通过，
课程为 `24/24`，稳定 Reference 为 `175/175 available`、`0 planned`，并进入维护状态。React Core
调整后的路线已完成 `74/74`，其中基础 `24/24`、中级 `21/21`、高级 `29/29`，共 `62` 节知识课和
`12` 节实战课。React Core Reference 仍为 `0`，Gate RC 与 Gate R 均为 Pending。API Reference 已统一
后置到 Router、Redux Toolkit + React Redux、Zustand 和 TanStack Query 课程完成之后。React Router
的 [`48 课课程计划`](./plans/react/React-Router课程计划.md)、
[`Redux Toolkit + React Redux 48 课课程计划`](./plans/react/Redux-Toolkit与React-Redux课程计划.md) 与
[`Zustand 36 课课程计划`](./plans/react/Zustand课程计划.md)、
[`TanStack Query 48 课课程计划`](./plans/react/TanStack-Query课程计划.md) 已确认，完成状态只读取各自
计划复选框；这些生态课程均未创建运行时 Module。
