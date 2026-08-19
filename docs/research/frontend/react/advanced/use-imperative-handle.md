# useImperativeHandle 官方调研

## 结论摘要

`useImperativeHandle` 用来定制组件通过 Ref 暴露给调用方的 handle。它适合暴露少量、按意图命名的命令，
例如聚焦、滚动或选择文本；能由 Props 和 State 表达的持续 UI 状态仍应保持声明式数据流。

React 19 的函数组件可以直接接收 `ref` prop。组件内部通常保留一个指向真实宿主节点的 DOM Ref，再把
外部 Ref 交给 `useImperativeHandle`。调用方最终得到的是 `createHandle` 返回的值，而不是内部 DOM 节点。

核心判断如下：

1. 内部 DOM Ref 管理实现细节，外部 handle Ref 定义公开能力，二者不应混成同一个 Ref。
2. `createHandle` 是无参数工厂；它返回的值会被赋给外部 Ref，Hook 本身返回 `undefined`。
3. 依赖列表必须内联、长度固定，并包含工厂闭包读取的所有响应值；React 使用 `Object.is` 逐项比较。
4. 对象 Ref 和 Callback Ref 的赋值、替换与清理方式不同，React 19 还允许 Callback Ref 返回清理函数。
5. Strict Mode 会在开发环境重放相关挂载和清理逻辑；工厂不能承担只允许发生一次的外部副作用。
6. React 19 不再要求函数组件用 `forwardRef` 接收标准 Ref；React 18 及更早版本仍需要它。

## 版本与证据边界

| 范围 | 固定值 | 说明 |
| --- | --- | --- |
| React 文档 | `19.2` | react.dev 的当前稳定文档系列 |
| React / React DOM | `19.2.8` | 固定 tag `v19.2.8` |
| React 源码 commit | `1dd4ecbdabf826f527fc9a58c05ea70375b7d170` | tag `v19.2.8` 指向的 commit |
| React 类型 | `@types/react@19.2.18` | 当前仓库安装版本 |
| TypeScript | `6.0.3` | 当前仓库安装版本 |
| 证据日期 | `2026-08-18` | 本文所列在线页面与固定源码的读取日期 |

公共用法以 React 19.2 Reference、Learn 和 React 19 发布说明为准。固定源码与官方测试只解释
`v19.2.8` 的赋值、清理、依赖和开发期行为，不把内部 Fiber flag、Effect 注册方式或提交细节当成跨版本
公共承诺。TypeScript 结论以当前 `@types/react@19.2.18` 声明为准。

## 官方来源

