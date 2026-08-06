---
id: vue.core.reference.options-api.composition-options
type: reference
title: Options API：组合选项
summary: 查询 provide、inject、mixins 与 extends 的 Options API 签名、初始化顺序、合并策略和 setup 边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.composition.provide-inject
  - vue.core.reference.application.application-configuration
  - vue.core.reference.options-api.state-options
  - vue.core.reference.options-api.lifecycle-options
tags:
  - Options API
  - provide
  - inject
  - mixins
  - extends
  - 依赖注入
  - 选项合并
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue Options API：组合选项
    url: https://cn.vuejs.org/api/options-composition.html
  - title: Vue 指南：依赖注入
    url: https://cn.vuejs.org/guide/components/provide-inject.html
  - title: Vue 3.5.40 Options 应用与合并实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts
  - title: Vue 3.5.40 provide 与 inject 实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiInject.ts
  - title: Vue 3.5.40 Options 合并官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentOptions.spec.ts
  - title: Vue 3.5.40 inject 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiInject.spec.ts
group: options-api
signature: |-
  interface ComponentOptions {
    provide?: object | ((this: ComponentPublicInstance) => object)
    inject?: ArrayInjectOptions | ObjectInjectOptions
    mixins?: ComponentOptions[]
    extends?: ComponentOptions
  }

  type ArrayInjectOptions = string[]

  type ObjectInjectOptions = {
    [localKey: string | symbol]:
      | string
      | symbol
      | { from?: string | symbol; default?: unknown }
  }
anchors:
  - 概述
  - provide
  - inject
  - mixins
  - extends
  - 易错使用提示
  - 源码推导与适用场景
---

# Options API：组合选项

## 概述

组合选项解决两类问题：provide / inject 沿组件祖先链传递依赖，mixins / extends 按 Options 合并策略复用组件定义。前者不是任意组件间的全局状态通道，后者也不是 JavaScript 类继承。四个选项都保留 Options API 的公共实例 this、初始化次序与冲突规则；组合式 API 页面只用于对照，不会替代这些契约。

实例创建时，inject 先于 methods、data、computed 与 watch 解析，因此这些选项可以读取已注入的属性；provide 则在实例状态建立后求值，可以读取当前实例。extends 先合并，随后按数组顺序合并 mixins，最后应用组件自身选项，但不同种类选项使用不同策略，不能统一理解为“后者覆盖前者”。

## provide

`provide` 接受对象或返回对象的普通函数。静态对象适合不依赖实例的常量；需要读取 data、computed 或 methods 时，应使用能接收公共实例 `this` 的普通函数。运行时通过 `Reflect.ownKeys()` 注册返回对象，所以字符串 key 与 Symbol key 都有效。

依赖只对当前组件的后代可见；查找沿同一祖先链向上进行，最近祖先提供的同 key 值完整覆盖更远祖先。把 `this.message` 放入返回对象只复制本次求值的普通值，不会自动形成响应式连接。后代需要持续观察变化时，应提供 ref、computed 或 readonly 状态，并把修改命令留在状态拥有者。

~~~~ts
import { computed, readonly } from 'vue'
import { messageKey } from './dependency-keys'

export default {
  /** 创建由当前组件拥有的消息状态。 */
  data() {
    return { message: '准备就绪' }
  },
  methods: {
    /** 通过状态拥有者更新消息。 */
    renameMessage(nextMessage: string) {
      this.message = nextMessage
    },
  },
  /** 向后代提供可观察的只读消息和显式修改命令。 */
  provide() {
    const message = computed(() => this.message)
    return {
      [messageKey]: readonly(message),
      renameMessage: this.renameMessage,
    }
  },
}
~~~~

## inject

`inject` 的数组形式表示“本地属性名与注入 key 同名”，不能配置别名或默认值。对象形式的对象 key 是当前实例上的本地属性名，`from` 才是提供方 key；省略 `from` 时，Vue 用本地名查找。字符串和 Symbol 都可以作为来源 key。

只有整条 provide 链都没有该 key 时才采用 `default`；提供方显式提供 `undefined` 仍然算命中。Options API 会把函数 default 当工厂调用，并把工厂 `this` 绑定到当前公共实例。可变对象要用工厂逐实例创建；如果默认值本身就是函数，则要再包一层返回该函数的工厂。

注入 ref 时，Options API 会在实例属性上代理 ref 的 `.value`，所以 `this.message` 读到的是解包值；若 ref 可写，赋值也会转发到 `.value`。Composition API 的 `inject()` 则返回 ref 本身，需要读取 `.value`；在两种风格之间迁移时必须保留这个差异。

~~~~ts
import { themeKey } from './dependency-keys'

