import type { ReferenceTrackManifest } from '@/common/catalog/types'

export const vueRouterReferenceManifest: ReferenceTrackManifest = {
  groups: [
    {
      id: 'configuration',
      title: '配置、实例与 History',
      summary: '查询 Router 创建配置、实例能力与 History 模式。',
      entryIds: [
        'vue.router.reference.configuration.create-router',
        'vue.router.reference.configuration.router-instance',
        'vue.router.reference.configuration.history',
      ],
    },
    {
      id: 'matching',
      title: '匹配、路由记录与位置',
      summary: '查询 matcher、路由记录、位置以及 params 和 query 的类型契约。',
      entryIds: [
        'vue.router.reference.matching.matcher',
        'vue.router.reference.matching.route-records',
        'vue.router.reference.matching.route-locations',
        'vue.router.reference.matching.params-query',
      ],
    },
    {
      id: 'components',
      title: 'RouterLink 与 RouterView',
      summary: '查询路由链接、活动状态、视图出口和组件类型契约。',
      entryIds: [
        'vue.router.reference.components.router-link',
        'vue.router.reference.components.router-view',
      ],
    },
    {
      id: 'composables',
      title: '组合式 API 与注入边界',
      summary: '查询导航组合式 API、路由组件加载和内部注入键边界。',
      entryIds: [
        'vue.router.reference.composables.navigation',
        'vue.router.reference.composables.injection-keys',
      ],
    },
    {
      id: 'navigation',
      title: '导航守卫与失败',
      summary: '查询导航守卫、返回值与失败判定契约。',
      entryIds: [
        'vue.router.reference.navigation.guards',
        'vue.router.reference.navigation.failures',
      ],
    },
    {
      id: 'typed-routes',
      title: '类型化路由',
      summary: '查询 RouteMap、RouteRecordInfo 与类型化地址家族。',
      entryIds: ['vue.router.reference.typed-routes.route-map'],
    },
    {
      id: 'file-based',
      title: '文件路由',
      summary: '理解页面约定、生成管线与虚拟模块边界。',
      entryIds: [
        'vue.router.reference.file-based.overview',
        'vue.router.reference.file-based.virtual-modules',
      ],
    },
    {
      id: 'tooling',
      title: '构建工具与迁移',
      summary: '查询 Vite、Unplugin、Volar 与 Vue Router 5 迁移入口。',
      entryIds: [
        'vue.router.reference.tooling.unplugin',
        'vue.router.reference.tooling.volar-migration',
      ],
    },
    {
      id: 'experimental',
      title: 'Experimental 观察清单',
      summary: '核对实验入口、导出清单、版本风险与文档冲突。',
      entryIds: ['vue.router.reference.experimental.watchlist'],
    },
  ],
}
