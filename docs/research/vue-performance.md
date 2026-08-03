# Vue Core 高级课程：性能优化调研

> 查证日期：2026-08-02  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 官方中文性能、计算属性、内置指令与渲染机制文档，`vuejs/docs`
> 官方 Markdown，以及 `vuejs/core@v3.5.40` 固定标签源码和官方测试。外部资料只通过
> Tavily 定位和提取；博客、问答、issue、未经固定的 `main` 分支实现与本地既有课程正文不作为
> 技术结论依据。

## 已冻结实施契约

| 项目 | 冻结值 |
| --- | --- |
| 批次 | Vue Core 第二十五批 |
| 课程 ID | `vue.core.learn.advanced.performance` |
| 标题 | 性能优化 |
| 阶段 / 分类 | `advanced` / `performance-and-ssr` |
| 唯一直接前置 | `vue.core.learn.advanced.plugins` |
| 唯一公开 Demo ID | `vue.core.learn.advanced.performance.performance-rendering-lab-demo` |
| Demo 标题 | 稳定输入，减少无关更新 |
| 易错点 | 恰好 8 个，每项含错误与正确示范 |
| 源码推导 | 恰好 8 个，严格绑定 Vue 3.5.40 |
| 预计时长 | 70 分钟 |
| 后续课程 | `vue.core.learn.advanced.ssr-hydration` |

本课不把“性能优化”等同于堆叠指令。教学顺序固定为：先区分加载性能与更新性能并建立测量证据，
再利用 Vue 默认的编译优化和组件更新边界，最后只在已经定位的大型子树或列表中考虑 `v-memo`。
课程不承诺某个优化必然带来固定毫秒收益，也不把开发模式的绝对耗时当作生产结论。

## 一手来源

### 公开文档契约

