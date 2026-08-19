# useContext 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.use-context`
- 标题：useContext
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、正文、同源 Demo、静态检查、浏览器验收与双轴复审已闭环
- 官方文档基线：React `19.2`
- 仓库实现基线：React / React DOM `19.2.8`

本课只回答一条主线：组件怎样使用 `useContext` 从父树读取同一 Context 对象的当前值，并理解默认值、
Provider 位置和 Context 值变化的边界。

明确排除：Provider 嵌套与覆盖、Reducer 与 Context 组合、Context 性能拆分、外部 Store、远程数据、
服务端组件 Context 和 `use` API。Demo 使用 `useState` 驱动一个 Provider 仅为观察读取更新，不把 State
建模或状态转换作为本课第二条主线。

## 调研问题

1. `useContext` 从哪里查找值，最近 Provider 如何决定结果？
2. 没有 Provider 时何时使用 `defaultValue`？
3. Provider 的 `value` 变化时读取组件会怎样更新？
4. 前后 Context 值如何比较，`undefined` 是否会触发默认值回退？
5. 为什么 Provider 不能写在同一组件读取调用的返回 JSX 里？
6. `useContext` 的调用位置有哪些 Rules of Hooks 限制？
7. Context 读取与显式 Props 的选择边界是什么？
8. `T | null` 的 Context 如何在读取边界保留缺失 Provider 语义？

## 搜索与原文核验

本课按既定搜索顺序使用 Tavily，限定 `react.dev` 官方域名执行 4 组搜索：

1. `useContext` 的签名、最近 Provider、默认值和更新传播。
2. Context 深层读取、Props/children 替代方案和读取组件位置。
3. `useContext` 的 TypeScript 类型与缺失 Provider 检查。
4. React 19 Context Provider 语法以及 `undefined` 边界。

搜索成功返回官方候选，因此未切换 Exa、Parallel、Perplexity 或原生搜索。随后使用 Tavily `extract`
读取 4 个官方 URL，4/4 成功：`useContext`、Passing Data Deeply with Context、Using TypeScript 和
`createContext`。搜索摘要只用于定位，以下结论均回到官方原文核验。

## 官方来源与版本

| 来源 | URL | 采用结论 | 适用版本 |
| --- | --- | --- | --- |
| React Versions | https://react.dev/versions | 当前官方文档版本为 React 19.2 | React 19.2 |
| useContext | https://react.dev/reference/react/useContext | 顶层调用、最近 Provider、默认值、更新传播、`Object.is`、Provider 位置限制 | React 19.2 |
| Passing Data Deeply with Context | https://react.dev/learn/passing-data-deeply-with-context | Context 的深层读取、中间组件透传、Props/children 边界 | React 19.2 |
| Using TypeScript | https://react.dev/learn/typescript | Context 类型推断、`T | null` 与读取检查 | React 19.2 |
| createContext | https://react.dev/reference/react/createContext | 静态默认值、Context 对象身份、React 19 Provider 写法 | React 19.2 |

React Versions 明确最新文档版本为 `19.2`。仓库本地 patch 版本只作为生产证据记录，正文只陈述 React
19.2 的公共合同。

## 官方事实

### 1. 读取规则

- `useContext(SomeContext)` 应在组件或自定义 Hook 的顶层调用。
- React 从调用组件向上查找同一 Context 的最近 Provider。
- 找到 Provider 时返回其 `value`；整棵父树没有匹配 Provider 时返回 `createContext` 的默认值。
- Provider 明确传入 `undefined` 时，返回值就是 `undefined`，不回退默认值。

### 2. 更新传播

- `useContext` 返回的值会保持最新。
- Provider 收到不同的 `value` 后，读取该 Context 的组件会重新渲染。
- React 用 `Object.is` 比较前后值；`memo` 不会阻止读取组件获得新的 Context 值。

### 3. Provider 位置

- `useContext` 不会读取调用组件自己返回的 Provider。
- 对应 Provider 必须位于调用组件的父树中；需要拆出由 Provider 包裹的子组件。

### 4. Context 与 Props

- Context 可以让深层组件读取信息，中间组件无需转发同名 Props。
- 官方建议使用 Context 前先考虑普通 Props 或把 JSX 作为 `children` 传递。

### 5. TypeScript

- Context 值类型由 `createContext` 参数推断，也可以显式声明。
- 没有合理默认值时可使用 `ContextShape | null`，在读取边界检查缺失并抛出或展示明确状态。

## 课程推导

1. **Context 读取是树结构解析。** 读取方不是从全局变量取值，而是让 React 根据自己在 render tree 中的
   位置解析当前环境；因此 Provider 位置和 Context 对象身份都是数据合同的一部分。
2. **Provider 值变化属于提供方职责。** `useContext` 只读取和订阅，State、事件或其他数据源负责产生新的
   `value`；读取组件不应反向修改 Context 对象本身。
3. **默认值与空值必须分开建模。** 没有 Provider 才使用默认值；Provider 存在但传入 `undefined` 是另一种
   运行时结果，类型必须明确允许或在提供前归一化。
4. **读取位置决定可观察行为。** 同一组件里写在返回 JSX 后面的 Provider 对该组件本次读取无效，这是
   “父树查找”规则的直接结果，不是更新延迟。
5. **隐藏输入要有边界。** 多个远距离分支共享环境信息时 Context 能减少无意义转发；短路径或单一依赖
   仍应优先保留 Props 的显式合同。

## 基础用法