export default {
  inject: {
    localTheme: { from: themeKey, default: 'light' },
    preferences: {
      from: 'preferences',
      /** 为每个消费者创建独立默认对象。 */
      default() {
        return { compact: false }
      },
    },
  },
  /** 使用已经解析完成的注入值创建本地状态。 */
  data() {
    return {
      initialTheme: this.localTheme,
      compact: this.preferences.compact,
    }
  },
}
~~~~

## mixins

`mixins` 接受组件选项数组并按数组顺序合并，适合维护仍采用 Options API 的局部遗留复用。生命周期钩子会组成有序数组，mixin 钩子先于组件自身钩子；methods、computed、components 与 directives 等对象选项按 key 合并，后来源覆盖同名 key；data 与 provide 则组合成逐实例求值的函数。

mixin 的属性来源和冲突不易从组件文件直接看出，公共 mixin 尤其会扩大隐式行为面。新代码通常应优先使用参数、返回值和依赖都显式的 composable；`app.mixin()` 只适合确实需要影响整个应用的框架级行为。

~~~~ts
const auditMixin = {
  /** 创建当前实例独立的审计状态。 */
  data() {
    return { auditReady: false }
  },
  /** 先完成 mixin 的审计初始化。 */
  created() {
    this.auditReady = true
  },
  methods: {
    /** 记录由当前组件发起的审计事件。 */
    recordAudit(event: string) {
      auditLog.write(event)
    },
  },
}

export default {
  mixins: [auditMixin],
  /** 在 mixin 初始化完成后执行组件自身逻辑。 */
  created() {
    if (this.auditReady) this.recordAudit('component-created')
  },
}
~~~~

## extends

`extends` 接受一个组件选项对象，语义上表示当前组件继承一份基组件选项。运行时先递归合并 extends，再合并 mixins，最后合并组件自身，因此它同样遵循每种选项各自的合并策略，而不是复制一个完整实例或建立 JavaScript 原型继承。

`extends` 和 `mixins` 都明确不合并 `setup()`。基组件或 mixin 中的 setup 不能作为组合式逻辑复用入口；应把逻辑提取为 composable，并由最终组件自己的 `setup()` 或 `<script setup>` 显式调用。extends 更适合少量、单一基线的 Options 组件族；多个正交能力应优先改成 composable。

~~~~ts
const paginatedOptions = {
  /** 创建每个实例独立的页码。 */
  data() {
    return { page: 1 }
  },
  methods: {
    /** 前进到下一页。 */
    nextPage() {
      this.page += 1
    },
  },
}

export default {
  extends: paginatedOptions,
  /** 在基线状态就绪后加载当前页。 */
  created() {
    this.loadPage(this.page)
  },
  methods: {
    /** 加载指定页的数据。 */
    loadPage(page: number) {
      return courseApi.loadPage(page)
    },
  },
}
~~~~

## 易错使用提示

:::pitfalls
### 用箭头函数声明需要 this 的 provide

**触发条件：** 用箭头函数声明需要 this 的 provide

**原因：** 箭头函数保留定义位置的词法 this，Vue 无法把当前组件公共实例绑定给它。

**后果：** 读取实例状态时得到 undefined，或在创建组件时直接抛出属性访问错误。

**错误示例：**

~~~~ts
export default {
  /** 错误地使用不能接收实例 this 的箭头函数。 */
  provide: () => ({ message: this.message }),
}
~~~~

**正确写法：**

