# useInsertionEffect 调研记录

## 研究任务与范围

本记录服务 React Core 的 `useInsertionEffect` 知识课重审。课程保留现有目标 ID
`react.core.learn.intermediate.use-insertion-effect`，显示标题为“useInsertionEffect”，内容归入高级路线末尾。
ID 保留是仓库进度兼容要求，不是学习者需要理解的 API 概念。

本记录只冻结 React 19.2 的公共 API 合同，并用 React `v19.2.8` 的固定源码和官方测试作实现佐证。教学主线是：

> CSS-in-JS 库在确实需要运行时生成并插入规则时，使用 `useInsertionEffect` 在布局 Effect 前管理样式资源；普通应用优先使用静态 CSS 或 inline style。

### 研究边界

纳入：

- `useInsertionEffect(setup, dependencies?)` 的参数、返回值、依赖比较和 cleanup。
- 运行时 `<style>` 插入为何要避开 render、为何要早于 layout Effect。
- callback 不能更新 State、不能读取 Ref、不能依赖业务 DOM 的精确更新时机。
- setup/cleanup 的依赖变化、卸载、跨组件交错和资源所有权。
- StrictMode 的公共合同边界、React 19.2.8 固定实现观察、Document 所有权、style 节点身份。
- 客户端、SSR、无 DOM 环境、TypeScript 和 linter 能证明与不能证明的事项。
- 一个只用于观察公开 DOM 的确定性同源 Demo 合同。

排除：

- CSS-in-JS 框架生态、具体库的缓存算法、编译器插件和供应商实现。
- React Server Components、Server Functions、`react-dom/server` 的深入教学。
- React 私有 Fiber、dispatcher、effect tag 或调度器作为应用接口。
- 浏览器 CSS 引擎内部算法、性能基准和非 React 的样式资源 API。

## 既有资产审计

### 可保留

| 资产 | 可复用内容 | 复用时的限制 |
| --- | --- | --- |
| `docs/research/frontend/react/intermediate/use-insertion-effect.md` | 官方 Reference 的参数、时机、State/Ref/DOM 限制；静态 CSS、inline style、运行时注入三分法；固定 19.2.8 源码链接；单节点 Demo 合同 | 只能提取知识事实，不能带入旧路线、旧完成度、旧 Gate、旧版本 TypeScript 或旧批次叙事 |
| `src/categories/frontend/react/core/learn/use-insertion-effect.md` | CSS-in-JS 主线、`neutral`/`accent` 两套规则、依赖变化先清理再插入、闭包持有节点、5 个易错点的基本方向 | 作为当前正文草稿而非完整合同；章节、易错项和练习需要扩充；正文最终不得出现生产过程叙事 |
| `src/categories/frontend/react/core/demos/use-insertion-effect/` | `useState` 驱动模式切换；一次插入 Effect；`style[data-course-style]` 节点；cleanup 直接调用捕获节点的 `remove`；Flexbox CSS 和中文职责注释 | 需要在浏览器验收中补充规则文本、computed style、依赖 cleanup、卸载归零、重挂载初始状态和源码同源证据 |

### 需要补充

1. 明确公共调用形态：setup 可返回 cleanup，依赖列表必须是固定长度的 inline 数组，比较使用 `Object.is`，Hook 返回 `undefined`。
2. 把“早于 layout Effect”与“DOM 已经更新”分开：前者是承诺，后者由官方明确禁止假设。
3. 增加多个组件的 interleaving 说明：不同组件的 insertion cleanup/setup 可能按组件交错，不能设计成“所有 cleanup 完成后所有 setup 才开始”的全局批处理。
4. 增加 StrictMode 说明：`useEffect`/`useLayoutEffect` 页面写有额外开发 setup+cleanup 说明，但 `useInsertionEffect` Reference 没有给出同样的公共承诺；固定实现也把 Strict Effects 的二次调用路径限定为 layout/passive。课程只要求对称 cleanup，不按开发调用次数写断言。
5. 增加 Document 所有权：插入节点必须属于实际承载被样式化内容的 Document；不能在 insertion callback 中依靠尚未附加的 Ref 推导目标 Document，Demo 使用明确的同源目标 Document。
6. 增加共享样式资源的身份与所有权：Demo 可让每次 setup 拥有一个节点；库级缓存若让多个消费者共享节点，则 cleanup 必须释放使用权，不能任意删除仍被其他消费者使用的共享节点。
7. 增加 SSR/非浏览器边界、`@types/react@19.2.18` 的类型合同，以及 AST/运行时分别负责的验证范围。

### 删除或移动结论

- 从新研究和未来学习者正文中删除旧记录的 RC2、旧课次、旧完成度、旧 Gate、旧 Admission、旧路线停止和旧 TypeScript 7.0.2 过程叙事。
- 课程层级从 intermediate 移到 advanced，但保留 ID；`useLayoutEffect` 仍是重要概念对照，不把布局测量并入本课。
- 历史文件、当前课程、Demo、manifest、Track 和总计划不在本研究批次修改；本文件只记录审计结论和下一阶段合同。

## 来源与版本冻结

### 一手来源

