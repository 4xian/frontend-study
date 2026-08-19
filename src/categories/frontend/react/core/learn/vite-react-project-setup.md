---
id: react.core.learn.basics.vite-react-project-setup
type: lesson
title: Vite React 项目搭建
summary: 从空目录创建 React + TypeScript 项目，完成安装、开发运行、首次修改、生产构建和本地预览。
domain: frontend
technology: react
module: core
stage: basics
level: beginner
estimatedMinutes: 50
prerequisites: []
related:
  - react.core.learn.basics.tsx-markup-syntax
tags:
  - React
  - Vite
  - TypeScript
  - 项目搭建
  - 开发服务器
  - 生产构建
appliesTo: React 19.2.8、Vite 8.2.x、create-vite 9.1.2（核验于 2026-08-15）
verifiedAt: 2026-08-15
objectives:
  - 能检查 Node.js 和 npm，并用 react-ts 模板创建一个新项目。
  - 能在正确的项目根目录安装依赖并启动开发服务器。
  - 能从 index.html 追踪到 src/main.tsx 和 src/App.tsx 的入口链。
  - 能修改一段可见文本，并区分开发反馈、生产构建与本地产物预览。
  - 能按环境、目录、依赖、端口和入口链的顺序排查启动问题。
recap:
  - 用 npm create vite@latest my-react-app -- --template react-ts 创建目标模板。
  - npm install 安装 package.json 声明的依赖，dev、build、preview 都来自项目 scripts。
  - Vite 从项目根 index.html 开始，入口链继续到 src/main.tsx 和 src/App.tsx。
  - dev、build 和 preview 分别验证源码反馈、类型与构建、已生成的 dist 产物。
sources:
  - title: React：从零构建 React 应用
    url: https://react.dev/learn/build-a-react-app-from-scratch
    sourceType: official-reference
    appliesTo: React 文档 19.2
    claims:
      - React 官方给出使用 Vite 与 react-ts 模板创建项目的命令。
      - 从构建工具起步适合学习基础，但不等同于所有生产应用的框架选型。
  - title: Vite：开始使用
    url: https://vite.dev/guide/
    sourceType: official-reference
    appliesTo: Vite 8.2.x
    claims:
      - react-ts 是官方模板，Node.js 需要满足当前 Vite 的支持范围。
      - npm create vite、index.html 和默认 npm scripts 的使用方式。
  - title: Vite：生产构建
    url: https://vite.dev/guide/build.html
    sourceType: official-reference
    appliesTo: Vite 8.2.x
    claims:
      - vite build 从项目入口构建生产产物。
  - title: Vite：部署静态站点
    url: https://vite.dev/guide/static-deploy.html
    sourceType: official-reference
    appliesTo: Vite 8.2.x
    claims:
      - vite preview 在本地提供 dist 构建产物，不是生产服务器。
  - title: Vite：功能
    url: https://vite.dev/guide/features.html
    sourceType: official-reference
    appliesTo: Vite 8.2.x
    claims:
      - 模板预配置 HMR 与 React Fast Refresh，Vite 转译 TypeScript 但不独立执行类型检查。
  - title: Vite：静态资源处理
    url: https://vite.dev/guide/assets.html
    sourceType: official-reference
    appliesTo: Vite 8.2.x
    claims:
      - public 目录资源从根路径提供，src 中的资源通过源码导入进入模块图。
  - title: Vite：开发服务器选项
    url: https://vite.dev/config/server-options.html
    sourceType: official-reference
    appliesTo: Vite 8.2.x
    claims:
      - 默认端口被占用时会尝试下一个可用端口。
  - title: Vite：故障排除
    url: https://vite.dev/guide/troubleshooting.html
    sourceType: official-reference
    appliesTo: Vite 8.2.x
    claims:
      - 导入路径大小写不一致和受限的文件监听环境会影响开发反馈。
  - title: npm：npm init
    url: https://docs.npmjs.com/cli/v11/commands/npm-init
    sourceType: official-reference
    appliesTo: npm CLI 11
    claims:
      - npm create 是 npm init 的别名，-- 后的参数会传给 initializer。
  - title: npm：npm install
    url: https://docs.npmjs.com/cli/v11/commands/npm-install
    sourceType: official-reference
    appliesTo: npm CLI 11
    claims:
      - 在项目目录执行 npm install 会安装 package.json 声明的依赖。
  - title: npm：Scripts
    url: https://docs.npmjs.com/cli/v11/using-npm/scripts
    sourceType: official-reference
    appliesTo: npm CLI 11
    claims:
      - package.json 中的 scripts 可以通过 npm run 执行。
  - title: TypeScript：Project References
    url: https://www.typescriptlang.org/docs/handbook/project-references.html
    sourceType: official-reference
    appliesTo: TypeScript 当前文档（核验于 2026-08-15）
    claims:
      - tsc -b 会使用 build mode 构建或检查引用的项目。
  - title: Vite 官方 react-ts 模板 package.json
    url: https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/package.json
    sourceType: project-source
    appliesTo: create-vite 9.1.2
    claims:
      - 模板提供 dev、build、lint 和 preview scripts。
  - title: Vite 官方 react-ts 模板 index.html
    url: https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/index.html
    sourceType: project-source
    appliesTo: create-vite 9.1.2
    claims:
      - 根 index.html 通过 #root 和 /src/main.tsx 连接客户端入口。
  - title: Vite 官方 react-ts 模板 main.tsx
    url: https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/src/main.tsx
    sourceType: project-source
    appliesTo: create-vite 9.1.2
    claims:
      - main.tsx 导入 App.tsx 并使用模板已经接好的 React DOM 入口代码。
  - title: Vite 官方 react-ts 模板 App.tsx
    url: https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/src/App.tsx
    sourceType: project-source
    appliesTo: create-vite 9.1.2
    claims:
      - App.tsx 提供模板的默认可见内容，适合进行第一次文本修改。
