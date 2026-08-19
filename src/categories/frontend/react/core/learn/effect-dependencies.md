---
id: react.core.learn.intermediate.effect-dependencies
type: lesson
title: Effect 依赖与稳定化
summary: 从 Effect 的实际读取识别响应值，并通过直接改写代码减少不必要的对象与函数依赖。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - react.core.learn.intermediate.unnecessary-effects
related:
  - react.core.learn.intermediate.use-effect
  - react.core.learn.intermediate.effect-events
tags:
  - React
  - useEffect
  - Effect 依赖
  - 响应值
  - exhaustive-deps
  - 对象依赖
  - 函数依赖
  - 稳定化
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能从 setup 与 cleanup 的读取中找出全部响应值。
  - 能写出固定长度、内联且完整的依赖数组。
  - 能区分模块常量、稳定值、响应值与无关 State。
  - 能解释 Object.is 比较与陈旧闭包之间的关系。
  - 能把依赖检查当作同步正确性约束，而不是执行次数开关。
  - 能识别只供一个 Effect 使用、却在每次 render 创建的新对象或函数。
  - 能先改变代码读取边界，再让依赖数组回到真正决定同步的响应值。
recap:
  - 依赖由 Effect 读取的响应值决定，不能按期望次数手选。
  - props、state、Context 和组件体内变量或函数都可能是响应值。
  - React 按位置使用 Object.is 比较固定长度依赖数组。
  - 漏项会保留旧 render 的闭包，抑制 lint 不会修复同步关系。
  - 无关 State 不进入清单；只供 Effect 使用的动态对象或函数可以移入 Effect。
sources:
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 响应依赖、固定长度内联数组与 Object.is 比较
      - 空数组和省略第二参数的区别
  - title: Lifecycle of Reactive Effects
    url: https://react.dev/learn/lifecycle-of-reactive-effects
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 组件体内值的响应性与完整依赖
      - 模块常量、稳定值和可变 ref 的边界
  - title: exhaustive-deps
    url: https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 缺失依赖与陈旧闭包
  - title: Removing Effect Dependencies
    url: https://react.dev/learn/removing-effect-dependencies
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 改变周围代码后再让依赖匹配真实读取
      - 只供 Effect 使用的动态对象和函数可以移入 Effect
  - title: useCallback
    url: https://react.dev/reference/react/useCallback
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 函数缓存属于性能优化，不是依赖正确性的默认修复
  - title: React 19.2.8 Effect dependency comparison
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本按位置比较依赖并检查长度
  - title: React 19.2.8 Effect update
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L2615-L2669
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本在依赖相等时跳过 Effect 标记
  - title: React 19.2.8 Object.is implementation
    url: https://github.com/facebook/react/blob/v19.2.8/packages/shared/objectIs.js#L10-L24
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本 Object.is 入口
  - title: React 19.2.8 Effect dependency tests
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1767-L1855
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 省略依赖、依赖未变与任一依赖变化的测试证据
---

# Effect 依赖与稳定化

## 一、学习目标

- 从 Effect 的 setup 和 cleanup 中找出全部响应值。
- 写出固定长度、内联且完整的数组，并识别模块常量、稳定 setter 与 Ref 的边界。
- 解释 `Object.is` 比较与依赖缺失导致陈旧闭包的原因。
- 用两个相关输入和一个无关输入验证依赖清单。
- 识别对象和函数身份造成的不必要重新同步。
- 通过移动只供一个 Effect 使用的对象或函数，保留真正的响应依赖。

## 二、为什么需要

确认某段代码确实需要 Effect 后，下一个问题不是“希望它运行几次”，而是“这个同步过程读取了哪些当前 render 的
值”。聊天连接同时读取 endpoint 与房间 ID，就必须在任一值变化后重新同步。漏掉其中一项，界面可能已经显示
新值，外部系统却仍保留旧闭包中的组合。

依赖数组不是调度偏好。它是 Effect 代码与 React 之间的同步说明：代码读取什么，清单就声明什么。

对象和函数也要先按这条规则如实声明。组件函数每次 render 都会执行；如果在组件体内创建一个只给 Effect 使用的
对象，Effect 读取的是这个对象，`[options]` 就是完整清单。即使对象字段相同，它的身份也可能已经改变，导致无关
render 重新同步。解决方法不是删掉依赖，而是先把对象移入 Effect，让 Effect 直接读取真正决定配置的原始值。

## 三、核心概念

```tsx
const endpoint = ENDPOINTS[region]

/** 让外部 Widget 跟随当前 endpoint 与 roomId。 */
useEffect(() => {
  widget.synchronize(endpoint, roomId)
}, [endpoint, roomId])
```

