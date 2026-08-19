---
id: engineering.vite.learn.basics.hmr-model-state-preservation
type: lesson
title: HMR 基本模型与开发期状态保留
summary: 通过接受、清理和失效三类操作理解 HMR 边界，而不把它当成生产能力。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 36
prerequisites:
  - engineering.vite.learn.basics.modes-env-security
related:
  - engineering.vite.reference.hmr-api
tags:
  - HMR
  - import.meta.hot
  - 状态保留
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能区分 accept、dispose、prune 和 invalidate。
  - 能在真实文件更新中观察状态保留与完整 reload 的差异。
sources:
  - title: HMR API
    url: https://vite.dev/guide/api-hmr
    sourceType: api-doc
  - title: Vite HMR Guide
    url: https://vite.dev/guide/features#hot-module-replacement
    sourceType: official-reference
---

# HMR 基本模型与开发期状态保留

## 一、学习目标

- 为一个自接受模块写出最小 `import.meta.hot.accept` 和 dispose 数据保存。
- 解释为什么未接受的更新会沿 import 图向上冒泡或触发页面 reload。

## 二、为什么需要

长表单、复杂调试状态和昂贵初始化不应因每次保存都丢失。HMR 让开发期只替换可接受边界，但它不是
生产更新协议，也不能掩盖模块副作用和清理缺失。

## 三、核心概念

接受更新的模块是 HMR boundary。`hot.data` 跨替换保存小量数据；`dispose` 释放 listener/timer；
`prune` 处理模块从图中移除；`invalidate` 主动放弃当前边界并向上传播。

## 四、分步使用

1. 在示例项目中增加 `import.meta.hot.accept`。
2. 将计数写入 `hot.data`，更新源码后确认计数不归零。
3. 在 dispose 中移除 listener，再反复保存观察无重复回调。
4. 删除模块或制造语法错误，记录 prune/reload 行为。

## 五、建立 HMR 边界

HMR 代码必须放在静态 guard 中，生产构建才能移除开发分支：

~~~~ts
let state = import.meta.hot?.data.state ?? { count: 0 }

export function increment() {
  state.count += 1
  return state.count
}

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose((data) => {
    data.state = state
  })
}
~~~~

accept 表示当前模块能接收自己的更新；dispose 在旧模块被替换前执行；hot.data 把少量可恢复状态交给新模块。
不要把数据库连接、DOM 节点或大型缓存放进 hot.data。

## 六、清理副作用

模块创建定时器或事件监听时，更新前必须释放旧资源：

~~~~ts
const onResize = () => console.log(window.innerWidth)
window.addEventListener('resize', onResize)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('resize', onResize)
  })
}
~~~~

无法安全接受更新时调用 invalidate，让更新继续向 importer 传播，必要时触发整页刷新。

## 七、可运行示例

:::demo{id="engineering.vite.learn.basics.hmr-model-state-preservation-demo"}
修改计数与草稿后继续操作，观察业务状态与模块生命周期状态的区别。
:::

这个示例用于理解状态保存模型。实际开发时，框架插件通常已经为组件提供 HMR 边界，应用代码只需为自定义模块副作用
补充清理逻辑。

## 八、易错使用提示

:::pitfalls
### 错误：无条件访问 import.meta.hot

**触发条件：** 生产代码直接调用 `import.meta.hot.accept()`。

**原因：** 生产构建中 hot 上下文可能不存在。

**后果：** 运行时异常或无法 tree-shake。

**错误示例：**

~~~~text
import.meta.hot.accept()
~~~~

**正确写法：**

~~~~text
if (import.meta.hot) { import.meta.hot.accept(...) }
~~~~

**验证方式：** 同时运行 dev 和 build，检查 build 不含 hot 访问副作用。
:::

## 九、工作原理与适用边界

1. **官方事实：** HMR API 要求条件守卫，并区分 accept/dispose/prune/invalidate。
2. **课程推导：** 状态保留只能保存可序列化的小数据，资源必须在 dispose 中清理。
3. **边界：** HMR 证据不等于生产部署、SSR 或浏览器兼容性证据。

## 十、练习

:::exercise
### 练习目标

**要求：** 设计一个订阅模块的 HMR 边界，列出保存数据、清理资源和无法接受更新时的降级路径。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- HMR 是开发期模块边界协议，接受更新也必须配套清理和失败路径。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface CounterState {
  count: number
  schemaVersion: 1
}

let state: CounterState = import.meta.hot?.data.state ?? { count: 0, schemaVersion: 1 }

/** 增加并返回当前计数。 */
export function increment(): number {
  state.count += 1
  return state.count
}

/** 输出当前窗口尺寸，演示需要清理的模块副作用。 */
function onResize(): void {
  console.log(window.innerWidth)
}

window.addEventListener('resize', onResize)

if (import.meta.hot) {
  import.meta.hot.accept((nextModule) => {
    if (!nextModule) return
    console.log('模块已更新，当前计数：', nextModule.increment())
  })

  import.meta.hot.dispose((data) => {
    data.state = state
    window.removeEventListener('resize', onResize)
  })

  import.meta.hot.prune(() => {
    window.removeEventListener('resize', onResize)
  })

  if (state.schemaVersion !== 1) {
    import.meta.hot.invalidate('状态结构已经改变，需要由上层重新初始化')
  }
}
~~~~
:::

## 十二、参考资料

- [HMR API](https://vite.dev/guide/api-hmr) - hot interface 和条件守卫。
- [Features](https://vite.dev/guide/features#hot-module-replacement) - HMR 工作流。
