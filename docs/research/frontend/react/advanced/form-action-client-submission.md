# A12 表单 Action 与提交状态官方调研

## 研究结论

- 课程 ID：`react.core.learn.advanced.form-action-client-submission`
- 课程标题：表单 Action 与提交状态
- 权威路线位置：React Core A12
- 路线动作：合并旧“客户端 Form Action”与“`useFormStatus` 表单作用域”
- 核验日期：`2026-08-18`
- 文档基线：React 官方文档 `19.2`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：`@types/react` `19.2.18`、`@types/react-dom` `19.2.4`
- 固定文档提交：`reactjs/react.dev@c7d6b700038c63d1aaf2c649af1aefe01ebbacac`
- 固定运行时提交：`facebook/react@1dd4ecbdabf826f527fc9a58c05ea70375b7d170`

A12 应以“一次 form Action 提交”为共同主线，同时回答两个问题：React 怎样把本次提交的
`FormData` 交给 function Action，并在 Action 完成后处理成功 reset 或错误；form 内的后代又怎样用
`useFormStatus()` 读取这次提交的 `pending`、`data`、`method` 和 `action`。

两部分共享同一个提交生命周期，但教学验证必须保留两条正交反馈环：

1. Action 反馈环验证参数、submitter、pending 前后、成功 reset、受控字段和 rejected 错误边界。
2. form status 反馈环验证四字段判别联合、父 form 后代、同组件、表单外和兄弟 form 作用域。

不应把两条反馈环强行塞进一个巨型 Demo。当前仓库已经把两个现有 Demo 都登记到 A12 下，这种复用既
覆盖合并范围，也能让每条状态机保持可解释和可重复。

## 范围与迁移缺口

### 当前权威范围

`docs/frontend/plans/react/React课程调整总计划.md` 明确把 A12 定义为“表单 Action 与提交状态”，核心
范围是 function Action、FormData、成功重置和 pending 作用域，并把旧
`react.core.learn.advanced.use-form-status-parent-scope` 合并到当前课程 ID。

因此 A12 必须覆盖：

1. `<form action={fn}>` 与 submitter `formAction={fn}` 的客户端函数入口。
2. Action 的 `FormData` 参数、successful controls、重复 key 和 submitter 数据。
3. 同步正常返回、Promise fulfilled、throw/reject、成功 reset 和受控字段边界。
4. `useFormStatus()` 的 `pending/data/method/action` 四字段判别联合。
5. 父 form 后代、同组件、表单外、兄弟 form 和非法嵌套 form 的作用域边界。
6. 可见 pending 文案、原生禁用提交按钮和稳定 live region 的可访问反馈。

### 现有资产核对

当前 live 资产已经完成课程合并：

- 学习者正文 `form-action-client-submission.md` 使用 A12 目标 ID，并同时讲解 Action 与
  `useFormStatus`。
- entry manifest 与 Track 只发布 A12 目标 ID。
- demo manifest 已在 A12 下登记 `client-action-demo` 与 `parent-form-status-demo`。
- progress migration 把旧 Form Action ID 与旧 `useFormStatus` ID 的历史完成记录合并到 A12。
- 旧独立 `useFormStatus` 正文、研究稿和 Demo 仍可作为迁移来源；是否清理不属于本次调研授权。

本研究文件原草稿仍沿用旧 RC3 拆课口径，明确把 `useFormStatus` 排除并推迟到后续课程，同时记录了
已经过期的 planned 状态。另一个只读核对发现是：当前合并正文建议 function Action form 显式设置
`method="post"`，对应 status Demo 也采用了该写法；React DOM `19.2.8` 会为 function `action` 同时
声明 method 发出 development warning，并说明 method 将被覆盖。它们是后续实现批次需要修正的 live
缺口，不在本次单文件授权内。本次只修正这一份研究记录，不改正文、Demo、manifest、Track、进度
迁移、路线计划或旧资产。

### 明确排除

本课不展开 `useActionState`、`useOptimistic`、Server Function、`'use server'`、RSC、SSR、无
JavaScript 提交、Progressive Enhancement、真实网络、后端协议、文件上传、表单库或校验库。

这些能力只能在范围边界中用于说明职责差异：

- `useActionState` 消费 Action 返回结果并形成结果 State，不属于 bare form Action 的返回合同。
- `useOptimistic` 建模 Action 期间的临时预测 UI，不属于 form status 四字段。
- Server Function 可以拥有服务端执行与渐进增强语义，不能由纯客户端闭包 Demo 证明。
- 网络、持久化、事务、幂等、重试和业务校验属于应用或数据层，不是 React DOM form Action 的公共
  保证。

## 调研方法与证据等级

1. 按仓库搜索顺位使用 Tavily 定位 React、WHATWG 与 W3C 一手来源；搜索摘要只负责发现 URL，不
   承担事实证明。
