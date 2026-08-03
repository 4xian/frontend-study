# Vue Core API 第 41 批：平台边界

## 批次目标

本批补齐 Vue 3.5.40 中文官网进阶 API 中最后 13 个索引项，并将 Vue Core Reference
覆盖收敛为 `206 available / 0 planned / 206 total`。内容采用三篇 `quick` Reference，不新增
Demo、依赖或 E2E，也不把当前 Vite SPA 改造成 SSR、Web Component 或非 DOM renderer 工程。

## 官方来源

- [自定义元素 API](https://cn.vuejs.org/api/custom-elements.html)
- [服务端渲染 API](https://cn.vuejs.org/api/ssr.html)
- [自定义渲染器 API](https://cn.vuejs.org/api/custom-renderer.html)
- [Vue 3.5.40 Custom Element 实现](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/apiCustomElement.ts)
- [Vue 3.5.40 renderToString 实现](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src/renderToString.ts)
- [Vue 3.5.40 stream 实现](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src/renderToStream.ts)
- [Vue 3.5.40 renderer 契约](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts)

查证日期：2026-08-03。官网与固定提交源码通过 Tavily 提取并交叉核对。

## 冻结映射

| 页面 | Manifest 项 | 站内锚点 |
| --- | ---: | --- |
| `custom-elements.ts` | 4 | `definecustomelement`、`usehost`、`useshadowroot`、`thishost` |
| `server-rendering.ts` | 8 | `rendertostring`、`rendertonodestream`、`pipetonodewritable`、`rendertowebstream`、`pipetowebwritable`、`rendertosimplestream`、`usessrcontext`、`data-allow-mismatch` |
| `custom-renderer.ts` | 1 | `createrenderer` |

三篇页面 ID 分别为：

- `vue.core.reference.advanced.custom-elements`
- `vue.core.reference.advanced.server-rendering`
- `vue.core.reference.advanced.custom-renderer`

## 内容契约

### 自定义元素

- `defineCustomElement()` 返回 `HTMLElement` 构造器，仍需 `customElements.define()` 注册。
- 3.5+ 说明 `configureApp`、`shadowRoot` 与 `nonce`；`shadowRoot` 默认 `true`。
- `useHost()`、`useShadowRoot()` 只在 Vue 自定义元素的 `setup()` 上下文有意义；Options API
  对应 `this.$host`。
- 固定 6 个结构化易错点与 6 条源码推导。

### 服务端渲染

- 区分字符串、Node stream、Web stream 与平台无关 simple stream 四种输出路径。
- `renderToNodeStream()` 不支持 ESM build；该环境使用 `pipeToNodeWritable()`。
- 没有全局 `ReadableStream` 的环境使用 `pipeToWebWritable()`。
- `renderToSimpleStream()` 以 `push(null)` 完成、以 `destroy(error)` 报错。
- `useSSRContext()` 只在 SSR 渲染上下文中读取值；`data-allow-mismatch` 为 Vue 3.5+，只抑制
  已知不可避免的不匹配警告，不修复差异。
- 固定 7 个结构化易错点与 8 条源码推导。

### 自定义渲染器

- `createRenderer(hostOptions)` 返回 `render` 与 `createApp`。
- host operations 必须维护创建、插入、删除、文本、属性、父节点与兄弟节点关系。
- 普通 `createRenderer()` 不等于 hydration renderer，不宣称具备 hydration 能力。
- 固定 5 个结构化易错点与 6 条源码推导。

## 验证 Gate

1. 13 个索引项均为 `available`，指向真实页面与唯一 heading anchor。
2. 三篇内容均属于 `advanced`，可由 catalog 加载，且不含 Demo block。
3. Reference 导航保持 9 个分类，正文从 47 篇增至 50 篇。
4. `vue-core-reference-batch41.spec.ts`、全量 Vitest、type-check、lint、format-check、build 与
   diff-check 全部通过。
5. 独立 Standards / Spec 复审达到 `PASS / 0 finding` 后，才登记第 41 批闭环。

## Stop Boundary

本批只关闭 Vue Core 官方 API 索引覆盖。Vue Router、Pinia、React、课程主线、Demo、动画、
运行时 SSR 集成与部署配置均不在范围内。