| 编号 | 来源 | 版本或固定点 | 允许支撑的结论 |
| --- | --- | --- | --- |
| S1 | [`useInsertionEffect` Reference](https://react.dev/reference/react/useInsertionEffect) | React 19.2 Reference | API 形态、setup/cleanup、依赖、客户端限制、CSS-in-JS 范围、插入时机、Ref/State/DOM/interleaving 限制 |
| S2 | [`useEffect` Reference](https://react.dev/reference/react/useEffect) | React 19.2 Reference | 普通 Effect 的选型对照、StrictMode 页面中明确的额外开发 setup+cleanup 说明、客户端限制 |
| S3 | [`useLayoutEffect` Reference](https://react.dev/reference/react/useLayoutEffect) | React 19.2 Reference | 布局测量和浏览器重绘前工作；StrictMode 和 paint 阻塞对照 |
| S4 | [`ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L103-L117) | React `v19.2.8`, commit `1dd4ecbdabf826f527fc9a58c05ea70375b7d170` | 固定 Flow 公共签名和 dispatcher 转发；实现佐证，不扩大公共合同 |
| S5 | [`ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2757-L2768) | React `v19.2.8` | insertion mount/update 使用独立 HookInsertion 标签；固定实现佐证 |
| S6 | [`ReactFiberCommitWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2012-L2024) | React `v19.2.8` | mutation 提交中 insertion cleanup/setup 先于 layout cleanup；固定实现佐证 |
| S7 | [`ReactHooksWithNoopRenderer-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L2566-L3049) | React `v19.2.8` 官方测试 | snapshot 后 insertion、insertion 先于 layout、跨组件交错、非法 cleanup、setup/cleanup 调 State 的诊断 |
| S8 | [`ReactDOMServerIntegrationHooks-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMServerIntegrationHooks-test.js#L624-L638) | React `v19.2.8` 官方测试 | 服务端 render 不执行 insertion callback |
| S9 | [`ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4984-L4992) | React `v19.2.8` | 固定 Strict Effects 二次路径操作 layout/passive；不把它写成 insertion 的公共承诺 |
| S10 | [`@types/react@19.2.18`](https://registry.npmjs.org/@types/react/-/react-19.2.18.tgz) `index.d.ts` | package `19.2.18`，本地 `node_modules/@types/react/index.d.ts` | TypeScript 的 `EffectCallback`、`DependencyList` 和 `useInsertionEffect` 声明 |

当前会话没有可用的 Tavily 搜索入口，因此没有使用关键词搜索或二手文章；已知官方 URL 直接通过 `curl -L --fail --silent --show-error` 回读，并用固定 tag 的源码、测试和锁定类型包核验。浮动 `main`、搜索摘要、社区文章和 Issue 不作为事实来源。React tag `v19.2.8` 的固定 commit 为 `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`。

## 官方事实矩阵

| 事实 | 公共合同或实现佐证 | 教学含义 |
| --- | --- | --- |
| 这是 CSS-in-JS 库作者的窄 API | S1 | 普通组件不应默认选择它 |
| setup 在组件加入 DOM 后、layout Effect 前运行 | S1 | 可让后续布局读取看到已经插入的规则，但不能推断其他 DOM 状态 |
| setup 可返回 cleanup，依赖变化先旧 cleanup 后新 setup，卸载时 cleanup | S1 | 样式节点、规则引用和所有权要有对称释放路径 |
| dependencies 可省略；若提供，必须固定数量且 inline，按 `Object.is` 比较 | S1 | 只把 setup 直接读取的响应值放进依赖；不要借 Hook 反向修正 State |
| Hook 返回 `undefined` | S1、S4、S10 | 不把返回值当作资源句柄或同步结果 |
| 只在客户端运行，服务端不执行 | S1、S8 | 服务端收集规则必须另走 render 数据流；本课不把它伪装成客户端插入 |
| 不能在 callback 中更新 State | S1、S7 | 模式由事件或正常 render 数据决定，插入阶段只管理样式资源 |
| Ref 尚未附加；DOM 可能在 callback 前或后更新 | S1 | 不读取 `ref.current`、不测量业务节点、不假设刚渲染节点已可查询 |
| insertion cleanup/setup 可以逐组件交错 | S1、S7 | 共享样式缓存不能依赖全局“先清后建”假设 |
| React 19.2.8 独立维护 insertion tag，提交时先 insertion 再 layout | S5、S6、S7 | 解释公开相对时机；不得读取私有 Fiber 或 effect tag |
| React 19.2.8 Strict Effects 二次路径显式处理 layout/passive | S9 | 课程验证最终资源状态，不断言 insertion 的开发调用次数 |
| TypeScript 声明只描述参数类型和 `void` 返回 | S10 | 时序、资源身份、Document 目标和 State/Ref 禁止项需靠规范、审查和运行时验证 |

## API 合同详解

### 调用形态

```tsx
useInsertionEffect(setup, dependencies?)
```

`setup` 是无参数函数。它可以创建并插入样式资源，并可返回一个无参数 cleanup；React 在组件加入 DOM 后调用 setup，在依赖变化前调用旧 cleanup，在卸载时调用当前 cleanup。Hook 本身返回 `undefined`。这些是 S1 的公共合同。

`dependencies` 是可选的 reactive value 列表。props、State 以及组件函数体内直接声明的变量和函数都属于可能的 reactive value。提供依赖时，列表长度必须恒定，写成 inline 数组；React 使用 `Object.is` 比较每个位置。省略依赖会让 callback 在组件每次重新渲染后再次运行，不能把省略理解为“一次运行”。

Hook 仍然遵守 Rules of Hooks：只能在组件或自定义 Hook 顶层调用，不能放进条件、循环、事件处理器、setup 内部或 render 分支。这个调用位置约束由 React Hook 规则和 linter 负责，而不是 `@types/react` 的函数签名负责。

### setup 与 cleanup 的资源模型

对组件范围的简单样式资源，可采用“每次 setup 创建一个节点，cleanup 只移除这个节点”的模型：

```tsx
useInsertionEffect(() => {
  const styleElement = targetDocument.createElement('style')
  styleElement.textContent = ruleText
  targetDocument.head.appendChild(styleElement)

  return () => {
    styleElement.remove()
  }
}, [targetDocument, ruleText])
```

示例中的 `targetDocument` 和 `ruleText` 只是说明资源所有权；实际课程 Demo 使用稳定的当前 Document 和固定的两套规则。cleanup 通过闭包保留节点身份，不重新查询“第一个匹配的 style”，因此不会误删其他实例的资源。

当规则由多个组件共享时，节点可能是库级共享资源。此时不能把上面的组件范围模型机械套用：每个消费者的 cleanup 应释放自己的使用权，只有最后一个使用者离开时才删除共享节点。共享缓存、引用计数或长期存在的样式表如何实现不属于本课；本课只冻结“删除动作必须拥有明确的资源所有者”。

### 依赖变化的顺序

依赖 `styleMode` 从 `neutral` 变为 `accent` 时，React 先调用捕获旧值的 cleanup，再用新值执行 setup。旧节点删除、新节点插入之间可以存在短暂的提交阶段；不要用全局查询把两轮节点混在一起，也不要在 cleanup 中读取新的 State。稳定验收应检查依赖变化提交完成后的节点数、规则文本和 computed style。

依赖对象或函数每次 render 都产生新身份时，`Object.is` 会让 setup 频繁重跑。规则文本应在 render 中由稳定输入计算，依赖列表写出实际 reactive value；如果需要缓存共享规则，应由 CSS-in-JS 库自己的资源层负责，不在 insertion callback 内通过 State setter“修正”依赖。

### setup/cleanup 交错

官方测试 S7 证明多个 insertion Effect 会先完成 insertion 阶段，再进入 layout 阶段；更新多个组件时，一个组件的 insertion cleanup/setup 与其 layout cleanup 可能在另一个组件的 insertion cleanup/setup 之前完成。课程应把顺序讲成“逐组件交错且整体早于 layout”，不能简化成以下错误模型：

```text
所有组件 cleanup -> 所有组件 setup -> 所有组件 layout cleanup -> 所有组件 layout setup
```

更准确的模型是：

```text
组件 A: insertion cleanup -> insertion setup -> layout cleanup
组件 B: insertion cleanup -> insertion setup -> layout cleanup
之后才进入本轮 layout setup
```

具体遍历顺序不是应用可以依赖的稳定排序；库只应依赖公开的相对阶段和自己的资源所有权。

## 为什么是 CSS-in-JS 的专用时机

### 三种样式交付方式

React Reference S1 将 CSS-in-JS 常见方式分为三类：

1. 编译器在构建期提取为静态 CSS 文件。
2. 在元素上使用 inline style，例如 `style={{ opacity: 1 }}`。
3. 运行时插入 `<style>` 标签。

React 推荐前两种组合：静态规则进入 CSS 文件，单个元素的动态值进入 inline style。运行时插入有两个无法同时消除的成本：浏览器会更频繁地重算样式，并且若发生在错误的 React 生命周期时机，可能非常慢。`useInsertionEffect` 只改善第二项时机问题，不把运行时插入变成首选方案（S1）。

### 何时选静态 CSS

固定选择器、固定主题、不会由运行时输入生成的规则，应在构建期提取。这样浏览器可按普通样式表加载，组件 render 不需要接触 Document，StrictMode 和中断 render 也不会产生额外 style 节点。

### 何时选 inline style

只影响一个元素、值直接来自 props 或 State、无需共享选择器和复杂规则的动态值，可直接放在 JSX 的 `style` 属性中。它不需要 insertion callback，也不需要自己管理 style 节点生命周期。

### 何时才进入运行时注入

只有 CSS-in-JS 库在浏览器运行时必须生成选择器、组合规则或复用共享规则，并且规则需要在其他组件的 layout Effect 运行前可见时，才进入本 Hook 范围。即便如此，库仍应尽可能提取静态部分，并把可直接表达的单元素值留在 inline style。

## 与相邻执行位置的区别

| 位置 | 可以做什么 | 本课为什么不选择它 |
| --- | --- | --- |
| render | 纯计算 JSX 和规则描述 | 不能写 Document；非阻塞 render 可能被反复执行，运行时写 style 会造成每帧重算和重复资源（S1） |
| `useInsertionEffect` | CSS-in-JS 在 layout Effect 前插入/清理规则 | 不能更新 State、读 Ref、读布局或假设 DOM 更新时机；只承担样式资源窗口（S1） |
| `useLayoutEffect` | 读取已提交布局、在重绘前完成必要同步修正 | 时机晚于 insertion；它不是 CSS-in-JS 规则插入 API，且代码和 State 更新会阻塞重绘（S3） |
| `useEffect` | 与外部系统同步的常规副作用 | 对运行时样式太晚，其他布局 Effect 可能先读取旧样式；普通请求、订阅和一般 DOM 外部同步仍应优先使用它（S2） |

“早于 layout”不是“更强的 layout Effect”。`useInsertionEffect` 不能替代布局测量；`useLayoutEffect` 也不能替代 CSS-in-JS 的专用插入时机。

## Ref、DOM 与 Document 所有权

### Ref 尚未附加

S1 明确说明 callback 执行时 Ref 尚未附加。即使组件 JSX 中写了 `ref={nodeRef}`，也不能在 insertion callback 中读取 `nodeRef.current` 来得到业务元素、容器或其 `ownerDocument`。这一限制同时排除了 `getBoundingClientRect`、`offsetWidth` 和以查询结果决定规则的做法。

### DOM 更新时机不可假设

`useInsertionEffect` 可能在 DOM 更新前或更新后运行。它只提供相对于 layout Effect 的窗口，不承诺业务 DOM 已匹配当前 render。任何依赖“刚渲染的卡片已经存在”的逻辑都应移到合适的 DOM 阶段；样式注入只应接触自己要创建的 style 资源。

### 目标 Document 是显式集成合同

React Reference 没有为 `useInsertionEffect` 提供 `ownerDocument` 参数。样式节点必须进入实际承载被样式化内容的 Document；否则节点可能被插入宿主文档，却不影响 iframe 或其他同源 Document 中的元素。这个结论是 DOM 资源所有权的集成设计，不是 React Hook 额外承诺。

因此 CSS-in-JS 库应在 root/宿主配置层明确目标 Document，并在 callback 中使用该目标创建 style。不要尝试在 callback 里从业务 Ref 推导 Document。当前课程 Demo 只使用一个同源 Document，所有节点计数、规则文本和 computed style 都在同一 Document 内完成；跨 iframe 的自动推导不在范围内。

### style 节点身份

推荐让 setup 捕获它创建的具体 `HTMLStyleElement`，cleanup 对该对象调用 `remove()`。稳定 `data-course-style` 标记只用于公开验收和区分 Demo 资源，不是 cleanup 的查找依据。多个实例即使使用相同标记，也不能互相删除节点。

如果库使用共享节点，节点身份应由共享资源层维护，组件 cleanup 只减少引用；不要同时使用“全局 Set 去重”和“任一组件卸载就删除节点”这两种互相冲突的所有权策略。React 官方示例使用 `isInserted` Set 说明规则去重（S1），本课 Demo 采用独立节点以便清楚展示 cleanup，两者是不同的资源模型。

## SSR、非浏览器环境与 StrictMode

### SSR 边界

Effects 只在客户端运行，服务端 render 不执行 insertion callback（S1、S8）。官方示例建议若服务器需要知道使用过哪些 CSS 规则，就在 render 数据流中收集规则，再由服务器自己的输出流程处理；不能等待 `useInsertionEffect`。

本课不教学服务端样式收集，也不把 `typeof window` 分支塞进 Demo。正文只需给出边界：服务器不会创建本课的 style 节点，客户端 hydration 后才有 insertion callback；服务端收集规则是另一条 render 数据流。

### 非浏览器环境

React Hook 的公共签名不保证存在 `document`。凡是直接调用 `document.createElement`、`document.head.appendChild` 的实现，都明确属于浏览器 DOM renderer 的适用范围。无 DOM renderer、测试环境或服务器若需要同一规则，应通过适配层提供目标 Document 或采用非 DOM 的收集方式；不能把浏览器 Demo 的全局 `document` 当成所有 React 环境的通用对象。

### StrictMode 的冻结表述

React `useEffect` 和 `useLayoutEffect` Reference 都明确写出 StrictMode 开发环境首个真实 setup 前的额外 setup+cleanup 循环（S2、S3）。`useInsertionEffect` Reference 的 Caveats 没有给出这一条公共保证，因此课程不能把“必定二次调用”写进 `useInsertionEffect` API 合同。

固定 React 19.2.8 实现进一步显示：

- `mountInsertionEffect` 使用 `UpdateEffect | HookInsertion`，没有像 `mountLayoutEffect` 那样追加 `MountLayoutDev`。
- Strict Effects 的开发二次路径 `doubleInvokeEffectsOnFiber` 只断开/重连 layout 和 passive effects。

这只能作为当前版本的实现观察，不能替代公共文档，也不能承诺未来 patch 的开发调用次数。正确教学边界是：无论是否开启 StrictMode，setup 和 cleanup 都必须对称；Demo 只验收稳定状态的节点数量和规则，不按 transient setup 次数断言。

## State 更新与 cleanup 返回值

### 不更新 State

S1 直接禁止在 `useInsertionEffect` 内更新 State。React 19.2.8 官方测试 S7 同时覆盖 setup 和 cleanup 调用 setter，并验证开发诊断 `useInsertionEffect must not schedule updates.`。这不是课程可以依赖的生产态异常机制，正文应以公开禁止项为主。

样式模式可以由 State 保存，但 setter 必须发生在事件处理器或正常数据流中：

```tsx
const [mode, setMode] = useState<'neutral' | 'accent'>('neutral')

function handleModeChange() {
  setMode(mode === 'neutral' ? 'accent' : 'neutral')
}

useInsertionEffect(() => {
  // 只消费 mode 并管理样式资源，不调用 setMode。
}, [mode])
```

cleanup 也不能更新 State。否则 cleanup 不再是释放资源，而会从提交阶段反向驱动渲染，破坏插入窗口的职责。

### cleanup 只能返回函数或不返回

S1 允许 setup 返回 cleanup 或不返回；不能返回数字、对象、Promise 或 async 函数。S7 对非法返回值和 Promise 有开发诊断测试。TypeScript 的 `Destructor` 类型会拒绝大多数非 void 返回，但运行时合同仍需在审查和 Demo 中确认。

## TypeScript、linter 与运行时验证边界

`@types/react@19.2.18` 的核心声明为：

```ts
type DependencyList = readonly unknown[]
type EffectCallback = () => void | Destructor
export function useInsertionEffect(effect: EffectCallback, deps?: DependencyList): void
```

### TypeScript 能证明

- callback 是函数，返回值可为空或 cleanup 函数。
- cleanup 不能把 `Promise` 当作合法返回值（严格类型配置下）。
- `styleElement.textContent` 接收字符串；规则模式可以限制为 `'neutral' | 'accent'`。
- 依赖数组中的表达式是可表达的 TypeScript 值，`targetDocument` 可以标注为 `Document`。
- 函数的 props、State 和规则映射之间的联合类型关系。

### TypeScript 不能证明

- Hook 是否在组件顶层、是否违反 Rules of Hooks。
- insertion callback 是否早于 layout Effect。
- callback 或 cleanup 是否调用了 State setter。
- Ref 在 callback 时是否已附加。
- DOM 是否已更新、style 节点是否进入了正确的 Document。
- cleanup 是否删除了本次 setup 的节点，或是否误删了其他实例。
- 依赖是否语义完整、是否因对象/函数身份而不必要地重跑。
- 运行时节点数、规则文本和 computed style 是否一致。

React Reference 提到配置 React 的 linter 可以检查 reactive values 是否完整，但 linter 仍不替代资源所有权和浏览器行为验证。课程应把 TypeScript、静态 AST、官方合同和浏览器检查分工写清楚。

## 固定源码与官方测试推导

### 公共分派与独立 Hook 标签

S4 的固定 Flow 源码接收 `create` 和可选依赖，返回 `void`，再把调用转交当前 dispatcher。S5 的 mount/update 函数均调用 `mountEffectImpl`/`updateEffectImpl`，但标签使用 `HookInsertion`。这说明 React 为 insertion 建立了独立效果类别，但应用不能读取这些私有标签。

### 提交阶段相对顺序

S6 的 mutation 提交分支先执行 insertion cleanup，再执行 insertion setup，随后才执行 layout cleanup。S7 的官方测试用可观察日志证明：首次提交中所有 insertion setup 先于 layout setup；更新中 insertion cleanup/setup 与 layout cleanup 交错，但 insertion 阶段整体先于 layout setup。

### Snapshot 与服务端

S7 还验证更新时 insertion cleanup/setup 在 class snapshot 之后运行。这个事实只用于解释“它不是 render 或 snapshot 之前的 API”，不应让课程扩展到 class lifecycle。S8 的服务器测试把 callback 替换为会抛错的函数，server render 仍完成并给出“不应在 render 中调用”的诊断，证明服务端没有执行该 callback。

### 诊断而非应用合同

S7 中的开发警告、固定 traversal 顺序和 `HookInsertion` 名称都是实现/测试证据。正文可以用它们解释为何规则存在，但不可让学习者依赖警告文本、Fiber 遍历顺序或生产构建是否抛错。

## 未来正文建议结构

正文应围绕一个知识点展开，建议使用 20 个根级章节。每章只回答一个直接问题，标题保持短而可扫描：

1. **课程定位**：谁需要这个 Hook，哪些工作明确不需要。
2. **运行时样式问题**：CSS-in-JS 为什么会需要一个插入窗口。
3. **三种样式方案**：静态提取、inline style、运行时 `<style>` 的选择顺序。
4. **最小调用形态**：setup、可选 cleanup、可选 dependencies 和 `undefined` 返回。
5. **响应式依赖**：reactive value、固定长度数组和 `Object.is`。
6. **一次 setup 的资源所有权**：创建、插入、捕获节点和 cleanup。
7. **依赖变化**：旧规则清理、新规则插入和稳定状态。
8. **早于 layout Effect**：它能解决什么时机问题。
9. **不能读 Ref**：Ref 尚未附加的直接后果。
10. **不能假设 DOM 更新**：不查询业务节点、不读取布局。
11. **不能更新 State**：事件数据流与 insertion callback 的职责分离。
12. **render、layout、passive 对照**：四个位置的选择边界。
13. **多个组件的交错**：insertion cleanup/setup 的逐组件交错。
14. **StrictMode**：公共文档、固定实现和课程验收的三层边界。
15. **style 节点身份**：闭包捕获节点，禁止全局选择器清理。
16. **共享资源所有权**：独立节点和共享节点的清理差异。
17. **目标 Document**：同源 iframe、portal 或多 root 集成时的显式目标。
18. **SSR 与非浏览器环境**：callback 不在服务器运行，收集规则另走 render。
19. **TypeScript 与验证分工**：类型、linter、AST 和浏览器各自能证明什么。
20. **观察与选型总结**：用 Demo 结果复述规则，而不是背内部实现。

每章都应给出可运行片段或可核对的结果；避免把源码实现、生产登记过程和无关生态信息放进学习者内容。

## 完整易错项建议

每个易错项都应包含触发条件、错误原因、可观察后果、正确边界和验证方式。建议冻结以下 10 项：

### 1. 把它当成普通应用的默认 Effect

- 触发：请求、订阅、日志或一般 DOM 写入放进 `useInsertionEffect`。
- 原因：忽略它是 CSS-in-JS 样式插入的窄时机。
- 后果：常规副作用占用特殊提交阶段，后续维护者误解时序。
- 正确：数据/订阅用 `useEffect`，布局读取用 `useLayoutEffect`，样式优先静态 CSS 或 inline style。
- 验证：先写出要管理的外部资源；资源不是运行时 CSS 规则就排除本 Hook。

### 2. 所有动态值都创建 `<style>`

- 触发：单元素的颜色、宽度或透明度也走全局运行时注入。
- 原因：没有按静态规则、inline 值和共享规则分类。
- 后果：额外样式重算和节点生命周期成本。
- 正确：单元素动态值优先 inline style，只有库级共享规则才考虑运行时插入。
- 验证：为同一需求写三种方案并说明选择理由。

### 3. 在 render 中追加节点

- 触发：组件函数执行时调用 `document.head.appendChild`。
- 原因：把资源写入误当成 JSX 计算。
- 后果：中断/重复 render 产生重复节点，无法对称清理。
- 正确：render 只计算规则，插入和 cleanup 均在 callback 内。
- 验证：AST 扫描 render 函数不得访问 `document` 写入 API。

### 4. 用 `useLayoutEffect` 代替 insertion

- 触发：CSS-in-JS 规则在布局 Effect 中才插入。
- 原因：只看到“重绘前”而忽略“layout Effect 前”的更窄窗口。
- 后果：同一提交中的其他布局读取可能看到旧规则。
- 正确：确实需要运行时规则时用 insertion；布局测量继续用 layout。
- 验证：用固定源码/官方测试说明相对阶段，不靠截图猜测。

### 5. 在 callback 读取 Ref 或测量业务 DOM

- 触发：访问 `ref.current`、`getBoundingClientRect` 或查询卡片节点。
- 原因：忘记 Ref 尚未附加，DOM 更新时机也没有承诺。
- 后果：空 Ref、旧节点或不稳定的尺寸。
- 正确：callback 只管理自己创建的 style 资源。
- 验证：静态扫描禁止 Ref、布局读取和业务查询。

### 6. 在 setup 中调用 State setter

- 触发：插入规则后设置 `ready` 或同步模式 State。
- 原因：把提交阶段资源操作当成数据源。
- 后果：违反公开合同，开发环境可能给出诊断。
- 正确：由事件更新模式，下一次 setup 消费依赖。
- 验证：检查 callback 闭包及其调用链，不出现 setter。

### 7. 在 cleanup 中调用 State setter

- 触发：清理旧节点时写入“已卸载”或计数 State。
- 原因：把释放动作反向连接到渲染。
- 后果：依赖变化/卸载阶段触发额外更新，破坏资源边界。
- 正确：cleanup 只释放本轮资源或共享资源使用权。
- 验证：固定测试和 AST 同时检查 setup、cleanup 两个方向。

### 8. 用全局 selector 清理 style

- 触发：cleanup 执行 `document.querySelector('style[data-runtime]')?.remove()`。
- 原因：没有保存 setup 创建的节点身份。
- 后果：误删其他实例，自己创建的节点反而残留。
- 正确：闭包捕获具体节点；共享节点使用引用计数或资源层所有权。
- 验证：创建两个实例，卸载一个后另一个规则仍在。

### 9. 把全局 `document` 当成目标 Document

- 触发：内容在 iframe/多 root 中，却总向宿主 `document.head` 插入。
- 原因：试图从不可用 Ref 推导容器，或没有显式传入目标 Document。
- 后果：style 节点数量看似正确，实际内容没有被样式化。
- 正确：在宿主配置层确定目标 Document；callback 只使用该目标。
- 验证：在两个同源 Document 中分别挂载，分别检查节点和 computed style。

### 10. 依赖和 StrictMode 断言写错

- 触发：省略实际依赖、使用每次新建对象，或把开发调用次数当作公共保证。
- 原因：混淆 `Object.is` 依赖语义和 StrictMode 实现细节。
- 后果：规则 stale、无意义重插入或脆弱测试。
- 正确：依赖列出真实 reactive value；StrictMode 只验收对称 cleanup 后的稳定状态。
- 验证：模式切换、同值更新、卸载、重挂载各跑一次，并记录最终节点和规则。

## 结构化练习建议

建议使用 6 组练习，每组有输入、操作、结果和解释，不把练习变成生产过程检查：

### 练习一：方案选择矩阵

给出四个需求：固定按钮主题、由滑块决定单个元素宽度、多个组件共享动态选择器、服务器收集本次 render 用到的规则。学习者分别选择静态 CSS、inline style、`useInsertionEffect` 或 render 数据收集，并写出排除另外三项的理由。

### 练习二：最小单节点实现

从空组件开始实现 `neutral`/`accent` 两套规则。要求只调用一次 insertion Effect，style 节点带稳定公开标记，cleanup 删除捕获节点，按钮事件才调用 setter。验收 setup、依赖和返回值。

### 练习三：依赖变化与同值更新

先提交 neutral，再切 accent，再切回 neutral，最后以相同 mode 值触发无关 render。记录每次稳定提交的 style 节点数、规则文本和 computed style，解释为什么同值依赖不应产生新规则。

### 练习四：交错顺序推理

阅读两个组件各有 insertion/layout Effect 的日志，预测首次提交和同时更新时的阶段边界。答案必须写出“insertion 整体早于 layout setup”和“组件间 cleanup/setup 可交错”，不能写成全局批处理顺序。

### 练习五：Document 与资源所有权

在两个同源 Document 中各挂载一个 root，设计 `targetDocument` 注入合同。再设计两个消费者共享一个 style 节点的引用释放规则，说明卸载第一个消费者时为什么不能删除节点。

### 练习六：验证能力分类

给出 8 个断言，如“依赖数组长度恒定”“callback 早于 layout”“cleanup 删除本节点”“Hook 在顶层调用”“server callback 执行”。学习者把每项分到 TypeScript、linter/AST、官方合同、固定测试或浏览器运行时，并说明不能越权证明的部分。

## 确定性同源 Demo 合同

### 资产与范围

- Demo ID：`react.core.learn.intermediate.use-insertion-effect.css-in-js-style-insertion-demo`。
- 运行组件：`src/categories/frontend/react/core/demos/use-insertion-effect/css-in-js-style-insertion-demo.tsx`。
- 样式文件：`src/categories/frontend/react/core/demos/use-insertion-effect/css-in-js-style-insertion-demo.css`。
- “查看源码”必须读取运行组件和样式文件本身；禁止复制一份展示专用代码。
- Demo 只观察公开 DOM、`style[data-course-style]`、规则文本和 `getComputedStyle`；不得读取 Fiber、dispatcher 或私有 effect tag。

### 组件合同

1. 顶层只有一个 `styleMode` State，初始值 `neutral`，联合类型为 `'neutral' | 'accent'`。
2. 顶层恰好调用一次 `useInsertionEffect`，依赖数组精确包含 `styleMode`；callback 内创建一个 style 节点，把当前规则写入 `textContent`，追加到目标 Document 的 head，并返回移除该节点的 cleanup。
3. 模式按钮只通过事件数据流切换 State；insertion setup 和 cleanup 都不得调用 State setter。
4. callback 不读取 Ref、布局、业务节点、全局 selector 或其他 style 节点；不使用 `useEffect`、`useLayoutEffect`、timer、Promise、网络、随机数、Context、Reducer、Portal 或 lint 抑制。
5. 规则文本必须同时改变卡片的背景色、边框和内边距；这些变化来自运行时 style 节点，而非卡片 inline style。
6. 每个方法或组件函数上方都有简洁中文职责注释；CSS 使用 Flexbox 和普通流，不使用 `grid`、`gap` 或负 `letter-spacing`。

### 可观察状态序列

| 状态 | 必须观察 |
| --- | --- |
| 冷启动 | `neutral`；Demo Document 内 `style[data-course-style]` 数量为 1；规则文本和 computed style 对应中性值 |
| 切换 `accent` | 旧依赖 cleanup 完成，新规则文本和 computed style 对应强调值；稳定节点数量仍为 1 |
| 切回 `neutral` | 规则文本、背景、边框和内边距恢复初始值；稳定节点数量仍为 1 |
| 组件卸载 | Demo Document 内课程 style 节点数量为 0；宿主页面其他 style 不被删除 |
| 同一 Document 重建 Root | 新实例回到 `neutral`，节点数量恢复为 1；没有上次实例遗留节点 |
| 新 Document | 新 Document 从 0 开始，挂载后只出现自己的 1 个节点；旧 Document 不新增节点 |

在 StrictMode 开发环境运行时，只验收每个稳定状态的最终结果，不记录 insertion setup 的具体调用次数。若短暂节点变化无法避免，应在提交稳定后归零到合同值，且不能留下旧节点。

### 同源与样式验收

- 规则文本中代表的每个 CSS 属性都用 `getComputedStyle` 读取，并与当前 mode 的预期值逐项比较。
- `trimEnd()` 后运行源码与展示源码的字符数、UTF-8 字节数和 SHA-256 必须一致。
- 1440px、390px 和根字号 32px 的代表视口均无横向溢出、裁切或按钮遮挡。
- 浏览器 console error/warning、page error、失败请求和动态请求均为 0；这些是 Demo 质量证据，不是 Hook 公共合同。

## 研究结论

1. `useInsertionEffect` 的价值是为 CSS-in-JS 库提供早于 layout Effect 的运行时规则插入窗口，不是普通 Effect 的“更早版本”。
2. 静态 CSS 和单元素 inline style 仍是推荐默认；运行时 `<style>` 注入无法消除额外样式重算，只能通过正确时机避免生命周期过晚。
3. setup/cleanup/依赖语义与其他 Effect 相似，但 insertion 有公开的 State、Ref、DOM 时机和跨组件 interleaving 限制。
4. 资源 cleanup 必须依据明确的 style 节点身份和所有权；共享规则的库级缓存不能采用任一消费者卸载即删除的简单策略。
5. 目标 Document 必须由集成层明确提供；不能在 insertion callback 中从尚未附加的 Ref 推导它。
6. SSR 不运行该 callback；服务器规则收集必须在 render 数据流中完成，非浏览器环境不能假设存在 `document`。
7. StrictMode 只冻结“cleanup 必须对称、稳定结果必须正确”；额外开发调用次数不作为 `useInsertionEffect` 公共合同，固定源码观察也不应升级为应用承诺。
8. TypeScript 能检查签名、cleanup 返回和值类型，不能检查时机、资源身份、Document 归属或业务语义；需要官方合同、静态检查、固定测试和浏览器证据共同覆盖。

## 未决张力与处理决定

| 张力 | 证据 | 处理决定 |
| --- | --- | --- |
| 官方示例用 `isInserted` Set 去重且不展示逐组件删除；Demo 要求卸载后节点归零 | S1 的运行时示例 vs 课程观察目标 | 研究中明确区分共享库资源模型和 Demo 独立节点模型；正文不把 Demo cleanup 当成所有 CSS-in-JS 库的唯一实现 |
| StrictMode 的常见 Effect 双调用说法与 insertion Reference 不一致 | S1、S2、S3、S9 | 以 S1 公共文档为准，不承诺 insertion 双调用；只要求对称 cleanup，固定源码仅作版本观察 |
| React Hook 不接收目标 Document，Ref 又尚未附加 | S1 | 把 Document 作为 CSS-in-JS 集成层输入，Demo 固定同源 Document；不在 callback 中推导 ownerDocument |
| insertion 早于 layout 但不保证 DOM 已更新 | S1、S6、S7 | 课程只让 callback 管理 style 资源，不读取业务 DOM；布局读取仍归 `useLayoutEffect` |
| TypeScript 的 `DependencyList` 是 `readonly unknown[]`，无法检查依赖完整性 | S1、S10 | 依赖语义由 React linter、代码审查和行为验证补足，不把类型通过当成正确性证明 |
| 跨组件 cleanup/setup 交错使“全局先清后建”假设不成立 | S1、S7 | 资源层使用节点身份和所有权；浏览器验收只断言稳定结果与不残留 |

## 实施前检查清单

- [ ] 课程 frontmatter 仍使用保留 ID，标题为 `useInsertionEffect`，stage/level 改为 advanced，并删除旧路线叙事。
- [ ] 正文具有 20 个根级章节、10 个完整易错项和 6 组结构化练习，且只讲本 Hook 与 CSS-in-JS 插入边界。
- [ ] 正文明确静态 CSS、inline style 优先；不把运行时 style 注入泛化为普通应用方案。
- [ ] 正文明确 setup/cleanup/依赖、早于 layout、Ref 未附加、DOM 时机、State 禁止、interleaving、SSR 和 StrictMode 边界。
- [ ] Demo 保持同源，neutral/accent 切换、style 节点稳定为 1、规则与 computed style 一致、卸载归零、重挂载恢复初始状态。
- [ ] Demo 的样式无 CSS Grid、`gap` 和负字距；新增方法上方有中文职责注释。
- [ ] TypeScript、AST、固定源码、官方测试和浏览器证据的职责没有互相冒充。
- [ ] 只在当前课程闭环后才登记 manifest/Track；本研究记录本身不能证明课程已经发布或完成。

## 参考资料

1. [`useInsertionEffect` Reference](https://react.dev/reference/react/useInsertionEffect) - 参数、依赖、cleanup、CSS-in-JS 选型、时机和限制。
2. [`useEffect` Reference](https://react.dev/reference/react/useEffect) - 普通 Effect、StrictMode 和客户端边界对照。
3. [`useLayoutEffect` Reference](https://react.dev/reference/react/useLayoutEffect) - 布局测量、重绘阻塞和 StrictMode 对照。
4. [React `v19.2.8` `ReactHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react/src/ReactHooks.js#L103-L117) - 公共 Flow 分派。
5. [React `v19.2.8` `ReactFiberHooks.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberHooks.js#L2757-L2783) - insertion 与 layout 的固定 Hook 实现。
6. [React `v19.2.8` `ReactFiberCommitWork.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberCommitWork.js#L2012-L2024) - insertion/layout 提交相对顺序。
7. [React `v19.2.8` `ReactHooksWithNoopRenderer-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L2566-L3049) - 官方时序、交错、返回值和 State 诊断测试。
8. [React `v19.2.8` `ReactDOMServerIntegrationHooks-test.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-dom/src/__tests__/ReactDOMServerIntegrationHooks-test.js#L624-L638) - 服务端不执行 callback。
9. [React `v19.2.8` `ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/1dd4ecbdabf826f527fc9a58c05ea70375b7d170/packages/react-reconciler/src/ReactFiberWorkLoop.js#L4984-L4992) - Strict Effects 固定实现观察。
10. [`@types/react@19.2.18`](https://registry.npmjs.org/@types/react/-/react-19.2.18.tgz) - TypeScript 类型包；`index.d.ts` 中的 `EffectCallback`、`DependencyList` 与 `useInsertionEffect` 声明。
