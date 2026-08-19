---
id: vue.core.learn.basics.conditional-list-rendering
type: lesson
title: 条件渲染与列表渲染
summary: 组织完整条件分支与数据列表，并用稳定 key 保持界面状态和数据身份一致
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.basics.template-syntax
  - vue.core.learn.basics.reactive-state
  - vue.core.reference.reactivity-watchers.computed
  - vue.core.reference.advanced.render-function
tags:
  - v-if
  - v-show
  - v-for
  - key
  - 条件渲染
  - 列表渲染
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 条件渲染
    url: https://cn.vuejs.org/guide/essentials/conditional.html
  - title: Vue 列表渲染
    url: https://cn.vuejs.org/guide/essentials/list.html
  - title: Vue 内置指令
    url: https://cn.vuejs.org/api/built-in-directives.html
  - title: Vue 内置特殊 attribute：key
    url: https://cn.vuejs.org/api/built-in-special-attributes.html#key
  - title: Vue 3.5.40 v-if 编译源码
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vIf.ts
  - title: Vue 3.5.40 v-for 编译源码
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vFor.ts
  - title: Vue 3.5.40 渲染器源码
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts
  - title: Vue 3.5.40 vnode 身份比较源码
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts
  - title: Vue 3.5.40 v-show 运行时源码
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/directives/vShow.ts
stage: basics
level: beginner
estimatedMinutes: 30
prerequisites:
  - vue.core.learn.basics.template-syntax
objectives:
  - 用 v-if、v-else-if、v-else 和 template 组织清晰的条件分支
  - 使用 v-for 遍历数组、对象和整数范围，并说清每个别名的含义
  - 把 key 当作列表项的稳定身份，在过滤和重排时保持 DOM 状态正确对应
recap:
  - v-if 负责真实条件分支，v-show 通过 display 保留并隐藏同一 DOM。
  - v-for 可以遍历数组、对象和整数范围，template 可以为一次迭代输出多个节点。
  - 稳定且唯一的 key 表示数据身份，过滤和重排时不要使用索引、随机值或对象。
  - 条件与列表应分层表达：先派生数据或控制容器，不在同一元素混用 v-if 与 v-for。
---

# 条件渲染与列表渲染

## 一、从最小语法继续

上一课已经用静态数据体验过最小的 `v-if` 和 `v-for`。这节课不再停留在“能显示出来”，而是学习怎样组织完整分支、怎样选择显隐策略，以及列表更新时 Vue 如何判断“这还是不是同一项”。

## 二、组织完整条件分支

`v-if`、`v-else-if` 与 `v-else` 组成一条连续分支链。Vue 从上到下判断，命中第一项后停止；`v-else-if` 和 `v-else` 必须紧跟前一个条件兄弟节点。

~~~~vue
<script setup lang="ts">
const progress = 72
</script>

<template>
  <p v-if="progress >= 100">课程已完成</p>
  <p v-else-if="progress > 0">学习进度：{{ progress }}%</p>
  <p v-else>还没有开始学习</p>
</template>
~~~~

条件值可以是任何表达式，但模板只负责读取结果。复杂判断应先在脚本中得到有意义的布尔值，避免把业务规则塞进很长的指令表达式。

## 三、用 template 切换多个节点

需要让标题、说明和操作区一起出现时，可以把 `v-if` 放在 `<template>` 上。它只提供分组边界，最终 DOM 中不会多出这个包装元素。

~~~~vue
<template>
  <template v-if="courseReady">
    <h2>条件渲染课程</h2>
    <p>课程资料已经准备完成。</p>
  </template>
  <p v-else>正在准备课程...</p>
</template>
~~~~

## 四、选择 v-if 还是 v-show

| 比较项 | v-if | v-show |
| --- | --- | --- |
| 初始条件为假 | 不创建真实内容 | 仍创建元素 |
| 切换方式 | 销毁并重建分支 | 切换 style.display |
| 适合场景 | 低频切换、昂贵且可能不展示 | 高频显隐、需要保留同一 DOM |
| 结构限制 | 支持 template 和 else 分支 | 只用于真实元素，不支持 else |

:::tip
本课 Demo 会用少量 `ref()` 和 `computed()` 作为实验开关。先观察条件和列表产生的结果即可，下一课“响应式状态”会系统解释这些 API。
:::

## 五、用 v-for 遍历数组

`lesson in lessons` 会依次把数组中的记录交给模板。需要当前位置时写 `(lesson, index) in lessons`。`in` 与 `of` 都受支持，项目中保持一种写法即可。

~~~~vue
<script setup lang="ts">
const lessons = [
  { id: 'sfc', title: '单文件组件基础' },
  { id: 'template', title: '模板语法' },
  { id: 'rendering', title: '条件与列表渲染' },
]
</script>

<template>
  <ol>
    <li v-for="(lesson, index) in lessons" :key="lesson.id">
      第 {{ index + 1 }} 课：{{ lesson.title }}
    </li>
  </ol>
</template>
~~~~

## 六、对象遍历与整数范围

