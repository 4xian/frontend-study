import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ContentEntryPage from './ContentEntryPage.vue'

describe('ContentEntryPage', () => {
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('同一条详情页的 hash 变化会定位新的 Reference 锚点', async () => {
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/reference/:ecosystem/:module/:collection/:entry',
          component: ContentEntryPage,
          props: { purpose: 'reference' },
        },
      ],
    })
    const path = '/reference/vue/pinia/core/pinia-instance'
    await router.push(path)
    await router.isReady()
    const wrapper = mount(
      { template: '<RouterView />' },
      {
        attachTo: document.body,
        global: {
          plugins: [router, createPinia()],
          stubs: {
            ReferenceLayout: { template: '<main><slot /></main>' },
          },
        },
      },
    )
    await flushPromises()
    await nextTick()
    expect(router.currentRoute.value.params).toEqual({
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'core',
      entry: 'pinia-instance',
    })
    await vi.waitFor(() => expect(wrapper.text()).toContain('Pinia Interface'))
    const target = document.getElementById('create-pinia')
    expect(target).not.toBeNull()

    await router.push(`${path}#create-pinia`)
    await flushPromises()
    await nextTick()

    expect(router.currentRoute.value.hash).toBe('#create-pinia')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.instances[0]).toBe(target)
    wrapper.unmount()
  })
})
