import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import ContentNavigationDrawer from './ContentNavigationDrawer.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ContentNavigationDrawer', () => {
  it('支持三种关闭方式与抽屉内焦点循环', async () => {
    const host = defineComponent({
      components: { ContentNavigationDrawer },
      /**
       * 提供测试宿主控制的抽屉开关状态。
       */
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `
        <button class="trigger" @click="open = true">打开学习路径</button>
        <ContentNavigationDrawer :open="open" title="学习路径" @close="open = false">
          <a href="/reference/vue/core/reactivity/ref">Vue</a>
        </ContentNavigationDrawer>
      `,
    })
    const wrapper = mount(host, { attachTo: document.body })
    const trigger = wrapper.get<HTMLButtonElement>('.trigger')

    trigger.element.focus()
    await trigger.trigger('click')
    await flushPromises()
    expect(document.activeElement).toBe(document.body.querySelector('.drawer-close'))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)

    trigger.element.focus()
    await trigger.trigger('click')
    await flushPromises()
    document.body.querySelector<HTMLButtonElement>('.drawer-close')!.click()
    await flushPromises()
    expect(document.activeElement).toBe(trigger.element)

    trigger.element.focus()
    await trigger.trigger('click')
    await flushPromises()
    document.body.querySelector<HTMLElement>('.navigation-drawer-overlay')!.click()
    await flushPromises()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)

    trigger.element.focus()
    await trigger.trigger('click')
    await flushPromises()
    const closeButton = document.body.querySelector<HTMLButtonElement>('.drawer-close')!
    const lastLink = document.body.querySelector<HTMLAnchorElement>('.navigation-drawer-content a')!

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }),
    )
    expect(document.activeElement).toBe(lastLink)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    expect(document.activeElement).toBe(closeButton)

    trigger.element.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    expect(document.activeElement).toBe(closeButton)

    wrapper.unmount()
  })
})
