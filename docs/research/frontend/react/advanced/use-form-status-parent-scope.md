# `useFormStatus` 表单作用域研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.advanced.use-form-status-parent-scope`
- 标题：`useFormStatus` 表单作用域
- `officialKey`：`useFormStatus`
- 教学层级：高级
- 前置课程：`react.core.learn.advanced.use-optimistic-pending-state`
- 核验日期：`2026-08-15`
- 生产状态：研究完成；正文、同源 Demo、entry/demo manifest 登记、Track 发布、浏览器验收与
  独立复审均未开始，第 15 课仍为 `planned`
- live RC3 状态：`14/24 available`、`10 planned`，下一课为本课
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 构建基线：Vite `8.1.5`、`@vitejs/plugin-react` `6.0.5`、TypeScript `6.0.3`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

本课只回答一条主线：一个后代组件怎样调用 `useFormStatus()` 读取包围它的父 `<form>` 最近一次
function Action 提交状态，并用 `pending`、`data`、`method` 和 `action` 观察该 form 的局部作用域；
同组件声明的 form、子组件声明的 form、兄弟 form 和无父 form 都不应被误读成全局状态。

必须覆盖：

1. `useFormStatus` 从 `react-dom` 导入，不接收参数，并遵守 Hook 顶层调用规则；本课不从 `react`
   导入它。
2. Hook 返回对象包含 `pending`、`data`、`method`、`action` 四个字段，不返回结果 State、dispatch、
   optimistic setter、错误对象或队列长度。
3. 父 form 正在提交时 `pending` 为 `true`；没有活动提交、没有父 form 或 Hook 读取不到目标 form 时为
   `false`。不得把普通 `onSubmit` Promise、任意请求或页面级工作冒充 form pending。
4. pending 分支的 `data` 是本次父 form 提交的 `FormData`；无活动提交或无父 form 时为 `null`。
   Demo 只读取已冻结的 `name="message"` 字段，不把 `FormData#get()` 写成完整对象解析器。
5. `method` 表示父 form 提交时的 DOM method。公开 Reference 描述为 `'get'` 或 `'post'`；空闲态在
   React DOM `19.2.8` 与当前类型中是 `null`。Demo 显式使用 `method="post"`，避免默认 `get` 与
   function Action 的 POST 协议 caveat 混成另一条教学主线。
6. function Action pending 时，`action` 是传给该父 form `action` prop 的函数引用；无父 form 时为
   `null`。公开 Reference 还说明 URI action 或未提供 action 时该字段为 `null`，但本课不实证 URL
   导航，只用客户端函数和引用相等验证。
7. Hook 必须由 `<form>` 元素的后代组件读取。React 19 发布说明把父 form 类比为 Context provider；
   作用域跟随组件在父 form 下的位置，而不是 Hook 所在文件、props 名称或页面全局状态。
8. 在声明目标 `<form>` 的同一个组件中先调用 Hook，读不到这个组件随后返回的 form；Hook 只读取父
   form，不读取同组件或后代组件声明的 form。正确结构是 `<form><Status /></form>`，由 `Status`
   内部调用 Hook。
9. “最近父 form”只用于合法的父级作用域描述，不授权把 `<form>` 物理嵌套在另一个 `<form>` 中。
   React `v19.2.8` 官方测试明确把嵌套 form 标为无效 HTML并产生 hydration 警告；正式 Demo 必须用
   两个兄弟 form 与各自的后代监视器证明隔离。
10. function Action 由 React 收集本次 `FormData` 并在 Transition 中调用；本课使用内存 deferred gate
    保持 pending，手工 resolve 后回到空闲态。不得加入 Server Function、真实网络或提交业务。
11. `useFormStatus` 是 React 19 的稳定 React DOM Hook；本课适用 React / React DOM `19.2.8`，不向
    React 18、Canary、其他 renderer 或未来 minor 推导相同实现细节。

明确排除：Server Functions、`'use server'`、Server Components、RSC、SSR、hydration、无 JavaScript
提交、Progressive Enhancement、`permalink`、真实网络、fetch/XHR/WebSocket、后端 API、数据库、表单
校验、提交业务、文件上传、缓存、持久化、事务、幂等、重试、取消、竞态、并发双提交、全局 pending、
物理嵌套 `<form>`、Portal form、多个 Root、`useActionState` 结果队列、`useOptimistic` 临时状态、
`useTransition` 通用调度，以及 RC3 第 16 课及后续资产。

