# Vue Core API 第 34 批：Options 组合与杂项官方调研

> 核对日期：2026-08-03  
> 版本基线：`vue@3.5.40`（固定提交
> `fa2885d8c48768d26f1666a01bd540ffe3b20f9b`）  
> 范围：仅 `vue/core/reference` 的 Options 组合与杂项 8 项，不进入第 35 批

## 冻结结论

本批建立两篇主题合并页，不新增 Demo。Options 写法必须作为独立参考保留；Composition
API、现有课程和参考页只作关联，不替代 `this`、选项合并和局部资源注册语义。

| 官方页面 | 站内 ID | collection | 标题 |
| --- | --- | --- | --- |
| [组合选项](https://cn.vuejs.org/api/options-composition.html) | `vue.core.reference.options-api.composition-options` | `options-api` | `Options API：组合选项` |
| [其他杂项选项](https://cn.vuejs.org/api/options-misc.html) | `vue.core.reference.options-api.misc-options` | `options-api` | `Options API：其他杂项选项` |

## 条目与锚点映射

8 项都保持既有 `merged` 深度；heading 使用 API 展示名，站内 anchor 与当前 manifest
冻结值逐字一致。

| Manifest id | heading | anchor | 目标 entry |
| --- | --- | --- | --- |
| `options-composition.provide` | `provide` | `provide` | `vue.core.reference.options-api.composition-options` |
| `options-composition.inject` | `inject` | `inject` | `vue.core.reference.options-api.composition-options` |
| `options-composition.mixins` | `mixins` | `mixins` | `vue.core.reference.options-api.composition-options` |
| `options-composition.extends` | `extends` | `extends` | `vue.core.reference.options-api.composition-options` |
| `options-misc.name` | `name` | `name` | `vue.core.reference.options-api.misc-options` |
| `options-misc.inherit-attrs` | `inheritAttrs` | `inheritattrs` | `vue.core.reference.options-api.misc-options` |
| `options-misc.components` | `components` | `components` | `vue.core.reference.options-api.misc-options` |
| `options-misc.directives` | `directives` | `directives` | `vue.core.reference.options-api.misc-options` |

## 官方来源

### 中文官网

- [Options API：组合选项](https://cn.vuejs.org/api/options-composition.html)：8 项中前 4 项的
  类型、`provide` 两种形式、`inject` 别名与默认值、mixin 调用顺序及 `extends` 的
  `setup()` 边界。
- [Options API：其他杂项选项](https://cn.vuejs.org/api/options-misc.html)：后 4 项的类型、
  SFC 名称推导、attribute 继承控制和局部资源注册。
- [依赖注入指南](https://cn.vuejs.org/guide/components/provide-inject.html)：最近祖先覆盖、
  响应式值、Symbol key 和状态所有权。
- [透传 Attributes 指南](https://cn.vuejs.org/guide/components/attrs.html)：`$attrs`、
  `inheritAttrs: false`、多根节点警告与显式落点。
- [组件注册指南](https://cn.vuejs.org/guide/components/registration.html)：局部注册作用域、
  PascalCase 约定和 `<script setup>` 导入差异。
- [自定义指令指南](https://cn.vuejs.org/guide/reusability/custom-directives.html)：Options
  局部指令注册名、组件多根限制及仅在需要底层 DOM 操作时使用。
- [KeepAlive 指南](https://cn.vuejs.org/guide/built-ins/keep-alive.html)：`include` / `exclude`
  依组件 `name` 匹配。

### Vue 3.5.40 固定源码与官方测试

- [`componentOptions.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts)：
  Options 应用顺序、`provide` / `inject` 解析、mixins / extends 合并策略，以及 components /
  directives / inheritAttrs 写入实例。
- [`apiInject.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/apiInject.ts)：
  原型链查找、最近提供方优先、默认工厂和实例上下文。
- [`component.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts)：
  组件显式名与编译器推导名的读取边界，以及原始 `setup` 入口。
- [`componentRenderUtils.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentRenderUtils.ts)：
  attrs 自动透传的根 VNode 条件、多根或文本根警告和 `inheritAttrs` 开关。
- [`resolveAssets.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/resolveAssets.ts)：
  组件与指令的局部优先级及 exact / camelCase / PascalCase 名称解析。
- [`componentOptions.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentOptions.spec.ts)、
  [`apiInject.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/apiInject.spec.ts)：
  选项合并、注入默认工厂及其 `this` 绑定的官方回归证据。
- [`rendererAttrsFallthrough.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts)、
  [`resolveAssets.spec.ts`](https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/helpers/resolveAssets.spec.ts)：
  `inheritAttrs`、显式 `$attrs` 展开和来自 mixins / extends 的局部资源解析。

Tavily 只用于检索和抽取上述 Vue 官方域名及 `vuejs/core` 一手来源；没有采用第三方教程
来确定 public contract。

## 类型基线

### 组合选项页

```ts
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
```

### 杂项选项页

```ts
interface ComponentOptions {
  name?: string
  inheritAttrs?: boolean
  components?: Record<string, Component>
  directives?: Record<string, Directive>
}
```

`inheritAttrs` 默认为 `true`。类型块只展示学习所需 public surface，不复制内部泛型。

## 行为边界

### provide

`provide` 接受对象或返回对象的函数。需要读取当前实例的 data、computed 或 methods 时必须
使用普通函数；运行时以组件公开实例作为 `this` 调用它，并通过 `Reflect.ownKeys()` 注册返回
对象，因此 string 与 Symbol key 都有效。

把 `this.message` 的当前字符串直接放进返回对象只会提供该次求值的普通值，不会自动建立
响应式连接。需要后代持续观察变化时应提供 ref、computed 或只读状态与修改命令，并明确
状态所有权。后代只沿同一祖先链查找，最近的同 key 提供方完整覆盖更远提供方。

### inject

数组形式等价于“本地属性名与注入 key 同名”，不能表达别名或默认值。对象形式的 key 是
当前组件公开实例上的本地名，`from` 才是提供方 key；缺失 `from` 时使用本地名查找。

只有 key 在整条 provide 链上不存在时才采用 `default`；提供方显式提供 `undefined` 仍算
命中。Options API 会把函数 default 当工厂执行，并将工厂 `this` 绑定到当前公开实例；若
默认值本身需要是函数，应使用“返回该函数的工厂”。对象和数组默认值也必须由工厂按实例
创建。注入在 methods、data、computed 和 watch 应用前完成，因此后续 Options 可读取它。

在 Options API 中注入 ref 时，运行时在实例代理上建立 `.value` 的读写访问器，所以
`this.injectedRef` 表现为解包后的值；这与 Composition API 中 `inject()` 返回 ref 本身的
写法不同，正文必须明确区分。

### mixins 与 extends

`mixins` 按数组顺序合并，并先于组件自身钩子执行；`extends` 在实现上先于 mixins 合并，
语义上用于继承，mixins 用于组合。生命周期钩子会组成数组，methods、computed、components
和 directives 等对象选项由后合并项的同名 key 覆盖，data / provide 由合并函数在每个实例
创建时求值。正文不能把所有选项描述为同一种“覆盖”。

两者都是 Options API 能力，官方明确排除 `setup()` 合并。基类或 mixin 中声明 `setup()`
不能作为复用入口；Composition 逻辑应提取成 composable，再由最终组件自己的 `setup()` 或
`<script setup>` 显式调用。

### name

`name` 用于组件自身递归引用、Devtools、警告栈以及 `<KeepAlive>` 的 `include` / `exclude`
匹配。SFC 可由文件名推导显示名；Vue 3.2.34+ 的 `<script setup>` 同样自动生成 name。
显式 `name` 会覆盖推导值。注册变量名、模板别名和缓存匹配名不能被当成三个必然相同的
概念；需要稳定跨文件名匹配时应显式声明。

### inheritAttrs

默认情况下，未被 props / emits 消费的 attributes 会落到可透传的单一根元素或组件。
`inheritAttrs: false` 只关闭自动落点，不会从 `$attrs` 删除数据；包装组件必须把 `$attrs`
显式绑定到真正承载语义的元素。多根、文本根或不可透传根没有自动选择目标的能力，多根
组件未消费 `$attrs` 时开发环境会警告。

### components 与 directives

两个对象都只为当前组件实例的模板或渲染上下文注册资源，不会让后代自动可用，也不等于
应用级注册。运行时先查局部表，再查全局表；组件和指令都支持 exact、camelCase 和
PascalCase 解析。组件注册推荐 PascalCase，以便区分原生元素；Options 指令表使用不带
`v-` 的名字，例如 `directives: { focus }` 对应模板中的 `v-focus`。

`<script setup>` 的导入组件和 `vName` 指令变量属于编译器暴露规则，不要求再写 Options
注册表；正文只做对照，不提前展开第 38 批 `<script setup>` 语法。

## 相关站内页面

| 本批页面 | 应关联的现有页面 | 关联原因 |
| --- | --- | --- |
| `composition-options` | `vue.core.reference.composition.provide-inject` | 对照 Options 属性与 Composition 函数的 ref 解包、上下文和响应式差异 |
| `composition-options` | `vue.core.reference.application.application-configuration` | 对照 `app.mixin()` 与自定义 option merge strategy |
| `composition-options` | `vue.core.reference.options-api.state-options` | data、methods、computed 与 inject / provide 的初始化顺序 |
| `composition-options` | `vue.core.reference.options-api.lifecycle-options` | mixin / extends 生命周期合并顺序 |
| `misc-options` | `vue.core.reference.components.attrs` | `$attrs`、多根与显式转发完整说明 |
| `misc-options` | `vue.core.reference.built-ins.keep-alive` | name 与缓存筛选规则 |
| `misc-options` | `vue.core.reference.advanced.custom-directives` | 指令钩子和局部注册的职责边界 |
| `misc-options` | `vue.core.reference.options-api.rendering-options` | 局部资源在模板和 render 中的解析位置 |

## 结构化易错点候选

正文建议保留以下 10 项。每项必须写成独立编号，并包含原因、可观察后果、错误示范和正确
示范；若实现篇幅受限，应合并相邻示例而不是删掉行为边界。

1. **用箭头函数声明需要 `this` 的 provide**
   - 原因：箭头函数保留词法 `this`，运行时无法把组件公开实例绑定进去。
   - 后果：读取 `this.message` 得到 `undefined` 或直接抛错。
   - 错误：`provide: () => ({ message: this.message })`。
   - 正确：使用方法语法返回对象，或在 Composition API 的 setup 上下文直接提供值。
2. **提供普通快照后期待后代响应更新**
   - 原因：`{ message: this.message }` 复制当前普通值，不创建响应式连接。
   - 后果：祖先 data 更新，后代注入值保持旧值。
   - 错误：直接提供字符串、数字或展开后的对象字段。
   - 正确：提供 ref / computed / readonly 状态，并把修改命令留在提供方。
3. **把 inject 对象的本地名和来源 key 写反**
   - 原因：对象 key 是本地属性名，`from` 才是祖先提供的 key。
   - 后果：查找错误 key，得到默认值或 `undefined`。
   - 错误：用数组形式尝试别名，或把 provider key 当成本地字段配置。
   - 正确：`localTheme: { from: themeKey, default: 'light' }`。
4. **把可变默认对象直接复用，或把函数默认值误当工厂结果**
   - 原因：对象字面量会被多个实例共享；Options API 将 default 函数作为工厂调用。
   - 后果：一个消费者修改默认对象会影响其他消费者；期望注入的回调被提前执行。
   - 错误：`default: []` 或 `default: handler`。
   - 正确：`default: () => []`；函数值使用 `default: () => handler`。
5. **认为 mixins / extends 会合并 setup**
   - 原因：官方明确排除 `setup()`，运行时从最终组件类型读取原始 setup。
   - 后果：复用逻辑、返回绑定或清理钩子完全没有执行。
   - 错误：把 setup 写入基类或 mixin 并等待自动组合。
   - 正确：提取 composable，并在最终组件 setup 中显式调用。
6. **把所有 mixin 冲突都理解成“组件覆盖 mixin”**
   - 原因：生命周期合并成有序数组；对象项按 key 覆盖；data / provide 在实例期合并。
   - 后果：重复副作用、钩子顺序错误，或同名 method / component 被替换。
   - 错误：依赖未声明的同名选项碰撞。
   - 正确：避免公共命名冲突，显式记录 extends -> mixins -> component 的来源与策略。
7. **把导入变量名、注册别名和组件 name 当成同一标识**
   - 原因：SFC 文件名可推导 name，局部注册 key 负责模板解析，显式 name 可再覆盖。
   - 后果：递归引用、Devtools 名称或 KeepAlive include / exclude 匹配失败。
   - 错误：重命名 import 后假定缓存匹配名也改变。
   - 正确：稳定缓存契约使用明确 name，并用相同规则配置筛选值。
8. **设置 inheritAttrs: false 后忘记显式转发，或让多根组件自动选择目标**
   - 原因：关闭继承只保留 `$attrs`；fragment 没有唯一落点。
   - 后果：id、ARIA、class 与监听器静默不落到交互元素，或开发环境出现警告。
   - 错误：包装按钮只关闭继承，不在内部 button 上绑定 `$attrs`。
   - 正确：在语义目标上 `v-bind="$attrs"`，多根组件明确唯一承载节点。
9. **认为 components 局部注册会传递给后代，或随意混用命名格式**
   - 原因：局部表只属于当前实例；解析虽兼容多种 casing，作用域不会向下继承。
   - 后果：子组件模板出现 `Failed to resolve component`，或把自定义组件当作原生标签。
   - 错误：只在祖先 components 中注册后让孙组件直接使用。
   - 正确：在每个使用者显式导入/注册，统一 PascalCase 注册名。
10. **在 directives 表中包含 `v-` 前缀，或认为局部指令全局可用**
    - 原因：Options 注册 key 是指令名本体，模板才添加 `v-`；局部表仅当前组件可见。
    - 后果：出现 `Failed to resolve directive`，DOM 行为不执行。
    - 错误：`directives: { 'v-focus': focus }` 后在其他组件直接使用。
    - 正确：当前组件注册 `directives: { focus }`，或确需全应用时使用 `app.directive()`。

## 源码推导与适用场景

1. `resolveMergedOptions()` 只在组件级合并一次并缓存结果；全局 mixins、extends、本地 mixins
   和组件自身按确定顺序进入 `mergeOptions()`。因此合并成本不是每次更新都发生，但全局
   mixin 仍会扩大每个组件的行为面。
2. `mergeOptions()` 对生命周期使用数组策略，对 methods / computed / components / directives
   使用对象策略，对 data / provide 使用实例期函数策略；`app.config.optionMergeStrategies`
   只承接没有内置策略的自定义选项，不能改写内置策略。
3. `setup()` 在 `applyOptions()` 之前由最终组件类型直接执行，且没有 Options 合并策略；这从
   源码侧解释了官网“mixins / extends 不处理 setup”的边界。
4. `applyOptions()` 先解析 inject，再应用 methods、data、computed、watch，随后求值 provide；
   因而 data 可读取注入值，而 provide 函数可以读取已建立的实例状态。
5. Options provide 用 `Reflect.ownKeys()` 逐项调用底层 `provide()`，所以 Symbol key 不会被
   `Object.keys()` 漏掉；依赖表用原型链继承，首次提供时才建立当前实例的局部层。
6. `resolveInjections()` 把 default 函数交给底层 inject 的工厂分支，并绑定当前公开实例；
   注入 ref 则在 Options 上建立 `.value` 代理访问器。适合在正文解释默认工厂和 API 风格差异。
7. `renderComponentRoot()` 仅在允许透传的元素或组件根上 clone VNode 并合并 attrs；fragment、
   文本根与注释根无法自动承接。`inheritAttrs: false` 在这个 clone 分支前直接关闭自动行为。
8. `resolveAssets()` 先解析实例的局部 components / directives，再解析 app 全局表，并按 exact、
   camelCase、PascalCase 尝试名称；这支持模板 casing，但不改变局部注册作用域。
9. `applyOptions()` 把合并后的 components 与 directives 表挂到当前实例，因此来自 extends /
   mixins 的资源可以被当前组件解析；官方测试也覆盖该场景，但它们仍不会变成后代的局部表。
10. 组件名读取区分显式 name 与编译器推导名；需要递归自引用或 KeepAlive 稳定筛选时，应把
    名称视为组件契约，而不是依赖偶然的 import 别名。

## 实施验收与停止边界

1. 只新增 `composition-options` 与 `misc-options` 两篇 Reference，不新增 Demo。
2. 两页 `collection` 均为 `options-api`，8 个 API 各有真实、唯一 heading anchor；页面正文
   和 manifest target 完成前不得切换状态。
3. 两页至少保留上述签名、行为边界、10 个结构化易错点和源码推导；避免重复现有
   provide/inject、attrs、KeepAlive 与自定义指令长文。
4. 本批完成后覆盖必须为 `123 available / 83 planned / 206 total`，Options API 必须为
   `33 available / 13 planned`。
5. 第 35 批组件实例 13 项：`$data`、`$props`、`$el`、`$options`、`$parent`、`$root`、
   `$slots`、`$refs`、`$attrs`、`$watch()`、`$emit()`、`$forceUpdate()`、`$nextTick()` 仍全部
   保持 `planned` 且没有 target，本批不得提前建立组件实例正文。
6. 实施时补一个 manifest 完整性断言，并运行全量质量 Gate；代表性移动端路径应验证两页
   8 个 heading、切页滚动归零、无横向溢出和控制台错误。
7. 第 34 批未达到覆盖计数、映射、内容、验证及 Standards / Spec `PASS / 0 finding` 前，
   不开始第 35 批。
