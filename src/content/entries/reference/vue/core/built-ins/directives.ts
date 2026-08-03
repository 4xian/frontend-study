/**
 * 知识点：内置指令
 * 查证来源（2026-08-03）：
 * - https://cn.vuejs.org/api/built-in-directives.html
 * - https://cn.vuejs.org/guide/essentials/template-syntax.html
 * - https://cn.vuejs.org/guide/essentials/conditional.html
 * - https://cn.vuejs.org/guide/essentials/list.html
 * - https://cn.vuejs.org/guide/essentials/event-handling.html
 * - https://cn.vuejs.org/guide/essentials/forms.html
 * - https://cn.vuejs.org/guide/components/slots.html
 * - https://cn.vuejs.org/guide/best-practices/security.html
 * - https://cn.vuejs.org/guide/best-practices/performance.html
 * - https://github.com/vuejs/core/tree/fa2885d8c48768d26f1666a01bd540ffe3b20f9b
 * 查证工具：Tavily、Vue 中文官网、vuejs/core v3.5.40 固定提交源码与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.built-ins.directives',
  type: 'reference',
  title: '内置指令',
  summary: '查询 Vue 15 个内置指令的公开语义、合法位置、修饰符、版本边界与编译运行时注意事项',
  ecosystem: 'vue',
  module: 'core',
  collection: 'built-ins',
  related: [
    'vue.core.learn.basics.template-syntax',
    'vue.core.learn.basics.conditional-list-rendering',
    'vue.core.learn.basics.event-handling',
    'vue.core.learn.basics.form-bindings',
    'vue.core.learn.intermediate.component-v-model',
    'vue.core.learn.intermediate.slots',
    'vue.core.learn.advanced.performance',
  ],
  tags: ['v-text', 'v-html', 'v-if', 'v-for', 'v-on', 'v-bind', 'v-model', 'v-slot', 'v-memo'],
  sources: [
    {
      title: 'Vue 内置指令 API',
      url: 'https://cn.vuejs.org/api/built-in-directives.html',
    },
    {
      title: 'Vue 模板语法指南',
      url: 'https://cn.vuejs.org/guide/essentials/template-syntax.html',
    },
    {
      title: 'Vue 条件渲染指南',
      url: 'https://cn.vuejs.org/guide/essentials/conditional.html',
    },
    {
      title: 'Vue 列表渲染指南',
      url: 'https://cn.vuejs.org/guide/essentials/list.html',
    },
    {
      title: 'Vue 事件处理指南',
      url: 'https://cn.vuejs.org/guide/essentials/event-handling.html',
    },
    {
      title: 'Vue 表单输入绑定指南',
      url: 'https://cn.vuejs.org/guide/essentials/forms.html',
    },
    {
      title: 'Vue 插槽指南',
      url: 'https://cn.vuejs.org/guide/components/slots.html',
    },
    {
      title: 'Vue 安全指南',
      url: 'https://cn.vuejs.org/guide/best-practices/security.html',
    },
    {
      title: 'Vue 性能优化指南',
      url: 'https://cn.vuejs.org/guide/best-practices/performance.html',
    },
    {
      title: 'Vue 3.5.40 编译器入口',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/compile.ts',
    },
    {
      title: 'Vue 3.5.40 DOM 指令转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/index.ts',
    },
    {
      title: 'Vue 3.5.40 v-text 编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vText.ts',
    },
    {
      title: 'Vue 3.5.40 v-html 编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vHtml.ts',
    },
    {
      title: 'Vue 3.5.40 v-show 编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-dom/src/transforms/vShow.ts',
    },
    {
      title: 'Vue 3.5.40 条件分支转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vIf.ts',
    },
    {
      title: 'Vue 3.5.40 列表转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vFor.ts',
    },
    {
      title: 'Vue 3.5.40 事件编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vOn.ts',
    },
    {
      title: 'Vue 3.5.40 v-bind 编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vBind.ts',
    },
    {
      title: 'Vue 3.5.40 v-model 编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vModel.ts',
    },
    {
      title: 'Vue 3.5.40 插槽编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vSlot.ts',
    },
    {
      title: 'Vue 3.5.40 模板解析器',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/parser.ts',
    },
    {
      title: 'Vue 3.5.40 v-once 编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vOnce.ts',
    },
    {
      title: 'Vue 3.5.40 v-memo 编译转换',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-core/src/transforms/vMemo.ts',
    },
    {
      title: 'Vue 3.5.40 DOM 事件实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/modules/events.ts',
    },
    {
      title: 'Vue 3.5.40 v-model 运行时实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/directives/vModel.ts',
    },
    {
      title: 'Vue 3.5.40 v-memo 运行时实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/withMemo.ts',
    },
    {
      title: 'Vue 3.5.40 列表渲染实现',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/renderList.ts',
    },
    {
      title: 'Vue 3.5.40 DOM property 路由',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/patchProp.ts',
    },
    {
      title: 'Vue 3.5.40 DOM 应用挂载入口',
      url: 'https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/index.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-03',
  anchors: [
    '概述与版本边界',
    'v-text',
    'v-html',
    'v-show',
    'v-if',
    'v-else',
    'v-else-if',
    'v-for',
    'v-on',
    'v-bind',
    'v-model',
    'v-slot',
    'v-pre',
    'v-once',
    'v-memo',
    'v-cloak',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `v-text="expression"
v-html="expression"
v-show="expression"
v-if="expression"
v-else
v-else-if="expression"
v-for="alias in source"
v-on:event.modifier="handler"
v-bind:attribute.modifier="value"
v-model:argument.modifier="value"
v-slot:name="slotProps"
v-pre
v-once
v-memo="dependencies"
v-cloak`,
  blocks: [
    { type: 'heading', content: '概述与版本边界' },
    {
      type: 'text',
      content:
        '内置指令把模板声明转换为 DOM、组件、事件或渲染缓存行为。本页是公开契约速查：完整的模板、条件列表、事件、表单、插槽与性能学习路径见“相关内容”。指令表达式仍运行在当前组件模板作用域中，不应把编译器内部 AST、缓存索引或 DOM 私有字段当作业务 API。',
    },
    {
      type: 'table',
      headers: ['版本', '新增能力', '边界'],
      rows: [
        ['3.2+', '`v-bind` 的 `.prop` / `.attr`', '强制选择 DOM property 或 attribute 写入通道'],
        ['3.2+', '`v-memo`', '仅用于已测量的渲染性能瓶颈'],
        ['3.4+', '`v-bind` 同名简写 `:src`', '等价于 `:src="src"`，更低版本不可用'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '`v-once` 不是 Vue 3.2 才加入；“3.2+ 可考虑 `v-memo`”只是在说明替代工具的版本。其余指令在本页没有需要额外标出的 3.2 / 3.4 新增边界。',
    },
    { type: 'heading', content: 'v-text' },
    {
      type: 'text',
      content:
        '`v-text` 接收字符串并更新元素完整的 `textContent`。内容按普通文本处理，不执行 HTML；由于它会替换所有子内容，只更新一句话中的局部文本时应使用 `{{ message }}` 插值。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<p v-text="message" />
<p>状态：{{ message }}</p>`,
    },
    { type: 'heading', content: 'v-html' },
    {
      type: 'text',
      content:
        '`v-html` 接收字符串并更新元素完整的 `innerHTML`。插入内容不会再次经过 Vue 模板编译，其中的插值、指令和组件标签都只是普通 HTML。它只允许接收可信 HTML；用户输入、URL 参数、评论或第三方富文本必须先经过可信且明确的净化策略。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '动态 HTML 没有 SFC 编译期添加的 scope attribute，因此普通 scoped 选择器不会自动匹配其内部节点。Trusted Types 也不等同于业务级 HTML sanitizer。',
    },
    { type: 'heading', content: 'v-show' },
    {
      type: 'text',
      content:
        '`v-show` 根据表达式真假切换真实元素的内联 `display`，显示时恢复初始 display。元素、事件监听器和子组件实例始终保留，也能参与 `<Transition>` 的 persisted 过渡；因此适合频繁显隐或必须保留本地 DOM 状态的场景。',
    },
    {
      type: 'text',
      content:
        '它不支持 `<template>`，也不能连接 `v-else`。初始为假时仍会创建子树；低频切换、需要延迟首次创建或隐藏时必须释放资源，应使用 `v-if`。',
    },
    { type: 'heading', content: 'v-if' },
    {
      type: 'text',
      content:
        '`v-if` 根据表达式真假创建或销毁整个分支，包括其中的指令和组件。初始为假时分支不会创建；放在 `<template>` 上可以控制多个节点而不生成额外 DOM。它与 `v-for` 同元素时优先执行，因而不能读取尚未建立的循环别名。',
    },
    { type: 'heading', content: 'v-else' },
    {
      type: 'text',
      content:
        '`v-else` 不接表达式，只能作为同一父级内紧邻 `v-if` 或 `v-else-if` 的最后分支。空白和注释可以位于分支之间，普通元素或非空文本会打断条件链；它也可以放在 `<template>` 上控制多节点分支。',
    },
    { type: 'heading', content: 'v-else-if' },
    {
      type: 'text',
      content:
        '`v-else-if` 接收任意条件值，可连续组成条件链；每一项必须紧邻前一个 `v-if` 或 `v-else-if`。`v-else` 已经结束条件链后不能继续追加 `v-else-if`，多节点分支同样可使用 `<template>`。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template v-if="status === 'ready'">
  <ReadyPanel />
</template>
<ErrorPanel v-else-if="status === 'error'" />
<LoadingPanel v-else />`,
    },
    { type: 'heading', content: 'v-for' },
    {
      type: 'text',
      content:
        '`v-for` 接收 `Array | Object | number | string | Iterable`，写作 `alias in source` 或 `alias of source`。数组和 iterable 提供 `(value, index)`；对象提供 `(value, key, index)`；正整数范围从 `1` 开始。循环组件不会自动收到 alias，仍须把数据显式作为 prop 传入。',
    },
    {
      type: 'text',
      content:
        '有状态列表应提供稳定、唯一的字符串、数字或 symbol `key`。对象不能作为 key，重排列表通常不能用 index 冒充业务身份；`<template v-for>` 的 key 放在 `<template>` 本身。完整 `key` API 属于下一批，本页只保留与列表身份直接相关的约束。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<template v-for="item in items" :key="item.id">
  <RowEditor :item="item" />
  <RowActions :item-id="item.id" />
</template>`,
    },
    { type: 'heading', content: 'v-on' },
    {
      type: 'text',
      content:
        '`v-on` 带参数时监听对应 DOM 事件或组件自定义事件，值可以是方法路径、内联语句或函数，内联表达式可访问 `$event`。无参数对象语法一次绑定多个事件，但不支持修饰符；组件事件只通知直接调用点，不具有 DOM 冒泡语义。',
    },
    {
      type: 'text',
      content: '事件 guard 按书写顺序运行；按键修饰符匹配 `KeyboardEvent.key`。',
    },
    {
      type: 'text',
      content:
        '`.capture`、`.once` 和 `.passive` 对应原生 listener options；其中 `.passive` 已承诺不会阻止默认行为，不能与 `.prevent` 同用。',
    },
    {
      type: 'code',
      lang: 'vue',
      content: `<button @click.stop="save">保存</button>
<input @keyup.enter="submit" />
<section v-on="listeners" />`,
    },
    { type: 'heading', content: 'v-bind' },
    {
      type: 'text',
      content:
        '`v-bind` 带参数时绑定 attribute、DOM property 或组件 prop，无参数时合并对象。普通 DOM 绑定会根据 key 是否存在于元素上选择 property 或 attribute；3.2+ 的 `.prop` / `.` 与 `.attr` 可强制写入通道，`.camel` 转换 attribute 名。`class` 和 `style` 额外接受对象与数组。',
    },
    {
      type: 'text',
      content:
        '组件绑定仍受 props 声明约束。对象展开与同名显式绑定按模板出现顺序合并，普通同名值由后出现者决定，class、style 和监听器另有专门合并规则。3.4+ 的 `:src` 等价于 `:src="src"`，不是无值布尔 attribute。',
    },
    { type: 'heading', content: 'v-model' },
    {
      type: 'text',
      content:
        '`v-model` 仅用于原生 `<input>`、`<textarea>`、`<select>` 与组件，并要求可写表达式。原生控件按类型选择 value / checked、input / change 和对应运行时指令，JavaScript 状态是初始真值来源。`.lazy` 改为 change 时同步，`.trim` 去首尾空白，`.number` 做宽松数值转换。',
    },
    {
      type: 'text',
      content:
        '组件 `v-model` 编译为 prop 与 `onUpdate:*` 写回协议，默认名称是 `modelValue` / `update:modelValue`，不会直接操作子组件 DOM。file input 的 value 不可由脚本写入，编译器拒绝对它使用 `v-model`，应监听 change 并读取 `files`。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '`.lazy` 不是防抖，`.trim` 不是通用净化，`.number` 也不保证结果始终为 number；无法解析的输入仍可能保留原字符串。',
    },
    { type: 'heading', content: 'v-slot' },
    {
      type: 'text',
      content:
        '`v-slot` 的参数是插槽名，省略时为 `default`；值是合法函数参数表达式，可以解构 slot props。它只允许用于 `<template>`，或在组件只有一个默认作用域插槽时直接用于组件。`#name` 是缩写，但单独的 `#` 没有合法含义。',
    },
    {
      type: 'text',
      content:
        '存在具名插槽时，默认插槽也应显式写为 `<template #default>`，不能混用组件自身 `v-slot` 与内部 `<template v-slot>` 两种形式。slot props 属于父级插槽函数的局部参数，不是写回子组件状态的隐式通道。',
    },
    { type: 'heading', content: 'v-pre' },
    {
      type: 'text',
      content:
        '`v-pre` 不接表达式，会跳过当前元素及整棵子树的 Vue 编译。内部插值保留为文字，指令形式的 attribute 变成普通 attribute，组件标签也按普通元素解析。它适合展示原始模板语法或极大的纯静态子树，不能包住仍需响应式或组件解析的区域。',
    },
    { type: 'heading', content: 'v-once' },
    {
      type: 'text',
      content:
        '`v-once` 不接表达式，首次渲染后缓存元素或组件的完整子树，后续父组件更新不再更新其中任何动态绑定。它只适合生命周期内确定永不变化的内容；与 `v-for` 同元素时会冻结首次生成的整段列表。',
    },
    { type: 'heading', content: 'v-memo' },
    {
      type: 'text',
      content:
        '`v-memo` 从 3.2 起可用，接收固定形状的依赖数组。依赖长度相同且每项均未变化时，Vue 复用缓存 VNode，跳过子树创建与 diff；空数组等同 `v-once`。比较不是深比较，对象依赖需要稳定引用，漏写依赖会直接得到陈旧 UI。',
    },
    {
      type: 'text',
      content:
        '它只用于已经测量的性能关键边际场景。配合 `v-for` 时必须和 `v-for`、`:key` 放在同一元素；key 已表达 item 身份后，memo 数组只覆盖决定子树是否更新的其他语义。',
    },
    { type: 'heading', content: 'v-cloak' },
    {
      type: 'text',
      content:
        '`v-cloak` 不接表达式，只处理无构建步骤的 DOM 模板在挂载前短暂显示插值的问题。它必须配合 `[v-cloak] { display: none }` 等 CSS，Vue 完成挂载后会从挂载容器移除该 attribute；SFC 模板通常不需要它，它也不会等待异步数据。',
    },
    {
      type: 'code',
      lang: 'html',
      content: `<style>
[v-cloak] {
  display: none;
}
</style>

<div id="app" v-cloak>{{ message }}</div>`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把不可信内容或 Vue 模板字符串交给 v-html',
          description:
            '`v-html` 直接写入 `innerHTML`，既不执行业务净化，也不会继续编译插值、事件、组件或 SFC scope attribute。',
          consequence:
            '不可信内容可能形成 XSS；模板字符串则会原样显示、丢失交互，并无法自动继承 scoped 样式。',
          wrong: {
            lang: 'vue',
            content: `<article v-html="route.query.preview" />
<section v-html="'<ProfileCard>{{ name }}</ProfileCard>'" />`,
          },
          correct: {
            lang: 'vue',
            content: `<article>{{ route.query.preview }}</article>
<ProfileCard>{{ name }}</ProfileCard>`,
          },
        },
        {
          title: '给 v-text 或 v-html 同时保留子内容',
          description: '两者设置完整 `textContent` / `innerHTML`，不会只替换元素中的一部分。',
          consequence: '静态前缀、fallback 或组件子树被覆盖，编译器还会报告子内容冲突。',
          wrong: {
            lang: 'vue',
            content: '<p v-text="message">状态：</p>',
          },
          correct: {
            lang: 'vue',
            content: '<p>状态：{{ message }}</p>',
          },
        },
        {
          title: '在 template 上使用 v-show，或期待隐藏时销毁组件',
          description: '`v-show` 需要真实元素的 display，并始终保留子树。',
          consequence: 'template 没有合法样式目标，隐藏后 timer、监听器和组件本地状态仍然存在。',
          wrong: {
            lang: 'vue',
            content: '<template v-show="open"><LivePanel /></template>',
          },
          correct: {
            lang: 'vue',
            content: '<LivePanel v-if="open" />',
          },
        },
        {
          title: '破坏条件分支邻接，或让 v-if 读取同元素的 v-for alias',
          description:
            '分支只能连接同一父级内紧邻的前一个条件分支；同时 `v-if` 早于 `v-for` 转换，循环作用域尚未建立。',
          consequence: '编译器会报告分支没有相邻 `v-if`，或因 alias 不存在而拒绝模板。',
          wrong: {
            lang: 'vue',
            content: `<p v-if="ready">完成</p>
<hr />
<p v-else>处理中</p>
<li v-for="todo in todos" v-if="!todo.done" :key="todo.id">{{ todo.text }}</li>`,
          },
          correct: {
            lang: 'vue',
            content: `<p v-if="ready">完成</p>
<p v-else>处理中</p>
<template v-for="todo in todos" :key="todo.id">
  <li v-if="!todo.done">{{ todo.text }}</li>
</template>`,
          },
        },
        {
          title: '用 index、对象或错误位置的 key 表达业务身份',
          description:
            'key 决定节点复用，index 会随重排改变归属，对象不是受支持的基础类型 key；template 块的 key 应在 template 上。',
          consequence: '输入值、组件本地状态或过渡状态可能跟到错误数据项。',
          wrong: {
            lang: 'vue',
            content: `<template v-for="(item, index) in items">
  <RowEditor :key="index" :item="item" />
</template>`,
          },
          correct: {
            lang: 'vue',
            content: `<template v-for="item in items" :key="item.id">
  <RowEditor :item="item" />
</template>`,
          },
        },
        {
          title: '误用 v-on 修饰符顺序、passive 或对象语法',
          description:
            '普通 guard 按模板顺序执行，passive 已声明不会阻止默认行为；无参数对象语法也不能给整张监听表应用修饰符。',
          consequence:
            '默认行为可能在错误来源上被阻止，浏览器发出警告，或对象监听器没有预期 guard。',
          wrong: {
            lang: 'vue',
            content: `<a @click.prevent.self="open" />
<div @touchmove.passive.prevent="track" />
<section v-on.stop="listeners" />`,
          },
          correct: {
            lang: 'vue',
            content: `<a @click.self.prevent="open" />
<div @touchmove.passive="track" />
<section @click.stop="listeners.click" @focus="listeners.focus" />`,
          },
        },
        {
          title: '误判布尔绑定类型，或忽略 v-bind 合并顺序',
          description:
            '非空字符串具有真值；对象展开与显式绑定则按模板出现顺序合并，普通同名值以后出现者为准。',
          consequence: '控件可能保持禁用，或外部 attrs 意外覆盖本地约束。',
          wrong: {
            lang: 'vue',
            content: `<button :disabled="'false'">保存</button>
<button :disabled="locked" v-bind="attrs">保存</button>`,
          },
          correct: {
            lang: 'vue',
            content: `<button :disabled="false">保存</button>
<button v-bind="attrs" :disabled="locked">保存</button>`,
          },
        },
        {
          title: '给 v-model 使用只读目标、静态初值或 file input',
          description:
            'model 需要可写表达式，JavaScript 状态又是原生控件的真值来源；file value 受浏览器安全边界保护。',
          consequence: '编译器可能拒绝模板、形成直接修改 prop 的错误数据流，或覆盖静态 DOM 初值。',
          wrong: {
            lang: 'vue',
            content: `<input v-model="props.title" />
<input v-model="accepted" type="checkbox" checked />
<input v-model="file" type="file" />`,
          },
          correct: {
            lang: 'vue',
            content: `<input :value="props.title" @input="emit('update:title', readValue($event))" />
<input v-model="accepted" type="checkbox" />
<input type="file" @change="readFiles" />`,
          },
        },
        {
          title: '混用组件级 v-slot 与内部 template 插槽声明',
          description: '两种声明会造成作用域归属歧义，普通元素也不是合法的 `v-slot` 宿主。',
          consequence: '编译器报告 mixed 或 misplaced slot usage，默认内容可能被忽略。',
          wrong: {
            lang: 'vue',
            content: `<DataPanel v-slot="defaultProps">
  <template #actions="actionProps">...</template>
</DataPanel>`,
          },
          correct: {
            lang: 'vue',
            content: `<DataPanel>
  <template #default="defaultProps">...</template>
  <template #actions="actionProps">...</template>
</DataPanel>`,
          },
        },
        {
          title: '把编译控制指令当作普通更新提示',
          description:
            '`v-pre` 跳过整棵子树编译，`v-once` 永久冻结，`v-memo` 只信显式依赖，`v-cloak` 只在挂载后移除 attribute。',
          consequence: '组件或插值变成文字，动态 UI 永久陈旧，或缺少 CSS 时仍然闪烁模板。',
          wrong: {
            lang: 'vue',
            content: `<section v-pre><LiveCounter /></section>
<p v-once>{{ changingMessage }}</p>
<article v-memo="[selected]">{{ selected }} {{ title }}</article>
<main id="app" v-cloak>{{ bootMessage }}</main>`,
          },
          correct: {
            lang: 'vue',
            content: `<code v-pre>{{ literalExample }}</code>
<p>{{ changingMessage }}</p>
<article v-memo="[selected, title]">{{ selected }} {{ title }}</article>
<style>[v-cloak] { display: none; }</style>
<main id="app" v-cloak>{{ bootMessage }}</main>`,
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'text',
      content:
        '以下结论来自 `vuejs/core@fa2885d8`，用于解释 Vue 3.5.40 的可观察行为；完整固定提交已列在官方来源中，AST 节点、patch flag、缓存槽位和 DOM 私有字段都不是 public API。',
    },
    {
      type: 'steps',
      items: [
        {
          title: '1. v-text 与 v-html 会替换完整子内容',
          content:
            '`transformVText()` 与 `transformVHtml()` 都先清空 AST children，再生成 `textContent` 或 `innerHTML` prop；所以它们不是可与现有 children 合并的普通文本绑定。',
        },
        {
          title: '2. v-html 的可信内容责任属于调用方',
          content:
            '`v-html` 最终进入 `patchDOMProp()` 的 unsafe innerHTML 分支。Trusted Types 转换并不提供业务净化，适合可信富文本，不适合直接展示任意外部输入。',
        },
        {
          title: '3. v-show 隐藏不会卸载',
          content:
            '`v-show` 保留运行时 directive，记录元素原 display 并切换 `display: none`；存在 transition 时还会走 persisted 过渡，因此适合需要保留 DOM 或组件状态的高频显隐。',
        },
        {
          title: '4. 条件分支依靠编译期邻接和身份',
          content:
            '`transformIf()` 把相邻分支合为 IF AST，忽略空白与注释，并给不同分支注入不同 key。普通节点会终止查找，相同显式 key 也会产生诊断。',
        },
        {
          title: '5. v-for 的 key 决定节点复用',
          content:
            '`transformFor()` 按稳定性与 key 生成 stable、keyed 或 unkeyed fragment；`renderList()` 分别处理数组、字符串、正整数、Iterable 与对象。key 是身份，不会作为普通 prop 自动传入组件。',
        },
        {
          title: '6. v-on 的修饰符顺序具有语义',
          content:
            '`transformOn()` 区分方法路径与内联语句，DOM 扩展再把 modifier 分为 runtime guard、key guard 和 listener option；`withModifiers()` 按数组顺序执行 guard。',
        },
        {
          title: '7. DOM 事件处理器可在稳定 invoker 上更新',
          content:
            '`patchEvent()` 更新现有 invoker 的 value，不必每次移除再添加 listener；`.once`、`.passive`、`.capture` 由事件 prop 后缀解析为原生 options，业务代码不应读取 invoker 私有字段。',
        },
        {
          title: '8. 对象绑定与强制写入走不同路径',
          content:
            '无参数 `v-bind` / `v-on` 分别走 `mergeProps()` / `toHandlers()`；`.prop` 与 `.attr` 编码为特殊前缀后由 `patchProp()` 强制选择 property 或 attribute。',
        },
        {
          title: '9. 组件与原生 v-model 共享语法但协议不同',
          content:
            '通用转换先验证表达式可写，并给组件生成 model prop 与 update handler；DOM 编译器再按 input、textarea、select 选择运行时 directive。适合用组件协议封装输入，不应假定它直接读写 DOM。',
        },
        {
          title: '10. 原生 v-model 保留控件差异',
          content:
            '`vModelText` 在输入法组合期间暂停写回；checkbox 与 select 会按 Array 或 Set 克隆集合；file input 在编译期直接报错。`_assign` 等内部字段不可作为扩展接口。',
        },
        {
          title: '11. v-slot 会被编译成带作用域的函数',
          content:
            '`buildSlots()` 把 slot props 变成函数参数，并把条件、循环、动态名称或外部作用域依赖标记为动态 slot；混用两种声明形式会进入明确错误分支。',
        },
        {
          title: '12. v-pre 的编译跳过严格限制在当前子树',
          content:
            'parser 进入 `v-pre` 后把指令 token 当普通 attribute、把插值当文本，并在当前元素边界退出；它不会影响后续兄弟节点，但也不能选择性保留子树内的 Vue 语法。',
        },
        {
          title: '13. v-once 是整棵子树的一次性缓存',
          content:
            '`transformOnce()` 把完整 codegen node 放入 render cache 并配合 block tracking；这不是降低更新频率，嵌套 `v-once` 也不会得到多层独立缓存。',
        },
        {
          title: '14. v-memo 比较固定形状的浅依赖',
          content:
            '`withMemo()` 先比较依赖数组长度，再逐项按 Vue 的变化判断并保存浅快照；`v-for` 会同时核对缓存 key 与 memo，因此 memo 必须和循环位于同一元素。',
        },
        {
          title: '15. v-cloak 的隐藏效果来自 CSS',
          content:
            '`v-cloak` 在 compiler-dom 中是 noop，DOM app 完成 mount 后才移除挂载容器上的 attribute。CSS 决定挂载前是否隐藏，它不会自动等待请求或异步组件。',
        },
      ],
    },
  ],
  notes: [
    '本页不提供独立 Demo；模板语法、条件列表、事件、表单、插槽与性能练习复用相关课程。',
    '源码推导只解释 Vue 3.5.40 的可观察行为，不承诺内部编译器与运行时字段稳定。',
  ],
})
