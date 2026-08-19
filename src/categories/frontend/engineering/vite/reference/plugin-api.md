---
id: engineering.vite.reference.plugin-api
type: reference
title: Vite Plugin API
summary: 查阅配置、开发服务器、HTML、HMR 与 Rolldown 通用钩子，以及插件顺序和通信边界。
domain: frontend
technology: engineering
module: vite
group: programmatic-api
signature: |-
  interface Plugin {
    name: string
    config?: PluginHook
    resolveId?: PluginHook
    transform?: PluginHook
  }
related:
  - engineering.vite.learn.intermediate.plugin-order-and-application
  - engineering.vite.learn.intermediate.plugin-hooks
tags:
  - Vite
  - Plugin API
  - Rolldown
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 Plugin API
    url: https://vite.dev/guide/api-plugin
    sourceType: api-doc
    appliesTo: Vite 8.2.1
anchors:
  - config
  - configresolved
  - configureserver
  - configurepreviewserver
  - transformindexhtml
  - handlehotupdate
  - resolveid
  - load
  - transform
  - buildstart
  - buildend
  - closebundle
  - moduleparsed
  - enforce
  - apply
  - plugin-context-meta
  - output-bundle-metadata
  - path-normalization
  - hook-filters
  - client-server-communication
---

# Vite Plugin API

插件在开发期和构建期共享部分 Rolldown 合同，同时有 Vite 专属钩子。每个插件必须有稳定 `name`；带内部状态的
插件工厂应为每次配置创建新实例。

## 一、config

在用户配置解析前运行，可返回部分配置。对象结果深合并；修改原对象只适合直接改变数组等不能正确合并的字段。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:config',
  /** 返回需要合并的用户配置。 */
  config: () => ({ base: '/learning/' }),
}
~~~~

## 二、configResolved

在最终配置解析后读取 `ResolvedConfig`，适合缓存 command、mode 与 root。此阶段不应再尝试改变已解析配置。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:resolved',
  /** 读取最终解析后的 mode。 */
  configResolved: (config) => console.log(config.mode),
}
~~~~

## 三、configureServer

取得 `ViteDevServer` 并注册中间件或返回 post hook。只在 dev server 运行，build 期间不会调用。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:server',
  /** 注册开发服务器健康检查接口。 */
  configureServer(server) {
    server.middlewares.use('/__health', (_request, response) => response.end('ok'))
  },
}
~~~~

## 四、configurePreviewServer

取得 PreviewServer 并配置预览中间件；它与 `configureServer` 生命周期不同，不能用其证明生产服务器行为。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:preview',
  /** 注册 preview 健康检查接口。 */
  configurePreviewServer(server) {
    server.middlewares.use('/preview-health', (_request, response) => response.end('ok'))
  },
}
~~~~

## 五、transformIndexHtml

转换 HTML 或返回标签描述，支持 pre/post 顺序。生成标签应提供明确注入位置并遵守 CSP nonce。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:index-html',
  /** 向 HTML head 注入课程标记。 */
  transformIndexHtml() {
    return [{ tag: 'meta', attrs: { name: 'course', content: 'vite' }, injectTo: 'head' }]
  },
}
~~~~

## 六、handleHotUpdate

接收文件变化与模块集合，可过滤传播或读取文件。返回空数组会阻止更新，复杂逻辑必须用真实 file update 验证。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:hot-update',
  /** 仅对课程 JSON 触发整页刷新。 */
  handleHotUpdate(context) {
    if (!context.file.endsWith('.course.json')) return
    context.server.hot.send({ type: 'full-reload' })
    return []
  },
}
~~~~

## 七、resolveId

把导入标识解析为模块 ID。虚拟模块公共 ID 常用 `virtual:` 前缀，内部 ID 使用 `\0` 避免与普通 URL 冲突。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:resolve',
  /** 解析课程虚拟模块。 */
  resolveId(id) {
    return id === 'virtual:course' ? '\0virtual:course' : null
  },
}
~~~~

## 八、load

为已解析 ID 提供源码和 source map。无法处理时返回 `null`，让后续插件或默认加载器继续。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:load',
  /** 为已解析的课程虚拟模块返回源码。 */
  load(id) {
    return id === '\0virtual:course' ? 'export const title = "Vite"' : null
  },
}
~~~~

## 九、transform

转换模块源码并尽量提供精确 source map。过滤器应缩小文件范围，避免每个模块都执行昂贵转换。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:transform',
  /** 只转换课程源码并保留 source map 字段。 */
  transform(code, id) {
    if (!id.endsWith('.course.ts')) return null
    return { code: code.replace('__VERSION__', '8.2.1'), map: null }
  },
}
~~~~

## 十、buildStart

构建开始时初始化资源或注册 watch 文件。失败应抛出可诊断错误，不要仅输出日志后继续生成不完整产物。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:watch-file',
  /** 将课程配置加入构建监听集合。 */
  buildStart() {
    this.addWatchFile('course.config.json')
  },
}
~~~~

## 十一、buildEnd

构建结束后接收可选错误，适合结束构建级资源。最终文件尚可能继续写入，不应把它当成完整产物发布信号。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:build-end',
  /** 报告构建阶段错误。 */
  buildEnd(error) {
    if (error) console.error('构建失败', error)
  },
}
~~~~

## 十二、closeBundle

