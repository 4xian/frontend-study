---
id: engineering.vite.learn.advanced.backend-integration-and-delivery
type: lesson
title: 后端集成、构建交付与环境注入
summary: 将 Vite 开发中间件和生产 manifest 接入独立后端，并明确环境注入时机。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 42
prerequisites:
  - engineering.vite.learn.advanced.ssr-dev-build-hydration
related:
  - engineering.vite.reference.javascript-api
  - engineering.vite.reference.config-build
tags:
  - 后端集成
  - manifest
  - 环境注入
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能在 dev 嵌入 Vite middleware，在 production 读取 manifest。
  - 能区分 build-time env 和 runtime server injection。
sources:
  - title: Backend Integration
    url: https://vite.dev/guide/backend-integration
    sourceType: official-reference
  - title: Env Variables and Modes
    url: https://vite.dev/guide/env-and-mode
    sourceType: official-reference
---

# 后端集成、构建交付与环境注入

## 一、学习目标

- 后端在开发期委托 Vite 处理模块，在生产期读取 manifest 生成资源标签。
- 选择构建时常量或请求时 HTML 注入，不泄露敏感值。

## 二、为什么需要

传统后端模板仍可使用 Vite，但开发/生产接入完全不同。构建时替换适合公开常量，请求时配置则需要
服务端输出和 CSP/转义边界。

## 三、核心概念

开发期后端使用 Vite middleware；生产期 Vite 不运行，后端读取 manifest 并服务 dist；运行时配置
应由安全的 JSON/HTML 注入或独立 endpoint 提供。

## 四、分步使用

1. 开发分支挂载 `vite.middlewares`。
2. 生产构建开启 manifest。
3. 后端根据入口生成 script/modulepreload/css 标签。
4. 只注入公开的运行时配置，并使用 JSON 安全序列化。

## 五、选择集成方式

开发阶段可以把 Vite 作为中间件挂到后端；生产阶段应读取构建 manifest 并服务 dist。两条路径共用
同一 HTML 模板，但资源来源不同。

## 六、开发中间件

~~~~ts
import express from 'express'
import { createServer as createViteServer } from 'vite'

const app = express()
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

app.use(vite.middlewares)
app.get('*', async (request, response) => {
  const template = await vite.transformIndexHtml(
    request.originalUrl,
    '<div id="app"></div><script type="module" src="/src/main.ts"></script>',
  )
  response.status(200).type('html').send(template)
})

app.listen(3000)
~~~~

请求结束或进程退出时调用 vite.close()，避免 watcher 和 WebSocket 资源泄漏。

## 七、生产读取 manifest

~~~~ts
interface ManifestEntry {
  file: string
  css?: string[]
  imports?: string[]
}

/** 从入口开始收集所有静态 import，避免遗漏共享 chunk 和 CSS。 */
function collectManifestEntries(
  manifest: Record<string, ManifestEntry>,
  entryName: string,
): ManifestEntry[] {
  const pending = [entryName]
  const visited = new Set<string>()
  const entries: ManifestEntry[] = []

  while (pending.length) {
    const name = pending.shift()!
    if (visited.has(name)) continue
    const entry = manifest[name]
    if (!entry) throw new Error(`缺少构建入口：${name}`)
    visited.add(name)
    entries.push(entry)
    pending.push(...(entry.imports ?? []))
  }

  return entries
}

const [entry, ...dependencies] = collectManifestEntries(manifest, 'index.html')
const scripts = '<script type="module" src="/' + entry.file + '"></script>'
const styles = [...new Set([entry, ...dependencies].flatMap((item) => item.css ?? []))]
  .map((file) => '<link rel="stylesheet" href="/' + file + '">')
  .join('')
const preloads = dependencies
  .map((item) => '<link rel="modulepreload" href="/' + item.file + '">')
  .join('')
~~~~

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  appType: 'custom',
  build: {
    manifest: true,
    outDir: 'dist/client',
  },
  server: {
    middlewareMode: true,
  },
})
~~~~

环境配置由部署系统传给后端，再显式注入允许公开的值；不要把服务端密钥写进 define 或 VITE_ 变量。

