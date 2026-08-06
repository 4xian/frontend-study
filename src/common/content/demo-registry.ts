import { defineAsyncComponent } from 'vue'
import type { Component } from 'vue'

interface VueComponentModule {
  default: Component
}

type ComponentLoader = () => Promise<VueComponentModule>
type SourceLoader = () => Promise<string>
type StepsLoader = () => Promise<string[]>

export interface LocalDemoAssetManifest {
  id: string
  title?: string
  loadComponent: ComponentLoader
  loadSource: SourceLoader
}

export interface ExternalDemoAssetManifest {
  id: string
  title: string
  url: string
}

export type DemoAssetManifest = LocalDemoAssetManifest | ExternalDemoAssetManifest

export interface PrincipleAssetManifest {
  id: string
  loadComponent: ComponentLoader
  loadSteps: StepsLoader
}

const demos = new Map<string, { component: Component; loadSource: SourceLoader }>()
const principles = new Map<string, { component: Component; loadSteps: StepsLoader }>()

/** 把组件加载器包装为 Vue 异步组件。 */
function createAsyncComponent(loader: ComponentLoader): Component {
  return defineAsyncComponent(async () => (await loader()).default)
}

/** 注册模块显式声明的同源 Demo，并拒绝覆盖稳定 ID。 */
export function registerDemoAssets(assets: readonly DemoAssetManifest[]): void {
  for (const asset of assets) {
    if ('url' in asset) continue
    if (demos.has(asset.id)) throw new Error(`重复的 Demo ID：${asset.id}`)
    demos.set(asset.id, {
      component: createAsyncComponent(asset.loadComponent),
      loadSource: asset.loadSource,
    })
  }
}

/** 注册模块显式声明的原理动画，并拒绝覆盖稳定 ID。 */
export function registerPrincipleAssets(assets: readonly PrincipleAssetManifest[]): void {
  for (const asset of assets) {
    if (principles.has(asset.id)) throw new Error(`重复的原理动画 ID：${asset.id}`)
    principles.set(asset.id, {
      component: createAsyncComponent(asset.loadComponent),
      loadSteps: asset.loadSteps,
    })
  }
}

/** 按完整限定 ID 解析 Demo 组件与同源源码加载器。 */
export function resolveDemo(id: string): { component: Component; loadSource: SourceLoader } | null {
  return demos.get(id) ?? null
}

/** 按完整限定 ID 解析原理动画组件与步骤加载器。 */
export function resolvePrinciple(
  id: string,
): { component: Component; loadSteps: StepsLoader } | null {
  return principles.get(id) ?? null
}

/** 当前统一内容合同未登记独立交互组件。 */
export function resolveInteractive(_id: string): Component | null {
  return null
}
