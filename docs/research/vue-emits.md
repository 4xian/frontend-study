# Vue Core 基础课程：Emits 调研

> 核验日期：2026-07-30
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文/英文官方文档、官方 Emits RFC，以及 `vuejs/core` 的 `v3.5.40`
> 固定标签编译器、运行时源码与同标签官方测试。外部资料通过 Tavily Search / Extract 定位和
> 提取，结论均回到一手页面或固定标签源码核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.basics.emits`。Vue 官方组件事件指南把“组件基础”列为前置；当前
仓库的线性路线已经通过 `component-basics → props` 覆盖该前提，并把 Emits 紧接在 Props 之后。
因此本课唯一直接 prerequisite 冻结为 `vue.core.learn.basics.props`，不重复声明传递性前置。

本课只回答一个主问题：**子组件怎样把用户意图作为已声明、带类型的组件事件报告给直接父组件，
再由父组件决定是否更新自己拥有的状态。** 主线限定为 `<script setup lang="ts">`、Composition
API 与 SFC，覆盖：

- Props 向下传当前状态，Emits 向上报告意图；事件本身不会自动修改父状态。
- 使用 `defineEmits()` 显式声明事件名和载荷，并调用返回的 `emit` 函数。
- 父模板使用 `v-on` / `@` 监听直接子组件事件，接收全部额外参数。
- 脚本侧事件名使用 camelCase，SFC 父模板监听器使用 kebab-case。
- 组件事件不会沿组件树冒泡；跨一层时必须由中间组件显式处理或转发。
- TypeScript 具名元组负责静态事件契约，运行时 validator 只负责开发期诊断。
- 用一个可观察回路证明“子级请求，父级裁决，Props 再向下刷新”。

以下内容明确排除，不进入正文练习或 Demo：

- 不讲 Slots、作用域插槽或任何内容分发方案。
- 不讲 Attrs、`$attrs`、`useAttrs()`、`inheritAttrs`、监听器透传或多根节点继承。
- 不讲组件 `v-model`、`defineModel()`、`modelValue`、`update:*` 事件或修饰符。
- 不讲 Provide/Inject、事件总线、Pinia、全局状态或跨层通信方案选型。
- 不讲模板引用、组件公开实例、`defineExpose()` 或父组件直接调用子组件方法。
- 不并行教授 Options API 的 `emits` 选项或 `this.$emit()`；只把它们作为同一运行时能力的识别项。
- 不把事件 validator 当成表单校验、接口 schema、权限判断或生产数据清洗。
- 不把原生 DOM 事件透传、`.native` 迁移或第三方 `dispatchEvent()` 边界放入新手主线。

`componentEmits.ts` 中包含组件 `v-model` 参数修饰、监听器分类和兼容构建分支；这些实现已核验，
但属于上述后续主题，本课只提取与普通自定义组件事件直接相关的路径。

官方在线指南会持续更新，不按 `3.5.40` 补丁版本冻结。公开语义以 2026-07-30 核验的中英文
官方指南和 RFC 为准；宏编译、事件名提取、开发期校验、处理器解析、`.once` 和卸载行为，以
`vuejs/core@v3.5.40` 为固定版本权威。

**课程依据：** [Vue 中文组件事件指南](https://cn.vuejs.org/guide/components/events.html)、
[Vue 英文组件事件指南](https://vuejs.org/guide/components/events.html)、
[TypeScript 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-emits)、
[RFC 0030：Emits Option](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md)。

## 学习目标

完成本课后，学习者应能：

1. 把组件事件解释为子组件向直接父组件报告意图的公开输出，而不是 DOM 事件或共享状态写入。
2. 用 TypeScript 具名元组声明无载荷和有载荷事件，并让错误事件名、参数数量和类型在编译期暴露。
3. 在子组件中调用 `emit()`，在父模板中使用 kebab-case 监听器接收载荷。
4. 说明 `emit()` 为什么不会自动改变 prop，并完成“父级处理后更新状态，再由 Props 刷新子级”的回路。
5. 预测直接父级、祖先组件和显式转发三种情况下谁能收到事件。
6. 正确选择函数引用、内联箭头函数或 `$event` 接收载荷，避免无意丢参。
7. 区分 TypeScript 静态约束与运行时事件 validator，知道 validator 失败仍会继续调用监听器。
8. 识别 `.once` 的实例级行为和卸载后 emit 被忽略的生命周期边界。

## 建议教学顺序

### 1. 从 Props 的未完成问题开始

复用上一课的课程操作场景：父组件拥有当前数量，子组件显示数量并提供“增加”“减少”“重置”
按钮。Props 已经解决父到子的输入，但子组件不应直接修改 `props.quantity`。本课用事件补上公开出口。

```text
父组件 quantity
      │
      │ prop：quantity
      ▼
