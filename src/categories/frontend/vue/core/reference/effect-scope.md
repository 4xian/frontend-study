---
id: vue.core.reference.reactivity.effect-scope
type: reference
title: effectScope()
summary: 创建一个副作用作用域，收集其中创建的 computed / watch / watchEffect，之后可以一次性全部停止
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.ref
  - vue.core.reference.reactivity.reactive
tags:
  - effectScope
  - getCurrentScope
  - onScopeDispose
  - reactivity
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 响应式 API：进阶
    url: https://vuejs.org/api/reactivity-advanced.html
  - title: Vue 3.5.40 effectScope.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/effectScope.ts
group: reactivity
signature: "function effectScope(detached?: boolean): EffectScope"
anchors:
  - effectScope()
  - getCurrentScope()
  - onScopeDispose()
  - EffectScope
  - scope.stop()
  - 易错使用提示
---

# effectScope()

## 一、概述

effectScope() 创建一个"副作用收集箱"：在 `scope.run(fn)` 里创建的所有响应式副作用（computed、watch、watchEffect）都会被登记到这个 scope 上，之后调用 `scope.stop()` 即可一次性全部停止。组件内部正是用它管理副作用的——组件卸载时 Vue 停止组件的 scope，setup 里创建的侦听器随之自动清理。

~~~~ts
function effectScope(detached?: boolean): EffectScope

interface EffectScope {
  run<T>(fn: () => T): T | undefined // scope 已停止时不执行，返回 undefined
  stop(): void
}
~~~~

## 二、基础用法

~~~~ts
import { effectScope, computed, watch, watchEffect } from 'vue'

const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
})

// 一次性停止 scope 内的全部副作用
scope.stop()
~~~~

:::demo{id="vue.core.reference.reactivity.effect-scope.effect-scope-demo" playground="true"}
scope 内创建两个侦听器，stop() 之后再修改数据不再有任何日志输出
:::

## 三、易错使用提示

:::pitfalls
### 在 `scope.run()` 外创建副作用，再期待 `scope.stop()` 接管

**触发条件：** 在 `scope.run()` 外创建副作用，再期待 `scope.stop()` 接管

**原因：** 误以为 scope 会按变量引用或创建先后关系查找副作用。实际捕获依赖“创建时的当前 active scope”，只有 `run()` 的同步调用栈会把目标 scope 设为当前值。

**后果：** 调用 `scope.stop()` 后，外部创建的 watch / watchEffect 仍继续回调；其中的请求、订阅或定时器也可能继续存活。

**错误示例：**

~~~~ts
const stopWatching = watchEffect(loadData)
const scope = effectScope()
scope.stop() // 不会停止上面的 watchEffect
~~~~

**正确写法：**

~~~~ts
const scope = effectScope()
scope.run(() => {
  watchEffect(loadData)
})
scope.stop()
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 `await` 之后才调用 `onScopeDispose()`

**触发条件：** 在 `await` 之后才调用 `onScopeDispose()`

**原因：** 误以为 `scope.run(async () => ...)` 会在 Promise 完成前一直保留 active scope。`run()` 在异步函数返回 Promise 后就执行 `finally` 恢复先前 scope；await 后的续体已不在该同步上下文中。

**后果：** 开发环境提示当前没有 active effect scope，cleanup 没有登记；随后 `scope.stop()` 不会释放资源。

**错误示例：**

~~~~ts
scope.run(async () => {
  const socket = await openSocket()
  onScopeDispose(() => socket.close())
})
~~~~

**正确写法：**