2. 公共 API 结论优先采用 React `19.2` Reference 与 React 19 stable 发布说明。
3. 为避免官网滚动更新改变语义，关键文档同时固定到 `reactjs/react.dev` 提交
   `c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。
4. 对 submitter、空闲状态、method 差异、错误和嵌套 form 等高风险边界，使用
   `facebook/react` 固定运行时提交的源码与官方测试旁证。
5. FormData 成功控件、重复 key 与 form 内容模型使用 WHATWG Living Standard；状态消息使用 WCAG
   与 WAI-ARIA 规范。
6. 固定源码只解释当前 patch，不把 Fiber、lane、context cursor、内部 flag 或固定 render 次数写成
   学习者可依赖的 API。

## 官方来源卡

| 编号 | 一手来源 | 固定范围 | 本课采用的事实 |
| --- | --- | --- | --- |
| S1 | [React `<form>` Reference](https://react.dev/reference/react-dom/components/form) | React `19.2` | function Action、FormData、Transition、成功重置、错误传播、`formAction` 和 POST caveat。 |
| S2 | [固定 `<form>` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/form.md) | 文档提交 `c7d6b700...` | 固定 S1 的公共合同。 |
| S3 | [React `useFormStatus` Reference](https://react.dev/reference/react-dom/hooks/useFormStatus) | React DOM `19.2` | 四字段、父 form 后代、同组件陷阱、无父 form 与提交数据。 |
| S4 | [固定 `useFormStatus` 文档](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/hooks/useFormStatus.md) | 文档提交 `c7d6b700...` | 固定 S3 的返回值、caveats 与 troubleshooting。 |
| S5 | [React `<input>` Reference](https://react.dev/reference/react-dom/components/input) | React `19.2` | `name`、受控/未受控字段、`defaultValue`、`defaultChecked` 和 input `formAction`。 |
| S6 | [React 19 发布说明](https://react.dev/blog/2024/12/05/react-19#react-dom-actions) | React `19` stable | React DOM Actions、`useFormStatus` 与成功后重置未受控字段。 |
| S7 | [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm 类型包 `19.2.18` | `action` / `formAction` 的函数形状是 `(FormData) => void \| Promise<void>`。 |
| S8 | [`@types/react-dom@19.2.4`](https://unpkg.com/@types/react-dom@19.2.4/index.d.ts) | npm 类型包 `19.2.4` | `FormStatus` 判别联合与 `useFormStatus(): FormStatus`。 |
| S9 | [`FormActionEventPlugin.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/events/plugins/FormActionEventPlugin.js#L48-L175) | React DOM `19.2.8` | submitter 选择、FormData 构造、pending 对象、阻止导航与 host Transition。 |
| S10 | [`ReactDOMFormActions.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/shared/ReactDOMFormActions.js#L15-L64) | React DOM `19.2.8` | 空闲对象为 `false/null/null/null`，Hook 读取 host transition status。 |
| S11 | [四字段官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L884-L932) | React DOM `19.2.8` | pending 时的 data、method、action 与 settle 后空闲状态。 |
| S12 | [嵌套 form 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L364-L400) | React DOM `19.2.8` | `<form>` 不得成为 `<form>` 后代，警告可能造成 hydration error。 |
| S13 | [action 引用官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L2215-L2283) | React DOM `19.2.8` | 正常 function Action 保留函数引用；同范围还覆盖手工 Transition 的字符串 action 边缘路径。 |
| S14 | [submitter 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L488-L604) | React DOM `19.2.8` | 普通 submitter 值进入 FormData；function `formAction` submitter 的自定义 name 被排除并警告。 |
| S15 | [成功 reset 官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L1510-L1586) | React DOM `19.2.8` | async Action 完成前不 reset，完成后按最新默认值重置未受控字段。 |
| S16 | [HTML 构造 entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set) | WHATWG Living Standard | successful controls、`name`、disabled、checkbox/radio 与 submitter 的提交规则。 |
| S17 | [FormData `get()` / `getAll()`](https://xhr.spec.whatwg.org/#dom-formdata-get) | WHATWG XHR Living Standard | `get()` 返回首个同名值，`getAll()` 返回全部同名值。 |
| S18 | [HTML `<form>` 内容模型](https://html.spec.whatwg.org/multipage/forms.html#the-form-element) | WHATWG Living Standard | form 的后代中不得再有 form。 |
| S19 | [WCAG 2.2 状态消息说明](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | WCAG `2.2` | 动态状态应在不移动焦点时仍能被辅助技术识别。 |
| S20 | [ARIA22 技术](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) | WCAG `2.2` | `role="status"` 是传达状态消息的推荐技术。 |
| S21 | [WAI-ARIA `status` role](https://www.w3.org/TR/wai-aria-1.2/#status) | WAI-ARIA `1.2` | status 隐含 `aria-live="polite"` 与 `aria-atomic="true"`。 |
| S22 | [function action 属性校验](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L117-L151) | React DOM `19.2.8` | function `action` 与 method/encType/target 同时出现时的 development warning 与覆盖规则。 |
| S23 | [Action 错误边界官方测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMForm-test.js#L798-L882) | React DOM `19.2.8` | 同步 throw 与 async reject 都由最近 Error Boundary 接管。 |

## 版本与公开类型基线

React 官网 Reference 按 `19.2` minor 维护，没有单独的 `19.2.8` 文档站。本课把 S1-S6 视为公共
合同，把 S9-S15 与 S22-S23 视为当前 patch 的回归证据；未来升级 React minor 或 patch 时，应重新
核对 method、错误 reset 和 submitter warning 等实现敏感边界。

### function Action 类型

当前 React 类型允许 form、button 和 input 的 `action` / `formAction` 接收下列函数：

```ts
type ClientFormAction = (formData: FormData) => void | Promise<void>
```

因此 TypeScript 课程示例不应从 bare Action 返回业务对象。若 JavaScript 或类型逃逸让函数返回对象，
React form 本身也没有读取该对象的 UI 消费者；同步正常返回或 Promise fulfilled 仍表示 Action 成功
完成。需要把结果送入 UI 时，应另用明确的结果 State 模型，而不是扩宽 A12 的函数类型。

### `useFormStatus` 类型

当前 `@types/react-dom` 把状态建模为 `pending` 判别联合：

```ts
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

declare function useFormStatus(): FormStatus
```

课程代码应先用 `status.pending` 缩窄，再读取 `status.data`。Reference 对 method 的公开描述是 `'get'`
或 `'post'`，但当前类型仍是宽 `string`；不要用类型形状替代运行时或文档证据。

## 一、function Action 是声明式提交入口

### 官方事实

- `<form action={fn}>` 的函数接收一次提交的 `FormData`，可以同步或异步完成。
- React 接管 function Action 的默认提交，把调用放入 Transition，不要求应用调用
  `preventDefault()` 或手工 `startTransition()`。
- submitter 的 function `formAction` 可以覆盖父 form 的 Action。
- Action 正常完成后，React 重置该 form 的未受控字段；throw/reject 交给最近的 Error Boundary。

依据：S1、S2、S6、S7、S9。

### 课程推导

A12 应从下列最小心智模型开始：

```text
用户提交 form
  -> 浏览器确定 submitter 并构造提交条目
  -> React 建立 form Transition 与 pending status
  -> Action(FormData)
  -> fulfilled: 提交成功状态并 reset 未受控字段
  -> rejected: 抛给最近 Error Boundary，不把它写成成功 reset
```

Action 的参数不是 submit event，`useFormStatus` 也不是 `onSubmit` Promise 的监听器。课程可以比较两种
接口，但不能把它们混成同一条实现路径。

### 边界

- 该客户端函数只能在 JavaScript 已加载并运行时执行；不能证明无 JavaScript 提交。
- React 的 Transition 集成不等于自动提供业务结果、网络协议、重试或持久化。
- A12 不展开 Action 内 `await` 之后普通 State 更新的通用 Transition 规则；该规则属于 Transition
  课程，避免形成第二主线。

## 二、FormData 是一次提交的条目快照

### 官方事实

HTML 在提交时构造 entry list。常见排除条件包括：控件没有 `name`、`name` 为空、控件在提交时为
disabled、checkbox/radio 未选中。普通 submitter 只有在它实际触发提交且有 `name/value` 时才贡献
对应条目。

同一 key 可以出现多次。`FormData#get(name)` 返回第一个同名值或 `null`，`getAll(name)` 返回全部
同名值。字段值可能是字符串或 `File`。

依据：S1、S5、S16、S17。

### 课程推导

示例必须把 `name` 当作提交合同，而不是用 `id`、label 或 placeholder 猜 key；文本字段读取后还要
缩窄为字符串。单值字段可以用 `get()`，多个同名 checkbox 等集合字段必须用 `getAll()`。

```ts
const title = formData.get('title')
const topics = formData.getAll('topic')

if (typeof title !== 'string') return
```

Demo 的快照应在 Action 收到 FormData 时记录，不能在成功 reset 后再读取当前 DOM 并冒充提交内容。

### 边界

- A12 只教学 FormData 读取规则，不建立通用 schema parser。
- 文件值、multipart 编码和上传生命周期明确排除。
- 原生约束校验、业务校验与错误消息协议不由 FormData 自动提供。

## 三、submitter 与 `formAction` 表达两种意图

### 官方事实

普通 submitter 的 `name/value` 会进入父 `<form action={fn}>` 收到的 FormData，因此多个普通按钮可以
共用一个父 Action，并通过 `intent` 等字段分支。

当 submitter 自身使用 function `formAction` 时，它覆盖父 Action。React DOM `19.2.8` 的固定实现与
测试表明：React 要管理该 submitter 的 Action 身份，自定义 `name` 不作为业务条目进入 FormData，
development 还会发出 name 被覆盖的警告。

依据：S1、S5、S9、S14。

### 课程推导

课程应清楚区分两种设计：

```tsx
{/* 一个父 Action，通过普通 submitter 数据分支 */}
<button type="submit" name="intent" value="publish">
  发布
</button>

{/* 独立 Action，通过函数身份分支 */}
<button type="submit" formAction={saveDraft}>
  保存草稿
</button>
```

第一种设计让父 Action 读取 `intent=publish`；第二种设计让 `saveDraft` 函数本身表达意图，不再依赖该
按钮的自定义 `name/value`。

### 边界

- 不把 `formAction` 误写成只改变 URL 的字符串属性；本节只讨论 function `formAction`。
- 不给 function `formAction` submitter 同时配置业务 `name/value`、`formMethod`、`formEncType` 或
  `formTarget`。
- input submitter 与 button submitter 都支持相关能力，但 Demo 只需选择一种清楚的控件。

## 四、成功、失败与 reset 必须分层

### 官方事实

React 公开合同是：Action 成功完成后重置 form 的未受控字段。固定测试进一步证明 async Action 的
Promise 未完成时不会提前 reset，完成后按控件默认值执行 reset。

受控字段由 React State 决定；原生 form reset 不能替应用改写 State。throw 或 Promise reject 走错误
路径并交给 Error Boundary，不能算作正常成功完成。

依据：S1、S2、S5、S6、S15、S23。

### 课程推导

“成功后清空表单”不是准确表述。正确说法是“成功后把该 form 的未受控字段恢复到默认值”：

- `defaultValue="草稿"` 的 input 回到“草稿”，不一定变为空字符串。
- `defaultChecked` 的 checkbox 回到默认选中状态。
- `value={state}` 的受控 input 继续显示 State 决定的值，除非应用显式更新 State。

失败反馈环还必须区分原 form 的自动 reset 与 Error Boundary 恢复后新 form 的初始值。新节点为空不
能反证旧节点执行过 reset。失败路径只能断言它不满足“成功后自动 reset”的前提；Error Boundary
可能替换或卸载原 form，因此不能额外保证失败后原 DOM 字段仍然可见或一定保留。

### 边界

- 不在 pending 开始时手工 `form.reset()`，否则失败路径也会丢失输入。
- 不把 Promise fulfilled 的业务错误对象当 rejection；对 bare Action 而言它仍是正常完成。
- 不承诺 reset 发生在固定毫秒数或某个同步调用栈位置，只观察 Promise settle 前后。

## 五、`useFormStatus` 返回四字段判别联合

### 官方事实

`useFormStatus` 从 `react-dom` 导入，不接收参数。空闲状态为：

```text
pending=false / data=null / method=null / action=null
```

父 form 的 function Action pending 时为：

```text
pending=true / data=本次 FormData / method=提交 method / action=当前 Action
```

Action settle 后重新回到空闲状态。`data` 是提交输入，不是 Action 返回值；`action` 在客户端
function Action 路径上保留函数引用。

依据：S3、S4、S8、S10、S11、S13。

### 课程推导

状态 UI 应只从一个 `status` 对象派生，而不是手写四份可能失同步的 State：

```tsx
import { useFormStatus } from 'react-dom'

/** 显示最近父 form 的提交状态。 */
function SubmitStatus() {
  const status = useFormStatus()

  if (!status.pending) {
    return <p role="status">等待提交</p>
  }

  return <p role="status">正在提交：{String(status.data.get('title') ?? '')}</p>
}
```

`pending` 适合禁用当前 submitter 和切换提交文案；`data` 适合显示本次提交摘要；`action` 可通过引用
相等映射为稳定标签。四字段都不是提交结果历史或页面级请求状态。

### 边界

- `useFormStatus` 不返回 error、result、dispatch、optimistic value 或队列长度。
- 普通 fetch、Effect、`onSubmit` Promise 或任意 Transition 不会自动成为这个 form status。
- settle 后 `data` 与 `action` 回到 `null`，需要历史记录时必须由应用另行建模。
- Reference 把普通 URI action/no action 的字段描述为 `null`；当前类型和手工
  `preventDefault + startTransition` 边缘路径还有 string/null 差异。A12 只教学正常 function Action，
  不把该内部边缘路径扩成正文主线。

## 六、作用域由 Hook 调用点的父 form 决定

### 官方事实

Hook 必须在目标 `<form>` 的后代组件中调用。在声明 form 的同一个组件里先调用 Hook，再 return 该
form，调用点读不到随后创建的子 form；若调用点本身没有父 form，它保持空闲。

表单外的 Hook 不是全局监听器。两个兄弟 form 各自提供独立状态，提交甲 form 不会让乙 form 的后代
进入 pending。

依据：S3、S4、S10、S11。

### 课程推导

推荐组件树是：

```text
Page
  |- OutsideStatus                    -> 无父 form，idle
  |- Form A component self probe      -> 读不到自身返回的 form
  |    `- <form action={actionA}>
  |         `- DescendantStatus       -> 读取 A
  `- Form B component self probe      -> 读不到自身返回的 form
       `- <form action={actionB}>
            `- DescendantStatus       -> 读取 B
```

同一个 `DescendantStatus` 组件可以放进两张 form，并自动读取各自作用域，不需要 `formId`、Context、
全局 store 或 pending props。

### 边界

- “父 form”是组件当前渲染位置的祖先，不是源码文件关系，也不是 DOM `form` 属性指向的任意节点。
- 如果同组件调用点已经位于另一张外层 form 下，它读取的是外层父作用域，仍不会向下读取自己返回的
  form。
- 作用域实验必须使用合法的兄弟 form，不能用物理嵌套 form。

## 七、物理嵌套 form 是无效输入

### 官方事实

HTML `<form>` 的内容模型禁止后代再出现 `<form>`。React DOM `19.2.8` 的官方测试会为
`<form><form>...</form></form>` 发出警告，并明确指出这可能造成 hydration error。

依据：S12、S18。

### 课程推导

课程中的“最近父 form”不能通过外层/内层 form 竞争来演示。兄弟 form、各自后代 status、同组件
probe 和表单外 probe 已足够证明作用域隔离，同时能保持 DOM 合法和 console 干净。

### 边界

- 不用 Portal、嵌套 React Root 或浏览器纠正后的 DOM 绕过规则。
- React 有容错测试不等于结构受支持；warning 本身也不是正式 Demo 的预期输出。
- SSR/hydration 不进入 A12 实现，只在解释警告严重性时提及。

## 八、`method` 必须区分 DOM 观察与 POST caveat

### 官方事实

`<form>` Reference 说明：当 `action` 或 `formAction` 是函数时，提交在协议语义上按 POST 处理。
`useFormStatus` Reference 同时把 `method` 描述为父 form 使用的 `'get'` 或 `'post'`。

React DOM `19.2.8` 的固定四字段测试中，未显式声明 `method` 的 function Action 在 pending 时仍报告
DOM 默认值 `get`。当前实现读取 form 元素的 method，这与“function Action 按 POST 处理”的 caveat
属于两个观察层。固定属性校验还明确警告：function `action` 不能同时指定 method 或 encType，React
会自动提供并覆盖它们。

依据：S1、S2、S3、S4、S9、S11、S22。

### 课程推导

Demo 应省略 method，忠实显示当前 `19.2.8` status 测试观察到的 `get`，同时在版本卡中解释它只是
DOM form method 观测值：

```tsx
<form action={saveMessage}>
  <SubmitStatus />
</form>
```

正文必须保留版本卡：不得把 `get` 解释成客户端函数发起 GET，也不得把 function Action 的 POST caveat
改写成 `status.method` 自动为 post。

### 边界

- 纯客户端 Action Demo 没有真实业务网络请求，不能把 `status.method` 当作抓包证据。
- function Action form 不声明 `method`、`encType` 或 `target`；function `formAction` submitter 不声明
  `formMethod`、`formEncType` 或 `formTarget`。
- 若未来 React 版本统一这两个观察层，应重新核验文档、类型、实现和官方测试后再更新课程。

## 九、pending 反馈必须可见且可被辅助技术感知

### 官方事实

WCAG 状态消息要求动态状态在不移动焦点时仍能被辅助技术识别。`role="status"` 是对应技术，WAI-ARIA
为它定义了隐含的 `aria-live="polite"` 与 `aria-atomic="true"`。

依据：S19、S20、S21。

### 课程推导

提交控件应使用原生 `disabled={pending}` 防止重复触发，同时把“提交”“提交中”“已完成”等变化写成
可见文案。动态区域应稳定存在，例如：

```tsx
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <>
      <button type="submit" disabled={pending}>
        {pending ? '提交中' : '提交'}
      </button>
      <p role="status" aria-atomic="true">
        {pending ? '表单正在提交' : '可以提交'}
      </p>
    </>
  )
}
```

状态不能只靠颜色、透明度、动画或按钮 disabled 外观传达。

### 边界

- `role="status"` 适合非紧急进度；系统异常仍由 Error Boundary fallback 或适当错误语义表达。
- 不在每次文字变化时强制移动焦点，也不把整个 form 包成 live region。
- pending 期间是否允许页面其他普通交互由业务决定；A12 Demo 应保留一个普通计数控件证明 Action
  Promise 不会冻结整个界面。

## 确定性 Demo 合同

### Demo A：Action、FormData、reset 与错误边界

- ID：`react.core.learn.advanced.form-action-client-submission.client-action-demo`
- 职责：验证父 Action、function `formAction`、提交快照、pending、成功 reset、受控字段与 reject。
- 等待机制：仅使用由外部按钮 resolve/reject 的内存 deferred Promise，不使用 timer 或网络。
- 可访问反馈：pending/成功/失败均有可见文字；提交按钮按 pending 禁用；账本使用稳定状态区域。

状态机：

```text
idle
  -> 普通 publish submitter
