import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'LazyReportRoute',
  /** 渲染只能在真实动态 import 解析后出现的路由标记。 */
  setup() {
    return () =>
      h('section', { class: 'route-card', 'data-testid': 'lazy-report-view' }, [
        h('p', { class: 'route-kicker' }, '真实懒加载路由'),
        h('h4', '报表页已提交'),
        h('p', '这个组件来自独立的动态 import 模块。'),
      ])
  },
})