CourseActionPanel
      │
      │ event：changeRequest(delta)
      ▼
父组件判断并更新 quantity
```

先要求学习者用一句话描述所有权：子组件拥有按钮交互和请求时机，父组件拥有业务状态和是否接受
请求的决定权。

### 2. 只教一套主声明：TypeScript 具名元组

```vue
<script setup lang="ts">
const emit = defineEmits<{
  changeRequest: [delta: number]
  resetRequest: []
}>()

/** 请求父组件增加一个单位。 */
function requestIncrease() {
  emit('changeRequest', 1)
}

/** 请求父组件恢复初始数量。 */
function requestReset() {
  emit('resetRequest')
}
</script>
```

主线不从字符串数组开始，因为 `defineEmits(['changeRequest'])` 无法表达载荷类型。运行时对象声明
只在后半段解释 validator 时出现。调用签名语法作为识别项，具名元组是 Vue 3.3+ 更紧凑的主写法。

### 3. 父模板监听事件并接收参数

```vue
<CourseActionPanel
  :quantity="quantity"
  @change-request="applyChange"
  @reset-request="resetQuantity"
/>
```

```ts
/** 接受子组件请求，并更新父级拥有的数量。 */
function applyChange(delta: number) {
  quantity.value += delta
}

/** 把父级数量恢复为初始值。 */
function resetQuantity() {
  quantity.value = initialQuantity
}
```

父监听器写函数引用时，Vue 会把 `emit()` 事件名之后的全部参数依次传入函数。需要内联表达式时，
可写 `@change-request="(delta) => applyChange(delta)"`；不要写成无参调用
`@change-request="applyChange()"` 后又期待载荷自动出现。

### 4. 建立“请求不等于更新”的反馈环

Demo 初始 `quantity = 2`，父级还设置最小值 `0` 和最大值 `5`。子级只发出 `delta`：

1. 点击“增加”，子级发出 `changeRequest(1)`。
2. 父级计算候选值，并决定接受还是拒绝。
3. 接受时父级更新 `quantity`；拒绝时只更新父级状态说明。
4. 父级更新通过 prop 重新流向子级，子级显示新值。

这能观察到两个关键事实：`emit()` 没有返回一个新的 prop，也不会等待父级修改；父级甚至可以拒绝
请求，子级仍保持只读。

### 5. 再处理事件命名和载荷设计

- `emit('changeRequest', 1)` 在脚本中使用 camelCase。
- 父 SFC 模板写 `@change-request="applyChange"`，保持官方推荐的 kebab-case。
- 无载荷事件用空元组 `resetRequest: []`，不传虚构的 `undefined`。
- 单个简单值可直接传；字段开始增多时，优先传一个具名对象，避免位置参数顺序漂移。

```ts
interface CourseActionRequest {
  delta: number
  source: 'increase' | 'decrease'
}