pending(parent action, intent=publish)
  -> resolve
success(reset + 1, 未受控字段回默认值, 受控 State 保持)

idle
  -> function formAction submitter
pending(override action, intent=null)
  -> resolve
success(reset + 1)

idle
  -> 任一 Action
pending
  -> reject
Error Boundary fallback(reset 不增加)
  -> recover
new form instance(不能冒充旧 form reset)
```

确定性验收：

1. 普通 publish 路径只调用父 Action，FormData 包含 `intent=publish`。
2. 覆盖路径只调用按钮 `formAction`，submitter 不声明业务 `name/value`，快照 `intent=null`。
3. pending 时未受控 textarea 保持脏值，reset 计数不增加，普通计数仍可更新。
4. resolve 后 reset 计数只增加一次，未受控字段恢复默认值，受控备注仍由 State 决定。
5. reject 后最近 Error Boundary 显示 fallback，reset 计数不增加。
6. 恢复按钮创建新 form；边界外累计账本用于区分 remount 与自动 reset。

### Demo B：`useFormStatus` 四字段与父 form 作用域

- ID：`react.core.learn.advanced.form-action-client-submission.parent-form-status-demo`
- 职责：验证完整四字段、后代读取、同组件、表单外与兄弟 form 隔离。
- 结构：甲乙两张合法兄弟 form 都不声明 method，共享一个后代 status 组件；当前版本显示 DOM 默认
  `get`，不把它解释成真实 GET 请求。
- 等待机制：同一时间只允许一个 active Action，使用手工 resolve 的内存 deferred Promise。

状态机：

```text
all idle(false/null/null/null)
  -> submit A
