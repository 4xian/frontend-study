---
id: react.core.learn.intermediate.ref-as-prop
type: lesson
title: ref 作为 prop
summary: 在 React 19 函数组件中接收 ref，并把它逐层转交给明确的宿主节点。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 65
prerequisites:
  - react.core.learn.intermediate.dom-refs
related:
  - react.core.learn.intermediate.use-ref
  - react.core.learn.intermediate.dom-refs
tags:
  - React
  - ref
  - props
  - DOM
  - TypeScript
appliesTo: React 19.2
verifiedAt: 2026-08-16
objectives:
  - 能在 React 19 函数组件中直接接收 ref prop，并把接收与转交区分为两个动作。
  - 能让 Ref 逐层穿过组件边界，最终连接到公开合同指定的宿主节点。
  - 能根据最终宿主节点选择准确的 Ref 泛型，并保留节点失效状态。
  - 能用 Ref<T> 同时支持对象 Ref、Callback Ref 与 null。
  - 能根据组件接口选择显式 Ref prop 或 ComponentPropsWithRef。
  - 能说明透明转交如何保留 React 19 Callback Ref 的 setup 与 cleanup 合同。
  - 能区分 React 19 直接传递、React 18 forwardRef 写法和类组件实例 Ref。
recap:
  - React 19 函数组件可以直接从 props 接收 ref。
  - 接收 Ref 不会自动连接内部节点，每一层组件都必须显式转交。
  - 最终承接 ref 的宿主元素决定 Ref 的实例、DOM API 和 TypeScript 泛型。
  - Ref<T> 覆盖对象 Ref、Callback Ref 与 null；可选 prop 还允许调用方不传 Ref。
  - 对象 Ref 会随目标节点接入和移除在 null 与节点之间变化。
  - React 18 使用 forwardRef 接收标准 Ref；React 19 中 forwardRef 尚未删除。
  - 传给类组件的标准 Ref 仍指向类实例，不进入 this.props.ref。
sources:
  - title: React Versions
    url: https://react.dev/versions
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 确认 react.dev 当前文档版本口径
  - title: React v19 - ref as a prop
    url: https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - 函数组件直接接收 ref prop
      - 新函数组件不再需要 forwardRef
      - 类组件仍保留实例 Ref 语义
  - title: Manipulating the DOM with Refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 父组件 Ref 经函数组件转交给明确的宿主节点
  - title: Common components - ref callback
    url: https://react.dev/reference/react-dom/components/common#ref-callback
    sourceType: official-reference
    appliesTo: React DOM 19.2
    claims:
      - Callback Ref 的节点参数与 cleanup 合同
  - title: forwardRef
    url: https://react.dev/reference/react/forwardRef
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React 19 不再需要 forwardRef，但该 API 尚未删除
      - 收到 Ref 后仍须显式转交
  - title: useRef
    url: https://react.dev/reference/react/useRef
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 宿主节点提交与移除时对象 Ref 的 current 变化
      - render 期间不读取或写入 ref.current
  - title: Using TypeScript
    url: https://react.dev/learn/typescript
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React 组件 Props 的 TypeScript 声明
  - title: TypeScript JSX Handbook
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
    sourceType: official-reference
    appliesTo: TypeScript JSX
    claims:
      - 函数组件 JSX 属性由组件 Props 类型检查
  - title: React 19 Upgrade Guide
    url: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - ref 作为 prop 需要新的 JSX Transform
---

# ref 作为 prop

## 一、学习目标

- 在 React 19 函数组件中把 `ref` 声明为组件 prop。
- 分清“调用方传入”“组件接收”“组件继续转交”“宿主节点接入”四个环节。
- 让同一个 Ref 穿过一层或多层函数组件，最终落到明确的宿主节点。
- 用准确的 DOM 类型描述组件实际暴露的节点。
- 同时支持对象 Ref 和 Callback Ref，不把接口限死为对象形式。
- 在节点尚未提交、条件隐藏、替换或卸载时正确处理空值。
- 区分 React 19、React 18 和类组件的 Ref 接收方式。

## 二、为什么需要

父组件可以把 Ref 直接交给 `<input>`，但真实界面通常会把标签、输入框和提示文字封装成
`SearchInput`。父组件此时渲染的是自定义组件，不能直接把标准 Ref 连接到内部 DOM。

