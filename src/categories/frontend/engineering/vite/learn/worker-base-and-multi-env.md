---
id: engineering.vite.learn.intermediate.worker-base-and-multi-env
type: lesson
title: Worker、资源 URL、base 与多环境配置
summary: 让 Worker 和资源在子路径部署及多 mode 下保持正确 URL。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 38
prerequisites:
  - engineering.vite.learn.intermediate.glob-and-generated-modules
related:
  - engineering.vite.reference.config-ssr-worker
  - engineering.vite.reference.features-assets-env
tags:
  - Worker
  - base
  - 多环境
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能构建独立 Worker 并在卸载时释放。
  - 能验证相对、绝对和子路径 base 下的资源 URL。
sources:
  - title: Web Workers
    url: https://vite.dev/guide/features#web-workers
    sourceType: official-reference
  - title: Public Base Path
    url: https://vite.dev/guide/build#public-base-path
    sourceType: official-reference
---

# Worker、资源 URL、base 与多环境配置

## 一、学习目标

- 为 Worker 的主线程/线程入口分别确认 build 输出。
- 在 `/docs/app/` 子路径 preview 中验证 HTML、JS、CSS、Worker URL。

## 二、为什么需要

本地根路径成功不代表部署子路径成功。Worker 还拥有独立入口和插件配置，如果手工拼 URL，base 变化
后最容易出现只在生产暴露的 404。

## 三、核心概念

`new URL('./worker.ts', import.meta.url)` 让 Vite 追踪入口；`worker` 配置影响 worker bundle；`base`
统一控制构建资源前缀，`import.meta.env.BASE_URL` 提供运行时只读值。

## 四、分步使用

1. 创建 Worker 并定义 request/response message。
2. 在组件卸载时 `terminate()`。
3. 分别以 `/` 和 `/docs/app/` 构建。
4. 用 preview 请求所有入口并核对无根路径泄漏。

## 五、创建 Worker 入口

使用 new URL 与 import.meta.url 让 Worker 成为独立构建入口：

~~~~ts
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), {
  type: 'module',
  name: 'course-search',
})

worker.postMessage({ keyword: 'vite' })
worker.addEventListener('message', (event) => {
  console.log(event.data.matches)
})
~~~~

~~~~ts
// src/search.worker.ts
self.addEventListener('message', (event) => {
  const keyword = String(event.data.keyword)
  self.postMessage({ matches: keyword === 'vite' ? 24 : 0 })
})
~~~~

## 六、配置 Worker 构建

worker.plugins 使用函数返回插件数组，避免在主应用和 Worker 构建之间共享有状态插件实例：

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/learning/',
  worker: {
    format: 'es',
    plugins: () => [],
    rolldownOptions: {
      output: {
        entryFileNames: 'assets/worker-[hash].js',
      },
    },
  },
})
~~~~

## 七、处理 base

应用、Worker 和资源都应通过 Vite 生成 URL，不要手写 /assets/worker.js。部署到子路径时只修改 base，
构建器会把入口与资源 URL 一起改写。

## 八、易错使用提示

:::pitfalls
### 错误：手工拼接 Worker 产物名

**触发条件：** `new Worker('/assets/worker.js')`。

**原因：** build 会 hash/重命名文件并应用 base。

**后果：** dev 或子路径部署出现 404。

**错误示例：**

~~~~text
使用固定 /assets/worker.js
~~~~

**正确写法：**

~~~~text
使用 new URL('./worker.ts', import.meta.url) 或官方 worker 查询
~~~~

**验证方式：** 两种 base 的 preview 都应成功收到 message。
:::

## 九、工作原理与适用边界

1. Worker 和资源 URL 都进入 Vite 构建图。
2. 子路径部署必须通过真实 build/preview 证明，普通 dev 截图不够。
3. CDN rewrite、跨域 Worker 和 CSP 需要在目标部署平台配置并检查。

## 十、练习

:::exercise
### 练习目标

**要求：** 把根路径应用迁移到 `/learning/`，列出 HTML、chunk、图片、Worker 四种 URL 的断言。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- 让 Vite 生成 URL，并用目标 base 的真实产物验证所有独立入口。

:::code-details{title="查看本节完整配置"}
~~~~text
// .env.production
APP_BASE=/learning/

// vite.config.ts：mode 决定 base，Worker 使用独立插件实例和输出配置
import { defineConfig, loadEnv } from 'vite'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'APP_')
  return {
    base: env.APP_BASE || '/',
    worker: {
      format: 'es',
      plugins: () => [],
      rolldownOptions: {
        output: { entryFileNames: 'assets/worker-[hash].js' },
      },
    },
  }
})

// src/search.worker.ts
self.addEventListener('message', (event: MessageEvent<{ keyword: string }>) => {
  const keyword = event.data.keyword.toLowerCase()
  self.postMessage({ matches: keyword === 'vite' ? 24 : 0 })
})

// src/main.ts：URL 交给 Vite 生成，不手写产物名
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), {
  type: 'module',
  name: 'course-search',
})
worker.addEventListener('message', (event) => console.log(event.data.matches))
worker.postMessage({ keyword: 'vite' })
window.addEventListener('pagehide', () => worker.terminate(), { once: true })
console.log('当前构建 base：', import.meta.env.BASE_URL)

// 分别使用 / 与 /learning/ 构建并预览；检查 HTML、JS、CSS、图片和 Worker URL
~~~~
:::

## 十二、参考资料

- [Web Workers](https://vite.dev/guide/features#web-workers) - Worker 构建入口。
- [Public Base Path](https://vite.dev/guide/build#public-base-path) - 子路径部署。
