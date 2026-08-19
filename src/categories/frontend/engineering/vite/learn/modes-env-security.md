---
id: engineering.vite.learn.basics.modes-env-security
type: lesson
title: mode、import.meta.env 与环境变量安全边界
summary: 用 mode 和前缀控制构建配置，并识别哪些变量绝不能进入浏览器。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 34
prerequisites:
  - engineering.vite.learn.basics.json-worker-and-dynamic-import
related:
  - engineering.vite.reference.features-assets-env
tags:
  - mode
  - import.meta.env
  - 环境变量
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能解释 mode 与 NODE_ENV 的区别。
  - 能使用 `VITE_` 前缀暴露非敏感配置并验证未暴露密钥。
sources:
  - title: Env Variables and Modes
    url: https://vite.dev/guide/env-and-mode
    sourceType: official-reference
  - title: Shared Options envPrefix
    url: https://vite.dev/config/shared-options#envprefix
    sourceType: official-reference
---

# mode、import.meta.env 与环境变量安全边界

## 一、学习目标

- 为 development、staging、production 设计可追踪的 `.env` 文件集合。
- 在构建产物中确认只出现允许公开的变量。

## 二、为什么需要

前端变量会被静态替换进浏览器代码，任何带 `VITE_` 前缀的值都不是秘密。mode 决定加载哪组配置，
但不等于 `NODE_ENV`，混淆两者会把生产配置打到错误环境。

## 三、核心概念

`import.meta.env.MODE` 是 mode；`import.meta.env.DEV/PROD` 是布尔常量；默认只暴露 `VITE_` 前缀变量。
`.env`、`.env.local`、`.env.[mode]` 和 `.env.[mode].local` 按官方优先级合并，shell 变量可覆盖文件值。

## 四、分步使用

1. 写入 `VITE_PUBLIC_API_URL` 和不带前缀的 `DATABASE_PASSWORD`。
2. 分别执行 `vite dev`、`vite build --mode staging`，输出 MODE 和 API URL。
3. 扫描产物，确认未出现密码字面量。
4. 将敏感配置移动到后端或运行时注入边界。

## 五、创建环境文件

mode 决定加载哪组环境文件。下面的值会按优先级合并，越具体的文件优先级越高：

~~~~text
.env
.env.local
.env.staging
.env.staging.local
~~~~

只把允许进入浏览器的值加上 VITE_ 前缀：

~~~~dotenv
VITE_API_BASE=/api
VITE_APP_TITLE=课程站
SERVER_API_TOKEN=只供服务端读取
~~~~

## 六、在客户端读取和声明类型

~~~~ts
const apiBase = import.meta.env.VITE_API_BASE
const isProduction = import.meta.env.PROD
~~~~

~~~~ts
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
~~~~

TypeScript 声明只能提供编辑器类型，不能保证部署环境一定配置了值。关键配置仍应在应用启动时校验。

## 七、在配置文件中读取 mode

配置执行早于客户端转换，需要用 loadEnv 主动读取：

~~~~ts
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.APP_BASE || '/',
    define: {
      __APP_VERSION__: JSON.stringify(env.APP_VERSION || 'dev'),
    },
    envPrefix: 'VITE_',
  }
})
~~~~

不要把密码、私钥和服务端 token 放入 VITE_ 变量或 define，它们会成为可读取的浏览器代码。

## 八、易错使用提示

:::pitfalls
### 错误：把 VITE_ 变量当作密钥存储

**触发条件：** 将 token、数据库密码或私钥放进 `.env` 并加上 `VITE_`。

**原因：** Vite 会把公开前缀变量静态替换进客户端 bundle。

**后果：** 任何能下载 JS 的人都可读取值。

**错误示例：**

~~~~text
VITE_DATABASE_PASSWORD=...
~~~~

**正确写法：**

~~~~text
只暴露公开地址，敏感操作放到后端
~~~~

**验证方式：** 对 `dist` 做字面量扫描并检查网络请求。
:::

## 九、工作原理与适用边界

1. **官方事实：** envPrefix 控制客户端暴露，mode 与 NODE_ENV 是不同维度。
2. **课程推导：** 环境变量筛选是发布前安全检查，不是访问控制。
3. **边界：** 运行时动态配置需由服务端或 HTML 注入，不能假定 Vite 静态替换会更新它。

## 十、练习

:::exercise
### 练习目标

**要求：** 列出一份前端配置清单，标记“可以公开”“必须服务端持有”，并为每项写验证证据。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- mode 决定配置集合，前缀决定是否进浏览器，任何进 bundle 的值都应视为公开。

:::code-details{title="查看本节完整配置"}
~~~~text
// .env：所有 mode 共享的公开默认值
VITE_API_BASE=/api
VITE_APP_TITLE=课程站
SERVER_API_TOKEN=只供服务端读取

// .env.staging：vite build --mode staging 时覆盖
VITE_API_BASE=https://staging-api.example.com
APP_BASE=/staging/
APP_VERSION=8.2.1-staging

// src/vite-env.d.ts：只提供类型，不代替启动时校验
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_APP_TITLE: string
}
interface ImportMeta { readonly env: ImportMetaEnv }

// vite.config.ts：配置阶段必须主动 loadEnv
import { defineConfig, loadEnv } from 'vite'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.APP_BASE || '/',
    envPrefix: 'VITE_',
    define: { __APP_VERSION__: JSON.stringify(env.APP_VERSION || 'development') },
  }
})

// src/main.ts：客户端只能读取公开前缀变量
const apiBase = import.meta.env.VITE_API_BASE
if (!apiBase) throw new Error('缺少 VITE_API_BASE')
console.log({
  mode: import.meta.env.MODE,
  development: import.meta.env.DEV,
  production: import.meta.env.PROD,
  apiBase,
})

// 构建 staging，并扫描 dist 确认服务端 token 字面量没有进入产物
// npm run build -- --mode staging
~~~~
:::

## 十二、参考资料

- [Env Variables and Modes](https://vite.dev/guide/env-and-mode) - mode、优先级与公开前缀。
- [Shared Options](https://vite.dev/config/shared-options#envprefix) - envPrefix 配置。