---

# Vite React 项目搭建

## 一、学习目标

- 检查本机环境，用 `react-ts` 模板创建一个新的 React 项目。
- 在项目根目录完成依赖安装、开发运行和生产构建。
- 沿着 `index.html -> src/main.tsx -> src/App.tsx` 解释项目入口链。
- 修改一段可见文本，并分别验证开发服务器和生产构建。
- 在本地预览 `dist/`，说明 preview 与 dev、生产服务器的区别。
- 遇到启动问题时，先定位第一条错误，再按固定顺序修正。

## 二、为什么需要

浏览器不能直接把一个包含 TypeScript、TSX 和模块导入的源码目录当作完整应用运行。项目需要一个构建
工具提供开发服务器、源码转换和生产构建；React 官方把 Vite 列为从零构建 React 应用的可选工具。

本课程聚焦项目的创建、启动、修改和验证。模板中会出现少量入口代码，只需确认这些文件怎样连接，以及
修改后如何得到开发、构建和预览反馈。

React 官方在新应用选型上优先推荐框架；本课程采用 Vite 是为了学习客户端项目的基础入口和反馈环，或
服务于不需要框架能力的小型客户端项目，不代表所有生产应用都应直接使用裸 Vite。

## 三、核心概念

### 1. 先检查工具链

在创建项目之前打开终端：

```sh
node --version
npm --version
```

Vite 8 当前支持 Node.js `20.19+` 或 `22.12+`。版本号的次版本边界也有效：`20.18` 和 `22.11`
都不满足这个要求。若生成器或包管理器明确提示了更高要求，以提示为准。

### 2. 创建项目

在准备放置项目的父目录运行：

```sh
npm create vite@latest my-react-app -- --template react-ts
```

这条命令的每一部分都有职责：

- `npm create vite@latest` 调用当前 `create-vite` 生成器。
- `my-react-app` 是新目录名，可以替换成自己的项目名。
- npm 7 及更高版本需要额外的 `--`，把后面的选项传给生成器。
- `react-ts` 同时选择 React 和 TypeScript；`react` 是不同的 JavaScript 模板。

命令结束后，终端会提示下一步。项目名和生成器版本可以变化，但本课要得到的是一个包含 `src/main.tsx`
的 React + TypeScript 项目。

### 3. 安装依赖并查看 scripts

进入生成的目录：

```sh
cd my-react-app
npm install
```

`npm install` 读取当前目录的 `package.json`，把声明的依赖安装到 `node_modules/`，并维护
`package-lock.json`。`node_modules/` 是安装结果，不是要手工编辑的源码目录。

先打开 `package.json`，找到模板提供的 scripts：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  }
}
```

不要把这些名称当作 React 的全局命令；`npm run dev` 和 `npm run build` 只是执行当前项目的 scripts。

### 4. 启动开发服务器

```sh
npm run dev
```

终端会打印实际的 Local URL。默认候选通常是 `http://localhost:5173/`；如果端口已被占用，Vite 默认会
尝试下一个可用端口。因此要打开终端实际打印的地址，而不是假定永远是 `5173`。

