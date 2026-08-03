import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { learningCatalog } from '@/content/catalog'
import reactiveEntry from '@/content/entries/reference/vue/core/reactivity/reactive'
import ReferenceLayout from './ReferenceLayout.vue'

const RouterLinkStub = defineComponent({
  props: {
    to: { type: String, required: true },
  },
  template: '<a :href="to"><slot /></a>',
})

describe('ReferenceLayout', () => {
  it('将关联学习和移动端官方来源放在正文之后', () => {
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'reactivity',
    })
    const wrapper = shallowMount(ReferenceLayout, {
      props: {
        entry: reactiveEntry,
        navigation,
        neighbors: learningCatalog.getNeighbors(reactiveEntry.meta.id),
      },
      slots: {
        default: '<div class="article-body">正文</div>',
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.find('.compact-context').findAll('a')).toHaveLength(0)
    expect(wrapper.findAll('.related-learning .related-link')).toHaveLength(
      reactiveEntry.meta.related?.length ?? 0,
    )
    expect(wrapper.findAll('.mobile-sources a')).toHaveLength(reactiveEntry.meta.sources.length)

    const body = wrapper.get('.article-body').element
    const related = wrapper.get('.related-learning').element
    const sources = wrapper.get('.mobile-sources').element
    expect(body.compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(related.compareDocumentPosition(sources) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
