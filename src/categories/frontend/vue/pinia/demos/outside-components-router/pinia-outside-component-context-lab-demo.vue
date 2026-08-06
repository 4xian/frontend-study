<script setup lang="ts">
import { createApp, defineComponent, h, onBeforeUnmount, onMounted, ref, type App } from 'vue'
import { createPinia, defineStore, disposePinia, getActivePinia, setActivePinia } from 'pinia'
import {
  RouterView,
  createMemoryHistory,
  createRouter,
  type NavigationGuardReturn,
  useRouter,
} from 'vue-router'

const useAccessStore = defineStore('pinia-p03-outside-access', {
  /** 创建路由访问实验的认证状态。 */
  state: () => ({ signedIn: false }),
  actions: {
    /** 登录当前独立 mini-app 的访问 Store。 */
    signIn(): void {
      this.signedIn = true
    },
  },
})

const MemoryRouteScreen = defineComponent({
  name: 'PiniaMemoryRouteScreen',
  /** 渲染 memory router 的最小路由出口。 */
  setup() {
    /** 返回不影响宿主页面的内存路由标记。 */
    function renderRouteScreen() {
      return h('p', { class: 'memory-screen' }, 'memory router outlet')
    }

    return renderRouteScreen
  },
})

const MiniAppRoot = defineComponent({
  name: 'PiniaOutsideContextMiniApp',
  /** 渲染 mini-app 自己的 RouterView。 */
  setup() {
    /** 返回独立 memory router 的视图出口。 */
    function renderMiniApp() {
      return h(RouterView)
    }

    return renderMiniApp
  },
})

const hostActivePinia = getActivePinia()
const hostUrl = window.location.href
const hostRouter = useRouter()
const hostRoute = hostRouter.currentRoute.value.fullPath
const pinia = createPinia()
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/public', component: MemoryRouteScreen },
    { path: '/secure', component: MemoryRouteScreen, meta: { requiresAuth: true } },
    { path: '/login', component: MemoryRouteScreen },
  ],
})
const miniAppHost = ref<HTMLElement>()
const memoryRoute = ref('等待 memory router')
const guardResult = ref('等待 guard')
const explicitResult = ref('尚未显式读取')
const hostUrlResult = ref('宿主 URL 尚未核对')
const hostRouteResult = ref('宿主 Router route 尚未核对')
const appStatus = ref('等待挂载')
const timeline = ref<string[]>([])
let miniApp: App<Element> | undefined
let mountNode: HTMLElement | undefined
let explicitStore: ReturnType<typeof useAccessStore> | undefined
let guardStore: ReturnType<typeof useAccessStore> | undefined
let active = true

/** 执行会激活 Demo Pinia 的同步操作，并恢复宿主 active Pinia。 */
function preserveHostPinia<T>(operation: () => T): T {
  try {
    return operation()
  } finally {
    setActivePinia(hostActivePinia)
  }
}

/** 追加最近八条确定性路由记录。 */
function appendEvent(message: string): void {
  if (!active) return
  timeline.value = [...timeline.value, message].slice(-8)
}

/** 核对 memory 导航没有修改宿主 URL 或 Router 当前路由。 */
function updateHostContextResults(): void {
  hostUrlResult.value = window.location.href === hostUrl ? '宿主 URL 未变化' : '宿主 URL 已变化'
  hostRouteResult.value =
    hostRouter.currentRoute.value.fullPath === hostRoute
      ? '宿主 Router route 未变化'
      : '宿主 Router route 已变化'
}

