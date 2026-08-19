---
id: react.core.learn.intermediate.removing-effect-dependencies
type: lesson
title: 移除 Effect 依赖
summary: 把只供外部同步使用的对象移入 Effect，让依赖回到真正决定同步的响应值。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 40
prerequisites:
  - react.core.learn.intermediate.effect-dependencies
related:
  - react.core.learn.intermediate.use-effect
tags:
  - React
  - useEffect
  - Effect 依赖
  - 对象依赖
  - 外部同步
appliesTo: React 19.2
verifiedAt: 2026-08-11
objectives:
  - 能识别只为 Effect 准备、却在每次 render 重建的对象。
  - 能把该对象移入 Effect，并只保留真正决定同步的依赖。
  - 能解释对象身份为什么会造成不必要的重新同步。
  - 能区分移除不必要对象依赖与省略实际读取的响应值。
  - 能验证无关 State 更新不会重新同步外部系统。
recap:
  - 先保留完整依赖，再改写代码以改变 Effect 的实际读取。
  - 在组件体内新建的对象每次 render 都有新身份。
  - 对象只供 Effect 使用时，应在 Effect 内创建并依赖它使用的原始值。
  - 不能靠 lint 抑制、空数组或遗漏响应值减少同步。
  - 读取最新值但不响应变化属于后续 Effect Event 课程。
sources:
  - title: Removing Effect Dependencies
    url: https://react.dev/learn/removing-effect-dependencies
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 通过改变代码让依赖匹配数据流
      - 在 Effect 内创建对象以移除对象依赖
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 依赖来自 Effect 使用的响应值
      - 依赖以 Object.is 比较
  - title: useCallback
    url: https://react.dev/reference/react/useCallback
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 缓存函数不是移除 Effect 依赖的默认方案
---

# 移除 Effect 依赖

## 学习目标

- 找出只为 Effect 准备、却在每次 render 创建的对象。
- 把该对象移入 Effect，让依赖回到真正决定同步的值。
- 解释对象身份为何会使 Effect 频繁重新同步。
- 保持依赖完整，不用遗漏值或抑制 lint 控制执行次数。
- 验证无关 State 更新不会触发外部同步。

## 为什么需要

第 24 课要求 Effect 读取的响应值都必须写进依赖数组。这并不意味着遇到对象依赖时就接受每次 render 都重新同步。
先把依赖写完整，再检查 Effect 是否真的需要读取组件体内那个对象。

如果 `options` 每次 render 都写成新对象，React 会按对象身份发现它变化。即使其中的 `roomId` 没变，Effect 仍会重新
同步。若这个对象只用于同步外部系统，正确的修复是把它放到 Effect 内创建，使 Effect 直接读取真正决定配置的原始值。

## 核心概念

下面的写法完整但会在每次 render 产生新的 `options`：

```tsx
const options = { roomId, protocol: 'https' }

useEffect(() => {
  widget.synchronize(options)
}, [options])
```

`options` 是组件体内的新对象。对象内容相同不代表对象身份相同，因此无关的 `note` 更新也会令 `[options]` 不相等。
不要删除 `options` 依赖，也不要写成空数组；这两种写法都会让依赖和代码读取不一致。

当对象只服务于这个 Effect 时，把它移入 Effect：

```tsx
useEffect(() => {
  const options = { roomId, protocol: 'https' }
  widget.synchronize(options)
}, [roomId])
```

现在 `options` 是 Effect 内部局部值，不是组件 render 的响应值。Effect 直接读取的响应值只有 `roomId`，所以依赖
数组写 `[roomId]`。房间变化仍会同步，编辑其他 State 不会重新同步。

## 用法与示例

### 先让依赖描述真实读取

依赖数组不是可以任意精简的参数。改写前，Effect 读取 `options`，所以 `[options]` 是完整的；改写后，Effect 内部
创建 `options` 并读取 `roomId`，所以 `[roomId]` 才是完整的。顺序不能反过来：先删依赖会隐藏同步错误。

### 只移动 Effect 专用对象

对象要同时满足两个条件才适合移入 Effect：它只被这个 Effect 使用，并且其字段由当前 Effect 已经需要响应的值决定。
若对象还被 render、事件处理器或另一个 Effect 使用，移动它会改变其他代码的数据流；此时应先明确所有消费者，不能
为了缩短依赖数组随意搬动。

```tsx
useEffect(() => {
  const requestOptions = {
    roomId,
    protocol: 'https',
    locale: 'zh-CN',
  }
  widget.synchronize(requestOptions)
}, [roomId])
```