`endpoint` 虽然由 `region` 计算而来，不是单独的 State，但它在组件体内随 render 变化，仍是响应值。`roomId` 是
State，也是响应值。Effect 直接读取二者，因此清单精确包含二者。

可以按固定步骤检查：

1. 圈出 setup 和它返回的 cleanup。
2. 标出其中读取的 props、state、Context，以及组件体内声明或计算出的变量与函数。
3. 把实际读取的响应值逐项写进内联数组。
4. 再确认数组长度与顺序在每次 render 间固定。

## 四、用法与示例

### 1. setup 与 cleanup 一起检查

cleanup 也属于同一个 Effect 闭包。即使某个值只在 cleanup 中使用，它仍需要进入清单：

```tsx
/** 建立当前房间连接，并对称关闭同一 endpoint。 */
useEffect(() => {
  const connection = connect(endpoint, roomId)
  return () => disconnect(endpoint, connection)
}, [endpoint, roomId])
```

### 2. 组件体内的派生值也会响应

模块级不可变常量不会随 render 改变；组件体内从 props 或 state 得到的值会改变：

```tsx
const ENDPOINTS = { north: '/north', south: '/south' } as const

/** 当前 render 根据 region 得到 endpoint。 */
function Room({ region, roomId }: { region: keyof typeof ENDPOINTS; roomId: string }) {
  const endpoint = ENDPOINTS[region]

  useEffect(() => {
    connect(endpoint, roomId)
  }, [endpoint, roomId])

  return null
}
```

依赖写 `endpoint`，因为这是 Effect 实际读取的值。只有确认某个对象或函数只供该 Effect 使用时，才通过改变创建
位置让清单回到原始响应值；不能在没有改代码的情况下直接删掉 `endpoint`。

### 3. 不是所有 State 都要进入清单

依赖不是组件 State 的全集。若 Effect 没有读取 `note`，编辑备注只会产生一次无关 render，不应重新同步：

```tsx
const [note, setNote] = useState('')

useEffect(() => {
  widget.synchronize(endpoint, roomId)
}, [endpoint, roomId])
```

### 4. React 如何判断变化

React 按相同位置使用 `Object.is` 比较前后依赖。`[endpoint, roomId]` 两项都相同，就不需要为这个清单重新同步；
任一项不同，就会使用新 render 的闭包执行 Effect。数组必须内联且长度固定，不能条件添加、展开或排序。

- `[]` 只适用于 setup 与 cleanup 没有读取任何响应值的 Effect。
- 省略第二参数表示每次 commit 后都运行，不表示 React 自动推导依赖。
- React 保证稳定的 State setter 和 Ref 对象可以省略；`ref.current` 的变化本身不会触发 render。

### 5. 对象和函数依赖先完整声明

下面的写法没有漏项：Effect 直接读取了组件体内的 `options`，所以必须声明 `[options]`：

```tsx
const options = { roomId, protocol: 'https' }

/** 使用当前对象配置同步外部系统。 */
useEffect(() => {
  widget.synchronize(options)
}, [options])
```

但每次 render 都会创建一个新对象。用户只修改无关备注时，`roomId` 没变，`options` 的身份仍然不同，外部系统会
被不必要地重新同步。函数也有同样的身份规则：如果 Effect 直接读取组件体内每次 render 新建的函数，依赖数组必须
如实包含它，不能把 `[]` 当成稳定化工具。

### 6. 通过改写代码减少不必要依赖

如果对象只服务于这个 Effect，可以把创建语句移入 setup：

```tsx
/** 让依赖只描述真正决定房间同步的 roomId。 */
useEffect(() => {
  const options = { roomId, protocol: 'https' }
  widget.synchronize(options)
}, [roomId])
```

改写后，`options` 是 Effect 内部的局部值，不再是组件 render 的响应读取；`roomId` 仍然直接被读取，所以必须保留。
若对象还被 JSX、事件处理器或其他 Effect 使用，就不能为了缩短数组随意移动，必须先分别确认每个消费者的所有权。

函数依赖也要先根据实际读取完整声明。下面的 `createOptions` 在每次 render 都会获得新身份，
因此只修改无关备注也会让 Effect 重新同步：

```tsx
/** 为当前 render 构造房间配置。 */
const createOptions = () => ({ endpoint, roomId })

useEffect(() => {
  widget.synchronize(createOptions())
}, [createOptions])
```

如果函数只供这一个 Effect 使用，将它移入 setup，再声明函数真正读取的 `endpoint` 和
`roomId`：

```tsx
useEffect(() => {
  /** 构造当前房间的同步配置。 */
  function createOptions() {
    return { endpoint, roomId }
  }

  widget.synchronize(createOptions())
}, [endpoint, roomId])
```

