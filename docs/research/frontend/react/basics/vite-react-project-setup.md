# 使用 Vite 创建并运行 React + TypeScript 项目研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.vite-react-project-setup`
- 导航标题：Vite React 项目搭建
- 正文标题：Vite React 项目搭建
- 路线位置：React Core 新路线 `B01`
- 教学层级：零基础到进阶
- 核验日期：`2026-08-15`
- 研究状态：官方事实已冻结，可进入单课审计与正文编写
- React 基线：React / React DOM `19.2.8`，React 官方文档 `19.2`
- 工具基线：Vite `8.2.1`、`create-vite` `9.1.2`
- 模板基线：Vite 官方 `react-ts` 模板，固定到 Git tag `create-vite@9.1.2`
- 模板依赖声明：React / React DOM `^19.2.8`、TypeScript `~6.0.2`、Vite `^8.2.0`

本课只回答一个完整问题：学习者怎样从空目录创建一个 Vite 管理的 React + TypeScript 客户端项目，
安装依赖，运行开发服务器，执行生产构建并在本地预览产物，认识关键目录与
`index.html -> src/main.tsx -> src/App.tsx` 入口链，并通过第一次文本修改确认开发反馈环有效。

本课只把模板中的 TSX 和 React DOM 调用当作“已经接好的入口线”来识别，不解释其完整语法或 API：

- TSX 标记规则留给 B02，表达式与属性留给 B03。
- 函数组件的定义、命名、返回值和调用留给 B04。
- 模块树与组件树的完整区别留给 B05。
- JSX Runtime 与 React Element 留给 B06。
- `createRoot`、`render`、容器所有权、`unmount` 和 StrictMode 留给 B07 及后续课程。
- Router、数据请求、测试、部署、SSR、Hydration、React Compiler 和第三方状态库不进入本课。

## 研究方法与证据边界

1. 按仓库搜索顺位先使用 Tavily，分别限定 `vite.dev`、`react.dev`、Vite 官方 GitHub、
   `docs.npmjs.com` 和 `typescriptlang.org` 搜索创建命令、环境要求、模板入口、npm 脚本和 TypeScript
   build mode。
2. Tavily 摘要只用于发现候选页；采用结论全部回到 React、Vite、TypeScript、npm 官方正文、官方
   npm registry metadata 或 Vite 官方模板源码核验。社区教程、博客和第三方模板均未进入来源卡。
3. Vite current 文档负责 Node 兼容范围、创建命令、`index.html` 地位、dev/build 命令、HMR、静态资源
   和常见故障。React 文档负责“学习 React 基础时可以从 Vite 起步”及其框架边界。
4. `create-vite@latest` 是会漂移的 dist-tag。本记录另外固定 `create-vite@9.1.2` 模板源码；课程必须
   区分“长期公共流程”与“本次模板文件、版本范围和默认文案”。
5. npm 官方文档负责 initializer、安装依赖和执行 `package.json` scripts；TypeScript 官方文档只负责
   `tsc -b` 与 project references 的公共含义，不扩展 TSX 语法。
6. 本次只产出研究记录，没有运行 create-vite、安装依赖、构建、浏览器或临时 fixture；命令运行结果
   必须由后续 B01 实施批次在独立临时目录重新取证。

## Tavily 查询与官方回源

| ID | 查询范围 | 采用的官方候选 | 结论 |
| --- | --- | --- | --- |
| `Q1` | Vite create-vite、React TypeScript、Node、dev/build | Vite Getting Started | 找到 `react-ts` 模板、Node 要求、npm 创建命令和标准 scripts。 |
| `Q2` | React 官方从零搭建与 Vite | React Build a React app from Scratch | 确认学习 React 基础时可用 `react-ts` 创建客户端 SPA，同时保留框架优先边界。 |
| `Q3` | Vite 官方模板的 `index.html`、`main.tsx`、`App.tsx` | `vitejs/vite` 官方仓库 | 搜索结果杂质较多，最终直接回到固定 tag 的官方模板源码核验入口链。 |
| `Q4` | npm install 与 scripts | npm CLI v11 文档 | 确认本地依赖安装和 `npm run <stage>` 的脚本执行模型。 |
| `Q5` | TypeScript project references 与 build mode | TypeScript Project References | 确认模板 `tsc -b` 会按 references 使用 build mode。 |