| 来源 | 写法 | 别名含义 |
| --- | --- | --- |
| 数组 | (item, index) in items | 记录、位置索引 |
| 对象 | (value, key, index) in profile | 属性值、属性名、位置索引 |
| 整数 | n in 5 | 1 到 5 |

对象的遍历顺序遵循 JavaScript 对象枚举规则。核心业务列表更适合使用包含稳定 ID 的数组；对象遍历和整数范围主要用于小型说明、属性预览或固定数量占位。

## 七、key 表示数据身份

Vue 默认会尽量就地复用同类型节点。绑定稳定 `key` 后，Vue 可以在过滤、插入或重排时确认某个 vnode 对应哪条数据。`key` 不是只为提升性能，它更重要的作用是保护 DOM 与组件状态的归属。

:::compare{before="位置不是身份" after="记录 ID 才是身份"}
### 位置不是身份

~~~~text
<li v-for="(lesson, index) in lessons" :key="index">
  {{ lesson.title }}
</li>
~~~~

### 记录 ID 才是身份

~~~~text
<li v-for="lesson in lessons" :key="lesson.id">
  {{ lesson.title }}
</li>
~~~~
:::

如果一次循环输出多个相邻节点，应把 `:key` 写在 `<template v-for>` 上。这样 key 代表整次迭代生成的 fragment，而不是其中某一个孩子。

## 八、组合条件与列表

不要在同一元素同时写 `v-if` 和 `v-for`。`v-if` 会先执行，因而不能访问循环别名。过滤数据时先得到派生列表；隐藏整组列表时，把条件放在外层容器。

~~~~vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const lessons = ref([
  { id: 'sfc', title: '单文件组件基础', completed: true },
  { id: 'rendering', title: '条件与列表渲染', completed: false },
])

// 只从原列表派生未完成课程，不在模板中混合过滤逻辑。
const pendingLessons = computed(() => lessons.value.filter((lesson) => !lesson.completed))
</script>

<template>
  <ul v-if="pendingLessons.length">
    <li v-for="lesson in pendingLessons" :key="lesson.id">
      {{ lesson.title }}
    </li>
  </ul>
  <p v-else>全部课程都已完成</p>
</template>
~~~~

## 九、观察 DOM 身份实验

在下面两个输入框中输入临时文字，再分别隐藏和显示面板。`v-if` 创建的是新输入框，`v-show` 保留原节点。列表区域可以过滤和反转记录；稳定 key 会让行内输入状态跟随对应课程移动。

:::demo{id="vue.core.learn.basics.conditional-list-rendering.rendering-identity-demo" playground="true"}
对比 v-if 与 v-show 的 DOM 生命周期，并观察稳定 key 如何跟随列表记录
:::

## 十、易错使用提示

:::pitfalls
### 在同一个元素上同时使用 v-if 和 v-for

**触发条件：** 在同一个元素上同时使用 v-if 和 v-for

**原因：** `v-if` 比 `v-for` 优先执行，此时条件表达式还不能访问循环别名。官方也不推荐把两者写在同一元素。

**后果：** 条件读取 `lesson` 时会报告未定义；结构意图也会在“过滤单项”和“隐藏整组”之间变得模糊。

**错误示例：**

~~~~vue
<li v-for="lesson in lessons" v-if="!lesson.completed">
  {{ lesson.title }}
</li>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { computed } from 'vue'

// 在脚本中集中表达过滤规则。
const pendingLessons = computed(() => lessons.value.filter((lesson) => !lesson.completed))
</script>

<template>
  <li v-for="lesson in pendingLessons" :key="lesson.id">
    {{ lesson.title }}
  </li>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 给会过滤或重排的列表使用索引 key

**触发条件：** 给会过滤或重排的列表使用索引 key

**原因：** 索引只表示当前位置。数据插入、删除或反转后，同一索引可能已经对应另一条记录。

**后果：** 未受控输入值、焦点和子组件局部状态可能留在原位置，最终显示到错误的数据记录上。

**错误示例：**

~~~~vue
<li v-for="(lesson, index) in lessons" :key="index">
  <input :aria-label="lesson.title" />
</li>
~~~~

**正确写法：**

~~~~vue
<li v-for="lesson in lessons" :key="lesson.id">
  <input :aria-label="lesson.title" />
</li>
~~~~

**验证方式：** 对照正确写法验证结果。

### 使用重复、随机或对象 key

**触发条件：** 使用重复、随机或对象 key

**原因：** 同一父节点下的 key 必须唯一，公开类型为字符串、数字或 symbol。随机值和重新创建的对象不能提供稳定身份。

**后果：** 重复 key 会导致渲染警告和异常复用；随机 key 每次渲染都可能强制销毁并重建节点。

**错误示例：**

~~~~vue
<li v-for="lesson in lessons" :key="Math.random()">
  {{ lesson.title }}
</li>
~~~~

**正确写法：**

~~~~vue
<li v-for="lesson in lessons" :key="lesson.id">
  {{ lesson.title }}
