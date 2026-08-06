import type { LearningTrackManifest } from '@/common/catalog/types'

export const vueRouterTrackManifest: LearningTrackManifest = {
  stages: [
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
              status: 'available',
            },
            {
              id: 'vue.router.learn.basics.router-link-view-active',
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.router.learn.basics.nested-routes',
              status: 'available',
            },
            {
              id: 'vue.router.learn.basics.composition-programmatic-navigation',
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.router.learn.intermediate.named-views-route-props',
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.router.learn.intermediate.route-data-fetching',
              status: 'available',
            },
            {
              id: 'vue.router.learn.intermediate.lazy-loading',
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.router.learn.advanced.router-view-slots-transitions',
              status: 'available',
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
              status: 'available',
            },
            {
              id: 'vue.router.learn.advanced.dynamic-routing-router-link',
              status: 'available',
            },
            {
              id: 'vue.router.learn.advanced.typed-file-based-routing',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
