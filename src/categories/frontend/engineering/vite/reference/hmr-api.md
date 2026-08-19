---
id: engineering.vite.reference.hmr-api
type: reference
title: Vite HMR API
summary: 查阅模块接受、清理、移除、跨替换数据、失效与自定义事件接口。
domain: frontend
technology: engineering
module: vite
group: programmatic-api
signature: |-
  if (import.meta.hot) {
    import.meta.hot.accept()
    import.meta.hot.dispose((data) => {})
  }
related:
  - engineering.vite.learn.basics.hmr-model-state-preservation
tags:
  - Vite
  - HMR API
  - import.meta.hot
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 HMR API
    url: https://vite.dev/guide/api-hmr
    sourceType: api-doc
    appliesTo: Vite 8.2.1
anchors:
  - hotaccept
  - hotdispose
  - hotprune
  - hotdata
  - hotdecline
  - hotinvalidate
  - hoton
  - hotoff
  - hotsend
---

# Vite HMR API

所有调用必须放在 `if (import.meta.hot)` 静态 guard 中，使生产构建可以移除分支。HMR 只属于开发期；正确性
证据必须包含真实文件更新与 WebSocket/页面状态，不能由静态截图替代。

## 一、hot.accept

无参数接受自身，依赖数组形式接受指定模块并在 callback 中读取新模块。callback 失败或边界不完整会向上失效。

**最小示例：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.accept((module) => console.log(module))
}
~~~~

## 二、hot.dispose

模块被替换前运行，用于清除 timer/listener 并把少量可序列状态写入 data。重复更新后应确认没有累积副作用。

**最小示例：**

~~~~ts
const timer = window.setInterval(update, 1000)
if (import.meta.hot) {
  import.meta.hot.dispose(() => window.clearInterval(timer))
}
~~~~

## 三、hot.prune

模块不再被模块图引用时运行，适合清除只在模块永久移除时释放的资源；它不同于每次替换都会运行的 dispose。

**最小示例：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.prune(() => console.log('模块已移除'))
}
~~~~

## 四、hot.data

同一模块后续实例可读取的持久对象。只保存开发期恢复所需的小量状态，不应存放不可回收资源或生产数据。

**最小示例：**

~~~~ts
const state = import.meta.hot?.data.state ?? { count: 0 }
if (import.meta.hot) {
  import.meta.hot.dispose((data) => { data.state = state })
}
~~~~

## 五、hot.decline

当前 Vite 实现中该调用主要用于兼容，不应把它当作可靠的更新阻断策略；需要放弃边界时使用 invalidate。

**最小示例：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.decline()
}
~~~~

## 六、hot.invalidate

主动声明当前更新无法安全处理，并向 importers 传播；可附带诊断消息。测试应同时覆盖可接受和失效路径。

**最小示例：**

~~~~ts
if (import.meta.hot && !canRestoreState()) {
  import.meta.hot.invalidate('状态结构已变化')
}
~~~~

## 七、hot.on

订阅内置或自定义 HMR 事件。自定义事件名应命名空间化，handler 对 payload 做最小运行时检查。

**最小示例：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.on('course:updated', (data) => console.log(data))
}
~~~~

## 八、hot.off

移除与 `on` 相同的事件和 callback 引用。通常在 dispose 中执行，避免热替换后重复订阅。

**最小示例：**

~~~~ts
const event = 'course:updated'
const handler = (data: unknown) => console.log(data)
if (import.meta.hot) {
  import.meta.hot.on(event, handler)
  import.meta.hot.dispose(() => import.meta.hot?.off(event, handler))
}
~~~~

## 九、hot.send

向开发服务器发送自定义事件和可序列 payload。服务端插件需注册对应 channel；该通道不是生产消息系统。

**最小示例：**

~~~~ts
if (import.meta.hot) {
  import.meta.hot.send('course:select', { id: 'vite-hmr' })
}
~~~~

## 十、组合使用示例

下面的示例把本页最常用的接口组合成一条完整使用路径。

~~~~ts
const state = import.meta.hot?.data.state ?? { count: 0 }
const event = 'course:updated'
const handler = (data: unknown) => console.log(data)

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.on(event, handler)
  import.meta.hot.dispose((data) => {
    data.state = state
    import.meta.hot?.off(event, handler)
  })
}
~~~~

## 十一、易错使用提示

:::pitfalls
### 错误：不加静态 guard 直接调用 import.meta.hot

**触发条件：** 在模块顶层无条件执行 `import.meta.hot.accept()`。

**原因：** HMR 上下文只在开发期存在；生产构建需要能静态识别并移除整个分支。

**后果：** 生产运行时可能访问不存在的值，或保留本应删除的开发期代码。

**错误示例：**

```ts
import.meta.hot.accept()
```

**正确写法：**

```ts
if (import.meta.hot) import.meta.hot.accept()
```

**验证方式：** 在 dev 中触发真实文件更新，再检查生产产物不包含对应 HMR 分支。
:::

## 十二、工作原理与适用边界

1. 官方事实：HMR API 通过 `import.meta.hot` 提供 accept、dispose、data、invalidate 与事件通道。
2. 课程推导：热更新正确性必须同时观察文件变更、模块边界、状态和清理，截图只能证明某一静态时刻。
3. 适用边界：HMR 只属于开发期，不承担生产消息、持久化或容错职责。

## 十三、参考资料

- [Vite 8.2.1 HMR API](https://vite.dev/guide/api-hmr) - 支持 HMR guard、生命周期与自定义事件合同。
