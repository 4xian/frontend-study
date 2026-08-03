/* demo 与动画组件收集表：组件名 → 异步组件 / 源码字符串（需求文档 §3.5、§3.6） */
import { defineAsyncComponent } from 'vue'
import type { Component } from 'vue'

/** demo 组件懒加载表：content/demos/<板块>/<分类>/<名字>.vue */
const demoModules = import.meta.glob<{ default: Component }>('./demos/*/*/*.vue')

/** demo 源码表：同一文件的 ?raw 导入（与运行组件同源，永不脱节） */
const demoSources = import.meta.glob<string>('./demos/*/*/*.vue', {
  query: '?raw',
  import: 'default',
})

/** 动画组件懒加载表：src/animations/<名字>.vue */
const animationModules = import.meta.glob<{ default: Component }>('../animations/*.vue')

/** 动画解说文字表：动画组件以具名导出 steps 声明每步解说 */
const animationSteps = import.meta.glob<string[]>('../animations/*.vue', {
  import: 'steps',
})

/**
 * 从文件路径表中按组件名（不含扩展名的文件名）取出加载函数
 */
function findByName<T>(table: Record<string, T>, name: string): T | undefined {
  const entry = Object.entries(table).find(([path]) => path.endsWith(`/${name}.vue`))
  return entry?.[1]
}

/**
 * 按名字解析 demo 异步组件（如 'BasicRef'）
 */
export function resolveDemo(name: string): Component | null {
  const loader = findByName(demoModules, name)
  return loader ? defineAsyncComponent(loader) : null
}

/**
 * 按名字加载 demo 源码字符串
 */
export async function loadDemoSource(name: string): Promise<string> {
  const loader = findByName(demoSources, name)
  return loader ? loader() : ''
}

/**
 * 按名字解析原理动画异步组件（如 'RefReactivity'）
 */
export function resolveAnimation(name: string): Component | null {
  const loader = findByName(animationModules, name)
  return loader ? defineAsyncComponent(loader) : null
}

/**
 * 按名字加载动画的每步解说文字
 */
export async function loadAnimationSteps(name: string): Promise<string[]> {
  const loader = findByName(animationSteps, name)
  return loader ? loader() : []
}
