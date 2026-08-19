---
id: engineering.vite.reference.config-shared
type: reference
title: Vite Shared Options
summary: 查阅项目根、解析、HTML、CSS、JSON、Oxc、日志与环境变量等稳定共享配置。
domain: frontend
technology: engineering
module: vite
group: configuration
signature: |-
  import { defineConfig } from 'vite'
  export default defineConfig({ root, base, resolve, css, envPrefix })
related:
  - engineering.vite.learn.intermediate.config-and-mode
  - engineering.vite.learn.basics.modes-env-security
tags:
  - Vite
  - Shared Options
  - 配置
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 Shared Options
    url: https://vite.dev/config/shared-options
    sourceType: official-reference
    appliesTo: Vite 8.2.1
anchors:
  - root
  - base
  - mode
  - input
  - define
  - plugins
  - publicdir
  - cachedir
  - resolvealias
  - resolvededupe
  - resolveconditions
  - resolvemainfields
  - resolveextensions
  - resolvepreservesymlinks
  - resolvetsconfigpaths
  - htmlcspnonce
  - htmladditionalassetsources
  - cssmodules
  - csspostcss
  - csspreprocessoroptions
  - csspreprocessormaxworkers
  - jsonnamedexports
  - jsonstringify
  - oxc
  - assetsinclude
  - loglevel
  - customlogger
  - clearscreen
  - envdir
  - envprefix
  - apptype
  - future
---

# Vite Shared Options

## 一、root

项目根决定 `index.html`、配置解析和相对路径的基准。CLI 工作目录与 `root` 不同时，应明确每个相对值
究竟以配置文件还是项目根为基准，避免依赖启动位置碰巧一致。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
})
~~~~

## 二、base

`base` 是开发和构建时公开 URL 的前缀。子路径部署使用 `/docs/` 一类绝对前缀；嵌入式产物可用 `./`，并应
检查 HTML、动态 import、CSS 与 Worker URL 是否一起变化。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/learning/',
})
~~~~

## 三、mode

`mode` 选择 `.env.[mode]` 并写入 `import.meta.env.MODE`，它不等于 `command`，也不自动等于
`NODE_ENV`。条件配置应同时读取 `command` 与 `mode`。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  mode: 'staging',
})
~~~~

## 四、input

顶层 `input` 为多环境/自定义应用提供入口定义，普通 HTML 应用通常交给 `index.html`。它不会继承到环境级
配置，迁移时需核对所处配置层。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  input: 'index.html',
})
~~~~

## 五、define

`define` 在转换期执行静态替换，值通常先 `JSON.stringify`。不要把密钥放入该配置，也不要把它当成运行时可变
配置服务。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify('1.0.0') },
})
~~~~

## 六、plugins

`plugins` 接受插件及条件数组；假值会被忽略。插件顺序、`enforce` 和 `apply` 共同决定执行范围，不能只根据
数组位置猜测最终顺序。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})
~~~~

## 七、publicDir

`publicDir` 中的文件原样复制并从根路径提供，不经过 hash 或转换。需要依赖图追踪、缓存指纹或 URL 重写的资源
应使用 import。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
})
~~~~

## 八、cacheDir

`cacheDir` 保存依赖优化等缓存。调试过期缓存时可删除该目录或使用 `--force`，但缓存位置不是可发布合同。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  cacheDir: 'node_modules/.vite',
})
~~~~

## 九、resolve.alias

别名替换应使用绝对文件系统路径，并避免与包名或 URL 前缀发生模糊匹配。TypeScript 的 `paths` 只影响类型解析，
不会自动创建 Vite alias。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: { '@': '/absolute/path/to/src' },
  },
})
~~~~

## 十、resolve.dedupe

`resolve.dedupe` 强制指定依赖从项目根解析，适合 monorepo 中必须共享单例的运行时包。先用模块身份证据确认重复，
不要把所有依赖都加入列表。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['vue'],
  },
})
~~~~