</li>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 template v-for 的 key 放在内部孩子上

**触发条件：** 把 template v-for 的 key 放在内部孩子上

**原因：** 当一次迭代由 `<template v-for>` 输出多个节点时，身份属于整个 fragment，key 应放在 template 上。

**后果：** 编译器会提示 key 位置不正确，多节点整体重排时也无法获得清晰的一次迭代身份。

**错误示例：**

~~~~vue
<template v-for="lesson in lessons">
  <h3 :key="lesson.id">{{ lesson.title }}</h3>
  <p>{{ lesson.summary }}</p>
</template>
~~~~

**正确写法：**

~~~~vue
<template v-for="lesson in lessons" :key="lesson.id">
  <h3>{{ lesson.title }}</h3>
  <p>{{ lesson.summary }}</p>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 template 上使用 v-show 或把它与 v-else 组合

**触发条件：** 在 template 上使用 v-show 或把它与 v-else 组合

**原因：** `v-show` 依靠真实元素的 `style.display` 工作。template 不会输出 DOM，v-show 也不参与 v-if 的 else 分支链。

**后果：** 多个节点不会按预期隐藏，v-else 也不会成为 v-show 的备用内容。

**错误示例：**

~~~~vue
<template v-show="open">
  <h2>标题</h2>
  <p>内容</p>
</template>
~~~~

**正确写法：**

~~~~vue
<template v-if="open">
  <h2>标题</h2>
  <p>内容</p>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 v-else 与前一个条件分支失去相邻关系

**触发条件：** 让 v-else 与前一个条件分支失去相邻关系

**原因：** `v-else` 和 `v-else-if` 只识别紧跟在前一个 v-if 或 v-else-if 后面的兄弟节点。

**后果：** 分支链无法建立，开发环境会报告 v-else 缺少相邻 v-if。

**错误示例：**

~~~~vue
<p v-if="ready">已就绪</p>
<hr />
<p v-else>准备中</p>
~~~~

**正确写法：**

~~~~vue
<p v-if="ready">已就绪</p>
<p v-else>准备中</p>
~~~~

**验证方式：** 对照正确写法验证结果。

### 记错对象别名顺序或整数范围起点

**触发条件：** 记错对象别名顺序或整数范围起点

**原因：** 对象遍历的三个别名依次是 value、key、index；整数范围从 1 开始，不是数组索引式的 0。

**后果：** 属性名和位置索引会对调，编号也容易产生多一位或少一位的错误。

**错误示例：**

~~~~vue
<p v-for="(value, index, key) in profile">
  {{ key }}: {{ value }}
</p>
~~~~

**正确写法：**

~~~~vue
<p v-for="(value, key, index) in profile" :key="key">
  {{ index + 1 }}. {{ key }}: {{ value }}
</p>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、从编译与渲染实现推导使用场景

:::steps
### 低频或初始不展示的昂贵内容使用 v-if

`vIf.ts` 会把分支编译为条件表达式，未命中侧使用注释 vnode 占位，真实分支按需创建。初始为假且可能永远不打开的内容不必承担首次创建成本。

### 高频显隐或需要保留同一 DOM 时使用 v-show

`vShow.ts` 保存元素原始 display，只在原值与 none 之间切换。节点始终存在，因此适合频繁切换或保留未受控输入等 DOM 状态。

### 用稳定 key 让状态跟随记录移动

`isSameVNodeType()` 同时比较 vnode 类型和 key，keyed diff 再用 key 建立新位置映射。业务 ID 能让输入、焦点和组件状态继续属于同一条记录。

### 不要把编译优化误当成身份修复

`vFor.ts` 会生成稳定、带 key 或无 key 的 fragment patch flag，但 block 优化只能减少比较，不能修复索引、随机或重复 key 造成的错误身份。
:::

:::exercise
### 制作一个有空状态的课程列表

**要求：**

~~~~text
准备三条带稳定 id 和 completed 字段的课程记录。先得到未完成课程列表；有数据时使用 v-for 和 id key 渲染，没有数据时显示“全部完成”。再增加一个 showDetails 条件，用 template v-if 同时控制标题和说明。不要在同一个元素上混用 v-if 与 v-for。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
<script setup lang="ts">
import { computed, ref } from 'vue'

const showDetails = ref(true)
const lessons = ref([
  { id: 'sfc', title: '单文件组件基础', completed: true },
  { id: 'template', title: '模板语法', completed: false },
  { id: 'rendering', title: '条件与列表渲染', completed: false },
])

// 从课程记录派生仍需学习的项目。
const pendingLessons = computed(() => lessons.value.filter((lesson) => !lesson.completed))
</script>

<template>
  <template v-if="showDetails">
    <h2>待学习课程</h2>
    <p>按推荐顺序完成以下内容。</p>
  </template>

  <ul v-if="pendingLessons.length">
    <li v-for="lesson in pendingLessons" :key="lesson.id">
      {{ lesson.title }}
    </li>
  </ul>
  <p v-else>全部完成</p>
</template>
~~~~
:::
