---
id: react.core.learn.intermediate.use-imperative-handle
type: lesson
title: useImperativeHandle
summary: 用类型明确的受限 handle 暴露必要命令，同时隐藏组件内部 DOM 结构。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 100
prerequisites:
  - react.core.learn.intermediate.dom-refs
  - react.core.learn.intermediate.ref-as-prop
related:
  - react.core.learn.intermediate.use-ref
  - react.core.learn.basics.props
  - react.core.learn.basics.state-ownership-and-thinking-in-react
tags:
  - React
  - useImperativeHandle
  - Ref
  - Imperative Handle
  - TypeScript
appliesTo: React 19.2
verifiedAt: 2026-08-18
objectives:
  - 能解释外部 handle Ref 与内部 DOM Ref 的职责差异。
  - 能在 React 19 函数组件中接收 ref prop，并用 useImperativeHandle 返回受限命令对象。
  - 能逐项说明 ref、createHandle、dependencies 和 Hook 返回值的合同。
  - 能用完整依赖保持 handle 方法读取最新 Props 与 State，并判断 handle 身份何时变化。
  - 能用 TypeScript 约束父组件只调用公开命令，不能访问内部 DOM API。
  - 能判断何时使用命令式 handle，何时继续使用 Props、State 和事件回调。
recap:
  - useImperativeHandle 自定义父组件 ref.current 的值，不负责创建 Ref，也不返回 handle。
  - 外部 Ref 指向公开 handle，内部 Ref 指向真实宿主节点，两者不能混成同一个类型。
  - handle 只暴露组件承诺的少量命令，不公开 DOM 节点、内部 Ref 或可变实现细节。
  - createHandle 保持纯净；命令方法才在用户事件等提交后阶段执行 DOM 操作。
  - dependencies 包含工厂读取的全部响应值，并按 Object.is 比较。
  - 依赖不变时可保留当前 handle；依赖变化或省略依赖列表时会创建新 handle。
  - 子组件卸载后对象 Ref 恢复为 null，调用方始终从 current 读取并处理空值。
  - 值、可见性、禁用状态和业务状态继续由 Props 与 State 表达。
  - React 19 函数组件可直接接收 ref prop；旧版本函数组件使用 forwardRef。
sources:
  - title: React useImperativeHandle Reference
    url: https://react.dev/reference/react/useImperativeHandle
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 签名、参数、返回值、依赖比较、React 19 ref prop 与自定义 handle
  - title: Manipulating the DOM with Refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 受限 DOM handle、提交后调用、节点建立与清理边界
  - title: React useRef Reference
    url: https://react.dev/reference/react/useRef
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Ref 的 current、render 读取限制与宿主节点生命周期
  - title: React forwardRef Reference
    url: https://react.dev/reference/react/forwardRef
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - React 19 与旧版本函数组件接收 Ref 的差异
  - title: React 19 ref as a prop
    url: https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
    sourceType: official-reference
    appliesTo: React 19
    claims:
      - React 19 函数组件可以把 ref 作为 prop 接收，Callback Ref 可以返回 cleanup
  - title: React StrictMode Reference
    url: https://react.dev/reference/react/StrictMode
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 开发环境会额外重放 Effect 与 Ref callback 的建立和清理
  - title: React DOM ref callback Reference
    url: https://react.dev/reference/react-dom/components/common#ref-callback
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Callback Ref 的 handle 参数、cleanup 返回值与函数身份边界
  - title: React 19.2.8 Hook 实现
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - handle 创建、对象 Ref 赋值与清理、依赖注册的固定实现旁证
  - title: React 19.2.8 useImperativeHandle 官方测试
    url: https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js
    sourceType: official-test
    appliesTo: React 19.2.8
    claims:
      - 空依赖、省略依赖和指定依赖时的 handle 更新行为
  - title: '@types/react 19.2.18 Ref 类型声明'
    url: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L154-L194
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - RefObject、RefCallback、Ref 与 Callback Ref cleanup 的固定类型合同
  - title: '@types/react 19.2.18 useImperativeHandle 类型签名'
    url: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L1792-L1800
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - Ref 泛型、R extends T、工厂返回值与依赖列表的固定类型合同
---

# useImperativeHandle

## 一、学习目标

- 解释外部 handle Ref 与内部 DOM Ref 的职责差异。
- 在 React 19 函数组件中接收 `ref` prop，并用 `useImperativeHandle` 返回受限命令对象。
- 逐项说明 `ref`、`createHandle`、`dependencies` 和 Hook 返回值的合同。
- 用完整依赖保持 handle 方法读取最新 Props 与 State，并判断 handle 身份何时变化。
- 用 TypeScript 约束父组件只调用公开命令，不能访问内部 DOM API。
- 判断何时使用命令式 handle，何时继续使用 Props、State 和事件回调。

## 二、为什么需要受限 handle

普通 DOM Ref 会把宿主节点直接交给调用方：

```tsx
type SearchFieldProps = {
  ref?: React.Ref<HTMLInputElement>
}

/** 把父组件的 Ref 透明转交给内部输入框。 */
function SearchField({ ref }: SearchFieldProps) {
  return <input ref={ref} aria-label="搜索" />
}
```

