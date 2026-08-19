---
id: engineering.vite.reference.features-assets-env
type: reference
title: Vite Features、Assets 与 Env
summary: 查阅依赖、HMR、TypeScript、HTML/JSX/CSS、资源、glob、Worker、CSP、License 和 mode。
domain: frontend
technology: engineering
module: vite
group: features-and-boundaries
signature: |-
  const modules = import.meta.glob('./features/*.ts')
  const mode = import.meta.env.MODE
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
related:
  - engineering.vite.learn.basics.static-assets-and-url
  - engineering.vite.learn.basics.json-worker-and-dynamic-import
  - engineering.vite.learn.basics.modes-env-security
tags:
  - Vite
  - Features
  - Assets
  - Env
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 Features
    url: https://vite.dev/guide/features
    sourceType: official-reference
    appliesTo: Vite 8.2.1
  - title: Static Asset Handling
    url: https://vite.dev/guide/assets
    sourceType: official-reference
    appliesTo: Vite 8.2.1
  - title: Env Variables and Modes
    url: https://vite.dev/guide/env-and-mode
    sourceType: official-reference
    appliesTo: Vite 8.2.1
anchors:
  - npm-dependency-resolving-and-pre-bundling
  - hot-module-replacement
  - typescript
  - html
  - frameworks
  - jsx
  - css
  - json
  - glob-import
  - dynamic-import
  - webassembly
  - web-workers
  - content-security-policy
  - license
  - build-optimizations
  - importing-asset-as-url
  - importing-asset-as-string
  - importing-script-as-a-worker
  - the-public-directory
  - env-variables
  - modes
---

# Vite Features、Assets 与 Env

本页按浏览器可见能力整理稳定 guide 主题。Vite 提供转换与构建接口，不为 TypeScript 做类型检查，也不为目标
浏览器缺失的 Web API 自动注入 polyfill。

## 一、npm Dependency Resolving and Pre-Bundling

裸导入会解析到 `node_modules`，开发期依赖优化将 CommonJS/UMD 转成 ESM 并减少内部请求。首次扫描与缓存结果
可能触发 reload，应使用请求和 metadata 观察。

**最小示例：**

~~~~ts
import { createApp } from 'vue'
console.log(createApp)
~~~~

## 二、Hot Module Replacement

框架插件利用 HMR API 更新组件，边界无法接受时回退到整页 reload。生产构建不存在该运行时。

**最小示例：**

~~~~ts
if (import.meta.hot) import.meta.hot.accept()
~~~~

## 三、TypeScript

Vite 转译 `.ts` 并尊重部分 `tsconfig` 语法配置，但不做类型检查。类型门禁必须独立运行 `vue-tsc`/`tsc`。

**最小示例：**

~~~~ts
interface Course { id: string; title: string }
const course: Course = { id: 'vite', title: 'Vite' }
~~~~

## 四、HTML

`index.html` 是模块图入口，可引用模块脚本和处理 `%CONST%`。它不是静态模板旁观者，而是构建输入。

**最小示例：**

~~~~html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
~~~~

## 五、Frameworks

Vue、React 等文件格式由各自官方插件处理。Vite 核心不会直接编译 SFC/JSX 框架语义。

**最小示例：**

~~~~ts
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
~~~~

## 六、JSX

`.jsx`/`.tsx` 可转译，框架运行时和 refresh 仍由对应插件配置；不要把语法支持当成 React runtime 已加载。

**最小示例：**

~~~~tsx
export function CourseTitle() { return <h1>Vite 课程</h1> }
~~~~

## 七、CSS

CSS import 在开发期注入并支持 HMR，生产期抽取或合并。Modules、PostCSS 与预处理器各有独立责任。

**最小示例：**

~~~~ts
import './styles/main.css'
~~~~

## 八、JSON

JSON 可默认或命名导入，生产构建会 tree-shake 可分析字段；外部输入仍需运行时 schema 校验。

**最小示例：**

~~~~ts
import course from './course.json'
console.log(course.title)
~~~~

## 九、Glob Import

`import.meta.glob` 在构建期展开为模块映射，pattern 必须是字面量。默认懒加载，`eager: true` 会静态导入。

**最小示例：**

~~~~ts
const lessons = import.meta.glob('./lessons/*.md', { query: '?raw', import: 'default' })
~~~~

## 十、Dynamic Import

动态 import 创建异步边界，但变量路径只能覆盖可静态枚举的有限模式；任意字符串不会自动打包。

**最小示例：**

~~~~ts
const { openEditor } = await import('./editor')
openEditor()
~~~~

## 十一、WebAssembly

可通过 `?init` 等路径显式初始化 WASM；ESM integration 仍可能需要插件。目标浏览器与 CSP 必须支持实际加载方式。

