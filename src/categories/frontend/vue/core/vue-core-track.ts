import type { LearningTrackManifest } from '@/common/catalog/types'

export const vueCoreTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '从 Vue 核心概念开始建立基础能力。',
      categories: [
        {
          id: 'sfc-and-template',
          title: '单文件组件与模板',
          summary: '认识单文件组件，并掌握模板中的基础渲染能力。',
          topics: ['单文件组件', '模板语法', '条件与列表渲染'],
          entries: [
            { id: 'vue.core.learn.basics.sfc-basics', status: 'available' },
            { id: 'vue.core.learn.basics.template-syntax', status: 'available' },
            { id: 'vue.core.learn.basics.conditional-list-rendering', status: 'available' },
          ],
        },
        {
          id: 'reactivity-and-derived-state',
          title: '响应式与派生状态',
          summary: '建立状态、派生值与副作用之间的正确关系。',
          topics: ['响应式状态', '计算属性', '侦听器'],
          entries: [
            { id: 'vue.core.learn.basics.reactive-state', status: 'available' },
            { id: 'vue.core.learn.basics.computed-properties', status: 'available' },
            { id: 'vue.core.learn.basics.watchers', status: 'available' },
          ],
        },
        {
          id: 'events-and-forms',
          title: '事件与表单',
          summary: '处理用户输入，并让界面状态与表单保持同步。',
          topics: ['事件处理', '表单输入绑定'],
          entries: [
            { id: 'vue.core.learn.basics.event-handling', status: 'available' },
            { id: 'vue.core.learn.basics.form-bindings', status: 'available' },
          ],
        },
        {
          id: 'components-and-communication',
          title: '组件基础与通信',
          summary: '拆分界面并建立清晰的父子组件通信。',
          topics: ['组件基础', 'Props', 'Emits'],
          entries: [
            { id: 'vue.core.learn.basics.component-basics', status: 'available' },
            { id: 'vue.core.learn.basics.props', status: 'available' },
            { id: 'vue.core.learn.basics.emits', status: 'available' },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '组合组件能力并处理常见应用场景。',
      categories: [
        {
          id: 'lifecycle-and-template-refs',
          title: '生命周期与模板引用',
          summary: '理解组件更新时机，并在必要时访问渲染后的元素或组件。',
          topics: ['生命周期', '更新时机', '模板引用'],
          entries: [
            {
              id: 'vue.core.learn.intermediate.lifecycle-update-timing',
              status: 'available',
            },
            {
              id: 'vue.core.learn.intermediate.template-refs',
              status: 'available',
            },
          ],
        },
        {
          id: 'component-content-and-binding',
          title: '组件内容与双向绑定',
          summary: '组合组件内容、透传属性并建立受控的双向绑定。',
          topics: ['Slots', 'Attributes', '组件 v-model'],
          entries: [
            { id: 'vue.core.learn.intermediate.slots', status: 'available' },
            { id: 'vue.core.learn.intermediate.attrs', status: 'available' },
            { id: 'vue.core.learn.intermediate.component-v-model', status: 'available' },
          ],
        },
        {
          id: 'logic-reuse-and-dependencies',
          title: '逻辑复用与依赖传递',
          summary: '复用组合式逻辑，并跨组件层级共享依赖。',
          topics: ['组合式函数', 'Provide', 'Inject'],
          entries: [
            { id: 'vue.core.learn.intermediate.composables', status: 'available' },
            { id: 'vue.core.learn.intermediate.provide-inject', status: 'available' },
          ],
        },
        {
          id: 'built-ins-and-transitions',
          title: '内置组件与过渡',
          summary: '使用 Vue 内置能力组织动态界面和跨层渲染。',
          topics: ['Transition', '动态组件', 'KeepAlive', 'Teleport'],
          entries: [
            { id: 'vue.core.learn.intermediate.transitions', status: 'available' },
            {
              id: 'vue.core.learn.intermediate.dynamic-components-keep-alive',
              status: 'available',
            },
            {
              id: 'vue.core.learn.intermediate.teleport',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '理解高级模式、性能与运行边界。',
      categories: [
        {
          id: 'reactivity-boundaries',
          title: '响应式边界',
          summary: '控制响应式深度、触发时机和副作用作用域。',
          topics: ['浅层响应式', '原始对象', 'CustomRef', 'EffectScope'],
          entries: [
            {
              id: 'vue.core.learn.advanced.shallow-reactivity-raw-boundaries',
              status: 'available',
            },
            {
              id: 'vue.core.learn.advanced.custom-ref-triggering',
              status: 'available',
            },
            {
              id: 'vue.core.learn.advanced.effect-scope',
              status: 'available',
            },
          ],
        },
        {
          id: 'async-and-errors',
          title: '异步组件与错误处理',
          summary: '为异步加载、等待状态和运行错误建立边界。',
          topics: ['异步组件', 'Suspense', '错误处理'],
          entries: [
            {
              id: 'vue.core.learn.advanced.async-components-suspense',
              status: 'available',
            },
            {
              id: 'vue.core.learn.advanced.error-handling',
              status: 'available',
            },
          ],
        },
        {
          id: 'extension-and-rendering',
          title: '扩展与底层渲染',
          summary: '扩展模板行为，并理解虚拟节点和应用插件。',
          topics: ['自定义指令', '渲染函数', '虚拟节点', '插件'],
          entries: [
            {
              id: 'vue.core.learn.advanced.custom-directives',
              status: 'available',
            },
            {
              id: 'vue.core.learn.advanced.render-functions-vnodes',
              status: 'available',
            },
            {
              id: 'vue.core.learn.advanced.plugins',
              status: 'available',
            },
          ],
        },
        {
          id: 'performance-and-ssr',
          title: '性能与服务端渲染',
          summary: '优化运行性能，并理解服务端渲染和水合边界。',
          topics: ['性能优化', 'SSR', 'Hydration'],
          entries: [
            {
              id: 'vue.core.learn.advanced.performance',
              status: 'available',
            },
            {
              id: 'vue.core.learn.advanced.ssr-hydration',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
