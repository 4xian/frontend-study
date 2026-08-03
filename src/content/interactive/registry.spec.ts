import { describe, expect, it } from 'vitest'
import { assetId, resolveDemo, resolvePrinciple } from './registry'

describe('interactive registry', () => {
  it('用完整目录区分同 basename 的资产 ID', () => {
    const refAsset = assetId('../demos/vue/core/reference/reactivity/ref/example.vue', '../demos/')
    const reactiveAsset = assetId(
      '../demos/vue/core/reference/reactivity/reactive/example.vue',
      '../demos/',
    )

    expect(refAsset).toBe('vue.core.reference.reactivity.ref.example')
    expect(reactiveAsset).toBe('vue.core.reference.reactivity.reactive.example')
    expect(refAsset).not.toBe(reactiveAsset)
  })

  it('按完整 ID 解析计算与侦听的 Demo 和原理动画', () => {
    const demo = resolveDemo('vue.core.reference.reactivity-watchers.computed.computed-cache-demo')
    const principle = resolvePrinciple(
      'vue.core.reference.reactivity-watchers.computed.computed-cache',
    )

    expect(demo).not.toBeNull()
    expect(principle).not.toBeNull()
  })

  it('按完整 ID 解析组合式 API 的四个 Demo', () => {
    const ids = [
      'vue.core.reference.composition.lifecycle.lifecycle-hooks-demo',
      'vue.core.reference.composition.provide-inject.provide-inject-demo',
      'vue.core.reference.composition.template-refs.template-ref-demo',
      'vue.core.reference.composition.use-id.use-id-demo',
    ]

    expect(ids.map((id) => resolveDemo(id))).not.toContain(null)
  })

  it('按完整 ID 解析组件通信的五个 Demo', () => {
    const ids = [
      'vue.core.reference.components.props.props-one-way-demo',
      'vue.core.reference.components.emits.emits-demo',
      'vue.core.reference.components.define-model.define-model-demo',
      'vue.core.reference.components.slots.scoped-slots-demo',
      'vue.core.reference.components.attrs.attrs-demo',
    ]

    expect(ids.map((id) => resolveDemo(id))).not.toContain(null)
  })

  it('按完整 ID 解析四个内置组件 Demo', () => {
    const ids = [
      'vue.core.reference.built-ins.transition.transition-demo',
      'vue.core.reference.built-ins.keep-alive.keep-alive-demo',
      'vue.core.reference.built-ins.teleport.teleport-demo',
      'vue.core.reference.built-ins.suspense.suspense-demo',
    ]

    expect(ids.map((id) => resolveDemo(id))).not.toContain(null)
  })

  it('按完整 ID 解析三个全局 API Demo', () => {
    const ids = [
      'vue.core.reference.application.create-app.create-app-demo',
      'vue.core.reference.application.next-tick.next-tick-demo',
      'vue.core.reference.application.define-async-component.async-component-demo',
    ]

    expect(ids.map((id) => resolveDemo(id))).not.toContain(null)
  })

  it('按完整 ID 解析三个进阶主题 Demo', () => {
    const ids = [
      'vue.core.reference.advanced.custom-directives.custom-directive-demo',
      'vue.core.reference.advanced.render-function.render-function-demo',
      'vue.core.reference.advanced.composables.composable-demo',
    ]

    expect(ids.map((id) => resolveDemo(id))).not.toContain(null)
  })

  it('按完整 ID 解析基础课程 Demo', () => {
    const ids = [
      'vue.core.learn.basics.sfc-basics.sfc-anatomy-demo',
      'vue.core.learn.basics.conditional-list-rendering.rendering-identity-demo',
      'vue.core.learn.basics.computed-properties.computed-dependency-demo',
      'vue.core.learn.basics.watchers.request-cleanup-demo',
      'vue.core.learn.basics.event-handling.event-command-demo',
      'vue.core.learn.basics.form-bindings.form-state-lab-demo',
      'vue.core.learn.basics.component-basics.independent-instances-demo',
      'vue.core.learn.basics.props.props-input-flow-demo',
      'vue.core.learn.basics.emits.emits-intent-flow-demo',
    ]

    expect(ids.map((id) => resolveDemo(id))).not.toContain(null)
  })

  it('不会把 Props Demo 的 parts 子组件暴露为公开 Demo', () => {
    expect(resolveDemo('vue.core.learn.basics.props.parts.CoursePreviewCard')).toBeNull()
  })

  it('不会把 Emits Demo 的 parts 子组件暴露为公开 Demo', () => {
    expect(resolveDemo('vue.core.learn.basics.emits.parts.CourseActionPanel')).toBeNull()
  })

  it('只公开中高级课程的同源 Demo', () => {
    const ids = [
      'vue.core.learn.intermediate.lifecycle-update-timing.lifecycle-update-timeline-demo',
      'vue.core.learn.intermediate.template-refs.template-ref-lab-demo',
      'vue.core.learn.intermediate.slots.learning-panel-slots-demo',
      'vue.core.learn.intermediate.attrs.attribute-routing-lab-demo',
      'vue.core.learn.intermediate.component-v-model.component-model-contract-demo',
      'vue.core.learn.intermediate.composables.composable-contract-lab-demo',
      'vue.core.learn.intermediate.provide-inject.dependency-scope-lab-demo',
      'vue.core.learn.intermediate.transitions.transition-state-lab-demo',
      'vue.core.learn.intermediate.dynamic-components-keep-alive.component-cache-lab-demo',
      'vue.core.learn.intermediate.teleport.teleport-dialog-lab-demo',
      'vue.core.learn.advanced.async-components-suspense.suspense-boundary-lab-demo',
      'vue.core.learn.advanced.error-handling.error-boundary-lab-demo',
      'vue.core.learn.advanced.custom-directives.directive-lifecycle-lab-demo',
      'vue.core.learn.advanced.render-functions-vnodes.vnode-identity-lab-demo',
      'vue.core.learn.advanced.plugins.plugin-installation-scope-lab-demo',
      'vue.core.learn.advanced.performance.performance-rendering-lab-demo',
      'vue.core.learn.advanced.ssr-hydration.ssr-hydration-boundary-lab-demo',
      'vue.core.learn.advanced.shallow-reactivity-raw-boundaries.shallow-reactivity-boundary-lab-demo',
      'vue.core.learn.advanced.custom-ref-triggering.custom-ref-trigger-control-lab-demo',
      'vue.core.learn.advanced.effect-scope.effect-scope-lifecycle-lab-demo',
    ]

    expect(ids.map((id) => resolveDemo(id))).not.toContain(null)
    expect(
      resolveDemo('vue.core.learn.intermediate.lifecycle-update-timing.parts.LifecycleChildPanel'),
    ).toBeNull()
    expect(
      resolveDemo('vue.core.learn.intermediate.template-refs.parts.ExposedSearchPanel'),
    ).toBeNull()
    expect(resolveDemo('vue.core.learn.intermediate.slots.parts.LearningSlotPanel')).toBeNull()
    expect(resolveDemo('vue.core.learn.intermediate.attrs.parts.ForwardedActionButton')).toBeNull()
    expect(
      resolveDemo('vue.core.learn.intermediate.component-v-model.parts.ComponentModelEditor'),
    ).toBeNull()
    expect(resolveDemo('vue.core.learn.intermediate.composables.useEventCounter')).toBeNull()
    expect(
      resolveDemo('vue.core.learn.intermediate.provide-inject.parts.DependencyBranch'),
    ).toBeNull()
    expect(
      resolveDemo('vue.core.learn.intermediate.provide-inject.parts.DependencyConsumer'),
    ).toBeNull()
    expect(resolveDemo('vue.core.learn.intermediate.provide-inject.dependency-context')).toBeNull()
    expect(
      resolveDemo('vue.core.learn.intermediate.dynamic-components-keep-alive.parts.EditorPanel'),
    ).toBeNull()
    expect(
      resolveDemo('vue.core.learn.intermediate.dynamic-components-keep-alive.parts.PreviewPanel'),
    ).toBeNull()
    expect(
      resolveDemo('vue.core.learn.intermediate.dynamic-components-keep-alive.parts.SettingsPanel'),
    ).toBeNull()
  })
})