React 19 允许函数组件从 props 接收 `ref`。组件作者再把它明确放到需要公开的宿主元素上，调用方就能
聚焦、滚动或调用该节点的其他 DOM API。这个过程只传递命令式连接，不复制节点，也不把节点变成 State。

组件可能包含多个节点、多个分支或多层封装。React 无法猜测调用方想要哪个节点，所以“接收了 Ref”与
“已经暴露节点”不是同一件事。最终目标必须由组件接口明确决定。

## 三、Ref 的组件边界

### 1. React 19 函数组件直接接收 ref

```tsx
import type { Ref } from 'react'

type SearchInputProps = {
  label: string
  ref?: Ref<HTMLInputElement>
}

/** 接收输入框 Ref，并把它透明转交给宿主输入框。 */
function SearchInput({ label, ref }: SearchInputProps) {
  return (
    <label>
      <span>{label}</span>
      <input ref={ref} />
    </label>
  )
}
```

调用方仍使用标准 JSX 属性：

```tsx
const inputRef = useRef<HTMLInputElement>(null)

return <SearchInput ref={inputRef} label="搜索" />
```

React 19 把标准 Ref 交给函数组件的 props。TypeScript 还会根据 `SearchInputProps` 检查调用方传入的
Ref 是否能连接 `HTMLInputElement`。

### 2. 接收和转交是两个动作

下面的组件能接收 `ref`，却没有把它连接到任何宿主元素：

```tsx
/** 接收 Ref，但没有建立宿主节点连接。 */
function SwallowingInput({ label }: SearchInputProps) {
  return <input aria-label={label} />
}
```

父组件传入的对象 Ref 会保持 `null`，Callback Ref 也收不到输入框。React 不会自动选择组件内部的第一个
节点，也不会按变量名、元素类型或可聚焦能力寻找目标。

完整链路包含四步：

1. 调用方通过 `<SearchInput ref={inputRef}>` 传入 Ref；
2. `SearchInput` 从 props 接收 Ref；
3. `SearchInput` 通过 `<input ref={ref}>` 继续转交；
4. React 在提交宿主节点时连接 Ref。

任一步缺失，调用方都得不到目标节点。

### 3. 多层组件必须逐层转交

Ref 可以穿过多层函数组件，但每一层都要传递同一个接口：

```tsx
type InputRefProps = {
  ref?: Ref<HTMLInputElement>
}

/** 把 Ref 从字段组件继续交给输入框外壳。 */
function SearchField({ ref }: InputRefProps) {
  return <InputShell ref={ref} />
}

/** 把收到的 Ref 最终连接到宿主输入框。 */
function InputShell({ ref }: InputRefProps) {
  return <input ref={ref} aria-label="搜索" />
}
```

如果 `SearchField` 或 `InputShell` 任意一层遗漏 `ref={ref}`，连接就在该层终止。父组件不能跳过中间组件
直接搜索后代 DOM。

### 4. 最终承接者决定 Ref 指向什么

```tsx
/** 向调用方公开输入框。 */
function InputField({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return (
    <div>
      <input ref={ref} />
    </div>
  )
}

/** 向调用方公开包装容器。 */
function FieldBox({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref}>
      <input />
    </div>
  )
}
```

`InputField` 暴露 `HTMLInputElement`，调用方可以使用 `focus()`、`select()` 和输入框属性；`FieldBox`
暴露 `HTMLDivElement`，即使它内部包含输入框，Ref 也不会自动穿透包装层。

宿主目标是组件接口的一部分。重构组件结构时，增加包装层不应顺便改变公开目标；确实要改变目标时，公开
类型和调用方代码也要一起修改。

### 5. Ref 随目标节点接入和失效

对象 Ref 在目标提交前通常为 `null`，React 提交目标节点后把节点写入 `current`。目标因条件分支消失、
宿主元素被替换或组件卸载时，React 再把 `current` 恢复为 `null`。

```tsx
type OptionalInputProps = {
  visible: boolean
  ref?: Ref<HTMLInputElement>
}

/** 只在可见分支中连接输入框 Ref。 */
function OptionalInput({ visible, ref }: OptionalInputProps) {
  if (!visible) return null
  return <input ref={ref} aria-label="可选输入框" />
}
```

组件正确接收并转交 Ref，不代表目标在任何时刻都存在。操作节点时应重新读取 `current` 并处理 `null`，
不要把过去取得的 DOM 对象当成永久有效实例。

