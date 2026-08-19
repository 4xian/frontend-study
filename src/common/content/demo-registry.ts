import { defineAsyncComponent } from 'vue'
import type { ComponentType } from 'react'
import type { Component } from 'vue'

interface VueComponentModule {
  default: Component
}

export interface ReactComponentModule {
  default: ComponentType
}

type VueComponentLoader = () => Promise<VueComponentModule>
export type ReactComponentLoader = () => Promise<ReactComponentModule>
type SourceLoader = () => Promise<string>
type StepsLoader = () => Promise<string[]>

export interface VueDemoAssetManifest {
  id: string
  title?: string
  runtime?: 'vue'
  loadComponent: VueComponentLoader
  loadSource: SourceLoader
}

export interface ReactDemoAssetManifest {
  id: string
  title?: string
  runtime: 'react'
  loadComponent: ReactComponentLoader
  loadSource: SourceLoader
}

export interface ExternalDemoAssetManifest {
  id: string
  title: string
  url: string
}

export type LocalDemoAssetManifest = VueDemoAssetManifest | ReactDemoAssetManifest
export type DemoAssetManifest = LocalDemoAssetManifest | ExternalDemoAssetManifest

export interface PrincipleAssetManifest {
  id: string
  loadComponent: VueComponentLoader
  loadSteps: StepsLoader
}

export type ResolvedDemoAsset =
  | { runtime: 'vue'; component: Component; loadSource: SourceLoader }
  | { runtime: 'react'; loadComponent: ReactComponentLoader; loadSource: SourceLoader }

const demos = new Map<string, ResolvedDemoAsset>()
const principles = new Map<string, { component: Component; loadSteps: StepsLoader }>()

// Vite 热更新会重新执行 catalog 模块，先清理旧注册避免同一 ID 被误判为重复。
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    demos.clear()
    principles.clear()
  })
}

/** 把组件加载器包装为 Vue 异步组件。 */
function createAsyncComponent(loader: VueComponentLoader): Component {
  return defineAsyncComponent(async () => (await loader()).default)
}

/** 注册模块显式声明的同源 Demo，并拒绝覆盖稳定 ID。 */
export function registerDemoAssets(assets: readonly DemoAssetManifest[]): void {
  const seenIds = new Set<string>()
  for (const asset of assets) {
    if ('url' in asset) continue
    if (seenIds.has(asset.id)) throw new Error(`重复的 Demo ID：${asset.id}`)
    seenIds.add(asset.id)
    if (asset.runtime === 'react') {
      demos.set(asset.id, {
        runtime: 'react',
        loadComponent: asset.loadComponent,
        loadSource: asset.loadSource,
      })
      continue
    }
    demos.set(asset.id, {
      runtime: 'vue',
      component: createAsyncComponent(asset.loadComponent),
      loadSource: asset.loadSource,
    })
  }
}

/** 注册模块显式声明的原理动画，并拒绝覆盖稳定 ID。 */
export function registerPrincipleAssets(assets: readonly PrincipleAssetManifest[]): void {
  const seenIds = new Set<string>()
  for (const asset of assets) {
    if (seenIds.has(asset.id)) throw new Error(`重复的原理动画 ID：${asset.id}`)
    seenIds.add(asset.id)
    principles.set(asset.id, {
      component: createAsyncComponent(asset.loadComponent),
      loadSteps: asset.loadSteps,
    })
  }
}

/** 按完整限定 ID 解析 Demo 组件与同源源码加载器。 */
export function resolveDemo(id: string): ResolvedDemoAsset | null {
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
