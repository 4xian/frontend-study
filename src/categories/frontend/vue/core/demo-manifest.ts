import type { Component } from 'vue'
import type { DemoAssetManifest } from '@/common/content/demo-registry'

const demoComponents = import.meta.glob<{ default: Component }>('./demos/**/*.vue')
const demoSources = import.meta.glob<string>('./demos/**/*.vue', {
  query: '?raw',
  import: 'default',
})

const demoEntries = [
  [
    'vue.core.learn.advanced.async-components-suspense.suspense-boundary-lab-demo',
    './demos/async-components-suspense/suspense-boundary-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.custom-directives.directive-lifecycle-lab-demo',
    './demos/custom-directives/directive-lifecycle-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.custom-ref-triggering.custom-ref-trigger-control-lab-demo',
    './demos/custom-ref-triggering/custom-ref-trigger-control-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.effect-scope.effect-scope-lifecycle-lab-demo',
    './demos/effect-scope/effect-scope-lifecycle-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.error-handling.error-boundary-lab-demo',
    './demos/error-handling/error-boundary-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.performance.performance-rendering-lab-demo',
    './demos/performance/performance-rendering-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.plugins.plugin-installation-scope-lab-demo',
    './demos/plugins/plugin-installation-scope-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.render-functions-vnodes.vnode-identity-lab-demo',
    './demos/render-functions-vnodes/vnode-identity-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.shallow-reactivity-raw-boundaries.shallow-reactivity-boundary-lab-demo',
    './demos/shallow-reactivity-raw-boundaries/shallow-reactivity-boundary-lab-demo.vue',
  ],
  [
    'vue.core.learn.advanced.ssr-hydration.ssr-hydration-boundary-lab-demo',
    './demos/ssr-hydration/ssr-hydration-boundary-lab-demo.vue',
  ],
  [
    'vue.core.learn.basics.component-basics.independent-instances-demo',
    './demos/component-basics/independent-instances-demo.vue',
  ],
  [
    'vue.core.learn.basics.computed-properties.computed-dependency-demo',
    './demos/computed-properties/computed-dependency-demo.vue',
  ],
  [
    'vue.core.learn.basics.conditional-list-rendering.rendering-identity-demo',
    './demos/conditional-list-rendering/rendering-identity-demo.vue',
  ],
  [
    'vue.core.learn.basics.emits.emits-intent-flow-demo',
    './demos/emits/emits-intent-flow-demo.vue',
  ],
  [
    'vue.core.learn.basics.event-handling.event-command-demo',
    './demos/event-handling/event-command-demo.vue',
  ],
  [
    'vue.core.learn.basics.form-bindings.form-state-lab-demo',
    './demos/form-bindings/form-state-lab-demo.vue',
  ],
  ['vue.core.learn.basics.props.props-input-flow-demo', './demos/props/props-input-flow-demo.vue'],
  ['vue.core.learn.basics.sfc-basics.sfc-anatomy-demo', './demos/sfc-basics/sfc-anatomy-demo.vue'],
  [
    'vue.core.learn.basics.template-syntax.template-syntax-demo',
    './demos/template-syntax/template-syntax-demo.vue',
  ],
  [
    'vue.core.learn.basics.watchers.request-cleanup-demo',
    './demos/watchers/request-cleanup-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.attrs.attribute-routing-lab-demo',
    './demos/attrs/attribute-routing-lab-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.component-v-model.component-model-contract-demo',
    './demos/component-v-model/component-model-contract-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.composables.composable-contract-lab-demo',
    './demos/composables/composable-contract-lab-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.dynamic-components-keep-alive.component-cache-lab-demo',
    './demos/dynamic-components-keep-alive/component-cache-lab-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.lifecycle-update-timing.lifecycle-update-timeline-demo',
    './demos/lifecycle-update-timing/lifecycle-update-timeline-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.provide-inject.dependency-scope-lab-demo',
    './demos/provide-inject/dependency-scope-lab-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.slots.learning-panel-slots-demo',
    './demos/slots/learning-panel-slots-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.teleport.teleport-dialog-lab-demo',
    './demos/teleport/teleport-dialog-lab-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.template-refs.template-ref-lab-demo',
    './demos/template-refs/template-ref-lab-demo.vue',
  ],
  [
    'vue.core.learn.intermediate.transitions.transition-state-lab-demo',
    './demos/transitions/transition-state-lab-demo.vue',
  ],
  [
    'vue.core.reference.advanced.composables.composable-demo',
    './demos/composables/composable-demo.vue',
  ],
  [
    'vue.core.reference.advanced.custom-directives.custom-directive-demo',
    './demos/custom-directives/custom-directive-demo.vue',
  ],
  [
    'vue.core.reference.advanced.render-function.render-function-demo',
    './demos/render-function/render-function-demo.vue',
  ],
  [
    'vue.core.reference.application.create-app.create-app-demo',
    './demos/create-app/create-app-demo.vue',
  ],
  [
    'vue.core.reference.application.define-async-component.async-component-demo',
    './demos/define-async-component/async-component-demo.vue',
  ],
  [
    'vue.core.reference.application.next-tick.next-tick-demo',
    './demos/next-tick/next-tick-demo.vue',
  ],
  [
    'vue.core.reference.built-ins.keep-alive.keep-alive-demo',
    './demos/keep-alive/keep-alive-demo.vue',
  ],
  ['vue.core.reference.built-ins.suspense.suspense-demo', './demos/suspense/suspense-demo.vue'],
  ['vue.core.reference.built-ins.teleport.teleport-demo', './demos/teleport/teleport-demo.vue'],
  [
    'vue.core.reference.built-ins.transition.transition-demo',
    './demos/transition/transition-demo.vue',
  ],
  ['vue.core.reference.components.attrs.attrs-demo', './demos/attrs/attrs-demo.vue'],
  [
    'vue.core.reference.components.define-model.define-model-demo',
    './demos/define-model/define-model-demo.vue',
  ],
  ['vue.core.reference.components.emits.emits-demo', './demos/emits/emits-demo.vue'],
  [
    'vue.core.reference.components.props.props-one-way-demo',
    './demos/props/props-one-way-demo.vue',
  ],
  ['vue.core.reference.components.slots.scoped-slots-demo', './demos/slots/scoped-slots-demo.vue'],
  [
    'vue.core.reference.composition.lifecycle.lifecycle-hooks-demo',
    './demos/lifecycle/lifecycle-hooks-demo.vue',
  ],
  [
    'vue.core.reference.composition.provide-inject.provide-inject-demo',
    './demos/provide-inject/provide-inject-demo.vue',
  ],
  [
    'vue.core.reference.composition.template-refs.template-ref-demo',
    './demos/template-refs/template-ref-demo.vue',
  ],
  ['vue.core.reference.composition.use-id.use-id-demo', './demos/use-id/use-id-demo.vue'],
  [
    'vue.core.reference.reactivity-watchers.computed.computed-cache-demo',
    './demos/computed/computed-cache-demo.vue',
  ],
  [
    'vue.core.reference.reactivity-watchers.computed.writable-computed',
    './demos/computed/writable-computed.vue',
  ],
  [
    'vue.core.reference.reactivity-watchers.watch-effect.watch-effect-auto',
    './demos/watch-effect/watch-effect-auto.vue',
  ],
  [
    'vue.core.reference.reactivity-watchers.watch-post-sync.flush-timing-demo',
    './demos/watch-post-sync/flush-timing-demo.vue',
  ],
  ['vue.core.reference.reactivity-watchers.watch.watch-options', './demos/watch/watch-options.vue'],
  ['vue.core.reference.reactivity-watchers.watch.watch-sources', './demos/watch/watch-sources.vue'],
  [
    'vue.core.reference.reactivity.custom-ref.custom-ref-debounce',
    './demos/custom-ref/custom-ref-debounce.vue',
  ],
  [
    'vue.core.reference.reactivity.effect-scope.effect-scope-demo',
    './demos/effect-scope/effect-scope-demo.vue',
  ],
  [
    'vue.core.reference.reactivity.reactive.reactive-limitations',
    './demos/reactive/reactive-limitations.vue',
  ],
  [
    'vue.core.reference.reactivity.reactive.reactive-nested',
    './demos/reactive/reactive-nested.vue',
  ],
  ['vue.core.reference.reactivity.readonly.readonly-demo', './demos/readonly/readonly-demo.vue'],
  ['vue.core.reference.reactivity.ref.basic-ref-counter', './demos/ref/basic-ref-counter.vue'],
  ['vue.core.reference.reactivity.ref.deep-ref-object', './demos/ref/deep-ref-object.vue'],
  ['vue.core.reference.reactivity.ref.ref-unwrap-demo', './demos/ref/ref-unwrap-demo.vue'],
  [
    'vue.core.reference.reactivity.shallow.shallow-reactive-demo',
    './demos/shallow/shallow-reactive-demo.vue',
  ],
  [
    'vue.core.reference.reactivity.shallow.shallow-ref-demo',
    './demos/shallow/shallow-ref-demo.vue',
  ],
  ['vue.core.reference.reactivity.to-ref.to-refs-demo', './demos/to-ref/to-refs-demo.vue'],
  ['vue.core.reference.reactivity.utils.reactivity-utils', './demos/utils/reactivity-utils.vue'],
] as const

/** 把清单中的公开 Demo 路径转换为显式 registry 资产。 */
function createDemoAsset(entry: (typeof demoEntries)[number]): DemoAssetManifest {
  const [id, path] = entry
  const loadComponent = demoComponents[path]
  const loadSource = demoSources[path]
  if (!loadComponent || !loadSource) throw new Error(`Demo 清单缺少源码：${path}`)
  return { id, loadComponent, loadSource }
}

export const vueCoreDemoAssets = demoEntries.map(createDemoAsset)
