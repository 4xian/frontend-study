---
id: engineering.vite.reference.config-ssr-worker
type: reference
title: Vite SSR 与 Worker Options
summary: 查阅 SSR external/resolve 规则及 Worker 格式、插件和 Rolldown 构建配置。
domain: frontend
technology: engineering
module: vite
group: configuration
signature: |-
  export default defineConfig({ ssr: { external, noExternal }, worker: { format, plugins } })
related:
  - engineering.vite.learn.intermediate.worker-base-and-multi-env
  - engineering.vite.learn.advanced.ssr-dev-build-hydration
tags:
  - Vite
  - SSR
  - Worker
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 SSR Options
    url: https://vite.dev/config/ssr-options
    sourceType: official-reference
    appliesTo: Vite 8.2.1
  - title: Vite 8.2.1 Worker Options
    url: https://vite.dev/config/worker-options
    sourceType: official-reference
    appliesTo: Vite 8.2.1
anchors:
  - ssrexternal
  - ssrnoexternal
  - ssrtarget
  - ssrresolveconditions
  - ssrresolveexternalconditions
  - ssrresolvemainfields
  - workerformat
  - workerplugins
  - workerrolldownoptions
---

# Vite SSR 与 Worker Options

SSR 配置决定服务端依赖是否交给 Node 运行时或参与 Vite 转换；Worker 配置只作用于独立 worker bundle。
两者均需要对应的 Node 或 Worker 入口，普通 SPA 页面不会执行这些分支。

## 一、ssr.external

强制依赖在 SSR 中外部化，由运行时 Node 解析。链接依赖默认参与转换，需要明确外部化时列出包名。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    external: ['node-only-package'],
  },
})
~~~~

## 二、ssr.noExternal

强制依赖进入 SSR bundle/转换，适合发布形态与 Node 不兼容的包。设为 `true` 会扩大 bundle，应优先列出最小集合。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    noExternal: ['needs-transform'],
  },
})
~~~~

## 三、ssr.target

选择 `node` 或 `webworker` 等服务端目标，影响默认 resolve conditions 与运行 API。目标必须与实际部署 runtime
一致。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    target: 'node',
  },
})
~~~~

## 四、ssr.resolve.conditions

为参与 Vite 转换的 SSR 依赖增加条件。启动生产 server 时也要向 Node 提供匹配 conditions，避免 dev/build
入口漂移。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    resolve: {
      conditions: ['node', 'development'],
    },
  },
})
~~~~

## 五、ssr.resolve.externalConditions

设置外部化依赖的条件解析；它需要与 Node `--conditions` 同步，且只影响 external 依赖。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    resolve: {
      externalConditions: ['node'],
    },
  },
})
~~~~

## 六、ssr.resolve.mainFields

当条件导出没有命中时选择 SSR 包入口字段。成功解析 `exports` 后该列表不再参与。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    resolve: {
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  },
})
~~~~

## 七、worker.format

选择 worker 产物格式。目标浏览器和 Worker 创建方式必须支持该格式；不能只检查主线程 bundle。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  worker: {
    format: 'es',
  },
})
~~~~

## 八、worker.plugins

返回应用于 worker 构建的新插件实例。Worker 构建可并行执行，禁止复用带可变内部状态的单一插件对象。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  worker: {
    plugins: () => [],
  },
})
~~~~

## 九、worker.rolldownOptions

为 worker bundle 传递 Rolldown 配置。Vite 8.2.1 的旧 `worker.rollupOptions` 已 deprecated，应迁移到此项。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  worker: {
    rolldownOptions: { output: { entryFileNames: 'assets/worker-[hash].js' } },
  },
})
~~~~

## 十、完整配置示例

下面的配置把本页选项集中写在一起。实际项目应只保留确实需要的选项，并根据部署地址、依赖和入口调整值。

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    external: ['node-only-package'],
    noExternal: ['needs-transform'],
    target: 'node',
    resolve: {
      conditions: ['node', 'development'],
      externalConditions: ['node'],
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  },
  worker: {
    format: 'es',
    plugins: () => [],
    rolldownOptions: { output: { entryFileNames: 'assets/worker-[hash].js' } },
  },
})
~~~~

## 十一、易错使用提示

:::pitfalls
### 错误：无差别内联所有 SSR 依赖

**触发条件：** 为绕过单个包的 SSR 转换问题，把 `ssr.noExternal` 直接设置为 `true`。

**原因：** 全量内联会改变 Node 依赖解析、条件导出与构建成本，掩盖真正需要转换的包边界。

**后果：** SSR 构建变慢，原生依赖或仅服务端包可能在错误的转换路径失败。

**错误示例：**

```ts
export default { ssr: { noExternal: true } }
```

**正确写法：**

```ts
export default { ssr: { noExternal: ['needs-transform'] } }
```

**验证方式：** 在 SSR 应用中依次执行 `ssrLoadModule`、SSR build 和 Node 产物导入。
:::

## 十二、工作原理与适用边界

1. 官方事实：SSR 的 external/conditions 与 Worker 的 format/plugins/rolldownOptions 属于两套独立环境配置。
2. 课程推导：同一依赖在浏览器、SSR 和 Worker 中可能选择不同入口，必须分别运行对应环境。
3. 适用边界：SSR 与 Worker 是独立运行环境，需要分别创建入口、构建并执行。

## 十三、参考资料

- [Vite 8.2.1 SSR Options](https://vite.dev/config/ssr-options) - 支持 SSR 依赖与解析边界。
- [Vite 8.2.1 Worker Options](https://vite.dev/config/worker-options) - 支持 Worker 格式、插件与构建配置。