## 四、TypeScript 类型

### 1. 用 `Ref<T>` 表达标准 Ref prop

```tsx
import type { Ref } from 'react'

type InputProps = {
  label: string
  ref?: Ref<HTMLInputElement>
}
```

`Ref<HTMLInputElement>` 覆盖以下合法形式：

- Callback Ref，参数是 `HTMLInputElement | null`；
- 对象 Ref，`current` 是 `HTMLInputElement | null`；
- `null`。

属性上的 `?` 还允许调用方完全不传 `ref`，此时组件参数中的值是 `undefined`。可选属性的 `undefined`
描述“没有提供这个 prop”；`Ref<T>` 内的 `null` 描述“Ref 当前没有目标”或显式传空 Ref，两者含义不同。

只声明 `RefObject<HTMLInputElement>` 会拒绝合法的 Callback Ref。组件若承诺接收标准 Ref，应优先使用
`Ref<HTMLInputElement>`。

### 2. 泛型必须对应最终宿主节点

常见宿主节点与 Ref 类型应准确对应：

| 最终宿主元素 | Ref 类型 | 典型 DOM API |
| --- | --- | --- |
| `<input>` | `Ref<HTMLInputElement>` | `focus()`、`select()`、`value` |
| `<textarea>` | `Ref<HTMLTextAreaElement>` | `focus()`、`selectionStart`、`value` |
| `<button>` | `Ref<HTMLButtonElement>` | `focus()`、`click()`、`disabled` |
| `<div>` | `Ref<HTMLDivElement>` | 通用元素与容器 API |

类型由实际承接 `ref` 的宿主元素决定，不由组件名称或调用方愿望决定。用断言把输入框 Ref 强行传给
`<div>` 只会隐藏公开接口与运行值不一致的问题。

### 3. 显式 Ref prop 适合窄接口

组件只公开少量属性时，直接声明接口最清楚：

```tsx
type SearchInputProps = {
  label: string
  disabled?: boolean
  ref?: Ref<HTMLInputElement>
}

/** 只公开搜索输入框需要的窄接口。 */
function SearchInput({ label, disabled = false, ref }: SearchInputProps) {
  return <input aria-label={label} disabled={disabled} ref={ref} />
}
```

调用方只能传入组件明确支持的属性。组件接口小、行为稳定时，这种写法更容易阅读和维护。

### 4. ComponentPropsWithRef 适合原生包装组件

组件若要保留原生 `<input>` 的完整属性，可以继承包含 Ref 的宿主属性类型：

```tsx
import type { ComponentPropsWithRef } from 'react'

type NativeInputProps = ComponentPropsWithRef<'input'> & {
  label: string
}

/** 为原生输入框增加标签，并继续支持它的完整属性和 Ref。 */
function NativeInput({ label, ref, ...inputProps }: NativeInputProps) {
  return (
    <label>
      <span>{label}</span>
      <input {...inputProps} ref={ref} />
    </label>
  )
}
```

`ComponentPropsWithRef<'input'>` 适合薄包装组件；它会同时带入 `value`、`onChange`、`disabled`、
`aria-*` 和 `ref` 等原生属性。若组件并不准备支持完整原生接口，不要为了少写几行类型而扩大公开表面。

## 五、透明转交的运行方式

### 1. 父组件在提交后的事件中使用对象 Ref

```tsx
import { useRef, type Ref } from 'react'

type FocusableInputProps = {
  label: string
  ref?: Ref<HTMLInputElement>
}

/** 把父组件的 Ref 精确转交给搜索输入框。 */
function FocusableInput({ label, ref }: FocusableInputProps) {
  return <input ref={ref} aria-label={label} defaultValue="React 19" />
}

/** 通过子组件转交的 Ref 聚焦真实宿主输入框。 */
export function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null)

  /** 聚焦当前仍然连接的输入框。 */
  function handleFocus() {
    const input = inputRef.current
    if (input === null) return
    input.focus()
  }

  return (
    <form>
      <FocusableInput ref={inputRef} label="搜索词" />
      <button type="button" onClick={handleFocus}>
        聚焦输入框
      </button>
    </form>
  )
}
```

点击事件发生时，当前页面已经提交。处理函数重新读取 `inputRef.current`，确认节点仍存在后再执行
`focus()`。组件函数本身不是 DOM 节点，不会出现在 `current` 中。

