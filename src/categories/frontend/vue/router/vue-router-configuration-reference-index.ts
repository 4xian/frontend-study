import type { VueRouterReferenceSectionDefinition } from './vue-router-reference-section'

export const vueRouterConfigurationReferenceSections = [
  {
    id: 'create-router',
    title: 'createRouter() 与 RouterOptions',
    items: [
      [
        'interfaces.routeroptions',
        'RouterOptions',
        'public',
        'detail',
        'vue.router.reference.configuration.create-router',
        '三router-options',
      ],
      [
        'functions.createrouter',
        'createRouter',
        'public',
        'detail',
        'vue.router.reference.configuration.create-router',
        '二create-router',
      ],
    ],
  },
  {
    id: 'router-instance',
    title: 'Router 实例',
    items: [
      [
        'interfaces.routerclassic',
        '_RouterClassic',
        'public',
        'merged',
        'vue.router.reference.configuration.router-instance',
        '二router-classic',
      ],
      [
        'type-aliases.router',
        'Router',
        'public',
        'detail',
        'vue.router.reference.configuration.router-instance',
        '一router',
      ],
    ],
  },
  {
    id: 'history',
    title: 'History 与滚动行为',
    items: [
      [
        'interfaces.historystate',
        'HistoryState',
        'public',
        'merged',
        'vue.router.reference.configuration.history',
        '二history-state',
      ],
      [
        'interfaces.routerhistory',
        'RouterHistory',
        'alpha',
        'detail',
        'vue.router.reference.configuration.history',
        '三router-history',
      ],
      [
        'interfaces.routerscrollbehavior',
        'RouterScrollBehavior',
        'public',
        'merged',
        'vue.router.reference.configuration.history',
        '四router-scroll-behavior',
      ],
      [
        'functions.creatememoryhistory',
        'createMemoryHistory',
        'public',
        'detail',
        'vue.router.reference.configuration.history',
        '五create-memory-history',
      ],
      [
        'functions.createwebhashhistory',
        'createWebHashHistory',
        'public',
        'detail',
        'vue.router.reference.configuration.history',
        '六create-web-hash-history',
      ],
      [
        'functions.createwebhistory',
        'createWebHistory',
        'public',
        'detail',
        'vue.router.reference.configuration.history',
        '七create-web-history',
      ],
    ],
  },
] satisfies readonly VueRouterReferenceSectionDefinition[]
