# Vue Core API 第 39 批：SFC CSS 与渲染辅助官方调研

> 核对日期：2026-08-03
>
> 版本基线：`vue@3.5.40`（固定提交
> `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`）
>
> 范围：仅 Vue Core Reference 的 3 项 SFC CSS 与 5 项渲染辅助，不进入第 40 批

## 冻结结论

本批新增一篇 SFC CSS 合并页，并在现有“渲染函数与 h()”页面补充 5 个独立 API heading。
不新增 Demo、动画、依赖或 CSS 实现；页面中的 CSS 只作为代码示范，因此不改变站点样式。

| 宿主 | 站内 ID | collection | 本批条目 |
| --- | --- | --- | ---: |
| SFC CSS | `vue.core.reference.single-file-component.css-features` | `single-file-component` | 3 |
| 渲染函数 | `vue.core.reference.advanced.render-function` | `advanced` | 5 |

完成后预期为 `181 available / 25 planned / 206 total`。第 40 批 12 项必须继续为 `planned`
且没有 target。

## 条目与锚点映射

| Manifest id | heading | 官方 fragment | 站内 anchor | 目标 entry |
| --- | --- | --- | --- | --- |
| `sfc-css-features.scoped-css` | `组件作用域 CSS` | `scoped-css` | `组件作用域-css` | `vue.core.reference.single-file-component.css-features` |
| `sfc-css-features.css-modules` | `CSS Modules` | `css-modules` | `css-modules` | `vue.core.reference.single-file-component.css-features` |
| `sfc-css-features.v-bind-in-css` | `CSS 中的 v-bind()` | `v-bind-in-css` | `css-中的-v-bind` | `vue.core.reference.single-file-component.css-features` |
| `render-function.merge-props` | `mergeProps()` | `mergeprops` | `mergeprops` | `vue.core.reference.advanced.render-function` |
| `render-function.clone-vnode` | `cloneVNode()` | `clonevnode` | `clonevnode` | `vue.core.reference.advanced.render-function` |
| `render-function.is-vnode` | `isVNode()` | `isvnode` | `isvnode` | `vue.core.reference.advanced.render-function` |
| `render-function.resolve-directive` | `resolveDirective()` | `resolvedirective` | `resolvedirective` | `vue.core.reference.advanced.render-function` |
| `render-function.with-directives` | `withDirectives()` | `withdirectives` | `withdirectives` | `vue.core.reference.advanced.render-function` |

## 官方来源

