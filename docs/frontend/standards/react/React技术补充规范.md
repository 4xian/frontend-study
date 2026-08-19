# React 技术补充规范

> 版本：v1.0
> 日期：2026-08-19
> 状态：生效
> 适用范围：`src/categories/frontend/react/`

## 1. 规范关系

React Core、React Router、Redux Toolkit + React Redux、Zustand 和 TanStack Query 课程先遵守
[`IT学习站前端规范.md`](../../IT学习站前端规范.md) 与 [`课程内容规范.md`](../课程内容规范.md)。本文只
补充 React 技术栈的代码形式、运行宿主和生态边界，不覆盖或放宽前端通用规范。

## 2. 代码形式

React 课程的展示代码默认使用 TSX。包含 JSX 标记的文件使用 `.tsx` 和 `tsx` 代码块，不包含 JSX 的
纯数据或工具模块使用 `.ts` 和 `ts` 代码块。专门讲解 JSX 语法、JSX Runtime，或明确比较 JavaScript
与 TypeScript 时可以使用 `.jsx` 和 `jsx`，但正文必须说明原因。

同一知识点的正文、文件名、导入路径、语法高亮和实际 Demo 源码必须一致，不得无说明混用 JSX 与
TSX。课程标题保持简短，只写知识点名称，不带基础/中级/高级编号、计划代码或实施状态。

## 3. Demo 宿主

React Demo 通过现有 React Demo Adapter 按需加载运行时，挂载到宿主提供的容器，并在切换条目或离开
页面时卸载 root。运行组件与源码展示必须来自同一份真实源码，不复制一份仅用于展示的代码。

非 React 页面和未运行 React Demo 的总览不得提前加载 React runtime。Demo 只验证当前课程需要观察的
行为；需要服务端、静态生成、部署或编译环境的主题使用匹配的 `/tmp` 临时环境，不用普通 SPA 效果
替代。

## 4. 生态边界

- React Core 只负责 React 与 React DOM 的客户端核心能力，不代讲 Router、第三方状态库或数据请求库。
- React Router 以 Data Mode 为唯一实现主线；Declarative Mode 只用于模式识别，Framework Mode 只讲
  能力边界与迁移，不建立重复课程路线。
- Redux Toolkit 负责标准 Redux 逻辑与 store，React Redux 负责 React 组件绑定；两者使用同一课程主线，
  但不得混淆包职责和 API 来源。
- Zustand 与 TanStack Query 分别建立独立课程计划。Zustand 管理客户端状态，TanStack Query 管理服务端
  状态；不得把远程缓存默认复制进客户端 store。
- React Router Data Mode 与 TanStack Query 都可能参与数据加载，具体缓存所有权必须在相关课程中明确，
  不能让两个层级无约束地重复请求和缓存同一份数据。

## 5. 计划与完成状态

每条 React 技术主线使用一份独立课程计划。课程计划只保存阶段、顺序、学习终点和复选框；每课的实时
调研、临时验证和按风险复审不写入计划，也不生成独立仓库文档。全部适用门禁通过后只勾选对应课程。