A descendant pending(data A/get/action A)
B descendant + A/B self + outside remain idle
  -> resolve A
all idle
  -> submit B
B descendant pending(data B/get/action B)
A descendant + A/B self + outside remain idle
  -> resolve B
all idle
  -> rebuild
cold state
```

确定性验收：

1. 冷启动时 outside、甲 self、乙 self、甲 descendant、乙 descendant 都显示完整空闲四字段。
2. 甲 pending 时只有甲 descendant 读取 `pending=true`、甲 FormData、当前 patch 的 `get` 和甲 Action
   引用。
3. 乙 pending 时结果镜像；兄弟 form 的 Action 调用数和状态都互不串联。
4. `status.data` 必须直接提供提交摘要，不能从输入 State 或外部账本复制后冒充。
5. 同组件 self probe 与 outside probe 不从 props、Context 或 store 接收后代状态。
6. DOM 中没有 `form form`，console 不以 nested form warning 作为预期结果。
7. settle 后所有 status 回到 `false/null/null/null`；历史账本明确是应用 State，不是 Hook 第五字段。

### 两个 Demo 的共同限制

- 不使用 fetch、XHR、WebSocket、Server Function、外部 URL、timer、随机数、日期或性能时钟。
- 不使用 localStorage、IndexedDB、Cache API、Service Worker 或模块级持久状态。
- 不引入 `useActionState`、`useOptimistic`、表单库、校验库或手工全局 pending store。
- 运行源码与源码面板必须来自同一组真实 TSX/CSS 资产，不展示另写的简化版本。
- UI 样式遵守仓库约束，不使用 CSS Grid、`gap` 或非零 `letter-spacing`。
- 桌面、390px 与放大文字场景都必须保持无横向溢出、无裁切、无重叠；状态不能只靠颜色表达。

## 易错项

本节固定 9 项。每项都包含触发条件、原因、后果、错误示例、正确示例、验证方式、适用版本和来源。

### 1. 把 function Action 当作 `onSubmit`

- **触发条件：** 把事件处理器原样传给 `<form action>`，并调用 `preventDefault()`。
- **原因：** function Action 的参数是 `FormData`，不是 submit event；默认提交已经由 React 接管。
- **后果：** 参数类型错误，事件方法不存在，数据读取路径也会重复或失真。
- **错误示例：**

```tsx
function save(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
}

