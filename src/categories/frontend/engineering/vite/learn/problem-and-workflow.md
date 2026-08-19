---
id: engineering.vite.learn.basics.problem-and-workflow
type: lesson
title: Vite 解决什么问题：开发服务器与生产构建
summary: 用同一份源码解释 Vite 开发期模块服务和生产期构建的责任边界。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 30
prerequisites:
  - engineering.typescript.learn.advanced.framework-type-integration
related:
  - engineering.vite.reference.config-shared
tags:
  - Vite
  - 开发服务器
  - 生产构建
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能区分 vite dev、vite build 和 vite preview 的输入与输出。
  - 能说明浏览器请求模块与生产 chunk 的差异。
sources:
  - title: Vite Getting Started
    url: https://vite.dev/guide/
    sourceType: official-reference
  - title: Vite Build Options
    url: https://vite.dev/config/build-options
    sourceType: official-reference
---

# Vite 解决什么问题：开发服务器与生产构建

## 一、学习目标

- 给一个项目选择正确的 Vite 命令，并说出它是否产生可部署文件。
- 从网络请求和 `dist` 文件判断当前处于开发还是生产路径。

## 二、为什么需要

浏览器不能直接执行 Vue SFC、TypeScript 或带资源查询的源码。开发时需要快速反馈，发布时需要
可缓存、可部署的产物；两种需求的优化方向不同。

## 三、核心概念

`vite`/`vite dev` 启动开发服务器，按请求转换模块并维护模块图；`vite build` 读取同一入口，执行
生产转换和分块，写入 `dist`；`vite preview` 只是本地静态预览已生成的产物，不是生产服务器。

## 四、分步使用

1. 先运行 `npm run dev`，在浏览器 Network 中观察 `/src/...` 模块请求。
2. 再运行 `npm run build`，查看 `dist/assets` 中带 hash 的 chunk。
3. 最后运行 `npm run preview`，确认页面只读取 `dist`，不会重新转换源码。

## 五、从零创建第一个 Vite 项目

先确认 Node.js 满足 Vite 8 的版本要求，然后创建一个原生 TypeScript 项目：

~~~~sh
mkdir vite-course
cd vite-course
npm init -y
npm install --save-dev vite@8.2.1 typescript@7.0.2
mkdir src
~~~~

接着创建下面这组最小文件。Vite 把 index.html 当作应用入口，而不是把它藏在 public 目录：

~~~~text
vite-course/
├── index.html
├── package.json
├── src/
│   ├── main.ts
│   └── style.css
└── tsconfig.json
~~~~

## 六、理解三个命令

开发服务器直接服务源码模块，保存文件后提供 HMR；生产构建分析完整依赖图并写入 dist；preview
只静态服务已经生成的 dist。

~~~~json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "7.0.2",
    "vite": "8.2.1"
  }
}
~~~~

按下面的顺序体验完整工作流：

~~~~sh
npm run dev
npm run build
npm run preview
~~~~

开发阶段修改 src/main.ts，不需要先生成 dist。准备部署时必须重新执行 build，部署目标是 dist，
而不是源码目录。preview 适合在发布前检查资源路径和路由回退，不负责 TLS、进程守护或弹性伸缩。

## 七、最小可运行示例

~~~~html
<!-- index.html -->
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
~~~~

~~~~ts
// src/main.ts
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  app.textContent = 'Vite 已启动'
}
~~~~

为页面补上最小样式，确认 CSS 也会进入同一份模块图：

~~~~css
/* src/style.css */
:root {
  font-family: system-ui, sans-serif;
  color: #1f2937;
  background: #f8fafc;
}

body {
  margin: 0;
  padding: 32px;
}
~~~~

最后创建 TypeScript 配置。`noEmit` 表示类型检查不输出 JavaScript，实际转换和构建交给 Vite：

~~~~json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
~~~~

这段代码在开发期以浏览器原生 ESM 请求加载，在生产期会被转换、压缩并输出带 hash 的资源文件。

## 八、易错使用提示

:::pitfalls
### 错误：把 preview 当成开发服务器

**触发条件：** 修改 `src` 后只重启 preview 并期待源码热更新。

**原因：** preview 服务的是已经写入 `dist` 的文件。

**后果：** 看不到修改，误以为构建或缓存失效。

**错误示例：**

~~~~text
vite preview 后直接编辑 src/main.ts
~~~~

**正确写法：**

~~~~text
开发反馈使用 vite dev，发布结果使用 vite build && vite preview
~~~~

**验证方式：** 比较 Network 中的 `/src/` 请求和 `/assets/` 请求。
:::

## 九、工作原理与适用边界

1. **官方事实：** Guide 将 dev、build、preview 作为三个独立 CLI 入口。
2. **课程推导：** 开发期证据不能替代生产产物证据，反之亦然。
3. **边界：** preview 不提供 CDN、TLS、进程守护或真实部署平台能力。

## 十、练习

:::exercise
### 练习目标

**要求：** 给一个包含动态 import 的页面，分别记录 dev 请求和 build 输出的差异，并解释为什么只在 build 后
出现 chunk 文件。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- dev 解决反馈速度，build 解决可部署产物，preview 只验证产物可被静态服务。

:::code-details{title="查看本节完整示例"}
~~~~text
// 1. 创建并安装教程版本
mkdir vite-course
cd vite-course
npm init -y
npm install -D vite@8.2.1 typescript@7.0.2

// 2. package.json
{
  "scripts": {
    "dev": "vite",
    "type-check": "tsc --noEmit",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": { "typescript": "7.0.2", "vite": "8.2.1" }
}

// 3. tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}

// 4. index.html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>

// 5. src/main.ts
import './style.css'
const app = document.querySelector<HTMLDivElement>('#app')
if (app) app.textContent = 'Vite 已启动'

// 6. src/style.css
:root { font-family: system-ui, sans-serif; color: #1f2937; background: #f8fafc; }
body { margin: 0; padding: 32px; }

// 7. 开发时使用源码模块；发布前重新构建并预览 dist
npm run dev
npm run type-check
npm run build
npm run preview
~~~~
:::

## 十二、参考资料

- [Getting Started](https://vite.dev/guide/) - CLI 与开发/构建入口。
- [Build Options](https://vite.dev/config/build-options) - 生产构建配置。