- [Vue 中文性能优化指南](https://cn.vuejs.org/guide/best-practices/performance)：页面加载与更新
  性能、测量工具、稳定 props、`v-once`、`v-memo`、计算属性稳定性、减少深层响应式开销和
  避免不必要组件抽象。
- [Vue 中文计算属性指南](https://cn.vuejs.org/guide/essentials/computed)：计算属性按响应式依赖
  缓存，方法会在每次重渲染时执行，以及非响应式值不会使缓存失效。
- [Vue 中文内置指令 API：`v-once` 与 `v-memo`](https://cn.vuejs.org/api/built-in-directives.html)：
  两个指令的公开语义、固定长度依赖数组、空数组效果、`v-for` 同元素约束与大型列表适用边界。
- [Vue 中文渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism)：静态提升、更新类型标记、
  树结构打平，以及带编译时信息的虚拟 DOM。
- [Vue 中文响应式进阶：减少大型不可变结构的响应性开销](https://cn.vuejs.org/guide/best-practices/performance#reduce-reactivity-overhead-for-large-immutable-structures)：
  深层响应式默认行为，以及 `shallowRef()` / `shallowReactive()` 只追踪根访问时对应的不可变
  更新约束。本课只介绍选择原则，完整边界留给后续专题。
- [`vuejs/docs` 性能指南 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/best-practices/performance.md)：
  官网英文原始 Markdown，用于交叉核对稳定 props、computed stability 与 `v-memo` 的措辞。
- [`vuejs/docs` 内置指令 Markdown](https://github.com/vuejs/docs/blob/main/src/api/built-in-directives.md)：
  官网英文原始 Markdown，用于交叉核对 memo 依赖和 `v-for` 位置要求。

### Vue 3.5.40 固定源码与官方测试

- [`componentRenderUtils.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts)：
  `shouldUpdateComponent()` 的 patch flag 快路径、完整 props 比较、稳定插槽与 emit listener 处理。
- [`componentRenderUtils.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentRenderUtils.spec.ts)：
  组件更新判断的官方测试，包括相同 props、不同 props、动态 props 与事件监听器。
- [`computed.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts) 与
  [`effect.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)：computed ref
  的依赖、dirty/version 刷新与新旧值变化判断。
- [`computed.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/computed.spec.ts)：
  lazy、缓存、链式 computed、旧值参数与依赖变化后的官方回归测试。
- [`vMemo.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vMemo.ts)：
  模板编译器把 `v-memo` 转为 `withMemo()` 调用并分配渲染缓存槽。
- [`withMemo.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/withMemo.ts)：
  memo 数组比较、缓存 VNode 返回、依赖快照复制和 block tree 追踪。
- [`withMemo.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/withMemo.spec.ts)：
  `v-memo` 在元素、组件、`v-for`、不同依赖值与 `NaN` 下的官方集成测试。

公开文档与源码事实必须分层表达。patch flag、组件内部实例、`renderCache`、`VNode.memo`、
`cacheIndex`、内部 version 与 block tree 都是 Vue 3.5.40 的实现证据，不是业务代码可读取或修改的
公共 API。

## 从基础到高级的教学顺序

正文固定按以下 10 段推进：

1. **先定义目标：** 区分页面加载性能与更新性能，不用单一指标代表全部体验。
2. **先测量：** 用生产构建、Chrome Performance、Vue DevTools profiler 和应用级标记定位热点。
3. **尊重默认优化：** 模板编译器已经缓存静态内容并标记动态绑定，普通页面先保持清晰模板。
4. **稳定组件输入：** 让子组件只接收它直接需要、变化频率更低的 props。
5. **稳定引用：** 避免在父级每次渲染时为对象、数组或函数 prop 创建无意义的新身份。
6. **用 computed 缓存派生：** 依赖不变时重复访问不重新执行 getter；方法没有这层缓存。
7. **保持 computed 输出稳定：** 优先返回原始值；确需对象时，在语义未变时复用旧对象。
8. **选择更新跳过工具：** 永不变化的子树用 `v-once`；大型且已测量的动态子树才考虑
   `v-memo`。
9. **完整列出 memo 依赖：** 固定长度数组必须覆盖子树全部动态语义，`v-for` 时与循环放在
   同一元素。
10. **用源码模型解释结果：** 由组件更新判断、computed version 与 `withMemo()` 缓存解释
    可观察更新次数，不读取内部对象。

## 必须准确覆盖的公开语义

### 1. 先定位加载成本还是更新成本

页面首次可用、包体与网络往返属于加载性能；交互后的组件更新、布局和长任务属于更新性能。Vue
性能指南分别给出 PageSpeed Insights / WebPageTest、Chrome Performance、Vue DevTools profiler
和 `app.config.performance` 等工具。课程示例只验证确定性的更新次数，不用它替代真实应用中的耗时
测量。

### 2. 模板已经获得编译期优化

Vue 同时控制模板编译器与运行时，能缓存静态内容、为动态绑定生成更新类型标记，并把模板的稳定
结构信息交给运行时。业务代码不应为了“手写更快”把普通模板全部改成渲染函数；只有测量证据表明
默认边界仍有明显成本时，才引入额外优化。

### 3. 稳定 props 缩小子组件更新集合

子组件至少一个 prop 变化时才需要更新。若每一行都接收全局 `activeId`，选中项变化会让所有行的
该 prop 改变；父级先计算 `active` 布尔值后，大多数行的 `active` 保持不变，因此只有旧选中项和
新选中项需要更新。

```vue
<!-- 宽输入：所有行都接收变化的 activeId。 -->
<CourseRow v-for="item in items" :key="item.id" :id="item.id" :active-id="activeId" />

<!-- 稳定输入：大多数行的 active 不变。 -->
<CourseRow v-for="item in items" :key="item.id" :id="item.id" :active="item.id === activeId" />
```

### 4. computed 按响应式依赖缓存

computed getter 首次读取时求值，后续读取若其响应式依赖没有变化，就返回缓存结果。方法在组件每次
重渲染时都会执行。缓存不是定时刷新，也不追踪 `Date.now()` 这类非响应式值；需要主动刷新时应把
刷新条件建模为响应式依赖。

### 5. computed 的输出身份也会影响下游更新

Vue 3.4 及更高版本只在 computed 结果相对旧值发生变化时触发下游副作用。每次返回新对象会使
新旧引用始终不同，即使对象字段语义没有改变。优先返回 primitive；确实需要复用对象时，完整计算
新结果后比较语义，并在未变化时返回 getter 收到的旧对象。

### 6. `v-once` 只适合首次渲染后永不变化的内容

`v-once` 会让元素或组件及其整个子树在后续更新中被跳过。它不是“少更新”而是“不再更新”；只要
子树未来可能反映状态变化，就不能用它。

### 7. `v-memo` 用固定长度数组声明子树更新条件

组件重渲染时，若 memo 数组中每个值都与上次相同，Vue 会复用缓存子树，连 VNode 创建和 diff 都
跳过。依赖缺失会冻结本应更新的内容；空数组与 `v-once` 效果相同。该指令面向性能至上且已经定位
的边际场景，不是所有组件的默认装饰。

### 8. `v-memo` 与 `v-for` 必须位于同一元素

大型列表是 `v-memo` 的典型场景。指令应与 `v-for`、`:key` 放在同一元素，Vue 同时使用 key 确定
列表身份，并使用 memo 数组决定该项是否需要更新。把指令放在循环内部子元素上不符合公开约束。

## 从 Vue 3.5.40 源码推导的 8 个结论

1. **动态 props 快路径只比较编译器列出的字段。** `shouldUpdateComponent()` 在优化模式且
   `patchFlag` 含 `PROPS` 时遍历 `dynamicProps`；适合解释稳定 primitive prop 为什么能缩小更新
   范围，但业务代码不应手工伪造 patch flag。
2. **完整 props 路径先比较对象与 key 数量，再逐项比较值。** 没有快路径时，固定实现先处理同一
   props 引用、空值与 key 数量，再由 `hasPropsChanged()` 比较每一项；适合诊断新对象 prop 为何
   触发更新。
3. **事件监听器不是普通业务 prop 变化。** `hasPropsChanged()` 会结合 emits options 忽略已声明
   emit listener 的身份变化；适合解释组件事件处理器与普通函数 prop 的更新边界不同。
4. **computed 读取会先追踪消费者，再同步刷新缓存。** `ComputedRefImpl.value` 先登记订阅关系，
   再调用 `refreshComputed()`，最后同步依赖版本；适合解释 lazy 缓存与下游依赖链，不应读取内部
   `dep` 或 `globalVersion`。
5. **computed 结果用 `Object.is` 语义判断变化。** 固定实现通过共享的 `hasChanged()` 判断新旧值，
   因此 primitive 语义稳定可避免下游触发，新对象引用则不同；`NaN` 与自身按相同值处理。
6. **编译器把 `v-memo` 子树包装为 `withMemo()`。** `transformMemo` 生成 memo 表达式、子树渲染
   函数、`_cache` 与稳定槽位索引，非组件子树还会转为 block；适合说明它为何能跳过 VNode 创建。
7. **运行时浅比较固定长度 memo 数组并保存快照。** `isMemoSame()` 先比数组长度，再逐项使用
   `hasChanged()`；未变化时直接返回缓存 VNode，变化时重新渲染并保存 `memo.slice()`。对象依赖仍
   需要稳定引用，数组元素不会被深比较。
8. **官方 `withMemo` 测试验证的是编译器与运行时组合结果。** 固定测试覆盖普通元素、组件、
   `v-for` 和 `NaN`，并断言非 memo 依赖变化时 DOM 保持旧值；这既证明跳过能力，也证明漏列依赖
   会产生陈旧 UI。

## 易错点冻结清单

以下 8 项必须在课程中以结构化 `pitfalls` 块出现，并且每项同时给出错误与正确示范：

### 1. 让所有列表项接收全局选中 ID

```vue
<!-- 错误：activeId 改变会改变每一行的 prop。 -->
<CourseRow v-for="item in items" :key="item.id" :active-id="activeId" />

<!-- 正确：父级先计算布尔结果。 -->
<CourseRow v-for="item in items" :key="item.id" :active="item.id === activeId" />
```

### 2. 在模板中每次创建新的对象 prop

```vue
<!-- 错误：父级每次渲染都产生新对象身份。 -->
<ResultPanel :options="{ dense: true, locale }" />

<!-- 正确：只在依赖变化时产生新对象。 -->
<ResultPanel :options="panelOptions" />
```

### 3. 用方法重复执行依赖未变的昂贵派生

```vue
<!-- 错误：任意重渲染都会再次执行过滤。 -->
<p>{{ filterVisibleRows(rows).length }}</p>

<!-- 正确：visibleRows 按 rows 与 filter 的响应式依赖缓存。 -->
<p>{{ visibleRows.length }}</p>
```

### 4. computed 每次返回语义相同的新对象

```ts
// 错误：引用每次不同。
const summary = computed(() => ({ isEven: count.value % 2 === 0 }))

// 正确：下游只需要布尔值时直接返回 primitive。
const isEven = computed(() => count.value % 2 === 0)
```

### 5. 用 `v-once` 冻结仍需变化的状态

```vue
<!-- 错误：count 后续变化不会显示。 -->
<p v-once>计数：{{ count }}</p>

<!-- 正确：只有真正永久不变的版本标识使用 v-once。 -->
<p v-once>构建版本：{{ buildVersion }}</p>
```

### 6. `v-memo` 漏列子树动态依赖

```vue
<!-- 错误：title 改变但 selected 不变时，标题会停留在旧值。 -->
<article v-memo="[selected]">{{ title }}</article>

<!-- 正确：列出决定子树输出的全部动态语义。 -->
<article v-memo="[selected, title]">{{ title }}</article>
```

### 7. 把 `v-memo` 放到 `v-for` 内部子元素

```vue
<!-- 错误：memo 没有和循环身份位于同一元素。 -->
<article v-for="item in items" :key="item.id">
  <div v-memo="[item.selected]">{{ item.title }}</div>
</article>

<!-- 正确：v-for、key 与 v-memo 位于同一元素。 -->
<article v-for="item in items" :key="item.id" v-memo="[item.selected]">
  {{ item.title }}
</article>
```

### 8. 未测量就给小组件普遍添加 `v-memo`

```vue
<!-- 错误：把依赖维护成本扩散到普通小组件。 -->
<StatusBadge v-memo="[status]" :status="status" />

<!-- 正确：先保持普通组件契约，让稳定 prop 触发默认跳过。 -->
<StatusBadge :status="status" />
```

## Demo 冻结契约

Demo 只回答一个问题：父组件发生更新时，怎样减少没有语义变化的子组件工作。

- 固定三项课程数据，左右展示“宽 props”与“稳定 props”两条等价列表。
- 宽 props 行接收 `selectedId`，选择改变时三行都更新。
- 稳定 props 行只接收 `active`，选择改变时只有旧选中项与新选中项更新。
- 子组件通过公开生命周期 `onUpdated()` 上报更新，以可见总数呈现确定性差异；不读取内部实例。
- 父级另有“无关刷新”状态。点击后父组件重渲染，但两组子组件 props 都不变，因此更新总数不变。
- 选中摘要使用 computed，并显示 getter 执行次数快照；无关刷新时依赖不变，次数不增加。
- 初始更新数为 `0 / 0`；第一次选择另一项后为 `3 / 2`；无关刷新后仍为 `3 / 2`。
- 不展示毫秒数，不把三项列表的绝对收益宣传为生产收益。
- 所有按钮可键盘操作，双轴至少 44px；390px 和 200% 文字下无截断、重叠或页面横向滚动。
- 不使用动画；`prefers-reduced-motion: reduce` 下仍完整可用。CSS 禁止 `grid` 与 `gap`。

## E2E 冻结契约

只写一条长路径，不使用固定 `waitForTimeout()`：

1. 从插件课程的“下一篇：性能优化”进入本课，验证课程标题、前后篇与唯一 Demo 已解析。
2. 断言初始选中项、两组更新总数、computed 次数与无关刷新次数。
3. 用键盘切换选中项，断言宽 props 增加 3、稳定 props 增加 2，computed 增加 1。
4. 用键盘触发无关刷新，断言父级次数增加，但两组子组件与 computed 次数不变。
5. 再切换一次，断言累计为 `6 / 4`，证明结果可重复。
6. 验证全部按钮 44px、键盘焦点可见、无 console error / warning 和 page error。
7. 在 390px、200% 文本与 reduced motion 条件下复跑关键路径和布局断言。

E2E 的页面可达性依赖共享 manifest 将本条目从 `planned` 切换到 `available`。本批禁止修改共享
manifest，因此独立运行失败时必须区分“课程未接入”与 Demo/断言本身失败。

## 明确不覆盖

- 不讲 SSR / Hydration；它属于下一课。
- 不把 `v-memo` 作为普通组件默认写法，也不把空 memo 数组当作可配置的 `v-once` 替代品。
- 不用 `app.config.performance` 的内部 mark 名称、组件实例字段或 patch flag 作为业务接口。
- 不设计虚拟滚动实现，不新增性能监控依赖，不修改构建、manifest 或 package。
- 不为小型演示制造耗时循环；更新次数只用于解释机制，不替代真实应用 profiling。
