---
id: engineering.vite.learn.intermediate.proxy-and-cross-origin
type: lesson
title: server.proxy、路径重写与跨域边界
summary: 用独立后端服务验证开发代理、rewrite 和请求头，而不把它当生产网关。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 38
prerequisites:
  - engineering.vite.learn.intermediate.dependency-optimization
related:
  - engineering.vite.reference.config-server
tags:
  - server.proxy
  - CORS
  - rewrite
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能配置开发代理和路径重写。
  - 能区分浏览器 CORS、Vite proxy 和生产反向代理。
sources:
  - title: Vite server.proxy
    url: https://vite.dev/config/server-options#server-proxy
    sourceType: official-reference
---

# server.proxy、路径重写与跨域边界

## 一、学习目标

- 让 `/api/*` 在开发期转发到独立后端，并验证 path/header。
- 解释为什么 build 产物不会携带 dev proxy 服务器。

## 二、为什么需要

本地前端与 API 常运行在不同端口。proxy 可让浏览器请求同源的 `/api`，但它只属于开发服务器；发布
后仍需真实网关、后端 CORS 或部署平台配置。

## 三、核心概念

`server.proxy` 按路径或正则匹配，请求可通过 `rewrite` 修改后转发；`changeOrigin` 修改上游 Host。
匹配 proxy 的请求不会经过普通 Vite transform。

## 四、分步使用

1. 启动一个只回显 path 和 header 的示例后端。
2. 配置 `/api` target 和 rewrite。
3. 从浏览器请求 Vite 同源路径，核对后端回显。
4. 执行 build，确认产物中没有代理进程。

## 五、配置开发代理

前端请求统一写相对路径，由开发服务器把 /api 转发到后端：

~~~~ts
// src/api.ts
export async function getCourses() {
  const response = await fetch('/api/courses')
  if (!response.ok) throw new Error('加载课程失败')
  return response.json()
}
~~~~

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
~~~~

浏览器请求 /api/courses，Vite 实际请求后端的 /courses。rewrite 只改变转发路径，不改变前端 fetch 写法。

## 六、代理 WebSocket

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/socket': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
})
~~~~

## 七、理解跨域边界

代理只作用于开发服务器。生产部署需要由反向代理、网关或后端配置同源路径。若前端直接请求不同域名，
应由目标服务配置精确 CORS；不要用 server.cors: true 代替生产安全策略。

## 八、易错使用提示

:::pitfalls
### 错误：把 dev proxy 当生产部署配置

**触发条件：** build 后仍假设 `/api` 会由 Vite 转发。

**原因：** `server.proxy` 只在开发服务器运行。

**后果：** 生产请求打到静态站点并返回 404。

**错误示例：**

~~~~text
只配置 vite.config.ts，不配置生产网关
~~~~

**正确写法：**

~~~~text
dev 使用 proxy，生产由部署平台或后端提供等价路由
~~~~

**验证方式：** 分别在 dev 和 preview/静态服务请求 `/api`。
:::

## 九、工作原理与适用边界

1. Server Options 明确 proxy 只应用于 dev server。
2. 路径、header、body 都应由示例后端的实际响应确认。
3. HTTPS、WebSocket 和鉴权必须按目标后端与部署环境分别配置。

## 十、练习

:::exercise
### 练习目标

**要求：** 设计 `/api/v1` 到 `/v1` 的 rewrite，并写出成功、未匹配、后端失败三条断言。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- proxy 是开发期同源便利层，生产路由必须另有真实基础设施证据。

:::code-details{title="查看本节完整配置"}
~~~~ts
// vite.config.ts：HTTP rewrite 与 WebSocket 在同一个 server.proxy 中声明
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://api.example.test',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        /** 为代理请求增加可识别的客户端标记。 */
        configure(proxy) {
          proxy.on('proxyReq', (request) => request.setHeader('x-course-client', 'vite'))
        },
      },
      '/socket': {
        target: 'ws://api.example.test',
        ws: true,
      },
    },
  },
})

// src/api.ts：浏览器始终请求开发服务器同源路径
/** 加载课程列表并保留后端失败信息。 */
export async function getCourses() {
  const response = await fetch('/api/courses')
  if (!response.ok) throw new Error(`加载失败：${response.status}`)
  return response.json()
}

// 浏览器 /api/courses -> 开发代理 /courses
// 浏览器 /socket -> 开发代理 WebSocket
// vite build 不会把代理进程写入 dist；生产需由网关、后端同源路由或精确 CORS 接管
~~~~
:::

## 十二、参考资料

- [server.proxy](https://vite.dev/config/server-options#server-proxy) - 匹配、rewrite 和配置边界。