## 调研方法与来源边界

1. 按仓库外部搜索顺位先使用 Tavily，并限定 `react.dev` 与 React 官方 GitHub 仓库定位
   `useFormStatus` Reference、React 19 发布说明、React DOM form 源码与官方测试。Tavily 正常返回
   可靠官方候选，因此未切换 Exa、Parallel、Perplexity 或原生 Web 搜索。
2. Tavily 只承担 URL 发现。事实逐项回到 React `19.2` 浮动 Reference、固定
   `reactjs/react.dev` Markdown、固定 `facebook/react@v19.2.8` 源码/测试、npm 元数据与本地安装
   类型；搜索摘要和第三方文章不承担证明。
3. 公共行为以官方 `useFormStatus`、`<form>` Reference 与 React 19 stable 发布说明为准。固定 runtime
   源码只旁证当前 patch 的空闲对象、FormData 收集、status 对象、父级 host transition context 与嵌套
   form 禁止边界；Fiber、lane、dispatcher 和 context cursor 名称不进入学习者正文。
4. npm registry 已核对 `react@19.2.8` 与 `react-dom@19.2.8` 的 `gitHead` 都是
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。`package.json`、lockfile 与 `node_modules` 三层版本
   已逐项对齐。
5. live Track、RC3 计划和路线状态已核对为第 1-14 课 `available`、第 15-24 课 `planned`，即
   `14/24 available`、`10 planned`。本稿创建前，第 15 课专属研究稿、正文、Demo 目录及 entry/demo
   manifest 登记均不存在。
6. 本研究只新增本文件并冻结第 15 课教学、Demo 与未来验收合同，不授权创建正文、Demo、manifest、
   Track、计划、状态、测试或构建资产，也不授权开始第 16 课。

## 官方来源卡

