import type { TrackManifest } from '../types'

export const vueRouterTrackManifest: TrackManifest = {
  purpose: 'learn',
  ecosystem: 'vue',
  module: 'router',
  collections: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '建立 Vue Router 的配置、渲染与导航基础。',
      categories: [
        {
          id: 'router-foundations',
          title: '路由器基础',
          summary: '接入路由器，并理解链接、视图与激活状态。',
          topics: ['路由器配置', 'RouterLink', 'RouterView', '激活状态'],
          entries: [
            {
              id: 'vue.router.learn.basics.setup-first-router',
              title: '建立第一个路由器',
              summary: '完成路由器创建、注册与首条路由配置。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.basics.router-link-view-active',
              title: '链接、视图与激活状态',
              summary: '使用 RouterLink 和 RouterView 构建基础导航。',
              status: 'planned',
            },
          ],
        },
        {
          id: 'route-matching-and-navigation',
          title: '路由匹配与导航',
          summary: '组织动态地址、嵌套界面和组合式导航。',
          topics: ['路由参数', '查询参数', '嵌套路由', '编程式导航'],
          entries: [
            {
              id: 'vue.router.learn.basics.route-params-query-matching',
              title: '路由参数、查询与匹配',
              summary: '从地址中读取参数和查询，并理解路由匹配。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.basics.nested-routes',
              title: '嵌套路由',
              summary: '让路由结构与嵌套界面层级保持一致。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.basics.composition-programmatic-navigation',
              title: '组合式 API 与编程式导航',
              summary: '在组件逻辑中读取当前路由并主动导航。',
              status: 'planned',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '组合路由配置并处理导航过程中的应用逻辑。',
      categories: [
        {
          id: 'route-configuration-patterns',
          title: '路由配置模式',
          summary: '使用命名、重定向、别名和视图 Props 表达复杂界面。',
          topics: ['命名路由', '重定向', '别名', '命名视图', '路由 Props'],
          entries: [
            {
              id: 'vue.router.learn.intermediate.named-routes-redirects-aliases',
              title: '命名路由、重定向与别名',
              summary: '为路由建立稳定名称并组织地址兼容关系。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.intermediate.named-views-route-props',
              title: '命名视图与路由 Props',
              summary: '在一个地址中组织多个视图并解耦路由参数。',
              status: 'planned',
            },
          ],
        },
        {
          id: 'navigation-lifecycle-and-data',
          title: '导航生命周期与数据',
          summary: '在导航过程中处理权限、数据和按需加载。',
          topics: ['Route Meta', '导航守卫', '数据获取', '懒加载'],
          entries: [
            {
              id: 'vue.router.learn.intermediate.meta-navigation-guards',
              title: '路由 Meta 与导航守卫',
              summary: '用路由元信息和守卫控制导航流程。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.intermediate.route-data-fetching',
              title: '路由数据获取',
              summary: '围绕路由变化安排页面数据的获取时机。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.intermediate.lazy-loading',
              title: '路由懒加载',
              summary: '按路由拆分并按需加载页面代码。',
              status: 'planned',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '处理导航体验、部署边界与大型应用路由架构。',
      categories: [
        {
          id: 'navigation-experience',
          title: '导航结果与视图体验',
          summary: '识别导航结果，并组合路由视图的过渡能力。',
          topics: ['导航失败', 'RouterView 插槽', '页面过渡'],
          entries: [
            {
              id: 'vue.router.learn.advanced.navigation-failures',
              title: '导航失败',
              summary: '识别并处理取消、重复和被守卫阻止的导航。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.advanced.router-view-slots-transitions',
              title: 'RouterView 插槽与过渡',
              summary: '通过 RouterView 插槽组织页面过渡与缓存。',
              status: 'planned',
            },
          ],
        },
        {
          id: 'production-and-architecture',
          title: '生产环境与路由架构',
          summary: '处理滚动、历史模式、动态路由与类型化工程边界。',
          topics: ['滚动行为', '历史模式', '部署', '动态路由', '类型化路由'],
          entries: [
            {
              id: 'vue.router.learn.advanced.scroll-history-deployment',
              title: '滚动、历史模式与部署',
              summary: '配置滚动行为并正确部署不同历史模式。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.advanced.dynamic-routing-router-link',
              title: '动态路由与 RouterLink 扩展',
              summary: '在运行时调整路由，并扩展导航链接行为。',
              status: 'planned',
            },
            {
              id: 'vue.router.learn.advanced.typed-file-based-routing',
              title: '类型化与文件路由',
              summary: '理解类型化路由和文件路由的工程化取舍。',
              status: 'planned',
            },
          ],
        },
      ],
    },
  ],
}