const emit = defineEmits<{
  actionRequest: [request: CourseActionRequest]
}>()
```

基础 Demo 保持单个 `delta`，对象载荷只作为扩展判断，不增加第二条交互主线。

### 6. 用中间组件证明事件不会冒泡

官方明确说明组件事件只能由直接父组件监听。课程用静态图和短代码说明：祖先组件不能把
`@change-request` 直接挂在中间组件上后期待深层子组件事件自动穿过。

```vue
<!-- MiddlePanel.vue：需要跨层时显式转发，不依赖冒泡。 -->
<CourseActionPanel @change-request="(delta) => emit('changeRequest', delta)" />
```

这段只用于解释组件事件边界，不把跨层通信方案、Provide/Inject 或状态管理带入本课 Demo。

### 7. 最后区分类型声明和运行时校验

```ts
const emit = defineEmits({
  /** 只接受 -1 或 1，并在开发环境报告错误载荷。 */
  changeRequest: (delta: number) => delta === -1 || delta === 1,
  resetRequest: null,
})
```

TypeScript 声明负责开发时的编辑器和编译器反馈；运行时对象声明可以执行 validator。两种形式不能
放在同一次 `defineEmits()` 中混用。validator 返回 false 只产生开发期警告，运行时仍继续查找并
调用父监听器，因此真正需要阻止的操作必须在 emit 前显式判断。

## 最小核心知识

### `defineEmits()` 是组件公开输出声明

`defineEmits()` 是 `<script setup>` 编译器宏，无需导入，编译后不作为普通运行时函数保留。它既
记录组件允许发出的事件，又返回绑定到当前组件实例的 `emit` 函数。

| 形式 | 示例 | 基础课定位 |
| --- | --- | --- |
| 类型具名元组 | `defineEmits<{ save: [id: number] }>()` | 主线；事件名和载荷都可静态检查 |
| 类型调用签名 | `defineEmits<{ (e: 'save', id: number): void }>()` | 识别；能力等价但更冗长 |
| 运行时字符串数组 | `defineEmits(['save'])` | 识别；只能声明事件名 |
| 运行时对象 | `defineEmits({ save: validator })` | validator 场景；提供开发期运行时诊断 |

类型参数与运行时参数不能同时传给同一个宏，且一个 SFC 只能有一次有效的 `defineEmits()` 调用。
宏选项被提升到 setup 外层，不能读取 setup 中稍后声明的局部变量，但可以使用导入绑定。

依据：[script setup：defineProps / defineEmits](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)、
[`defineEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts)、
[`defineEmits.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts)。

### 事件名与监听器名称

官方支持在脚本中发出 camelCase 事件，并在模板中使用 kebab-case 监听：

| 子组件调用 | 父 SFC 模板 | 说明 |
| --- | --- | --- |
| `emit('changeRequest', 1)` | `@change-request="applyChange"` | 推荐主线 |
| `emit('resetRequest')` | `@reset-request="resetQuantity"` | 无载荷事件 |
| `emit('save-item', id)` | `@save-item="saveItem"` | 可工作，但脚本事件名不统一 |

运行时先按事件原名寻找 handler key，再尝试 camelize 后的 handler key。课程仍冻结“脚本 camelCase、
模板 kebab-case”这一套约定，减少 SFC、DOM 内模板和工具链之间的大小写差异。

依据：[组件事件：触发与监听事件](https://cn.vuejs.org/guide/components/events.html#emitting-and-listening-to-events)、
[`componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts)。

### 事件参数全部按位置转发

`emit('foo', 1, 2, 3)` 会让父监听器依次收到三个参数。函数引用会直接接收这些参数；内联表达式可
使用形参或 `$event` 读取首个参数。

```vue
<CourseActionPanel @change-request="applyChange" />
<CourseActionPanel @change-request="(delta) => applyChange(delta)" />
<CourseActionPanel @change-request="applyChange($event)" />
```

多个位置参数虽然受具名元组约束，但调用端只看到顺序。对会演进的公共组件，字段增加到两个以上
时通常改用一个对象载荷更清晰；这属于接口设计判断，不是 Vue 强制规则。

