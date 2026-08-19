---
id: engineering.vite.reference.javascript-api
type: reference
title: Vite JavaScript API
summary: 查阅开发服务器、构建、预览、配置解析、环境加载、转换与版本导出的程序化接口。
domain: frontend
technology: engineering
module: vite
group: programmatic-api
signature: |-
  import { build, createServer, preview, resolveConfig } from 'vite'
related:
  - engineering.vite.learn.basics.project-entry-and-module-graph
  - engineering.vite.learn.advanced.backend-integration-and-delivery
tags:
  - Vite
  - JavaScript API
  - Node.js
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 JavaScript API
    url: https://vite.dev/guide/api-javascript
    sourceType: api-doc
    appliesTo: Vite 8.2.1
anchors:
  - createserver
  - inlineconfig
  - resolvedconfig
  - vitedevserver
  - build
  - preview
  - previewserver
  - resolveconfig
  - mergeconfig
  - searchforworkspaceroot
  - loadenv
  - normalizepath
  - transformwithoxc
  - transformwithesbuild
  - loadconfigfromfile
  - version
  - rolldownversion
  - esbuildversion
  - rollupversion
---

# Vite JavaScript API

程序化 API 运行在 Node 进程中。调用方负责 cwd、信号、端口、错误和 `close()` 生命周期；应用需要明确传入
这些输入并处理退出路径。

## 一、createServer

创建开发服务器但不一定监听端口；middleware mode 下使用 `middlewares` 接入宿主。失败后必须关闭已创建资源。

**最小示例：**

~~~~ts
import { createServer } from 'vite'
const server = await createServer({ server: { port: 5173 } })
await server.listen()
server.printUrls()
await server.close()
~~~~

## 二、InlineConfig

程序化配置输入与配置文件形状接近，并增加 configFile、envFile 等加载控制。相对路径仍受 root/cwd 影响。

**最小示例：**

~~~~ts
import type { InlineConfig } from 'vite'
const config: InlineConfig = { root: 'src', mode: 'development' }
~~~~

## 三、ResolvedConfig

包含默认值、插件排序和绝对路径等最终配置。它是只读观察结果，不应在解析后继续突变。

**最小示例：**

~~~~ts
import { resolveConfig } from 'vite'
const config = await resolveConfig({}, 'serve', 'development')
~~~~

## 四、ViteDevServer

提供 moduleGraph、pluginContainer、middlewares、ws、transformRequest 与生命周期方法。内部图结构不应成为跨版本
业务合同。

**最小示例：**

~~~~ts
import type { ViteDevServer } from 'vite'
const transform = (server: ViteDevServer) => server.transformRequest("/src/main.ts")
~~~~

## 五、build

执行一次构建或返回 watcher。多配置数组会产生多结果，调用方应逐项检查错误和 output，而不是只看 Promise 完成。

**最小示例：**

~~~~ts
import { build } from 'vite'
const result = await build({ build: { outDir: 'dist' } })
~~~~

## 六、preview

为已有 outDir 创建本地预览服务器。它不触发 build，调用前应确认产物属于当前快照。

**最小示例：**

~~~~ts
import { preview } from 'vite'
const server = await preview({ preview: { port: 4173 } })
server.printUrls()
await server.close()
~~~~

## 七、PreviewServer

暴露 HTTP server、middlewares、resolvedUrls 与 `printUrls`。验证结束应调用 `httpServer.close()`。

**最小示例：**

~~~~ts
import type { PreviewServer } from 'vite'
const stop = (server: PreviewServer) => server.close()
~~~~

## 八、resolveConfig

按 command、mode 和环境解析最终配置，并运行配置钩子。它可能触发插件逻辑，不能当作无副作用的纯读取。

**最小示例：**

~~~~ts
import { resolveConfig } from 'vite'
const config = await resolveConfig({ base: '/docs/' }, 'build', 'production')
~~~~

## 九、mergeConfig

深合并两份配置，适合对象形式。函数配置必须先求值，且有些数组/特殊字段仍需按各自合同处理。

**最小示例：**

~~~~ts
import { mergeConfig } from 'vite'
const config = mergeConfig({ build: { sourcemap: true } }, { build: { minify: true } })
~~~~

## 十、searchForWorkspaceRoot

从给定目录向上寻找 workspace 根，可用于 `server.fs.allow`。结果取决于 lockfile/workspace 文件，需在实际仓库验证。

**最小示例：**

~~~~ts
import { searchForWorkspaceRoot } from 'vite'
const root = searchForWorkspaceRoot(process.cwd())
~~~~

