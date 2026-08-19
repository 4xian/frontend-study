---
id: engineering.vite.learn.basics.json-worker-and-dynamic-import
type: lesson
title: JSON、Web Worker、动态 import 与代码分割
summary: 用明确的导入语义把数据、后台线程和延迟功能拆成可验证模块。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 36
prerequisites:
  - engineering.vite.learn.basics.css-and-resource-pipeline
related:
  - engineering.vite.reference.features-assets-env
tags:
  - JSON
  - Worker
  - dynamic import
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能区分静态 JSON import、动态 import 和 Worker import。
  - 能从生产产物验证延迟模块被拆成独立 chunk。
sources:
  - title: Vite Features
    url: https://vite.dev/guide/features
    sourceType: official-reference
  - title: Static Asset Handling
    url: https://vite.dev/guide/assets
    sourceType: official-reference
---

# JSON、Web Worker、动态 import 与代码分割

## 一、学习目标

- 用 `import('./feature')` 延迟加载功能，并处理失败状态。
- 用 `new Worker(new URL('./worker.ts', import.meta.url))` 建立构建可追踪的 Worker。

## 二、为什么需要

首屏不应加载用户永远不会打开的工具；计算密集工作也不应阻塞主线程。Vite 对静态 import、动态
import 和 Worker 提供不同的构建语义。

## 三、核心概念

静态 JSON import 会进入当前模块；动态 import 是异步边界，生产期通常形成独立 chunk；Worker 入口
会被单独编译并通过 URL 交给浏览器线程。

## 四、分步使用

1. 静态 import `data.json`，验证命名导出和默认导出。
2. 将大功能改成动态 import，等待 Promise 后渲染。
3. 用 `?worker` 或 `new URL` 创建 Worker，监听 message 并在卸载时 terminate。
4. 构建并检查动态 chunk 与 worker 文件。

## 五、导入 JSON

JSON 可以默认导入，也可以按字段命名导入。默认导入更适合完整配置：

~~~~json
{
  "title": "Vite 课程",
  "lessonCount": 24
}
~~~~

~~~~ts
import course from './course.json'

document.title = course.title
~~~~

外部接口返回的 JSON 仍需要运行时校验，静态导入类型不能验证网络数据。

## 六、用动态 import 拆分功能

只有用户打开高级面板时再加载模块：

~~~~ts
const button = document.querySelector<HTMLButtonElement>('#open-advanced')

button?.addEventListener('click', async () => {
  const { openAdvancedPanel } = await import('./advanced-panel')
  openAdvancedPanel()
})
~~~~

动态 import 会在生产构建中形成异步边界。不要把完全任意的字符串传给 import，路径集合应能在构建时分析。

## 七、创建模块 Worker

~~~~ts
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), {
  type: 'module',
})

worker.postMessage({ query: 'vite' })
worker.addEventListener('message', (event) => {
  console.log(event.data)
})
~~~~

~~~~ts
// src/search.worker.ts
self.addEventListener('message', (event) => {
  const query = String(event.data.query).toLowerCase()
  self.postMessage({ matched: query.includes('vite') })
})
~~~~

new URL(..., import.meta.url) 让 Vite 跟踪 Worker 入口及其资源；生产 base 改变时也能生成正确 URL。

## 八、易错使用提示

:::pitfalls
### 错误：把动态 import 当同步值

**触发条件：** 直接读取 `import('./feature').name`。

**原因：** 动态 import 返回 Promise。

**后果：** 首次渲染得到 Promise 或未定义值。

**错误示例：**

~~~~text
const feature = import('./feature') 后立即使用 feature.run()
~~~~

**正确写法：**

~~~~text
const { run } = await import('./feature') 或在异步状态中消费
~~~~

**验证方式：** 对首次加载和网络失败分别断言 UI 状态。
:::

## 九、工作原理与适用边界

1. **官方事实：** Vite 支持 dynamic import、Worker 查询和 JSON 特性。
2. **课程推导：** 延迟边界必须同时有 loading/error/取消策略。
3. **边界：** chunk 是否合并还受 build 配置和 bundler 策略影响，不能只看源码语法下结论。

## 十、练习

:::exercise
### 练习目标

**要求：** 为一个报表功能设计动态 import 和 Worker 边界，并列出 build 产物中应出现的文件。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- dynamic import 控制加载时机，Worker 控制执行线程，build 产物才是分块结论的证据。

:::code-details{title="查看本节完整示例"}
~~~~text
// src/course.json
{ "title": "Vite 课程", "lessonCount": 24 }

// src/search.worker.ts：独立 Worker 入口
self.addEventListener('message', (event: MessageEvent<{ query: string }>) => {
  const query = event.data.query.toLowerCase()
  self.postMessage({ matched: query.includes('vite') })
})

// src/advanced-panel.ts：动态 import 的异步功能
/** 渲染高级面板。 */
export function openAdvancedPanel(): void {
  document.querySelector('#panel')!.textContent = '高级面板已加载'
}

// src/main.ts
import course, { lessonCount } from './course.json'

document.title = course.title
console.log(`共 ${lessonCount} 节课`)
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' })
worker.addEventListener('message', (event) => console.log(event.data))
worker.postMessage({ query: 'Vite Worker' })

const button = document.querySelector<HTMLButtonElement>('#open-advanced')
button?.addEventListener('click', async () => {
  button.disabled = true
  try {
    const { openAdvancedPanel } = await import('./advanced-panel')
    openAdvancedPanel()
  } catch (error) {
    console.error('高级面板加载失败', error)
  } finally {
    button.disabled = false
  }
})

window.addEventListener('pagehide', () => worker.terminate(), { once: true })

// 执行 vite build 后，通过 manifest/产物确认 advanced-panel 与 worker 的输出关系
~~~~
:::

## 十二、参考资料

- [Features](https://vite.dev/guide/features) - JSON、dynamic import 和 glob/Worker。
- [Web Workers](https://vite.dev/guide/features#web-workers) - Worker 入口和查询。
