import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ContentBlock } from '@/content/schema'
import ContentRenderer from './ContentRenderer.vue'

describe('ContentRenderer', () => {
  it('渲染结构内容块并明确显示缺失的定制交互', () => {
    const blocks: ContentBlock[] = [
      {
        type: 'steps',
        items: [{ title: '建立状态', content: '先声明响应式数据。' }],
      },
      {
        type: 'exercise',
        title: '动手练习',
        instructions: '实现一个计数器。',
        answer: '使用 ref 保存计数。',
      },
      {
        type: 'checklist',
        items: [{ label: '计数可以递增', checked: true }],
      },
      {
        type: 'compare',
        before: 'const count = 0',
        after: 'const count = ref(0)',
        labels: ['普通值', '响应式值'],
      },
      {
        type: 'pitfalls',
        items: [
          {
            title: '不要直接解构 reactive',
            description: '解构基本类型属性时，属性访问会在解构完成后结束。',
            consequence: '局部值与源对象断开连接，后续修改不再同步。',
            wrong: { lang: 'ts', content: 'const { count } = reactive({ count: 0 })' },
            correct: { lang: 'ts', content: 'const { count } = toRefs(state)' },
          },
          {
            title: '不要替换 reactive 容器',
            description: '订阅关系建立在原有代理的属性访问上。',
            consequence: '新代理会丢失旧代理已建立的追踪关系。',
            wrong: { lang: 'ts', content: 'state = reactive(nextState)' },
            correct: { lang: 'ts', content: 'Object.assign(state, nextState)' },
          },
        ],
      },
      {
        type: 'interactive',
        id: 'vue.core.reference.reactivity.ref.missing-asset',
      },
    ]

    const wrapper = mount(ContentRenderer, { props: { blocks } })

    expect(wrapper.get('.steps').text()).toContain('建立状态')
    expect(wrapper.get('.exercise').text()).toContain('查看参考答案')
    expect(wrapper.get<HTMLInputElement>('.checklist input').element.checked).toBe(true)
    expect(wrapper.get('.compare').text()).toContain('响应式值')
    expect(wrapper.findAll('.pitfall-item')).toHaveLength(2)
    expect(wrapper.get('.pitfall-item h3').text()).toContain('1. 不要直接解构 reactive')
    expect(wrapper.get('.pitfall-examples').text()).toContain('错误示范')
    expect(wrapper.get('.pitfall-examples').text()).toContain('正确示范')
    expect(wrapper.get('.pitfall-consequence').text()).toContain('实际后果')
    expect(wrapper.get('[role="status"]').text()).toContain(
      'vue.core.reference.reactivity.ref.missing-asset',
    )
  })
})