## 十一、resolve.conditions

该列表扩展包 `exports` 的条件解析。自定义条件必须同时与实际 Node/浏览器运行命令一致，否则开发和生产可能选择
不同入口。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    conditions: ['course'],
  },
})
~~~~

## 十二、resolve.mainFields

当包没有匹配的条件导出时，`mainFields` 决定候选入口字段顺序。它不能覆盖已经由 `exports` 成功解析的入口。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
  },
})
~~~~

## 十三、resolve.extensions

省略扩展名时按该列表尝试文件。公共库源码通常保留明确扩展或包入口，避免扩展顺序变化改变解析结果。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
})
~~~~

## 十四、resolve.preserveSymlinks

启用后按原始符号链接路径确定文件身份，可能改变去重、HMR 和包边界。工作区依赖出现双实例时应对照真实路径和
模块图验证。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    preserveSymlinks: false,
  },
})
~~~~

## 十五、resolve.tsconfigPaths

启用后，Vite 按匹配的 `tsconfig.json` 读取 `paths`。它不适用于 Less 内部解析，且会增加解析工作；只在项目
确实以 TS paths 作为公开入口合同时启用。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
})
~~~~

## 十六、html.cspNonce

该值为 Vite 生成的 script/style 标签写入 nonce，并生成对应 meta。nonce 仍需由服务器为每个响应安全生成，
静态固定值不能替代完整 CSP 策略。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  html: {
    cspNonce: 'request-nonce',
  },
})
~~~~

## 十七、html.additionalAssetSources

为自定义 HTML 元素声明资源属性，使构建器跟踪并重写其中的 URL。过滤函数应只匹配确定的标签/属性，避免把普通
文本误判为构建资源。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  html: {
    additionalAssetSources: [],
  },
})
~~~~

## 十八、css.modules

配置 CSS Modules 的作用域名称、locals convention 和组合行为。运行代码只能使用生成后的导出映射，不能把局部
类名当作稳定全局选择器。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
})
~~~~

## 十九、css.postcss

可传入 PostCSS 配置或配置目录。内联对象会取代外部配置搜索，调试时先确认最终配置来源。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    postcss: { plugins: [] },
  },
})
~~~~

## 二十、css.preprocessorOptions

按 `scss`、`less` 等扩展配置预处理器；对应实现仍需单独安装。`additionalData` 会注入每个文件，应避免重复输出
实际 CSS。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorOptions: { scss: { additionalData: '$brand: #2563eb;' } },
  },
})
~~~~

## 二十一、css.preprocessorMaxWorkers

限制预处理器并发 worker 数。性能调整必须在固定项目和硬件上测量，不能把默认值变化当成业务正确性修复。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorMaxWorkers: 4,
  },
})
~~~~

## 二十二、json.namedExports

控制 JSON 是否生成命名导出。默认导入最清楚；命名导出适合静态字段，不能替代运行时 schema 校验。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  json: {
    namedExports: true,
  },
})
~~~~

## 二十三、json.stringify

启用后 JSON 以 `JSON.parse` 字符串形式生成，可能改善大型 JSON 性能。选择前应同时比较产物大小与执行成本。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  json: {
    stringify: true,
  },
})
~~~~

## 二十四、oxc

`oxc` 配置 JavaScript/TypeScript 转换能力。Vite 只做语法转换而不做类型检查，类型正确性仍由 `vue-tsc` 或
`tsc` 负责。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  oxc: {},
})
~~~~

## 二十五、assetsInclude

扩展被视为静态资源的文件类型，使导入返回 URL。它不会为该格式增加解析器或运行时支持。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
~~~~

## 二十六、logLevel

控制 Vite 日志级别。降低日志只能减少输出，不能修复 warning；CI 仍应保留可诊断的错误和版本信息。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  logLevel: 'info',
})
~~~~

