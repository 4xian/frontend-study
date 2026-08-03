# Vue Core 高级课程：EffectScope 调研

> 查证日期：2026-08-02  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 中文官网、`vuejs/docs` 官方文档，以及 `vuejs/core@v3.5.40`
> 固定标签源码和官方测试。外部资料只通过 Tavily 定位和提取；博客、问答、issue 与未固定的
> `main` 分支实现不作为课程结论依据。

## 已冻结实施契约

| 项目 | 冻结值 |
| --- | --- |
| 批次 | Vue Core 第二十九批 |
| 课程 ID | `vue.core.learn.advanced.effect-scope` |
| 标题 | EffectScope |
| 阶段 / 分类 | `advanced` / `reactivity-boundaries` |
| 唯一直接前置 | `vue.core.learn.advanced.custom-ref-triggering` |
| 唯一 Demo ID | `vue.core.learn.advanced.effect-scope.effect-scope-lifecycle-lab-demo` |
| Demo 标题 | 为一组副作用建立明确所有者 |
| 易错点 | 恰好 8 个，每项含错误与正确示范 |
| 源码推导 | 恰好 8 个，严格绑定 Vue 3.5.40 |
| 预计时长 | 65 分钟 |

本课只讲副作用的所有权和批量释放，不把 `effectScope()` 包装成新的全局状态方案。教学顺序固定为：
先理解同步收集，再比较普通嵌套与 detached，随后连接组件 `setup()` 的自动释放边界，最后用
`onScopeDispose()` 管理非响应式资源。

## 一手来源

### 公开文档契约