父组件得到 `HTMLInputElement` 后，可以调用 `focus()`，也可以读取或修改 `value`、`style`、`className`
和其他 DOM 字段。组件的内部结构因此变成外部依赖：把 `<input>` 换成组合编辑器、增加包装层或改用
其他宿主节点时，调用方可能一起失效。

`useImperativeHandle` 让组件定义 Ref 的公开值。内部仍然可以持有真实 DOM Ref，外部只得到组件明确
承诺的少量命令：

```text
父组件 Ref -> { focus(), selectAll() }
                     |
                     v
子组件内部 Ref -> <input>
```

这不是为了把所有组件都改成命令式 API。React 的默认数据流仍是 Props 向下传、事件向上通知、State
保存可见状态。只有“聚焦内部控件”“选中内部文本”“滚动到内部位置”等难以仅靠声明式数据表达的动作，
才适合进入 handle。

## 三、API 签名与四个角色

### 1. 完整签名

公开调用形式是：

```tsx
useImperativeHandle(ref, createHandle, dependencies?)
```

TypeScript 类型可以概括为：

```tsx
function useImperativeHandle<T, R extends T>(
  ref: React.Ref<T> | undefined,
  createHandle: () => R,
  dependencies?: React.DependencyList,
): void
```

泛型 `T` 是调用方允许看到的 handle 类型，`R` 是工厂实际返回的类型。通常直接让两者相同。

### 2. ref：公开值的出口

第一个参数是父组件传入的 Ref。常见写法是对象 Ref：

```tsx
const searchFieldRef = useRef<SearchFieldHandle>(null)
```

提交完成后，`searchFieldRef.current` 指向自定义 handle；子组件卸载后恢复为 `null`。因此调用方的类型
和空值处理都必须围绕 `SearchFieldHandle | null`，不能仍然按 `HTMLInputElement` 使用。

### 3. createHandle：创建公开值

第二个参数是无参数工厂。它返回什么，父组件的 Ref 就看到什么：

```tsx
useImperativeHandle(ref, () => ({
  /** 聚焦组件内部的主要输入控件。 */
  focus() {
    inputRef.current?.focus()
  },
}))
```

工厂通常返回带方法的对象，也可以返回其他类型。面向组件 API 时，命名清晰的小对象最容易表达
能力边界。

### 4. dependencies：handle 闭包的版本条件

第三个参数列出 `createHandle` 读取的 Props、State、组件内变量和函数。React 用 `Object.is` 比较每一项：

- 依赖都未变化时，保留当前 handle；
- 任一依赖变化时，重新执行工厂并把新 handle 交给 Ref；
- 省略依赖列表时，每次组件重新 render 都会重新执行工厂；
- 依赖列表必须内联书写并保持固定长度。

### 5. 返回值：undefined

`useImperativeHandle` 本身返回 `undefined`。handle 不从 Hook 返回，而是写入第一个参数指定的 Ref：

```tsx
useImperativeHandle(ref, createHandle, dependencies)
// 不要写 const handle = useImperativeHandle(...)
```

## 四、外部 Ref 与内部 Ref 的分工

### 1. 父组件创建 handle Ref

先定义调用方真正需要的能力：

```tsx
export type SearchFieldHandle = {
  /** 聚焦搜索输入框。 */
  focus: () => void
  /** 选中全部搜索文本。 */
  selectAll: () => void
}

const searchFieldRef = useRef<SearchFieldHandle>(null)
```

这个 Ref 的类型不含 `value`、`style` 或 `remove`，TypeScript 会阻止父组件依赖这些 DOM 字段。

### 2. 子组件接收外部 ref prop

React 19 函数组件可以直接从 Props 中取得 `ref`：

```tsx
type SearchFieldProps = {
  label: string
  ref?: React.Ref<SearchFieldHandle>
}

/** 接收父组件 Ref，并向它提供受限的搜索命令。 */
function SearchField({ label, ref }: SearchFieldProps) {
  // ...
}
```

`ref` 虽然进入 Props，但仍是 React 管理的特殊入口。不要把它复制进 State，也不要自行给它赋值。

### 3. 子组件单独创建 DOM Ref

真实节点由另一个 Ref 持有：

```tsx
const inputRef = useRef<HTMLInputElement>(null)

return <input ref={inputRef} aria-label={label} />
```

`inputRef` 只存在于子组件实现内部；外部 `ref` 只交给 `useImperativeHandle`。两个 Ref 的类型、所有者和
用途都不同。

### 4. handle 方法把命令转发给内部节点

```tsx
useImperativeHandle(
  ref,
  () => ({
    /** 聚焦内部输入框。 */
    focus() {
      inputRef.current?.focus()
    },
    /** 全选内部输入框的文本。 */
    selectAll() {
      inputRef.current?.select()
    },
  }),
  [],
)
```

工厂只描述公开接口。真正的 DOM 操作发生在方法被调用时，而不是工厂执行时。

## 五、实现最小受限 handle

### 1. 完整子组件

