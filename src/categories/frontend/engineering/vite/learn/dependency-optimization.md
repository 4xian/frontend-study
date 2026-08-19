---
id: engineering.vite.learn.intermediate.dependency-optimization
type: lesson
title: 依赖预构建、缓存与 CommonJS 边界
summary: 解释 Vite 如何发现并优化依赖，以及何时需要 include、exclude 或 force。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 38
prerequisites:
  - engineering.vite.learn.intermediate.plugin-hooks
related:
  - engineering.vite.reference.config-dependency-optimization
tags:
  - optimizeDeps
  - 缓存
  - CommonJS
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能从 metadata 和请求判断依赖是否预构建。
  - 能为深层导入或 CJS 互操作选择最小覆盖。
sources:
  - title: Dependency Pre-Bundling
    url: https://vite.dev/guide/dep-pre-bundling
    sourceType: official-reference
  - title: Dep Optimization Options
    url: https://vite.dev/config/dep-optimization-options
    sourceType: official-reference
---

# 依赖预构建、缓存与 CommonJS 边界

## 一、学习目标

- 区分源码转换和 node_modules 依赖优化。
- 在缓存失效、深层导入和 CJS interop 问题中选择正确选项。

## 二、为什么需要

大型依赖或 CommonJS 包若直接交给浏览器，会产生大量请求或 ESM 互操作问题。Vite 在开发期扫描并
缓存优化结果，但过度 include/exclude 会拖慢启动或隐藏包本身问题。

## 三、核心概念

优化器从 HTML/配置入口发现依赖，结果默认进入 `node_modules/.vite`；lockfile、配置和补丁变化会
影响缓存。`include` 强制纳入，`exclude` 保留原样，`force` 只用于明确重建。

## 四、分步使用

1. 冷启动并记录 `.vite/deps/_metadata.json`。
2. 再次启动，确认命中缓存。
3. 加入一个 CJS 依赖和深层动态导入，观察发现时机。
4. 分别尝试 include/exclude/force，比较请求与启动日志。

## 五、为什么需要依赖优化

浏览器原生 ESM 不适合直接加载大量小模块，也不能直接消费所有 CommonJS 包。Vite 在开发服务器启动时发现依赖，
把它们转换成浏览器可用的 ESM，并缓存结果；应用源码本身不会进入这一步。

先正常启动项目：

~~~~sh
npm run dev
~~~~

依赖新增、lockfile 或相关配置变化时，Vite 会重新优化。需要强制刷新时使用：

~~~~sh
npx vite --force
~~~~

## 六、配置 include、exclude 和 entries

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html', 'admin/index.html'],
    include: ['linked-package > nested-commonjs-package'],
    exclude: ['esm-only-package'],
    noDiscovery: false,
    force: false,
  },
})
~~~~

include 适合没有被扫描到的深层 CommonJS 依赖，exclude 适合本来就是稳定 ESM 且不应预构建的包。
不要把整个依赖列表手工复制到 include，自动发现应是默认路径。

## 七、排查过期缓存

先查看 --debug 输出确认依赖是否重新优化，再使用 --force。生产 build 有独立的模块转换和分块流程，
开发期依赖缓存不是生产产物。

## 八、易错使用提示

:::pitfalls
### 错误：每次启动都使用 --force

**触发条件：** 把 `vite --force` 写入常规 dev script。

**原因：** force 跳过可复用缓存。

**后果：** 每次冷启动都重新优化依赖。

**错误示例：**

~~~~text
"dev": "vite --force"
~~~~

**正确写法：**

~~~~text
只在 lockfile/配置漂移或确认缓存损坏时使用
~~~~

**验证方式：** 比较连续两次启动日志和 metadata 修改时间。
:::

## 九、工作原理与适用边界

1. optimizeDeps 主要是开发期依赖优化，不等于 production chunk 策略。
2. 配置应由真实依赖互操作证据驱动。
3. 优化器实现和默认策略可能跨版本变化，升级后需重新验证。

## 十、练习

:::exercise
### 练习目标

**要求：** 为一个包含 CJS 包和 200 个深层入口的库设计优化策略，并写出冷/热启动证据。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- 先观察发现、缓存和 interop，再使用 include/exclude/force；不要把它当 production 分块工具。

:::code-details{title="查看本节完整配置"}
~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html', 'admin/index.html'],
    include: ['linked-package > nested-commonjs-package'],
    exclude: ['esm-only-package'],
    noDiscovery: false,
    force: false,
  },
})

// 默认流程：先让扫描器发现依赖，再检查 node_modules/.vite/deps/_metadata.json
// npm run dev -- --debug
// 只有深层 CommonJS 未被发现时才增加 include
// 只有稳定 ESM 必须保持原样时才增加 exclude
// lockfile 或配置变化通常会自动失效缓存
// 确认缓存损坏时执行一次 npx vite --force，不写入常规 dev script
// production 分块应通过 build.rollupOptions.output 等构建选项单独处理
~~~~
:::

## 十二、参考资料

- [Dependency Pre-Bundling](https://vite.dev/guide/dep-pre-bundling) - 优化目的和缓存。
- [Dep Optimization Options](https://vite.dev/config/dep-optimization-options) - 可用选项。
