---
id: vue.core.learn.advanced.shallow-reactivity-raw-boundaries
type: lesson
title: 浅层响应式与原始对象边界
summary: 用根级更新协议管理大型快照、外部对象与 raw / proxy 身份边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.shallow
  - vue.core.reference.reactivity.utils
  - vue.core.reference.reactivity.ref
  - vue.core.learn.basics.reactive-state
  - vue.core.learn.basics.watchers
tags:
  - shallowRef
  - shallowReactive
  - triggerRef
  - toRaw
  - markRaw
  - 不可变更新
  - 对象身份
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue 中文响应式 API：进阶
    url: https://cn.vuejs.org/api/reactivity-advanced.html
  - title: Vue 中文性能优化：减少大型不可变结构的响应性开销
    url: https://cn.vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures
  - title: Vue 响应式进阶 API 官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md
  - title: Vue 3.5.40 ref.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts
  - title: Vue 3.5.40 reactive.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/reactive.ts
  - title: Vue 3.5.40 baseHandlers.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/baseHandlers.ts
  - title: Vue 3.5.40 shallowReactive 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/shallowReactive.spec.ts
  - title: Vue 3.5.40 ref 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - vue.core.learn.intermediate.teleport
objectives:
  - 画出 shallowRef、shallowReactive、raw 对象与 proxy 各自的观察边界
  - 预测 shallowRef 深层修改、根替换与 triggerRef 的不同通知结果
  - 使用不可变根替换更新大型快照，并判断何时才需要显式 triggerRef
  - 区分 shallowReactive 的根属性追踪、嵌套 raw 值与 ref 不解包行为
  - 把浅层响应式限制在状态树根部，避免深浅混合造成不一致语义
  - 把 toRaw 限制为临时读取或身份归一，不通过 raw 引用建立第二条写通道
  - 使用 markRaw 保留明确身份根，并识别它不会递归标记嵌套对象
  - 根据 Vue 3.5.40 源码和测试解释根身份比较、显式触发与身份风险
recap:
  - 浅层 API 只缩小 Vue 的观察边界，不会让内部变化自动获得新的通知方式。
  - shallowRef 默认用新根提交；triggerRef 只适合受控的原地批量事务。
  - shallowReactive 只追踪根属性，嵌套对象与根 ref 都按原样暴露。
  - toRaw 是临时逃生口，业务写入仍应经过 proxy。
  - markRaw 只保护传入的身份根，不递归标记嵌套对象。
  - 没有明确性能、外部所有权或身份需求时，深层 ref / reactive 仍是首选。
---

# 浅层响应式与原始对象边界

## 一、正文大纲

普通 ref 和 reactive 让嵌套对象按需进入深层响应式，这通常是最安全的默认选择。本课处理的是少数需要明确退出深层转换的边界：大型不可变快照、由外部系统管理的对象、不能代理的类实例，以及必须统一 raw / proxy 身份的基础设施。学习顺序是先确定 Vue 观察哪一层，再选择根替换或显式通知协议，最后才使用 toRaw 与 markRaw。

## 二、先画清观察边界

| 工具 | Vue 自动观察的边界 | 默认更新协议 |
| --- | --- | --- |
| ref(对象) | .value 与按需访问的嵌套对象 | 可深改，也可替换根值 |
| shallowRef(对象) | 只有 .value | 创建新对象并替换 .value |
| reactive(对象) | 根属性与按需访问的嵌套对象 | 写入对应代理属性 |
| shallowReactive(对象) | 只有根属性 | 替换需要变化的根属性 |
| toRaw(proxy) | 不创建新观察边界 | 只临时读取，写入仍走 proxy |
| markRaw(对象) | 被标记根对象退出代理转换 | 由对象自己的协议管理变化 |

:::warning
浅层 API 不是“更快的普通响应式”。它把深层变化的通知责任交给根替换协议或显式触发。没有大型深层结构、外部状态所有权或对象身份约束时，继续使用 ref / reactive 更容易维护。
:::

## 三、shallowRef：只让根引用成为信号

shallowRef 内部值按原样保存，只有 .value 的读取和赋值参与响应式。深改内部对象会真的改动原对象，但不会因为这次写入自动安排组件、computed 或 watcher 更新。默认做法是把内部数据当作不可变快照，每次提交都创建新根。

:::compare{before="原地深改：没有根信号" after="根替换：产生新信号"}
### 原地深改：没有根信号

~~~~text
const document = shallowRef({
  title: '初始标题',
  meta: { revision: 0 },
})

document.value.meta.revision++
~~~~

### 根替换：产生新信号

~~~~text
const document = shallowRef({
  title: '初始标题',
  meta: { revision: 0 },
})

