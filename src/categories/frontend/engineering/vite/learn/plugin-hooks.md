---
id: engineering.vite.learn.intermediate.plugin-hooks
type: lesson
title: resolveId、load、transform 与服务器钩子
summary: 用虚拟模块和中间件验证核心插件钩子的调用时序与返回合同。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 42
prerequisites:
  - engineering.vite.learn.intermediate.plugin-order-and-application
related:
  - engineering.vite.reference.plugin-api
tags:
  - resolveId
  - load
  - transform
  - configureServer
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能实现虚拟模块的 resolveId/load。
  - 能区分 config、configureServer、transform 与 build hook。
sources:
  - title: Vite Plugin API Universal Hooks
    url: https://vite.dev/guide/api-plugin#universal-hooks
    sourceType: api-doc
  - title: Vite Specific Hooks
    url: https://vite.dev/guide/api-plugin#vite-specific-hooks
    sourceType: api-doc
---

# resolveId、load、transform 与服务器钩子

## 一、学习目标

- 实现 `virtual:course-info` 并返回稳定的内部 `\0` ID。
- 判断一个 hook 在 dev、build、关闭阶段是否调用。

## 二、为什么需要

多数 Vite 插件都在解析、加载、转换三个核心 seam 上工作；配置和 server hook 则改变宿主生命周期。
不了解返回合同会造成重复解析、source map 丢失或中间件顺序错误。

## 三、核心概念

`resolveId` 把公开 specifier 映射到内部 ID；`load` 为内部 ID 提供源码；`transform` 改写已有模块并
应返回 map；`config/configResolved` 处理配置；`configureServer` 可注册前置或返回后置中间件。

## 四、分步使用

1. 在 resolveId 捕获 `virtual:course-info` 并返回 `\0virtual:course-info`。
2. 在 load 返回 ESM 字符串。
3. 在 transform 只处理目标扩展并保留 source map。
4. 注册 `/__course-health` 中间件并在关闭时清理资源。

## 五、实现完整插件

公开导入名使用 `virtual:` 前缀，内部 ID 使用 `\0` 前缀，避免被当作文件路径。下面把
`resolveId`、`load`、`transform` 和 `configureServer` 放进同一个完整插件对象：

~~~~sh
npm install -D magic-string
~~~~

~~~~ts
// plugins/course-info.ts
import MagicString from 'magic-string'
import type { Plugin } from 'vite'

const publicId = 'virtual:course-info'
const resolvedId = '\0' + publicId

/** 创建课程信息虚拟模块与开发服务插件。 */
export function courseInfoPlugin(): Plugin {
  let lastHeartbeatAt = Date.now()
  let heartbeat: ReturnType<typeof setInterval> | undefined

  /** 释放插件创建的计时器。 */
  const stopHeartbeat = () => {
    if (heartbeat) clearInterval(heartbeat)
    heartbeat = undefined
  }

  return {
    name: 'course:info',

    /** 把公共虚拟模块名解析为内部 ID。 */
    resolveId(id) {
      return id === publicId ? resolvedId : null
    },

    /** 为内部虚拟模块提供 ESM 源码。 */
    load(id) {
      if (id !== resolvedId) return null
      return 'export const title = "Vite 插件课程"'
    },

    /** 只转换课程源码中的版本占位符。 */
    transform(code, id) {
      if (!id.endsWith('.course.ts')) return null

      const marker = '__COURSE_VERSION__'
      const markerIndex = code.indexOf(marker)
      if (markerIndex < 0) return null

      const transformed = new MagicString(code)
      transformed.overwrite(markerIndex, markerIndex + marker.length, JSON.stringify('8.2.1'))

      return {
        code: transformed.toString(),
        map: transformed.generateMap({ hires: true, source: id, includeContent: true }),
      }
    },

    /** 注册只在开发服务器中存在的健康检查接口。 */
    configureServer(server) {
      heartbeat ??= setInterval(() => {
        lastHeartbeatAt = Date.now()
      }, 30_000)
      server.httpServer?.once('close', stopHeartbeat)
      server.middlewares.use('/__course-health', (_request, response) => {
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ ok: true, lastHeartbeatAt }))
      })
    },
    /** 构建完成后释放插件资源。 */
    closeBundle: stopHeartbeat,
  }
}
~~~~