## 二十七、customLogger

自定义 logger 可重定向或过滤输出。过滤必须匹配已理解的消息，不能吞掉未知 build warning。

**配置示例：**

~~~~ts
import { createLogger, defineConfig } from 'vite'

export default defineConfig({
  customLogger: createLogger('info'),
})
~~~~

## 二十八、clearScreen

控制开发服务器是否清屏。自动化日志通常设为 `false` 以保留完整时间线，它不影响构建行为。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  clearScreen: false,
})
~~~~

## 二十九、envDir

指定 `.env*` 搜索目录；`false` 可关闭加载。共享目录扩大可见变量范围，应配合 `envPrefix` 和秘密管理审计。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  envDir: 'env',
})
~~~~

## 三十、envPrefix

只有匹配前缀的变量会暴露给客户端。禁止设为空字符串；服务端密钥必须保持在构建进程或后端环境中。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_'],
})
~~~~

## 三十一、appType

`spa`、`mpa` 与 `custom` 决定 HTML 中间件和 fallback 行为。SSR/后端集成通常使用 `custom` 并自己承担 HTML
响应责任。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  appType: 'spa',
})
~~~~

## 三十二、future

用 `warn` 提前暴露未来破坏性变化。本教程只采用 Vite 8.2.1 提供的条目，升级时再按新版文档重新核验。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  future: {},
})
~~~~

## 三十三、完整配置示例

下面的配置把本页选项集中写在一起。实际项目应只保留确实需要的选项，并根据部署地址、依赖和入口调整值。

~~~~ts
import { createLogger, defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  base: '/learning/',
  mode: 'staging',
  input: 'index.html',
  define: { __APP_VERSION__: JSON.stringify('1.0.0') },
  plugins: [],
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',
  resolve: {
    alias: { '@': '/absolute/path/to/src' },
    dedupe: ['vue'],
    conditions: ['course'],
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    preserveSymlinks: false,
    tsconfigPaths: true,
  },
  html: {
    cspNonce: 'request-nonce',
    additionalAssetSources: [],
  },
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
    postcss: { plugins: [] },
    preprocessorOptions: { scss: { additionalData: '$brand: #2563eb;' } },
    preprocessorMaxWorkers: 4,
  },
  json: {
    namedExports: true,
    stringify: true,
  },
  oxc: {},
  assetsInclude: ['**/*.gltf'],
  logLevel: 'info',
  customLogger: createLogger('info'),
  clearScreen: false,
  envDir: 'env',
  envPrefix: ['VITE_', 'PUBLIC_'],
  appType: 'spa',
  future: {},
})
~~~~

## 三十四、易错使用提示

:::pitfalls
### 错误：把 envPrefix 设为空字符串

**触发条件：** 希望在客户端读取所有环境变量，配置 `envPrefix: ''`。

**原因：** 空前缀会扩大可暴露变量范围，并破坏 Vite 对客户端环境变量的安全边界。

**后果：** 构建产物可能包含服务端密钥或其他不应发送到浏览器的值。

**错误示例：**

```ts
export default { envPrefix: '' }
```

**正确写法：**

```ts
export default { envPrefix: 'VITE_' }
```

**验证方式：** 构建应用，确认公开变量存在，同时确认未加前缀的秘密字符串没有进入产物。
:::

## 三十五、工作原理与适用边界

1. 官方事实：Shared Options 在 dev、build 与相关程序化入口之间共享，并由最终配置解析补齐默认值。
2. 课程推导：root、base、resolve 与 envPrefix 会影响多条管线，应通过 `resolveConfig` 和真实产物共同核对。
3. 适用边界：本页只覆盖 Vite 公共配置；预处理器、框架插件与部署平台仍有各自独立合同。

## 三十六、参考资料

- [Vite 8.2.1 Shared Options](https://vite.dev/config/shared-options) - 支持本页配置形态、安全边界与适用版本。
