import type { ComponentType } from 'react'

type RevealProps = {
  onReveal: () => void
}

interface LazyModule {
  default: ComponentType<RevealProps>
}

let releaseSummaryGate: (() => void) | undefined
let releaseInspectorGate: (() => void) | undefined
let releaseInspectorRevisionGate: (() => void) | undefined
let summaryLoaderCallCount = 0
let inspectorLoaderCallCount = 0
let inspectorRevisionLoaderCallCount = 0

const summaryGate = new Promise<void>((resolve) => {
  releaseSummaryGate = resolve
})

const inspectorGate = new Promise<void>((resolve) => {
  releaseInspectorGate = resolve
})

const inspectorRevisionGate = new Promise<void>((resolve) => {
  releaseInspectorRevisionGate = resolve
})

/** 等待摘要 gate 后加载本地摘要模块。 */
export async function loadSuspenseSummary(): Promise<LazyModule> {
  summaryLoaderCallCount += 1
  await summaryGate
  return import('./suspense-summary')
}

/** 等待检查器 gate 后加载本地检查器模块。 */
export async function loadSuspenseInspector(): Promise<LazyModule> {
  inspectorLoaderCallCount += 1
  await inspectorGate
  return import('./suspense-inspector')
}

/** 等待新版检查器 gate 后加载第二个本地检查器模块。 */
export async function loadSuspenseInspectorRevision(): Promise<LazyModule> {
  inspectorRevisionLoaderCallCount += 1
  await inspectorRevisionGate
  return import('./suspense-inspector-revision')
}

/** 允许外层摘要模块完成加载。 */
export function revealSuspenseSummary(): void {
  releaseSummaryGate?.()
}

/** 允许内层检查器模块完成加载。 */
export function revealSuspenseInspector(): void {
  releaseInspectorGate?.()
}

/** 允许再次挂起后的新版检查器模块完成加载。 */
export function revealSuspenseInspectorRevision(): void {
  releaseInspectorRevisionGate?.()
}

/** 读取摘要 loader 的调用次数。 */
export function getSummaryLoaderCallCount(): number {
  return summaryLoaderCallCount
}

/** 读取检查器 loader 的调用次数。 */
export function getInspectorLoaderCallCount(): number {
  return inspectorLoaderCallCount
}

/** 读取新版检查器 loader 的调用次数。 */
export function getInspectorRevisionLoaderCallCount(): number {
  return inspectorRevisionLoaderCallCount
}
