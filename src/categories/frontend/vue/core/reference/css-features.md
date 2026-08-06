---
id: vue.core.reference.single-file-component.css-features
type: reference
title: 单文件组件 CSS 功能
summary: 查询 scoped selector、CSS Modules 与响应式 CSS v-bind() 的编译边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.single-file-component.syntax
  - vue.core.reference.single-file-component.script-setup
  - vue.core.learn.basics.sfc-basics
  - vue.core.learn.basics.reactive-state
tags:
  - SFC CSS
  - scoped
  - deep
  - slotted
  - global
  - CSS Modules
  - v-bind
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue SFC CSS 功能
    url: https://cn.vuejs.org/api/sfc-css-features.html
  - title: Vue 3.5.40 scoped selector 转换
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/style/pluginScoped.ts
  - title: Vue 3.5.40 style 编译入口
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/compileStyle.ts
  - title: Vue 3.5.40 CSS 变量转换
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/src/style/cssVars.ts
  - title: Vue 3.5.40 CSS Module 运行时辅助
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/useCssModule.ts
  - title: Vue 3.5.40 style 编译测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/compileStyle.spec.ts
  - title: Vue 3.5.40 CSS 变量测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/compiler-sfc/__tests__/cssVars.spec.ts
group: single-file-component
signature: |-
  <style scoped>...</style>
  <style module>...</style>
  <style>.text { color: v-bind('theme.color'); }</style>
anchors:
  - 组件作用域 CSS
  - CSS Modules
  - CSS 中的 v-bind()
  - 易错使用提示
  - 源码推导与适用场景
---

# 单文件组件 CSS 功能

## 组件作用域 CSS

`<style scoped>` 由 SFC 编译器把选择器改写为带组件 scope attribute 的选择器，不会创建 Shadow DOM。子组件根节点会同时受父、子 scope 影响，便于父组件控制子根布局；子组件内部后代默认不受父作用域规则影响。

| 选择器 | 目标 | 边界 |
| --- | --- | --- |
| `:deep(.child)` | 子组件或动态内容的后代 | 显式穿过当前 scope 边界 |
| `:slotted(.item)` | 由当前组件插槽接收的内容 | 插槽节点仍由父组件拥有 |
| `:global(.utility)` | 单条全局规则 | 不注入当前组件 scope attribute |

:::warning
`v-html` 生成的节点没有经过模板 scope 标记，普通 scoped selector 不会自动命中；只有明确的 deep 规则可能影响它。动态 HTML 仍必须先解决不可信内容安全问题。
:::

## CSS Modules

`<style module>` 将局部 class 映射对象注入组件，模板默认通过 `$style.red` 访问。`module="classes"` 可自定义注入名；setup 逻辑则从 `vue` 导入 `useCssModule()`，参数必须与自定义 module 名一致。

~~~~vue
<script setup lang="ts">
import { useCssModule } from 'vue'
const classes = useCssModule('classes')
</script>

<template><p :class="classes.highlight">重点</p></template>

<style module="classes">
.highlight { font-weight: 700; }
</style>
~~~~

:::tip
生成的 class 字符串属于构建产物，不是稳定业务 ID。测试和 DOM 查询应使用语义属性、role 或组件公开契约，不要硬编码哈希 class。
:::

## CSS 中的 v-bind()

SFC style 中的 `v-bind(expr)` 会编译为哈希化 CSS 自定义属性，值通过组件根元素内联样式响应式更新，CSS 规则本身保持静态。简单标识符可直接写，成员访问等 JavaScript 表达式必须放进引号。

~~~~vue
<script setup lang="ts">
import { reactive } from 'vue'
const theme = reactive({ color: '#0071e3' })
</script>

<style scoped>
.title { color: v-bind('theme.color'); }
</style>
~~~~

:::warning
`v-bind()` 是 SFC 编译期语法，不是浏览器原生 CSS 函数，也不能用于 selector、媒体查询等 CSS 自定义属性无法表达的位置。普通 CSS 文件应使用标准 `var(--token)` 和显式变量来源。
:::

## 易错使用提示

:::pitfalls
### 把 scoped 当成 Shadow DOM 或绝对隔离

**触发条件：** 把 scoped 当成 Shadow DOM 或绝对隔离

**原因：** 作用域来自 selector attribute 改写，子组件根节点、deep 与 global 仍有明确穿透边界。

**后果：** 父布局意外影响子根，或期待样式自动命中子内部与动态 HTML 却无效果。

**错误示例：**

~~~~css
.dialog .title { color: red; }
~~~~

**正确写法：**

~~~~css
.dialog :deep(.title) { color: red; }
~~~~

**验证方式：** 对照正确写法验证结果。

### 使用弃用深度组合器或高成本裸元素后代

**触发条件：** 使用弃用深度组合器或高成本裸元素后代

**原因：** `>>>` 与 `/deep/` 已弃用，scope attribute 还会增加后代选择器匹配成本。

**后果：** 出现编译警告、预处理器解析失败，或大量后代节点匹配变慢。

**错误示例：**

~~~~css
.panel >>> p { color: red; }
~~~~

**正确写法：**

~~~~css
.panel :deep(.content) { color: red; }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 CSS Module 哈希 class 当成稳定业务标识

**触发条件：** 把 CSS Module 哈希 class 当成稳定业务标识

**原因：** class 输出由构建配置生成，module 注入名也必须与 useCssModule 参数一致。

**后果：** 硬编码选择器在构建变化后失效，名称不匹配时也取不到 class map。

**错误示例：**

~~~~js
document.querySelector('.highlight_ab12')
~~~~

**正确写法：**

~~~~vue
<p :class="$style.highlight" data-testid="highlight">重点</p>
~~~~

**验证方式：** 对照正确写法验证结果。

### CSS v-bind 复杂表达式漏掉引号

**触发条件：** CSS v-bind 复杂表达式漏掉引号

**原因：** 成员访问需要作为完整 SFC 表达式解析，再生成 CSS 自定义属性。

**后果：** style 编译失败，或产生错误的变量引用。

**错误示例：**

~~~~css
.title { color: v-bind(theme.color); }
~~~~

**正确写法：**

~~~~css
.title { color: v-bind('theme.color'); }
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. scoped 是 selector 转换而非运行时容器

`pluginScoped.ts` 将 scope attribute 注入 selector，并按 deep / slotted / global 调整注入位置。它适合组件样式边界，不是安全隔离或 Shadow DOM 替代。

### 2. 弃用深度组合器会被转换并警告

同一插件把 `>>>` 与 `/deep/` 归一为空格并发出警告，固定测试覆盖生成选择器。新内容应只使用 `:deep()`。

### 3. 插槽与子根还有运行时 scope 传播

`vnode.ts` 的 scopeId / slotScopeIds 记录 SFC scope 与插槽作用域。不能只观察一条编译后 selector 就推断跨组件完整行为。

### 4. CSS v-bind 生成静态规则与动态自定义属性

`style/cssVars.ts` 提取表达式并生成变量名，组件运行时再更新根元素自定义属性。它适合动态 token，不适合 selector 或媒体条件。

### 5. CSS Module 映射来自当前组件类型

`useCssModule.ts` 从当前实例的 CSS module 表读取指定映射；它适合 setup 内组合 class，不适合模块顶层或没有 `<style module>` 注入的环境。
:::