所有产物写入后执行，适合关闭服务或最后清理。watch 模式可能多次执行，资源关闭必须可重复。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:close',
  /** 在产物写入完成后记录关闭阶段。 */
  closeBundle() {
    console.log('所有产物已写入')
  },
}
~~~~

## 十三、moduleParsed

在模块解析完成时读取模块信息；高频钩子应保持轻量。需要模块图时优先使用上下文 API，而非自行正则解析源码。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:module-parsed',
  /** 读取解析完成的模块信息。 */
  moduleParsed(moduleInfo) {
    console.log(moduleInfo.id, moduleInfo.importedIds)
  },
}
~~~~

## 十四、enforce

`pre`、默认、`post` 将插件放入不同队列，并与核心和框架插件共同排序。不能只看用户数组位置推断最终次序。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:pre',
  enforce: 'pre',
  /** 作为顺序示例的空转换钩子。 */
  transform() {
    return null
  },
}
~~~~

## 十五、apply

用 `serve`、`build` 或函数限制插件运行场景。函数判断应读取 command/mode 等稳定输入，避免依赖宿主全局状态。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:build',
  apply: 'build',
  /** 仅在 build 阶段运行的输出钩子。 */
  generateBundle() {},
}
~~~~

## 十六、Plugin Context Meta

上下文 `meta` 暴露 Rolldown 版本等构建器信息。只在确需兼容分支时读取，普通插件应优先遵守公共合同。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:context-meta',
  /** 读取构建器上下文中的 Rolldown 版本。 */
  buildStart() {
    console.log(this.meta.rolldownVersion)
  },
}
~~~~

## 十七、Output Bundle Metadata

Vite 会在输出 chunk metadata 中附加 imported CSS/assets 等信息，供 manifest 或框架集成使用；字段应固定到当前
Vite 版本。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:bundle-metadata',
  /** 读取 chunk 上的 Vite metadata。 */
  generateBundle(_options, bundle) {
    for (const output of Object.values(bundle)) {
      if (output.type === 'chunk') console.log(output.viteMetadata)
    }
  },
}
~~~~

## 十八、Path Normalization

插件内部 ID 应使用 `/` 作为分隔符。跨平台比较前调用 `normalizePath`，不要用手写替换覆盖协议或虚拟 ID。

**最小示例：**

~~~~ts
import { normalizePath } from 'vite'

const id = normalizePath('src\\features\\course.ts')
~~~~

## 十九、Hook Filters

支持的 hook filter 能在 Rust/JS 边界前过滤 ID，提高大型项目性能。为兼容旧版本，hook 内仍应保留相同判断。

**最小示例：**

~~~~ts
const plugin = {
  name: 'course:filter',
  /** 只处理课程源码。 */
  transform: { filter: { id: /\\.course\\.ts$/ }, handler: (code) => code },
}
~~~~

## 二十、Client-server Communication

插件可通过 HMR channel 发送和接收自定义事件。事件名应命名空间化、payload 可序列化，并在页面卸载时移除监听。

**最小示例：**

~~~~ts
import type { Plugin } from 'vite'

const plugin: Plugin = {
  name: 'course:channel',
  /** 转发带命名空间的自定义 HMR 事件。 */
  configureServer(server) {
    server.hot.on('course:select', (data, client) => client.send('course:selected', data))
  },
}
~~~~

## 二十一、组合使用示例

下面的示例把本页最常用的接口组合成一条完整使用路径。

~~~~ts
import type { Plugin } from 'vite'

/** 创建组合使用示例插件。 */
export function coursePlugin(): Plugin {
  const publicId = 'virtual:course'
  const resolvedId = '\0' + publicId
  return {
    name: 'course:complete',
    enforce: 'pre',
    /** 解析组合示例的虚拟模块。 */
    resolveId: (id) => (id === publicId ? resolvedId : null),
    /** 加载组合示例的虚拟模块。 */
    load: (id) => (id === resolvedId ? 'export const title = "Vite"' : null),
  }
}
~~~~

## 二十二、易错使用提示

:::pitfalls
### 错误：用 configureServer 证明插件支持生产构建

**触发条件：** 插件只实现 `configureServer`，dev 页面成功后就宣称 build 路径也已覆盖。

**原因：** `configureServer` 是 Vite 开发服务器专属钩子，生产构建不会调用它。

**后果：** dev 中注入的中间件或状态在 build 缺失，产物行为与课程结论不一致。

**错误示例：**

```ts
const plugin = { name: 'example', configureServer() {} }
```

**正确写法：**

```ts
const plugin = { name: 'example', apply: 'build', buildStart() {} }
```

**验证方式：** 分别运行 dev 请求和 build，记录最终插件顺序以及实际触发的钩子。
:::

## 二十三、工作原理与适用边界

1. 官方事实：Vite 插件由通用 Rolldown 钩子、Vite 专属钩子、enforce 与 apply 共同决定执行时机。
2. 课程推导：插件正确性要按 serve/build 分开验证，用户数组顺序不能代替最终钩子日志。
3. 适用边界：本页只覆盖公开 Plugin API；Vite 内部插件和框架插件私有字段不进入稳定分母。

## 二十四、参考资料

- [Vite 8.2.1 Plugin API](https://vite.dev/guide/api-plugin) - 支持插件钩子、顺序、条件应用与兼容边界。
