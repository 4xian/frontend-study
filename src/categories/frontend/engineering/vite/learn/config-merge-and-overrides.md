---
id: engineering.vite.learn.intermediate.config-merge-and-overrides
type: lesson
title: 配置合并、CLI 覆盖与共享配置
summary: 在共享基础配置、插件配置和 CLI 参数之间建立可预测优先级。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 34
prerequisites:
  - engineering.vite.learn.intermediate.config-and-mode
related:
  - engineering.vite.reference.javascript-api
tags:
  - mergeConfig
  - CLI
  - 共享配置
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能使用 mergeConfig 合并对象配置。
  - 能说明 CLI 与配置文件的最终 resolved 值。
sources:
  - title: Vite JavaScript API mergeConfig
    url: https://vite.dev/guide/api-javascript#mergeconfig
    sourceType: api-doc
  - title: Vite CLI
    url: https://vite.dev/guide/cli
    sourceType: official-reference
---

# 配置合并、CLI 覆盖与共享配置

## 一、学习目标

- 复用一份基础配置而不复制插件数组和 alias。
- 通过 resolved config 证明 `--port`、`--mode`、`--config` 的结果。

## 二、为什么需要

多应用或多环境常共享 alias、插件和安全默认值。手写对象展开会错误覆盖嵌套字段，函数配置也不能
直接交给 `mergeConfig` 当作普通对象处理。

## 三、核心概念

`mergeConfig(a, b)` 按 Vite 规则合并对象配置；CLI 参数进入最终解析过程；共享配置应只包含跨命令
都成立的字段，阶段差异留在调用方。

## 四、分步使用

1. 提取共享的 resolve 和 plugin 配置对象。
2. 通过 `mergeConfig(base, appConfig)` 合并嵌套字段。
3. 使用 CLI 覆盖 port/mode，读取最终 resolved config。
4. 对插件数组顺序和 alias 做断言。

## 五、提取共享配置

共享配置使用 UserConfig 类型，调用方再通过 mergeConfig 合并：

~~~~ts
// vite.shared.ts
import type { Plugin, UserConfig } from 'vite'

/** 创建可在 resolved config 中识别的共享插件。 */
function sharedMarkerPlugin(): Plugin {
  return { name: 'course:shared-marker' }
}

export const sharedConfig = {
  plugins: [sharedMarkerPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    sourcemap: true,
  },
} satisfies UserConfig
~~~~

~~~~ts
// vite.config.ts
import { defineConfig, mergeConfig } from 'vite'
import { sharedConfig } from './vite.shared'

export default defineConfig(({ command }) =>
  mergeConfig(sharedConfig, {
    server: {
      port: 5173,
    },
    build: {
      minify: command === 'build',
    },
  }),
)
~~~~

mergeConfig 会按 Vite 的配置规则处理嵌套对象和数组。对象展开只覆盖一层，容易把 sharedConfig.build
中的 sourcemap 整体丢失。

## 六、理解 CLI 覆盖

CLI 参数适合当前运行覆盖，不应被误认为配置文件已经改变：

~~~~sh
npx vite --host 0.0.0.0 --port 4173
npx vite build --base /docs/
~~~~

## 七、完整合并结果

上面的配置在 build 时同时保留 alias、sourcemap 和 minify；在 serve 时增加固定端口。需要按 mode
区分环境时，在最终 defineConfig 函数中加载 env，再把结果传入 mergeConfig。

## 八、易错使用提示

:::pitfalls
### 错误：用浅展开合并嵌套配置

**触发条件：** 写 `{ ...base, ...app }`，两边都有 `resolve`。

**原因：** 后者会整体覆盖前者的嵌套对象。

**后果：** alias、conditions 或 dedupe 静默丢失。

**错误示例：**

~~~~text
const config = { ...base, resolve: { alias: appAlias } }
~~~~

**正确写法：**

~~~~text
使用 mergeConfig，或显式构造确切字段
~~~~

**验证方式：** 检查最终 resolved alias 列表和插件顺序。
:::

## 九、工作原理与适用边界

1. JavaScript API 提供 `mergeConfig` 和 `resolveConfig`。
2. 共享层只承担真正稳定的合同，避免隐藏阶段分支。
3. CLI 优先级按 Vite 8.2.1 的真实解析结果说明。

## 十、练习

:::exercise
### 练习目标

**要求：** 合并基础配置和两个应用配置，证明各自 alias 不丢失，且 CLI port 覆盖只影响当前运行。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- 配置合并要使用 Vite 规则，最终行为要看 resolved config 而不是源码外观。

:::code-details{title="查看本节完整配置"}
~~~~ts
// vite.shared.ts
import type { Plugin, UserConfig } from 'vite'

/** 创建可在 resolved config 中识别的共享插件。 */
function sharedMarkerPlugin(): Plugin {
  return { name: 'course:shared-marker' }
}

export const sharedConfig = {
  plugins: [sharedMarkerPlugin()],
  resolve: {
    alias: { '@': '/src' },
    dedupe: ['vue'],
  },
  build: { sourcemap: true },
} satisfies UserConfig

// vite.config.ts
import { defineConfig, loadEnv, mergeConfig, type Plugin } from 'vite'
import { sharedConfig } from './vite.shared'

const siteMarkerPlugin = { name: 'course:site-marker' } satisfies Plugin

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'APP_')

  return mergeConfig(sharedConfig, {
    plugins: [siteMarkerPlugin],
    base: env.APP_BASE || '/',
    server: {
      port: 5173,
      strictPort: true,
    },
    build: {
      minify: command === 'build',
      outDir: 'dist/site',
    },
  })
})

// CLI 只覆盖当前运行，配置文件本身不会改变：
// npx vite --mode staging --config vite.config.ts --port 4173 --strictPort
// npx vite build --base /docs/
// npx vite --debug config
// resolved plugins 中应按顺序保留 course:shared-marker 和 course:site-marker
~~~~
:::

## 十二、参考资料

- [JavaScript API](https://vite.dev/guide/api-javascript#mergeconfig) - mergeConfig/resolveConfig。
- [CLI](https://vite.dev/guide/cli) - 命令行覆盖。
