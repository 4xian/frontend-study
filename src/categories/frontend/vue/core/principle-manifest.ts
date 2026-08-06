import type { Component } from 'vue'
import type { PrincipleAssetManifest } from '@/common/content/demo-registry'

const principleComponents = import.meta.glob<{ default: Component }>('./demos/**/*.vue')
const principleSteps = import.meta.glob<string[]>('./demos/**/*.vue', { import: 'steps' })

const principleEntries = [
  [
    'vue.core.reference.reactivity-watchers.computed.computed-cache',
    './demos/computed/computed-cache.vue',
  ],
  ['vue.core.reference.reactivity-watchers.watch.watch-timing', './demos/watch/watch-timing.vue'],
  ['vue.core.reference.reactivity.reactive.reactive-proxy', './demos/reactive/reactive-proxy.vue'],
  ['vue.core.reference.reactivity.ref.ref-reactivity', './demos/ref/ref-reactivity.vue'],
] as const

/** 把清单中的原理动画路径转换为显式 registry 资产。 */
function createPrincipleAsset(entry: (typeof principleEntries)[number]): PrincipleAssetManifest {
  const [id, path] = entry
  const loadComponent = principleComponents[path]
  const loadSteps = principleSteps[path]
  if (!loadComponent || !loadSteps) throw new Error(`原理动画清单缺少源码：${path}`)
  return { id, loadComponent, loadSteps }
}

export const vueCorePrincipleAssets = principleEntries.map(createPrincipleAsset)
