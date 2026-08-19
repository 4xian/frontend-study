---
id: engineering.vite.reference.config-build
type: reference
title: Vite Build Options
summary: 查阅生产目标、CSS、source map、Rolldown、library、manifest、SSR 产物与输出控制。
domain: frontend
technology: engineering
module: vite
group: configuration
signature: |-
  export default defineConfig({ build: { target, outDir, rolldownOptions, manifest } })
related:
  - engineering.vite.learn.advanced.build-output-and-chunks
  - engineering.vite.learn.advanced.library-mode-and-types
  - engineering.vite.learn.advanced.performance-source-maps
tags:
  - Vite
  - Build Options
  - Rolldown
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 Build Options
    url: https://vite.dev/config/build-options
    sourceType: official-reference
    appliesTo: Vite 8.2.1
anchors:
  - buildtarget
  - buildmodulepreload
  - buildoutdir
  - buildassetsdir
  - buildassetsinlinelimit
  - buildcsscodesplit
  - buildcsstarget
  - buildcssminify
  - buildsourcemap
  - buildrolldownoptions
  - builddynamicimportvarsoptions
  - buildlib
  - buildlicense
  - buildmanifest
  - buildssrmanifest
  - buildssr
  - buildemitassets
  - buildssremitassets
  - buildminify
  - buildterseroptions
  - buildwrite
  - buildemptyoutdir
  - buildcopypublicdir
  - buildreportcompressedsize
  - buildchunksizewarninglimit
  - buildwatch
---

# Vite Build Options

## 一、build.target

声明生产 JavaScript 目标环境。转换器不会为缺失 Web API 注入 polyfill，浏览器矩阵与运行时能力需另行验证。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2022',
  },
})
~~~~

## 二、build.modulePreload

控制 modulepreload polyfill 和依赖解析。自定义依赖函数必须保留正确 base 与动态 import 加载顺序。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    modulePreload: { polyfill: true },
  },
})
~~~~

## 三、build.outDir

指定输出目录。目录位于 root 外时 Vite 不默认清空，因此应使用专门的构建输出目录。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
  },
})
~~~~

## 四、build.assetsDir

设置生成资源在 `outDir` 下的子目录，不影响 public 文件的根路径复制行为。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    assetsDir: 'assets',
  },
})
~~~~

## 五、build.assetsInlineLimit

小资源可按阈值内联为 data URL；Git LFS 占位符不会自动内联。调整前比较缓存复用与请求数量。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    assetsInlineLimit: 4096,
  },
})
~~~~

## 六、build.cssCodeSplit

控制异步 chunk 的 CSS 是否拆分并按需加载。关闭后 CSS 合并为单文件，需验证首屏体积与顺序。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    cssCodeSplit: true,
  },
})
~~~~

## 七、build.cssTarget

单独指定 CSS 目标，解决 JavaScript target 与目标浏览器 CSS 压缩支持不一致的问题。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    cssTarget: 'chrome111',
  },
})
~~~~

## 八、build.cssMinify

选择 CSS 压缩器或关闭压缩。Lightning CSS 的语义与默认 minifier 不完全相同，迁移需比较产物。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    cssMinify: true,
  },
})
~~~~

## 九、build.sourcemap

支持外部、inline 或 hidden source map。即使 hidden 不写引用注释，`.map` 文件仍可能包含源码并需控制发布权限。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
})
~~~~

## 十、build.rolldownOptions

向 Vite 8 的 Rolldown 构建传递入口、external、输出等底层配置。优先使用该稳定名称，旧
`build.rollupOptions` 已进入 deprecated 观察范围。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: { input: 'index.html' },
  },
})
~~~~

## 十一、build.dynamicImportVarsOptions

调整带变量的动态 import 转换范围。模式必须可静态分析，任意运行时路径仍无法被构建器枚举。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    dynamicImportVarsOptions: { warnOnError: true },
  },
})
~~~~

## 十二、build.lib

配置库入口、名称、格式与文件名。Vite 生成运行时代码但不自动生成 TypeScript 声明文件。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', formats: ['es', 'cjs'], fileName: 'course-kit' },
  },
})
~~~~

## 十三、build.license

收集依赖许可证并生成文件或产物引用。最终发布仍需按依赖许可证核验内容和归属。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    license: { fileName: 'licenses.md' },
  },
})
~~~~

## 十四、build.manifest

输出源码入口到 hash 产物、CSS 与动态依赖的映射，供后端生成生产 HTML；字段应按 manifest 合同读取。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    manifest: true,
  },
})
~~~~

## 十五、build.ssrManifest

输出 SSR 模块到客户端资源的映射，用于生成 preload。它不是普通客户端 manifest 的替代品。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssrManifest: true,
  },
})
~~~~

## 十六、build.ssr

指定 SSR 入口并切换服务器构建。完整 SSR 需要独立 client build、server build 和 Node 响应验证。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: 'src/entry-server.ts',
  },
})
~~~~

## 十七、build.emitAssets

允许非客户端环境构建发出资源。多环境构建需避免不同阶段重复覆盖同一路径。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emitAssets: true,
  },
})
~~~~

## 十八、build.ssrEmitAssets

允许 SSR build 发出静态资源；通常还需由后续步骤与客户端资源合并并解决重复文件。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssrEmitAssets: true,
  },
})
~~~~