<form action={save}>...</form>
```

- **正确示例：**

```tsx
function save(formData: FormData) {
  console.log(formData.get('title'))
}

<form action={save}>...</form>
```

- **验证方式：** TypeScript 接受 `(FormData) => void | Promise<void>`；提交时 Action 收到字段且页面不
  发生默认导航。
- **适用版本：** React / React DOM `19.2.8`，公共文档 `19.2`。
- **来源：** S1、S2、S7、S9。

### 2. 把任意控件都当作 FormData 条目，并用 `get()` 读取全部同名值

- **触发条件：** 控件缺少 `name`、disabled 或 checkbox 未选中，却期待它出现；多个同名字段只调用
  `get()`。
- **原因：** HTML 只收集 successful controls；`get()` 只返回首个同名条目。
- **后果：** 必填业务字段得到 `null`，集合字段静默丢失后续值。
- **错误示例：**

```tsx
<input id="title" />
<input type="checkbox" name="topic" value="react" />
<input type="checkbox" name="topic" value="dom" />

const topics = formData.get('topic')
```

- **正确示例：**

```tsx
<input id="title" name="title" />
<input type="checkbox" name="topic" value="react" />
<input type="checkbox" name="topic" value="dom" />

const topics = formData.getAll('topic')
```

- **验证方式：** 同时选中两个 topic，确认 `getAll('topic')` 有两个值；移除 title 的 `name` 后确认
  `get('title')` 为 `null`。
- **适用版本：** HTML / XHR Living Standard；React DOM `19.2.8` 使用浏览器 FormData 规则。
- **来源：** S5、S16、S17。

### 3. 给 function `formAction` submitter 再配置业务 `name/value`

- **触发条件：** 同一按钮既用函数覆盖父 Action，又试图用 `name/value` 表达 intent。
- **原因：** React 需要管理该 submitter 的 Action 身份；当前 patch 会排除自定义 name 并在开发环境
  警告。
- **后果：** 覆盖 Action 读不到预期 intent，console 也不干净。
- **错误示例：**

```tsx
<button formAction={saveDraft} name="intent" value="draft">
  保存草稿
