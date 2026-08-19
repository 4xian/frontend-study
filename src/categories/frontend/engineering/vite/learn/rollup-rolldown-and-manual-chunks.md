---
id: engineering.vite.learn.advanced.rollup-rolldown-and-manual-chunks
type: lesson
title: manualChunks 与 Rollup/Rolldown 兼容边界
summary: 在真实构建分析后再调整 chunk，并区分兼容入口和 Rolldown 专用能力。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 42
prerequisites:
  - engineering.vite.learn.advanced.build-output-and-chunks
related:
  - engineering.vite.reference.build-rollup-boundary
tags:
  - manualChunks
  - Rollup
  - Rolldown
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能依据真实模块图决定是否手工分块。
  - 能选择 rollupOptions 或 rolldownOptions 并说明兼容限制。
sources:
  - title: Build Options rollupOptions
    url: https://vite.dev/config/build-options#build-rollupoptions
    sourceType: official-reference
  - title: Rolldown Integration
    url: https://vite.dev/guide/rolldown
    sourceType: official-reference
---

# manualChunks 与 Rollup/Rolldown 兼容边界

## 一、学习目标

- 读取构建分析后设计最小 manualChunks 规则。
- 识别 Rollup 兼容 plugin/output 合同与 Rolldown 专用选项。

## 二、为什么需要

机械地把所有 node_modules 放进 vendor chunk 会形成巨型共享文件并破坏路由级缓存。Vite 8 的生产
实现使用 Rolldown，同时保留大量 Rollup 兼容合同，迁移需要逐项证明。

## 三、核心概念

`build.rollupOptions` 是兼容入口；`build.rolldownOptions` 暴露当前 bundler 能力；`manualChunks` 根据
module ID 决定输出分组。任何策略都要以产物大小、请求和更新频率为证据。

## 四、分步使用

1. 先构建默认策略并记录 manifest/大小。
2. 找到确实共享且更新频率不同的依赖。
3. 添加一条 manualChunks 规则。
4. 比较产物关系和首次/二次加载请求。

## 五、先使用默认分块

Vite 8 使用 Rolldown 处理生产 bundle，并提供 Rollup 兼容配置。默认策略会根据静态和动态 import
生成合理 chunk，只有测量证明需要稳定缓存边界时才手工分块。

~~~~ts
const loadEditor = () => import('./features/editor')
const loadCharts = () => import('./features/charts')
~~~~

## 六、配置 manualChunks

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    manifest: true,
    rolldownOptions: {
      output: {
        /** 仅把已测量的稳定边界映射到独立 chunk。 */
        manualChunks(id) {
          if (id.includes('node_modules/vue')) return 'vue-vendor'
          if (id.includes('/features/editor/')) return 'editor'
          return undefined
        },
      },
    },
  },
})
~~~~

返回相同名字的模块会进入同一 chunk。规则应围绕稳定功能边界，不能依赖某个版本偶然的内部文件名。

## 七、判断插件兼容性

Vite 插件使用 Vite Plugin API；纯 Rollup 插件只有在使用兼容钩子且不依赖 Rollup 私有行为时才能直接复用。
升级构建器时重点检查 resolveId、load、transform、输出钩子和 source map，不要只看插件能否被加载。

## 八、检查完整结果

开启 manifest 后，从入口追踪 imports 与 dynamicImports，再通过 preview 确认实际请求。若 manualChunks
没有改善缓存命中或首屏请求，应删除规则并采用默认策略。

## 九、易错使用提示

:::pitfalls
### 错误：把全部依赖塞进一个 vendor chunk

**触发条件：** `id.includes('node_modules') ? 'vendor' : undefined`。

**原因：** 不区分页面、更新频率和依赖关系。

**后果：** 首屏下载变大，任一依赖更新都使整个 vendor 失效。

**错误示例：**

~~~~text
对所有 node_modules 返回同一名称
~~~~

**正确写法：**

~~~~text
先用默认策略，只对测得的稳定共享边界分块
~~~~

**验证方式：** 比较 manifest、chunk 字节和路由请求。
:::

## 十、工作原理与适用边界

1. Vite 8 的 build 合同区分 rollupOptions 和 rolldownOptions。
2. 兼容层不是逐字相同实现，插件需用 dev 与 build 流程 回归。
3. 未固定环境时只能报告产物变化，不能宣称性能提升。

## 十一、练习

:::exercise
### 练习目标

**要求：** 根据三个路由和两个共享依赖的更新频率，给出保留默认策略或拆分的证据化决定。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十二、本节小结

- 默认策略优先；手工分块必须由模块关系和测量驱动，并区分兼容与专用选项。

:::code-details{title="查看本节完整配置"}
~~~~ts
// src/routes.ts：先用动态 import 建立真实功能边界
export const loadEditor = () => import('./features/editor')
export const loadCharts = () => import('./features/charts')

// vite.config.ts：默认构建测量后，只拆分已确认的稳定共享边界
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    manifest: true,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue')) return 'vue-vendor'
          if (id.includes('/features/editor/')) return 'editor'
          return undefined
        },
      },
    },
  },
})

// 验证顺序：
// 1. 暂时移除 manualChunks，记录默认 manifest、chunk 字节和页面请求
// 2. 加回一条规则，比较首屏、二次导航和依赖更新后的缓存失效范围
// 3. 没有改善就删除规则，保留默认策略
// 4. 第三方 Rollup 插件需分别验证 resolve/load/transform、输出钩子和 source map
~~~~
:::

## 十三、参考资料

- [Build Options](https://vite.dev/config/build-options) - bundler 配置入口。
- [Rolldown](https://vite.dev/guide/rolldown) - Vite 8 的 Rolldown 边界。
