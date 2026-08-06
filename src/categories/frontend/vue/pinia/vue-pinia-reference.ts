import type { ReferenceTrackManifest } from '@/common/catalog/types'

export const vuePiniaReferenceManifest: ReferenceTrackManifest = {
  groups: [
    {
      id: 'core',
      title: 'Pinia 核心实例',
      summary: '查询 Pinia 实例的创建、安装、上下文与释放边界。',
      entryIds: ['vue.pinia.reference.core.pinia-instance'],
    },
    {
      id: 'stores',
      title: 'Store 定义与实例',
      summary: '查询 Store 定义方式、实例 surface 与响应式解构。',
      entryIds: [
        'vue.pinia.reference.stores.define-store',
        'vue.pinia.reference.stores.store-shape',
        'vue.pinia.reference.stores.store-to-refs',
      ],
    },
    {
      id: 'observation',
      title: '状态与 Action 观察',
      summary: '查询 Store mutation、状态订阅与 Action 订阅。',
      entryIds: ['vue.pinia.reference.observation.subscriptions'],
    },
    {
      id: 'runtime',
      title: '水合与 HMR',
      summary: '查询 Setup Store 水合控制与 Vite HMR 接入。',
      entryIds: ['vue.pinia.reference.runtime.hydration', 'vue.pinia.reference.runtime.hmr'],
    },
    {
      id: 'plugins',
      title: '插件契约',
      summary: '查询 Pinia plugin 的安装时序、扩展属性、state 双写与类型边界。',
      entryIds: ['vue.pinia.reference.plugins.plugin-contracts'],
    },
    {
      id: 'options-api',
      title: 'Options API Helpers',
      summary: '查询 Options API 的 Store、state、action 映射与 suffix 配置。',
      entryIds: ['vue.pinia.reference.options-api.map-helpers'],
    },
    {
      id: 'boundaries',
      title: 'Restricted 边界',
      summary: '查询 internal 类型的公开签名位置、稳定替代与升级观察边界。',
      entryIds: ['vue.pinia.reference.boundaries.internal-types'],
    },
  ],
}