开发服务器保持运行时，浏览器会读取源码模块。保存文件后，模板已经配置的 HMR/React Fast Refresh 会
尝试把修改反馈到页面。

### 5. 执行生产构建

```sh
npm run build
```

模板的 `build` script 先执行 `tsc -b`，成功后才执行 `vite build`：

1. `tsc -b` 按模板的 TypeScript project references 检查应用与 Vite 配置项目。
2. shell 中的 `&&` 会在第一步失败时停止，不再继续构建。
3. `vite build` 从项目根的 `index.html` 开始，默认生成 `dist/`。

Vite 在开发期可以转换 TypeScript，但开发页能显示不等于类型检查和生产构建已经成功。所以第一次修改
后要单独运行 `npm run build`。

### 6. 在本地预览构建产物

构建成功后运行：

```sh
npm run preview
```

`preview` script 执行 `vite preview`，启动本地静态服务器并提供 `dist/` 中的文件。终端通常从
`http://localhost:4173/` 开始选择端口，仍应打开它实际打印的地址。

preview 读取已经生成的 `dist/`，不是开发服务器。修改 `src/` 后，需要重新运行 build 才能在 preview
中看到新产物。它也不是生产服务器，只用于本地检查构建结果。

## 四、关键目录与文件

只先掌握和本课入口有关的职责：

| 路径 | 作用 | 本课需要做到 |
| --- | --- | --- |
| `package.json` | 项目元数据、依赖和 npm scripts | 找到 `dev`、`build`、`preview`，不要猜命令 |
| `package-lock.json` | npm 记录的精确依赖树 | 保留并随安装更新，不手工编辑 |
| `node_modules/` | 已安装的本地依赖 | 缺失时先运行 `npm install` |
| `index.html` | Vite 项目根 HTML 和应用入口 | 找到 `#root` 与 `/src/main.tsx` |
| `src/` | 应用源码目录 | 第一次修改发生在这里 |
| `src/main.tsx` | 模板客户端入口模块 | 只识别它导入 `App.tsx` |
| `src/App.tsx` | 默认可见内容所在模块 | 修改一段已有文本 |
| `src/index.css`、`src/App.css` | 入口和组件导入的样式 | 只知道它们属于源码模块 |
| `src/assets/` | 被源码 import 的资源 | 与 `public/` 区分 |
| `public/` | 按原文件名提供的静态资源 | URL 使用 `/file-name` |
| `tsconfig.json` | 应用与工具配置的 references | 识别应用与工具配置入口 |
| `vite.config.ts` | Vite 配置和 React plugin | 保持模板默认 |
| `dist/` | `vite build` 生成的目录 | 视为可重新生成的产物 |

`public/` 中的文件不需要被源码 `import`，通常通过根路径访问；`src/assets/` 则通过源码导入进入模块图。

## 五、入口链

### 1. `index.html` 指向入口模块

模板中的关键片段是：

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

Vite 把项目根的 `index.html` 当作入口。`script` 的 `src` 让浏览器从 `/src/main.tsx` 开始请求模块；
`#root` 是模板预留的页面容器。

### 2. `main.tsx` 连接 `App.tsx`

模板入口会导入样式和 `App`：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

阅读这段入口代码时，需要确认 `main.tsx` 导入了 `App.tsx`，并把 `App` 的当前内容接到 `#root`。

### 3. `App.tsx` 提供默认内容

`src/App.tsx` 是模板默认可见内容所在的模块。它不是浏览器直接请求的第一份文件；浏览器先从
`index.html` 进入，再沿入口模块到达它。

把入口链压缩成一句话：

```text
浏览器请求项目根路径
  -> Vite 处理 index.html
  -> module script 加载 src/main.tsx
  -> main.tsx 导入 src/App.tsx
  -> 模板入口代码显示 App 的当前内容
```

## 六、第一次修改：确认反馈环

保持 `npm run dev` 的终端进程运行，在 `src/App.tsx` 中找到默认标题：

```tsx
<h1>Get started</h1>
```

只把它改成自己的标题：

```tsx
<h1>我的第一个 React 项目</h1>
```

保存后观察：

