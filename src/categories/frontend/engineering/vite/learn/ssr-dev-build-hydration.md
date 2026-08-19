---
id: engineering.vite.learn.advanced.ssr-dev-build-hydration
type: lesson
title: SSR：createServer、ssrLoadModule 与 hydration 边界
summary: 用独立 Node 服务验证 SSR 开发转换、双构建和客户端 hydration 的责任链。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 46
prerequisites:
  - engineering.vite.learn.advanced.preview-deployment-paths
related:
  - engineering.vite.reference.javascript-api
  - engineering.vite.reference.config-ssr-worker
tags:
  - SSR
  - ssrLoadModule
  - hydration
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能在 middleware mode 中 transform HTML 和加载 SSR entry。
  - 能区分 client build、SSR build 和 hydration。
sources:
  - title: Server-Side Rendering
    url: https://vite.dev/guide/ssr
    sourceType: official-reference
  - title: JavaScript API createServer
    url: https://vite.dev/guide/api-javascript#createserver
    sourceType: api-doc
---

# SSR：createServer、ssrLoadModule 与 hydration 边界

## 一、学习目标

- 建立一个 middleware-mode Vite server，并调用 `transformIndexHtml`/`ssrLoadModule`。
- 生产期分别构建 client 和 server entry，再由 Node import 服务端产物。

## 二、为什么需要

SSR 同时包含请求服务器、模板转换、服务端渲染、客户端资源和 hydration。普通 SPA 截图只能证明
客户端挂载，不能证明服务器输出或 hydration。

## 三、核心概念

开发期 `createServer({ server: { middlewareMode: true }, appType: 'custom' })` 嵌入后端；
`ssrLoadModule` 用 Vite 转换加载服务器入口；生产期要独立 client/SSR build；hydration 由框架负责。

## 四、分步使用

1. Node server 读取并 `transformIndexHtml`。
2. `ssrLoadModule('/src/entry-server.ts')` 生成服务器 HTML。
3. 注入模板并返回，浏览器加载 entry-client。
4. 执行 client/SSR 双构建，生产分支 import server bundle。

## 五、安装框架 SSR 依赖

以 Vue 为例，先安装 Vue 和官方 Vite 插件：

~~~~sh
npm install vue@3.5.40
npm install -D vite@8.2.1 @vitejs/plugin-vue@6.0.8
~~~~

客户端与服务端共享 createApp，只在入口处选择 mount 或 render：

~~~~ts
// src/app.ts
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  return createSSRApp(App)
}
~~~~

~~~~ts
// src/entry-client.ts
import { createApp } from './app'

createApp().mount('#app')
~~~~

~~~~ts
// src/entry-server.ts
import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'

export async function render() {
  return renderToString(createApp())
}
~~~~

## 六、配置和开发加载

~~~~ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    manifest: true,
    ssrManifest: true,
  },
})
~~~~

开发服务器中使用 server.ssrLoadModule('/src/entry-server.ts') 加载服务端入口，并调用
transformIndexHtml 处理模板。生产阶段分别构建客户端和 SSR 入口：

~~~~sh
npx vite build --outDir dist/client
npx vite build --ssr src/entry-server.ts --outDir dist/server
~~~~

服务端 HTML 与客户端首次渲染必须一致，否则 hydration 会报告不匹配。请求级状态必须为每个请求重新创建。

## 七、易错使用提示

:::pitfalls
### 错误：用 SPA DOM 冒充 SSR 证据

**触发条件：** 页面加载后有文字就宣称 SSR 成功。

**原因：** 客户端 mount 也能生成同样 DOM。

**后果：** 服务端实际可能返回空容器。

**错误示例：**

~~~~text
只检查 page.locator()
~~~~

**正确写法：**

~~~~text
先检查 HTTP 原始 HTML，再检查 hydration console 和交互
~~~~

**验证方式：** 分别保存首包 HTML、SSR build 和浏览器 hydration 证据。
:::

## 八、工作原理与适用边界