| 编号 | 一手来源 | 版本固定 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [React `useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus) | React DOM 文档 `19.2` | 无参数、四字段返回值、父 form、后代调用、同组件陷阱、无父 form troubleshooting 与 FormData 展示。 |
| S2 | [固定 `useFormStatus` 返回值与 caveats](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/hooks/useFormStatus.md#L21-L69) | 文档提交 `c7d6b700...` | 固定 pending/data/method/action 和“只读父 form”公开合同。 |
| S3 | [固定同组件陷阱](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/hooks/useFormStatus.md#L115-L149) | 文档提交 `c7d6b700...` | 同组件调用读不到自身返回的 form；必须拆出 form 内后代组件。 |
| S4 | [固定 FormData 与无父 form troubleshooting](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/hooks/useFormStatus.md#L151-L230) | 文档提交 `c7d6b700...` | pending 期间读取提交数据；无父 form 时 pending 恒为 false。 |
| S5 | [React `<form>`](https://react.dev/reference/react-dom/components/form) | React DOM 文档 `19.2` | function action 接收 FormData、运行在 Transition 中，以及 function action 的 POST caveat。 |
| S6 | [固定 `<form>` function Action 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/form.md#L37-L45) | 文档提交 `c7d6b700...` | function `action` 可 async、唯一参数为 FormData；function action/formAction 按 POST 处理。 |
| S7 | [固定 `<form action={fn}>` 用法](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/form.md#L89-L110) | 文档提交 `c7d6b700...` | 客户端函数 Action 不需要 `preventDefault`，由 React 传入 FormData 并放入 Transition。 |
| S8 | [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19#new-hook-useformstatus) | React `19` stable | React 19 新增 `useFormStatus`，父 form 类似 Context provider。 |
| S9 | [固定 React 19 发布说明](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/blog/2024/12/05/react-19.md#L191-L218) | 文档提交 `c7d6b700...` | 固定 form Actions 与 `useFormStatus` 的 stable 发布身份和父级作用域表述。 |
| S10 | [`v19.2.8` `ReactDOMFormActions.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/shared/ReactDOMFormActions.js#L15-L64) | React DOM `v19.2.8` | 空闲对象为 `{pending:false,data:null,method:null,action:null}`；Hook 转发到 host transition status。 |
| S11 | [`v19.2.8` `FormActionEventPlugin.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/events/plugins/FormActionEventPlugin.js#L48-L175) | React DOM `v19.2.8` | 提交时构造 FormData；function Action 路径生成四字段 pending 对象、阻止原生导航并启动 host Transition。 |
| S12 | [`v19.2.8` host status 读取](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L3434-L3448) | React `v19.2.8` | `useHostTransitionStatus` 读取当前 HostTransitionContext，而不是全局请求状态。 |
| S13 | [`v19.2.8` 最近 host provider 与嵌套限制](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHostContext.js#L29-L34) | React `v19.2.8` | host transition provider 表示最近 provider；React DOM 中是 form，同时明确 form 不可嵌套。 |
| S14 | [`v19.2.8` provider 弹栈](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHostContext.js#L120-L136) | React `v19.2.8` | 离开 form provider 后回到 NotPending；源码再次说明嵌套 form 不被允许。 |
| S15 | [`v19.2.8` 四字段官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L884-L932) | React DOM `v19.2.8` | 后代读取 pending、FormData、action 函数和 method；Action settle 后回到空闲态。 |
| S16 | [`v19.2.8` 嵌套 form 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L364-L400) | React DOM `v19.2.8` | React 明确报告 `<form>` 不能成为 `<form>` 后代且会导致 hydration error；仅做容错测试，不是推荐结构。 |
| S17 | [`v19.2.8` action 引用测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L2215-L2283) | React DOM `v19.2.8` | pending status 的 function `action` 保留原函数引用；字符串 action 与其他 coercion 不进入本课 Demo。 |
| S18 | [React `v19.2.8` npm 元数据](https://registry.npmjs.org/react/19.2.8) | npm 发布 `19.2.8` | React patch 的 `gitHead` 对齐固定运行时提交。 |
| S19 | [React DOM `v19.2.8` npm 元数据](https://registry.npmjs.org/react-dom/19.2.8) | npm 发布 `19.2.8` | React DOM patch 与 React 使用相同 `gitHead`。 |

## 版本与类型基线

### 文档 minor 与运行时 patch

React 官网按 `19.2` minor 维护 Reference，没有独立 `19.2.8` 文档站。本课用 S1-S9 证明公共 API，
用 S10-S17 固定当前 patch 的关键状态形状、scope 机制和回归证据。live 依赖三层结果为：

| 包 | `package.json` | lock | install |
| --- | --- | --- | --- |
| `react` | `19.2.8` | `19.2.8` | `19.2.8` |
| `react-dom` | `19.2.8` | `19.2.8` | `19.2.8` |
| `@types/react` | `19.2.18` | `19.2.18` | `19.2.18` |
| `@types/react-dom` | `19.2.4` | `19.2.4` | `19.2.4` |
| `vite` | `^8.1.5` | `8.1.5` | `8.1.5` |
| `@vitejs/plugin-react` | `6.0.5` | `6.0.5` | `6.0.5` |
| `typescript` | `~6.0.0` | `6.0.3` | `6.0.3` |

RC3 计划头部仍记录 TypeScript `7.0.2`，但 live package、lock 与 install 均是 TypeScript `6.0.3`。
本研究采用 live 三层证据，不修改计划文件，也不把计划中的目标版本写成当前环境。

### 当前公开类型形状

本地 `@types/react-dom@19.2.4` 把返回值建模为以 `pending` 为判别字段的联合类型：

```tsx
interface FormStatusNotPending {
  pending: false
  data: null
  method: null
  action: null
}

interface FormStatusPending {
  pending: true
  data: FormData
  method: string
  action: string | ((formData: FormData) => void | Promise<void>)
}

type FormStatus = FormStatusPending | FormStatusNotPending

function useFormStatus(): FormStatus
```

因此正文和 Demo 应先按 `status.pending` 缩窄，再读取 `data`；不得在空闲态无保护调用
`status.data.get(...)`：

```tsx
import { useFormStatus } from 'react-dom'

/** 显示当前后代所属父 form 的四字段提交状态。 */
function ScopedStatus() {
  const status = useFormStatus()

  if (!status.pending) {
    return <p>pending=false；data=null；method=null；action=null</p>
  }

  return (
    <p>
      pending=true；data.message={String(status.data.get('message') ?? '')}；
      method={status.method}；action={typeof status.action}
    </p>
  )
}
```

当前类型的 pending `method` 是宽 `string`，不能仅凭 TypeScript 宣称它永远只有两个字面量；
`'get' | 'post'` 来自 React Reference 的公共说明。当前类型的 pending `action` 不含 `null`，但固定
runtime Flow 类型为手工阻止提交后启动 Transition 的内部路径保留了 `null`；本课只用正常
`<form action={clientAction}>`，pending 时验证函数引用，避免跨路径夸大类型保证。

## 官方事实与课程推导

### 1. 返回对象描述一次父 form 提交

S1-S4 把 Hook 定义为“最近一次表单提交”的 status 信息，返回四个字段。它不是业务提交结果的容器：
Action 的 return value 不进入 `useFormStatus`，失败详情也不会自动成为第五个字段。正文必须始终以一个
`status` 对象讲解，不把四个字段拆成四份手写 State。

### 2. `pending` 只属于父 form 的活动提交

S1、S11 与 S15 共同证明：React 为 function Action 提交建立 pending status，后代在 Action Promise
未完成时读取 `true`，settle 后回到 `false`。本课用 deferred Promise 把等待点交给用户按钮控制；
不得用固定毫秒 timer 让 pending 碰巧可见，也不得用普通 `fetch` loading 变量冒充 Hook 输出。

### 3. `data` 是提交时的 `FormData`

S1、S7、S11 与 S15 证明 React 在提交事件中从目标 form 构造 `FormData`，既把它交给 function
Action，也放进 pending status。Demo 提交前固定输入“甲表单消息”或“乙表单消息”，pending 时用
`status.data.get('message')` 显示提交快照。提交后继续编辑字段不应被写成会改写既有 `status.data`；
本课只验收 pending 刚建立时的确定值，不扩展文件、同名字段或成功控件规则。

### 4. `method` 需要区分公开描述与当前 patch 观察

S1 公开描述 `method` 为父 form 的 `'get'` 或 `'post'`，并说明默认 form method 是 GET；S15 的
React DOM `19.2.8` 测试也让未声明 method 的 function Action 报告 `get`。另一方面，S5-S6 的
`<form>` 文档说明 function `action` / `formAction` 在 HTTP 语义上按 POST 处理。

这两个事实不能压成“function Action 所以 status.method 自动为 post”。S11 当前实现读取
`form.method`。正式 Demo 必须显式写 `method="post"` 并只验收 status 显示 `post`；正文用版本卡说明
默认值和 function Action POST caveat 属于不同观察层，不引入真实 HTTP 请求验证。

### 5. `action` 是父 form 的 Action 引用

S1-S2 说明 function action 时字段返回函数引用；S11 在 pending 对象中直接保存 action；S17 固定测试
确认函数原样通过。Demo 为甲、乙两个兄弟 form 提供不同且稳定的客户端 Action，pending 时分别验证
`status.action === expectedAction`；idle 时统一显示 `null`。URL action 的字符串/coercion 分支只作为
来源边界记录，不进入正文示例或浏览器流程。

### 6. 后代组件是读取边界

S1-S4 要求 Hook 所在组件被渲染在 `<form>` 内。正确树形为：

```text
SiblingFormsDemo
  |- OutsideStatus               -> 无父 form，永远读取空闲对象
  |- ScopedForm A                -> 同组件调用读不到自己返回的 form
  |    `- <form action={actionA}>
  |         `- DescendantStatus  -> 读取 A
  `- ScopedForm B                -> 同组件调用读不到自己返回的 form
       `- <form action={actionB}>
            `- DescendantStatus  -> 读取 B
```

甲 pending 时，甲后代变为 pending；乙后代、两个同组件对照和外部对照都保持 idle。乙轮次必须反向
重放。这里的“嵌套组件”是组件层级，不是嵌套 form DOM。

### 7. 同组件调用读不到自身 form

S3 给出官方反例：组件先调用 Hook，再 return `<form>`，`pending` 永远不会因为该 form 提交而变为
true。Hook 在该组件 render 时只能读取当时已有的父 provider，不能向下读取尚未返回的子元素。
正式 Demo 的 `ScopedForm` 可以同时显示这个 self probe 与真正的 `DescendantStatus`，但不得通过 props
手工把 child status 值回传给 self probe 伪造 Hook 行为。

### 8. 无父 form 返回完整空闲形状

S1-S4 公开保证无父 form 时 pending 为 false、data/action 为 null；S10 与当前类型补齐 method 也为
null。外部对照必须显示完整四字段空闲形状，而不是只写“未提交”。这证明 Hook 不是订阅页面上任意
form 的全局监听器。

### 9. 物理嵌套 form 不是最近父作用域实验

S13-S14 的实现注释以“forms cannot be nested”为 context 弹栈前提；S16 的官方测试也明确输出：
`<form>` 不能成为 `<form>` 的后代，并会导致 hydration error。该测试只是 React 对无效输入的容错
覆盖，不能转化成课程推荐。

因此“嵌套 form 边界”的教学结论是禁止：不建立外层/内层 form 来争夺最近 provider，不用 Portal 或
嵌套 Root 绕过 DOM 结构。兄弟 form 隔离加同组件/无父对照已经足以实证 public scope。

### 10. 客户端 function Action 足以实证全部合同

S5-S7 与 S11 证明已加载 JavaScript 的客户端函数能收到 `FormData` 并建立 form Transition；
`useFormStatus` 不要求 Server Function。Demo 的 Action 只读取字段、等待当前内存 gate 并正常返回，
不做网络、持久化或业务校验。Server Function 只是 `<form>` 的另一种可用 Action，本课明确排除。

## 与相邻课程的边界

- 第 12 课客户端 Form Action：已负责 `FormData` 参数、function `action`、成功 reset 与 rejection；
  本课只复用最小客户端 Action 保持 pending，不重讲 reset、submitter override 或 Error Boundary。
- 第 13 课 `useActionState`：已负责返回 State、previous result、dispatch 与队列 pending；本课没有结果
  State，也不把 `useFormStatus().pending` 写成 Action 队列长度。
- 第 14 课 `useOptimistic`：已负责 Action 期间的临时派生 UI；本课不创建 optimistic item，不把
  `data` 当确认或乐观 State。
- 第 16 课 `useSyncExternalStore`：负责 React 外部状态源订阅；本课的 form scope 由 React DOM
  提供，不建立自定义 store、Context 或订阅器。
- Server Function、RSC、SSR、无 JavaScript 提交、progressive enhancement 与真实业务 mutation
  不属于当前纯客户端 SPA 单知识点课程。

## 后续正文冻结合同

### 必须采用的章节顺序

后续学习者正文必须保持单一主线，并至少包含：

1. “四字段 status”：先展示 `useFormStatus()` 的导入、无参数调用和判别联合。
2. “由 form 内后代读取”：展示 `<form><ScopedStatus /></form>` 的正确组件树。
3. “pending 与 FormData”：用客户端 function Action 和本地 gate 显示提交值。
4. “method 与 action”：显式 `method="post"`，显示 `post` 和当前 Action 函数引用。
5. “作用域对照”：甲乙兄弟 form、同组件 self probe、无父 form outside probe。
6. `Pitfalls`：至少覆盖同组件读取、无父 form、把它当全局 pending、物理嵌套 form。
7. 一个唯一 Demo 和一个最小练习；不新增第二个 Server Action、网络提交或表单业务 Demo。
8. 官方来源只列学习者可依赖的 React Reference、`<form>` Reference 与 React 19 发布说明；不暴露
   内部源码行号、仓库路径、本地版本矩阵、Gate 或 signoff 过程。

### 正文必须明确的语句

- “`useFormStatus` 从 `react-dom` 导入，返回父 form 的 `pending/data/method/action`。”
- “调用 Hook 的组件必须位于目标 `<form>` 里面；在声明该 form 的同组件中调用读不到它。”
- “没有父 form 时返回空闲状态，不会订阅页面上其他 form。”
- “pending 时 `data` 是本次提交的 FormData，`action` 是父 form 的 function Action 引用。”
- “多个 form 的状态按父级作用域隔离；不要通过物理嵌套 form 测试最近父级。”
- “客户端 function Action 足以使用 Hook，不要求 Server Function 或真实网络。”

### 正文禁止的语句

- “`useFormStatus` 读取组件自己返回的 form”或“能读取任意子 form”。
- “它是页面全局提交状态”或“任意 fetch/onSubmit Promise 都会让 pending 为 true”。
- “`data` 是 Action 返回值”或“settle 后仍自动保存最后一份 FormData”。
- “function Action 一定让 `status.method` 自动显示 post”；Demo 必须显式设置 method。
- “嵌套 `<form>` 是验证最近父 form 的推荐方式”或“React 支持合法嵌套 form”。
- “必须使用 Server Function、Next.js、RSC 或后端 API 才能观察 `useFormStatus`”。

## 后续确定性同源 Demo 合同

### 唯一 Demo 与资产职责

- 唯一 Demo ID：
  `react.core.learn.advanced.use-form-status-parent-scope.parent-form-status-demo`。
- 课程 slug、目录与文件基名固定为 `use-form-status-parent-scope`；正文 ID、Demo ID、manifest 与 Track
  必须逐字符一致，不使用 `form-status-scope` 等近义别名。
- 主 TSX：两个兄弟 form、同组件/无父对照、共享后代 status、独立稳定 function Actions、当前内存
  deferred gate、手工 settle 与可访问状态账本。
- CSS：只定义本课布局与响应式样式，不使用 Grid、`gap` 或非零 `letter-spacing`。
- 若 deferred gate 单独拆成 TS 文件，运行 loader 与 `?raw` 源码 loader 必须同时包含它；单次逻辑能
  留在 TSX 时不新建共享抽象。

运行源码和源码面板按 demo manifest 固定顺序拼接所有真实资产。不得在源码面板展示简化版本，也不得
把 action、gate、同组件对照或 scope 判断藏在未登记文件中。

### 确定性状态机

Demo 同一时间只允许一个 active form attempt：

```text
idle
  -> submit A: A descendant pending；B/self/outside idle
pending A
  -> resolve A: 全部回到 idle
idle
  -> submit B: B descendant pending；A/self/outside idle
pending B
  -> resolve B: 全部回到 idle
idle
  -> rebuild: 冷重建所有 form、gate、输入和账本
```

开始一轮后禁用另一个 form 的 submit 按钮，避免扩展到并发双提交、Action 组合和竞态。结算按钮位于
不会被 pending form submit 禁用的命令区，直接 resolve 当前 deferred Promise；不提供 reject、重试、
取消或超时分支，因为错误处理已经属于第 12 课。

### 可观察反馈环

1. 冷启动时 outside、甲 self、乙 self、甲 descendant、乙 descendant 都显示
   `pending=false/data=null/method=null/action=null`，没有 active gate。
2. 在甲输入固定文本“甲表单消息”并提交：甲 descendant 显示 `pending=true`、
   `data.message=甲表单消息`、`method=post`、`action=甲 action`；乙 descendant 与所有对照仍为空闲。
3. 点击“完成当前 Action”后，甲 descendant 回到完整空闲形状，active gate 清空；不把字段自动 reset
   作为本课验收点。
4. 在乙输入“乙表单消息”并提交，镜像验证只有乙 descendant pending，action 必须是乙的函数引用，
   甲 descendant 与所有对照保持空闲。
5. 两轮都记录最近提交 form、提交快照、method、action 匹配与 settle 结果；账本由应用 State 生成，
   不伪装成 Hook 第五个返回字段。
6. 点击“重建实验”后，所有 gate、输入、账本和 status 对照恢复冷态；离页再返回也必须冷重建。

### 作用域与 DOM 验收

- DOM 中恰有两个兄弟 `<form>`，不存在 `form form` 后代关系；静态检查和浏览器 DOM 都必须确认。
- 每个 form 都有一个真正后代 `DescendantStatus`，同一个组件实现按所在父 form 自动读取不同状态。
- `ScopedForm` 自身调用 Hook 的 self probe 不得通过 props/context/store 接收后代 status；提交自己的
  form 时它必须保持完整空闲形状。
- `OutsideStatus` 位于两个 form 外，不得被任一提交激活。
- 甲 pending 时乙的 function Action 不被调用，乙 pending 时甲不被调用；每轮 Action 调用数恰为一。

### FormData、method 与 action 验收

- 两个 form 都显式写 `method="post"`，各有唯一 `name="message"` 文本控件；不使用文件、多值字段、
  submitter override 或 `formAction`。
- 客户端 Action 的参数显式标注 `FormData`，只读取 `String(formData.get('message') ?? '')` 并等待 gate。
- pending status 必须从 `status.data` 读取同一提交文本，不允许从输入 State 或 Action 账本复制该值冒充。
- action 函数引用在一轮 pending 期间保持稳定；status 区使用引用相等判断甲/乙 Action，不输出
  `Function#toString()`、函数源码、内部 ID 或不可控函数名。
- idle 分支只在 `!status.pending` 后读取 null 字段；pending 分支才调用 `status.data.get()`。

### 确定性限制

- 不使用 `fetch`、XHR、WebSocket、外部 URL、Server Function、第三方表单/状态包、随机数、`Date`、
  `performance`、`setTimeout` 或 `setInterval`。
- 不使用 localStorage、IndexedDB、Cache API、Service Worker、模块级持久数据或后台任务。
- 不引入 `useActionState`、`useOptimistic`、手工 `useTransition`、Suspense、Router、缓存库或请求库。
- 不物理嵌套 form，不使用 Portal 或嵌套 React Root，不制造 hydration warning 作为正式演示。
- 不把固定 render 次数、内部 context 对象、Fiber、lane 或提交时点写成验收数字。

## 易错点账本

### 在声明 form 的同组件读取

- **错误：** `const status = useFormStatus(); return <form action={action}>...</form>`，期待 Hook 读取该 form。
- **后果：** 该 form 是 Hook 调用点随后返回的子元素，不是父 form，pending 不会按预期变为 true。
- **正确做法：** 把 status UI 拆成 `<form><ScopedStatus /></form>`，在后代组件内调用 Hook。

### 把无父 form 当全局监听器

- **错误：** 在页面顶部调用 Hook，期待任意 form 提交都会更新它。
- **后果：** 没有父 form 时只得到空闲对象，页面其他 form 的提交不会注入该作用域。
- **正确做法：** 把复用 status 组件放到每个目标 form 内；用兄弟 form 验证隔离。

### 用嵌套 form 证明“最近父级”

- **错误：** 把内层 `<form>` 写进外层 `<form>`，提交后比较两个 status。
- **后果：** 结构本身是无效 HTML，React 开发环境会发出 hydration warning，结果不能作为合法 API
  合同。
- **正确做法：** 保持 form 为兄弟节点，用各自后代 status 和外部/self 对照证明 scope。

### 混淆 `data` 与 Action 结果

- **错误：** 把 `status.data` 解释为服务器响应、Action return value 或已经确认的业务对象。
- **后果：** 隐藏了它只是本次提交的 `FormData`，并与 `useActionState` 结果 State 混淆。
- **正确做法：** 只在 pending 分支读取提交字段；结果、错误和持久化明确排除。

### 把 method 写成 function Action 推导值

- **错误：** 因 `<form>` 文档说 function action 按 POST 处理，就声称未声明 method 时
  `status.method` 必然为 `post`。
- **后果：** 与 `v19.2.8` 官方测试及当前实现读取 `form.method` 的证据冲突。
- **正确做法：** Demo 显式 `method="post"`；正文分别陈述 status 字段与 function Action 的协议 caveat。

### 把 action 当字符串标签

- **错误：** 依赖函数名或 `toString()` 判断当前 Action。
- **后果：** 构建压缩、闭包或重渲染会让显示不稳定，也掩盖 API 返回的是引用。
- **正确做法：** 使用稳定函数并做引用相等比较，再映射为固定中文标签。

## 实施与验证 Gate

### 临时语义与类型 Gate

1. 所有临时验证资产放入 `mktemp -d` 创建的 `/tmp` 目录，完成后删除；仓库不保留测试、fixture、日志
   或浏览器自动化产物。
2. 临时 TypeScript fixture 固定 `useFormStatus(): FormStatus`、`pending` 判别缩窄、idle 四个 null、
   pending `FormData`/method/action 与客户端 Action 的 `(formData: FormData) => Promise<void>` 签名；使用
   当前 `tsconfig.react.json` 和已安装类型包。
3. AST 或精确结构检查确认 Hook 从 `react-dom` 导入、没有参数、只在组件顶层调用；DOM 恰有两个兄弟
   form，所有真实 status 读取点都是目标 form 的后代。
4. 检查两个 form 显式 `method="post"`，Action 只读 `message` 并等待内存 gate；不使用网络、timer、
   随机数、持久化、Server Function、嵌套 form、手工 status State 或后续课程 API。
5. 新增前端函数与组件定义上方具有规范、简洁的中文职责注释；CSS 不使用 Grid、`gap` 或非零
   `letter-spacing`；正文只包含本课主线、排除项、易错点、练习和唯一 Demo ID。
6. 实施后运行 `npm run type-check`、`npm run lint`、`npm run format:check`、空 unit/e2e、
   `npm run build` 与当前课程 scoped `git diff --check`；研究稿本身不冒充这些实现 Gate 已通过。

### Production Gate

1. 使用 fresh production build 与本课独立 preview 验证，不把 development-only warning、Strict Mode
   render 次数或 HMR 状态写成合同。
2. Network 中不应有课程业务 fetch/XHR/WebSocket；所有等待只来自当前内存 deferred gate。
3. production 必须覆盖冷启动、甲 pending/settle、乙 pending/settle、重建与离页重进；不能只因 build
   成功就声称父 form scope 已按合同工作。
4. DOM 检查确认两个 form 互为兄弟且没有 form 后代；console 不允许出现 nested form 或 hydration
   warning。

### Browser Gate

1. 桌面 `1440x900`、移动 `390x844`、`390x844 + 32px` 根字号三种视口都完成同一反馈环。
2. 甲 pending 时只允许甲 descendant 显示四字段 pending 值；乙、self、outside 全部保持完整 idle；
   settle 后全部 idle。乙轮次镜像通过。
3. action 等待期间“完成当前 Action”、未提交 form 的普通控件和“重建实验”按状态机可键盘操作；状态
   变化通过文本和可访问 live region 表达，不依赖颜色、透明度或动画单独传达。
4. console 为 `0 error / 0 warning`；不得通过正式 Demo 故意触发同组件错误用法或嵌套 form warning。
5. 三种视口页面与 Demo 横向溢出均为 `0`，长 FormData 文本、四字段账本、按钮与源码面板无裁切、
   遮挡、重叠或不合理布局跳动。
6. 离页再返回时两个 form、输入、gate、status、调用计数和账本全部冷重建；不存在旧 Promise、模块缓存
   或持久化状态造成的假性成功。

### 同源与正文 Gate

1. demo manifest 的运行 loader 与 `?raw` 源码 loader 覆盖完全相同的 TSX、可选 gate TS 和 CSS；
   浏览器源码面板与磁盘按相同顺序、分隔符和 `trimEnd()` 规则得到一致字符数、UTF-8 字节数与
   SHA-256。
2. 学习者正文具备 frontmatter、单一主线、固定章节、pitfalls、exercise、唯一 Demo ID 与官方
   sources；代码片段与真实 Demo 对后代、self、outside、兄弟 scope 和四字段的语义一致。
3. 学习者正文不得出现本地包版本、仓库路径、临时命令、哈希、Gate、浏览器数据、复审过程或发布
   状态；这些只保留在研究、计划与 signoff 证据中。
4. 正文不扩展 Server Function、RSC、SSR、网络、缓存、持久化、事务、重试、竞态、表单库、
   `useActionState`、`useOptimistic` 或第 16 课。

### 发布与独立复审 Gate

1. 后续实施先保持第 15 课为 `planned`；正文、Demo、临时验证、production/browser Admission、同源
   核对和一次 combined Standards/Spec 复审全部通过后，才允许登记 entry/demo manifest 并把 Track
   原子切为 `available`。
2. 独立复审必须核对四字段、判别类型、后代要求、同组件/无父边界、兄弟 scope、nested form 禁止、
   method caveat、客户端 Action 与全部排除项；复杂修正必须重新冻结证据并复审。
3. 登记后重跑 type-check、lint、format、空 unit/e2e、fresh build、三视口正式深链回归和 scoped
   `git diff --check`，再写第 15 课 signoff。
4. 第 15 课全部闭环后，live 状态应为 `15/24 available`、`9 planned`，下一课是
   `react.core.learn.advanced.use-sync-external-store-snapshot`；completion 不自动授权开始第 16 课研究。

## 结论

第 15 课可以在纯客户端 React DOM `19.2.8` SPA 中直接实证：两个兄弟 form 各自的后代组件只读取
自己的 `pending/data/method/action`；同组件和无父 form 对照始终为空闲；function Action 通过本地
deferred gate 暴露 pending 与 FormData，无需 Server Function、真实网络或提交业务。物理嵌套 form
是无效 HTML并会产生 React hydration warning，必须作为禁止边界，而不是 Demo 技巧。

本稿只完成官方研究与后续验收冻结。第 15 课仍为 `planned`，正文、Demo、登记、浏览器验收、独立复审
与 signoff 均未开始；在新的实施授权前必须硬停止于本文件。