```tsx
type Density = 'comfortable' | 'compact'

const DensityContext = createContext<Density>('comfortable')

/** 读取当前密度。 */
function DensityLabel() {
  const density = useContext(DensityContext)
  return <span>{density}</span>
}

/** 由父组件提供当前密度。 */
function Settings() {
  const [density, setDensity] = useState<Density>('comfortable')
  return (
    <DensityContext value={density}>
      <button type="button" onClick={() => setDensity('compact')}>
        使用紧凑密度
      </button>
      <DensityLabel />
    </DensityContext>
  )
}
```

读取组件不需要接收 `density` Prop；Provider 的 `value` 改变后，`DensityLabel` 会读取新的快照。无
Provider 时，读取结果是 `'comfortable'`。

## 易错点合同

| 错误名称 | 触发条件 | 原因 | 后果 | 错误示例 | 正确示例 | 适用版本 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 在回调或条件中调用 Hook | 把 `useContext` 放进事件、循环或条件分支 | 把 Hook 当普通查询，破坏调用顺序 | Rules of Hooks 违规或运行时错误 | `onClick={() => useContext(Ctx)}` | 组件顶层 `const value = useContext(Ctx)` | React 19.2 | useContext、Rules of Hooks |
| Provider 写在读取组件下方 | 组件先读取，再返回对应 Provider | Context 只向上查找父树 | 读取到默认值或外层值 | `const v = useContext(Ctx); return <Ctx value="x">{v}</Ctx>` | Provider 包裹独立 `Child`，由 `Child` 调用 `useContext` | React 19.2 | useContext |
| 默认值当动态 State | 修改 `createContext` 参数期待运行时更新 | 混淆静态兜底与 Provider `value` | 读取组件无法得到动态值 | `Ctx = createContext(next)` | State 产生 `value` 并渲染 Provider | React 19.2 | createContext、useContext |
| `undefined` 回退默认值 | Provider 传入 `undefined`，读取方期待默认值 | 混淆没有 Provider 与空值 | 读取到 `undefined` 并可能访问失败 | `<Ctx value={undefined}>` | 归一化为合法值或把 `undefined` 纳入类型 | React 19.2 | useContext |
| 过短路径使用 Context | 只有一个相邻子组件需要值 | 只关注避免转发，忽略输入可见性 | 依赖隐藏、复用和测试成本增加 | `ButtonLabelContext` 只传一层 | `<Button label="保存" />` | React 19.2 | Passing Data Deeply with Context |
| 忽略 `T | null` 缺失边界 | 必须提供的对象用空对象断言默认值 | 用类型断言掩盖 Provider 遗漏 | 页面带着假数据继续运行 | `createContext({} as Workspace)` | `createContext<Workspace | null>(null)` 并检查 | React 19.2 | Using TypeScript |

## 验证合同

1. 静态检查：类型检查、Lint、Prettier、目标文件 `git diff --check`。
2. 读取规则：无 Provider 显示默认值；Provider 提供值显示当前值；切换 Provider `value` 后读取结果更新。
3. 位置边界：读取组件由父级 Provider 包裹；不把 Provider 写在同一组件读取调用的返回 JSX 内。
4. 同源检查：展示源码与运行 TSX 的字符数、UTF-8 字节数和 SHA-256 一致。
5. 浏览器检查：桌面、390px、390px + 200% 根字号无横向溢出和裁切，console 为 `0 error / 0 warning`。
6. 临时测试和截图只放 `/tmp`，验证后删除，不在仓库保留测试文件或浏览器产物。

## Demo 设计

Demo 使用一个模块顶层创建的 `DensityContext`，默认值为 `'comfortable'`。左侧预览不包裹 Provider，
用于观察静态默认值；右侧由 State 提供 Provider `value`，按钮在 `'comfortable'` 与 `'compact'` 间切换，
用于观察 `useContext` 读取随 Provider 当前值更新。Demo 不使用嵌套 Provider、Reducer、Effect、随机值或
网络请求，展示源码和运行源码均来自同一个 `use-context-demo.tsx` 文件。

## 实施与验收证据

- 正文：`src/categories/frontend/react/core/learn/use-context.md`
- 同源 Demo：`src/categories/frontend/react/core/demos/use-context/use-context-demo.tsx`
- 浏览器路由：`/frontend/react/core/learn/use-context`
- 核心交互：无 Provider 读取 `comfortable`；单个 Provider 初始读取 `comfortable`，点击后 Provider 与
  读取组件同步变为 `compact`，静态默认值观察区保持不变。
- 视口：`1440px` 页面为 `1440/1440`、Demo 为 `834/834`；`390px` 页面为 `390/390`、Demo 为
  `308/308`；`390px + 200%` 根字号仍为页面 `390/390`、Demo `308/308`。
- Console：`0 error / 0 warning`，仅有 React DevTools 信息提示。
- 同源检查（去除末尾空白）：`2516` 字符、`2782` UTF-8 字节，SHA-256
  `38bbbf6881caa7a7fff3a17927b74aacf99ace7d23213bda946ef4011a2345c8`。
- 状态登记：第 11-12 课已登记为 `available`；第 13-29 课保持 `planned`。

## 拆课判断

最近 Provider 查找、默认值回退、更新传播和 Provider 位置都服务同一个“读取当前 Context 值”的心智模型，
属于单一知识点的教学深度。嵌套 Provider 的覆盖和作用域会引入独立的树边界练习，保留为第 12 课；Reducer
与 Context 的组合保留为第 13 课。
