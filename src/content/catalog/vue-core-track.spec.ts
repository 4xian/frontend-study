import { expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'

it('生产课程 track 保持唯一顺序且前置课程只指向已存在的更早条目', () => {
  const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'core' })
  const entryIds = track?.entries.map((entry) => entry.entryId) ?? []

  expect({
    stages: track?.stages.map((stage) => ({
      id: stage.id,
      entryIds: stage.entries.map((entry) => entry.entryId),
    })),
    entryIds: track?.entries.map((entry) => entry.entryId),
    total: track?.total,
  }).toEqual({
    stages: [
      {
        id: 'basics',
        entryIds: [
          'vue.core.learn.basics.sfc-basics',
          'vue.core.learn.basics.template-syntax',
          'vue.core.learn.basics.conditional-list-rendering',
          'vue.core.learn.basics.reactive-state',
          'vue.core.learn.basics.computed-properties',
          'vue.core.learn.basics.watchers',
          'vue.core.learn.basics.event-handling',
          'vue.core.learn.basics.form-bindings',
          'vue.core.learn.basics.component-basics',
          'vue.core.learn.basics.props',
          'vue.core.learn.basics.emits',
        ],
      },
      {
        id: 'intermediate',
        entryIds: [
          'vue.core.learn.intermediate.lifecycle-update-timing',
          'vue.core.learn.intermediate.template-refs',
          'vue.core.learn.intermediate.slots',
          'vue.core.learn.intermediate.attrs',
          'vue.core.learn.intermediate.component-v-model',
          'vue.core.learn.intermediate.composables',
          'vue.core.learn.intermediate.provide-inject',
          'vue.core.learn.intermediate.transitions',
          'vue.core.learn.intermediate.dynamic-components-keep-alive',
          'vue.core.learn.intermediate.teleport',
        ],
      },
      {
        id: 'advanced',
        entryIds: [
          'vue.core.learn.advanced.shallow-reactivity-raw-boundaries',
          'vue.core.learn.advanced.custom-ref-triggering',
          'vue.core.learn.advanced.effect-scope',
          'vue.core.learn.advanced.async-components-suspense',
          'vue.core.learn.advanced.error-handling',
          'vue.core.learn.advanced.custom-directives',
          'vue.core.learn.advanced.render-functions-vnodes',
          'vue.core.learn.advanced.plugins',
          'vue.core.learn.advanced.performance',
          'vue.core.learn.advanced.ssr-hydration',
        ],
      },
    ],
    entryIds: [
      'vue.core.learn.basics.sfc-basics',
      'vue.core.learn.basics.template-syntax',
      'vue.core.learn.basics.conditional-list-rendering',
      'vue.core.learn.basics.reactive-state',
      'vue.core.learn.basics.computed-properties',
      'vue.core.learn.basics.watchers',
      'vue.core.learn.basics.event-handling',
      'vue.core.learn.basics.form-bindings',
      'vue.core.learn.basics.component-basics',
      'vue.core.learn.basics.props',
      'vue.core.learn.basics.emits',
      'vue.core.learn.intermediate.lifecycle-update-timing',
      'vue.core.learn.intermediate.template-refs',
      'vue.core.learn.intermediate.slots',
      'vue.core.learn.intermediate.attrs',
      'vue.core.learn.intermediate.component-v-model',
      'vue.core.learn.intermediate.composables',
      'vue.core.learn.intermediate.provide-inject',
      'vue.core.learn.intermediate.transitions',
      'vue.core.learn.intermediate.dynamic-components-keep-alive',
      'vue.core.learn.intermediate.teleport',
      'vue.core.learn.advanced.shallow-reactivity-raw-boundaries',
      'vue.core.learn.advanced.custom-ref-triggering',
      'vue.core.learn.advanced.effect-scope',
      'vue.core.learn.advanced.async-components-suspense',
      'vue.core.learn.advanced.error-handling',
      'vue.core.learn.advanced.custom-directives',
      'vue.core.learn.advanced.render-functions-vnodes',
      'vue.core.learn.advanced.plugins',
      'vue.core.learn.advanced.performance',
      'vue.core.learn.advanced.ssr-hydration',
    ],
    total: 31,
  })

  expect(new Set(entryIds).size).toBe(entryIds.length)
  expect(learningCatalog.getEntry('vue.core.learn.basics.component-basics')?.prerequisites).toEqual(
    ['vue.core.learn.basics.form-bindings'],
  )
  expect(learningCatalog.getEntry('vue.core.learn.basics.props')?.prerequisites).toEqual([
    'vue.core.learn.basics.component-basics',
  ])
  expect(learningCatalog.getEntry('vue.core.learn.basics.emits')).toMatchObject({
    prerequisites: ['vue.core.learn.basics.props'],
    related: ['vue.core.learn.basics.props', 'vue.core.reference.components.emits'],
  })
  expect(
    learningCatalog.getEntry('vue.core.learn.intermediate.lifecycle-update-timing'),
  ).toMatchObject({
    prerequisites: ['vue.core.learn.basics.emits'],
    related: [
      'vue.core.reference.composition.lifecycle',
      'vue.core.reference.application.next-tick',
    ],
  })
  expect(learningCatalog.getEntry('vue.core.learn.intermediate.template-refs')).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.lifecycle-update-timing'],
    related: [
      'vue.core.learn.intermediate.lifecycle-update-timing',
      'vue.core.reference.composition.template-refs',
      'vue.core.reference.components.props',
      'vue.core.reference.components.emits',
    ],
  })
  const slotsEntry = learningCatalog.getEntry('vue.core.learn.intermediate.slots')
  expect(slotsEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.template-refs'],
    related: [
      'vue.core.learn.intermediate.template-refs',
      'vue.core.learn.basics.component-basics',
      'vue.core.learn.basics.props',
      'vue.core.reference.components.slots',
    ],
  })
  for (const relatedId of slotsEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const attrsEntry = learningCatalog.getEntry('vue.core.learn.intermediate.attrs')
  expect(attrsEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.slots'],
    related: [
      'vue.core.learn.intermediate.slots',
      'vue.core.learn.basics.props',
      'vue.core.learn.basics.emits',
      'vue.core.reference.components.attrs',
    ],
  })
  for (const relatedId of attrsEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const componentVModelEntry = learningCatalog.getEntry(
    'vue.core.learn.intermediate.component-v-model',
  )
  expect(componentVModelEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.attrs'],
    related: [
      'vue.core.learn.intermediate.attrs',
      'vue.core.learn.basics.form-bindings',
      'vue.core.learn.basics.props',
      'vue.core.learn.basics.emits',
      'vue.core.reference.components.define-model',
    ],
  })
  for (const relatedId of componentVModelEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const composablesEntry = learningCatalog.getEntry('vue.core.learn.intermediate.composables')
  expect(composablesEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.component-v-model'],
    related: [
      'vue.core.learn.intermediate.component-v-model',
      'vue.core.learn.basics.watchers',
      'vue.core.reference.advanced.composables',
      'vue.core.reference.reactivity.utils',
      'vue.core.reference.composition.lifecycle',
    ],
  })
  for (const relatedId of composablesEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const provideInjectEntry = learningCatalog.getEntry('vue.core.learn.intermediate.provide-inject')
  expect(provideInjectEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.composables'],
    related: [
      'vue.core.learn.intermediate.composables',
      'vue.core.learn.basics.props',
      'vue.core.reference.composition.provide-inject',
      'vue.core.reference.reactivity.readonly',
      'vue.core.reference.application.create-app',
    ],
  })
  for (const relatedId of provideInjectEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const transitionsEntry = learningCatalog.getEntry('vue.core.learn.intermediate.transitions')
  expect(transitionsEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.provide-inject'],
    related: [
      'vue.core.learn.intermediate.provide-inject',
      'vue.core.learn.basics.conditional-list-rendering',
      'vue.core.learn.intermediate.lifecycle-update-timing',
      'vue.core.reference.built-ins.transition',
    ],
  })
  for (const relatedId of transitionsEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const dynamicComponentsEntry = learningCatalog.getEntry(
    'vue.core.learn.intermediate.dynamic-components-keep-alive',
  )
  expect(dynamicComponentsEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.transitions'],
    related: [
      'vue.core.learn.intermediate.transitions',
      'vue.core.learn.basics.component-basics',
      'vue.core.learn.intermediate.lifecycle-update-timing',
      'vue.core.reference.built-ins.keep-alive',
    ],
  })
  for (const relatedId of dynamicComponentsEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const teleportEntry = learningCatalog.getEntry('vue.core.learn.intermediate.teleport')
  expect(teleportEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.dynamic-components-keep-alive'],
    related: [
      'vue.core.learn.intermediate.dynamic-components-keep-alive',
      'vue.core.learn.intermediate.transitions',
      'vue.core.reference.composition.provide-inject',
      'vue.core.reference.built-ins.teleport',
    ],
  })
  for (const relatedId of teleportEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const shallowBoundariesEntry = learningCatalog.getEntry(
    'vue.core.learn.advanced.shallow-reactivity-raw-boundaries',
  )
  expect(shallowBoundariesEntry).toMatchObject({
    prerequisites: ['vue.core.learn.intermediate.teleport'],
  })
  for (const relatedId of shallowBoundariesEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const customRefEntry = learningCatalog.getEntry('vue.core.learn.advanced.custom-ref-triggering')
  expect(customRefEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.shallow-reactivity-raw-boundaries'],
  })
  for (const relatedId of customRefEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const effectScopeEntry = learningCatalog.getEntry('vue.core.learn.advanced.effect-scope')
  expect(effectScopeEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.custom-ref-triggering'],
  })
  for (const relatedId of effectScopeEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const suspenseEntry = learningCatalog.getEntry(
    'vue.core.learn.advanced.async-components-suspense',
  )
  expect(suspenseEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.effect-scope'],
    related: [
      'vue.core.learn.intermediate.dynamic-components-keep-alive',
      'vue.core.learn.intermediate.transitions',
      'vue.core.reference.application.define-async-component',
      'vue.core.reference.built-ins.suspense',
    ],
  })
  for (const relatedId of suspenseEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const errorHandlingEntry = learningCatalog.getEntry('vue.core.learn.advanced.error-handling')
  expect(errorHandlingEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.async-components-suspense'],
    related: [
      'vue.core.learn.advanced.async-components-suspense',
      'vue.core.reference.composition.lifecycle',
      'vue.core.reference.application.create-app',
      'vue.core.reference.application.define-async-component',
    ],
  })
  for (const relatedId of errorHandlingEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const customDirectivesEntry = learningCatalog.getEntry(
    'vue.core.learn.advanced.custom-directives',
  )
  expect(customDirectivesEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.error-handling'],
    related: [
      'vue.core.learn.advanced.error-handling',
      'vue.core.learn.intermediate.composables',
      'vue.core.learn.intermediate.lifecycle-update-timing',
      'vue.core.reference.advanced.custom-directives',
    ],
  })
  for (const relatedId of customDirectivesEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const renderFunctionsEntry = learningCatalog.getEntry(
    'vue.core.learn.advanced.render-functions-vnodes',
  )
  expect(renderFunctionsEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.custom-directives'],
    related: [
      'vue.core.learn.advanced.custom-directives',
      'vue.core.learn.basics.conditional-list-rendering',
      'vue.core.learn.intermediate.slots',
      'vue.core.reference.advanced.render-function',
    ],
  })
  for (const relatedId of renderFunctionsEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const pluginsEntry = learningCatalog.getEntry('vue.core.learn.advanced.plugins')
  expect(pluginsEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.render-functions-vnodes'],
    related: [
      'vue.core.learn.advanced.render-functions-vnodes',
      'vue.core.learn.intermediate.provide-inject',
      'vue.core.learn.advanced.custom-directives',
      'vue.core.reference.application.create-app',
    ],
  })
  for (const relatedId of pluginsEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const performanceEntry = learningCatalog.getEntry('vue.core.learn.advanced.performance')
  expect(performanceEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.plugins'],
  })
  for (const relatedId of performanceEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  const ssrHydrationEntry = learningCatalog.getEntry('vue.core.learn.advanced.ssr-hydration')
  expect(ssrHydrationEntry).toMatchObject({
    prerequisites: ['vue.core.learn.advanced.performance'],
  })
  for (const relatedId of ssrHydrationEntry?.related ?? []) {
    expect(learningCatalog.getEntry(relatedId), relatedId).toBeDefined()
  }
  expect(
    learningCatalog.getNeighbors('vue.core.learn.intermediate.dynamic-components-keep-alive'),
  ).toMatchObject({
    next: {
      id: 'vue.core.learn.intermediate.teleport',
      title: 'Teleport',
      path: '/learn/vue/core/intermediate/teleport',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.intermediate.teleport')).toEqual({
    previous: {
      id: 'vue.core.learn.intermediate.dynamic-components-keep-alive',
      title: '动态组件与 KeepAlive',
      path: '/learn/vue/core/intermediate/dynamic-components-keep-alive',
    },
    next: {
      id: 'vue.core.learn.advanced.shallow-reactivity-raw-boundaries',
      title: '浅层响应式与原始对象边界',
      path: '/learn/vue/core/advanced/shallow-reactivity-raw-boundaries',
    },
  })
  expect(
    learningCatalog.getNeighbors('vue.core.learn.advanced.shallow-reactivity-raw-boundaries'),
  ).toEqual({
    previous: {
      id: 'vue.core.learn.intermediate.teleport',
      title: 'Teleport',
      path: '/learn/vue/core/intermediate/teleport',
    },
    next: {
      id: 'vue.core.learn.advanced.custom-ref-triggering',
      title: 'CustomRef 与触发控制',
      path: '/learn/vue/core/advanced/custom-ref-triggering',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.custom-ref-triggering')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.shallow-reactivity-raw-boundaries',
      title: '浅层响应式与原始对象边界',
      path: '/learn/vue/core/advanced/shallow-reactivity-raw-boundaries',
    },
    next: {
      id: 'vue.core.learn.advanced.effect-scope',
      title: 'EffectScope',
      path: '/learn/vue/core/advanced/effect-scope',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.effect-scope')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.custom-ref-triggering',
      title: 'CustomRef 与触发控制',
      path: '/learn/vue/core/advanced/custom-ref-triggering',
    },
    next: {
      id: 'vue.core.learn.advanced.async-components-suspense',
      title: '异步组件与 Suspense',
      path: '/learn/vue/core/advanced/async-components-suspense',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.async-components-suspense')).toEqual(
    {
      previous: {
        id: 'vue.core.learn.advanced.effect-scope',
        title: 'EffectScope',
        path: '/learn/vue/core/advanced/effect-scope',
      },
      next: {
        id: 'vue.core.learn.advanced.error-handling',
        title: '错误处理',
        path: '/learn/vue/core/advanced/error-handling',
      },
    },
  )
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.error-handling')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.async-components-suspense',
      title: '异步组件与 Suspense',
      path: '/learn/vue/core/advanced/async-components-suspense',
    },
    next: {
      id: 'vue.core.learn.advanced.custom-directives',
      title: '自定义指令',
      path: '/learn/vue/core/advanced/custom-directives',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.custom-directives')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.error-handling',
      title: '错误处理',
      path: '/learn/vue/core/advanced/error-handling',
    },
    next: {
      id: 'vue.core.learn.advanced.render-functions-vnodes',
      title: '渲染函数与虚拟节点',
      path: '/learn/vue/core/advanced/render-functions-vnodes',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.render-functions-vnodes')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.custom-directives',
      title: '自定义指令',
      path: '/learn/vue/core/advanced/custom-directives',
    },
    next: {
      id: 'vue.core.learn.advanced.plugins',
      title: '插件',
      path: '/learn/vue/core/advanced/plugins',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.plugins')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.render-functions-vnodes',
      title: '渲染函数与虚拟节点',
      path: '/learn/vue/core/advanced/render-functions-vnodes',
    },
    next: {
      id: 'vue.core.learn.advanced.performance',
      title: '性能优化',
      path: '/learn/vue/core/advanced/performance',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.performance')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.plugins',
      title: '插件',
      path: '/learn/vue/core/advanced/plugins',
    },
    next: {
      id: 'vue.core.learn.advanced.ssr-hydration',
      title: 'SSR 与 Hydration',
      path: '/learn/vue/core/advanced/ssr-hydration',
    },
  })
  expect(learningCatalog.getNeighbors('vue.core.learn.advanced.ssr-hydration')).toEqual({
    previous: {
      id: 'vue.core.learn.advanced.performance',
      title: '性能优化',
      path: '/learn/vue/core/advanced/performance',
    },
    next: undefined,
  })

  for (const [index, entryId] of entryIds.entries()) {
    const entryMeta = learningCatalog.getEntry(entryId)
    expect(entryMeta?.type, entryId).toBe('lesson')
    for (const prerequisiteId of entryMeta?.prerequisites ?? []) {
      const prerequisiteIndex = entryIds.indexOf(prerequisiteId)
      expect(prerequisiteIndex, prerequisiteId).toBeGreaterThanOrEqual(0)
      expect(prerequisiteIndex, prerequisiteId).toBeLessThan(index)
    }
  }
})