~~~~ts
scope.run(() => {
  const controller = new AbortController()
  onScopeDispose(() => controller.abort())
  void loadStream({ signal: controller.signal })
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 detached scope 当成会随父 scope 自动停止

**触发条件：** 把 detached scope 当成会随父 scope 自动停止

**原因：** `effectScope(true)` 的 `true` 很容易被理解成“启用自动管理”，实际含义是 detached：不挂入当前父 scope 的子 scope 列表。

**后果：** 父组件卸载或父 scope 停止后，detached scope 中的副作用仍运行；重复创建会累积订阅。

**错误示例：**

~~~~ts
const cacheScope = effectScope(true)
cacheScope.run(() => watchEffect(refreshCache))
// 所有者结束时没有 stop
~~~~

**正确写法：**

~~~~ts
const cacheScope = effectScope(true)
cacheScope.run(() => watchEffect(refreshCache))

function disposeCache() {
  cacheScope.stop()
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

`detached: true` 创建"游离"scope：不作为当前 scope 的子级被收集，父级停止时它不受影响，需要自己负责 stop——适合生命周期长于组件的共享状态（如跨组件复用的一份请求缓存）。

## 四、getCurrentScope() 与 onScopeDispose()

~~~~ts
function getCurrentScope(): EffectScope | undefined

function onScopeDispose(fn: () => void, failSilently?: boolean): void
~~~~

`getCurrentScope()` 返回当前活跃的 scope（组件 setup 期间就是组件自己的 scope）。`onScopeDispose()` 在当前 scope 上注册清理回调，scope 停止时调用——它是 `onUnmounted` 的通用化版本：不依赖组件实例，组合式函数用它注册清理逻辑后，既能在组件里用（卸载时清理），也能在独立的 effectScope 里用（stop 时清理）。3.5+ 第二个参数 `failSilently` 可抑制"无活跃 scope"警告。

## 五、最小源码实现

实现核心是一个模块级全局变量 `activeEffectScope`。`run(fn)` 把自己设为当前活跃 scope 再执行 fn，结束后恢复原值（try/finally 保证嵌套正确）；期间创建的 ReactiveEffect 在构造时读取这个全局变量，把自己 push 进 `scope.effects`。`stop()` 遍历停止全部 effects、执行全部 cleanups、递归停止子 scope。非 detached 的 scope 在构造时把自己挂到父 scope 的 `scopes` 数组上——这就形成了组件树对应的 scope 树。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/reactivity/src/effectScope.ts
// 省略 pause/resume、父级数组 O(1) 移除优化与 DEV 警告
let activeEffectScope: EffectScope | undefined

class EffectScope {
  private _active = true
  effects: ReactiveEffect[] = [] // scope 内创建的副作用
  cleanups: (() => void)[] = [] // onScopeDispose 注册的清理回调
  scopes: EffectScope[] | undefined // 子 scope

  constructor(public detached = false) {
    if (!detached && activeEffectScope) {
      // 非游离 scope：挂到父 scope 上，父级 stop 时被连带停止
      ;(activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this)
    }
  }

  run<T>(fn: () => T): T | undefined {
    if (this._active) {
      const prev = activeEffectScope
      try {
        activeEffectScope = this // fn 里创建的副作用都会登记到这里
        return fn()
      } finally {
        activeEffectScope = prev // 恢复，保证嵌套 scope 正确
      }
    }
  }

  stop(): void {
    if (this._active) {
      this._active = false
      for (const effect of this.effects) effect.stop() // 停止全部副作用
      for (const cleanup of this.cleanups) cleanup() // 执行清理回调
      if (this.scopes) {
        for (const child of this.scopes) child.stop() // 递归停止子 scope
      }
    }
  }
}

export function effectScope(detached?: boolean) {
  return new EffectScope(detached)
}

export function getCurrentScope() {
  return activeEffectScope
}

export function onScopeDispose(fn: () => void) {
  activeEffectScope?.cleanups.push(fn)
}

// ReactiveEffect 构造函数里的对应片段（见 effect.ts）：
// if (activeEffectScope && activeEffectScope.active) {
//   activeEffectScope.effects.push(this)
// }
~~~~

:::tip
组件 setup 就运行在组件自己的 scope 里，所以 setup 中创建的 watch/computed 不需要手动停止；effectScope 的价值在组件之外——比如一个被多个组件共享的组合式状态，用 detached scope 管理，最后一个使用者离开时统一 stop。
:::