### 2. 透明转交同时支持 Callback Ref

子组件把 `ref` 原样写到宿主元素时，不需要识别它是对象还是函数：

```tsx
/** 不检查 Ref 形式，只负责选择并连接目标输入框。 */
function ConnectedInput({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} aria-label="已连接输入框" />
}
```

调用方传入 Callback Ref 时，React 在节点接入时调用 setup。React 19 允许 callback 返回 cleanup；节点
移除或 callback 改变时，React 调用这次 setup 返回的清理函数。

```tsx
const observeInput: Ref<HTMLInputElement> = (node) => {
  if (node === null) return

  node.dataset.connected = 'true'

  return () => {
    delete node.dataset.connected
  }
}

return <ConnectedInput ref={observeInput} />
```

直接使用 `<input ref={ref}>` 会把完整合同交给 React。中间组件通常不应手动调用 Callback Ref；如果
包装函数调用了父 callback 却没有返回它的 cleanup，节点失效时清理合同就会被截断。

### 3. Ref 只连接命令式目标

输入值、禁用状态、是否显示和业务流程仍由 Props、State 与 JSX 表达。Ref 不会触发 render，也不适合
作为 JSX 条件：

```tsx
// 错误：页面输出依赖 React 不跟踪的可变 Ref。
return inputRef.current ? <p>已连接</p> : <p>等待连接</p>
```

需要显示连接检查结果时，应在事件中读取节点，再把有限的普通结果写入 State。不要把 DOM 节点本身保存
进 State，也不要通过 Ref 手动改写 React 正在管理的文本、属性或子节点。

## 六、版本与组件类型边界

### 1. React 18 使用 forwardRef

React 16.3 到 React 18 的标准写法通过 `forwardRef` 接收 Ref。Ref 是 render 函数的第二个参数，不在
普通 props 对象中：

```tsx
import { forwardRef } from 'react'

type LegacyInputProps = {
  label: string
}

/** 在 React 18 中接收并转交输入框 Ref。 */
const LegacyInput = forwardRef<HTMLInputElement, LegacyInputProps>(function LegacyInput(
  { label },
  ref,
) {
  return <input ref={ref} aria-label={label} />
})
```

不能把 React 19 的直接 prop 写法原样放进 React 18。迁移前先确认 React、React DOM 和类型声明的 major
版本。

### 2. React 19 直接接收并逐步迁移

升级到 React 19 后，可以移除 `forwardRef` 包装，把 `ref` 加入 props 类型，再从函数参数直接读取。
调用方的 `<LegacyInput ref={inputRef}>` 和最终宿主 `<input ref={ref}>` 可以保持不变。

React 19 中 `forwardRef` 不再是新函数组件的必要包装，但该 API 尚未删除。现有组件可以逐步迁移，不能
把“不再必要”写成“已经移除”。

使用 React 19 的 ref-as-prop 前，应确保项目启用新的 JSX Transform。

### 3. 类组件 Ref 仍指向实例

传给类组件的标准 Ref 仍表示类实例，不作为普通 prop 进入 `this.props.ref`。React 19 的直接解构结论
针对函数组件，不能无条件套到类组件。

## 七、交互示例

下面的检查台提供成功路径和最小失败对照。先让普通按钮获得焦点，再通过已转交的对象 Ref 聚焦输入框；
随后检查未转交 Ref，确认输入框虽然真实存在，父组件 Ref 仍为 `null`。

:::demo{id="react.core.learn.intermediate.ref-as-prop.transparent-input-ref-demo"}
:::

## 八、易错使用提示

:::pitfalls
### 错误：接收 Ref 后没有逐层转交

**触发条件：** 函数组件声明了 `ref` prop，但当前组件或某个中间组件的 JSX 没有继续传入
`ref={ref}`。

**原因：** React 不会自动选择自定义组件内部的宿主节点，也不会跳过中间组件搜索后代 DOM。

**后果：** 父组件对象 Ref 保持 `null`，Callback Ref 也收不到目标节点。

**错误示例：**

```tsx
/** 错误：接收了 Ref，却没有建立任何连接。 */
function MyInput({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return <input />
}
```

**正确写法：**

```tsx
/** 正确：把收到的 Ref 连接到公开目标。 */
function MyInput({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} />
}
```

**验证方式：** 在提交后的父组件事件中检查对象 Ref；正确转交后 `current` 是目标输入框。