1. 终端中的开发服务器仍然运行，不需要重新执行创建或安装。
2. 开发 URL 的页面显示新标题。
3. 如果页面没有更新，先核对保存状态、终端实际 URL、文件名大小写和文件监听。
4. 页面更新后停止开发服务器，再运行 `npm run build`，确认类型检查与生产构建通过。
5. 运行 `npm run preview`，从终端地址检查 `dist/` 中的构建结果。

`Get started` 是本次模板快照的默认文案。生成器会更新时，应从实际 `App.tsx` 选择一段可见静态文本，
不要把某个模板文案当成 React 的公共合同。

## 七、易错使用提示

:::pitfalls
### 错误：Node.js 版本低于 Vite 要求

**触发条件：** Node.js 低于 `20.19`，或使用 `22.0` 到 `22.11`。

**原因：** 当前 Vite 和生成器的 engines 范围不满足。

**后果：** 创建器、开发服务器或构建可能直接失败。

**错误示例：**

```text
node --version
# v22.11.0
```

**正确写法：**

```text
node --version
# v22.12.0 或更高的受支持版本
```

**验证方式：** 重新执行原创建或构建命令，并确认终端不再报告 engines 不兼容。
:::

:::pitfalls
### 错误：选择了 JavaScript 模板

**触发条件：** 使用 `--template react`，或 npm 7+ 的参数分隔符遗漏。

**原因：** `react` 和 `react-ts` 是两个不同的模板。

**后果：** 生成的入口是 JSX/JavaScript，不能完成本课的 TypeScript 目标。

**错误示例：**

```sh
npm create vite@latest my-react-app -- --template react
```

**正确写法：**

```sh
npm create vite@latest my-react-app -- --template react-ts
```

**验证方式：** 检查生成目录中存在 `src/main.tsx` 和 `src/App.tsx`。
:::

:::pitfalls
### 错误：在错误目录运行 npm scripts

**触发条件：** 创建命令完成后没有进入新目录，直接执行 `npm run dev`。

**原因：** scripts 属于当前目录的 `package.json`。

**后果：** npm 找不到项目脚本或执行了另一个项目的脚本。

**错误示例：**

```sh
npm create vite@latest my-react-app -- --template react-ts
npm run dev
```

**正确写法：**

```sh
cd my-react-app
npm run dev
```

**验证方式：** 在当前目录看到本项目的 `package.json`，再重跑同一命令。
:::

:::pitfalls
### 错误：跳过依赖安装

**触发条件：** 生成项目后直接运行 `npm run dev` 或 `npm run build`。

**原因：** 本地 scripts 依赖尚未安装到 `node_modules/`。

**后果：** 找不到 Vite、TypeScript 或 React plugin。

**错误示例：**

```text
sh: vite: command not found
```

**正确写法：**

```sh
cd my-react-app
npm install
npm run dev
```

**验证方式：** 安装完成后重跑原命令，并确认命令使用的是项目本地依赖。
:::

:::pitfalls
### 错误：假定开发服务器永远使用 5173

**触发条件：** 5173 已被其他进程占用，仍然打开固定地址。

**原因：** Vite 默认会尝试下一个可用端口。

**后果：** 浏览器打开了旧服务、空地址或另一个项目。

**错误示例：**

```text
终端显示 Local: http://localhost:5174/
浏览器却打开 http://localhost:5173/
```

**正确写法：**

```text
始终打开当前 npm run dev 输出的 Local URL
```

**验证方式：** 对照终端 URL 和浏览器地址栏，确认页面标题来自当前项目。
:::

:::pitfalls
### 错误：只看到 dev 页面就跳过 build

**触发条件：** 页面显示正常，但没有运行 `npm run build`。

**原因：** 开发期转换不等于完整 TypeScript 检查和生产构建。

**后果：** 类型错误可能直到准备发布时才暴露。

**错误示例：**

```text
npm run dev 通过
# 直接认为项目可以构建
```

**正确写法：**

```sh
npm run build
```

**验证方式：** 确认 `tsc -b && vite build` 整体退出成功，并生成 `dist/`。
:::

:::pitfalls
### 错误：把 preview 当作开发服务器或生产服务器

**触发条件：** 修改 `src/` 后等待 preview 自动反映源码，或直接把 preview 服务用于生产环境。

**原因：** `vite preview` 只在本地提供最近一次 build 生成的 `dist/`。

**后果：** 页面仍显示旧产物，或使用了不适合生产环境的本地检查服务。

**错误示例：**