```tsx
import { useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'

export type TextFieldHandle = {
  /** 聚焦编辑区。 */
  focus: () => void
  /** 全选编辑区文本。 */
  selectAll: () => void
}

type TextFieldProps = {
  label: string
  ref?: Ref<TextFieldHandle>
}

/** 隐藏内部输入框，只向父组件公开两个稳定命令。 */
export function TextField({ label, ref }: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      /** 在节点存在时聚焦输入框。 */
      focus() {
        inputRef.current?.focus()
      },
      /** 在节点存在时全选输入文本。 */
      selectAll() {
        inputRef.current?.select()
      },
    }),
    [],
  )

  return <input ref={inputRef} aria-label={label} />
}
```

工厂没有读取会变化的 Props 或 State，只通过稳定的 `inputRef` 在命令执行时读取当前节点，因此 `[]`
是完整依赖。

### 2. 父组件在事件中调用

```tsx
/** 提供父级按钮，并在用户事件中调用输入组件的公开命令。 */
function SearchPanel() {
  const fieldRef = useRef<TextFieldHandle>(null)

  /** 请求子组件聚焦其主要输入控件。 */
  function handleFocus() {
    fieldRef.current?.focus()
  }

  /** 请求子组件选中全部文本。 */
  function handleSelectAll() {
    fieldRef.current?.selectAll()
  }

  return (
    <section>
      <TextField ref={fieldRef} label="搜索课程" />
      <button type="button" onClick={handleFocus}>聚焦</button>
      <button type="button" onClick={handleSelectAll}>全选</button>
    </section>
  )
}
```

按钮事件发生在界面已经提交之后，适合读取 `ref.current` 并执行命令。

### 3. null 是正常生命周期状态

`current` 可能为 `null`：

- 首次提交完成前；
- 子组件条件渲染为不显示后；
- 子组件已经卸载；
- 外部 Ref 正在从旧实例切换到新实例。

可选链表达“节点当前不可用时不执行”：

```tsx
/** 仅在公开 handle 已建立时发送聚焦命令。 */
function handleFocus() {
  fieldRef.current?.focus()
}
```

若业务必须知道命令是否执行，可让命令返回明确结果，而不是抛出空指针异常。

### 4. 命令可以返回收窄结果

handle 方法可以返回普通值，但仍不应泄漏 DOM 节点：

```tsx
type EditorHandle = {
  /** 全选文本，并返回是否找到内部节点。 */
  selectAll: () => boolean
}

useImperativeHandle(ref, () => ({
  /** 全选文本，并用布尔值报告执行结果。 */
  selectAll() {
    const input = inputRef.current
    if (!input) return false
    input.select()
    return true
  },
}), [])
```

返回 `boolean`、选择范围或组件定义的结果对象仍然是受限合同；返回 `inputRef.current` 则重新泄漏实现。

## 六、设计公开命令合同

### 1. 从调用方需要的动作命名

接口名称应描述组件能力：

- `focus()`：聚焦主要交互点；
- `selectAll()`：选择组件管理的全部文本；
- `scrollToItem(id)`：滚动到组件管理的指定项目；
- `openPicker()`：打开只能通过浏览器命令触发的选择器。

不要用 `getInput()`、`getRootElement()` 或 `domNode` 暴露内部结构。

### 2. 一个命令可以封装多个内部节点

组件内部可以从单个 `<input>` 改为多个字段，公开接口不必变化：

```tsx
type NameEditorHandle = {
  /** 聚焦第一个无效字段。 */
  focusFirstInvalid: () => void
}

useImperativeHandle(ref, () => ({
  /** 根据组件内部校验结果选择需要聚焦的字段。 */
  focusFirstInvalid() {
    if (!firstNameRef.current?.value) {
      firstNameRef.current?.focus()
      return
    }
    lastNameRef.current?.focus()
  },
}), [])
```

父组件依赖“聚焦第一个无效字段”，不依赖内部到底有几个输入框。

### 3. 参数属于单次命令输入

调用时才知道的数据应优先作为方法参数：

```tsx
type ListHandle = {
  /** 滚动到指定业务 ID 对应的内部项目。 */
  scrollToItem: (itemId: string) => void
}
```

这样每次调用都明确传入目标，不必把临时选择复制进子组件 State，也不必为了每个目标重建 handle。

### 4. 不承诺浏览器无法保证的结果

`focus()` 的调用不等于焦点一定成功。节点可能被禁用、隐藏、移出文档，浏览器也可能受用户交互规则
限制。handle 应承诺“请求执行组件管理的动作”，不要声称可以绕过浏览器约束。

### 5. 公开面越小，重构空间越大

父组件只知道两个命令时，子组件可以替换标签层级、宿主节点或内部状态结构。若把整个 DOM 节点暴露，
任何 DOM 字段都可能被调用方依赖，组件就失去封装价值。

## 七、dependencies 与 handle 新鲜度

### 1. 工厂读取的响应值都要登记

下面的命令读取 `label`，因此依赖必须包含它：

```tsx
type LabelHandle = {
  /** 聚焦控件，并返回当前标签。 */
  focusAndReport: () => string
}

useImperativeHandle(
  ref,
  () => ({
    /** 聚焦内部控件，并返回当前 Props 标签。 */
    focusAndReport() {
      inputRef.current?.focus()
      return label
    },
  }),
  [label],
)
```

