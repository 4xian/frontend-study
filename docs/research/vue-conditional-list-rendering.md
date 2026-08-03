# Vue Core 基础课程：条件渲染与列表渲染调研

> 调研日期：2026-07-29
>
> 适用基线：Vue 3.5.40。
>
> 资料范围：Vue 中文官网与 `vuejs/core` 的 `v3.5.40` 固定标签源码。外部资料通过
> Tavily 检索和提取，所有教学结论均回到官方页面或源码核验。

## 课程边界

本课承接“模板语法”中的最小 `v-if`、`v-for` 示例，回答以下问题：怎样组织完整条件
分支、怎样选择 `v-if` 或 `v-show`、怎样遍历数组和对象，以及为什么列表项需要稳定
`key`。本课不展开响应式原理、组件通信、完整虚拟 DOM 算法或 `TransitionGroup`。

交互 Demo 可以用少量 `ref()` 和 `computed()` 作为实验控制器，但正文只解释它们产生的
状态结果；这些 API 的系统用法仍由后续“响应式状态”和“计算属性”课程负责。

## 适合新手的知识顺序

### 1. 先建立条件分支链

- `v-if` 只在表达式为真值时渲染对应内容。
- `v-else-if` 和 `v-else` 必须紧跟前一个 `v-if` 或 `v-else-if` 兄弟节点。
- 多个根节点需要共同切换时，把条件放在不会输出真实 DOM 的 `<template>` 上。

