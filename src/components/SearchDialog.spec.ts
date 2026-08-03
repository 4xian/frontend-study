import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick } from 'vue'
import SearchDialog from './SearchDialog.vue'
import type { SearchHit } from '@/content/catalog'

const hits: SearchHit[] = [
  {
    id: 'first',
    title: '第一个结果',
    summary: '第一个摘要',
    path: '/first',
    group: 'vue.core',
    groupLabel: 'Vue 核心',
  },
  {
    id: 'second',
    title: '第二个结果',
    summary: '第二个摘要',
    path: '/second',
    group: 'vue.core',
    groupLabel: 'Vue 核心',
  },
]

afterEach(() => {
  document.body.innerHTML = ''
})

describe('SearchDialog', () => {
  it('直接点击第二个结果时不受键盘选中项影响', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/first', component: { template: '<div />' } },
        { path: '/second', component: { template: '<div />' } },
      ],
    })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(SearchDialog, {
      attachTo: document.body,
      props: {
        open: true,
        provider: () => hits,
      },
      global: { plugins: [router] },
    })
    await nextTick()

    const buttons = document.body.querySelectorAll<HTMLButtonElement>('.result')
    expect(buttons).toHaveLength(2)
    buttons[1]!.click()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/second')
    wrapper.unmount()
  })

  it('键盘按分组后的展示顺序选择结果', async () => {
    const interleavedHits: SearchHit[] = [
      hits[0]!,
      {
        id: 'other-group',
        title: '其他分组结果',
        summary: '其他分组摘要',
        path: '/second',
        group: 'vue.router',
        groupLabel: 'Vue Router',
      },
      {
        id: 'third',
        title: '第三个结果',
        summary: '第三个摘要',
        path: '/third',
        group: 'vue.core',
        groupLabel: 'Vue 核心',
      },
    ]
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/second', component: { template: '<div />' } },
        { path: '/third', component: { template: '<div />' } },
      ],
    })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(SearchDialog, {
      attachTo: document.body,
      props: {
        open: true,
        provider: () => interleavedHits,
      },
      global: { plugins: [router] },
    })
    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/third')
    wrapper.unmount()
  })
})