`label` 改变后，React 创建新 handle。父组件下一次调用会得到新闭包中的标签。

### 2. 漏依赖会保留旧闭包

若上例错误地使用 `[]`，界面可以已经显示新标签，而 `focusAndReport()` 仍返回旧标签。这不是 DOM Ref
失效，而是公开方法捕获了旧 render 的值。

依赖规则与其他 Hook 相同：Props、State、组件内声明的变量和函数，只要被工厂或返回的方法闭包读取，
都属于响应值。

### 3. Object.is 决定依赖是否变化

React 逐项使用 `Object.is` 比较依赖：

```tsx
Object.is('主搜索框', '主搜索框') // true
Object.is({ mode: 'compact' }, { mode: 'compact' }) // false
```

若把每次 render 新建的对象或函数放入依赖，即使内容相同，handle 也会更新。先判断 handle 是否真的需要
捕获该值；若只是单次命令输入，改成方法参数通常更直接。

### 4. []、省略和 [dependency] 的区别

| 写法 | 工厂读取内容 | 重新创建条件 |
| --- | --- | --- |
| `[]` | 只读取稳定 Ref 或模块级值 | 当前挂载实例中依赖不变的 render 保留 handle |
| 省略第三参数 | 可以读取响应值，但没有比较列表 | 每次 re-render 都重新执行工厂 |
| `[label]` | 读取 `label` | `label` 按 `Object.is` 变化时更新 |

省略依赖列表不是“自动推断依赖”。它只是让工厂在每次 re-render 后重新执行，不能替代清晰的依赖合同。

### 5. 不把精确创建次数当业务合同

开发检查、卸载重挂载和 Ref 身份变化都可能增加创建与清理周期。`createHandle` 必须纯净，应用只依赖
“当前 Ref 最终指向当前 handle”，不依赖工厂恰好执行一次。

## 八、handle 的建立、更新与清理

### 1. render 期间不能依赖 current

组件函数执行时，当前 render 尚未提交。不要用 `ref.current` 决定 JSX：

```tsx
// 错误：Ref 改变不会触发 render，且当前节点可能尚未提交。
const status = fieldRef.current ? '已连接' : '未连接'
```

可见状态应来自 Props 或 State。Ref 用于提交后的事件、Effect 或其他命令式入口。

### 2. 提交后父组件可以调用 handle

DOM 节点和自定义 handle 都在提交后可供事件读取：

```tsx
/** 在用户点击后调用已经提交的子组件 handle。 */
function handleEdit() {
  editorRef.current?.focus()
}
```

事件处理器不要把 `current` 提前复制到 render 变量中。

### 3. 依赖变化会替换公开值

当依赖变化时，React 重新执行 `createHandle`，并让外部 Ref 指向新的返回值。调用方若需要比较身份，
应在事件等提交后阶段读取两次 `current` 并用 `Object.is` 比较，而不是从 render 次数推测。

### 4. 卸载后对象 Ref 恢复为 null

```tsx
{showEditor ? <TextField ref={editorRef} label="正文" /> : null}
```

`showEditor` 变为 `false` 并完成提交后，`editorRef.current` 不再公开旧 handle。父组件再次调用时应先处理
`null`。

### 5. Callback Ref 的建立与 cleanup

第一个参数也可以是 Callback Ref。React 把当前 handle 传给 callback；React 19 允许 callback 返回
cleanup：

```tsx
const handleRegistry = new Set<EditorHandle>()

/** 记录当前 handle，并在连接失效时清除外部登记。 */
function connectHandle(handle: EditorHandle | null): (() => void) | void {
  if (!handle) return
  handleRegistry.add(handle)

  return () => {
    handleRegistry.delete(handle)
  }
}

<Editor ref={connectHandle} />
```

Callback Ref 的函数身份变化也会引起旧连接清理和新连接建立。普通父组件只需调用命令时，对象 Ref 更
直接；只有确实需要连接/释放逻辑时才使用 Callback Ref。`createHandle` 返回的是公开 handle，不返回
cleanup；不要混淆两个函数的返回值。Callback Ref 返回 cleanup 时，React 在断开连接时调用该 cleanup；
未返回 cleanup 的兼容写法会收到 `null`。

### 6. Strict Mode 要求建立与清理可重放

Strict Mode 会在开发环境额外检查 Effect 与 Ref callback 的建立/清理。应用不能依赖工厂、Callback
Ref 或 cleanup 的固定调用次数，也不能在 `createHandle` 中做不可重复的外部写入。

应依赖的结果是：当前提交完成后，外部 Ref 对应当前 handle；清理完成后，旧 handle 不再通过 Ref 暴露。

### 7. 不缓存脱离 Ref 的旧 handle

```tsx
// 错误：旧对象可能已经对应卸载实例或旧依赖。
const cachedHandle = editorRef.current
```

不要把 handle 保存到模块变量、State 或长期闭包中。需要调用时读取 `editorRef.current`，才能得到当前
挂载实例和当前依赖对应的对象。

## 九、命令式动作与声明式数据

### 1. 适合 handle 的内容

handle 适合少量、瞬时、面向组件能力的动作：