移动后，函数身份不再是依赖，原始响应值仍然完整保留。若函数还被事件处理器、JSX 或其他 Effect
使用，它不是该 setup 的局部实现细节，不应强行移入。`useMemo` 和 `useCallback` 是性能优化接口，
不应代替这一步数据流改写；读取最新值但不响应变化属于另一种同步边界，本课不使用该 API。

## 五、用法示例或 Demo

下面的 Demo 把区域派生为 endpoint，并用 `[endpoint, roomId]` 同步本地 Widget。切换任一依赖都会更新快照；
输入备注只改变界面，不增加 Effect 同步次数。

:::demo{id="react.core.learn.intermediate.effect-dependencies.dependency-map-demo"}
:::

下面的 Demo 进一步展示只供同步使用的 `options` 在 Effect 内创建。切换房间仍会同步，备注 render 不会增加
Effect 同步次数：

:::demo{id="react.core.learn.intermediate.effect-dependencies.options-sync-demo"}
:::

## 六、易错使用提示

:::pitfalls
### 错误：把空数组当作只运行一次的命令

**触发条件：** Effect 读取当前房间，却为了减少执行写成 `[]`。

**原因：** 空数组声称 Effect 没有响应读取，与实际代码矛盾。

**后果：** 房间变化后，外部系统仍使用首次 render 的值。

**错误示例：**

```tsx
useEffect(() => connect(roomId), [])
```

**正确写法：**

```tsx
useEffect(() => connect(roomId), [roomId])
```

**验证方式：** 切换房间，确认外部快照同步到新值。

### 错误：漏掉 render 中计算的值

**触发条件：** 只检查 Props 和 State，忽略 Effect 读取的 `endpoint`。

**原因：** 组件体内计算出的变量同样属于当前 render。

**后果：** 区域改变后，连接仍停留在旧 endpoint。

**错误示例：**

```tsx
useEffect(() => connect(endpoint, roomId), [roomId])
```

**正确写法：**

```tsx
useEffect(() => connect(endpoint, roomId), [endpoint, roomId])
```

**验证方式：** 单独切换区域，确认 endpoint 快照更新。

### 错误：只检查 setup 的读取

**触发条件：** cleanup 读取 `endpoint`，清单却只包含 setup 使用的 `roomId`。

**原因：** 忘记 setup 与 cleanup 共享同一轮 render 的闭包。

**后果：** 清理可能继续引用旧 endpoint，资源边界与清单不一致。

**错误示例：**

```tsx
useEffect(() => {
  const connection = connect(roomId)
  return () => disconnect(endpoint, connection)
}, [roomId])
```

**正确写法：**

```tsx
useEffect(() => {
  const connection = connect(roomId)
  return () => disconnect(endpoint, connection)
}, [endpoint, roomId])
```

**验证方式：** 同时核对 setup、cleanup 的响应读取集合与数组。

### 错误：把所有 State 都塞进数组

**触发条件：** Effect 不读取备注，却把 `note` 加进依赖作为“保险”。

**原因：** 把依赖误解为可能变化值的全集，而不是实际读取清单。

**后果：** 无关输入也会重新同步外部系统。

**错误示例：**

```tsx
useEffect(() => widget.synchronize(endpoint, roomId), [endpoint, roomId, note])
```

**正确写法：**

```tsx
useEffect(() => widget.synchronize(endpoint, roomId), [endpoint, roomId])
```

**验证方式：** 输入备注，确认 Effect 同步次数不变。

### 错误：关闭依赖检查来保留漏项

**触发条件：** linter 报告缺失依赖后，用抑制注释让报告消失。

**原因：** 抑制静态检查没有改变运行时收到的不完整数组。

**后果：** 旧闭包问题仍存在，未来新增读取也失去提醒。