document.value = {
  ...document.value,
  meta: { revision: document.value.meta.revision + 1 },
}
~~~~
:::

“没有触发”不等于对象没有变化。若组件后来因其他状态重渲染，模板再次直接读取这个 raw 内部对象时仍可能看到已经深改的值。判断通知是否发生，应观察依赖该 shallow ref 的 watchEffect 运行次数或单独保存的观察快照，而不是只看某次晚到的渲染结果。

:::tip
Vue 仍比较 .value 的根身份。先深改再执行 state.value = state.value 只是把同一对象重新赋回去，不会补发更新；创建新根，或在受控原地批量修改后调用 triggerRef。
:::

## 四、triggerRef：为一次受控提交显式通知

triggerRef(shallow) 会强制通知依赖这个 shallow ref 的副作用重新运行。它不会递归代理内部值，也不会判断哪些深层字段变了。适合外部库必须原地更新、一次事务会改很多字段，且所有写入完成后只需要一次 Vue 通知的边界。

~~~~ts
import { shallowRef, triggerRef } from 'vue'

const scene = shallowRef(externalScene)

/** 把一组外部场景写入合并为一次 Vue 更新。 */
function commitScenePatch(): void {
  scene.value.camera.x = 120
  scene.value.camera.y = 80
  scene.value.selection.clear()
  triggerRef(scene)
}
~~~~

| 情况 | 选择 | 原因 |
| --- | --- | --- |
| 普通业务表单或小对象 | ref / reactive | 深层语义最直接，不需要维护手工通知 |
| 大型不可变快照 | shallowRef + 根替换 | 根引用就是清楚、可追踪的提交信号 |
| 外部库受控原地批量更新 | shallowRef + 一次 triggerRef | 避免每个内部写入都通知 |
| 只想强制刷新界面 | 先修正状态建模 | triggerRef 不应掩盖丢失的响应式依赖 |

## 五、shallowReactive：根属性响应式，嵌套值原样暴露

shallowReactive 适合由多个根槽位组成、但每个槽位内部由其他协议管理的状态容器。根属性读取会收集依赖，根属性写入会通知；嵌套对象不会被转成 proxy，深层写入本身不会通知。要发布新的嵌套状态，应替换对应根属性。

~~~~ts
import { shallowReactive } from 'vue'

const workspace = shallowReactive({
  mode: 'draft',
  document: { title: '初始标题', revision: 0 },
})

workspace.document.revision++ // 深层 raw 写入，不触发
workspace.document = {
  ...workspace.document,
  revision: workspace.document.revision + 1,
} // 替换根属性，触发
workspace.mode = 'published' // 写根属性，触发
~~~~

:::warning
官方明确警告：shallowReactive 应只用于状态树根部。把它嵌进深层 reactive 对象，会让同一棵树不同位置拥有不同响应式语义，调试时很难根据路径预测写入是否触发。
:::

## 六、根属性中的 Ref 不会自动解包

深层 reactive 对普通对象属性中的 ref 有自动解包规则；shallow getter 会在解包逻辑前原样返回，所以根属性中的 ref 仍然是 Ref。这个行为适合保留外部信号对象身份，但调用方必须显式使用 .value。

:::compare{before="误以为已经解包" after="保留 Ref 协议"}
### 误以为已经解包

~~~~text
const source = ref(1)
const state = shallowReactive({ source })

state.source++
~~~~

### 保留 Ref 协议

~~~~text
const source = ref(1)
const state = shallowReactive({ source })

state.source.value++
~~~~
:::

## 七、toRaw：临时穿过代理，不建立第二条写通道

toRaw(proxy) 返回 Vue 代理背后的原始对象。临时检查身份、交给只读诊断工具或避免一次代理读取开销时可以使用；持久保存并通过 raw 写入会绕过代理的追踪和触发，同时让系统长期面对 raw / proxy 两个身份。

~~~~ts
import { reactive, toRaw } from 'vue'

const original = { count: 0 }
const state = reactive(original)

inspectIdentity(toRaw(state) === original) // 临时读取后丢弃 raw
state.count++ // 业务写入继续经过 proxy
~~~~

## 八、markRaw：保护明确的身份根，不递归标记

markRaw(value) 返回 value 本身，并让这个根对象以后进入 reactive 图时仍不被转为 proxy。典型对象是第三方类实例、组件定义、已有独立订阅协议的引擎或明确不可变的大型记录。它不是整棵树的递归标记器。

~~~~ts
import { isReactive, markRaw, reactive } from 'vue'

const engine = markRaw(new ExternalEngine())
const state = reactive({ engine })