- 聚焦、全选或恢复选择；
- 滚动到组件内部的指定目标；
- 调用浏览器要求由用户操作触发的原生命令；
- 让复杂组件执行无法自然写成普通 Props 的一次性操作。

### 2. 继续使用 Props 与 State 的内容

| 需求 | 首选表达 |
| --- | --- |
| 输入值 | `value` 与 `onChange` |
| 是否打开 | `open` Prop 或父级 State |
| 是否禁用 | `disabled` Prop |
| 当前选中项 | 受控 State 与事件回调 |
| 校验错误 | 数据模型、Props 或 State |
| 提交结果 | Action/事件结果与 State |

这些都是持续影响界面的数据，不应藏在命令对象中。

### 3. setValue 通常是错误信号

若公开 `handle.setValue(next)`，父组件无法从 JSX 看出输入值来源，也难以统一重置、校验和提交。优先写：

```tsx
<SearchField value={query} onChange={setQuery} />
```

handle 只保留 `focus()` 等无法由 `value` 描述的动作。

### 4. 查询数据优先走回调或 State

不要为了读取表单值而公开 `getValue()`。React 表单通常在 `onChange` 中同步所需值，或在提交时从
`FormData` 读取。命令式 getter 会绕开正常数据流，并让调用方依赖组件内部存储方式。

## 十、React 19 与旧版本接收方式

### 1. React 19 直接接收 ref prop

```tsx
type EditorProps = {
  ref?: React.Ref<EditorHandle>
}

/** 使用 React 19 的 ref prop 定义公开 handle。 */
function Editor({ ref }: EditorProps) {
  useImperativeHandle(ref, () => ({
    /** 聚焦编辑器的主要控件。 */
    focus() {
      // ...
    },
  }), [])

  return <div />
}
```

这是 React 19 的主写法，不需要额外的 `forwardRef` 包装。

### 2. React 18 及更早版本使用 forwardRef

旧版本函数组件不能把标准 Ref 当普通 prop 接收，需要通过 `forwardRef` 的第二个参数取得：

```tsx
/** 使用旧版本兼容入口接收父组件 Ref。 */
const LegacyEditor = forwardRef<EditorHandle, LegacyEditorProps>(function LegacyEditor(props, ref) {
  useImperativeHandle(ref, () => ({
    /** 聚焦旧版本编辑器的主要控件。 */
    focus() {
      // ...
    },
  }), [])

  return <div>{props.label}</div>
})
```

这里只需要识别版本差异。当前 React 19 代码不要为了旧习惯继续增加无必要包装。

### 3. forwardRef 仍然存在

React 19 文档说明 `forwardRef` 已不再必要，未来版本会弃用；它不是在 React 19 中立即删除。阅读旧库
源码时仍会遇到它，不能把“新代码不需要”误写成“运行时已经没有这个 API”。

### 4. 类组件 Ref 不是普通 ref prop

React 19 的 `ref` prop 改进面向函数组件。类组件 Ref 仍用于取得类实例，不应把函数组件的直接解构
规则机械套到类组件上。

## 十一、TypeScript 类型建模

### 1. handle 类型只列公开能力

```tsx
export type DialogHandle = {
  /** 聚焦对话框中的首个可操作元素。 */
  focusFirstControl: () => void
  /** 把焦点恢复到打开对话框的控件。 */
  restoreFocus: () => void
}
```

不要 `extends HTMLDivElement`，也不要把 `RefObject<HTMLElement>` 放进公开类型。

### 2. 子组件 Prop 使用 `Ref<Handle>`

```tsx
type DialogProps = {
  ref?: React.Ref<DialogHandle>
  open: boolean
}
```

`Ref<DialogHandle>` 可以接收对象 Ref 或 Callback Ref。`undefined` 允许调用方不传 Ref。

### 3. 父组件对象 Ref 从 null 开始

```tsx
const dialogRef = useRef<DialogHandle>(null)
```

类型系统因此要求调用时处理 `null`：

```tsx
dialogRef.current?.focusFirstControl()
```

### 4. 内部节点保持具体 DOM 类型

```tsx
const firstButtonRef = useRef<HTMLButtonElement>(null)
```

公开 `DialogHandle` 与私有 `HTMLButtonElement` 并存，不需要把两者联合成一个宽类型。

### 5. 类型错误能证明边界

父组件持有 `RefObject<DialogHandle | null>` 后，下面的 DOM 访问应被 TypeScript 拒绝：

```tsx
dialogRef.current?.style.setProperty('color', 'red')
```

这不是缺少类型断言，而是封装正在生效。若调用方确实需要新的组件能力，应给 handle 增加语义明确的
命令，而不是强制转换成 DOM 类型。

## 十二、焦点命令与可访问性

### 1. 命令必须对应明确的用户目的

合理场景包括：提交失败后聚焦第一个错误字段、打开面板后聚焦主要控件、关闭临时界面后恢复焦点。
不要在每次 render 或普通数据变化时无条件抢夺焦点。

### 2. 内部控件仍要有可读名称

`focus()` 只改变焦点，不会补上标签。输入框仍需 `<label>`、`aria-label` 或其他正确名称；错误字段还需
可理解的错误信息与关联。

