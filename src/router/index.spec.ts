import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import router from './index'

describe('新内容路由', () => {
  it('学习与参考模块进入独立总览，且不注册类别中间页', () => {
    expect(router.resolve('/reference').matched.at(-1)?.redirect).toBeUndefined()
    expect(router.resolve('/learn/vue/core').name).toBe('learn-overview')
    expect(router.resolve('/reference/vue/core').name).toBe('reference-overview')
    expect(router.resolve('/reference/vue').matched).toEqual([])
    expect(router.resolve('/reference/vue/core/reactivity').matched).toEqual([])
  })

  it('不注册旧地址或未匹配地址的兼容路由', () => {
    expect(router.resolve('/vue3/reactivity/ref').matched).toEqual([])
    expect(router.resolve('/not-a-published-route').matched).toEqual([])
  })

  it('生成五级条目路径，并让无效目录范围保持不可用', () => {
    const route = router.resolve({
      name: 'learn-entry',
      params: {
        ecosystem: 'vue',
        module: 'core',
        collection: 'basics',
        entry: 'template-syntax',
      },
    })
    const invalidScope = learningCatalog.getNavigation({
      purpose: 'learn',
      ecosystem: 'unknown',
    })

    expect({ path: route.path, valid: invalidScope.valid }).toEqual({
      path: '/learn/vue/core/basics/template-syntax',
      valid: false,
    })
  })
})