~~~~ts
export default {
  /** 使用普通函数读取当前实例状态。 */
  provide() {
    return { message: this.message }
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 提供普通快照后期待后代响应更新

**触发条件：** 提供普通快照后期待后代响应更新

**原因：** provide 返回对象中的字符串或数字只是本次求值的普通值，不会因为来源字段是响应式 data 就自动保持连接。

**后果：** 提供方状态已经变化，后代注入属性仍停留在组件创建时的旧值。

**错误示例：**

~~~~ts
export default {
  /** 错误地提供当前字符串快照。 */
  provide() {
    return { message: this.message }
  },
}
~~~~

**正确写法：**

~~~~ts
import { computed, readonly } from 'vue'

export default {
  /** 提供持续追踪实例字段的只读计算值。 */
  provide() {
    const message = computed(() => this.message)
    return { message: readonly(message) }
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 inject 的本地名和来源 key 写反

**触发条件：** 把 inject 的本地名和来源 key 写反

**原因：** inject 对象的 key 是暴露到当前实例的本地名，from 才是沿祖先链查找的 provider key。

**后果：** Vue 查找错误 key，最终使用默认值或得到 undefined，真实依赖被静默绕过。

**错误示例：**

~~~~ts
export default {
  inject: ['localTheme'],
}
~~~~

**正确写法：**

~~~~ts
import { themeKey } from './dependency-keys'

export default {
  inject: {
    localTheme: { from: themeKey, default: 'light' },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 复用可变默认值，或把函数值直接写成 default

**触发条件：** 复用可变默认值，或把函数值直接写成 default

**原因：** 对象字面量会被消费者实例共享；Options API 又会把 default 函数当作工厂立即调用。

**后果：** 一个消费者修改默认对象会影响其他实例，原本要注入的回调也可能被提前执行。

**错误示例：**

~~~~ts
/** 保存缺失注入时使用的回调。 */
const saveHandler = () => saveDraft()

export default {
  inject: {
    filters: { from: 'filters', default: [] },
    onSave: { from: 'onSave', default: saveHandler },
  },
}
~~~~

**正确写法：**

~~~~ts
/** 保存缺失注入时使用的回调。 */
const saveHandler = () => saveDraft()

export default {
  inject: {
    filters: {
      from: 'filters',
      /** 为每个消费者创建独立数组。 */
      default() {
        return []
      },
    },
    onSave: {
      from: 'onSave',
      /** 返回函数值，避免把它当作默认工厂结果。 */
      default() {
        return saveHandler
      },
    },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 mixins 或 extends 会合并 setup

**触发条件：** 认为 mixins 或 extends 会合并 setup

**原因：** setup 没有 Options 合并策略，运行时只从最终组件类型读取并执行原始 setup。

**后果：** 基类或 mixin 中的组合式逻辑、返回绑定与清理钩子完全没有执行。

**错误示例：**

~~~~ts
const trackingMixin = {
  /** 错误地等待组件自动合并此 setup。 */
  setup() {
    useTracking()
  },
}

export default { mixins: [trackingMixin] }
~~~~

**正确写法：**

~~~~ts
import { onMounted, onUnmounted } from 'vue'

/** 复用可显式调用的跟踪逻辑。 */
function useTracking() {
  onMounted(() => tracker.start())
  onUnmounted(() => tracker.stop())
}

export default {
  /** 在最终组件的 setup 中显式组合能力。 */
  setup() {
    useTracking()
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把所有合并冲突都理解成组件覆盖 mixin

**触发条件：** 把所有合并冲突都理解成组件覆盖 mixin

**原因：** 生命周期会组成有序数组，对象选项按同名 key 覆盖，data 与 provide 则在每个实例创建时组合求值。

**后果：** 钩子副作用执行多次或顺序错误，同名 method、computed 或局部资源被意外替换。

**错误示例：**

~~~~ts
const submitMixin = {
  methods: {
    /** 提交 mixin 管理的数据。 */
    submit() {
      legacyApi.submit()
    },
  },
}

export default {
  mixins: [submitMixin],
  methods: {
    /** 错误地用同名方法覆盖 mixin 能力。 */
    submit() {
      modernApi.submit()
    },
  },
}
~~~~

**正确写法：**

~~~~ts
const submitMixin = {
  methods: {
    /** 提交遗留数据。 */
    submitLegacyData() {
      legacyApi.submit()
    },
  },
}

export default {
  mixins: [submitMixin],
  methods: {
    /** 用无冲突名称提交当前数据。 */
    submitCurrentData() {
      modernApi.submit()
    },
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. 合并结果按组件类型缓存

`resolveMergedOptions()` 把全局 mixin、extends、本地 mixins 与组件自身按确定顺序交给 `mergeOptions()`，再缓存组件级结果。合并成本不会在每次渲染更新重复发生，但全局 mixin 仍会扩大每个组件的行为面，只应承载真正的应用级能力。

### 2. 内置选项各有合并策略

生命周期使用数组策略，methods、computed、components 与 directives 使用对象策略，data 与 provide 使用实例期函数策略。`app.config.optionMergeStrategies` 只处理没有内置策略的自定义选项，不能改写这些内置规则。

### 3. setup 位于 Options 合并边界之外

`setup()` 在 `applyOptions()` 前由最终组件类型直接执行，并没有进入 Options 合并策略。这解释了 mixins / extends 不处理 setup；组合式复用应提取 composable，由最终组件显式调用。

### 4. inject 先解析，provide 后求值

`applyOptions()` 先解析 inject，再应用 methods、data、computed 与 watch，随后求值 provide。因此 data 等状态选项可以读取注入属性，而 provide 普通函数可以读取已经建立的实例状态。

### 5. provide 保留 Symbol 并按祖先链分层

Options provide 通过 `Reflect.ownKeys()` 把每个键交给底层 `provide()`，不会漏掉 Symbol；依赖表沿父级 provides 建立原型链，并在当前实例首次提供时才创建局部层。这正好支持最近祖先覆盖和跨层查找。

### 6. inject 默认工厂与 ref 代理属于 Options 适配

`resolveInjections()` 把 default 函数交给底层 inject 的工厂分支并绑定当前公共实例；遇到 ref 时，则在实例上下文上建立转发 `.value` 的访问器。默认值所有权和 ref 解包行为因此都与直接调用组合式 inject 有可观察差异。
:::