</button>
```

- **正确示例：**

```tsx
<button type="submit" formAction={saveDraft}>
  保存草稿
</button>
```

- **验证方式：** 覆盖路径只调用 `saveDraft`，其 FormData 不含该按钮的 intent，development console
  为零相关 warning。
- **适用版本：** React / React DOM `19.2.8`；升级后重新核对实现与测试。
- **来源：** S1、S5、S9、S14。

### 4. 把成功 reset 写成“清空全部字段”

- **触发条件：** 同时存在 `defaultValue` 字段、`defaultChecked` 字段和受控字段，却期待成功后全部为空。
- **原因：** React 重置的是该 form 的未受控字段到默认值；受控字段仍由 State 决定。
- **后果：** 课程对默认值和 State 所有权的描述错误，Demo 也会把不同字段的预期混在一起。
- **错误示例：**

```tsx
const [title, setTitle] = useState('受控标题')
<input name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
// 错误预期：Action 成功后 title 自动变成空字符串。
```

- **正确示例：**

```tsx
<input name="draft" defaultValue="草稿" />
// 成功后恢复为“草稿”。受控 title 是否清空由应用显式 setTitle 决定。
```

- **验证方式：** pending 时两个字段都保持当前值；resolve 后未受控字段回默认值，受控字段保持 State；
  reject 时 reset 计数不增加。
- **适用版本：** React / React DOM `19.2.8`，公共文档 `19.2`。
- **来源：** S1、S5、S6、S15。

### 5. 返回错误对象并期待 bare Action 自动显示失败

- **触发条件：** catch 异常后 `return { error }`，并期待未受控字段保留且 UI 出现错误结果。
- **原因：** 当前公开类型只接受 void；bare form Action 没有返回对象消费者。若绕过类型后 Promise 正常
  fulfilled，运行时仍把它视为成功完成。
- **后果：** 返回值丢失，未受控字段还可能走成功 reset，业务失败与系统异常被混淆。
- **错误示例：**

```tsx
async function save(formData: FormData) {
  try {
    await saveCourse(formData)
  } catch {
    return { error: '保存失败' }
  }
}
```

- **正确示例：**

```tsx
async function save(formData: FormData): Promise<void> {
  await saveCourse(formData)
}
```

- **验证方式：** TypeScript 拒绝 `Promise<{ error: string }>` 作为 bare Action；Promise reject 时最近
  Error Boundary 接管且 reset 不增加。
- **适用版本：** React / React DOM `19.2.8`、`@types/react@19.2.18`。
- **来源：** S1、S2、S6、S7、S23。

### 6. 在声明 form 的同组件读取自身状态

- **触发条件：** 组件先调用 `useFormStatus()`，随后 return 自己的 `<form>`。
- **原因：** Hook 只读取调用点已有的父 form，不能向下读取这个组件返回的子 form。
- **后果：** 自己的 form 正在 pending，UI 却持续显示空闲；若外层还有 form，甚至可能误读外层状态。
- **错误示例：**

```tsx
function MessageForm() {
  const status = useFormStatus()
  return <form action={save}>{String(status.pending)}</form>
}
```

- **正确示例：**

```tsx
function MessageForm() {
  return (
    <form action={save}>
      <SubmitStatus />
    </form>
  )
}
```

- **验证方式：** 同时显示 self probe 与真正后代 status；提交时只有后代进入 pending。
- **适用版本：** React DOM `19.2.8`，公共文档 `19.2`。
- **来源：** S3、S4、S10、S11。

### 7. 把表单外 Hook 当全局监听器，或用嵌套 form 证明作用域

- **触发条件：** 在页面顶部监听全部 form，或把 form 物理嵌套来测试“最近父级”。
- **原因：** `useFormStatus` 按合法父 form 作用域读取；无父 form 是空闲，HTML 又禁止 form 后代包含
  form。
- **后果：** 外部 probe 不更新；嵌套结构产生无效 DOM、React warning，并可能引起 hydration error。
- **错误示例：**

```tsx
<>
  <GlobalStatus />
  <form>
    <form>
      <SubmitStatus />
    </form>
  </form>
