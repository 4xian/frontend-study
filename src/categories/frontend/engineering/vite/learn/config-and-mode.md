---
id: engineering.vite.learn.intermediate.config-and-mode
type: lesson
title: vite.config.ts、defineConfig 与条件配置
summary: 根据 command、mode、SSR 和 preview 上下文返回精确配置。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 36
prerequisites:
  - engineering.vite.learn.basics.hmr-model-state-preservation
related:
  - engineering.vite.reference.config-shared
tags:
  - vite.config.ts
  - defineConfig
  - mode
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能使用 defineConfig 的对象和函数两种形态。
  - 能区分 serve、build、SSR 和 preview 配置上下文。
sources:
  - title: Configuring Vite
    url: https://vite.dev/config/
    sourceType: official-reference
---

# vite.config.ts、defineConfig 与条件配置

## 一、学习目标

- 根据 `command`、`mode`、`isSsrBuild`、`isPreview` 返回最小差异配置。
- 判断配置由 `bundle`、`runner` 还是 `native` loader 加载时的兼容边界。

## 二、为什么需要

开发、构建和 SSR 共用配置入口，但插件和输出不一定共用。把全部差异写成环境变量分支会让
配置难以验证，也容易把 build-only 逻辑带进 dev。

## 三、核心概念

`defineConfig` 提供类型推导，不改变运行语义。函数配置接收命令、mode、SSR 和 preview 上下文；
配置加载器决定 TypeScript 配置如何在 Node 中执行。

## 四、分步使用

1. 先写对象配置并用 `satisfies UserConfig` 校验。
2. 需要阶段差异时改成函数配置。
3. 用 `vite --debug config` 或 JavaScript API 读取 resolved config。
4. 对 serve/build 分别断言插件和输出选项。

## 五、创建配置文件

在项目根目录创建 vite.config.ts。defineConfig 只提供类型推导，返回的仍是普通配置对象：

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
  },
})
~~~~

## 六、按 command 和 mode 返回配置

command 表示 serve 或 build，mode 表示要加载的环境集合。二者职责不同：

~~~~ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isBuild = command === 'build'

  return {
    base: env.APP_BASE || '/',
    define: {
      __BUILD_MODE__: JSON.stringify(mode),
    },
    build: {
      sourcemap: isBuild && mode !== 'production',
      ssr: isSsrBuild ? 'src/entry-server.ts' : false,
    },
    preview: {
      port: isPreview ? 4173 : 4174,
    },
  }
})
~~~~

vite build --mode development 仍然是 build，所以生命周期判断使用 command；development、staging、
production 等环境集合才使用 mode。

## 七、选择配置加载方式

默认 loader 会打包配置后执行，最兼容 TypeScript 与配置内导入。只有配置必须保留原生 Node 执行语义时才选择
runner 或 native，并先确认 Node 能直接执行相关语法。

~~~~sh
npx vite --config vite.config.ts
npx vite --configLoader runner
npx vite --configLoader native
~~~~

完整配置应把共同项放在返回对象顶层，只把真正随 command 或 mode 变化的值写成条件分支。

## 八、易错使用提示

:::pitfalls
### 错误：用 mode 判断 serve 与 build

**触发条件：** 只判断 `mode === 'production'` 来启用构建插件。

**原因：** mode 可由 CLI 改写，`vite build --mode development` 仍是 build。

**后果：** 插件在错误阶段执行或漏执行。

**错误示例：**

~~~~text
if (mode === 'production') plugins.push(buildPlugin())
~~~~

**正确写法：**

~~~~text
使用 command === 'build'，再用 mode 选择环境配置
~~~~

**验证方式：** 对四种 command/mode 组合记录 resolved config。
:::

## 九、工作原理与适用边界

1. 官方 Config 明确函数参数和配置加载方式。
2. `command` 决定生命周期，mode 决定配置集合，两者应分别建模。
3. 加载器兼容结论绑定当前 Vite/Node，升级时重新核对。

## 十、练习

:::exercise
### 练习目标

**要求：** 写一个只在 build 生效、但 staging/production 输出不同 base 的配置函数，并列出四条断言。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- 用 command 选择生命周期，用 mode 选择环境，用 resolved config 证明结果。

:::code-details{title="查看本节完整配置"}
~~~~ts
// vite.config.ts
import { defineConfig, loadEnv, type UserConfig } from 'vite'

const sharedConfig = {
  base: '/',
  server: { open: false },
} satisfies UserConfig

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), 'APP_')
  const isBuild = command === 'build'

  return {
    ...sharedConfig,
    base: env.APP_BASE || sharedConfig.base,
    define: {
      __BUILD_MODE__: JSON.stringify(mode),
    },
    build: {
      sourcemap: isBuild && mode !== 'production',
      ssr: isSsrBuild ? 'src/entry-server.ts' : false,
    },
    preview: {
      port: isPreview ? 4173 : 4174,
      strictPort: true,
    },
  }
})

// 默认 bundle loader 最适合 TypeScript 配置与配置内导入
// npx vite --config vite.config.ts
// 必须保留原生执行语义时，再分别验证：
// npx vite --configLoader runner
// npx vite --configLoader native
// 使用 npx vite --debug config 检查最终 resolved config
~~~~
:::

## 十二、参考资料

- [Configuring Vite](https://vite.dev/config/) - 配置文件、加载器和条件参数。