依据：[组件事件：事件参数](https://cn.vuejs.org/guide/components/events.html#event-arguments)、
[TypeScript：为组件的 emits 标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-emits)。

### 组件事件只到直接父组件

组件自定义事件不同于原生 DOM 事件，不会沿组件树冒泡。运行时从当前组件 VNode 的 props 中解析
父级提供的 handler 并直接调用，因此祖先组件没有一条自动冒泡路径。

需要跨一层时，中间组件必须显式监听后再发出自己的公共事件。课程不延伸到事件总线、依赖注入或
状态管理，只要求学习者能预测直接父级是否能收到。

依据：[组件事件：不冒泡提示](https://cn.vuejs.org/guide/components/events.html#emitting-and-listening-to-events)、
[`componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts)。

### 事件声明和状态所有权是两件事

`emit()` 的职责是调用父级注册的监听器。它不会：

- 修改子组件收到的 prop。
- 自动选择父级的哪份状态需要更新。
- 等待父级完成更新并把新值作为返回值交给子级。
- 把载荷深拷贝或冻结。

正确反馈环是“子级 emit → 父级 handler → 父级状态变更 → Props 向下刷新”。父级可以拒绝、延迟
或转换请求，所以事件名优先表达意图，如 `changeRequest`，而不是暗示子级已经完成所有权变更。

依据：[组件基础：监听事件](https://cn.vuejs.org/guide/essentials/component-basics.html#listening-to-events)、
[RFC 0030：Motivation](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md#motivation)。

### 类型声明不等于运行时载荷校验

类型形式让 `emit()` 获得事件名、参数数量和参数类型约束。`defineEmits.ts` 会从类型节点中提取
事件名，生成运行时 `emits` 名单；它不会把任意 TypeScript 载荷类型编译成等价 validator。

```ts
const emit = defineEmits<{
  submit: [payload: { email: string }]
}>()
```

这会给本地 TypeScript 调用提供检查，但不能把来自 `any`、JavaScript 调用方或外部数据的坏值变成
生产运行时拒绝。真实输入边界仍需完成解析和业务判断。

依据：[`defineEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts)、
[`defineEmits.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts)。

### 运行时 validator 只告警

对象声明可给事件配置 validator。validator 收到事件名之后的全部参数并返回 boolean。在
`v3.5.40` 中，该检查位于 `__DEV__` 分支；失败后 Vue 调用 `warn()`，但没有从 emit 流程返回，
随后仍会解析并调用监听器。

```ts
const emit = defineEmits({
  /** 验证数量变化是否为一个单位。 */
  changeRequest: (delta: number) => Math.abs(delta) === 1,
})

/** 先执行真正的业务守卫，再发出事件。 */
function requestChange(delta: number) {
  if (Math.abs(delta) !== 1) return
  emit('changeRequest', delta)
}
```

依据：[组件事件：事件校验](https://cn.vuejs.org/guide/components/events.html#events-validation)、
[`componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts)、
[`componentEmits.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentEmits.spec.ts)。

## Vue 3.5.40 源码与测试推导

### 1. 宏最终绑定 setup context 的 `emit`

`processDefineEmits()` 记录声明和接收变量；编译测试验证源码中的宏调用被移除，setup 签名取得
`emit: __emit`，本地 `const emit` 绑定到该实例函数，同时组件选项获得运行时事件名单。

**课程推导：** 不要把 `defineEmits()` 当作可在普通函数、条件分支或普通 `.ts` 文件中调用的
运行时工厂。每个子 SFC 在顶层声明一次公共输出即可。

### 2. 运行时声明和类型声明互斥

编译器同时发现类型参数和运行时参数时直接报错；同一 SFC 重复调用也会报错。官方测试还验证
具名属性语法和调用签名语法不能在同一个类型声明中混搭。

**课程推导：** 主线只选具名元组。需要 runtime validator 时整段切换为对象声明，不创建第二个
宏，也不试图把两种声明叠加成“更安全”的版本。

### 3. 类型声明只提取运行时事件名

`extractRuntimeEmits()` 从属性 key、调用签名首参和字符串联合中收集名称，`genRuntimeEmits()`
生成数组声明。官方编译测试覆盖简单事件、联合事件名和具名属性语法。

**课程推导：** TypeScript 载荷类型是静态契约，不是运行时 validator。若必须检查运行时数据，
应在真实输入边界解析，或选择对象声明提供开发期诊断。

### 4. 开发期检查不会中止事件

运行时先检查事件是否声明，再调用 validator；失败只发出 warning。之后仍从当前 VNode props 中
解析 handler，并通过组件事件错误处理路径调用。

**课程推导：** validator 适合组件库作者发现错误调用，不适合“阻止保存”。Demo 的 min/max 裁决
必须写在父 handler 中，而不是依赖 validator false。

### 5. 处理器是从当前组件 VNode 直接解析的

普通组件事件依次查找事件原名和 camelize 后的 handler key，再直接调用匹配函数。这条路径不是
浏览器 DOM dispatch，也没有祖先遍历。

**课程推导：** “只监听直接子组件”不是教学简化，而是运行时调用模型。包装组件要公开同一意图
时应显式转发，并重新声明自己的事件契约。

### 6. `.once` 由组件实例记录

运行时还查找带 `Once` 后缀的监听器，并在 `instance.emitted` 中记录该 handler 已触发。后续同一
实例再次 emit 时跳过 once handler；组件销毁后重新创建的是新实例，记录也随之重置。

**课程推导：** `.once` 可用于单个组件实例的首次确认或一次性完成通知，不能充当跨重挂载、跨路由
或全局会话级幂等锁。

### 7. 组件卸载后 emit 被忽略

`emit()` 入口发现 `instance.isUnmounted` 后立即返回。官方测试在 `beforeUnmount` 中等待一个 tick
再 emit，确认父监听器没有被调用。

**课程推导：** 异步子组件应在卸载时取消任务或忽略过期结果，不能假设一个晚到的 emit 一定能
通知父级完成收尾。

## 高质量常见易错点

### 1. 认为 emit 会自动修改父状态或 prop

- **原因：** 把事件名理解成命令执行结果，忽略状态仍由父组件拥有。
- **后果：** 子组件 emit 后立即读取旧 prop，或偷偷维护第二份本地状态，父子显示开始分叉。
- **错误：** `emit('changeRequest', 1)` 后假设 `props.quantity` 已同步增加。
- **正确：** 父级监听 `@change-request`，在 handler 中更新 `quantity`，再由 prop 刷新子级。

```ts
/** 父组件接受请求并更新自己的状态。 */
function applyChange(delta: number) {
  quantity.value += delta
}
```

### 2. 期待组件事件像 DOM 事件一样冒泡

- **原因：** 把组件事件和浏览器事件传播模型混为一谈。
- **后果：** 祖先组件监听不到深层子事件，业务回调静默不执行。
- **错误：** 祖先给 `<MiddlePanel @change-request="applyChange" />` 绑定监听，却不让 MiddlePanel 转发。
- **正确：** 由直接父组件处理；确需跨一层时，中间组件显式监听、声明并重新 emit。

```vue
<CourseActionPanel @change-request="(delta) => emit('changeRequest', delta)" />
```

### 3. 声明、emit 和模板监听使用三套事件名

- **原因：** 没有冻结脚本和模板的命名约定。
- **后果：** TypeScript 报未知事件，或模板环境大小写变化后监听失效。
- **错误：** 声明 `changeRequest`，调用 `emit('change-request', 1)`，父模板写 `@changerequest`。
- **正确：** 声明和调用统一 camelCase，父 SFC 模板统一 kebab-case。

```ts
const emit = defineEmits<{ changeRequest: [delta: number] }>()
emit('changeRequest', 1)
```

```vue
<CourseActionPanel @change-request="applyChange" />
```

### 4. 在模板中立即调用无参函数，意外丢失载荷

- **原因：** 把函数引用和模板表达式调用当成同一种写法。
- **后果：** handler 收到 `undefined`，计算产生 `NaN` 或走错业务分支。
- **错误：** `@change-request="applyChange()"`。
- **正确：** `@change-request="applyChange"`，或显式写 `(delta) => applyChange(delta)`。

### 5. 位置参数增加后仍靠记忆维护顺序

- **原因：** `emit()` 会原样转发所有额外参数，Vue 不会按参数名重新匹配。
- **后果：** 父级把 `courseId` 当成 `delta`，类型较宽时甚至无法在编译期发现。
- **错误：** `emit('actionRequest', 1, 'course-1')`，父 handler 按 `(courseId, delta)` 读取。
- **正确：** 对多字段公共载荷使用一个具名对象。

```ts
interface ActionRequest {
  courseId: string
  delta: number
}

const emit = defineEmits<{
  actionRequest: [request: ActionRequest]
}>()
```

### 6. 同一次 `defineEmits()` 混合类型和运行时声明

- **原因：** 误以为类型参数提供静态检查、对象参数再追加运行时检查，两者可以叠加。
- **后果：** SFC 编译直接失败。
- **错误：** `defineEmits<{ submit: [id: number] }>({ submit: validator })`。
- **正确：** 一次只选一种形式；基础课用具名元组，需要 validator 时整体改用对象声明。

### 7. 认为 validator 返回 false 会阻止监听器执行

- **原因：** 把开发期诊断函数理解成业务守卫。
- **后果：** 无效载荷仍进入父 handler，可能修改状态或发起请求。
- **错误：** 只依赖 `changeRequest: (delta) => delta !== 0`，然后无条件 `emit('changeRequest', 0)`。
- **正确：** 在 emit 前或父 handler 中写真实条件；validator 只补充开发反馈。

```ts
/** 忽略无效变化，再报告合法意图。 */
function requestChange(delta: number) {
  if (delta === 0) return
  emit('changeRequest', delta)
}
```

### 8. 认为 TypeScript 事件类型会变成生产运行时校验

- **原因：** 不知道编译器只从类型声明提取事件名。
- **后果：** `any`、JavaScript 调用方或未解析的外部数据绕过静态检查后仍进入监听器。
- **错误假设：** `submit: [payload: SubmitPayload]` 会在浏览器中验证对象结构并拒绝坏值。
- **正确：** 在 API、表单或业务入口做真实解析；事件类型只描述组件内部和调用方的静态契约。

## 源码推导出的高级使用场景

### 1. 用具名元组冻结组件库事件契约

组件对外只有少量稳定事件时，具名元组能同时约束事件名、参数数量和参数含义。编译器会从 key
生成运行时事件名单，避免再维护一份字符串数组。

### 2. 用单对象载荷承载可演进意图

当事件需要 `id`、`reason`、`source` 等多个字段时，单对象载荷比位置参数更适合扩展。新可选字段
不会改变已有参数顺序，父监听器也能按字段名读取。

### 3. 用 runtime validator 提供组件库开发反馈

公开组件需要在 JavaScript 项目中提示非法载荷时，可选择对象声明。validator 应保持纯粹、快速，
只报告契约误用；真正阻断仍放在业务守卫或输入解析层。

### 4. 包装组件显式转发并重命名内部事件

因为事件不冒泡，包装组件可监听内部实现事件，再对外发出更稳定的领域事件。例如内部按钮发出
`click`，包装组件只公开 `confirmRequest`。这能隔离实现命名，但必须重新声明载荷类型。

### 5. 用 `.once` 表达单实例首次确认

父级只需响应某个已挂载子组件的第一次 `ready` 或 `completed` 时，可使用 `.once`。如果组件可能
被条件渲染销毁并重建，跨实例幂等仍需由父级状态负责。

### 6. 异步子组件在卸载时取消过期工作

运行时会忽略卸载后的 emit。搜索建议、上传步骤或延迟校验组件应在卸载时取消任务，或用请求标识
丢弃过期结果，避免把 emit 当作必达消息。

### 7. 在测试中从父级可观察结果验证事件契约

单元测试可以直接断言组件 emitted 记录；课程级 E2E 更适合点击真实子按钮，再断言父级状态和传回
子级的 prop 同步变化。这样同时覆盖 emit、父 handler 和 Props 回流，不需要为每个事件另写测试。

## 单一同源 Demo 冻结

### 名称、ID 与主命题

唯一 Demo 命名为“Emits 意图回路实验台”，精确资产 ID：

`vue.core.learn.basics.emits.emits-intent-flow-demo`

它只验证一个主命题：**子组件只能报告变化意图，直接父组件拥有裁决和状态更新权；父级更新后再
通过 Props 把结果传回子组件。**

### 文件结构与同源约束

```text
src/content/demos/vue/core/learn/basics/emits/
├─ emits-intent-flow-demo.vue
└─ parts/
   └─ CourseActionPanel.vue
```

- `emits-intent-flow-demo.vue` 是唯一公开 Demo ID、运行入口和源码面板 raw source 来源。
- 父文件保存 `quantity`、上下限、最近请求说明和接受/拒绝计数。
- `CourseActionPanel.vue` 是私有真实子 SFC，接收 Props，并用 `defineEmits()` 发出请求。
- 私有子组件不注册第二个 Demo ID，不复制成内联假组件，也不创建第二套演示状态。
- 课程静态代码块展示实际子组件的关键声明；运行交互必须直接使用同一个私有子 SFC。
- 当前 registry 按约定发现父 Demo；不为本课修改 registry 或构建多文件源码查看器。

### 父级状态与事件契约

父级保留：

- `quantity = 2`：唯一业务状态来源。
- `minimum = 0`、`maximum = 5`：父级裁决边界。
- `lastDecision`：展示最近一次请求由父级接受还是拒绝。
- `acceptedCount`、`rejectedCount`：证明每次处理发生在父级。

私有子组件接收 `quantity`、`minimum`、`maximum`，但不修改任何 prop。事件冻结为：

```ts
const emit = defineEmits<{
  changeRequest: [delta: number]
  resetRequest: []
}>()
```

父级监听器冻结为 `@change-request="applyChange"` 和 `@reset-request="resetQuantity"`。父级先计算
候选值，越界时拒绝且不更新 quantity；合法时更新状态。重置是否产生状态变化同样由父级决定。

### 必须可验证的交互顺序

1. 初始父级状态和子组件显示都为 `2`，接受/拒绝计数为 `0`。
2. 点击子级“增加”，事件载荷为 `1`，父级接受并把 quantity 更新为 `3`，子级随 prop 刷新。
3. 点击子级“减少”，事件载荷为 `-1`，父级接受并恢复为 `2`。
4. 连续增加到 `5` 后再点击“增加”，父级拒绝请求，quantity 保持 `5`，拒绝计数增加。
5. 点击“重置”，子级发出无载荷事件，父级把 quantity 恢复为 `2`。
6. 父级提供一个“父级直接设为最小值”按钮，证明不经过子事件也能更新所有者状态和子 prop。
7. 所有状态说明明确写“子级请求”和“父级决定”，不把按钮文案写成子级已直接修改父状态。

Demo 不使用 Slots、Attrs、组件 `v-model`、Provide/Inject、模板引用、store、watcher、远程请求、
动态组件或原生同名事件。也不故意触发 validator warning；错误写法放在静态易错点中，运行 Demo
保持控制台干净。

### 布局与可访问性约束

- 390px 下严格单列；宽屏可用 flex 排列父状态区和子操作区，但不使用 CSS Grid 或 `gap`。
- flex 子项设置 `min-width: 0`，区块间用 margin 或相邻选择器留白，长状态文本允许换行。
- 所有操作使用原生 `<button type="button">`，最小触控高度 44px。
- “增加”“减少”“重置”按钮具有独立可见名称，不能只用 `+`、`-` 图标表达命令。
- 当前 quantity、允许范围、最近决定和计数都用文本呈现，不只依赖颜色。
- 最近决定区域可使用 `aria-live="polite"`，但不重复播报整张面板。
- 到达上下限后按钮仍保持可操作，以便真实发出越界请求并观察父级拒绝；允许范围和拒绝原因必须
  有可见文本，不能只靠颜色提示。
- 200% 文本缩放和 390px 宽度下按钮文字不截断，不产生页面级横向滚动。
- 源码入口可读取唯一父 Demo 文件，`.demo-box .missing` 必须为 `0`。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.basics.emits',
  type: 'lesson',
  title: 'Emits',
  summary: '声明子到父的组件事件，让子组件报告意图并由父组件更新状态',
  ecosystem: 'vue',
  module: 'core',
  collection: 'basics',
  level: 'beginner',
  prerequisites: ['vue.core.learn.basics.props'],
  related: [
    'vue.core.learn.basics.props',
    'vue.core.reference.components.emits',
  ],
  tags: ['Emits', 'defineEmits', '组件事件', '事件载荷', '父子通信'],
  sources: [
    {
      title: 'Vue 组件事件',
      url: 'https://cn.vuejs.org/guide/components/events.html',
    },
    {
      title: 'Vue TypeScript 与组合式 API',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-emits',
    },
    {
      title: 'Vue script setup',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits',
    },
    {
      title: 'Vue RFC 0030 Emits Option',
      url: 'https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md',
    },
    {
      title: 'Vue 3.5.40 defineEmits.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts',
    },
    {
      title: 'Vue 3.5.40 defineEmits.spec.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts',
    },
    {
      title: 'Vue 3.5.40 componentEmits.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts',
    },
    {
      title: 'Vue 3.5.40 componentEmits.spec.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentEmits.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-30',
  estimatedMinutes: 40,
})
```

本地冻结建议“唯一 prerequisite 为 Props、related 仅 Props 与 Emits reference”与当前线性课程顺序、
已存在可导航 ID 一致。不要把 Slots、Attrs、组件 `v-model` 或 Provide/Inject 提前加入 related。

## 后续实施范围建议

后续实现可限定为：

- `src/content/entries/learn/vue/core/basics/emits.ts`
- `src/content/demos/vue/core/learn/basics/emits/emits-intent-flow-demo.vue`
- `src/content/demos/vue/core/learn/basics/emits/parts/CourseActionPanel.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、Demo registry 实现、reference Emits entry、全局样式或其他课程。实现时只把 Emits
从 planned 改为 available，保持 component-basics → Props → Emits 的冻结顺序；不能把单课完成写成
Stage 6 全部完成或 Vue 学习路线关闭。

最小验证只需覆盖：课程顺序与唯一 prerequisite、唯一 Demo ID 可解析、子级事件会触发父级裁决、
越界请求被父级拒绝、父级更新通过 prop 回流、390px 无横向滚动。不要为每个事件形式另写测试。

## 固定来源清单

### Vue 官方文档与 RFC

- [Vue 中文官网：组件事件](https://cn.vuejs.org/guide/components/events.html)：前置、触发与监听、
  命名、`.once`、事件参数、声明、直接父级边界和 validator。
- [Vue 英文官网：Component Events](https://vuejs.org/guide/components/events.html)：与中文页面交叉
  核对事件不冒泡、全部额外参数转发和声明事件的推荐理由。
- [Vue 中文官网：TypeScript 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-emits)：
  运行时声明、调用签名和 Vue 3.3+ 具名元组类型。
- [Vue 中文官网：script setup](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)：
  编译器宏、提升限制、运行时/类型声明互斥和自动运行时声明生成。
- [Vue API：emits option](https://vuejs.org/api/options-state.html#emits)：数组/对象形式、validator 签名和
  已声明监听器分类的 API 语义；Attrs 细节不进入本课。
- [RFC 0030：Emits Option](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md)：
  公开事件文档化、运行时校验、类型推导和 IDE 支持的设计动机。

### vuejs/core v3.5.40

- [`packages/compiler-sfc/src/script/defineEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/script/defineEmits.ts)：
  宏识别、重复调用、类型/运行时互斥、事件名提取与运行时 emits 生成。
- [`packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineEmits.spec.ts)：
  宏移除、setup emit 绑定、数组生成、联合事件名和错误声明的官方回归证据。
- [`packages/runtime-core/src/componentEmits.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentEmits.ts)：
  开发期声明/validator 检查、handler key 解析、`.once` 实例记录和卸载短路。
- [`packages/runtime-core/__tests__/componentEmits.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentEmits.spec.ts)：
  handler 触发、命名变体、未声明警告、validator warning、监听器识别与卸载后不 emit。

## 结论

本课应把 Emits 教成“子级报告意图、父级裁决并更新”的组件输出契约，而不是 `$emit` 语法大全。
最重要的可观察反馈环是：`CourseActionPanel` 发出 `changeRequest(delta)`，父组件接受或拒绝，再通过
Props 把最终 quantity 传回子级。唯一 `emits-intent-flow-demo` 足以同时呈现事件声明、载荷、命名、
直接父级监听和状态所有权，无需引入 Slots、Attrs、组件 `v-model` 或 Provide/Inject。

源码最值得转化为教学判断的四点是：类型声明只生成运行时事件名、validator 失败不会阻止监听器、
事件处理器从当前组件 VNode 直接解析所以不冒泡、`.once` 与卸载行为都以组件实例生命周期为边界。