- [SFC CSS 功能](https://cn.vuejs.org/api/sfc-css-features.html)：scoped selector、`:deep()`、
  `:slotted()`、`:global()`、子组件根节点、CSS Modules、`useCssModule()` 与 CSS `v-bind()`。
- [渲染函数 API](https://cn.vuejs.org/api/render-function.html)：5 个 helper 的公开签名、合并规则、
  VNode 不可变约束、资源解析上下文和指令元组。
- [`pluginScoped.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/style/pluginScoped.ts)、
  [`compileStyle.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileStyle.ts)：
  scope attribute 注入、deep / slotted / global 转换与弃用组合器诊断。
- [`cssVars.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/style/cssVars.ts)、
  [`useCssModule.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/useCssModule.ts)：
  CSS `v-bind()` 表达式提取、变量名生成与 CSS Module 运行时访问。
- [`vnode.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/vnode.ts)：
  `mergeProps()`、`cloneVNode()`、`isVNode()` 的固定实现。
- [`resolveAssets.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/resolveAssets.ts)、
  [`directives.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/directives.ts)：
  指令资源解析、渲染实例边界、元组归一化与绑定记录。
- [`compileStyle.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileStyle.spec.ts)、
  [`cssVars.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/cssVars.spec.ts)、
  [`vnode.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/vnode.spec.ts)、
  [`directives.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/directives.spec.ts)：
  编译输出和运行时边界的固定回归证据。

Tavily 只用于抽取上述官方来源。一次搜索发现旧路径 `packages/compiler-sfc/src/cssVars.ts` 在固定
提交不存在，已纠正为真实的 `packages/compiler-sfc/src/style/cssVars.ts`，不保留 404 链接。

## 8 项公开语义

### 组件作用域 CSS

`<style scoped>` 由 SFC 编译器把选择器改写为带组件 scope attribute 的选择器，而不是使用
Shadow DOM。子组件根节点会同时受父、子 scope 影响，便于父组件布局子根；子组件内部后代默认
不受父作用域规则影响。深层目标用 `:deep()`，插槽内容用 `:slotted()`，单条全局规则用
`:global()`。`v-html` 生成内容不经过模板编译，只有显式 deep 选择器可能命中。

### CSS Modules

`<style module>` 将 class 名映射对象注入组件，模板默认通过 `$style.red` 访问；
`module="classes"` 可自定义注入名。setup 逻辑需要对象时导入 `useCssModule()`，参数必须匹配
自定义 module 名。它是构建能力，class 字符串不应被业务逻辑当作稳定公共标识。

### CSS 中的 `v-bind()`

SFC style 中的 `v-bind(expr)` 会编译为哈希化 CSS 自定义属性，值通过组件根元素内联样式响应式
更新，CSS 规则本身保持静态。简单标识符可直接写；成员访问等 JavaScript 表达式必须放进引号，
例如 `v-bind('theme.color')`。这不是浏览器原生 CSS `var()` 的替代语法，离开 SFC 编译器无效。

### `mergeProps()`

`mergeProps(...args)` 专门归一化并合并 `class`、`style` 与 `onXxx` 监听器；同名监听器合并为
数组，其余 props 后值覆盖前值。不需要这些语义时使用对象展开更直观。不要先展开再传给
`mergeProps()`，否则已经丢失的同名值无法恢复。

### `cloneVNode()`

VNode 创建后视为不可变渲染描述，不能直接改 `vnode.props`。`cloneVNode(vnode, extraProps)`
复制 VNode 内部字段并按 VNode 规则合并额外 props。它适合包装器向既有 VNode 添加属性，不适合
把同一 VNode 在一个树中复制多次后继续共享可变引用。

### `isVNode()`

`isVNode(value)` 判断未知值是否带 Vue VNode 标记，可用于渲染工具的输入分支。它只证明该值是
VNode，不证明其来源可信、仍未挂载、type 符合业务约束，或适合跨应用复用。

### `resolveDirective()`

`resolveDirective(name)` 按当前组件的局部与应用级注册表解析指令，只能在 `setup()` 或 render
期间调用；解析不到返回 `undefined` 并在开发环境警告。能直接 import 指令时优先 import，避免
字符串名称和隐式注册依赖。

### `withDirectives()`

`withDirectives(vnode, tuples)` 为 VNode 添加指令绑定。元组顺序为
`[directive, value, argument, modifiers]`，后三项按需省略；必须在 render 上下文调用。函数式指令
会归一化为 `mounted` 与 `updated`。解析结果可能为 undefined，不能把失败结果当成有效指令。

## 结构化易错点候选

### 1. 把 scoped 当作 Shadow DOM 或绝对隔离

- 原因：作用域来自 selector attribute 改写，子根、deep 和全局规则仍有明确穿透边界。
- 后果：父布局意外影响子根，或期待样式自动命中子内部与 `v-html` 内容却无效果。
- 错误：`.dialog .title { ... }` 期待跨过子组件边界。
- 正确：只在确有所有权时用 `.dialog :deep(.title) { ... }`，公共契约优先 class / prop。

### 2. 使用弃用的深度组合器或高成本后代选择器

- 原因：`>>>`、`/deep/` 已弃用；作用域 attribute 还会增加选择器匹配成本。
- 后果：编译警告、预处理器解析失败，或大量后代节点匹配变慢。
- 错误：`.panel >>> p { ... }`。
- 正确：`.panel :deep(.content) { ... }`，并优先 class 而不是裸元素后代。

### 3. 把 CSS Module 哈希名当成稳定业务 ID

- 原因：class 输出由构建配置生成，`module` 注入名与 class map 也必须匹配。
- 后果：硬编码字符串在构建变化后失效，`useCssModule('classes')` 名称不匹配时取不到映射。
- 错误：`document.querySelector('.red_ab12')`。
- 正确：模板使用 `$style.red`，脚本使用 `useCssModule()` 返回对象。

### 4. 在 CSS v-bind 中漏掉复杂表达式引号

- 原因：成员访问需要作为 SFC 表达式整体解析，编译器再生成 CSS 自定义属性。
- 后果：style 编译失败或生成错误变量引用。
- 错误：`color: v-bind(theme.color);`。
- 正确：`color: v-bind('theme.color');`。

### 5. 用对象展开代替 mergeProps 后期待 class/listener 合并

- 原因：对象展开会先覆盖同名字段，无法保留多个监听器或归一化 class/style。
- 后果：前一个事件处理器丢失，class 或 style 形态错误。
- 错误：`{ ...base, ...incoming }` 后再 `mergeProps(result)`。
- 正确：`mergeProps(base, incoming)`。

### 6. 直接修改或重复使用既有 VNode

- 原因：VNode 含 patch、scope、ref 等内部状态，不是普通可变对象。
- 后果：复用路径依赖内部隐式克隆，ref 与 patch 行为不可预测。
- 错误：`vnode.props!.id = 'next'`。
- 正确：`cloneVNode(vnode, { id: 'next' })`；同树重复节点由工厂分别创建。

### 7. 把 isVNode 当成完整业务验证

- 原因：它只检查 Vue 的 VNode 标记。
- 后果：错误 type、已复用 VNode 或不受信来源仍进入渲染流程。
- 错误：`if (isVNode(input)) return input` 后跳过所有业务约束。
- 正确：先用 `isVNode()` 分流，再校验允许的 type 与调用方契约。

### 8. 在 render 上下文外解析或附加指令

- 原因：资源解析和 binding instance 都依赖 current rendering instance。
- 后果：解析得到 undefined，`withDirectives()` 警告并原样返回 VNode，钩子不执行。
- 错误：模块顶层调用 `resolveDirective('focus')`。
- 正确：在 setup 返回的渲染函数中解析并调用 `withDirectives()`。

### 9. 写错指令元组位置或忽略解析失败

- 原因：第三项是 argument，第四项才是 modifiers；`resolveDirective()` 返回值可为 undefined。
- 后果：修饰符被当作参数，或页面静默缺少指令行为。
- 错误：`[dir, value, { lazy: true }]`。
- 正确：先确认注册契约，再写 `[dir, value, undefined, { lazy: true }]`。

## 源码推导与适用场景

1. `pluginScoped.ts` 将 scope attribute 注入 selector，并为 deep / slotted / global 选择器切换
   注入位置；scoped 适合组件边界，不是安全隔离。
2. 同一插件会把 `>>>` 与 `/deep/` 归一为空格并警告；新内容只应教学 `:deep()`。
3. `vnode.ts` 的 `slotScopeIds` 与 scopeId 注释说明插槽和子根还有运行时传播，不能只从编译后的
   单个 selector 推断完整边界。
4. `style/cssVars.ts` 提取 `v-bind()` 表达式并生成变量名；动态值适合主题 token，不适合拼接
   selector、媒体查询或其他自定义属性不能承载的位置。
5. `useCssModule.ts` 从当前实例类型的 CSS module 表取映射；它适合 setup 内组合 class，不适合
   模块顶层或无 SFC module 注入的环境。
6. `mergeProps()` 只对 class、style、事件监听器执行专门归一化，其余 key 后值覆盖；多来源
   props 组合时使用，简单覆盖仍用对象展开。
7. `cloneVNode()` 会处理 key、ref、scopeId、patchFlag、transition 等内部字段；包装现有 VNode
   应克隆，而不是 object spread。
8. `isVNode()` 读取内部 VNode 标记并返回 boolean；它适合未知 children 的快速分支，不提升为
   业务类型或安全边界。
9. `resolveAssets.ts` 从 current rendering instance / component registry 解析名称；可直接 import
   时更适合显式依赖，插件式注册才需要字符串解析。
10. `directives.ts` 在无 current rendering instance 时警告并返回原 VNode；指令绑定构造必须留在
    render 路径。
11. 同一文件把函数指令扩展为 mounted / updated，并在 `deep` 指令上遍历 value；函数简写适合
    两个同行为钩子，复杂生命周期和大对象深遍历需要显式对象指令。

## 实施验收与第 40 批停止边界

1. 新增一篇 `css-features` Reference，并扩展现有 `render-function` 页面；两页合计保留 8 个唯一
   heading / anchor，不新增 Demo 或依赖。
2. CSS 页至少包含 4 个 CSS 专属结构化易错点与 5 条固定源码推导；渲染页在已有内容基础上为
   5 个新增 API 加入至少 5 个针对性易错点与 6 条固定源码推导，不删除旧 h() 内容。
3. 8 项完成后机器统计应为 `181 / 25 / 206`，第 40 批 12 项仍为 `planned` 且无 target。
4. 运行定向测试、全量 Vitest、type-check、lint、format-check、build 与 whitespace Gate；390px
   smoke 核对新 CSS 页、扩展渲染页、8 个 heading、跨 collection 滚动归零与零控制台错误。
5. Standards / Spec 未达到 `PASS / 0 finding` 前不得开始第 40 批；不进入 TypeScript 工具类型、
   编译标志、平台边界、Vue Router、Pinia 或 React。
