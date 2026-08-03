import { defineAsyncComponent } from 'vue'
import type { Component } from 'vue'

interface VueComponentModule {
  default: Component
}

type ComponentLoader = () => Promise<VueComponentModule>
type SourceLoader = () => Promise<string>
type StepsLoader = () => Promise<string[]>

const demoModules = import.meta.glob<VueComponentModule>('../demos/*/*/*/*/*/*.vue')
const demoSources = import.meta.glob<string>('../demos/*/*/*/*/*/*.vue', {
  query: '?raw',
  import: 'default',
})
const legacyDemoModules = import.meta.glob<VueComponentModule>('../demos/vue3/*/*.vue')
const legacyDemoSources = import.meta.glob<string>('../demos/vue3/*/*.vue', {
  query: '?raw',
  import: 'default',
})
const principleModules = import.meta.glob<VueComponentModule>('../animations/*/*/*/*/*/*.vue')
const principleSteps = import.meta.glob<string[]>('../animations/*/*/*/*/*/*.vue', {
  import: 'steps',
})
const legacyPrincipleModules = import.meta.glob<VueComponentModule>('../../animations/*.vue')
const legacyPrincipleSteps = import.meta.glob<string[]>('../../animations/*.vue', {
  import: 'steps',
})
const interactiveModules = import.meta.glob<VueComponentModule>('./assets/*/*/*/*/*/*.vue')

/**
 * 将约定目录下的资产路径转换为稳定的完整限定 ID。
 */
export function assetId(path: string, root: string): string {
  return path
    .slice(root.length)
    .replace(/\.vue$/, '')
    .replaceAll('/', '.')
}

/** 从旧资产路径提取不带扩展名的组件名。 */
function legacyAssetId(path: string): string {
  return `legacy.${path
    .split('/')
    .at(-1)!
    .replace(/\.vue$/, '')}`
}

/**
 * 把组件加载器包装为 Vue 异步组件，调用方无需理解文件模块结构。
 */
function createAsyncComponent(loader: ComponentLoader): Component {
  return defineAsyncComponent(async () => (await loader()).default)
}

const demos = new Map<string, { component: Component; loadSource: () => Promise<string> }>()

for (const [path, loader] of Object.entries(demoModules)) {
  const loadSource = demoSources[path]
  if (!loadSource) continue
  demos.set(assetId(path, '../demos/'), {
    component: createAsyncComponent(loader),
    loadSource,
  })
}

for (const [path, loader] of Object.entries(legacyDemoModules)) {
  demos.set(legacyAssetId(path), {
    component: createAsyncComponent(loader),
    loadSource: legacyDemoSources[path]!,
  })
}

const principles = new Map<string, { component: Component; loadSteps: () => Promise<string[]> }>()

for (const [path, loader] of Object.entries(principleModules)) {
  const loadSteps = principleSteps[path] as StepsLoader | undefined
  if (!loadSteps) continue
  principles.set(assetId(path, '../animations/'), {
    component: createAsyncComponent(loader),
    loadSteps,
  })
}

for (const [path, loader] of Object.entries(legacyPrincipleModules)) {
  principles.set(legacyAssetId(path), {
    component: createAsyncComponent(loader),
    loadSteps: legacyPrincipleSteps[path]!,
  })
}

const interactives = new Map<string, Component>()

for (const [path, loader] of Object.entries(interactiveModules)) {
  interactives.set(assetId(path, './assets/'), createAsyncComponent(loader))
}

/**
 * 按完整限定 ID 解析 Demo 组件与同源源码加载器。
 */
export function resolveDemo(id: string): { component: Component; loadSource: SourceLoader } | null {
  return demos.get(id) ?? null
}

/**
 * 按完整限定 ID 解析原理动画组件与具名步骤加载器。
 */
export function resolvePrinciple(
  id: string,
): { component: Component; loadSteps: StepsLoader } | null {
  return principles.get(id) ?? null
}

/**
 * 按完整限定 ID 解析定制交互组件。
 */
export function resolveInteractive(id: string): Component | null {
  return interactives.get(id) ?? null
}