```text
修改 src/App.tsx -> 不重新 build -> 刷新 preview
```

**正确写法：**

```sh
npm run build
npm run preview
```

**验证方式：** 确认 build 完成后 preview 显示最新标题；生产发布使用正式部署环境。
:::

:::pitfalls
### 错误：入口链中的文件名或路径不一致

**触发条件：** 修改 `index.html`、`main.tsx`、`App.tsx` 中任一端，却没有同步对应路径或大小写。

**原因：** module script 或 import 无法解析目标文件。

**后果：** 页面空白、入口模块 404 或终端出现 import 错误。

**错误示例：**

```tsx
import App from './app.tsx'
```

**正确写法：**

```tsx
import App from './App.tsx'
```

**验证方式：** 从 `index.html` 开始逐段核对真实文件名，并查看第一条模块错误。
:::

## 八、源码推导与适用场景

1. **官方事实：** React 和 Vite 都提供 `react-ts` 创建路径；Vite 把项目根 `index.html` 作为入口，
   模板提供 `dev`、`build` 和 `preview` scripts。
2. **课程推导：** 按“创建、安装、dev、首次修改、build、preview”执行，可以分别确认开发反馈、构建
   结果与构建产物。
3. **适用边界：** 本课适合学习 React 基础、小型客户端 SPA 和原型；需要框架级路由、数据获取或服务端
   能力时，应回到 React 官方的框架选型说明。
4. **排错边界：** 先修正第一条可定位错误，不把删除 `node_modules`、删除 lockfile 或重建项目当成第一
   个动作。

## 九、练习

:::exercise
### 练习目标

**要求：** 在自己的工作目录创建一个 `react-ts` 项目。按“创建 -> `cd` -> `npm install` ->
`npm run dev`”顺序运行，在 `src/App.tsx` 中把默认标题改成自定义标题；然后解释
`index.html -> src/main.tsx -> src/App.tsx` 的三段连接，并运行 `npm run build` 和 `npm run preview`。

**验收：** 浏览器显示自定义标题；能指出三个入口文件各自的下一跳；`npm run build` 完整退出成功并生成
`dist/`；preview 显示最新标题；另外任选一个启动错误，记录“现象 -> 第一条错误 -> 修正 -> 重跑原命令”
的完整排错过程。
:::

## 十、本节小结

- 用 `npm create vite@latest ... -- --template react-ts` 获得 React + TypeScript 项目骨架。
- 在含有 `package.json` 的项目根目录运行 `npm install`，再运行项目提供的 scripts。
- 入口链是 `index.html -> src/main.tsx -> src/App.tsx`，需要能够按顺序解释三段连接。
- dev 读取源码，build 执行类型检查并生成产物，preview 提供已经生成的 `dist/`。
- preview 只用于本地检查构建产物，不是生产服务器。
- 出错时按环境、目录、依赖、实际端口、入口路径和第一条诊断逐层排查。

## 十一、参考资料

- [React：从零构建 React 应用](https://react.dev/learn/build-a-react-app-from-scratch) - 官方 Vite 起步命令与框架边界。
- [Vite：开始使用](https://vite.dev/guide/) - 模板、Node 要求、入口和 npm scripts。
- [Vite：生产构建](https://vite.dev/guide/build.html) - `vite build` 的生产构建职责。
- [Vite：部署静态站点](https://vite.dev/guide/static-deploy.html) - `vite preview` 的本地预览职责与生产边界。
- [Vite：功能](https://vite.dev/guide/features.html) - Fast Refresh 与 TypeScript 转译边界。
- [Vite：静态资源处理](https://vite.dev/guide/assets.html) - `public/` 和源码资源的处理方式。
- [Vite：开发服务器选项](https://vite.dev/config/server-options.html) - 默认端口和占用后的行为。
- [Vite：故障排除](https://vite.dev/guide/troubleshooting.html) - 路径大小写与文件监听排查。
- [npm：npm init](https://docs.npmjs.com/cli/v11/commands/npm-init) - `npm create` 与参数转交。
- [npm：npm install](https://docs.npmjs.com/cli/v11/commands/npm-install) - 项目依赖安装。
- [npm：Scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) - `npm run` 与项目 scripts。
- [TypeScript：Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) - `tsc -b` 与 project references。
- [Vite 官方 react-ts 模板](https://github.com/vitejs/vite/tree/create-vite%409.1.2/packages/create-vite/template-react-ts) - 入口文件与默认 scripts。