state.engine === engine // true
isReactive(state.engine) // false
~~~~

若 marked 根的 nested 没有单独标记，把 nested 直接放进 reactive 容器仍会得到 proxy。rawRoot.nested 与 state.nested 此时引用不同。更稳妥的策略是围绕真正的身份根传递对象，或在跨边界比较、Map key 和去重时使用稳定业务 ID。

:::demo{id="vue.core.learn.advanced.shallow-reactivity-raw-boundaries.shallow-reactivity-boundary-lab-demo" playground="true"}
分别观察 shallowRef、shallowReactive 的原对象当前值、响应式快照与运行次数，并诊断 raw / proxy 身份
:::

## 九、易错使用提示

:::pitfalls
### 深改 shallowRef 后等待自动更新

**触发条件：** 深改 shallowRef 后等待自动更新

**原因：** 把 shallowRef 当成内部对象仍会深层代理的普通 ref，只是希望它拥有更低开销。

**后果：** 原对象已经变化，但依赖它的模板、computed 与 watcher 没有收到这次写入通知。

**错误示例：**

~~~~ts
const state = shallowRef({ count: 0 })
state.value.count++
~~~~

**正确写法：**

~~~~ts
const state = shallowRef({ count: 0 })
state.value = { ...state.value, count: state.value.count + 1 }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把同一对象重新赋回 .value

**触发条件：** 把同一对象重新赋回 .value

**原因：** 深改后尝试用自赋值补发根更新，却没有创建新的根身份。

**后果：** RefImpl 判断新旧根值相同，不会触发依赖，观察方继续停留在旧快照。

**错误示例：**

~~~~ts
state.value.count++
state.value = state.value
~~~~

**正确写法：**