**最小示例：**

~~~~ts
import initCounter from './counter.wasm?init'
const instance = await initCounter()
~~~~

## 十二、Web Workers

推荐 `new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })`，使构建器静态识别并重写 URL。

**最小示例：**

~~~~ts
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' })
~~~~

## 十三、Content Security Policy

Vite 可配合 nonce，部分开发/构建行为仍需要对应 CSP source。策略应由服务端响应头强制，并验证不含宽泛例外。

**最小示例：**

~~~~ts
export default { html: { cspNonce: 'request-nonce' } }
~~~~

## 十四、License

构建可生成依赖 license 清单。它帮助交付审计，但不能自动判断许可证兼容性或补齐缺失版权文本。

**最小示例：**

~~~~ts
export default { build: { license: { fileName: 'licenses.md' } } }
~~~~

## 十五、Build Optimizations

包含 CSS split、modulepreload 与异步 chunk 加载优化。观察最终 HTML、manifest 和网络瀑布，不能仅凭配置名判断。

**最小示例：**

~~~~ts
button.addEventListener('click', () => import('./advanced-panel'))
~~~~

## 十六、Importing Asset as URL

静态资源 import 返回开发 URL 或构建 hash URL；`?url` 可显式选择 URL 语义。相对路径会进入依赖图。

**最小示例：**

~~~~ts
import logoUrl from './logo.svg?url'
image.src = logoUrl
~~~~

## 十七、Importing Asset as String

`?raw` 把文件内容作为字符串导入，适合展示源码等受控内容。大型或不可信文件不应无条件打入客户端 bundle。

**最小示例：**

~~~~ts
import markdown from './lesson.md?raw'
console.log(markdown)
~~~~

## 十八、Importing Script as a Worker

`?worker` 可把脚本包装为 Worker constructor，但标准 URL 构造形式更易被平台和类型工具理解。

**最小示例：**

~~~~ts
import SearchWorker from './search.worker.ts?worker'
const worker = new SearchWorker()
~~~~

## 十九、The public Directory

public 文件以根绝对路径引用且原样复制。它适合固定文件名资源，不适合需要 hash 和依赖追踪的应用资产。

**最小示例：**

~~~~html
<link rel="icon" href="/favicon.svg" />
~~~~

## 二十、Env Variables

客户端只应读取 `import.meta.env` 中内置值和允许前缀变量。所有暴露值都会进入 bundle，绝不能放秘密。

**最小示例：**

~~~~ts
const apiBase = import.meta.env.VITE_API_BASE
~~~~

## 二十一、Modes

mode 选择 env 文件并可由 CLI 指定；与 `NODE_ENV` 是两条独立轴。生产行为应根据实际 command/mode 组合验证。

**最小示例：**

~~~~sh
npx vite --mode staging
npx vite build --mode production
~~~~

## 二十二、组合使用示例

下面的示例把本页最常用的接口组合成一条完整使用路径。

~~~~ts
import course from './course.json'
import logoUrl from './logo.svg?url'
import './styles/main.css'
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' })
worker.postMessage({ course, logoUrl, apiBase: import.meta.env.VITE_API_BASE })
~~~~

## 二十三、易错使用提示

:::pitfalls
### 错误：把客户端环境变量当作秘密

**触发条件：** 将令牌写入 `VITE_SECRET`，因为它来自 `.env` 文件而误以为只存在于构建机。

**原因：** 匹配公开前缀的变量会在转换期写入客户端代码，浏览器用户可以读取构建结果。

**后果：** 密钥进入 JavaScript、source map 或缓存，造成无法由前端访问控制补救的泄露。

**错误示例：**

```text
VITE_SECRET=production-token
```

**正确写法：**

```text
仅把公开配置放入 VITE_*；秘密保留在后端或构建服务
```

**验证方式：** 搜索构建产物中的测试秘密，并断言只有预期公开值可由 `import.meta.env` 读取。
:::

## 二十四、工作原理与适用边界

1. 官方事实：Vite 对资源、glob、Worker 和环境变量执行静态分析与转换，语法形状会影响能否被识别。
2. 课程推导：资源与环境能力应同时检查源码写法和生成 URL，不能只看编辑器类型提示。
3. 适用边界：本页说明 Vite 转换合同；运行时鉴权、秘密管理与 CDN 行为属于后端或部署平台职责。

## 二十五、参考资料

- [Vite Features](https://vite.dev/guide/features) - 支持功能转换、HMR、glob、Worker 与构建优化边界。
- [Static Asset Handling](https://vite.dev/guide/assets) - 支持资源 URL、raw、public 与 Worker 导入。
- [Env Variables and Modes](https://vite.dev/guide/env-and-mode) - 支持公开前缀、mode 与安全边界。