### 错误：目标节点与 Ref 泛型不一致

**触发条件：** 组件公开输入框 Ref，却把 `ref` 放到包装 `<div>`，或用类型断言压过宿主类型错误。

**原因：** 最终承接 `ref` 的宿主元素决定运行实例和 TypeScript 泛型。

**后果：** 调用方得到错误 DOM API，类型提示与运行值不一致。

**错误示例：**

```tsx
<div ref={ref as Ref<HTMLDivElement>}>
  <input />
</div>
```

**正确写法：**

```tsx
<div>
  <input ref={ref} />
</div>
```

**验证方式：** 检查 `document.activeElement` 和节点类型，确认 Ref 指向内部 `<input>`。

### 错误：把标准 Ref prop 限死或截断 Callback cleanup

**触发条件：** prop 只声明 `RefObject<HTMLInputElement>`，或中间组件创建 callback 调用父 Ref，却忽略
callback 返回的 cleanup。

**原因：** 标准 `Ref<T>` 同时包含对象 Ref、Callback Ref 与 `null`；React 19 的 Callback Ref 还可以
返回 cleanup。

**后果：** 合法 Callback Ref 无法通过类型检查，或节点移除后父 callback 建立的资源没有清理。

**错误示例：**

```tsx
type Props = { ref?: RefObject<HTMLInputElement> }

<input ref={(node) => {
  if (typeof ref === 'function') ref(node)
}} />
```

**正确写法：**

```tsx
type Props = { ref?: Ref<HTMLInputElement> }

<input ref={ref} />
```

**验证方式：** 对象 Ref 与返回 cleanup 的 Callback Ref 都能通过类型检查，并由 React 完成连接与清理。

### 错误：在 render 中读取 Ref 或假设节点永远存在

**触发条件：** JSX 根据 `ref.current` 决定输出，或用非空断言长期持有可能已经移除的节点。

**原因：** Ref 连接发生在提交阶段，修改 Ref 不会请求 render；条件隐藏、替换和卸载还会让连接失效。

**后果：** 页面显示陈旧，或命令作用于空值和已经脱离当前界面的旧节点。

**错误示例：**

```tsx
return inputRef.current ? <p>已连接</p> : <p>等待连接</p>
```

**正确写法：**

```tsx
/** 在事件中重新读取当前节点并处理空值。 */
function handleFocus() {
  const input = inputRef.current
  if (input === null) return
  input.focus()
}
```

**验证方式：** 可见 JSX 只依赖 Props 或 State；每次命令式操作都重新读取并判断当前 Ref。

### 错误：混淆 React 18、React 19 与 forwardRef 状态

**触发条件：** 在 React 18 普通函数组件中直接解构标准 `ref`，或宣称 React 19 已经删除
`forwardRef`。

**原因：** 函数组件直接接收标准 Ref 从 React 19 开始；React 18 通过 `forwardRef` 的第二个参数接收。
React 19 只是不再需要该包装，API 仍然存在。

**后果：** 旧版本无法建立预期连接，或把仍可运行的迁移前代码误判为无效。

**错误示例：**

```tsx
// 错误结论：React 18 可直接接收 ref，React 19 已删除 forwardRef。
```

**正确写法：**

```tsx
// React 18 使用 forwardRef；React 19 函数组件可直接接收 ref。
// React 19 中 forwardRef 尚未删除。
```

**验证方式：** 核对项目 React major 和当前 `forwardRef` Reference。

### 错误：把函数组件规则套到类组件

**触发条件：** 期待类组件从 `this.props.ref` 读取调用方传入的标准 Ref。

**原因：** 传给类组件的标准 Ref 仍指向组件实例，不作为普通 prop 传入。

**后果：** 类组件内部读取不到预期值，接口说明与 React 行为不一致。

**错误示例：**

```tsx
// 错误：在类组件中依赖 this.props.ref 取得标准 Ref。
```

**正确写法：**

```tsx
// ref-as-prop 的直接解构只用于 React 19 函数组件。
```

**验证方式：** 对照 React 19 发布说明，确认类组件 Ref 仍保留实例语义。
:::

## 九、官方事实、课程推导与适用判断

### 1. 官方事实

