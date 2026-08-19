---
id: engineering.vite.learn.advanced.build-output-and-chunks
type: lesson
title: vite build、生产产物与 chunk
summary: 从入口、动态 import 和 manifest 还原生产产物的加载关系。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 40
prerequisites:
  - engineering.vite.learn.intermediate.worker-base-and-multi-env
related:
  - engineering.vite.reference.config-build
tags:
  - vite build
  - chunk
  - manifest
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能使用 manifest 解释入口、动态 chunk 和资源关系。
  - 能区分模块预加载、CSS 拆分与资源内联。
sources:
  - title: Building for Production
    url: https://vite.dev/guide/build
    sourceType: official-reference
  - title: Build Options
    url: https://vite.dev/config/build-options
    sourceType: official-reference
---

# vite build、生产产物与 chunk

## 一、学习目标

- 从 `dist/.vite/manifest.json` 找到入口、imports、dynamicImports、css 和 assets。
- 为动态功能写出可验证的加载路径，而不是只看文件数量。

## 二、为什么需要

生产构建是否正确要由产物证明。文件名和 chunk 数会随依赖图及 bundler 策略变化，不能把某次输出
硬编码成长期合同。

## 三、核心概念

HTML 是应用入口；静态 import 可能合并，动态 import 建立异步边界；manifest 提供源码入口到输出的
机器可读映射；module preload 和 CSS split 决定初始请求关系。

## 四、分步使用

1. 启用 `build.manifest` 并执行 clean build。
2. 解析 manifest，而不是按文件名猜 chunk。
3. 从动态入口追踪 JS/CSS/asset 列表。
4. 用 preview 和 Network 验证实际请求。

## 五、创建生产构建

先为动态功能建立明确的 import 边界：

~~~~ts
const button = document.querySelector<HTMLButtonElement>('#open-report')

button?.addEventListener('click', async () => {
  const { openReport } = await import('./report')
  openReport()
})
~~~~

执行构建：

~~~~sh
npm run build
~~~~

Vite 会从 index.html 分析静态与动态依赖，输出 HTML、入口 chunk、异步 chunk、CSS 和资源。

## 六、使用 manifest 读取产物关系

后端需要注入构建资源时开启 manifest：

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    manifest: true,
    sourcemap: false,
    cssCodeSplit: true,
    emptyOutDir: true,
  },
})
~~~~

构建后读取 dist/.vite/manifest.json。用源码入口键定位 file、css、imports 和 dynamicImports，
不要根据 hash 文件名猜资源关系。

~~~~ts
interface ManifestChunk {
  file: string
  css?: string[]
  imports?: string[]
  dynamicImports?: string[]
}

const entry = manifest['index.html'] as ManifestChunk
~~~~

chunk 数量会随依赖图和构建器优化变化；稳定合同应是入口能加载、动态边界存在、资源 URL 可访问。

## 七、易错使用提示

:::pitfalls
### 错误：把 chunk 数量当作稳定合同

**触发条件：** 测试断言 `dist/assets` 永远恰好三个 JS。

**原因：** bundler 会因依赖图、版本和策略合并或拆分。

**后果：** 无行为回归也会失败，真实加载错误反而可能漏掉。

**错误示例：**

~~~~text
expect(jsFiles).toHaveLength(3)
~~~~

**正确写法：**

~~~~text
断言 manifest 中关键入口和动态关系存在
~~~~

**验证方式：** 同时解析 manifest 并在 preview 观察请求。
:::

## 八、工作原理与适用边界

1. 官方 build/manifest 定义机器可读产物接口。
2. 产物审计应围绕入口关系和可部署 URL，而非 hash 名。
3. 实际缓存和 CDN 行为必须在目标部署环境中配置和检查。

## 九、练习

:::exercise
### 练习目标

**要求：** 从一份 manifest 还原入口、共享依赖和两个动态页面的请求图。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十、本节小结

- 用 manifest 和 preview 证明生产关系，不把偶然的 chunk 名称当公共合同。

:::code-details{title="查看本节完整配置"}
~~~~text
// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    manifest: true,
    sourcemap: false,
    cssCodeSplit: true,
    emptyOutDir: true,
  },
})

// src/main.ts：动态 import 建立可观察的异步边界
const button = document.querySelector<HTMLButtonElement>('#open-report')
button?.addEventListener('click', async () => {
  const { openReport } = await import('./report')
  openReport()
})

// scripts/read-manifest.ts：按关系读取产物，不猜 hash 文件名
import { readFile } from 'node:fs/promises'
interface ManifestChunk {
  file: string
  css?: string[]
  imports?: string[]
  dynamicImports?: string[]
  assets?: string[]
}

const manifest = JSON.parse(
  await readFile('dist/.vite/manifest.json', 'utf8'),
) as Record<string, ManifestChunk>
const entry = manifest['index.html']
if (!entry) throw new Error('manifest 缺少 index.html 入口')
console.log({
  entry: entry.file,
  styles: entry.css ?? [],
  staticImports: entry.imports ?? [],
  dynamicImports: entry.dynamicImports ?? [],
  assets: entry.assets ?? [],
})

// package.json scripts
{
  "scripts": {
    "build": "vite build",
    "inspect:build": "node --experimental-strip-types scripts/read-manifest.ts",
    "preview": "vite preview"
  }
}
~~~~
:::

## 十一、参考资料

- [Building for Production](https://vite.dev/guide/build) - 生产构建和 public base。
- [Build Options](https://vite.dev/config/build-options) - manifest、chunk 和 source map。
