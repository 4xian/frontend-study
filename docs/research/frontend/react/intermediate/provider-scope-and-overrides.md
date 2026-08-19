# Provider 作用域研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.provider-scope-and-overrides`
- 标题：Provider 作用域
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、正文、同源 Demo、静态检查、浏览器验收与双轴复审已闭环
- 官方文档基线：React `19.2`
- 仓库实现基线：React / React DOM `19.2.8`

本课只回答一条主线：怎样用 Provider 的 `children` 子树表达 Context 的可见范围，并用同一 Context 的
嵌套 Provider 为局部子树提供覆盖值，离开子树后回到外层值。

明确排除：`createContext` 创建合同、`useContext` 基础读取、Reducer 与 Context 组合、Context 性能拆分、
外部 Store、远程缓存、服务端组件 Context 和自定义 Hook。Demo 使用 `useState` 驱动两个 Provider 的值，
但 State 更新逻辑不是本课主线。

## 调研问题

1. Provider 的 `value` 具体覆盖哪些组件？
2. 同一 Context 嵌套时，读取方如何决定使用外层还是内层值？
3. 内层 Provider 是否会修改外层 Provider 或外层兄弟节点？
4. Provider 能否穿过不读取 Context 的中间组件？
5. 怎样选择 Provider 的最小共同边界，避免值泄漏？
6. Provider 作用域与值的计算、状态转换和持久化分别是什么职责？
7. React 19 的 `<Context value={...}>` 与旧版本 Provider 写法有什么边界？

## 搜索与原文核验

本课按既定搜索顺序使用 Tavily，限定 `react.dev` 官方域名执行 4 组搜索：

1. `useContext` 最近 Provider、局部覆盖与嵌套 Provider。
2. Passing Data Deeply with Context 的 Section 嵌套和中间组件。
3. `createContext` 的 `value` 作用范围与 innermost Provider 语义。
4. Managing State 对 Context 深层读取和 Reducer 组合的阶段边界。

搜索成功返回官方候选，因此未切换 Exa、Parallel、Perplexity 或原生搜索。随后使用 Tavily `extract`
读取 4 个官方 URL，4/4 成功：`useContext`、Passing Data Deeply with Context、`createContext` 和
Managing State。搜索摘要只用于定位，以下结论均回到官方原文核验。

## 官方来源与版本

| 来源 | URL | 采用结论 | 适用版本 |
| --- | --- | --- | --- |
| React Versions | https://react.dev/versions | 当前官方文档版本为 React 19.2 | React 19.2 |
| useContext | https://react.dev/reference/react/useContext | 同一 Context 的最近 Provider、局部覆盖和读取更新 | React 19.2 |
| createContext | https://react.dev/reference/react/createContext | Provider value 对内部任意深度读取组件可见，innermost Provider 优先 | React 19.2 |
| Passing Data Deeply with Context | https://react.dev/learn/passing-data-deeply-with-context | Section 嵌套、Context 穿过中间组件、子树适应环境 | React 19.2 |
| Managing State | https://react.dev/learn/managing-state | Context 深层共享与 Reducer+Context 的后续分工 | React 19.2 |

React Versions 明确最新文档版本为 `19.2`。正文只陈述 React 19.2 的公共 Provider 合同，旧版本的
`<SomeContext.Provider>` 兼容差异只作为版本边界说明。

## 官方事实

### 1. Provider 的覆盖范围

- Provider 的 `value` 会提供给该 Provider 内部任意深度的 Context 读取组件。
- 不在其 `children` 子树内的父组件、兄弟分支和其他页面不会读取这份局部值。
- Context 可以穿过不读取它的中间组件，只要最终读取组件仍位于 Provider 子树中。

### 2. 嵌套与最近匹配

- 同一 Context 可以嵌套多个 Provider。
- 读取方使用父树中最近的匹配 Provider，也就是最内层覆盖值。
- 只有被内层 Provider 包住的子树看到覆盖值；离开该子树后继续使用外层 Provider。

### 3. 值与作用域分工

- Provider 负责把已经确定的 `value` 放进一段组件树。
- State、事件、Reducer 或其他数据源负责生成新值；Provider 不自动合并、转换或持久化值。
- Managing State 将“Context 深层读取”和“Reducer+Context 组合”作为相邻但独立的学习主题。

### 4. React 19 语法

- React 19 可以直接渲染 `<SomeContext value={value}>`。
- React 19 以前使用 `<SomeContext.Provider value={value}>`；语义仍是 Provider 子树范围。

## 课程推导

1. **Provider 是树边界，不是全局赋值。** `children` 关系决定可见范围，文件位置、变量名和 DOM 物理位置
   都不能替代 render tree 证据。
2. **内层覆盖是局部环境。** 当一个编辑区需要特殊密度时，在编辑区最小共同父级创建内层 Provider，能
   保持页面其他分支的外层值不变。
3. **提升或下沉 Provider 都是边界决策。** 若多个兄弟区域应共享同一值，Provider 应提升到它们的共同
   父级；若只有单一区域需要覆盖，应下沉到该区域，避免影响无关 UI。