## 十九、build.minify

控制 JavaScript 压缩。库的 ES 格式会保留部分纯注释语义，不能只用文件大小判断压缩正确性。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: true,
  },
})
~~~~

## 二十、build.terserOptions

仅在选择 Terser 时传递配置，并要求项目安装 `terser`。Vite 8 默认路径不应无理由引入旧压缩器。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: { format: { comments: false } },
  },
})
~~~~

## 二十一、build.write

设为 `false` 时只在 JavaScript API 中返回产物，不写磁盘，适合后处理或断言输出结构。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    write: true,
  },
})
~~~~

## 二十二、build.emptyOutDir

控制构建前清理输出目录。仅对明确的专用 outDir 开启，不能指向工作区根或共享资产目录。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
})
~~~~

## 二十三、build.copyPublicDir

控制是否把 `publicDir` 原样复制到输出根。官方锚点为 `build-copypublicdir`，不是旧矩阵中的拼写。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    copyPublicDir: true,
  },
})
~~~~

## 二十四、build.reportCompressedSize

控制是否计算 gzip 估算；大型项目可关闭以缩短构建，但关闭不会改变产物内容。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    reportCompressedSize: true,
  },
})
~~~~

## 二十五、build.chunkSizeWarningLimit

调整未压缩 chunk warning 阈值。提高阈值不等于解决加载性能，应先分析模块图和实际网络路径。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 600,
  },
})
~~~~

## 二十六、build.watch

开启构建 watch 并传递 watcher 配置。生产发布仍应使用一次性、固定输入的构建快照。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    watch: {},
  },
})
~~~~

## 二十七、按构建类型组织完整配置

应用 HTML 入口、Library Mode 与 SSR server 是三种不同的构建入口，不能堆进同一次 build。下面按用途
拆成可直接执行的完整配置，并让本页选项各自出现在有效场景中。

## 二十八、客户端应用构建

只有选择 Terser 时 `terserOptions` 才生效，先安装它：

~~~~sh
npm install --save-dev terser
~~~~

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2022',
    modulePreload: { polyfill: true },
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    cssTarget: 'chrome111',
    cssMinify: true,
    sourcemap: 'hidden',
    rolldownOptions: { input: 'index.html' },
    dynamicImportVarsOptions: { warnOnError: true },
    license: { fileName: 'licenses.md' },
    manifest: true,
    minify: 'terser',
    terserOptions: { format: { comments: false } },
    write: true,
    emptyOutDir: true,
    copyPublicDir: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
  },
})
~~~~

## 二十九、库构建

库构建使用源码入口，不再同时配置 HTML input 或 SSR 入口。`external` 防止把 peer dependency 打进库：

~~~~ts
// vite.library.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/library',
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'course-kit',
    },
    rolldownOptions: {
      external: ['vue'],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
~~~~

通过 `vite build --config vite.library.config.ts` 执行库构建。类型声明仍需用 TypeScript 单独生成。

## 三十、SSR 客户端与服务器构建

SSR 需要先构建客户端资源和 preload manifest，再单独构建 server 入口：

~~~~ts
// vite.ssr-client.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/client',
    manifest: true,
    ssrManifest: true,
    emptyOutDir: true,
  },
})
~~~~

~~~~ts
// vite.ssr-server.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: 'src/entry-server.ts',
    outDir: 'dist/server',
    emitAssets: true,
    ssrEmitAssets: true,
    emptyOutDir: true,
  },
})
~~~~

分别执行 `vite build --config vite.ssr-client.config.ts` 与
`vite build --config vite.ssr-server.config.ts`。客户端和服务器使用不同 `outDir`，不会在第二次构建时
清空第一次的输出。

## 三十一、持续构建

`watch` 会让进程持续等待文件变化，因此不应混进一次性的发布构建。需要持续输出时使用独立配置：

~~~~ts
// vite.watch.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/watch',
    watch: {},
    emptyOutDir: true,
  },
})
~~~~

## 三十二、易错使用提示

:::pitfalls
### 错误：认为 library mode 会自动生成 TypeScript 声明

**触发条件：** 只配置 `build.lib` 并把 JavaScript 产物与手写类型一起发布。

**原因：** Vite 负责构建运行时代码，不执行 TypeScript 类型检查，也不自动生成声明文件。

**后果：** 包可能能运行但缺少或携带过期的 `.d.ts`，使用者得到错误的类型合同。

**错误示例：**

```ts
export default { build: { lib: { entry: 'src/index.ts', formats: ['es'] } } }
```

**正确写法：**

```text
先独立运行 tsc --emitDeclarationOnly，再核对 Vite 库产物与声明入口
```

**验证方式：** 在独立的消费项目中同时导入构建产物和声明文件，并运行类型检查与 Node 导入。
:::

## 三十三、工作原理与适用边界

1. 官方事实：Build Options 控制入口、资源、压缩、manifest、SSR 和写盘行为，类型声明不属于该接口。
2. 课程推导：构建通过只证明产物生成；发布前还要独立核对 chunk、资源 URL、声明与外部依赖。
3. 适用边界：本页描述 Vite 构建配置；部署缓存、CDN 和固定环境性能结论需要外部平台证据。

## 三十四、参考资料

- [Vite 8.2.1 Build Options](https://vite.dev/config/build-options) - 支持本页构建配置、默认行为与版本边界。
