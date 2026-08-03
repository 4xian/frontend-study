/**
 * 知识点：服务端渲染 API
 * 查证来源（2026-08-03）：
 * - https://cn.vuejs.org/api/ssr.html
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src/renderToString.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src/renderToStream.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/useSsrContext.ts
 * - https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/hydration.ts
 * 查证工具：Tavily、Vue 中文官网与 vuejs/core v3.5.40 固定源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.advanced.server-rendering',
  type: 'reference',
  title: '服务端渲染 API 速查',
  summary:
    '按字符串、Node stream、Web stream 与 simple stream 选择 SSR 输出，并正确传递上下文、Teleport、完成和错误信号',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  related: [
    'vue.core.reference.application.create-ssr-app',
    'vue.core.learn.advanced.ssr-hydration',
    'vue.core.learn.intermediate.teleport',
  ],
  tags: [
    'SSR',
    'renderToString',
    'Node stream',
    'Web Streams',
    'useSSRContext',
    'Teleport',
    'data-allow-mismatch',
  ],
  sources: [
    {
      title: 'Vue 服务端渲染 API',
      url: 'https://cn.vuejs.org/api/ssr.html',
    },
    {
      title: 'Vue 3.5.40 renderToString 与 Teleport 收集',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src/renderToString.ts',
    },
    {
      title: 'Vue 3.5.40 stream 输出实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/src/renderToStream.ts',
    },
    {
      title: 'Vue 3.5.40 useSSRContext 实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/useSsrContext.ts',
    },
    {
      title: 'Vue 3.5.40 hydration mismatch 实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/hydration.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-03',
  anchors: [
    'renderToString()',
    'renderToNodeStream()',
    'pipeToNodeWritable()',
    'renderToWebStream()',
    'pipeToWebWritable()',
    'renderToSimpleStream()',
    'useSSRContext()',
    'data-allow-mismatch',
    '运行环境选择',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `function renderToString(input: App | VNode, context?: SSRContext): Promise<string>
function renderToNodeStream(input: App | VNode, context?: SSRContext): Readable
function pipeToNodeWritable(input: App | VNode, context: SSRContext, writable: Writable): void
function renderToWebStream(input: App | VNode, context?: SSRContext): ReadableStream
function pipeToWebWritable(input: App | VNode, context: SSRContext, writable: WritableStream): void
function renderToSimpleStream(input: App | VNode, context: SSRContext, options: SimpleReadable): SimpleReadable
function useSSRContext<T = Record<string, any>>(): T | undefined
type AllowedMismatch = 'text' | 'children' | 'class' | 'style' | 'attribute'`,
  blocks: [
    { type: 'heading', content: 'renderToString()' },
    {
      type: 'text',
      content:
        '`renderToString()` 把 `App` 或 `VNode` 完整渲染为 `Promise<string>`，适合需要先得到整段 HTML 再组装响应的入口。第二参数是当前渲染的 SSR context；组件可以读取它，Teleport 输出也会在渲染结束后写入 `context.teleports`，不会自动拼进主字符串。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { createSSRApp } from 'vue'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import App from './App.vue'

interface PageContext extends SSRContext {
  teleports?: Record<string, string>
}

/** 渲染一次请求，并分别返回主应用与 Teleport 内容。 */
export async function renderPage() {
  const context: PageContext = {}
  const appHtml = await renderToString(createSSRApp(App), context)

  return {
    appHtml,
    teleports: context.teleports ?? {},
  }
}`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '`context.teleports` 以 Teleport 目标选择器为键。HTML 模板必须把对应内容放进真实目标容器；只发送 `renderToString()` 的返回值会遗漏传送内容。context 还可能承载请求数据，因此应按请求新建。',
    },
    { type: 'heading', content: 'renderToNodeStream()' },
    {
      type: 'text',
      content:
        '`renderToNodeStream()` 返回 Node.js `Readable`，可直接 `.pipe()` 到 HTTP response。它只适用于 `vue/server-renderer` 的 CommonJS build；ESM build 不包含创建 Node Readable 所需的 Node 绑定，会抛错，此时应改用已有 Node Writable 的 `pipeToNodeWritable()`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { renderToNodeStream } from 'vue/server-renderer'

// 仅在加载 vue/server-renderer CommonJS build 的 Node 入口使用。
renderToNodeStream(app, context).pipe(response)`,
    },
    { type: 'heading', content: 'pipeToNodeWritable()' },
    {
      type: 'text',
      content:
        '`pipeToNodeWritable()` 接收调用方已经持有的 Node.js `Writable`，不要求 renderer 自己构造 Readable，因此是 Node ESM 入口的选择。Vue 会把字符串块交给 `writable.write()`，完成时调用 `writable.end()`，渲染失败时调用 `writable.destroy(error)`；函数本身返回 `void`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { pipeToNodeWritable } from 'vue/server-renderer'

// response 是 Node.js ServerResponse，也是 Writable。
pipeToNodeWritable(app, context, response)`,
    },
    { type: 'heading', content: 'renderToWebStream()' },
    {
      type: 'text',
      content:
        '`renderToWebStream()` 返回 Web `ReadableStream`，适合能够直接用 stream 构造 `Response` 的 Web runtime。Vue 3.5.40 会读取全局 `ReadableStream` 构造器，并用 `TextEncoder` 把 HTML 字符串编码为字节；环境即使支持 Web Streams，只要没有全局暴露该构造器，也不能调用这个 API。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { renderToWebStream } from 'vue/server-renderer'

/** 在提供全局 ReadableStream 的 Web runtime 中响应当前请求。 */
export function renderResponse() {
  return new Response(renderToWebStream(app, context), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}`,
    },
    { type: 'heading', content: 'pipeToWebWritable()' },
    {
      type: 'text',
      content:
        '`pipeToWebWritable()` 接收现成的 Web `WritableStream`，适合没有全局 `ReadableStream`、但能提供 `TransformStream` 或其他 Web Writable 的环境。实现会取得 writer，在可用时等待 `writer.ready`，写入编码后的字节，并在完成时关闭 writer；它与 Node Writable 不是同一套协议。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { pipeToWebWritable } from 'vue/server-renderer'

/** 用环境提供的 TransformStream 建立 Web 响应。 */
export function renderResponse() {
  const { readable, writable } = new TransformStream()
  pipeToWebWritable(app, context, writable)
  return new Response(readable)
}`,
    },
    { type: 'heading', content: 'renderToSimpleStream()' },
    {
      type: 'text',
      content:
        '`renderToSimpleStream()` 是平台无关的最低层适配入口。调用方只需提供 `push(chunk)` 与 `destroy(error)`：字符串 chunk 表示正文，`push(null)` 是唯一完成信号，`destroy(error)` 是失败信号。它不替应用选择 HTTP、Node 或 Web stream，也不会替自定义 sink 定义资源释放方式。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { renderToSimpleStream } from 'vue/server-renderer'

let html = ''

renderToSimpleStream(app, context, {
  /** 收集 HTML 块，并在 null 到达时完成响应。 */
  push(chunk) {
    if (chunk === null) {
      finishResponse(html)
      return
    }
    html += chunk
  },
  /** 把渲染失败交给当前平台的错误通道。 */
  destroy(error) {
    failResponse(error)
  },
})`,
    },
    { type: 'heading', content: 'useSSRContext()' },
    {
      type: 'text',
      content:
        '`useSSRContext<T>()` 读取当前 server renderer 注入的同一个 context，常用于组件在渲染期间登记 head 元数据或请求级信息。它只在 SSR 渲染上下文中有意义；客户端或没有 server renderer provider 的调用会得到 `undefined`，开发环境还会警告，因此必须放在 SSR-only 分支中。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<script setup lang="ts">
import { useSSRContext } from 'vue'

interface PageContext {
  head: string[]
}

if (import.meta.env.SSR) {
  const context = useSSRContext<PageContext>()
  context?.head.push('<meta name="description" content="课程目录">')
}
</script>`,
    },
    { type: 'heading', content: 'data-allow-mismatch' },
    {
      type: 'text',
      content:
        '`data-allow-mismatch` 是 Vue 3.5+ 的特殊 attribute，用于抑制已知且不可避免的 hydration mismatch 警告。值可为 `text`、`children`、`class`、`style` 或 `attribute`，也可用逗号组合；省略值会允许所有类型。它只抑制匹配类别的警告，不会让两端数据一致，也不会关闭 Vue 后续的 DOM 检查、接管或调和。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template>
  <time data-allow-mismatch="text">{{ localizedTime }}</time>
</template>`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '优先修复随机数、时区、浏览器状态或无效 HTML 导致的两端差异。只有业务确认差异不可避免，并能精确限定类别时才添加该 attribute；不要用空值把整个子树的真实 SSR 缺陷静音。',
    },
    { type: 'heading', content: '运行环境选择' },
    {
      type: 'table',
      headers: ['目标输出', '环境前提', '首选 API', '完成与错误通道'],
      rows: [
        [
          '完整字符串',
          '任意受支持的 SSR runtime',
          '`renderToString()`',
          'Promise resolve / reject',
        ],
        [
          'Node Readable',
          'Node.js + server-renderer CommonJS build',
          '`renderToNodeStream()`',
          'Readable end / error',
        ],
        [
          '已有 Node Writable',
          'Node.js，包括 ESM 入口',
          '`pipeToNodeWritable()`',
          '`end()` / `destroy(error)`',
        ],
        [
          'Web ReadableStream',
          '全局暴露 `ReadableStream`',
          '`renderToWebStream()`',
          'controller close / error',
        ],
        [
          '已有 Web WritableStream',
          '可提供 Web Writable，但不要求全局 ReadableStream',
          '`pipeToWebWritable()`',
          'writer close / adapter error path',
        ],
        [
          '自定义平台 sink',
          '能实现两个 simple stream 方法',
          '`renderToSimpleStream()`',
          '`push(null)` / `destroy(error)`',
        ],
      ],
    },
    {
      type: 'text',
      content:
        '这四类输出路径共享 `App | VNode`、请求级 context 和相同的组件渲染语义，但不能只按“是否流式”选择。先确认运行时提供的是 Node stream 还是 Web Streams，再确认构建格式与全局构造器，最后决定让 Vue 创建 Readable，还是把现有 Writable 交给 Vue。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '只返回主字符串，遗漏 context 中的 Teleport',
          description:
            '`renderToString()` 把 Teleport 内容写入 `context.teleports`，不会替页面模板寻找并填充目标容器。',
          consequence:
            '主应用 HTML 正常返回，但弹层、通知或其他传送内容缺失，客户端 hydration 还可能面对不一致的目标 DOM。',
          wrong: {
            lang: 'ts',
            content: `/** 只返回主应用 HTML。 */
async function renderPage() {
  return renderToString(app)
}`,
          },
          correct: {
            lang: 'ts',
            content: `/** 同时收集主应用与 Teleport 输出。 */
async function renderPage() {
  const context: SSRContext = {}
  const appHtml = await renderToString(app, context)
  return { appHtml, teleports: context.teleports ?? {} }
}`,
          },
        },
        {
          title: '在 ESM build 调用 renderToNodeStream()',
          description:
            '该 API 只在 CommonJS build 中创建 Node Readable；server-renderer 的 ESM build 明确不支持。',
          consequence: '代码到运行时才抛错，响应尚未写出，SSR 请求直接失败。',
          wrong: {
            lang: 'ts',
            content: `// Node ESM 入口仍要求 Vue 创建 Readable。
renderToNodeStream(app).pipe(response)`,
          },
          correct: {
            lang: 'ts',
            content: `// Node ESM 入口把已有 Writable 交给 Vue。
pipeToNodeWritable(app, context, response)`,
          },
        },
        {
          title: '环境没有全局 ReadableStream 仍创建 Web Readable',
          description:
            '`renderToWebStream()` 会直接检查全局构造器；“平台支持部分 Web Streams”不等于该名称可全局使用。',
          consequence: 'renderer 在开始输出前同步抛错，即使环境其实能提供可写的 Web stream。',
          wrong: {
            lang: 'ts',
            content: 'return new Response(renderToWebStream(app))',
          },
          correct: {
            lang: 'ts',
            content: `const { readable, writable } = new TransformStream()
pipeToWebWritable(app, context, writable)
return new Response(readable)`,
          },
        },
        {
          title: '把 Node Writable 与 Web WritableStream 混用',
          description:
            'Node Writable 使用 `write()`、`end()`、`destroy()`；Web WritableStream 需要 `getWriter()`、`write()` 与 `close()`。',
          consequence:
            '适配器调用不存在的方法，或绕过 Web writer 的锁与 backpressure 语义，响应无法正常完成。',
          wrong: {
            lang: 'ts',
            content: `// response 是 Node ServerResponse，却传给 Web Streams 入口。
pipeToWebWritable(app, context, response)`,
          },
          correct: {
            lang: 'ts',
            content: `// Node response 使用 Node Writable 入口。
pipeToNodeWritable(app, context, response)`,
          },
        },
        {
          title: 'simple stream 忽略 null 与 destroy(error)',
          description:
            '字符串 chunk、完成和失败都复用同一个最小协议；`null` 不是正文，错误也不会通过 `push()` 送达。',
          consequence: '响应把 null 当文本写出、永远不结束，或渲染失败后连接仍悬挂且没有错误记录。',
          wrong: {
            lang: 'ts',
            content: `renderToSimpleStream(app, context, {
  /** 把所有值都当作正文。 */
  push(chunk) { response.write(String(chunk)) },
  /** 忽略渲染错误。 */
  destroy() {},
})`,
          },
          correct: {
            lang: 'ts',
            content: `renderToSimpleStream(app, context, {
  /** 区分正文与完成信号。 */
  push(chunk) { chunk === null ? response.end() : response.write(chunk) },
  /** 终止当前失败的响应。 */
  destroy(error) { response.destroy(error) },
})`,
          },
        },
        {
          title: '在客户端无条件调用 useSSRContext()',
          description:
            'context 由 server renderer 在当前 SSR 渲染树中提供，普通客户端 setup 没有这个 provider。',
          consequence: '客户端得到 `undefined`，开发环境产生警告，随后直接读写字段还会抛错。',
          wrong: {
            lang: 'ts',
            content: `const context = useSSRContext<PageContext>()
context.head.push(title)`,
          },
          correct: {
            lang: 'ts',
            content: `if (import.meta.env.SSR) {
  const context = useSSRContext<PageContext>()
  context?.head.push(title)
}`,
          },
        },
        {
          title: '把 data-allow-mismatch 当作 hydration 修复',
          description:
            '该 attribute 从 3.5 起只允许指定类别的警告；真实 DOM 差异仍由 hydration 的既有逻辑处理。',
          consequence:
            '错误的初始状态、无效 HTML 或随机输出继续存在，只是诊断信号被静音，问题更难发现。',
          wrong: {
            lang: 'vue',
            content: '<main data-allow-mismatch>{{ unstablePage }}</main>',
          },
          correct: {
            lang: 'vue',
            content: '<time data-allow-mismatch="text">{{ unavoidableLocalizedTime }}</time>',
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. SSR context 通过应用 provide 进入组件树',
          content:
            '`renderToString.ts` 与 `renderToStream.ts` 都会把原始 VNode 包装成 app，并在渲染前以 `ssrContextKey` provide 当前 context；`useSsrContext.ts` 用同一个 symbol 注入。因此它是一次渲染的依赖注入值，只适合 SSR-only 组件路径。',
        },
        {
          title: '2. 字符串输出按缓冲区顺序等待异步片段',
          content:
            '`renderToString.ts` 先取得组件 SSR buffer，再由 `unrollBuffer()` 逐层处理字符串、嵌套 buffer 与 Promise，最终才 resolve 完整字符串。需要首字节尽早到达时应选择 stream，而不是把这个 Promise 当同步结果。',
        },
        {
          title: '3. Teleport 在主树完成后单独归档',
          content:
            '`resolveTeleports()` 遍历 `context.__teleportBuffers`，逐个展开到 `context.teleports[target]`。主 HTML 与目标内容天然是两份输出，页面模板层必须按 selector 放置 Teleport 内容。',
        },
        {
          title: '4. Node 两个入口最终复用 simple stream',
          content:
            '`renderToNodeStream()` 只在 CommonJS 分支创建 Node Readable；`pipeToNodeWritable()` 则把 chunk、null 与 error 映射到既有 writable 的 `write()`、`end()` 和 `destroy()`。Node ESM 应选择后者。',
        },
        {
          title: '5. Web Readable 依赖全局构造器并输出字节',
          content:
            '`renderToWebStream()` 缺少全局 `ReadableStream` 时立即抛错；可用时通过 `TextEncoder` enqueue 字节，null 关闭 controller，错误进入 `controller.error()`。它适合原生接受 Web Readable 的响应对象。',
        },
        {
          title: '6. Web Writable 入口适配现有 writer',
          content:
            '`pipeToWebWritable()` 从 writable 获取 writer，在环境提供可等待的 `ready` 时先等待 backpressure，再写入编码后的字节，并用 null 关闭 writer。它绕开了对全局 ReadableStream 构造器的依赖。',
        },
        {
          title: '7. simple stream 定义统一终止协议',
          content:
            '`renderToSimpleStream()` 在组件 buffer 与 Teleport 都处理完成、SSR watcher handle 清理后调用 `push(null)`；Promise 链任一步失败都会调用 `destroy(error)`。自定义平台只需可靠实现这两个终止分支。',
        },
        {
          title: '8. mismatch attribute 只参与警告许可判断',
          content:
            '`hydration.ts` 把允许类型映射为 text、children、class、style 与 attribute；空值允许全部，text 与 children 还会向祖先查找声明。判断结果只跳过 mismatch 警告分支，后续文本替换、节点增删或属性检查逻辑并未由它修复。',
        },
      ],
    },
  ],
  notes: [
    '本页只描述 Vue 3.5.40 官方 SSR API，不为当前 Vite SPA 增加 SSR runtime、路由集成或部署配置。',
    '所有 context 都应按请求创建；示例省略了状态序列化、HTTP 安全 header、路由就绪和资源注入。',
    'data-allow-mismatch 自 Vue 3.5 起提供，只用于明确且不可避免的差异，不替代两端一致性。',
  ],
})