## 八、易错使用提示

:::pitfalls
### 错误：生产后端仍调用开发中间件

**触发条件：** 部署时启动 Vite dev server 处理全部用户请求。

**原因：** dev server 针对开发反馈，不是生产静态资产服务器。

**后果：** 性能、安全和可用性边界不满足生产要求。

**错误示例：**

~~~~text
production 直接挂载 vite.middlewares
~~~~

**正确写法：**

~~~~text
production 读取构建 manifest 并服务 immutable 产物
~~~~

**验证方式：** 生产进程依赖图中不应启动 Vite dev server。
:::

## 九、工作原理与适用边界

1. Backend Integration Guide 区分 dev script 注入和 production manifest。
2. 运行时注入必须有转义、CSP 和公开字段白名单。
3. 真实网关/TLS/cache 仍需部署环境证据。

## 十、练习

:::exercise
### 练习目标

**要求：** 从 manifest 为一个入口生成 script、modulepreload、stylesheet 标签，并处理缺失入口错误。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- 开发嵌入 Vite，生产消费 manifest；环境注入必须区分构建时和请求时。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装
npm install express
npm install -D vite@8.2.1 @types/express

// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  appType: 'custom',
  build: { manifest: true, outDir: 'dist/client' },
  server: { middlewareMode: true },
})

// server.ts
import express from 'express'
import { readFile } from 'node:fs/promises'
import { createServer as createViteServer } from 'vite'

interface ManifestEntry {
  file: string
  css?: string[]
  imports?: string[]
}

/** 从入口开始收集所有静态 import，避免遗漏共享 chunk 和 CSS。 */
function collectManifestEntries(
  manifest: Record<string, ManifestEntry>,
  entryName: string,
): ManifestEntry[] {
  const pending = [entryName]
  const visited = new Set<string>()
  const entries: ManifestEntry[] = []

  while (pending.length) {
    const name = pending.shift()!
    if (visited.has(name)) continue
    const entry = manifest[name]
    if (!entry) throw new Error(`缺少构建入口：${name}`)
    visited.add(name)
    entries.push(entry)
    pending.push(...(entry.imports ?? []))
  }

  return entries
}

/** 安全序列化允许公开的请求时配置。 */
function publicRuntimeConfig() {
  return JSON.stringify({ locale: 'zh-CN' }).replaceAll('<', '\\u003c')
}

/** 根据 manifest 为生产 HTML 生成资源标签。 */
function assetTags(manifest: Record<string, ManifestEntry>, entryName: string): string {
  const [entry, ...dependencies] = collectManifestEntries(manifest, entryName)
  const styles = [...new Set([entry, ...dependencies].flatMap((item) => item.css ?? []))]
    .map((file) => `<link rel="stylesheet" href="/${file}">`)
    .join('')
  const preloads = dependencies
    .map((item) => `<link rel="modulepreload" href="/${item.file}">`)
    .join('')
  return `${styles}${preloads}<script type="module" src="/${entry.file}"></script>`
}

const app = express()
if (process.env.NODE_ENV === 'development') {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' })
  app.use(vite.middlewares)
  app.get('*', async (request, response) => {
    const html = await vite.transformIndexHtml(
      request.originalUrl,
      '<div id="app"></div><script type="module" src="/src/main.ts"></script>',
    )
    response.type('html').send(html)
  })
} else {
  const manifest = JSON.parse(
    await readFile('dist/client/.vite/manifest.json', 'utf8'),
  ) as Record<string, ManifestEntry>
  app.use(express.static('dist/client'))
  app.get('*', (_request, response) => {
    response.type('html').send(
      `<div id="app"></div>${assetTags(manifest, 'index.html')}` +
        `<script>window.PUBLIC_CONFIG=${publicRuntimeConfig()}</script>`,
    )
  })
}
app.listen(3000)
~~~~
:::

## 十二、参考资料

- [Backend Integration](https://vite.dev/guide/backend-integration) - dev/production 接入。
- [Env and Mode](https://vite.dev/guide/env-and-mode) - 构建期环境变量。