### 3. 不聚焦隐藏或禁用节点

命令执行前应由组件自己的状态确保目标可交互。对 `hidden`、`display: none` 或 `disabled` 节点调用
`focus()` 不会形成可靠用户体验。

### 4. 保留可见焦点样式

受限 handle 不应通过内部实现移除焦点轮廓。键盘用户需要明确看到命令把焦点移到了哪里。

### 5. 谨慎处理自动聚焦

用户触发按钮后调用 handle 通常可预测；页面加载或背景更新时自动聚焦可能让屏幕阅读器上下文突然
改变。能用自然文档顺序完成的交互，不要额外移动焦点。

## 十三、完整 Demo

下面的 Demo 同时观察四个合同：

1. 父组件只能看到 `focus` 与 `selectAll`，handle 不是 `HTMLInputElement`。
2. 切换 `label` 后，`[label]` 依赖让命令读取新标签，并产生新的 handle 对象。
3. 只更新无关外壳 State 时，依赖不变，handle 与上次记录为同一对象。
4. 子组件卸载后公开 Ref 变为 `null`，重新挂载后建立新 handle。

先点击“记录当前 handle”，再分别执行“只更新外壳”和“切换 label 依赖”，每次提交后再次记录即可比较
身份。`focus` 与 `selectAll` 返回的是收窄证据，不会把内部节点交给父组件。

:::demo{id="react.core.learn.intermediate.use-imperative-handle.restricted-input-handle-demo"}
:::

## 十四、易错使用提示

:::pitfalls
### 错误：把完整 DOM 节点作为 handle 返回

**触发条件：** `createHandle` 直接返回 `inputRef.current`，或把内部 Ref 放进公开对象。

**原因：** 外部仍能访问全部 DOM API，没有形成组件能力边界。

**后果：** 父组件依赖内部标签、字段和样式，子组件更换结构时需要同步修改调用方。

**错误示例：**

```tsx
useImperativeHandle(ref, () => inputRef.current, [])
```

**正确写法：**

```tsx
useImperativeHandle(ref, () => ({
  /** 聚焦仍由子组件持有的输入框。 */
  focus() {
    inputRef.current?.focus()
  },
}), [])
```

**验证方式：** 检查 `Object.keys(ref.current)` 只含承诺的命令，且对象不是 `HTMLElement` 实例。

### 错误：用 handle 保存持续业务状态

**触发条件：** 使用 `setValue`、`setOpen` 或 `setDisabled` 命令代替 Props 与 State。

**原因：** 持续状态被藏在命令式调用中，JSX 无法显示当前事实源。

**后果：** 父子组件容易各保存一份值，重置、校验和提交结果不一致。

**错误示例：**

```tsx
/** 通过命令绕开输入值的声明式所有权。 */
function handleFill() {
  fieldRef.current?.setValue('React')
}
```

**正确写法：**

```tsx
<SearchField value={query} onChange={setQuery} />
```

**验证方式：** 从父组件 Props 与 State 可以追踪值、可见性和禁用状态；handle 只保留瞬时动作。

### 错误：dependencies 漏掉响应值

**触发条件：** handle 方法读取变化的 `label`，却传入 `[]`。

**原因：** 依赖未变化时 React 保留旧 handle，方法闭包仍指向旧 render 的 `label`。

**后果：** 页面显示新标签，父组件调用命令却得到旧标签或旧配置。

**错误示例：**

```tsx
useImperativeHandle(ref, () => ({
  /** 错误：读取了未登记的 label。 */
  getLabel() {
    return label
  },
}), [])
```

**正确写法：**

```tsx
useImperativeHandle(ref, () => ({
  /** 返回当前 render 对应的 label。 */
  getLabel() {
    return label
  },
}), [label])
```

**验证方式：** 更新 `label` 后调用命令，确认结果为新值；Hook lint 也应报告缺失依赖。

### 错误：在 createHandle 中执行副作用

**触发条件：** 工厂注册监听器、修改 State、调用 DOM 方法或写外部变量。

**原因：** 工厂负责创建公开值，不承诺只执行一次；开发检查和生命周期更新可能重复创建与清理。

**后果：** 出现重复监听、焦点抢夺、无限更新或难以对称清理的资源。

**错误示例：**

```tsx
useImperativeHandle(ref, () => {
  inputRef.current?.focus()
  return { focus: () => inputRef.current?.focus() }
}, [])
```

**正确写法：**

```tsx
useImperativeHandle(ref, () => ({
  /** 只在调用命令时执行 DOM 操作。 */
  focus() {
    inputRef.current?.focus()
  },
}), [])
```

**验证方式：** 工厂体只创建并返回值；重复 render 不应自动移动焦点或产生外部写入。

### 错误：在 render 中读取或调用 handle

**触发条件：** 用 `ref.current` 决定 JSX，或在组件函数执行时直接调用命令。

**原因：** render 发生在提交之前，Ref 不是响应式输入，`current` 改变也不会触发 render。

**后果：** 读取到 `null` 或旧对象，并让渲染结果依赖 React 无法跟踪的可变值。

**错误示例：**

```tsx
const canFocus = fieldRef.current !== null
fieldRef.current?.focus()
```

**正确写法：**