`protocol` 与 `locale` 在这里是 Effect 内部固定配置，不进入依赖。若它们将来来自 Props、State 或组件体内计算值，
就需要把对应响应值加入依赖，而不是继续假设 `[roomId]` 足够。

### 不要用缓存掩盖数据流

`useMemo`、`useCallback` 可以在某些场景稳定对象或函数身份，但本课处理的是更直接的情况：对象根本不需要活在
render 阶段。把它移入唯一使用它的 Effect 更接近数据流，也不额外引入缓存合同。

本课不讨论“读取最新值但不因变化重新同步”。这种非响应逻辑应留给第 26 课的 Effect Event；不要用遗漏依赖或
稳定对象身份替代它。

## 用法示例或 Demo

下面的 Demo 中，`options` 仅用于外部 Widget 同步，因此它在 Effect 内创建，依赖只保留 `roomId`。切换房间会增加
同步版本；编辑备注只重新渲染界面，版本保持不变。

:::demo{id="react.core.learn.intermediate.removing-effect-dependencies.options-sync-demo"}
:::

## 易错使用提示

:::pitfalls
### 错误：先从依赖数组删除对象

**触发条件：** Effect 仍读取 `options`，却把依赖改为 `[]` 或只保留部分字段。

**原因：** 依赖与当前代码读取不再一致。

**后果：** 房间变化后，外部系统继续使用旧配置。

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

**验证方式：** 单独切换房间，确认外部快照更新。

### 错误：把对象移入 Effect，却漏掉其来源

**触发条件：** `options` 在 Effect 内使用 `roomId`，依赖却仍写成 `[]`。

**原因：** 对象本身不再是依赖，不代表它使用的响应值消失。

**后果：** Effect 仍会闭包捕获首次房间。

**错误示例：**

```tsx
useEffect(() => {
  const options = { roomId }
  widget.synchronize(options)
}, [])
```

**正确写法：**

```tsx
useEffect(() => {
  const options = { roomId }
  widget.synchronize(options)
}, [roomId])
```

**验证方式：** 比较 Effect 内响应读取集合与依赖数组。

### 错误：为了稳定对象先引入缓存

**触发条件：** 对象只被一个 Effect 使用，却先用 `useMemo`、`useCallback` 或 lint 抑制固定身份。

**原因：** 把本可局部化的配置扩展为 render 阶段的额外合同。

**后果：** 代码更难阅读，依赖变化仍需额外推理。

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

**验证方式：** 编辑无关备注，确认同步版本不变。
:::

## 源码推导与适用场景

1. **官方事实：** Effect 依赖必须匹配代码实际读取的响应值；若要改变依赖，应先改变代码。
   **课程推导：** `options` 被移入 Effect 后，不再是组件作用域读取，依赖改为它真正使用的 `roomId`。
   **边界：** 不能先删除 `[options]`，再假设同步仍然正确。
2. **官方事实：** 组件体每次 render 创建的新对象身份不同。**课程推导：** 只供一个 Effect 使用的对象没有必要
   存在于 render 阶段，局部创建能避免无关 `note` render 改变对象身份。**边界：** 被 render、事件处理器或多个
   Effect 共用的对象不能直接移动。
3. **适用场景：** 外部 Widget、连接或浏览器 API 需要一组只供本次同步使用的配置，而配置由当前 Effect 已响应的
   原始值组成。若需要读取最新值但不因其变化重新同步，应留给后续 Effect Event；没有外部系统时先判断是否无需
   Effect。

## 练习

:::exercise
### 区分房间变化和无关备注

**要求：** 在 Demo 中先输入一段备注，再切换到 `beta`，随后再修改备注并重置。不要修改依赖数组，也不要添加
`useMemo`、`useCallback` 或新的 Effect。

**验收：** 两次备注修改都不增加同步版本；切换房间只增加一次并让 Widget 快照变为 `beta`；重置恢复
`alpha`、空备注和版本 `1`。
:::

## 本节小结

1. 第一步永远是让依赖完整地描述当前代码读取。
2. 组件体内新建对象会在每次 render 获得新身份。
3. 对象只供一个 Effect 使用时，在 Effect 内创建它。
4. 移动对象后，依赖应列出对象使用的真实响应值。
5. 省略依赖、抑制 lint、缓存函数或读取最新值的需求都不是这条主线的替代方案。

## 参考资料

- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) - 先改写代码，再让依赖匹配真实读取。
- [`useEffect`](https://react.dev/reference/react/useEffect) - 响应依赖与 `Object.is` 比较规则。
- [`useCallback`](https://react.dev/reference/react/useCallback) - 缓存函数的适用边界，不是本课默认解法。