应用代码可以像普通 ESM 一样导入：

~~~~ts
import { title } from 'virtual:course-info'

console.log(title)
~~~~

TypeScript 还需要知道虚拟模块的公开类型。在 `src/vite-env.d.ts` 中声明它：

~~~~ts
declare module 'virtual:course-info' {
  export const title: string
}
~~~~

## 六、易错使用提示

:::pitfalls
### 错误：虚拟模块没有内部 \0 前缀

**触发条件：** resolveId 返回和公开 ID 完全相同的字符串。

**原因：** 其他插件或解析器无法区分已解析的虚拟模块。

**后果：** 重复解析、错误文件系统查找或冲突。

**错误示例：**

~~~~text
return 'virtual:course-info'
~~~~

**正确写法：**

~~~~text
返回 \0virtual:course-info，只在 load 处理内部 ID
~~~~

**验证方式：** 记录 resolve/load 次数并断言不会落到文件系统。
:::

## 七、工作原理与适用边界

1. 官方约定虚拟模块使用 `virtual:` 公共名和 `\0` 内部 ID。
2. 最小插件应在最早能解决问题的 hook 返回结果。
3. dev 不调用完整 bundle 分析 hook，build 也没有开发中间件请求。

## 八、练习

:::exercise
### 练习目标

**要求：** 实现一个只读取固定 JSON 的虚拟模块，分别写出 dev 请求和 build 产物断言。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 九、本节小结

- resolve 决定身份，load 提供源码，transform 改写模块，server hook 管开发宿主。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装教程版本和 source map 转换工具
npm install -D vite@8.2.1 magic-string

// plugins/course-info.ts
import MagicString from 'magic-string'
import type { Plugin } from 'vite'
const publicId = 'virtual:course-info'
const resolvedId = '\0' + publicId

/** 创建虚拟模块、源码转换与开发中间件。 */
export function courseInfoPlugin(): Plugin {
  let lastHeartbeatAt = Date.now()
  let heartbeat: ReturnType<typeof setInterval> | undefined

  /** 释放插件创建的计时器。 */
  const stopHeartbeat = () => {
    if (heartbeat) clearInterval(heartbeat)
    heartbeat = undefined
  }

  return {
    name: 'course:info',
    /** 把公开虚拟模块名解析为内部 ID。 */
    resolveId(id) {
      return id === publicId ? resolvedId : null
    },
    /** 为内部虚拟模块提供源码。 */
    load(id) {
      return id === resolvedId ? 'export const title = "Vite 插件课程"' : null
    },
    /** 只转换课程源码中的版本占位符。 */
    transform(code, id) {
      if (!id.endsWith('.course.ts')) return null

      const marker = '__COURSE_VERSION__'
      const markerIndex = code.indexOf(marker)
      if (markerIndex < 0) return null

      const transformed = new MagicString(code)
      transformed.overwrite(markerIndex, markerIndex + marker.length, JSON.stringify('8.2.1'))
      return {
        code: transformed.toString(),
        map: transformed.generateMap({ hires: true, source: id, includeContent: true }),
      }
    },
    /** 注册只在开发服务器中存在的健康检查接口。 */
    configureServer(server) {
      heartbeat ??= setInterval(() => {
        lastHeartbeatAt = Date.now()
      }, 30_000)
      server.httpServer?.once('close', stopHeartbeat)
      server.middlewares.use('/__course-health', (_request, response) => {
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ ok: true, lastHeartbeatAt }))
      })
    },
    /** 构建完成后释放插件资源。 */
    closeBundle: stopHeartbeat,
  }
}

// vite.config.ts
import { defineConfig } from 'vite'
import { courseInfoPlugin } from './plugins/course-info'
export default defineConfig({ plugins: [courseInfoPlugin()] })

// src/vite-env.d.ts
declare module 'virtual:course-info' { export const title: string }

// src/main.ts
import { title } from 'virtual:course-info'
console.log(title)

// dev 中验证虚拟模块、source map 和 /__course-health
// build 中验证虚拟模块、source map，并在关闭钩子中释放计时器
~~~~
:::

## 十、参考资料

- [Plugin API](https://vite.dev/guide/api-plugin) - 通用与 Vite 专用 hooks。