1. SSR Guide 明确开发中间件和 client/server 双构建。
2. Vite 提供转换和加载基础设施，框架负责 render/hydrate 合同。
3. 流式 SSR、边缘 runtime 和生产缓存需要针对目标运行平台单独设计。

## 九、练习

:::exercise
### 练习目标

**要求：** 给 SSR 请求链标注 Vite、Node server、Vue renderer 和浏览器 hydration 各自的输入/输出。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十、本节小结

- SSR 需要首包、双构建和 hydration 三类独立证据，不能由 SPA 页面替代。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装
npm install vue@3.5.40 express tsx
npm install -D vite@8.2.1 @vitejs/plugin-vue@6.0.8 @types/express

// src/app.ts
import { createSSRApp } from 'vue'
import App from './App.vue'
/** 为每个请求创建隔离的应用实例。 */
export function createApp() { return createSSRApp(App) }

// src/entry-client.ts
import { createApp } from './app'
createApp().mount('#app')

// src/entry-server.ts
import { renderToString, type SSRContext } from 'vue/server-renderer'
import { createApp } from './app'
interface RenderContext extends SSRContext { modules?: Set<string> }
/** 渲染当前请求的服务端 HTML。 */
export async function render() {
  const context: RenderContext = {}
  const html = await renderToString(createApp(), context)
  return { html, modules: [...(context.modules ?? [])] }
}

// index.html
<!--preload-links-->
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.ts"></script>

// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [vue()],
  build: { manifest: true, ssrManifest: true },
})

// server.ts：开发期嵌入 Vite，生产期加载双构建产物
import express from 'express'
import { readFile } from 'node:fs/promises'

type SsrManifest = Record<string, string[]>
type Render = () => Promise<{ html: string; modules: string[] }>

/** 根据 SSR manifest 为本次渲染使用的模块生成预加载标签。 */
function renderPreloadLinks(modules: string[], manifest: SsrManifest): string {
  const files = [...new Set(modules.flatMap((id) => manifest[id] ?? []))]
  return files
    .map((file) => {
      if (file.endsWith('.js')) return `<link rel="modulepreload" href="/${file}">`
      if (file.endsWith('.css')) return `<link rel="stylesheet" href="/${file}">`
      return ''
    })
    .join('')
}

const isProduction = process.env.NODE_ENV === 'production'
const app = express()
const vite = isProduction
  ? undefined
  : await (await import('vite')).createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })
if (vite) app.use(vite.middlewares)
else app.use(express.static('dist/client', { index: false }))

const productionTemplate = isProduction ? await readFile('dist/client/index.html', 'utf8') : ''
const ssrManifest = isProduction
  ? (JSON.parse(
      await readFile('dist/client/.vite/ssr-manifest.json', 'utf8'),
    ) as SsrManifest)
  : {}
const serverEntry = './dist/server/entry-server.js'
const productionRender: Render | undefined = isProduction
  ? (await import(serverEntry)).render
  : undefined

app.get('*', async (request, response, next) => {
  try {
    const template = vite
      ? await vite.transformIndexHtml(request.originalUrl, await readFile('index.html', 'utf8'))
      : productionTemplate
    const render: Render =
      productionRender ?? (await vite!.ssrLoadModule('/src/entry-server.ts')).render
    const { html, modules } = await render()
    response
      .type('html')
      .send(
        template
          .replace('<!--preload-links-->', renderPreloadLinks(modules, ssrManifest))
          .replace('<!--ssr-outlet-->', html),
      )
  } catch (error) {
    vite?.ssrFixStacktrace(error as Error)
    next(error)
  }
})
app.listen(3000)

// 生产双构建
npx vite build --outDir dist/client
npx vite build --ssr src/entry-server.ts --outDir dist/server
NODE_ENV=production npx tsx server.ts
// 验证原始 HTTP HTML 已含正文和 manifest 资源，再检查 hydration 无不匹配且交互可用
~~~~
:::

## 十一、参考资料

- [SSR Guide](https://vite.dev/guide/ssr) - middleware mode、ssrLoadModule 和双构建。
- [JavaScript API](https://vite.dev/guide/api-javascript) - createServer 接口。