const removeGuard = router.beforeEach((to): NavigationGuardReturn => {
  if (!to.meta.requiresAuth) {
    appendEvent(`guard：public ${to.fullPath}`)
    return
  }

  try {
    const access = useAccessStore()
    guardStore = access
    if (to.meta.requiresAuth && !access.signedIn) {
      guardResult.value = 'guard 内延迟取得 Store：redirect'
      appendEvent(`guard：${to.fullPath} -> /login；Store ID：${access.$id}`)
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    guardResult.value = `guard 内延迟取得 Store：allow ${to.fullPath}`
    appendEvent(`guard：allow ${to.fullPath}；Store ID：${access.$id}`)
  } finally {
    setActivePinia(hostActivePinia)
  }
})

const removeAfterEach = router.afterEach((to) => {
  if (!active) return
  memoryRoute.value = `memory：${to.fullPath}`
  updateHostContextResults()
})

/** 安装并挂载独立 Pinia 与 memory router mini-app。 */
async function startMiniApp(): Promise<void> {
  if (!miniAppHost.value || miniApp) return
  mountNode = document.createElement('div')
  miniAppHost.value.append(mountNode)
  miniApp = createApp(MiniAppRoot)
  preserveHostPinia(() => {
    miniApp?.use(pinia)
  })
  await router.push('/public')
  await router.isReady()
  if (!active || !mountNode) return
  preserveHostPinia(() => {
    miniApp?.use(router)
    miniApp?.mount(mountNode!)
  })
  explicitStore = preserveHostPinia(() => useAccessStore(pinia))
  appStatus.value = '独立 mini-app 已挂载'
  updateHostContextResults()
}

/** 导航到受保护的 memory route。 */
async function visitSecureRoute(): Promise<void> {
  await router.push('/secure')
  updateHostContextResults()
  setActivePinia(hostActivePinia)
}

/** 通过显式 Pinia 所属 Store 登录。 */
function signIn(): void {
  if (!explicitStore) return
  preserveHostPinia(() => explicitStore?.signIn())
  appendEvent('组件外显式 Store：signedIn = true')
}

/** 显式取得 Store，并与 guard 内延迟取得的实例比较。 */
function inspectExplicitStore(): void {
  const current = preserveHostPinia(() => useAccessStore(pinia))
  explicitResult.value =
    current === guardStore ? '显式 useStore(pinia) 与 guard 为同一隔离实例' : '实例尚未对齐'
  appendEvent(`显式读取：signedIn=${String(current.signedIn)}`)
}

/** 卸载 mini-app 并清理 Router、节点与独立 Pinia。 */
function cleanupMiniApp(): void {
  removeGuard()
  removeAfterEach()
  preserveHostPinia(() => miniApp?.unmount())
  miniApp = undefined
  mountNode?.remove()
  mountNode = undefined
  preserveHostPinia(() => disposePinia(pinia))
}

onMounted(() => {
  void startMiniApp()
})

onBeforeUnmount(() => {
  active = false
  cleanupMiniApp()
})
</script>

<template>
  <article class="pinia-demo" aria-label="组件外 Store 与路由实验">
    <header class="demo-header">
      <p class="eyebrow">L10 · 组件外使用与路由集成</p>
      <h3>把 useStore 延迟到可用上下文</h3>
      <p>只有本 Demo 使用 memory router；宿主 Router、路由表与浏览器 URL 均保持不变。</p>
    </header>

    <pre
      data-testid="outside-early-call"
    ><code>未执行模块顶层 useStore()：定义可以提前，调用等待 app 安装</code></pre>

    <div ref="miniAppHost" class="mini-app-host" aria-hidden="true"></div>

    <section class="result-panel" aria-label="组件外 Store 结果">
      <p>mini-app：{{ appStatus }}</p>
      <p data-testid="outside-memory-route">{{ memoryRoute }}</p>
      <p data-testid="outside-guard">{{ guardResult }}</p>
      <p data-testid="outside-explicit">{{ explicitResult }}</p>
      <p data-testid="outside-host-url">{{ hostUrlResult }}</p>
      <p data-testid="outside-host-route">{{ hostRouteResult }}</p>
    </section>

    <div class="actions" aria-label="memory router 实验操作">
      <button type="button" @click="visitSecureRoute">访问受保护页</button>
      <button type="button" @click="signIn">登录独立 Store</button>
      <button type="button" @click="inspectExplicitStore">显式读取 Store</button>
    </div>

    <ol class="timeline" aria-label="最近路由事件">
      <li v-for="event in timeline" :key="event">{{ event }}</li>
    </ol>
  </article>
</template>

<style scoped>
.pinia-demo {
  width: 100%;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header p,
.demo-header h3,
.result-panel p {
  margin: 0;
}

.eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 4px;
  font-size: var(--font-size-lg);
}

.demo-header p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

pre {
  max-width: 100%;
  margin: 16px 0 0;
  padding: 12px;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-sunken);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.mini-app-host {
  min-height: 24px;
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.mini-app-host :deep(p) {
  margin: 0;
}

.result-panel {
  margin-top: 12px;
  padding: 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-sunken);
}

.result-panel p + p {
  margin-top: 7px;
}

.result-panel p {
  overflow-wrap: anywhere;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
}

button {
  min-height: 40px;
  margin: 4px 8px 4px 0;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  background: var(--color-bg-sunken);
  cursor: pointer;
}

button:hover {
  border-color: var(--color-accent);
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.timeline {
  margin: 12px 0 0;
  padding: 12px 12px 12px 34px;
  background: var(--color-bg-sunken);
}

.timeline li + li {
  margin-top: 5px;
}

@media (max-width: 520px) {
  .pinia-demo {
    padding: 14px;
  }
}
</style>