~~~~ts
state.value = {
  ...state.value,
  count: state.value.count + 1,
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 每个细小写入都调用 triggerRef

**触发条件：** 每个细小写入都调用 triggerRef

**原因：** 把 triggerRef 当成深层属性 setter 的固定搭配，而没有定义提交边界。

**后果：** 一次业务事务产生多次无意义通知，既失去批处理收益，也让中间状态被观察到。

**错误示例：**

~~~~ts
scene.value.x = 10
triggerRef(scene)
scene.value.y = 20
triggerRef(scene)
~~~~

**正确写法：**

~~~~ts
scene.value.x = 10
scene.value.y = 20
triggerRef(scene) // 完整事务只提交一次
~~~~

**验证方式：** 对照正确写法验证结果。

### 深改 shallowReactive 的嵌套对象

**触发条件：** 深改 shallowReactive 的嵌套对象

**原因：** 看到容器本身是 proxy，就误以为任意深度写入都会触发。

**后果：** nested 保持 raw，嵌套写入绕过根代理，依赖不会因此重新运行。

**错误示例：**

~~~~ts
const state = shallowReactive({ nested: { count: 0 } })
state.nested.count++
~~~~

**正确写法：**

~~~~ts
const state = shallowReactive({ nested: { count: 0 } })
state.nested = { count: state.nested.count + 1 }
~~~~

**验证方式：** 对照正确写法验证结果。

### 忘记 shallowReactive 不会解包根 Ref

**触发条件：** 忘记 shallowReactive 不会解包根 Ref

**原因：** 沿用 reactive 普通对象属性的 ref 自动解包心智模型。

**后果：** 对 Ref 对象执行数字或字符串运算，得到类型错误或错误业务值。

**错误示例：**

~~~~ts
const count = ref(0)
const state = shallowReactive({ count })
state.count++
~~~~

**正确写法：**

~~~~ts
const count = ref(0)
const state = shallowReactive({ count })
state.count.value++
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 shallowReactive 嵌进深层状态树

**触发条件：** 把 shallowReactive 嵌进深层状态树

**原因：** 在同一棵状态图的中间节点临时退出深层转换。

**后果：** 相邻路径的触发规则不一致，维护者无法只看访问路径预测一次写入是否更新。

**错误示例：**

~~~~ts
const state = reactive({
  settings: shallowReactive({ theme: { dark: false } }),
})
~~~~

**正确写法：**

~~~~ts
const settings = shallowReactive({ theme: { dark: false } })
const session = reactive({ userId: 'u-1' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 长期保存并写入 toRaw 返回值

**触发条件：** 长期保存并写入 toRaw 返回值

**原因：** 把 toRaw 当成解除代理后仍然保持通知连接的状态对象。

**后果：** raw 写入绕过 proxy 触发，同时长期双身份让严格相等和集合 key 变得不可靠。

**错误示例：**

~~~~ts
const state = reactive({ count: 0 })
const raw = toRaw(state)
raw.count++
~~~~

**正确写法：**

~~~~ts
const state = reactive({ count: 0 })
inspectOnce(toRaw(state))
state.count++
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 markRaw 会递归保护整棵对象树

**触发条件：** 认为 markRaw 会递归保护整棵对象树

**原因：** 只标记父对象，却把未标记的 nested 单独放进 reactive 容器。

**后果：** 同一个 nested 同时出现 raw 与 proxy 身份，===、Map key 或去重结果不一致。

**错误示例：**

~~~~ts
const raw = markRaw({ nested: {} })
const state = reactive({ nested: raw.nested })
raw.nested === state.nested // false
~~~~

**正确写法：**

~~~~ts
const raw = markRaw({ id: 'engine-1', nested: {} })
const state = reactive({ engineId: raw.id })
state.engineId === raw.id // 用稳定业务身份比较
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十、从 Vue 3.5.40 源码推导高级场景

:::steps
### 浅层 Ref 仍保留普通 Ref 的根信号

shallowRef 通过 createRef(value, true) 复用 RefImpl，所以可以像普通 Ref 一样交给模板、computed 和 watch；高级用法只应替换内部值的所有权协议，不应读取私有 dep。

### 外部快照可以保留原始身份

shallow 构造分支跳过 toReactive，适合接收状态机、不可变存储或第三方库每次发布的新快照；Vue 只把新根引用当成一次提交。

### 根相等性决定是否自动通知

setter 的 hasChanged 比较解释了结构共享场景：只要顶层快照身份改变就能通知，未变化的嵌套分支仍可复用；同一根自赋值不会通知。

### 一次 triggerRef 可以成为事务提交点

固定实现直接通知当前 Ref 的依赖，因此外部引擎原地完成一组写入后可显式提交一次；这要求调用方清楚拥有该写入事务。

### 深浅代理可以同时包裹同一原对象

shallowReactive 使用独立缓存，说明 proxy 身份不能充当跨模式业务主键；需要跨边界关联时应使用稳定 ID 或在短小位置用 toRaw 归一。

### 根属性仍可用于按槽位订阅

shallow getter 在提前返回前已经 track 根 key，因此一个浅层容器可承载多个独立外部快照槽位；替换某个根属性就只通知读取该槽位的依赖。

### 保留根 Ref 适合信号桥接

ref 解包发生在 shallow 提前返回之后，所以容器可保留第三方或 Vue Ref 的完整身份；消费者必须明确使用 .value，不应混用解包与不解包语义。

### raw 边界必须围绕真正身份根设计

markRaw 只标记传入根，toRaw 只沿代理链取原对象；类实例或引擎可作为完整 identity root 保留，任意拆出的 nested 则应依赖业务 ID，而不是假定递归 raw。
:::

## 十一、练习

:::exercise
### 预测三次 shallowRef 写入

**要求：**

~~~~text
为 shallowRef({ count: 0 }) 建立 watchEffect 运行计数，依次深改、同根自赋值、不可变根替换；先写出每一步的原对象值、观察快照与运行次数，再运行验证。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
深改后原对象为 1，但 effect 不重跑；同根自赋值仍不重跑；创建 count 为 2 的新根后 effect 重跑一次并观察到 2。
~~~~
:::

:::exercise
### 把深层容器改为根槽位协议

**要求：**

~~~~text
把 shallowReactive({ editor: { title, selection } }) 中所有 editor 深改改写为根属性替换，并说明一次更新会通知哪些读取 editor 的消费者。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
每次发布 editor = { ...editor, ...patch }；所有订阅 editor 根槽位的消费者会重跑，未读取 editor 的其他根槽位消费者不会因该 key 写入而触发。
~~~~
:::

:::exercise
### 审计 raw / proxy 集合 key

**要求：**

~~~~text
检查一个同时接收 raw 与 proxy 对象的 Map，选择稳定 ID 或入口处短暂 toRaw 作为唯一 key 协议，并解释为何不能混用。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
raw 与 proxy 是不同引用，混用会产生两条记录；领域对象优先使用稳定业务 ID，基础设施边界可在入口处临时 toRaw 归一后立即丢弃 raw。
~~~~
:::

:::exercise
### 选择浅层工具或保持深层响应式

**要求：**

~~~~text
分别为小型表单、十万字段只读快照、第三方图形引擎实例、普通嵌套设置选择状态工具，并写出更新协议。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
小型表单与普通设置保持 ref / reactive；大型不可变快照用 shallowRef + 根替换；图形引擎用 markRaw 或 shallowRef 持有，并由引擎协议更新、必要时在完整事务后通知 Vue。
~~~~
:::
