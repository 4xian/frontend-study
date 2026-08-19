# ref 作为 prop 官方调研

## 调研结论

- 核验日期：`2026-08-16`
- 官方文档基线：React `19.2`（[React Versions](https://react.dev/versions)）
- 仓库依赖快照：React / React DOM `19.2.8`
- React 类型快照：`@types/react@19.2.18`
- React 官方文档源码快照：`383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`
- React 类型源码快照：`a414786ca9309a76c8a35fe249dab28668a69b79`

React 19 允许函数组件直接从 props 接收 `ref`。组件只有把收到的 Ref 明确转交给某个宿主元素或另一个
能够接收 Ref 的组件，调用方才能取得最终目标。React 不会替自定义组件猜测应该暴露哪个 DOM 节点。

React 19.2 官方资料与当前类型声明支持以下结论：

1. 函数组件可以把 `ref` 写进 props 类型并直接解构，不再需要为了接收 Ref 而套一层 `forwardRef`。
   来源：[React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)、
   [`useRef`：向自定义组件传递 Ref](https://react.dev/reference/react/useRef#i-cant-get-a-ref-to-a-custom-component)。
2. `ref` 进入函数组件不等于已经连接节点；每一层组件都必须显式转交，最终宿主元素才决定 Ref 指向的
   DOM 类型和实例。来源：[Manipulating the DOM with Refs：访问其他组件的 DOM 节点](https://react.dev/learn/manipulating-the-dom-with-refs#accessing-another-components-dom-nodes)、
   [`forwardRef` Troubleshooting](https://react.dev/reference/react/forwardRef#my-component-is-wrapped-in-forwardref-but-the-ref-to-it-is-always-null)。
3. 把 Ref 放到 `<input>` 会暴露 `HTMLInputElement`；放到包装 `<div>` 会暴露 `HTMLDivElement`。暴露目标
   是组件接口的一部分，类型必须与实际宿主节点一致。来源：[React DOM Common components：ref](https://react.dev/reference/react-dom/components/common#ref)、
   [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。
4. 对象 Ref 在宿主节点提交后取得节点，节点移除后恢复为 `null`。条件渲染、节点替换和组件卸载都会
   使旧连接失效。来源：[`useRef`：Manipulating the DOM with a ref](https://react.dev/reference/react/useRef#manipulating-the-dom-with-a-ref)。
5. Callback Ref 被原样转交到宿主元素后，React 负责执行 setup 与 cleanup。React 19 会在节点移除或
   callback 改变时调用先前返回的 cleanup；没有 cleanup 时仍保留以 `null` 调用的兼容行为。来源：
   [Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)、
   [React v19：Cleanup functions for refs](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)。
6. TypeScript 中，显式接收 Ref 的通用类型是 `Ref<T>`，不是只覆盖对象 Ref 的 `RefObject<T>`。当前类型
   源码把 `Ref<T>` 定义为 Callback Ref、`RefObject<T | null>` 或 `null` 的联合。来源：
   [React TypeScript 指南](https://react.dev/learn/typescript)、
   [`@types/react@19.2.18` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L176-L194)。
7. 单一 Ref prop 可写成 `ref?: Ref<HTMLInputElement>`；包装原生输入框并继承其全部属性时，可使用
   `ComponentPropsWithRef<'input'>`。来源：[TypeScript JSX Handbook：属性类型检查](https://www.typescriptlang.org/docs/handbook/jsx.html#attribute-type-checking)、
   [`ComponentPropsWithRef` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L1460-L1485)。
8. React 18 及更早的现代写法通过 `forwardRef` 接收标准 `ref` 属性；升级到 React 19 后可以迁移为直接
   prop。React 19 中 `forwardRef` 仍存在，只是不再必要，官方说明未来会废弃。来源：
   [`forwardRef`](https://react.dev/reference/react/forwardRef)、
   [React v16.3.0：forwardRef API](https://legacy.reactjs.org/blog/2018/03/29/react-v-16-3.html#forwardref-api)。
9. 传给类组件的 Ref 仍表示类实例，不作为普通 prop 传入。ref-as-prop 的直接解构语法不能无条件套用
   到类组件。来源：[React v19：ref as a prop 的类组件说明](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)。
10. React 19 要求项目使用新的 JSX Transform，ref-as-prop 也以此为运行前提。来源：
    [React 19 Upgrade Guide：New JSX Transform is now required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#new-jsx-transform-is-now-required)。

## 调研范围

### 需要回答

1. React 19 函数组件如何直接接收 `ref` prop？
2. 自定义组件怎样把 Ref 转交到明确的宿主 DOM 节点？
3. 为什么“接收 Ref”和“暴露节点”是两个步骤？
4. 多层组件边界如何保持 Ref 链路连续？
5. 暴露包装节点与暴露真实交互节点有什么区别？
6. 对象 Ref 在节点接入、移除、替换和卸载时怎样变化？
7. 透明转交怎样保留 Callback Ref 的 setup 与 cleanup 合同？
8. TypeScript 怎样表达对象 Ref、Callback Ref、`null` 和未传入状态？
9. `Ref<T>` 与 `ComponentPropsWithRef<'input'>` 分别适合什么场景？
10. React 18 及更早的 `forwardRef` 代码怎样迁移到 React 19？
11. 使用 React 19 的 ref-as-prop 前需要满足什么 JSX Transform 前提？

### 不展开

- 不使用或讲解 `useImperativeHandle`，不设计自定义命令式句柄。
- 不讲 Portal、Effect、`useLayoutEffect`、布局测量或同步时机。
- 不设计 Ref 合并、Ref 数组、动态节点集合或节点 `Map`。
- 不讨论 HOC、泛型多态组件、`as` prop、第三方组件库和跨 major 库发布策略。
- 不让 Ref 驱动 JSX，不把 DOM 节点写入 State 或 Context。
- 不延伸到组件封装后的其他命令式能力。

## 官方来源与核验方法

外部搜索先按规范调用 Tavily，并限制 React、TypeScript 官方域名；Tavily 因当前账户配额耗尽返回
`usage limit`。随后按顺位使用 Exa 发现候选 URL，再直接读取 canonical 页面。搜索摘要只用于定位来源，
不支撑下文结论。

React 公共行为以 canonical 文档为准，并用 `reactjs/react.dev` 固定提交
`383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`核对当前文档快照。TypeScript 写法同时核对官方 JSX
Handbook、React 官方 TypeScript 指南和仓库实际安装的 `@types/react@19.2.18`。本地
`node_modules/@types/react/index.d.ts` 的 Git blob 为 `fb9e4ceeb0e175c5db3e7be3f798285a94585125`，与
DefinitelyTyped 固定提交 `a414786ca9309a76c8a35fe249dab28668a69b79` 中的同一文件一致。

| 官方来源 | 采用事实 |
| --- | --- |
| [React Versions](https://react.dev/versions) | react.dev 当前文档基线为 React 19.2 |
| [React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop) | 函数组件直接接收 Ref、`forwardRef` 的未来废弃方向、类组件例外 |
| [`useRef`](https://react.dev/reference/react/useRef) | 自定义组件转交、对象 Ref 的节点接入与移除 |
| [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) | 父组件到函数组件再到宿主节点的完整链路 |
| [`forwardRef`](https://react.dev/reference/react/forwardRef) | React 19 与旧版本边界、遗漏转交的结果 |
| [Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback) | Callback Ref 的参数、cleanup、callback 更换和 `null` 兼容路径 |
| [React v19：Cleanup functions for refs](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs) | React 19 新增 callback cleanup 与未来兼容边界 |
| [React 19 Upgrade Guide：ref cleanup required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required) | Callback Ref 返回值的 TypeScript 限制 |
| [React 19 Upgrade Guide：New JSX Transform is now required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#new-jsx-transform-is-now-required) | React 19 要求使用新的 JSX Transform |
| [React TypeScript 指南](https://react.dev/learn/typescript) | React 项目使用 `@types/react`、函数组件 props 类型 |
| [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html) | 函数组件 JSX 属性由 props 参数类型检查 |
| [`@types/react@19.2.18` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts) | `Ref<T>`、`RefCallback<T>`、`ComponentPropsWithRef<T>` 的精确类型 |
| [React v16.3.0](https://legacy.reactjs.org/blog/2018/03/29/react-v-16-3.html#forwardref-api) | `forwardRef` 的引入版本和旧写法 |

未采用社区教程、问答、第三方类型速查表或搜索摘要。公共文档已经定义这里需要的行为，不把 React 内部
Fiber 字段、提交函数名或未公开顺序写成应用合同。

## React 19 函数组件直接接收 Ref

### 1. `ref` 进入 props

React 19 函数组件可以像读取其他 prop 一样，在参数中读取 `ref`：

```tsx
import type { Ref } from 'react'

type SearchInputProps = {
  label: string
  ref?: Ref<HTMLInputElement>
}

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

这里有两个独立动作：

1. `<SearchInput ref={inputRef}>` 把 Ref 交给函数组件。
2. `<input ref={ref}>` 把同一个 Ref 连接到宿主输入框。

只完成第一步时，Ref 不会自动连接内部任何节点。

来源：[React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)、
[`useRef` Troubleshooting](https://react.dev/reference/react/useRef#i-cant-get-a-ref-to-a-custom-component)。

### 2. Ref 不是自动穿透机制

自定义组件可能返回一个节点、多个节点、条件分支或另一个组件。React 无法从这些结构推断调用方需要
哪一个目标，因此每层边界都要明确转交：

```tsx
type FieldProps = {
  ref?: Ref<HTMLInputElement>
}

function Field({ ref }: FieldProps) {
  return <InputShell ref={ref} />
}

function InputShell({ ref }: FieldProps) {
  return <input ref={ref} />
}
```

如果 `Field` 或 `InputShell` 中任意一层遗漏 `ref={ref}`，链路就在该层终止。父组件不会跳过这一层搜索
后代 DOM。

来源：[Manipulating the DOM with Refs：访问其他组件的 DOM 节点](https://react.dev/learn/manipulating-the-dom-with-refs#accessing-another-components-dom-nodes)、
[`forwardRef` Troubleshooting](https://react.dev/reference/react/forwardRef#my-component-is-wrapped-in-forwardref-but-the-ref-to-it-is-always-null)。

### 3. 最终承接者决定 Ref 的值

下面两个组件暴露的是不同节点：

```tsx
function InputField({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return (
    <div>
      <input ref={ref} />
    </div>
  )
}

function FieldBox({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref}>
      <input />
    </div>
  )
}
```

`InputField` 暴露 `HTMLInputElement`；`FieldBox` 暴露 `HTMLDivElement`。React 不会因为包装层内部有输入框
而把 Ref 改指向输入框。调用方可使用哪些 DOM 属性和方法，由最终节点类型决定。

来源：[Common components：ref](https://react.dev/reference/react-dom/components/common#ref)、
[Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。

## 组件边界与节点生命周期

### 1. 对象 Ref 的连接状态

对象 Ref 在首次 render 时通常为 `null`。React 把宿主节点提交到页面后，才把节点写入 `current`；节点
从页面移除后，再把 `current` 设回 `null`。

```tsx
import type { RefObject } from 'react'

function focusCurrentInput(inputRef: RefObject<HTMLInputElement | null>) {
  const input = inputRef.current
  if (input === null) return

  input.focus()
}
```

每次操作都重新读取 `current`，可以覆盖尚未连接和已经失效两种状态。TypeScript 中的 `null` 不是为了
绕过检查而添加的形式，它对应真实生命周期。

来源：[`useRef`：Manipulating the DOM with a ref](https://react.dev/reference/react/useRef#manipulating-the-dom-with-a-ref)。

### 2. 条件渲染与节点替换

组件可以正常接收并转交 Ref，但当前分支不一定渲染目标：

```tsx
type OptionalInputProps = {
  visible: boolean
  ref?: Ref<HTMLInputElement>
}

function OptionalInput({ visible, ref }: OptionalInputProps) {
  if (!visible) return null
  return <input ref={ref} />
}
```

`visible` 为 `false` 时，对象 Ref 为 `null`。当目标元素被另一个宿主实例替换时，旧连接失效，Ref 再连接
新节点。不能把过去从 `current` 取出的 DOM 对象当成跨后续提交永久有效的实例。

来源：[`useRef`](https://react.dev/reference/react/useRef)、
[Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)。

### 3. Callback Ref cleanup 的透明转交

`Ref<HTMLInputElement>` 同时允许对象 Ref 与 Callback Ref。子组件直接写 `<input ref={ref}>` 时，不需要
识别 Ref 的具体形式，也不负责手动调用 callback：

```tsx
function SearchInput({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} />
}
```

若调用方传入 Callback Ref，React 在节点连接时用节点调用它。React 19 允许 callback 返回 cleanup；
节点移除或 callback 改变时，React 调用该 cleanup。直接转交保留这套合同。

```tsx
const observeInput: Ref<HTMLInputElement> = (node) => {
  if (node === null) return

  node.dataset.connected = 'true'

  return () => {
    delete node.dataset.connected
  }
}

return <SearchInput ref={observeInput} />
```

若子组件额外创建包装 callback，再调用父 callback，却没有返回父 callback 的 cleanup，React 只能看到
包装函数的返回值，父 callback 的 cleanup 会丢失。纯转交场景应优先使用 `ref={ref}`。

来源：[Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)、
[React v19：Cleanup functions for refs](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)。

### 4. 类组件边界不同

React 19 的 ref-as-prop 结论针对函数组件。标准 `ref` 传给类组件时仍指向类实例，不进入
`this.props.ref`。不能仅因函数组件现在能解构 `ref`，就把类组件的实例 Ref 改写成同样模式。

来源：[React v19：ref as a prop 的类组件说明](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)。

## TypeScript 类型

### 1. 显式声明单一 Ref prop

```tsx
import type { Ref } from 'react'

type InputProps = {
  ref?: Ref<HTMLInputElement>
  label: string
}
```

`Ref<HTMLInputElement>` 覆盖三种合法值：

- Callback Ref：参数为 `HTMLInputElement | null`，React 19 可接收返回的 cleanup；
- 对象 Ref：`current` 为 `HTMLInputElement | null`；
- `null`。

属性写成可选后，还允许调用方完全不传 `ref`，此时组件参数中的值为 `undefined`。因此可选属性和
`Ref<T>` 内部的 `null` 处理的是不同状态。

来源：[`Ref<T>` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L176-L194)、
[TypeScript JSX Handbook：属性类型检查](https://www.typescriptlang.org/docs/handbook/jsx.html#attribute-type-checking)。

### 2. 节点泛型必须对应真实目标

宿主 `<input>` 对应 `HTMLInputElement`，宿主 `<textarea>` 对应 `HTMLTextAreaElement`，包装 `<div>` 对应
`HTMLDivElement`。类型不能只按组件名称或调用方期望填写。

```tsx
function Notes({ ref }: { ref?: Ref<HTMLTextAreaElement> }) {
  return <textarea ref={ref} />
}
```

节点类型正确时，调用方既能获得准确的 DOM API，也能在目标变化时收到编译器提醒。通过断言把
`Ref<HTMLInputElement>` 强行塞给 `<div>` 只会隐藏接口与实现不一致。

来源：[Common components：ref](https://react.dev/reference/react-dom/components/common#ref)、
[`Ref<T>` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L176-L194)。

### 3. 包装原生元素时继承完整属性

组件若只是为 `<input>` 增加少量外观或标签，同时希望接收原生输入框的全部属性，可以从宿主元素类型
取得包含 Ref 的 props：

```tsx
import type { ComponentPropsWithRef } from 'react'

type SearchInputProps = ComponentPropsWithRef<'input'> & {
  label: string
}

function SearchInput({ label, ref, ...inputProps }: SearchInputProps) {
  return (
    <label>
      <span>{label}</span>
      <input {...inputProps} ref={ref} />
    </label>
  )
}
```

`ComponentPropsWithRef<'input'>` 适合“包装并继续支持原生输入框 API”的组件。只暴露少量自定义属性时，
显式写 `ref?: Ref<HTMLInputElement>` 更容易看清接口，也不会无意扩大可传属性集合。

来源：[`ComponentPropsWithRef` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L1460-L1485)、
[React TypeScript 指南：组件 props](https://react.dev/learn/typescript#typescript-with-react-components)。

### 4. JSX 调用由 props 类型检查

TypeScript 根据函数组件第一个参数的类型检查 JSX 属性。React 19 运行时允许函数组件接收 `ref`，但
TypeScript 仍需要组件 props 类型包含 `ref`，才能接受 `<SearchInput ref={inputRef}>`。

这也解释了为什么不能只改函数体：若函数体试图解构 `ref`，而 props 类型没有该字段，定义处和调用处
都会出现类型不一致。

来源：[TypeScript JSX Handbook：Function Component 与 Attribute type checking](https://www.typescriptlang.org/docs/handbook/jsx.html#function-component)、
[React TypeScript 指南](https://react.dev/learn/typescript)。

## React 18 到 React 19 的迁移

### React 18 写法

React 16.3 到 React 18 的标准转交写法使用 `forwardRef`。`ref` 是 render 函数的第二个参数，不属于
`props`：

```tsx
import { forwardRef } from 'react'

type SearchInputProps = {
  label: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { label },
  ref,
) {
  return (
    <label>
      <span>{label}</span>
      <input ref={ref} />
    </label>
  )
})
```

来源：[React v16.3.0：forwardRef API](https://legacy.reactjs.org/blog/2018/03/29/react-v-16-3.html#forwardref-api)、
[`forwardRef`](https://react.dev/reference/react/forwardRef)。

### React 19 写法

升级 React、React DOM 与对应类型后，可以移除包装，把 `ref` 加入 props 类型：

```tsx
import type { Ref } from 'react'

type SearchInputProps = {
  label: string
  ref?: Ref<HTMLInputElement>
}

function SearchInput({ label, ref }: SearchInputProps) {
  return (
    <label>
      <span>{label}</span>
      <input ref={ref} />
    </label>
  )
}
```

迁移保持三个事实不变：调用方仍写 `ref={inputRef}`，最终目标仍是同一个 `<input>`，节点移除后 Ref 仍会
失效。变化只在函数组件接收 Ref 的方式。

React 19 没有删除 `forwardRef`。现有组件可以分步迁移；新函数组件直接使用 `ref` prop。React 16.2 及
更早版本没有 `forwardRef`，其历史 Callback Ref 兼容方案不在本文范围内。

使用 React 19 的 ref-as-prop 前，应确保项目启用新的 JSX Transform。该要求属于 React 19 的项目级
升级前提，不能由组件内部代码替代。

来源：[React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)、
[`forwardRef`](https://react.dev/reference/react/forwardRef)、
[React v16.3.0](https://legacy.reactjs.org/blog/2018/03/29/react-v-16-3.html)、
[React 19 Upgrade Guide：New JSX Transform is now required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#new-jsx-transform-is-now-required)。

## 常见错误

### 1. 在 React 18 直接使用 React 19 的 ref prop 写法

**错误名称：** 忽略运行时 major 版本。

**触发条件：** React 18 或更早版本的函数组件声明 `function MyInput({ ref })`，调用方使用标准
`<MyInput ref={inputRef}>`。

**原因：** 函数组件直接接收标准 `ref` prop 从 React 19 开始；React 16.3 到 React 18 使用
`forwardRef` 的第二个参数。

**后果：** 旧版本不会建立预期转交链路，父组件无法取得内部宿主节点。

**错误示例：** React 18 中写 `function MyInput({ ref }) { return <input ref={ref} /> }`。

**正确示例：** React 18 使用 `forwardRef<HTMLInputElement, Props>((props, ref) =>
<input ref={ref} />)`；升级到 React 19 后再改为直接 prop。

**适用版本：** 错误触发于 React 18 及支持 `forwardRef` 的更早版本；直接 prop 适用于 React 19。

**来源：** [React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)、
[React v16.3.0：forwardRef API](https://legacy.reactjs.org/blog/2018/03/29/react-v-16-3.html#forwardref-api)。

### 2. 接收 Ref 后没有继续转交

**错误名称：** Ref 在组件边界被吞掉。

**触发条件：** 子组件解构出 `ref`，但返回的 JSX 中没有 `ref={ref}`，或中间组件没有把它继续传递。

**原因：** React 不会自动选择自定义组件内部的 DOM 目标。

**后果：** 父组件对象 Ref 保持 `null`，Callback Ref 也收不到目标节点。

**错误示例：** `function MyInput({ ref }) { return <input /> }`。

**正确示例：** `function MyInput({ ref }) { return <input ref={ref} /> }`；多层组件逐层传递同一个 Ref。

**适用版本：** React 19 直接 prop；旧 `forwardRef` 模式也要求显式转交。

**来源：** [`useRef` Troubleshooting](https://react.dev/reference/react/useRef#i-cant-get-a-ref-to-a-custom-component)、
[`forwardRef` Troubleshooting](https://react.dev/reference/react/forwardRef#my-component-is-wrapped-in-forwardref-but-the-ref-to-it-is-always-null)。

### 3. 把 Ref 放到错误的包装节点

**错误名称：** 暴露目标与组件接口不一致。

**触发条件：** 调用方需要输入框，子组件却把 Ref 写在外层 `<div>`。

**原因：** Ref 指向实际承接 `ref` 属性的宿主节点，不会穿透包装层寻找内部交互元素。

**后果：** 调用方得到错误 DOM 类型，预期的输入框属性和方法不可用。

**错误示例：** `<div ref={ref}><input /></div>`，同时把 prop 声明成输入框 Ref。

**正确示例：** `<div><input ref={ref} /></div>`，并声明 `ref?: Ref<HTMLInputElement>`。

**适用版本：** 所有支持 DOM Ref 的 React 版本。

**来源：** [Common components：ref](https://react.dev/reference/react-dom/components/common#ref)、
[Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)。

### 4. 把 Ref prop 限制为对象 Ref

**错误名称：** Ref 类型覆盖不完整。

**触发条件：** 组件写 `ref?: RefObject<HTMLInputElement>`，却声称支持标准 Ref prop。

**原因：** React Ref 还可以是 Callback Ref 或 `null`；`RefObject<T>` 只表示对象形式。

**后果：** 合法 Callback Ref 无法通过类型检查，组件类型比 React 运行时合同更窄。

**错误示例：** `type Props = { ref?: RefObject<HTMLInputElement> }`。

**正确示例：** `type Props = { ref?: Ref<HTMLInputElement> }`，并原样传给 `<input>`。

**适用版本：** React 19 与 `@types/react@19.2.18`；升级类型包后应重新核对精确声明。

**来源：** [`Ref<T>` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts#L176-L194)、
[Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)。

### 5. 节点泛型与实际宿主元素不一致

**错误名称：** 用类型断言掩盖目标错误。

**触发条件：** prop 声明 `Ref<HTMLInputElement>`，实际却转交给 `<div>`，再通过断言压过编译错误。

**原因：** Ref 泛型描述最终实例，必须由真实宿主元素决定。

**后果：** 调用方按输入框使用一个 `<div>`，类型提示与运行值发生冲突。

**错误示例：** `<div ref={ref as Ref<HTMLDivElement>} />`，而公开类型仍是输入框 Ref。

**正确示例：** 要么把 Ref 放到真实 `<input>`，要么把公开类型改为 `Ref<HTMLDivElement>` 并明确暴露包装层。

**适用版本：** 使用 TypeScript 的所有 React 版本。

**来源：** [TypeScript JSX Handbook：属性类型检查](https://www.typescriptlang.org/docs/handbook/jsx.html#attribute-type-checking)、
[Common components：ref](https://react.dev/reference/react-dom/components/common#ref)。

### 6. 假设转交后的节点永远非空

**错误名称：** 忽略节点失效状态。

**触发条件：** 目标受条件渲染控制、被替换或组件已卸载，代码仍直接使用过去的节点。

**原因：** React 在节点移除时把对象 Ref 恢复为 `null`；旧 DOM 对象不代表当前连接。

**后果：** 调用空值时报错，或命令落到已经脱离当前界面的旧节点。

**错误示例：** `inputRef.current!.focus()`，并把断言当作生命周期保证。

**正确示例：** 操作时重新读取并判断：`const node = inputRef.current; if (node) node.focus()`。

**适用版本：** 所有支持对象 DOM Ref 的 React 版本。

**来源：** [`useRef`：Manipulating the DOM with a ref](https://react.dev/reference/react/useRef#manipulating-the-dom-with-a-ref)。

### 7. 包装 Callback Ref 时丢失 cleanup

**错误名称：** 中间 callback 截断清理合同。

**触发条件：** 子组件写新的 callback 调用父 callback，但没有把父 callback 返回的 cleanup 返回给 React。

**原因：** React 只能登记最终传给宿主元素的 callback 返回值。

**后果：** 节点移除或 callback 更换时，父 callback 建立的资源没有按合同清理。

**错误示例：** `ref={(node) => { if (typeof ref === 'function') ref(node) }}`。

**正确示例：** 纯转交直接写 `<input ref={ref} />`；确实需要包装时，必须完整保留所调用 callback 的返回值。

**适用版本：** React 19 的 Callback Ref cleanup；旧版本没有返回 cleanup 的公共合同。

**来源：** [Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)、
[React v19：Cleanup functions for refs](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)。

### 8. 把 `forwardRef` 描述为 React 19 已删除

**错误名称：** 夸大迁移状态。

**触发条件：** 把“不再必要”和“未来会废弃”解释为“React 19 已移除”。

**原因：** 忽略官方文档中的未来时态。

**后果：** 现有可运行代码被误判为错误，迁移说明与实际 API 不一致。

**错误示例：** “升级 React 19 后继续调用 `forwardRef` 会报 API 不存在。”

**正确示例：** React 19 新函数组件直接接收 `ref`；现有 `forwardRef` 可以逐步迁移，官方说明未来会废弃。

**适用版本：** React 19.2；未来版本需要重新核验。

**来源：** [`forwardRef`](https://react.dev/reference/react/forwardRef)、
[React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)。

### 9. 把类组件 Ref 当作普通 prop

**错误名称：** 忽略函数组件与类组件边界。

**触发条件：** 在类组件中读取 `this.props.ref`，期待取得调用方传入的标准 Ref。

**原因：** 传给类组件的 Ref 表示组件实例，不作为 prop 传入。

**后果：** 类组件内部读取不到预期 Ref，组件接口说明与 React 行为不一致。

**错误示例：** 在类组件中用 `this.props.ref` 转交标准 Ref。

**正确示例：** ref-as-prop 直接解构用于 React 19 函数组件；类组件继续遵守实例 Ref 语义。

**适用版本：** React 19。

**来源：** [React v19：ref as a prop 的类组件说明](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)。

## 本科范围知识覆盖

### 必须掌握

1. React 19 函数组件把 `ref` 写进 props 类型并直接解构。
2. 自定义组件本身没有可自动推断的宿主节点，Ref 必须逐层显式转交。
3. 最终写 `ref={ref}` 的宿主元素决定 Ref 的实例和值类型。
4. 暴露输入框、文本域或包装容器会形成不同组件接口。
5. 对象 Ref 的 `null -> 节点 -> null` 变化与真实节点生命周期对应。
6. 条件渲染、节点替换和卸载会使旧节点连接失效。
7. 直接转交同时支持对象 Ref 与 Callback Ref。
8. React 19 Callback Ref 返回的 cleanup 由最终宿主 Ref 合同管理。
9. `Ref<T>`、`RefObject<T>`、Callback Ref 和可选 prop 的类型区别。
10. `ComponentPropsWithRef<'input'>` 与显式 `ref?: Ref<HTMLInputElement>` 的选择。
11. React 18 的 `forwardRef` 接收方式与 React 19 的直接 prop 迁移。
12. `forwardRef` 在 React 19 不再必要，但尚未被删除。
13. 类组件 Ref 仍表示类实例，不适用函数组件的直接解构结论。
14. 使用 React 19 的 ref-as-prop 前必须启用新的 JSX Transform。

### 只保留边界

- Ref 是命令式连接，不替代 props 与 State 的声明式数据流。
- 透明转交暴露完整宿主节点；改变暴露值需要另一套独立知识。
- Callback Ref 的详细登记模式、Strict Mode 检查和动态节点集合不在本文展开。

### 明确不包含

- 自定义命令式句柄；
- Portal 和宿主放置；
- Effect、布局同步与测量；
- Ref 合并、HOC、多态组件与第三方库；
- 动态节点集合、Observer、动画、请求或持久化；
- React 内部 Fiber 与未公开提交细节。

## 官方参考资料

1. [React Versions](https://react.dev/versions)
2. [React v19：ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
3. [`useRef`](https://react.dev/reference/react/useRef)
4. [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
5. [`forwardRef`](https://react.dev/reference/react/forwardRef)
6. [Common components：ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)
7. [React v19：Cleanup functions for refs](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)
8. [React 19 Upgrade Guide：ref cleanup required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required)
9. [React TypeScript 指南](https://react.dev/learn/typescript)
10. [TypeScript JSX Handbook](https://www.typescriptlang.org/docs/handbook/jsx.html)
11. [`@types/react@19.2.18` 固定源码](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a414786ca9309a76c8a35fe249dab28668a69b79/types/react/index.d.ts)
12. [React v16.3.0：forwardRef API](https://legacy.reactjs.org/blog/2018/03/29/react-v-16-3.html#forwardref-api)
13. [React 19 Upgrade Guide：New JSX Transform is now required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#new-jsx-transform-is-now-required)