## 官方来源卡

| ID | 官方一手来源 | 适用版本 | 本课采用的 claim |
| --- | --- | --- | --- |
| `react-scratch` | [Build a React app from Scratch](https://react.dev/learn/build-a-react-app-from-scratch) | React 文档 `19.2` | 为学习 React 基础可从 Vite 等 build tool 创建项目；React 官方给出 `npm create vite@latest my-app -- --template react-ts`。 |
| `react-versions` | [React Versions](https://react.dev/versions) | 核验于 `2026-08-15` | 当前 React 官方文档 latest version 为 `19.2`。 |
| `vite-guide` | [Vite Getting Started](https://vite.dev/guide/) | Vite `8.2.1` 文档 | Node `20.19+` 或 `22.12+`、`react-ts` 模板、npm 命令、npm 7+ 参数分隔、`index.html` 入口和标准 scripts。 |
| `vite-features` | [Vite Features](https://vite.dev/guide/features.html) | Vite `8.2.1` 文档 | HTML 是应用入口；create-vite 模板预配置 HMR/React Fast Refresh；Vite 转译 TypeScript 但不独立承担类型检查。 |
| `vite-build` | [Building for Production](https://vite.dev/guide/build.html) | Vite `8.2.1` 文档 | `vite build` 执行生产构建，默认从项目根的 `index.html` 开始并生成构建产物。 |
| `vite-static-deploy` | [Deploying a Static Site](https://vite.dev/guide/static-deploy.html) | Vite `8.2.1` 文档 | `vite preview` 在本地提供 `dist/` 产物，只用于检查构建结果，不是生产服务器。 |
| `vite-assets` | [Static Asset Handling](https://vite.dev/guide/assets.html) | Vite `8.2.1` 文档 | `public/` 资源在开发期从 `/` 提供，并原样复制到产物根；通常优先从源码 import 资源。 |
| `vite-server` | [Server Options](https://vite.dev/config/server-options.html) | Vite `8.2.1` 文档 | 默认端口为 `5173`；被占用时默认尝试下一端口，`strictPort` 才会直接退出。 |
| `vite-troubleshooting` | [Troubleshooting](https://vite.dev/guide/troubleshooting.html) | Vite `8.2.1` 文档 | 导入路径大小写不一致会破坏 HMR；WSL2 文件监听和 Windows 路径中的 `&` 有明确排查边界。 |
| `vite-template-root` | [`template-react-ts`](https://github.com/vitejs/vite/tree/create-vite%409.1.2/packages/create-vite/template-react-ts) | `create-vite@9.1.2` | 冻结模板根文件、`public/`、`src/`、TSConfig 和 Vite config 的实际组成。 |
| `vite-template-package` | [`package.json`](https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/package.json) | `create-vite@9.1.2` | `dev`、`build`、`lint`、`preview` scripts 及 React、Vite、TypeScript 依赖范围。 |
| `vite-template-index` | [`index.html`](https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/index.html) | `create-vite@9.1.2` | `#root` 容器与 `/src/main.tsx` module script 的准确连接。 |
| `vite-template-main` | [`src/main.tsx`](https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/src/main.tsx) | `create-vite@9.1.2` | 入口模块导入 `App`，并把 `<App />` 交给现成的 React DOM 入口代码。 |
| `vite-template-app` | [`src/App.tsx`](https://github.com/vitejs/vite/blob/create-vite%409.1.2/packages/create-vite/template-react-ts/src/App.tsx) | `create-vite@9.1.2` | 默认可见标题、首次修改提示和根组件默认导出；其 Hook/组件细节不进入 B01。 |
| `ts-project-references` | [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) | TypeScript 当前文档，核验于 `2026-08-15` | 根 `tsconfig.json` 的 `references` 与 `tsc -b` build mode。 |
| `npm-init` | [`npm init`](https://docs.npmjs.com/cli/v11/commands/npm-init) | npm CLI `11` 文档 | `npm create` 是 `npm init` 的别名；initializer 会映射到相应 `create-*` 包，`--` 后参数继续传给 initializer。 |
| `npm-install` | [`npm install`](https://docs.npmjs.com/cli/v11/commands/npm-install) | npm CLI `11` 文档 | 在 package 目录无参数运行时，安装 `package.json` 声明的本地依赖到 `node_modules`。 |
| `npm-scripts` | [Scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) | npm CLI `11` 文档 | `package.json` 的 `scripts` 可由 `npm run <stage>` 执行。 |
| `npm-lockfile` | [`package-lock.json`](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json) | npm CLI `11` 文档 | lockfile 描述 npm 生成的精确依赖树，用于后续安装的一致性。 |
| `npm-create-vite` | [`create-vite@9.1.2`](https://registry.npmjs.org/create-vite/9.1.2) | registry 核验于 `2026-08-15` | 核验 `latest` 生成器版本、Vite 官方仓库归属和 Node engines。 |
| `npm-vite` | [`vite@8.2.1`](https://registry.npmjs.org/vite/8.2.1) | registry 核验于 `2026-08-15` | 核验 Vite current package 版本、官方仓库归属和 Node engines。 |
| `npm-react` | [`react@19.2.8`](https://registry.npmjs.org/react/19.2.8) | registry 核验于 `2026-08-15` | 核验 React latest patch 与官方仓库归属。 |

## 一、版本与环境前提

### 1.1 先区分四种版本

| 对象 | 本次冻结值 | 为什么不能混写 |
| --- | --- | --- |
| React 文档 | `19.2` | react.dev 不为每个 patch 提供独立 Learn 文档版本。 |
| React package | `19.2.8` | 这是 npm registry 的具体 patch。 |
| Vite package | `8.2.1` | 这是开发服务器与 build CLI 的当前 package 版本。 |
| create-vite generator | `9.1.2` | 它负责生成模板，版本号不要求与 Vite package 相同。 |

`npm create vite@latest` 中的 `latest` 指向 create-vite 的当前 dist-tag，不是“永远生成相同文件”。因此：

1. 课程教授的创建、安装、dev、build 和入口链是公共流程。
2. 默认页面文案、资源文件和依赖范围必须标明模板快照。
3. 真正项目完成 `npm install` 后，以生成的 `package.json` 和 `package-lock.json` 为准。
4. 不为了追逐 latest 手工改写模板依赖；升级依赖是另一个维护任务。

### 1.2 运行前检查

学习者需要本地终端、Node.js 和 npm。先执行：

```bash
node --version
npm --version
```

Vite `8.2.1` 与 create-vite `9.1.2` 的官方要求均为 Node `20.19+` 或 `22.12+`。这不是“Node 20
任意版本或 Node 22 任意版本”：例如 `20.18` 和 `22.11` 都低于对应下限。若包管理器给出更高版本
要求，以实际模板警告为准。

## 二、创建、安装、开发、构建与预览命令

### 2.1 无交互创建 React + TypeScript 模板

本课固定命令：

```bash
npm create vite@latest my-react-app -- --template react-ts
```

- `vite@latest` 选择 create-vite 当前 latest generator。
- `my-react-app` 是新目录名，可换成符合当前文件系统约束的项目名。
- npm 7+ 需要额外的 `--`，把后面的 `--template react-ts` 转交给 initializer。
- `react-ts` 同时选择 React 和 TypeScript 模板；`react` 是 JavaScript 模板，不能与本课目标混用。

交互式 `npm create vite@latest` 也是官方支持路径，但课程使用显式命令减少选择分支，使每位学习者得到
同一类模板。

### 2.2 进入目录并安装依赖

```bash
cd my-react-app
npm install
```

`npm install` 读取当前目录的 `package.json`，把声明的依赖安装到本地 `node_modules/`，并由 npm
维护 lockfile。`node_modules/` 是安装结果，不是课程要求手工编辑的源码目录。

### 2.3 启动开发服务器

```bash
npm run dev
```

`npm run dev` 不是 npm 内建的 React 命令；它执行模板 `package.json` 中的：

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

学习者必须读取终端实际打印的 Local URL。默认候选是 `http://localhost:5173/`，但端口被占用时 Vite
会自动尝试下一个可用端口，不能把 `5173` 当作每次固定结果。

### 2.4 执行生产构建

```bash
npm run build
```

固定模板的真实 build script 是：

```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  }
}
```

执行顺序必须准确解释：

1. `tsc -b` 按根 `tsconfig.json` 的 project references 检查应用代码与 Vite config 对应项目。
2. 前一步成功后，shell 的 `&&` 才允许执行 `vite build`。
3. Vite 从根 `index.html` 构建生产产物，默认输出到 `dist/`。

Vite 开发转换只转译 TypeScript，不单独完成类型检查；本模板通过 build script 把 `tsc -b` 放在
`vite build` 前。课程不得把“开发页能显示”写成“类型与生产构建已经通过”。

### 2.5 在本地预览构建产物

完成生产构建后运行：

```bash
npm run preview
```

固定模板把 `preview` 映射到 `vite preview`。它从 `dist/` 启动本地静态服务器，用于检查生产构建产物；
它不读取尚未重新构建的源码，也不是生产服务器。学习者仍应使用终端打印的实际 URL。

## 三、关键目录与文件职责

| 路径 | 冻结职责 | B01 要求掌握到的程度 |
| --- | --- | --- |
| `package.json` | 项目元数据、依赖范围和 npm scripts。 | 能找到 `dev`、`build`，不手工猜命令。 |
| `package-lock.json` | npm 安装后记录精确依赖树。 | 保留并随依赖安装更新，不手工编辑。 |
| `node_modules/` | npm 安装的本地依赖。 | 不是源码；缺失时先运行 `npm install`。 |
| `index.html` | Vite 位于项目根的 HTML 源码和 SPA 入口。 | 能定位 `#root` 与 `/src/main.tsx` module script。 |
| `src/` | 应用源码目录。 | 第一次修改发生在这里。 |
| `src/main.tsx` | 模板入口模块，加载样式与 `App` 并接入现成 React DOM 启动代码。 | 只读入口关系，不展开 Root 生命周期。 |
| `src/App.tsx` | 模板的根组件模块和默认可见内容。 | 只修改一段已有文本，不教学组件或 Hook。 |
| `src/index.css`、`src/App.css` | 模板样式。 | 只识别其由入口/组件模块 import；不扩展样式教学。 |
| `src/assets/` | 通过源码 import 参与模块图的资源。 | 与 `public/` 区分。 |
| `public/` | 无需 import、要求保留原文件名的静态资源。 | 使用 `/file-name` 根路径；不写 `public/file-name` URL。 |
| `tsconfig.json` | 引用 `tsconfig.app.json` 与 `tsconfig.node.json`。 | 只认识 references，不逐项教学 compiler options。 |
| `tsconfig.app.json` | `src` 应用的 TypeScript/TSX 检查配置。 | 知道它覆盖应用源码。 |
| `tsconfig.node.json` | `vite.config.ts` 的 TypeScript 检查配置。 | 知道工具配置与浏览器应用分开。 |
| `vite.config.ts` | Vite 配置并启用官方 React plugin。 | 保持模板默认，不提前教学 plugin config。 |
| `dist/` | `vite build` 的默认生成目录。 | 是可重新生成的产物，不手工写源码。 |

`create-vite@9.1.2` 的 `react-ts` 模板还包含 lint 配置和模板说明。它们可以在目录导览中点名，但
Oxlint 规则扩展、React Compiler 和生产工程治理不属于 B01 主线。

## 四、入口链：`index.html -> main.tsx -> App.tsx`

### 4.1 `index.html` 指向入口模块

固定模板包含：

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

Vite 把 `index.html` 当作源文件和应用入口；`script` 明确让浏览器模块图从 `/src/main.tsx` 开始。B01
只要求学习者能沿路径找到下一个文件，不展开 HTML transform 或多页应用。

### 4.2 `main.tsx` 导入根组件模块

固定模板的关键连接是：

```tsx
import App from './App.tsx'

// 模板在此使用已经接好的 React DOM 入口代码显示 <App />
```

真实模板还导入 `StrictMode`、`createRoot` 和 `index.css`。本课可以展示完整原文件，但只能说明“模板
已经把 `App` 接到 `#root` 容器”，不能解释 `createRoot` 的参数、返回值、render 更新或 StrictMode
开发行为。

### 4.3 `App.tsx` 提供默认可见内容

`src/App.tsx` 默认导出名为 `App` 的根组件，并包含当前模板的可见标题 `Get started`。B01 只用这段
既有文本建立第一次反馈环；为什么函数能成为组件、为什么 `<App />` 是组件调用、TSX 怎样转换，分别
留给 B02-B06。

### 4.4 最小心智模型

```text
浏览器请求项目根路径
  -> Vite 处理根 index.html
  -> module script 加载 /src/main.tsx
  -> main.tsx 导入 ./App.tsx
  -> 模板现成入口代码显示 App 的当前内容
```

这是一条“项目文件如何连起来”的学习链，不是完整 React 渲染生命周期。

## 五、第一次修改与可验证结果

开发服务器保持运行时，在 `src/App.tsx` 中只改一段已有文本：

```tsx
<h1>Get started</h1>
```

改为：

```tsx
<h1>我的第一个 React 项目</h1>
```

保存后应观察：

1. 终端中的开发服务器继续运行，没有重新执行创建或安装命令。
2. 已打开的开发 URL 更新为新标题；create-vite 已预配置 React Fast Refresh/HMR。
3. 若没有更新，先检查保存、终端 URL、导入路径大小写和文件监听，不立即重建项目。
4. 修改成功后执行 `npm run build`，确认开发反馈与生产 build 是两个独立检查。

默认标题属于 `create-vite@9.1.2` 模板快照。若后续 generator 改版，课程实施时必须从实际生成的
`App.tsx` 选择一段可见静态文本，不能继续假定 `Get started` 永远存在。

## 六、常见启动错误与排查矩阵

| 现象 | 触发条件 | 原因 | 后果 | 最小修正 | 验证方式 | 证据 |
| --- | --- | --- | --- | --- | --- | --- |
| 创建或启动时报告 Node 不受支持 | Node 低于 `20.19`，或使用 `22.0-22.11` | 当前 Vite/create-vite engines 不满足 | generator 或 dev/build 无法可靠运行 | 升级到官方支持范围后重新检查版本 | `node --version`，再重跑原命令 | `vite-guide`、`npm-create-vite`、`npm-vite` |
| 生成了 JavaScript 模板 | 使用 `--template react`，或 npm 参数未正确转交 | `react` 与 `react-ts` 是两个模板；npm 7+ 需要额外 `--` | 入口成为 `.jsx`，与课程 TS 目标不一致 | 使用完整的 `-- --template react-ts` 命令重新创建目标目录 | 检查 `src/main.tsx` 与模板依赖 | `react-scratch`、`vite-guide`、`npm-init` |
| `npm run dev` 找不到项目脚本或 package | 未进入生成目录 | npm scripts 属于当前目录的 `package.json` | 命令无法启动模板的 Vite | `cd` 到含 `package.json` 的项目根 | 查看当前路径和 `package.json` scripts | `npm-scripts`、`vite-template-package` |
| Vite 命令或依赖不可用 | 创建后未完成依赖安装，或 `node_modules` 不完整 | 本地 scripts 依赖尚未安装 | dev/build 无法解析本地工具或 package | 在项目根执行 `npm install` | 安装成功后重跑同一 `npm run dev` | `npm-install`、`vite-template-package` |
| 访问 `5173` 没看到项目 | `5173` 已被其他进程占用 | Vite 默认自动尝试下一个端口 | 学习者打开了错误服务或空地址 | 使用终端实际打印的 Local URL | 对照终端 URL 与页面 | `vite-server` |
| 页面空白或入口模块 404 | 只改了 `index.html`、`main.tsx`、`App.tsx` 链中的一端 | script 路径、import 路径或文件名失配 | 模块链断开，App 无法加载 | 恢复模板三段连接并逐段核对路径 | Network/终端错误指向的第一处失败路径 | `vite-guide`、`vite-template-index`、`vite-template-main` |
| 保存后页面不更新 | import 的大小写与磁盘文件名不一致，或 WSL2 监听受限 | Vite 没有得到可用的同一模块变更 | HMR 不生效或退化为完整刷新 | 先修正大小写；WSL2 再按官方 watch 指引排查 | 保持同一 dev 进程，重做同一次文本修改 | `vite-troubleshooting`、`vite-features` |
| dev 页面可用但 build 失败 | TypeScript 检查发现错误 | dev transform 不等于类型检查；模板 build 先运行 `tsc -b` | 不能得到成功生产构建 | 修复第一条 TypeScript 诊断，再重跑原 build | `npm run build` 完整退出成功 | `vite-features`、`vite-template-package`、`ts-project-references` |
| Windows 路径出现找不到 Vite module | 项目路径包含 `&` | npm/cmd-shim 对该路径有已知限制 | CLI 无法正确解析路径 | 移到不含 `&` 的路径，或按官方建议换包管理器 | 在新路径重跑同一命令 | `vite-troubleshooting` |

排错顺序固定为：读第一条终端错误 -> 核对 Node/npm -> 核对当前目录 -> 核对安装 -> 使用实际 URL ->
沿入口链核对路径。不要把删除 lockfile、删除 `node_modules` 或重新创建项目当作第一步。

## 七、适用场景与明确边界

### 7.1 适合使用本课流程

- 学习 React 基础，需要看清客户端项目最小入口链。
- 构建小型客户端 SPA、演示或原型，当前不需要框架提供的路由、数据获取和服务端能力。
- 需要一个官方模板提供 TypeScript、React plugin、HMR 和生产 build 的起点。

### 7.2 不应扩大为通用生产选型结论

React 官方对新应用优先推荐 framework；从 build tool 起步意味着路由、数据获取和其他常见能力需要
自行选择。本课使用 Vite 是为了建立 React 项目与入口心智模型，不得写成“所有 React 生产应用都应该
直接使用裸 Vite”。

本课也不负责：

- 比较 Vite、Parcel、Rsbuild 或各种 framework 的性能与生态。
- 配置代理、环境变量、路径别名、插件、部署 base、SSR 或多页应用。
- 把 `vite preview` 当作生产服务器；它只用于本地检查 `dist/` 构建产物。
- 教学 lint 配置、React Compiler、测试框架或 CI。

## 八、官方事实、课程推导与边界

### 8.1 创建命令

1. **官方事实：** React 与 Vite 官方均给出 `react-ts` 的 create-vite 命令；npm 7+ 使用额外 `--`
   转交模板参数。
2. **课程推导：** B01 采用无交互完整命令，可以排除学习者选择错误模板这一无关变量。
3. **边界：** `latest` 会漂移；实施时必须记录实际 generator、模板和 lockfile，不能把本次文件快照
   当作永久结果。

### 8.2 命令来自 `package.json`

1. **官方事实：** npm 执行 `package.json` scripts；当前模板把 `dev` 映射到 `vite`，把 `build` 映射到
   `tsc -b && vite build`。
2. **课程推导：** 学习者应先查看 scripts 再运行命令，而不是记忆一组脱离项目的全局 CLI。
3. **边界：** 不在 B01 展开 shell、npm lifecycle、workspaces 或自定义 script 设计。

### 8.3 入口链

1. **官方事实：** Vite 把根 `index.html` 当作源码入口；固定模板从 `/src/main.tsx` 导入 `App.tsx`。
2. **课程推导：** 初学者只要能回答“浏览器先加载哪个文件、每个文件怎样指向下一个文件”，就已完成
   B01 的入口目标。
3. **边界：** 这不能替代 B05 的模块/组件树，也不能提前解释 B07 的 Root 生命周期。

### 8.4 开发、构建与预览是三个不同结果

1. **官方事实：** Vite dev 提供 HMR；Vite TypeScript transform 本身不做完整 type check；固定模板的
   build script 额外运行 `tsc -b`；`vite preview` 只提供已生成的 `dist/`。
2. **课程推导：** 第一次修改应分别获得“dev 中可见”“build 完整成功”和“本地产物可访问”三类结果。
3. **边界：** build 或 preview 成功都不能证明测试、可访问性、业务正确性或生产部署已经完成。

## 九、Demo 可观察合同

### 9.1 最小 Demo 目标

若 B01 实施需要站内 Demo，建立一个“入口链观察器”，只承担以下观察：

1. 同时显示 `index.html -> src/main.tsx -> src/App.tsx` 三个稳定节点。
2. 选中一个节点时，显示来自固定模板的最小相关片段和一句文件职责。
3. 从 `index.html` 的 module script 能继续定位 `main.tsx`，再从 import 定位 `App.tsx`。
4. 提供“默认标题 / 第一次修改”两个状态，预览只反映标题从 `Get started` 变为
   `我的第一个 React 项目`。
5. 展示代码必须与课程采用的模板快照一致；若正文改用新模板，Demo 与来源卡原子更新。

### 9.2 Demo 禁止项

- 不在浏览器中伪造一个真正执行 `npm create`、`npm install` 或 `vite build` 的终端。
- 不把点击节点包装成 TSX、组件、Props、State、Hook、Root 或生命周期教学。
- 不展示 `createRoot` 的参数/返回值、`root.render` 更新、`unmount` 或 StrictMode 双调用。
- 不增加 Router、请求、测试、动画、计时器或复杂业务外壳。
- Demo 只能辅助观察入口链；真实创建、dev、首次修改与 build 必须由课程练习在独立项目中完成。

### 9.3 后续实施验收目标

- 学习者能按三节点顺序解释文件职责，不把 `App.tsx` 误认为浏览器直接入口。
- 代码片段与运行 Demo 同源，源码语言标记准确。
- 桌面、390px 与 200% 文本下入口链和代码不产生页面横向溢出或遮挡。
- Demo 不依赖 B02-B07 才能理解的交互术语。

## 十、课程正文编写合同

1. 学习目标必须可验证：检查环境、创建 `react-ts` 项目、安装/dev/build/preview、解释入口链、完成第一次
   文本修改、按顺序排查启动问题。
2. 从“浏览器不能直接运行 TSX，项目需要 build tool 提供开发与构建反馈”引入，但 TSX 语法细节留给
   B02，不在 B01 展开 transform internals。
3. 命令顺序固定为创建 -> 进入目录 -> 安装 -> dev -> 第一次修改 -> build -> preview；每一步都写出
   成功信号。
4. 目录导览只覆盖本课判断所需路径，不把模板所有 lint、资源或配置字段做成 Reference 枚举。
5. 入口链必须展示实际文件片段，同时用醒目边界说明 B01 只识别连接，不教学组件和 Root API。
6. 易错提示至少覆盖 Node 范围、错误模板、错误目录、漏安装、实际端口、入口路径和 dev/build 差异。
7. 练习要求学习者创建自己的项目、改一段可见文本、解释三段入口、完成 build 和本地 preview，并任选
   一个故障完成“现象 -> 第一条错误 -> 修正 -> 重跑原命令”的闭环。
8. 正文的 `appliesTo` 应同时写 React `19.2.8`、Vite `8.2.x` 与 create-vite 模板核验日期；不能只写
   React 版本掩盖工具链漂移。
9. 正文来源只列实际支撑结论的 React、Vite、TypeScript、npm 官方页面；registry 和固定模板 tag
   作为生产证据保留在本研究记录，不把大量版本 metadata 堆进学习者正文。
10. 正文不得出现 Tavily、临时目录、仓库构建结果、浏览器验收数据、Gate、signoff 或复审结论。

## 十一、研究结论

B01 可以独立承担 React Core 的项目起点：使用官方 `react-ts` 模板建立创建、安装、dev、第一次修改、
build 和 preview 的完整反馈环；用 `index.html -> main.tsx -> App.tsx` 解释项目入口；用固定排错顺序处理环境、
目录、依赖、端口和入口错误。

本课必须保持“项目搭建”责任，不借模板现成代码提前教学 TSX、函数组件、Hook、StrictMode 或
`createRoot` 生命周期。后续实施批次需要在 `/tmp` 独立目录真实生成当日模板，记录实际版本与文件差异，
再据此编写正文、Demo、manifest、Track 并完成构建和浏览器闭环。