**错误示例：**

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => connect(endpoint, roomId), [roomId])
```

**正确写法：**

```tsx
useEffect(() => connect(endpoint, roomId), [endpoint, roomId])
```

**验证方式：** 删除抑制并让依赖检查通过，再分别改变每项依赖。

### 错误：直接删除对象或函数依赖

**触发条件：** Effect 仍然读取组件体内的 `options` 或 `createOptions`，却直接从数组删除它。

**原因：** 依赖数组与当前代码读取不一致；数组变短没有改变对象仍被读取的事实。

**后果：** 房间变化可能继续使用旧配置，或者同步关系被静默隐藏。

**错误示例：**

```tsx
const options = { roomId }
useEffect(() => widget.synchronize(options), [])
```

**正确写法：**

```tsx
useEffect(() => {
  widget.synchronize({ roomId })
}, [roomId])
```

**验证方式：** 先确认对象只供该 Effect 使用，再检查房间切换是否更新外部快照。

### 错误：用 useMemo 或 useCallback 掩盖数据流

**触发条件：** 为了让 `[options]` 或 `[send]` 看起来稳定，先加入缓存 Hook。

**原因：** 缓存增加了新的依赖和性能合同，没有回答对象或函数是否应该存在于 render 阶段。

**后果：** 代码更复杂，缓存失效时仍可能重新同步；错误的读取关系没有被修复。

**错误示例：**

```tsx
const options = useMemo(() => ({ roomId }), [roomId])
useEffect(() => widget.synchronize(options), [options])
```

**正确写法：**

```tsx
useEffect(() => {
  widget.synchronize({ roomId })
}, [roomId])
```

**验证方式：** 删除缓存后仍能写出与 Effect 直接读取一致的固定依赖，并验证真正的 `roomId` 变化仍同步。
:::

## 七、源码推导与适用场景

1. **官方事实：** Effect 的依赖是 setup 与 cleanup 中使用的全部响应值，数组必须内联、长度固定，并逐项使用
   `Object.is` 比较。**课程推导：** 先读 Effect 代码再写清单，不能从期望次数反推。**边界：** 对象与函数身份
   引发的额外同步需要先如实声明，再判断是否能改变对象的创建边界。
2. **固定版本推导：** React `v19.2.8` 的 Hook 实现按索引比较依赖，相等时跳过 Effect 标记；官方测试覆盖
   省略、未变化和任一项变化。**课程推导：** 运行时只比较所给数组，不会替作者补全闭包读取。**边界：**
   内部函数名与 flags 不是公共 API。
3. **官方事实：** `exhaustive-deps` 用静态分析发现漏项与陈旧闭包风险。**课程推导：** lint 与运行时比较承担
   不同职责，二者缺一不可。**边界：** 读取最新值但不响应变化属于另一种同步边界，本课不使用该 API。
4. **官方事实：** 只供一个 Effect 使用的动态对象或函数移入 setup 后，依赖可以回到它读取的原始值。**课程推导：**
   先改代码，再重新检查 setup/cleanup 的读取；不能直接删数组项。**边界：** 同时服务 render、事件或多个 Effect
   的对象不能凭这一规则随意移动。
5. **适用场景：** 外部连接、Widget 或浏览器 API 需要跟随多个 React 输入时，使用本课方法核对完整清单；没有
   外部系统时，应先判断是否根本不需要 Effect。

## 八、练习

:::exercise
### 验证两个依赖和一个无关输入

**要求：** 在 Demo 中先切换区域，再切换房间，随后输入备注并重置。不要修改依赖数组，也不要加入新的 Effect。

**验收：** 区域和房间分别让 Effect 同步次数增加一次，Widget 快照始终匹配当前两项依赖；备注变化
不增加次数；重置后恢复 north、alpha 和空备注。
:::

:::exercise
### 消除只供 Effect 使用的对象依赖

**要求：** 找出每次 render 都创建的 `options`，先把它移入唯一的 Effect，再让依赖数组保留真正决定同步的
`roomId`。不要使用 `useMemo`、`useCallback`、空数组或 lint 抑制。

**验收：** 备注更新不增加 Effect 同步次数；房间切换仍同步新配置；代码中的依赖与 Effect 的实际响应读取
一致。
:::

:::exercise
### 消除只供 Effect 使用的函数依赖

**要求：** 将组件体内的 `createOptions` 移入 Effect，再把依赖从 `[createOptions]` 改为该函数实际读取的
`[endpoint, roomId]`。不要删除任何原始响应值。

**验收：** 单独修改备注不会重新同步；改变 endpoint 或 roomId 仍各触发一次同步；依赖数组与 setup 的实际读取
一致。
:::

## 九、本节小结

- Effect 依赖由 setup 与 cleanup 实际读取的响应值决定。
- 组件体内计算值也可能响应；模块常量和稳定对象有明确例外。
- 依赖数组必须内联、固定长度，并按位置使用 `Object.is` 比较。
- 漏项会留下旧闭包，额外加入无关值会制造不必要同步。
- 对依赖不满意时先改写代码；只供 Effect 使用的对象或函数可移入 setup，再让清单匹配新的读取边界。
- `useMemo`、`useCallback` 和 lint 抑制不能替代依赖正确性证明。

## 十、参考资料

- [`useEffect`](https://react.dev/reference/react/useEffect) - 响应依赖、固定长度数组与比较规则。
- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) - 响应值与完整依赖。
- [`exhaustive-deps`](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps) - 缺失依赖与陈旧闭包。
- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) - 先改写代码，再让依赖匹配真实读取。
- [`useCallback`](https://react.dev/reference/react/useCallback) - 函数缓存的性能边界。
- [React 19.2.8 Hook source](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberHooks.js#L454-L500) - 固定版本逐项比较证据。
- [React 19.2.8 Effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L1767-L1855) - 依赖变化测试证据。