```tsx
/** 在提交后的用户事件中调用当前 handle。 */
function handleFocus() {
  fieldRef.current?.focus()
}
```

**验证方式：** JSX 只读取 Props 与 State；所有 handle 调用都位于事件或其他提交后入口。

### 错误：外部 Ref 仍声明为 DOM 类型

**触发条件：** 子组件返回 `{ focus, selectAll }`，父组件却使用 `useRef<HTMLInputElement>(null)`。

**原因：** 外部 Ref 的值已经被自定义 handle 替换，不再是内部节点。

**后果：** 类型断言掩盖真实合同，调用方可能访问并不存在的 DOM 字段。

**错误示例：**

```tsx
const fieldRef = useRef<HTMLInputElement>(null)
<TextField ref={fieldRef} />
```

**正确写法：**

```tsx
const fieldRef = useRef<TextFieldHandle>(null)
<TextField ref={fieldRef} />
```

**验证方式：** 父级、子级 Prop 和 `createHandle` 返回值都使用同一个公开 handle 类型。

### 错误：把对象直接作为第二个参数

**触发条件：** 先创建对象，再写 `useImperativeHandle(ref, handle, [])`。

**原因：** 第二个参数必须是 React 可在需要时调用的无参数工厂。

**后果：** TypeScript 拒绝参数；绕过类型后运行时也无法把对象当函数执行。

**错误示例：**

```tsx
const handle = { focus: () => inputRef.current?.focus() }
useImperativeHandle(ref, handle, [])
```

**正确写法：**

```tsx
useImperativeHandle(ref, () => ({
  /** 聚焦内部输入框。 */
  focus() {
    inputRef.current?.focus()
  },
}), [])
```

**验证方式：** 保留 TypeScript 检查，并确认第二个参数形状为 `() => Handle`。

### 错误：缓存旧 handle 后长期调用

**触发条件：** 把 `ref.current` 保存到 State、模块变量或长生命周期闭包中。

**原因：** 依赖变化、Ref 变化或重新挂载都可能替换 handle；旧对象不代表当前实例。

**后果：** 调用旧闭包、操作已卸载组件，或读取过期 Props。

**错误示例：**

```tsx
const savedHandle = fieldRef.current

/** 稍后调用可能已经过期的对象。 */
function handleLater() {
  savedHandle?.focus()
}
```

**正确写法：**

```tsx
/** 每次事件都读取当前挂载实例的 handle。 */
function handleLater() {
  fieldRef.current?.focus()
}
```

**验证方式：** 卸载并重新挂载子组件后，命令从当前 `ref.current` 读取，不再持有旧对象。

### 错误：混淆 React 18 与 React 19 的接收方式

**触发条件：** 把 React 19 的直接 `ref` prop 写法描述成旧版本通用能力，或声称 React 19 已删除
`forwardRef`。

**原因：** 函数组件直接接收标准 Ref 是 React 19 的变化；旧版本仍需 `forwardRef`。

**后果：** 同一代码在旧版本无法取得 Ref，版本迁移说明也会误导调用方。

**错误示例：**

```tsx
/** 错误地把 React 19 写法当成 React 18 通用写法。 */
function LegacyField({ ref }: { ref?: React.Ref<FieldHandle> }) {
  return <input />
}
```

**正确写法：**

```tsx
/** 在旧版本中通过 forwardRef 的参数取得 Ref。 */
const LegacyField = forwardRef<FieldHandle, FieldProps>(function LegacyField(props, ref) {
  return <FieldBody {...props} ref={ref} />
})
```

**验证方式：** 先核对 React major；React 19 使用直接 `ref` prop，旧版本函数组件使用 `forwardRef`。
:::

## 十五、源码推导与适用场景

### 1. 官方实现事实

固定 React `19.2.8` 实现会调用 `createHandle`，把返回值交给对象 Ref 或 Callback Ref，并在对应清理
路径中撤销公开值。内部还把外部 Ref 与用户依赖共同纳入更新判断。

这些事实解释了三个可观察结果：

1. 父组件看到的是工厂返回值，而不是内部 DOM Ref。
2. 依赖变化或外部 Ref 变化时，公开 handle 需要更新。
3. 对象 Ref 在卸载后不再指向旧 handle。

内部函数名、Fiber flag 和精确提交子阶段不是公开 API，不应成为应用判断条件。

### 2. 官方测试事实

固定官方测试覆盖三种依赖行为：

- `[]` 会让 handle 方法保留首次闭包值；
- 省略依赖列表时，组件 re-render 后会得到新闭包值；
- 指定 `[value]` 时，值变化会更新 handle，值不变的普通 render 不重复创建。

因此 dependencies 不是性能装饰，而是公开方法读取哪一版响应值的正确性合同。

### 3. 适合使用的场景

- 设计系统中的输入、编辑器、选择器向父级开放少量焦点命令；
- 复合组件隐藏多个内部节点，却提供稳定的滚动或选择动作；
- 第三方命令式控件需要由组件包装成更窄的 React 接口；
- 父级必须在用户事件中触发浏览器原生命令。

### 4. 不适合使用的场景