- React 19 函数组件可以从 props 接收标准 Ref。
- 每层组件必须显式转交 Ref，最终宿主元素决定连接结果。
- 对象 Ref 随节点接入和移除在 `null` 与节点之间变化。
- `Ref<T>` 同时覆盖对象 Ref、Callback Ref 和 `null`。
- React 19 的 Callback Ref 可以返回 cleanup，直接转交会保留该合同。
- React 18 使用 `forwardRef`；React 19 中该 API 尚未删除。
- 类组件 Ref 仍指向类实例，不进入普通 props。

### 2. 课程推导

- 把宿主 Ref 视为组件公开接口：调用方依赖的是明确节点及其 DOM API，不是组件内部任意实现细节。
- 透明转交的职责只有两个：选择公开目标，保持 Ref 值和生命周期合同不变。
- 多层封装时，每层使用一致的 Ref 类型，可以让连接中断和宿主类型错误尽早暴露。
- 重构包装结构时保持 Ref 目标不变，可以避免调用方在没有接口变更说明的情况下得到另一种节点。

### 3. 适用场景

- 输入组件向父组件公开真实 `<input>` 或 `<textarea>`，供用户事件聚焦或选择文本；
- 薄包装组件在保留原生属性的同时继续支持宿主 Ref；
- 多层函数组件把同一个 Ref 透明传到最内层交互节点；
- 组件只需公开完整宿主节点，不需要改变 Ref 的值。

### 4. 不适用场景

- 输入值、禁用状态、可见性、校验结果和业务流程，应继续使用 Props、State 与 JSX；
- 页面需要根据某个值重新 render 时，不能把该值只放进 Ref；
- 组件不应该公开内部 DOM 时，不要仅为方便而增加 Ref 接口；
- 需要的不是完整宿主节点时，透明转交无法自动缩小调用方可访问的 DOM API。

## 十、练习

:::exercise
### 练习一：把 Ref 精确转交给编辑区

**要求：** 为包含说明文字和 `<textarea>` 的 React 19 函数组件增加
`ref?: Ref<HTMLTextAreaElement>`，把它逐层转交给 `<textarea>`。父组件增加“聚焦编辑区”按钮。

**验收：** 点击后 `document.activeElement` 是内部 `<textarea>`；把 Ref 移到包装层时 TypeScript 能提示
类型不一致；目标隐藏后父组件对象 Ref 恢复为 `null`。
:::

:::exercise
### 练习二：保留原生输入框属性

**要求：** 使用 `ComponentPropsWithRef<'input'>` 编写薄包装组件，增加 `label`，并把其余原生属性与
Ref 传给内部 `<input>`。

**验收：** 调用方可以传入 `disabled`、`aria-describedby` 和对象 Ref；Ref 最终仍是
`HTMLInputElement`，组件没有手动调用 Callback Ref。
:::

## 十一、本节小结

- React 19 函数组件可以直接接收 `ref` prop，但仍须显式转交。
- Ref 必须逐层穿过组件边界，React 不会自动寻找后代 DOM。
- 最终承接 `ref` 的宿主元素决定 Ref 实例、DOM API 和 TypeScript 泛型。
- `Ref<T>` 支持对象 Ref、Callback Ref 与 `null`；可选属性还允许不传 Ref。
- 对象 Ref 会随目标接入和移除改变，操作前必须重新读取并处理空值。
- 直接转交可以完整保留 React 19 Callback Ref 的 setup 与 cleanup 合同。
- 窄组件显式声明 Ref prop，原生薄包装组件可以使用 `ComponentPropsWithRef`。
- React 18 使用 `forwardRef`；React 19 中它不再必要但尚未删除；类组件仍保留实例 Ref 语义。

## 十二、参考资料

- [React Versions](https://react.dev/versions) - react.dev 当前文档版本口径。
- [React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop) - 函数组件直接接收 Ref 与类组件边界。
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) - 组件之间转交宿主 Ref。
- [Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) - Callback Ref 参数与 cleanup 合同。
- [forwardRef](https://react.dev/reference/react/forwardRef) - React 18 写法与 React 19 迁移状态。
- [useRef](https://react.dev/reference/react/useRef) - 宿主节点接入、移除和 render 纯度边界。
- [Using TypeScript](https://react.dev/learn/typescript) - React 组件 Props 类型。
- [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) - JSX 属性类型检查。
- [`Ref<T>` 与 `ComponentPropsWithRef`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts) - 当前 React 类型声明。
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) - 新 JSX Transform 前提。
