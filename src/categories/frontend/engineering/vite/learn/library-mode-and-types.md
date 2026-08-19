---
id: engineering.vite.learn.advanced.library-mode-and-types
type: lesson
title: Library Mode、external 与类型声明边界
summary: 构建可被第三方消费的库产物，并把运行时 bundle 与类型声明分开交付。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 42
prerequisites:
  - engineering.vite.learn.advanced.rollup-rolldown-and-manual-chunks
related:
  - engineering.vite.reference.config-build
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - library mode
  - external
  - 类型声明
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能配置 library entry、formats、fileName 和 external。
  - 能说明 Vite 不自动替代 TypeScript 声明发布流程。
sources:
  - title: Library Mode
    url: https://vite.dev/guide/build#library-mode
    sourceType: official-reference
  - title: Build lib Option
    url: https://vite.dev/config/build-options#build-lib
    sourceType: official-reference
---

# Library Mode、external 与类型声明边界

## 一、学习目标

- 输出 ESM/CJS 库文件并从独立 consumer 导入。
- 把 peer dependency external 化，验证没有重复打包。

## 二、为什么需要

应用构建可假设有 HTML 入口，库构建必须提供公开入口、格式、externals 和 package exports。Vite 负责
运行时代码构建，但类型声明仍需 TypeScript 或专门插件并单独验证。

## 三、核心概念

`build.lib` 定义 entry/name/formats/fileName/cssFileName；`external` 保留 consumer 依赖；package.json
`exports` 决定消费入口；`.d.ts` 是独立交付合同。

## 四、分步使用

1. 配置单入口 library mode。
2. 将 Vue 等 peer dependency external 化。
3. 构建并检查 package 文件和 CSS。
4. 在独立 consumer 中 import 产物并运行类型检查。

## 五、创建库入口

~~~~ts
// src/index.ts
import './style.css'

export interface Course {
  id: string
  title: string
}

export function createCourse(id: string, title: string): Course {
  return { id, title }
}
~~~~

~~~~css
/* src/style.css */
.course-title { color: #2563eb; }
~~~~

## 六、配置 Library Mode

~~~~ts
// vite.config.ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'CourseKit',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'course-kit.js' : 'course-kit.cjs'),
      cssFileName: 'course-kit',
    },
    rolldownOptions: {
      external: ['vue'],
    },
  },
})
~~~~

external 防止把 Vue 复制进库产物。它还必须在 package.json 中声明为 peerDependencies。

## 七、配置发布入口和类型

Vite 负责 JavaScript bundle，不负责自动生成 .d.ts。可用 TypeScript 单独生成声明：

~~~~json
{
  "name": "course-kit",
  "version": "1.0.0",
  "type": "module",
  "files": ["dist"],
  "scripts": {
    "build": "vite build && tsc -p tsconfig.build.json"
  },
  "main": "./dist/course-kit.cjs",
  "module": "./dist/course-kit.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/course-kit.js",
      "require": "./dist/course-kit.cjs"
    },
    "./style.css": "./dist/course-kit.css"
  },
  "peerDependencies": {
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "typescript": "7.0.2",
    "vite": "8.2.1"
  }
}
~~~~

新增只负责声明文件的 `tsconfig.build.json`。`rootDir` 和 `outDir` 会让 `src/index.ts` 对应输出为
`dist/index.d.ts`，与 `package.json` 的 `types`/`exports.types` 保持一致：

~~~~json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "types": ["vite/client"],
    "rootDir": "src",
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src/index.ts"]
}
~~~~

安装固定教程版本并执行完整构建：

~~~~sh
npm install --save-dev vite@8.2.1 typescript@7.0.2
npm run build
~~~~

构建结束后应同时看到 `dist/course-kit.js`、`dist/course-kit.cjs`、`dist/course-kit.css`、
`dist/index.d.ts` 和 `dist/index.d.ts.map`。

发布前应从包入口导入 createCourse，确认 JavaScript 与声明指向同一公共 API。

## 八、易错使用提示

:::pitfalls
### 错误：认为 library mode 自动生成 d.ts

**触发条件：** build 成功后直接发布，没有声明输出。

**原因：** Vite 构建运行时代码，不自动完成 TypeScript 声明合同。

**后果：** TypeScript consumer 丢失类型或解析到源码内部路径。

**错误示例：**

~~~~text
只运行 vite build 就宣称类型发布完成
~~~~

**正确写法：**

~~~~text
独立生成 d.ts，并用真实 consumer 验证 exports/types
~~~~

**验证方式：** consumer 同时执行 Node import 和 `tsc --noEmit`。
:::

## 九、工作原理与适用边界

1. Library Mode 定义运行时 bundle，不承诺声明生成。
2. external/peer/exports 必须从 consumer 侧验证。
3. 多入口、UMD 全局名和 CSS 交付应按发布目标逐项固定。

## 十、练习

:::exercise
### 练习目标

**要求：** 为一个 Vue composable 库列出 build、external、exports、types 和 consumer 五项完成标准。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- 库交付需要运行时代码、外部依赖、包入口和类型声明四个独立合同。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装教程版本
npm install -D vite@8.2.1 typescript@7.0.2

// src/index.ts
import './style.css'

export interface Course { id: string; title: string }
/** 创建课程值。 */
export function createCourse(id: string, title: string): Course {
  return { id, title }
}

// vite.config.ts：只构建运行时代码，并 external 化 peer dependency
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'CourseKit',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'course-kit.js' : 'course-kit.cjs'),
      cssFileName: 'course-kit',
    },
    rolldownOptions: { external: ['vue'] },
  },
})

// tsconfig.build.json：独立生成声明
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "types": ["vite/client"],
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/index.ts"]
}

// package.json：把运行入口、声明和 peer dependency 配对
{
  "name": "course-kit",
  "type": "module",
  "files": ["dist"],
  "scripts": { "build": "vite build && tsc -p tsconfig.build.json" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/course-kit.js",
      "require": "./dist/course-kit.cjs"
    },
    "./style.css": "./dist/course-kit.css"
  },
  "peerDependencies": { "vue": "^3.5.0" }
}

// src/style.css 由 cssFileName 输出为 dist/course-kit.css
.course-title { color: #2563eb; }

// npm run build 后检查 JS/CSS/声明，再用 npm pack 验证 import 与 tsc --noEmit
~~~~
:::

## 十二、参考资料

- [Library Mode](https://vite.dev/guide/build#library-mode) - 库入口和格式。
- [build.lib](https://vite.dev/config/build-options#build-lib) - 配置 interface。