## 十一、loadEnv

按 mode、目录与前缀读取 env 文件并返回字符串映射。默认前缀不会返回所有变量；空前缀会扩大秘密暴露风险。

**最小示例：**

~~~~ts
import { loadEnv } from 'vite'
const env = loadEnv('staging', process.cwd(), 'VITE_')
~~~~

## 十二、normalizePath

把 Windows 分隔符规范成 `/`，用于插件 ID 比较。它不是 URL 解析器，也不会解析 `..` 或真实路径。

**最小示例：**

~~~~ts
import { normalizePath } from 'vite'
const id = normalizePath('src\\features\\course.ts')
~~~~

## 十三、transformWithOxc

使用 Vite 的 Oxc 转换接口处理源码和 source map。它不做 TypeScript 类型检查，也不替代完整插件管线。

**最小示例：**

~~~~ts
import { transformWithOxc } from 'vite'
const result = await transformWithOxc('const value: number = 1', 'course.ts', {})
~~~~

## 十四、transformWithEsbuild

保留兼容性的 esbuild 转换接口。Vite 8 主路径已转向 Oxc，新代码应只在明确的兼容需求下使用。

**最小示例：**

~~~~ts
import { transformWithEsbuild } from 'vite'
const result = await transformWithEsbuild('const value: number = 1', 'course.ts')
~~~~

## 十五、loadConfigFromFile

加载并执行配置文件，返回路径、依赖和配置。配置文件是可执行代码，来源不可信时不能在当前进程直接加载。

**最小示例：**

~~~~ts
import { loadConfigFromFile } from 'vite'
const result = await loadConfigFromFile({ command: 'serve', mode: 'development' })
~~~~

## 十六、version

导出正在调用的 Vite 包版本；按本教程安装后应得到 `8.2.1`。

**最小示例：**

~~~~ts
import { version } from 'vite'
console.log('Vite', version)
~~~~

## 十七、rolldownVersion

导出 Vite 使用的 Rolldown 版本，适合诊断底层构建差异；业务配置不应绑定未公开内部行为。

**最小示例：**

~~~~ts
import { rolldownVersion } from 'vite'
console.log('Rolldown', rolldownVersion)
~~~~

## 十八、esbuildVersion

导出兼容路径使用的 esbuild 版本。它不代表项目独立安装或所有转换都由 esbuild 完成。

**最小示例：**

~~~~ts
import { esbuildVersion } from 'vite'
console.log('esbuild', esbuildVersion)
~~~~

## 十九、rollupVersion

导出兼容层关联的 Rollup 版本信息。Vite 8 构建主路径是 Rolldown，不能据此宣称运行了 Rollup 构建。

**最小示例：**

~~~~ts
import { rollupVersion } from 'vite'
console.log('Rollup compatibility', rollupVersion)
~~~~

## 二十、组合使用示例

下面的示例把本页最常用的接口组合成一条完整使用路径。

~~~~ts
import { createServer, loadEnv } from 'vite'
const mode = 'development'
const env = loadEnv(mode, process.cwd(), 'VITE_')
const server = await createServer({ mode, define: { __API__: JSON.stringify(env.VITE_API_BASE) } })
await server.listen()
server.printUrls()
process.once('SIGINT', () => server.close())
~~~~

## 二十一、易错使用提示

:::pitfalls
### 错误：程序化启动服务器后不关闭资源

**触发条件：** 调用 `createServer().listen()` 后只等待断言结束，没有在失败路径调用 `close()`。

**原因：** `ViteDevServer` 持有 HTTP/WebSocket、文件监听器和插件资源，不会随单个请求自动释放。

**后果：** 测试进程挂起、端口被占用，后续验证可能连接到旧快照。

**错误示例：**

```ts
const server = await createServer()
await server.listen()
```

**正确写法：**

```ts
const server = await createServer()
try {
  await server.listen()
} finally {
  await server.close()
}
```

**验证方式：** 成功和异常路径都结束后检查监听端口与 Vite 进程已退出。
:::

## 二十二、工作原理与适用边界

1. 官方事实：JavaScript API 返回需要调用方管理的 server、preview server、build 结果或 watcher。
2. 课程推导：程序化调用必须显式记录 cwd、mode、版本、退出和关闭行为，避免复用旧进程证据。
3. 适用边界：本页适合工具和框架集成；直接使用内部 module graph 结构不能成为跨版本业务合同。

## 二十三、参考资料

- [Vite 8.2.1 JavaScript API](https://vite.dev/guide/api-javascript) - 支持程序化配置、服务器与生命周期接口。