</>
```

- **正确示例：**

```tsx
<>
  <form action={saveA}><SubmitStatus /></form>
  <form action={saveB}><SubmitStatus /></form>
</>
```

- **验证方式：** 甲乙 form 互为兄弟；提交甲时只有甲后代 pending，乙后代与表单外 probe 完整 idle；
  DOM 中不存在 `form form`。
- **适用版本：** React DOM `19.2.8`、HTML Living Standard。
- **来源：** S3、S4、S11、S12、S18。

### 8. 由 function Action 直接推导 `status.method === 'post'`

- **触发条件：** form 未声明 method，仅根据 function Action 的 POST caveat 断言 status 一定为 post。
- **原因：** 当前 status 实现读取 DOM form method；`19.2.8` 官方测试对未声明 method 的 function
  Action 观察到默认 `get`。
- **后果：** 课程与固定官方测试冲突，并把本地函数状态误写成真实 HTTP 传输证据。
- **错误示例：**

```tsx
{/* 错误断言：function action 所以 method 必然是 post。 */}
<form action={save}>
  <SubmitStatus />
</form>
```

- **正确示例：**

```tsx
<form action={save}>
  <SubmitStatus />
</form>
```

- **验证方式：** Demo 不声明 method/encType/target，development console 无属性覆盖 warning；pending
  status 显示当前 patch 的 get，Network 不出现课程业务请求。
- **适用版本：** React / React DOM `19.2.8`；这是升级时必须复核的 patch 敏感项。
- **来源：** S1、S2、S3、S4、S9、S11、S22。

### 9. 只用颜色或 disabled 表达 pending

- **触发条件：** 提交后只降低按钮透明度、改变颜色或禁用按钮，没有可见状态文字和 live region。
- **原因：** 视觉样式与 disabled 状态不能完整向所有用户传达动态提交消息。
- **后果：** 使用屏幕阅读器或无法区分颜色的用户不知道提交是否开始、结束或失败。
- **错误示例：**

```tsx
<button disabled={pending} className={pending ? 'is-pending' : ''}>
  提交
</button>
```

- **正确示例：**

```tsx
<button disabled={pending}>{pending ? '提交中' : '提交'}</button>
<p role="status" aria-atomic="true">
  {pending ? '表单正在提交' : '可以提交'}