- 只需传递值、布尔状态或配置；
- 只需通过事件回调通知父组件；
- 想绕过受控组件数据流直接改内部值；
- 想让父组件读取子组件全部 DOM 或内部 State；
- 仅为了减少 Props 数量而创建命令对象。

### 5. 组件库的接口边界

组件库可以导出 `Handle` 类型作为公共 API，但应把内部 DOM Ref、宿主节点选择和实现辅助类型留在模块
内部。修改 handle 方法名或语义属于公开接口变更；替换内部 DOM 结构不应影响调用方。

## 十六、练习

:::exercise
### 1. 实现受限文本域 handle

**要求：** 创建 `TextAreaHandle`，只公开 `focus()` 与 `selectAll()`。子组件在 React 19 中直接接收
`ref?: Ref<TextAreaHandle>`，内部使用独立的 `useRef<HTMLTextAreaElement>(null)`。

**验收：** 两个父级按钮能执行命令；`Object.keys(ref.current)` 只有两个方法；父级类型不能访问
`value`、`style` 或 `selectionStart`。
:::

:::exercise
### 2. 修复过期依赖

**要求：** 给 handle 增加 `focusAndReport(): string`，返回当前 `label`。先故意使用 `[]` 观察旧值，再把 `label`
加入依赖。

**验收：** 更新标签并提交后，命令返回新标签；只更新无关 State 时，记录到的 handle 引用保持
`Object.is` 相等。
:::

:::exercise
### 3. 把命令式值更新改回声明式数据

**要求：** 从一个含 `setValue(next)`、`setDisabled(value)` 和 `focus()` 的 handle 开始重构。将值和禁用状态改为
Props 与 State，只保留 `focus()`。

**验收：** JSX 能直接看出值与禁用状态的所有者；重置 State 会更新输入框；handle 不再含 setter。
:::

:::exercise
### 4. 验证卸载清理

**要求：** 用复选框控制子组件是否挂载。挂载时调用 `focus()`，卸载后再通过按钮检查 `ref.current`，随后重新挂载。

**验收：** 卸载后读取到 `null` 且命令不抛错；重新挂载后得到新的 handle，并能再次聚焦。
:::

:::exercise
### 5. 设计复合编辑器命令

**要求：** 组件内部包含标题和正文两个字段，只公开 `focusFirstEmpty()`。命令根据内部字段值聚焦第一个空字段，
父组件不知道具体 DOM 节点。

**验收：** 标题为空时聚焦标题，标题非空且正文为空时聚焦正文；公开类型不含任何元素 Ref。
:::

## 十七、本节小结

- `useImperativeHandle` 自定义父组件 Ref 的公开值，Hook 自身返回 `undefined`。
- 外部 handle Ref 与内部 DOM Ref 是两条不同边界，类型和所有者不能混用。
- handle 只暴露少量语义命令，不暴露 DOM 节点、内部 Ref 或持续业务状态。
- `createHandle` 保持纯净，DOM 动作放在返回的方法中执行。
- dependencies 决定方法闭包何时更新，比较规则是 `Object.is`。
- `[]` 只适用于不读取变化值的工厂；省略依赖列表会在每次 re-render 后重建 handle。
- 调用方在事件等提交后阶段读取当前 `ref.current`，并把 `null` 当正常生命周期状态。
- 依赖变化会替换 handle，卸载会清空对象 Ref，不要长期缓存旧对象。
- 值、可见性、禁用状态和业务事实继续用 Props、State 与事件表达。
- React 19 函数组件直接接收 `ref` prop；旧版本函数组件仍使用 `forwardRef`。

## 十八、参考资料

- [React `useImperativeHandle` Reference](https://react.dev/reference/react/useImperativeHandle) - 签名、参数、
  依赖、返回值、自定义 handle 与 React 19 `ref` prop。
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) - 受限 DOM
  handle、提交后操作、节点建立与清理。
- [React `useRef` Reference](https://react.dev/reference/react/useRef) - `current` 的生命周期与 render 读取
  限制。
- [React `forwardRef` Reference](https://react.dev/reference/react/forwardRef) - React 19 与旧版本函数组件
  接收 Ref 的区别。
- [React 19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop) - 函数组件直接接收
  `ref` 以及 Callback Ref cleanup 的版本事实。
- [React `<StrictMode>` Reference](https://react.dev/reference/react/StrictMode) - 开发环境额外进行 Effect
  与 Ref callback 建立/清理检查。
- [React DOM Ref callback Reference](https://react.dev/reference/react-dom/components/common#ref-callback) -
  Callback Ref 的参数、cleanup 返回值与函数身份边界。
- [React 19.2.8 `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js) - handle 创建、赋值、清理与依赖注册的固定实现旁证。
- [React 19.2.8 `ReactHooksWithNoopRenderer-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js) - 空依赖、省略依赖与指定依赖的官方测试。
- [`@types/react@19.2.18` Ref 类型声明](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L154-L194) - `RefObject`、`RefCallback`、`Ref` 与 Callback Ref cleanup 的固定类型合同。
- [`@types/react@19.2.18` `useImperativeHandle` 类型签名](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L1792-L1800) - `Ref<T>`、`R extends T`、工厂返回值与依赖列表的固定类型合同。