- [Vue 中文响应式 API：进阶](https://cn.vuejs.org/api/reactivity-advanced.html#effectscope)：
  `effectScope()`、`getCurrentScope()`、`onScopeDispose()` 的公开签名和基本语义；组件 `setup()`
  也在 effect scope 中执行；Vue 3.5+ 可用第二个参数抑制无活跃 scope 的警告。
- [Vue 响应式进阶 API 官方 Markdown](https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md)：
  与中文官网交叉核对三项公开 API 的英文原文。
- [Vue 中文侦听器指南：停止侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#stopping-a-watcher)：
  在 `setup()` 中同步创建的侦听器绑定宿主组件并在卸载时停止；异步回调中创建的侦听器需要
  手动停止。
- [Vue 侦听器指南官方 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/essentials/watchers.md)：
  用于交叉核对“同步创建”这一组件所有权边界。

### Vue 3.5.40 固定源码与官方测试

- [`effectScope.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts)：
  `EffectScope` 的父子登记、`run()` 当前作用域恢复、`stop()` 停止顺序、清理列表、分离模式与
  `onScopeDispose()` 注册逻辑。
- [`effect.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effect.ts)：
  `ReactiveEffect` 创建时登记到当前活跃 scope 的实现边界。
- [`computed.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/computed.ts)：
  3.5.40 的 `ComputedRefImpl` 已不再使用 `ReactiveEffect`，也不会登记到 scope 的 `effects`。
- [`component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)：
  组件内部 scope 的建立，以及设置当前组件实例时进入和退出该 scope 的实现证据。
- [`effectScope.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/effectScope.spec.ts)：
  普通嵌套、detached、停止后不再触发、清理回调、非活跃 scope、当前 scope 恢复与重复停止等
  官方回归测试。

`activeEffectScope`、`effects`、`cleanups`、`scopes`、`parent`、`index`、`prevScope` 与组件内部
`instance.scope` 都是 Vue 3.5.40 的实现证据，不是业务代码应读取或修改的公共接口。

## 公开语义与教学边界

### 1. Scope 管的是副作用所有权，不是响应式状态

`effectScope()` 创建一个所有者；在 `scope.run(fn)` 同步执行期间创建、由 `ReactiveEffect` 驱动的
`watch`、`watchEffect` 等副作用会被收集。状态本身仍可继续变化，`scope.stop()` 的结果是已登记的
副作用不再响应，而不是把 ref 变成只读或销毁其值。

官网概括仍把 `computed` 列为可捕获对象，但 Vue 3.5.40 的 `ComputedRefImpl` 已不再使用
`ReactiveEffect`，也不登记到 scope 的 `effects`。固定版本运行验证显示，scope 停止后直接读取该
`computed` 仍会按最新依赖重新计算；若 watcher 消费这个 computed，停止的是 watcher，而不是
computed 本身。课程以 3.5.40 源码和运行结果为版本边界。

### 2. 收集边界是同步调用栈

`run()` 进入 scope，执行传入函数，并在 `finally` 中恢复先前的活跃 scope。异步函数遇到第一个
`await` 后已经从这次同步调用返回；续体中再创建 watcher 或注册 `onScopeDispose()`，不能依赖
原 scope 仍然活跃。官方侦听器指南对组件也冻结了同一原则：同步创建自动绑定，异步创建要手动
拥有和停止。

### 3. 普通嵌套随父级停止

在父 scope 的 `run()` 中创建默认 `effectScope()`，子 scope 会挂到父级。父级 `stop()` 会停止
自身副作用、执行自身 cleanup，并递归停止普通子 scope。子 scope 也可以提前停止；源码会把它从
父级列表中移除，避免继续保留引用。

### 4. Detached 改变的是父子所有权

`effectScope(true)` 不挂入当前父 scope。父级停止后，detached scope 的副作用和资源仍然存活，
必须由明确的更长生命周期所有者调用 `stop()`。它适合共享资源或显式会话，不适合因为“怕被提前
停止”就随手使用。

### 5. `onScopeDispose()` 管理 scope 内的外部资源

`scope.stop()` 能停止被收集的响应式副作用，但不会猜测业务代码创建了哪些事件监听器、连接或
定时器。组合式函数应在活跃 scope 内同步调用 `onScopeDispose()`，登记一个幂等释放函数。它是
不耦合组件的清理协议：在组件中随组件 scope 释放，在独立 scope 中随显式 `stop()` 释放。

### 6. 组件已经提供默认 scope

普通组件的 `setup()` / `<script setup>` 已有所有者。同步创建的 watcher 通常不需要再套一层
`effectScope()`。显式 scope 只在需要“组件卸载之前批量停掉一组功能”或“建立独立于组件的共享
生命周期”时增加价值；detached scope 若要随组件结束，必须显式把 `stop()` 登记回组件 scope。

## 从 Vue 3.5.40 源码推导的 8 个结论

1. **默认构造会登记父子关系。** `EffectScope` 构造器在非 detached 且存在活跃 scope 时记录
   `parent`，并把自己加入父级 `scopes`；适合表示功能树，不应通过内部数组做业务查询。
2. **`run()` 用 `try/finally` 恢复所有权上下文。** 活跃 scope 被临时切换为当前实例，函数结束
   后恢复先前值；嵌套和异常都不会永久污染后续同步代码的当前 scope。
3. **ReactiveEffect 在创建时登记，computed 是 3.5.40 的例外。** `ReactiveEffect` 构造器读取
   当时的 `activeEffectScope` 并加入其 effects；watch 和 watchEffect 因此按创建时机归属。
   `ComputedRefImpl` 直接实现 `Subscriber` 且不登记，scope 停止后仍可读取并重新计算。
4. **停止有明确顺序。** 固定实现先停止当前 effects，再执行当前 cleanups，最后停止普通子 scopes；
   资源清理不应假设子 scope 已经先结束。
5. **停止通过 active 门闩保持幂等。** 第一次 `stop()` 清空 effects、cleanups 与子 scopes 并失活；
   后续调用不会再次执行同一批 cleanup，适合多个退出路径共享一个 dispose 函数。
6. **子级停止使用快照遍历。** 父级停止前复制 `scopes`，允许某个 cleanup 同时停止兄弟 scope 而
   不破坏遍历；课程只观察结果，不依赖数组调整算法。
7. **`onScopeDispose()` 只登记当前 scope。** 有活跃 scope 时回调进入其 cleanups；无 scope 时
   第二参数 `true` 只抑制开发警告，并不会创造所有者或补登记清理。
8. **组件 scope 与用户 scope 共用同一所有权机制。** 组件内部实例持有自己的 scope，并在进入
   setup 上下文时激活它；这解释了同步 watcher 自动停止，也说明 detached scope 必须显式桥接回
   组件或更长生命周期所有者。

## 易错点冻结清单

课程必须以结构化 `pitfalls` 块覆盖以下 8 项：

1. 在 `scope.run()` 外创建 watcher，再期待 `scope.stop()` 接管。
2. 在 `await` 或异步回调之后创建副作用，误以为仍在原 scope。
3. 把 `effectScope(true)` 当作“加强自动管理”，却没有独立 owner。
4. 只停止 watcher，不用 `onScopeDispose()` 清理事件监听器或连接。
5. 在没有活跃 scope 的普通事件回调中调用 `onScopeDispose()`。
6. 对已停止 scope 再次 `run()`，把它当作可重启容器。
7. 用一个应用级大 scope 拥有互不相关的功能，导致停止范围过大。
8. 混淆 watcher 单轮 `onCleanup` 与整个 scope 生命周期的 `onScopeDispose`。

每项都要说明后果，并给出错误与正确代码。正确示例优先使用同步登记、最小所有者和幂等释放，不
通过 `failSilently` 隐藏真实的所有权缺失。

## 高级适用场景

- **可开关功能：** 每次启用创建一个普通 scope，内部同步建立多个 watcher 与资源；禁用只调用
  一次 `stop()`，再次启用则创建新 scope。
- **组合式函数资源协议：** 组合式函数在当前 scope 注册清理，让组件、临时功能 scope 和测试
  harness 共用同一释放接口。
- **共享资源：** detached scope 可以拥有跨组件复用的单例订阅，但必须由引用计数、应用卸载或
  显式服务对象负责停止，不能把 detached 等同于永久。
- **测试隔离：** 测试为一组响应式计算创建 scope，在断言后统一 stop，避免订阅跨用例存活；测试
  仍应断言可观察结果，而不是内部 effects 数组。

## Demo 验收契约

唯一 Demo 使用真实 Vue API 与原生 `EventTarget`：

1. 组件 setup 中确认已有当前 scope。
2. 创建一个父 scope；其内部创建普通子 scope 和 detached scope。
3. 三个 scope 都同步创建 `watch(..., { flush: 'sync' })` 并登记一个事件监听器。
4. 首次推进状态和广播时，三个 scope 都各响应一次。
5. 父 scope 连续停止两次，只让父级与普通子级各清理一次；detached 继续响应。
6. detached 连续停止两次，也只清理一次；此后三组都不再响应。
7. 在组件 scope 上用 `onScopeDispose()` 把 detached 的 stop 桥接到组件卸载，明确组件生命周期
   边界。

Demo 不访问 Vue 内部数组，不使用真实网络或非确定性计时器，不使用 CSS `grid` / `gap`，所有控件
至少 44px，文字放大后可自然换行，reduced motion 下不存在主动运动。

## 定向验证

单个 E2E 覆盖：390px 视口、键盘顺序与焦点、三组响应次数、普通嵌套级联停止、detached 独立
停止、重复 stop 的清理幂等、组件 scope 说明、200% 文字、44px 控件、reduced motion，以及
console warning / error 和 page error 均为空。静态验证执行局部 Prettier、Oxlint、项目 type-check
与该 E2E 的 Playwright `--list`；不由本批启动服务。