4. **读取值与计算值解耦。** Provider 位置解决“谁能读到”，State/Reducer 解决“值如何产生”；把两者
   写进一个组件会让作用域错误和状态转换错误互相遮蔽。

## 基础用法

```tsx
type Density = 'comfortable' | 'compact'
const DensityContext = createContext<Density>('comfortable')

/** 显示外层和内层 Provider 的作用域。 */
function Page() {
  return (
    <DensityContext value="comfortable">
      <Header />
      <DensityContext value="compact">
        <Editor />
      </DensityContext>
      <Footer />
    </DensityContext>
  )
}
```

`Header` 和 `Footer` 读取 `comfortable`，`Editor` 读取 `compact`。内层 Provider 没有改变 Context 对象，
只是在自己的子树里成为更近的匹配提供方。

## 易错点合同

| 错误名称 | 触发条件 | 原因 | 后果 | 错误示例 | 正确示例 | 适用版本 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Provider 放得过高 | 局部覆盖包住整个应用 | 用全局方便替代功能边界 | 无关区域读取局部值 | `<Ctx value="compact"><EntireApp /></Ctx>` | 只包住 `<Editor />` 子树 | React 19.2 | useContext、Passing Data Deeply |
| 误以为内层修改外层 | 覆盖后期待外层兄弟改变 | 混淆最近匹配与全局赋值 | 错误扩大 Provider 范围 | 内层 `Ctx` 后要求 `Sibling` 读 inner | `Inner` 读 inner，`Sibling` 读 outer | React 19.2 | useContext、createContext |
| 目标组件不在 children | 通过另一分支或 `null` 移出目标 | 未按最终 render tree 检查边界 | 读取到外层值或默认值 | Provider children 没有实际 `<Editor />` | 让实际渲染的 `<Editor />` 位于 children | React 19.2 | useContext |
| 重复创建 Context | 每层各自 `createContext` | 忽略对象身份 | Provider 与读取方通道断开 | `OuterContext`/`InnerContext` 分别创建 | 导入同一个 `DensityContext` 后嵌套 Provider | React 19.2 | createContext |
| Provider 负责状态转换 | 在 `value` 表达式里混入 reducer 或合并副作用 | 混淆范围和数据来源 | 更新来源不可追踪，Provider 膨胀 | `<Ctx value={{ ...prev, ...patch }}>` | 先算 `next`，Provider 只接收 `next` | React 19.2 | createContext、Managing State |

## 验证合同

1. 静态检查：类型检查、Lint、Prettier、目标文件 `git diff --check`。
2. 作用域检查：外层读取方和内层外兄弟读取外层值；内层读取方读取覆盖值。
3. 更新检查：切换外层值不改变内层固定值；切换内层值只改变内层读取结果。
4. 同源检查：展示源码与运行 TSX 的字符数、UTF-8 字节数和 SHA-256 一致。
5. 浏览器检查：桌面、390px、390px + 200% 根字号无横向溢出和裁切，console 为 `0 error / 0 warning`。
6. 临时测试和截图只放 `/tmp`，验证后删除，不在仓库保留测试文件或浏览器产物。

## Demo 设计

Demo 在模块顶层创建一个 `DensityContext`。外层 Provider 提供 `outerDensity`，内层 Provider 提供
`editorDensity`。Header、Editor 和 Footer 三个读取方显示自身作用域和当前值；两个按钮分别切换外层与
内层 State，证明内层值只覆盖自己的 children。中间 `LayoutShell` 只传递 children，不读取 Context。
展示源码和运行源码均来自同一个 `provider-scope-and-overrides-demo.tsx` 文件。

## 实施与验收证据

- 正文：`src/categories/frontend/react/core/learn/provider-scope-and-overrides.md`
- 同源 Demo：`src/categories/frontend/react/core/demos/provider-scope-and-overrides/provider-scope-and-overrides-demo.tsx`
- 浏览器路由：`/frontend/react/core/learn/provider-scope-and-overrides`
- 核心交互：初始 Header/Editor/Footer 分别读取 `comfortable`、`compact`、`comfortable`；切换外层后
  Header/Footer 同步为 `compact`，Editor 保持内层 `compact`；再切换内层后只有 Editor 变为
  `comfortable`。
- 视口：`1440px` 页面为 `1440/1440`、Demo 为 `834/834`；`390px` 页面为 `390/390`、Demo 为
  `308/308`；`390px + 200%` 根字号仍为页面 `390/390`、Demo `308/308`。
- Console：`0 error / 0 warning`，仅有 React DevTools 信息提示。
- 同源检查（去除末尾空白）：`3060` 字符、`3456` UTF-8 字节，SHA-256
  `d37098ae42f69c4cfa65d400a90123f76a73df618d5c50ff2256dc63cef35ac0`。
- 状态登记：第 12 课已登记为 `available`；第 13-29 课保持 `planned`，下一课为“Reducer 与 Context 组合”。

## 拆课判断

Provider 子树边界、最近匹配、局部覆盖和外层恢复都服务同一个“Context 值作用域”心智模型。值的创建与
默认值属于第 10 课，读取与更新传播属于第 11 课，Reducer 与 Context 的组合属于第 13 课，保持独立。
