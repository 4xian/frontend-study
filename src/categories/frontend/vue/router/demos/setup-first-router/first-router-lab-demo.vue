<script setup lang="ts">
import { createApp, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import type { App } from 'vue'
import { RouterView, createMemoryHistory, createRouter } from 'vue-router'
import type { Router, RouteRecordRaw } from 'vue-router'

const miniAppHost = ref<HTMLElement | null>(null)
const ready = ref(false)
const currentPath = ref('尚未初始化')
const currentName = ref('无')
const matchedNames = ref('无')
const hostPathBefore = ref('等待挂载')
const hostPathNow = ref('等待挂载')
const timeline = ref<string[]>([])

let miniApp: App<Element> | undefined
let demoRouter: Router | undefined

/** 创建用于独立 RouterView 的静态页面组件。 */
function createRoutePanel(name: string, title: string, description: string) {
  return defineComponent({
    name,
    /** 渲染当前匹配记录对应的可见页面。 */
    setup() {
      return () =>
        h('article', { class: 'route-panel', 'data-testid': 'mini-route-view' }, [
          h('p', { class: 'route-kicker' }, '独立 RouterView'),
          h('h4', title),
          h('p', description),
        ])
    },
  })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: createRoutePanel(
      'FirstRouterHomePanel',
      '首页',
      'memory history 已提交到第一条静态记录。',
    ),
  },
  {
    path: '/about',
    name: 'about',
    component: createRoutePanel(
      'FirstRouterAboutPanel',
      '关于页',
      '地址只存在于独立 router，不会写入浏览器地址栏。',
    ),
  },
]

const MiniAppRoot = defineComponent({
  name: 'FirstRouterMiniApp',
  /** 只渲染当前独立 router 的出口。 */
  setup() {
    return () => h('div', { class: 'mini-app-root' }, [h(RouterView)])
  },
})

/** 读取独立 router 的公开 currentRoute，并更新屏幕状态。 */
function syncVisibleState(label: string): void {
  if (!demoRouter) return
  const route = demoRouter.currentRoute.value
  currentPath.value = route.path
  currentName.value = String(route.name ?? '无')
  matchedNames.value = route.matched.map((record) => String(record.name ?? record.path)).join(' → ')
  hostPathNow.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
  timeline.value = [...timeline.value, `${label}：${route.path}`]
}

/** 只驱动独立 memory router，并等待导航提交后更新状态。 */
async function navigate(path: string, label: string): Promise<void> {
  if (!demoRouter) return
  await demoRouter.push(path)
  syncVisibleState(label)
}

/** 用 replace 回到首页，并清空此前的实验时间线。 */
async function resetDemo(): Promise<void> {
  if (!demoRouter) return
  timeline.value = []
  await demoRouter.replace('/')
  syncVisibleState('重置')
}

/** 挂载独立 mini-app，并显式提交 memory history 的首个位置。 */
onMounted(async () => {
  if (!miniAppHost.value) return

  hostPathBefore.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
  demoRouter = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  miniApp = createApp(MiniAppRoot)
  miniApp.use(demoRouter)

  await demoRouter.push('/')
  await demoRouter.isReady()
  miniApp.mount(miniAppHost.value)
  ready.value = true
  syncVisibleState('初始化')
})

/** 离开课程时卸载 mini-app，并释放其 router 安装关系。 */
onBeforeUnmount(() => {
  miniApp?.unmount()
})
</script>

<template>
  <section class="router-lab" aria-label="独立路由器实验">
    <div class="lab-copy">
      <p class="eyebrow">Memory router</p>
      <h3>两条记录，一份独立 history</h3>
      <p>按钮只改变下方 mini-app 的 currentRoute，课程页地址保持不变。</p>
    </div>

    <div class="route-actions" aria-label="独立路由命令">
      <button type="button" :disabled="!ready" @click="navigate('/', '进入首页')">首页</button>
      <button type="button" :disabled="!ready" @click="navigate('/about', '进入关于页')">
        关于页
      </button>
      <button type="button" :disabled="!ready" @click="resetDemo">重置</button>
    </div>

    <div class="state-strip" aria-live="polite">
      <div>
        <span>currentRoute.path</span>
        <strong data-testid="mini-current-path">{{ currentPath }}</strong>
      </div>
      <div>
        <span>route name</span>
        <strong data-testid="mini-current-name">{{ currentName }}</strong>
      </div>
      <div>
        <span>matched</span>
        <strong data-testid="mini-matched-names">{{ matchedNames }}</strong>
      </div>
    </div>

    <div ref="miniAppHost" class="mini-app-host" />

    <div class="isolation-check">
      <p>
        <span>挂载前宿主路径</span><code>{{ hostPathBefore }}</code>
      </p>
      <p>
        <span>当前宿主路径</span><code data-testid="host-path-now">{{ hostPathNow }}</code>
      </p>
    </div>

    <div class="timeline-panel">
      <h4>导航时间线</h4>
      <ol data-testid="mini-navigation-timeline">
        <li v-for="item in timeline" :key="item">{{ item }}</li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.router-lab {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.lab-copy h3,
.lab-copy p,
.timeline-panel h4 {
  margin: 0;
}

.lab-copy > * + * {
  margin-top: var(--space-2);
}

.eyebrow,
.route-kicker {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.route-actions {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-4) calc(var(--space-2) * -1) 0 0;
}

.route-actions button {
  min-height: 40px;
  padding: 0 var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  transition:
    transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.route-actions button:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.route-actions button:active:not(:disabled) {
  transform: scale(0.97);
}

.route-actions button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.state-strip {
  display: flex;
  flex-wrap: wrap;
  margin: var(--space-3) calc(var(--space-2) * -1) 0 0;
}

.state-strip > div {
  min-width: 150px;
  flex: 1 1 150px;
  padding: var(--space-3);
  margin: 0 var(--space-2) var(--space-2) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.state-strip span,
.isolation-check span {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.state-strip strong {
  display: block;
  margin-top: var(--space-1);
  overflow-wrap: anywhere;
}

.mini-app-host {
  min-height: 132px;
  margin-top: var(--space-3);
}

.mini-app-host :deep(.route-panel) {
  min-height: 132px;
  padding: var(--space-4);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.mini-app-host :deep(.route-panel > * + *) {
  margin-top: var(--space-2);
}

.mini-app-host :deep(.route-panel h4),
.mini-app-host :deep(.route-panel p) {
  margin-bottom: 0;
}

.isolation-check,
.timeline-panel {
  margin-top: var(--space-3);
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.isolation-check p {
  margin: 0;
}

.isolation-check p + p {
  margin-top: var(--space-2);
}

.isolation-check code {
  display: block;
  margin-top: var(--space-1);
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
}

.timeline-panel ol {
  padding-left: var(--space-4);
  margin: var(--space-2) 0 0;
}

.timeline-panel li + li {
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .router-lab {
    padding: var(--space-3);
  }

  .route-actions button {
    flex: 1 1 120px;
  }

  .state-strip > div {
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-actions button {
    transition: none;
  }

  .route-actions button:active:not(:disabled) {
    transform: none;
  }
}
</style>
