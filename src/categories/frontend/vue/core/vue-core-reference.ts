import type { ReferenceTrackManifest } from '@/common/catalog/types'

export const vueCoreReferenceManifest: ReferenceTrackManifest = {
  groups: [
    {
      id: 'reactivity',
      title: '响应式 API',
      summary: '查询 Vue 响应式核心、工具与进阶能力。',
      entryIds: [
        'vue.core.reference.reactivity.ref',
        'vue.core.reference.reactivity.reactive',
        'vue.core.reference.reactivity.shallow',
        'vue.core.reference.reactivity.readonly',
        'vue.core.reference.reactivity.to-ref',
        'vue.core.reference.reactivity.utils',
        'vue.core.reference.reactivity.custom-ref',
        'vue.core.reference.reactivity.effect-scope',
      ],
    },
    {
      id: 'reactivity-watchers',
      title: '计算与侦听',
      summary: '查询计算属性、侦听器与不同刷新时机。',
      entryIds: [
        'vue.core.reference.reactivity-watchers.computed',
        'vue.core.reference.reactivity-watchers.watch',
        'vue.core.reference.reactivity-watchers.watch-effect',
        'vue.core.reference.reactivity-watchers.watch-post-sync',
      ],
    },
    {
      id: 'composition',
      title: '组合式 API',
      summary: '查询生命周期、依赖注入与模板引用。',
      entryIds: [
        'vue.core.reference.composition.lifecycle',
        'vue.core.reference.composition.provide-inject',
        'vue.core.reference.composition.template-refs',
        'vue.core.reference.composition.use-id',
      ],
    },
    {
      id: 'components',
      title: '组件通信',
      summary: '查询 props、事件、v-model、插槽与透传属性。',
      entryIds: [
        'vue.core.reference.components.props',
        'vue.core.reference.components.emits',
        'vue.core.reference.components.define-model',
        'vue.core.reference.components.slots',
        'vue.core.reference.components.attrs',
      ],
    },
    {
      id: 'options-api',
      title: 'Options API',
      summary: '查询选项式组件的状态、渲染与实例行为。',
      entryIds: [
        'vue.core.reference.options-api.state-options',
        'vue.core.reference.options-api.rendering-options',
        'vue.core.reference.options-api.lifecycle-options',
        'vue.core.reference.options-api.composition-options',
        'vue.core.reference.options-api.misc-options',
        'vue.core.reference.options-api.component-instance',
      ],
    },
    {
      id: 'built-ins',
      title: '内置内容',
      summary: '查询 Vue 提供的指令、过渡、缓存、传送与异步边界组件。',
      entryIds: [
        'vue.core.reference.built-ins.directives',
        'vue.core.reference.built-ins.template-primitives',
        'vue.core.reference.built-ins.transition',
        'vue.core.reference.built-ins.keep-alive',
        'vue.core.reference.built-ins.teleport',
        'vue.core.reference.built-ins.suspense',
      ],
    },
    {
      id: 'single-file-component',
      title: '单文件组件',
      summary: '查询 Vue 单文件组件的文件结构与编译期语法。',
      entryIds: [
        'vue.core.reference.single-file-component.syntax',
        'vue.core.reference.single-file-component.script-setup',
        'vue.core.reference.single-file-component.css-features',
      ],
    },
    {
      id: 'application',
      title: '全局 API',
      summary: '查询应用创建、更新调度与组件定义 API。',
      entryIds: [
        'vue.core.reference.application.create-app',
        'vue.core.reference.application.create-ssr-app',
        'vue.core.reference.application.application-configuration',
        'vue.core.reference.application.next-tick',
        'vue.core.reference.application.define-component',
        'vue.core.reference.application.define-async-component',
      ],
    },
    {
      id: 'advanced',
      title: '进阶主题',
      summary: '查询自定义指令、渲染函数、平台边界、工具类型与构建标志。',
      entryIds: [
        'vue.core.reference.advanced.custom-directives',
        'vue.core.reference.advanced.custom-elements',
        'vue.core.reference.advanced.render-function',
        'vue.core.reference.advanced.server-rendering',
        'vue.core.reference.advanced.composables',
        'vue.core.reference.advanced.utility-types',
        'vue.core.reference.advanced.custom-renderer',
        'vue.core.reference.advanced.compile-time-flags',
      ],
    },
  ],
}