**来源：** [Vue 条件渲染](https://cn.vuejs.org/guide/essentials/conditional.html)、
[Vue 内置指令](https://cn.vuejs.org/api/built-in-directives.html)。

### 2. 再比较 v-if 与 v-show

- `v-if` 是真实条件渲染。初始为假时不会创建分支，切换时会销毁和重建内容。
- `v-show` 始终创建元素，只切换内联 `display`，适合需要频繁显隐或保留同一 DOM 的场景。
- `v-show` 不支持 `<template>`，也不能与 `v-else` 组成分支链。

**来源：** [Vue 条件渲染：v-if 与 v-show](https://cn.vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)、
[`vShow.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vShow.ts)。

### 3. 从数组列表进入 v-for

- `item in items` 与 `item of items` 都可使用，团队应保持一种稳定写法。
- 第二个别名是数组索引，例如 `(item, index) in items`。
- `<template v-for>` 可以让一次迭代输出多个相邻节点。

**来源：** [Vue 列表渲染](https://cn.vuejs.org/guide/essentials/list.html)、
[Vue 内置指令：v-for](https://cn.vuejs.org/api/built-in-directives.html#v-for)。

### 4. 补充对象与整数范围

- 对象遍历别名依次为 `(value, key, index)`，顺序基于 `Object.values()` 的枚举顺序。
- `n in 5` 得到 `1, 2, 3, 4, 5`，不是从零开始。
- 这些能力适合小型说明列表；核心业务数据仍应优先使用有稳定 ID 的数组记录。

**来源：** [Vue 列表渲染：对象与范围值](https://cn.vuejs.org/guide/essentials/list.html#v-for-with-an-object)。

### 5. 最后建立 key 的身份模型

- `key` 是虚拟 DOM 比较时识别 vnode 的身份提示，公开类型为 `number | string | symbol`。
- 同一父节点下的 `key` 必须唯一。过滤、插入或重排列表时应使用记录的稳定 ID。
- `<template v-for>` 的 `key` 应写在 `<template>` 本身，而不是内部某个子节点。

**来源：** [Vue 列表渲染：通过 key 管理状态](https://cn.vuejs.org/guide/essentials/list.html#maintaining-state-with-key)、
[Vue 内置特殊 attribute：key](https://cn.vuejs.org/api/built-in-special-attributes.html#key)。

## 真实常见易错点

### 1. 在同一个元素上同时写 v-if 与 v-for

- **原因：** `v-if` 的优先级高于 `v-for`，条件表达式还不能访问循环别名。
- **后果：** 使用 `item` 的条件会报未定义；即使条件只读外部状态，结构意图也难以理解。
- **错误方向：** `<li v-for="todo in todos" v-if="!todo.done">`。
- **正确方向：** 用 `computed()` 先得到过滤结果，或由外层 `<template v-for>` 建立循环作用域。

### 2. 对会重排的列表使用索引 key

- **原因：** 索引表示当前位置，而不是数据记录身份。
- **后果：** 插入、过滤和反转后，未受控输入值、焦点或子组件局部状态可能留在错误记录上。
- **错误方向：** `:key="index"`。
- **正确方向：** `:key="lesson.id"`。

### 3. 使用重复、随机、可变或对象 key

- **原因：** keyed diff 需要稳定的一对一映射；随机值每次渲染都会改变，对象重建后引用也会改变。
- **后果：** 重复 key 会产生警告和异常复用；随机 key 会强制销毁并重建节点。
- **错误方向：** `:key="Math.random()"`、`:key="item"` 或多个项目共享同一 key。
- **正确方向：** 使用后端 ID、稳定 slug 等字符串或数字字段。

### 4. 把 template v-for 的 key 放到内部元素

- **原因：** 一次迭代的身份属于整个 fragment，而不是 fragment 中任意一个孩子。
- **后果：** 编译器会提示 key 位置错误，多节点整体移动时也无法获得正确身份。
- **错误方向：** `<template v-for="item in items"><li :key="item.id">...</li></template>`。
- **正确方向：** `<template v-for="item in items" :key="item.id">...</template>`。

### 5. 在 template 上使用 v-show 或把它与 v-else 组合

- **原因：** `v-show` 通过真实元素的 `style.display` 工作，`<template>` 没有可设置的 DOM 样式。
- **后果：** 多节点不会按预期隐藏，`v-else` 也无法形成有效分支链。
- **错误方向：** `<template v-show="open">` 或 `<p v-show="open">...<p v-else>`。
- **正确方向：** 多节点切换用 `<template v-if>`；单个频繁切换元素用 `v-show`。

### 6. 让 v-else 与条件分支失去相邻关系

- **原因：** `v-else` 和 `v-else-if` 只识别紧邻的前一个条件兄弟节点。
- **后果：** 分支不会被识别，开发环境会报告缺少相邻 `v-if`。
- **错误方向：** 在 `v-if` 与 `v-else` 之间插入普通元素。
- **正确方向：** 保持分支连续，额外说明放进各分支内部。

### 7. 记错对象别名顺序或整数范围起点

- **原因：** 对象的第二、第三别名分别是 key 和 index；整数范围从 1 开始。
- **后果：** 页面把索引误当属性名，或产生多一位、少一位的编号错误。
- **错误方向：** `(value, index, key)`、把 `n in 5` 当成 `0...4`。
- **正确方向：** 明确写 `(value, key, index)`，需要零起点时展示 `n - 1`。

## 从编译与渲染实现推导使用场景

### 1. 低频或初始不显示的内容优先 v-if

`vIf.ts` 把分支编译为条件表达式，未命中侧使用注释 vnode 占位；真实分支按需创建，并被
转换为 block、注入分支 key。初始为假且可能永远不打开的昂贵内容不必先创建。

### 2. 高频显隐或保留 DOM 状态时使用 v-show

`vShow.ts` 保存元素原始 `display`，并在原值与 `none` 之间切换。节点不会因显隐而销毁，
因此用户在未受控输入框中的临时输入等 DOM 状态可以继续保留。

### 3. 把 key 当作身份契约

`isSameVNodeType()` 同时比较 vnode 的 `type` 与 `key`。`renderer.ts` 的 keyed diff 会建立
`key -> newIndex` 映射，所以稳定 key 允许记录连同其 DOM 和组件状态一起移动。

### 4. 编译优化不能修复错误身份

`vFor.ts` 会根据来源与 key 生成 `STABLE_FRAGMENT`、`KEYED_FRAGMENT` 或
`UNKEYED_FRAGMENT`；block 与 patch flag 可以减少稳定子树比较，但无法修正索引、随机或
重复 key 带来的业务身份错误。

## Demo 建议

使用单一同源 SFC：

1. 上半区并排展示 `v-if` 与 `v-show`，各放一个未绑定 `v-model` 的输入框。输入内容后隐藏再
   显示，观察 `v-if` 重建节点而 `v-show` 保留同一 DOM。
2. 下半区使用 `computed()` 过滤课程记录并支持反转顺序，每行用 `lesson.id` 作为 key，保留
   一个行内临时输入框，让用户观察 DOM 状态随记录移动。
3. 明确说明：记录被过滤移出列表后仍会卸载，稳定 key 不等于缓存已删除节点。

## 站内关联

- `vue.core.learn.basics.template-syntax`
- `vue.core.learn.basics.reactive-state`
- `vue.core.reference.reactivity-watchers.computed`
- `vue.core.reference.advanced.render-function`

## 固定源码来源

- [`vIf.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vIf.ts)
- [`vFor.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vFor.ts)
- [`renderList.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderList.ts)
- [`vnode.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts)
- [`renderer.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)
- [`vShow.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vShow.ts)
- [`patchFlags.ts` 3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/shared/src/patchFlags.ts)