| 编号 | 第一方来源 | 支撑事实 |
| --- | --- | --- |
| S1 | [React Versions](https://react.dev/versions) | React 文档稳定版本基线 |
| S2 | [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle) | 签名、参数、返回值、依赖、`Object.is`、React 19 `ref` prop、使用边界 |
| S3 | [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) | 内部 DOM Ref、受限 handle、Ref 的 render/commit 边界 |
| S4 | [`forwardRef`](https://react.dev/reference/react/forwardRef) | React 19 与 React 18 的接收 Ref 方式、受限 handle 与声明式 Props 建议 |
| S5 | [React v19](https://react.dev/blog/2024/12/05/react-19) | `ref` as prop、Callback Ref 清理函数、类组件边界 |
| S6 | [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) | Callback Ref 隐式返回值的 TypeScript 变化 |
| S7 | [`<StrictMode>`](https://react.dev/reference/react/StrictMode) | 开发期额外 render、Effect 与 Ref setup/cleanup 检查 |
| S8 | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) | render 幂等、无 render 副作用、不修改非局部值 |
| S9 | [Common components: Ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) | Callback Ref 的参数、返回清理函数、函数身份变化与兼容清理 |
| S10 | [`ReactFiberHooks.js` 固定源码](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2792-L2885) | handle 工厂调用、对象/函数 Ref 赋值与清理、内部依赖注册、Strict Effects 标记 |
| S11 | [`ReactFiberHooks.js` 依赖比较](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L454-L501) | 固定版本逐项依赖比较与数组长度警告 |
| S12 | [`useImperativeHandle` 官方行为测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L3472-L3570) | 空依赖捕获旧值、省略依赖自动更新、依赖变化与不变时的行为 |
| S13 | [`useImperativeHandle` 官方诊断测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooks-test.internal.js#L716-L750) | 非数组依赖的开发期诊断 |
| S14 | [`useImperativeHandle` 参数诊断测试](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooks-test.internal.js#L822-L865) | 错误 Ref 形状与非函数工厂的开发期诊断 |
| S15 | [`@types/react` 固定类型声明](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L154-L194) | `RefObject`、`RefCallback`、`Ref` 结构与 Callback Ref 清理返回值 |
| S16 | [`useImperativeHandle` 固定类型签名](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L1792-L1800) | `Ref<T>`、`R extends T`、工厂与依赖的 TypeScript 合同 |

## 公共 API 合同

### 签名

```tsx
useImperativeHandle(ref, createHandle, dependencies?)
```

- `ref`：组件从外部收到的 Ref，可以是对象 Ref、Callback Ref、`null` 或未传入时的 `undefined`。
- `createHandle`：无参数函数，返回要暴露的 handle；返回值可以是任意类型，常见形式是只含少量方法的对象。
- `dependencies`：可选的响应依赖列表。
- 返回值：`undefined`。

`useImperativeHandle` 是 Hook，必须在函数组件或自定义 Hook 顶层调用。第二个参数不是 handle 对象本身，
而是创建 handle 的函数。Callback Ref 可以返回清理函数；`createHandle` 本身没有清理函数返回合同。

### React 19 的 `ref` prop

React 19 的函数组件可以把 `ref` 明确写进 Props 类型并直接解构：

```tsx
type InputHandle = {
  /** 聚焦内部输入框。 */
  focus(): void
}

type InputProps = {
  ref?: Ref<InputHandle>
}

/** 通过 React 19 的 ref prop 暴露受限输入命令。 */
function Input({ ref }: InputProps) {
  // ...
}
```

这不表示每个函数组件都会自动暴露 DOM 节点。组件仍需把 Ref 传给宿主元素、传给另一个能接收 Ref 的组件，
或交给 `useImperativeHandle`。若收到 Ref 却完全没有使用，调用方看到的对象 Ref 会保持 `null`。

React 19 发布说明还明确区分类组件：指向类组件的 Ref 仍表示组件实例，不作为普通 Prop 传入类组件。

### 内部 DOM Ref 与外部 handle Ref

受限 handle 需要两个职责不同的 Ref：

```text
调用方的 Ref<InputHandle>
          │
          ▼
useImperativeHandle(ref, createHandle, dependencies)
          │ 返回少量公开命令
          ▼
      InputHandle

组件内部的 Ref<HTMLInputElement>
          │
          ▼
    <input ref={inputRef}>
```

- 内部 DOM Ref 只服务组件实现，可以调用真实节点的 `focus()`、`select()` 或 `scrollIntoView()`。
- 外部 handle Ref 只服务调用方合同，暴露与组件意图一致的方法。
- 外部 Ref 不应同时传给内部 `<input>`；否则调用方仍会得到完整 DOM 节点，失去收窄接口的意义。
- handle 不是安全隔离机制。它是组件 API 的封装边界，调用方仍可通过其他 DOM 查询或类型断言绕开。

## 依赖与 handle 更新

### 响应依赖

依赖列表必须包含 `createHandle` 闭包读取的全部响应值，包括 Props、State，以及组件函数体中声明的变量和
函数。数组必须内联书写并保持项目数量不变：

```tsx
useImperativeHandle(
  ref,
  /** 创建只读取当前标签的 handle。 */
  () => ({
    /** 读取当前标签。 */
    getLabel() {
      return label
    },
  }),
  [label],
)
```

若依赖改变，React 会再次调用工厂，并把工厂返回值赋给 Ref。若省略依赖列表，工厂会在每次 re-render 后
重新运行。若依赖未变，React 保留既有 handle，不重新运行工厂。

`[]` 只适合工厂不捕获会变化响应值的情况。Ref 对象本身在组件生命周期内保持稳定，因此只通过
`inputRef.current` 间接访问宿主节点的方法可以使用空数组；若方法闭包直接读取 `label`、`disabled`、State
或本轮 render 创建的回调，就必须列出对应依赖。

### `Object.is` 比较

React 使用 `Object.is` 逐项比较新旧依赖：

- `Object.is(NaN, NaN)` 为 `true`，两个 `NaN` 不触发依赖变化。
- `Object.is(0, -0)` 为 `false`，`0` 与 `-0` 会被视为不同。
- 对象、数组和函数按引用身份比较；每次 render 新建的引用会被视为变化。

`v19.2.8` 源码还会把外部 `ref` 自身附加到内部依赖中。因此，即使公开依赖不变，更换对象 Ref 或 Callback
Ref 也会清理旧 Ref 并连接新 Ref。这个附加行为属于固定源码事实；调用方不需要把 `ref` 手工重复写进
公开依赖列表。

## 对象 Ref 与 Callback Ref

### 对象 Ref

`v19.2.8` 在提交阶段调用 `createHandle()`，然后把结果写入 `ref.current`。当该 handle 被清理时，React
把 `ref.current` 设为 `null`。清理可能发生在卸载、相关依赖变化、外部 Ref 更换或开发期 Strict Mode 重放
期间。

因此，调用方类型通常是 `InputHandle | null`。首次提交前、清理期间和卸载后都不能假定 handle 存在；
事件处理函数应使用判空或可选链：

```tsx
inputHandleRef.current?.focus()
```

### Callback Ref

`v19.2.8` 对 Callback Ref 的处理顺序是：

1. 调用 `createHandle()` 取得 handle。
2. 调用 `refCallback(handle)`。
3. 保存 Callback Ref 返回的值。
4. 清理时，如果返回值是函数，则调用该清理函数；否则调用 `refCallback(null)`。

React 19 发布说明明确指出，Callback Ref 的清理函数同样适用于 `useImperativeHandle`。一旦 Callback Ref
返回清理函数，React 清理时不会再额外调用 `refCallback(null)`。未返回清理函数时，`null` 回调仍作为兼容
行为存在，官方说明未来版本会移除这一兼容方式。

Callback Ref 的函数身份也是边界的一部分。每次 render 创建新的 Callback Ref，会让旧回调被清理并让新
回调重新接收 handle。若这种连接过程带有可观察工作，应保持 Callback Ref 身份稳定，或改用对象 Ref。

## Strict Mode 与纯度

Strict Mode 的相关检查只发生在开发环境：组件函数会额外 render，Effect 会额外 setup/cleanup，Ref
回调也会额外 setup/cleanup。生产环境不能依赖这些额外次数。

`v19.2.8` 把 imperative handle 的创建和 Ref 赋值注册为 layout 类效果，并在 Strict Effects 模式下标记
开发期重放。因此，初次挂载时 `createHandle`、Ref 赋值和清理都可能重复发生。由此得到三个边界：

1. 组件 render 必须保持幂等，不在 render 中读取或调用尚未提交的 handle。
2. `createHandle` 只负责构造并返回公开值，不把埋点、订阅、聚焦或全局计数等外部副作用塞进工厂。
3. handle 方法本身可以是命令式的，但只在调用方明确触发时产生动作，并应容忍内部节点暂时为 `null`。

错误写法会把工厂误当成一次性挂载回调：

```tsx
useImperativeHandle(
  ref,
  /** 错误地在创建 handle 时立即产生宿主动作。 */
  () => {
    inputRef.current?.focus()
    return {
      /** 聚焦内部输入框。 */
      focus() {
        inputRef.current?.focus()
      },
    }
  },
  [],
)
```

正确边界是让工厂只返回方法，把聚焦动作留到方法被事件处理函数调用时发生。

## TypeScript 合同

当前类型声明的关键形状如下：

```ts
interface RefObject<T> {
  current: T
}

type RefCallback<T> = (
  instance: T | null,
) => void | (() => void)

type Ref<T> = RefCallback<T> | RefObject<T | null> | null

function useImperativeHandle<T, R extends T>(
  ref: Ref<T> | undefined,
  init: () => R,
  deps?: readonly unknown[],
): void
```

`T` 表示调用方声明的 handle 类型，`R extends T` 要求工厂结果可赋给该类型。TypeScript 使用结构类型，
所以这个约束不是“精确对象”检查：工厂可以返回额外字段，但通过 `Ref<T>` 的调用方静态可见面仍是 `T`。
真正的最小接口仍需要组件作者只返回必要成员。

React 19 的普通函数组件不会替任意 Props 自动补上 `ref` 字段。组件应显式声明 `ref?: Ref<InputHandle>`；
调用方则使用 `useRef<InputHandle>(null)`。内部 DOM Ref 必须单独声明为
`useRef<HTMLInputElement>(null)`，不能用 `InputHandle` 冒充 DOM，也不能用 DOM 类型冒充公开 handle。

### 完整类型示例

```tsx
import {
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
} from 'react'

type InputHandle = {
  /** 聚焦内部输入框。 */
  focus(): void
  /** 选中内部输入框的全部文本。 */
  selectAll(): void
}

type RestrictedInputProps = {
  ref?: Ref<InputHandle>
  value: string
  /** 把新的输入值交给状态所有者。 */
  onValueChange: (value: string) => void
}

/** 保持输入值声明式受控，只暴露两个无法由数据描述的宿主动作。 */
function RestrictedInput({
  ref,
  value,
  onValueChange,
}: RestrictedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(
    ref,
    /** 创建只含聚焦与全选命令的公开 handle。 */
    () => ({
      /** 聚焦内部输入框。 */
      focus() {
        inputRef.current?.focus()
      },
      /** 选中内部输入框的全部文本。 */
      selectAll() {
        inputRef.current?.select()
      },
    }),
    [],
  )

  /** 把输入变化交还给外部状态所有者。 */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.value)
  }

  return <input ref={inputRef} value={value} onChange={handleChange} />
}

/** 通过受限 handle 调用明确的宿主动作。 */
function Form() {
  const inputHandleRef = useRef<InputHandle>(null)
  const [value, setValue] = useState('React')

  /** 请求输入组件聚焦其内部节点。 */
  function handleFocus() {
    inputHandleRef.current?.focus()
  }

  return (
    <>
      <RestrictedInput
        ref={inputHandleRef}
        value={value}
        onValueChange={setValue}
      />
      <button type="button" onClick={handleFocus}>
        聚焦输入框
      </button>
    </>
  )
}
```

示例中的 `inputHandleRef.current` 是 `InputHandle | null`，没有 `style`、`value`、`remove()` 等 DOM
成员。`value` 仍由 Prop 表达；handle 只负责聚焦与选择文本。

### Callback Ref 的返回类型

React 19 允许 Callback Ref 返回清理函数，因此 TypeScript 会拒绝隐式返回 handle 赋值结果：

```tsx
/** 错误地隐式返回 handle 赋值结果。 */
const wrongRef: RefCallback<InputHandle> = handle => (latestHandle = handle)

/** 只保存 React 交付的 handle，不返回赋值结果。 */
const correctRef: RefCallback<InputHandle> = handle => {
  latestHandle = handle
}
```

若确实需要清理，应明确返回无参数清理函数，而不是依赖 `refCallback(null)` 与自定义清理同时发生。

## 声明式数据与命令式动作

React 官方把 Ref 视为逃生舱。选择接口时先判断“这是持续状态，还是一次动作”：

| 需求 | 推荐接口 | 原因 |
| --- | --- | --- |
| 对话框是否打开 | `isOpen` Prop / State | UI 输出由数据决定 |
| 输入值、禁用状态、选中项 | Props / State | 需要参与 render 并保持单一事实来源 |
| 通知父组件值变化 | 事件回调 Prop | 表达数据流而不是暴露内部实例 |
| 聚焦、滚动、选择文本 | 受限 handle 方法 | 属于宿主平台的一次命令 |
| 触发不能声明式表达的动画 | 受限 handle 方法 | 属于明确的命令式逃生场景 |
| 读取组件当前业务状态 | Props / State 提升或回调 | Ref 不应成为旁路状态仓库 |

不应为对话框暴露 `{ open, close }` 来替代 `isOpen`，也不应暴露 `getNode()`、`node` 或完整 DOM 元素。
方法名应描述调用方意图，而不是泄漏内部标签结构。这样组件可以从 `<input>` 换成组合 DOM，而不迫使
调用方同步修改。

## 高价值易错点

### 暴露完整 DOM 节点

- **触发条件：** 外部 Ref 直接传给 `<input>`，或 handle 返回 `{ node: inputRef.current }`。
- **原因：** 调用方得到所有 DOM 属性和方法，而不是组件有意支持的最小能力。
- **后果：** 调用方可以修改样式、值或 DOM 结构，组件实现细节变成公开依赖。
- **错误示例：** `return <input ref={ref} />`。
- **正确写法：** 内部节点使用 `inputRef`，外部 `ref` 只接收 `{ focus, selectAll }`。
- **判定方式：** 调用方类型不应出现 `style`、`remove()`、`value` 等宿主节点成员。
- **适用版本：** React 19.2。
- **来源：** S2、S3、S4。

### 把 handle Ref 与 DOM Ref 声明成同一类型

- **触发条件：** 工厂返回 `{ focus() {} }`，Props 却写成 `Ref<HTMLInputElement>`。
- **原因：** TypeScript 声明与 React 实际写入 Ref 的值不一致。
- **后果：** 调用方会获得不存在的 DOM 静态能力，运行时对象也不符合声明。
- **错误示例：** `useRef<HTMLInputElement>(null)` 用于接收自定义 handle。
- **正确写法：** 外部使用 `Ref<InputHandle>`，内部使用 `RefObject<HTMLInputElement | null>`。
- **判定方式：** 父级 Ref 的泛型应与 `createHandle` 的返回合同一致。
- **适用版本：** React 19.2、`@types/react@19.2.18`。
- **来源：** S2、S15、S16。

### 空依赖捕获变化值

- **触发条件：** handle 方法读取 `label` 或 State，依赖却写成 `[]`。
- **原因：** React 不会在该值变化时重新运行工厂，方法闭包继续读取初次值。
- **后果：** 页面已经显示新数据，命令却仍使用旧数据。
- **错误示例：** `useImperativeHandle(ref, () => ({ getLabel: () => label }), [])`。
- **正确写法：** 把 `label` 放进依赖列表，或让命令只依赖稳定的内部 Ref。
- **判定方式：** 逐项检查工厂与返回方法闭包读取的响应值。
- **适用版本：** React 19.2 / `v19.2.8`。
- **来源：** S2、S12。

### 无意省略依赖列表

- **触发条件：** 工厂每次返回新对象，但第三个参数没有传入。
- **原因：** 省略依赖会让 React 在每次 re-render 后重新运行工厂并重新赋值。
- **后果：** handle 身份反复变化，Callback Ref 还可能出现额外清理与连接。
- **错误示例：** `useImperativeHandle(ref, () => ({ focus }))`。
- **正确写法：** 工厂只读取稳定 Ref 时使用 `[]`；读取响应值时使用完整依赖列表。
- **判定方式：** 无关 State 更新后，handle 工厂不应在依赖不变时再次运行。
- **适用版本：** React 19.2 / `v19.2.8`。
- **来源：** S2、S12。

### 在工厂中产生外部副作用

- **触发条件：** `createHandle` 内直接聚焦、订阅、埋点或修改全局计数。
- **原因：** 工厂负责创建公开值，且开发期 Strict Mode 可以重放其挂载与清理。
- **后果：** 动作可能重复发生，或在没有用户意图时提前发生。
- **错误示例：** 工厂先调用 `inputRef.current?.focus()`，再返回方法。
- **正确写法：** 工厂只返回 `focus()`；由事件处理函数明确调用该方法。
- **判定方式：** 不调用 handle 方法时，不应出现命令动作或外部写入。
- **适用版本：** React 19.2 / `v19.2.8`，Strict Mode 检查仅限开发环境。
- **来源：** S7、S8、S10。

### 同时期待 Callback Ref cleanup 与 `null`

- **触发条件：** Callback Ref 返回清理函数，却仍依赖同一回调随后收到 `null`。
- **原因：** React 19 在 cleanup 存在时会调用 cleanup，并跳过 `refCallback(null)`。
- **后果：** 只写在 `handle === null` 分支中的释放逻辑不会运行。
- **错误示例：** 返回 cleanup 的同时只在 `handle === null` 时清空外部资源。
- **正确写法：** 把释放逻辑放进返回的 cleanup；若不返回 cleanup，再处理 `null` 兼容路径。
- **判定方式：** 每次 attach 只选择一种对称清理方式。
- **适用版本：** React 19.2 / `v19.2.8`。
- **来源：** S5、S6、S9、S10、S15。

### 用命令方法替代声明式状态

- **触发条件：** 为对话框暴露 `open()`、`close()`，却没有 `isOpen` Prop。
- **原因：** 持续 UI 状态被藏进命令通道，React 数据流无法直接描述当前界面。
- **后果：** 状态所有权分散，渲染结果、父级状态与内部实例容易失去同步。
- **错误示例：** `modalRef.current?.open()` 作为唯一打开方式。
- **正确写法：** 由 State 保存布尔值并传入 `isOpen`；Ref 只保留无法声明式表达的动作。
- **判定方式：** 若需求可以写成一个决定 JSX 的 Prop，就优先使用 Prop / State。
- **适用版本：** React 19.2。
- **来源：** S2、S4。

### 把 `forwardRef` 写成 React 19 必需语法或已删除 API

- **触发条件：** React 19 新代码仍宣称函数组件必须包 `forwardRef`，或宣称 React 19 已移除它。
- **原因：** 两种说法都越过官方版本边界。
- **后果：** 新代码保留不必要包装，或兼容代码被错误判定为不可用。
- **错误示例：** “React 19 只能通过 `forwardRef` 接收 Ref”或“React 19 不能使用 `forwardRef`”。
- **正确写法：** React 19 普通函数组件直接接收 `ref` prop；React 18 及更早版本使用 `forwardRef`。
- **判定方式：** 根据实际 React major 选择写法，不在同一示例混用两个入口。
- **适用版本：** React 18 与 React 19 的迁移边界。
- **来源：** S2、S4、S5。

## 固定源码与官方测试推导

### 工厂、赋值与清理

**官方事实：** `v19.2.8` 的 `imperativeHandleEffect` 对函数 Ref 调用 `create()` 与
`refCallback(inst)`；清理时优先调用 callback 返回的 cleanup，否则调用 `refCallback(null)`。对对象 Ref
则把 `create()` 结果写入 `current`，清理时写回 `null`。

**合理推导：** 对象 Ref 适合普通调用方；Callback Ref 适合确实需要连接与释放逻辑的场景。无论使用哪种
Ref，都必须把 `null` 或清理期视为正常状态。

**边界：** 具体函数名、Fiber flag 和内部注册方式不是公共 API。跨 React 版本时应重新读取公共文档与固定
源码。

### 依赖与外部 Ref 身份

**官方事实：** 固定源码把公开依赖与 `ref` 拼成内部依赖；依赖比较最终逐项调用内部 `is`，对应公开文档
说明的 `Object.is`。官方测试证明 `[]` 会保留旧闭包、省略依赖会更新、依赖变化时更新、依赖不变时不重复
创建。

**合理推导：** 依赖数组既控制闭包新鲜度，也影响 handle 身份和 Callback Ref 的连接次数。稳定内部 Ref
不需要为了 `current` 变化而成为响应依赖；变化的 Props、State、对象、函数则必须按闭包读取情况处理。

**边界：** 不应依赖内部数组拼接顺序，也不应把 handle 身份当成业务状态。公开语义只保证何时重新调用
工厂并把其返回值赋给 Ref。

### Strict Mode 重放

**官方事实：** 固定源码以 layout 类效果注册 imperative handle，并在 Strict Effects 模式下加入开发期
挂载标记；Strict Mode 官方文档说明 Ref 与效果会额外经历 setup/cleanup 检查。

**合理推导：** `createHandle` 和 Callback Ref 都应支持 setup、cleanup、setup 的重放，不能用调用次数证明
业务动作只发生一次。

**边界：** 这是开发期诊断，不代表生产环境固定调用两次，也不承诺所有未来版本采用相同内部时序。

## 本科教学范围

### 必须掌握

1. `useImperativeHandle(ref, createHandle, dependencies?)` 的三个参数与 `undefined` 返回值。
2. React 19 `ref` prop 与 React 18 `forwardRef` 的版本边界。
3. 内部 DOM Ref 和外部 handle Ref 的职责分离。
4. 受限方法集合为何比完整 DOM 节点更稳定。
5. `[]`、完整依赖和省略依赖三种行为，以及 `Object.is` 比较。
6. 对象 Ref 的 `current` 赋值与 `null` 清理。
7. Callback Ref 返回 cleanup 时不会再收到 `null` 的 React 19 边界。
8. Strict Mode 开发期重放与工厂纯度要求。
9. `Ref<InputHandle>`、`useRef<InputHandle>(null)` 与内部 DOM Ref 的 TypeScript 区分。
10. Props / State 表达持续状态，handle 只表达必要命令的选择规则。

### 只需说明边界

- Callback Ref 的函数身份会影响清理与重新连接，普通使用优先对象 Ref。
- TypeScript 的 `R extends T` 是结构兼容，不是运行时权限控制。
- 固定源码在内部把外部 `ref` 纳入变化判断，但调用方不手工复制该依赖。
- 类组件 Ref 仍指向实例，不属于函数组件 `ref` prop 的同一用法。

### 不需要展开

- Fiber 数据结构、Hook 链表、flag 位值和完整提交子阶段。
- 跨 React major 的组件库兼容封装、条件类型与多态 `as` Prop。
- HOC、类组件实例 API、字符串 Ref、`findDOMNode`。
- 用 handle 构建外部 Store、事件总线或通用服务定位器。
- Hydration、Server Components、Portal、CSS-in-JS、性能基准。

本科层级的终点不是记住内部实现，而是能设计一个最小、类型明确、依赖正确、可清理，并且只用于必要
命令动作的公开 handle。