</p>
```

- **验证方式：** 文案在 DOM 中可见；状态容器稳定存在并使用 status 语义；键盘焦点不必被强制移动。
- **适用版本：** WCAG `2.2`、WAI-ARIA `1.2`；React 版本无关。
- **来源：** S19、S20、S21。

## 课程正文冻结建议

学习者正文应保持以下顺序：

1. 从 function Action 的 FormData 参数建立提交生命周期。
2. 解释 successful controls、重复 key 与 submitter 数据。
3. 对比父 Action 与 function `formAction`。
4. 解释 pending、fulfilled/rejected 和未受控 reset。
5. 引入 `useFormStatus` 四字段判别联合。
6. 用父 form 后代、同组件、表单外和兄弟 form 证明作用域。
7. 单独写 method 版本卡和合法 form 边界。
8. 运行两个职责分明的 Demo，再进入 9 个易错项与练习。

正文必须出现的准确表述：

- “function Action 接收本次提交的 FormData，不接收 submit event。”
- “成功后重置当前 form 的未受控字段到默认值；受控字段继续由 State 决定。”
- “`useFormStatus` 从 `react-dom` 导入，返回父 form 的 pending、data、method 和 action。”
- “调用 Hook 的组件必须位于目标 form 内；声明该 form 的同组件读不到自身返回的 form。”
- “表单外不是全局监听器，兄弟 form 的提交状态互相隔离。”
- “物理嵌套 form 是无效 HTML，不能用来验证最近父级。”
- “当前 Demo 不声明 method；React DOM 19.2.8 观察到的 status.method=get 只是 DOM 值，不是实际
  网络传输证明。”

正文禁止出现的推断：

- “Action 成功后清空所有字段。”
- “返回一个错误对象会让 bare Action 自动显示失败并保留输入。”
- “`status.data` 是 Action 返回结果”或“settle 后仍保留最后一次 FormData”。
- “同组件调用能读取自己随后 return 的 form。”
- “表单外 Hook 监听页面所有 form”或“任意 Promise 都会触发它。”
- “function Action 必然让未声明 method 的 status 显示 post。”
- “为了让 status 显示 post，可以给 function Action form 显式设置 method=post。”
- “客户端函数支持无 JavaScript 提交或证明了 Server Function 行为。”

## 验收矩阵

| 教学合同 | 官方依据 | 应观察的确定结果 |
| --- | --- | --- |
| Action 参数 | S1、S2、S7、S9 | 每次 Action 收到一份 FormData，不接收事件。 |
| successful controls | S16、S17 | 无 name、disabled、未选项被排除；重复 key 用 getAll 读取。 |
| 普通 submitter | S9、S14、S16 | 父 Action 收到实际 submitter 的 name/value。 |
| function formAction | S1、S5、S9、S14 | 覆盖父 Action，不依赖自定义 submitter name/value。 |
| pending 完成边界 | S1、S6、S15 | Promise settle 前不 reset，普通界面仍可交互。 |
| 成功 reset | S1、S5、S6、S15 | 未受控字段回默认值，受控字段继续由 State 决定。 |
| rejected Action | S1、S2、S6、S23 | 最近 Error Boundary 接管，不记录成功 reset。 |
| status 空闲形状 | S8、S10、S11 | false/null/null/null。 |
| status pending 形状 | S3、S8、S9、S11、S13 | true/FormData/method/action。 |
| 后代作用域 | S3、S4、S10、S11 | 只有目标 form 内后代读取 pending。 |
| 同组件与表单外 | S3、S4 | self/outside 保持空闲，不向下或全局监听。 |
| 兄弟 form | S3、S10、S11 | 提交甲不激活乙，提交乙不激活甲。 |
| 合法 DOM | S12、S18 | 无嵌套 form，无对应 React warning。 |
| method 版本卡 | S1、S3、S9、S11、S22 | 不声明 method；当前 patch 观察 get，无覆盖 warning，也不把字段当网络证据。 |
| 可访问状态 | S19-S21 | 可见动态文案、原生 disabled 与稳定 status region 同时存在。 |

## 研究边界与后续核验

本研究只给 A12 提供官方事实与教学合同，不把当前正文或 Demo 的存在等同于本批已重新完成全套生产
验收。后续若修改课程资产，应按改动风险至少核对：

1. 类型检查、lint、格式检查和 production build。
2. 两个 Demo 的完整状态机，而不是只看初始画面。
3. 桌面、390px 与放大文字视口的溢出、裁切、键盘和状态消息。
4. console、业务 Network、合法 form DOM 与运行源码/源码面板同源。
5. progress migration 只把两个旧 ID 合并到 A12，不影响其他课程历史。
6. 删除 function Action form 上的显式 method 后，重新验证 status 当前显示 get，且 console 不再出现
   method 覆盖 warning；若升级 React，重新核验此版本卡。

本次授权到此文件结束：不修改或清理旧研究稿、旧课程正文、旧 Demo 目录、manifest、Track、迁移代码
和计划，不开始 A13，也不暂存、提交或推送任何改动。

## 结论

A12 的最小完整合同不是单独的“客户端 Form Action”，而是同一提交生命周期的两面：function Action
接收 FormData、按完成结果 reset 或抛错；`useFormStatus` 让父 form 内后代读取这次提交的四字段局部
状态。当前课程保留两个职责独立的 Demo 是合理的：一个证明 Action 数据与完成边界，一个证明 status
形状与作用域。

最需要防止的错误有三类：把 reset 写成清空全部字段，把 `useFormStatus` 写成全局 pending，以及把
function Action 的 POST caveat 写成 `status.method` 或真实网络传输的直接证明。本文已用 React
`19.2` 公共文档、`19.2.8` 固定源码/测试、WHATWG 与 W3C 规范分别限定这些边界。
