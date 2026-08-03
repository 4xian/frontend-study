/**
 * 课程：依赖注入
 * 查证日期：2026-07-31
 * 适用版本：Vue 3.5.40
 * 查证工具：Tavily、Vue 中文官网与 vuejs/core v3.5.40 固定标签源码
 */
import { defineLesson, defineLessonMeta } from '@/content/schema'

export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.provide-inject',
  type: 'lesson',
  title: '依赖注入',
  summary: '用类型安全的 Provide / Inject 在组件子树中共享只读状态与修改命令',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.composables'],
  related: [
    'vue.core.learn.intermediate.composables',
    'vue.core.learn.basics.props',
    'vue.core.reference.composition.provide-inject',
    'vue.core.reference.reactivity.readonly',
    'vue.core.reference.application.create-app',
  ],
  tags: ['Provide', 'Inject', 'InjectionKey', '依赖注入', 'readonly', '组件上下文'],
  sources: [
    {
      title: 'Vue 依赖注入指南',
      url: 'https://cn.vuejs.org/guide/components/provide-inject.html',
    },
    {
      title: 'Vue 组合式 API：依赖注入',
      url: 'https://cn.vuejs.org/api/composition-api-dependency-injection.html',
    },
    {
      title: 'Vue TypeScript 与组合式 API',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject',
    },
    {
      title: 'Vue 应用实例 API',
      url: 'https://cn.vuejs.org/api/application.html#app-provide',
    },
    {
      title: 'Vue 3.5.40 apiInject.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})

export default defineLesson({
  meta,
  objectives: [
    '根据依赖所有者与消费范围，在 Props、组合式函数、Provide / Inject 和 Store 之间做选择',
    '使用共享的 InjectionKey 建立类型安全且不会碰撞的依赖契约',
    '在祖先 setup 同步阶段提供依赖，并在任意深度后代同步注入',
    '提供 readonly 响应式状态和由提供方实现的修改命令',
    '解释普通值、ref 和对象身份在注入后的响应式差异',
    '显式处理缺失提供者，并区分函数值与默认值工厂',
    '预测嵌套同 key 提供者的最近匹配结果',
    '区分组件级 provide、app.provide 和 app.runWithContext 的边界',
    '从 provides 原型链源码推导局部覆盖与测试替身用法',
    '通过唯一 Demo 验证跨层注入、根级更新、局部覆盖和命令所有权',
  ],
  blocks: [
    { type: 'heading', content: '正文大纲' },
    {
      type: 'text',
      content:
        '上一课把响应式状态和副作用封装成组合式函数，但每次调用默认仍拥有独立状态。本课处理另一种所有权：依赖属于一段组件子树，实际消费方却隔着多个不使用该依赖的中间组件。祖先用 provide 建立上下文，后代用 inject 按 key 读取，中间组件不再机械转发。',
    },
    {
      type: 'table',
      headers: ['部分', '核心问题', '完成标志'],
      rows: [
        ['选择边界', '什么依赖适合注入', '能与 Props、composable、Store 区分'],
        ['契约', 'key 和类型放在哪里', '共享 InjectionKey 与上下文接口'],
        ['所有权', '谁能修改共享状态', 'readonly 状态与提供方命令'],
        ['作用域', '同 key 多次提供读哪个', '理解最近提供者与完整覆盖'],
        ['缺省值', '提供者可选时怎么办', '区分函数值和默认工厂'],
        ['应用上下文', '组件树之外怎样读取', '理解 app.provide 与同步 context'],
      ],
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '本课限定 SFC、<script setup lang="ts">、Composition API 与 Vue 3.5.40。插件实现、完整 app.runWithContext Demo、SSR 应用工厂、Pinia、事件总线、过渡效果和后续课程均不在本课范围内。',
    },
    { type: 'heading', content: '先判断依赖属于哪一层' },
    {
      type: 'text',
      content:
        '依赖注入不是“少写 Props”的快捷方式。直接父子之间的公开输入仍应使用 Props；复用有状态算法使用组合式函数；只有当一段组件子树共享同一上下文，而且中间层不关心该上下文时，Provide / Inject 才能减少无意义转发。若状态没有共同组件祖先或需要跨页面集中调试，则应考虑 Store。',
    },
    {
      type: 'table',
      headers: ['场景', '首选工具', '判断依据'],
      rows: [
        ['父组件向直接子组件传标题', 'Props', '输入应在模板调用处可见'],
        ['多个组件复用请求清理逻辑', '组合式函数', '复用算法与副作用生命周期'],
        ['表单容器向深层字段提供注册表', 'Provide / Inject', '依赖属于同一组件子树'],
        ['多个页面共享登录用户与权限', 'Store', '所有权超出单棵局部组件子树'],
      ],
    },
    {
      type: 'compare',
      labels: ['逐层转发', '按子树提供'],
      before: `<!-- 中间组件并不使用 lesson，却仍要声明和转发 -->
<LessonSection :lesson="lesson" />
<LessonToolbar :lesson="lesson" />
<DeepAction :lesson="lesson" />`,
      after: `<!-- 祖先建立上下文，中间组件保持无关 -->
provide(lessonContextKey, context)

// 深层消费方
const context = inject(lessonContextKey)`,
    },
    { type: 'heading', content: '用 InjectionKey 建立一份共享契约' },
    {
      type: 'text',
      content:
        'provide 与 inject 往往分散在不同文件。把 Symbol key 和上下文接口放进一个独立模块，提供方与消费方导入同一个 Symbol 实例，TypeScript 才能同时校验提供值并推导注入结果。Symbol 的描述只用于调试，两个描述相同的 Symbol 仍是两个不同 key。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// lesson-context.ts
import type { InjectionKey, Ref } from 'vue'

export interface LessonContext {
  owner: string
  mode: Readonly<Ref<string>>
  revision: Readonly<Ref<number>>
  toggleMode: () => void
}

export const lessonContextKey: InjectionKey<LessonContext> = Symbol('lesson-context')`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'InjectionKey 只提供编译期约束。运行时仍按 key 的真实身份查找，所以提供方和注入方必须导入同一个 key，不能分别调用 Symbol()。',
    },
    { type: 'heading', content: '提供只读状态和修改命令' },
    {
      type: 'text',
      content:
        '提供 ref 时，后代注入到的是同一个 ref，不会自动解包。官方建议尽可能把状态修改留在提供方：向外提供 readonly 包装后的状态，并把合法修改动作作为命令一起提供。这样叶子组件可以表达意图，但不能绕过规则直接写共享状态。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { provide, readonly, ref } from 'vue'
import { lessonContextKey } from './lesson-context'

const mode = ref('完整讲解')
const revision = ref(0)

/** 由依赖所有者切换讲解模式。 */
function toggleMode() {
  mode.value = mode.value === '完整讲解' ? '关键提示' : '完整讲解'
  revision.value += 1
}

provide(lessonContextKey, {
  owner: '根课程区',
  mode: readonly(mode),
  revision: readonly(revision),
  toggleMode,
})`,
    },
    {
      type: 'text',
      content:
        'readonly 只限制通过注入引用写入，不会冻结原始 ref。提供方仍能更新原始状态，所有注入方会继续响应变化。这个模式表达的是“可观察、不可随意改；需要修改时调用领域命令”。',
    },
    { type: 'heading', content: '在注入边界立即处理缺失提供者' },
    {
      type: 'text',
      content:
        '没有默认值时，inject 的类型包含 undefined，因为运行时无法保证祖先一定提供了 key。必需依赖应在消费边界立即检查并抛出带组件语义的错误，不要在每次读取时散落可选链，也不要用非空断言隐藏错误的组件树结构。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { inject } from 'vue'
import { lessonContextKey } from './lesson-context'

/** 取得必需的课程上下文，并在组件边界报告缺少提供者。 */
export function useLessonContext() {
  const context = inject(lessonContextKey)

  if (!context) {
    throw new Error('LessonConsumer 必须位于 LessonProvider 后代中')
  }

  return context
}`,
    },
    {
      type: 'text',
      content:
        '这个 use 函数只复用“如何读取与校验上下文”，并不创建或共享状态。它必须和 inject 一样在 setup 同步执行期间调用。依赖的所有者仍是上层提供方。',
    },
    { type: 'heading', content: '最近提供者定义局部作用域' },
    {
      type: 'text',
      content:
        '当多个祖先提供同一个 key，inject 解析离消费方最近的提供者。局部提供者可以先注入祖先上下文作为输入，再向自己的后代提供完整的新上下文。覆盖发生在整个 key 上，不会把两个对象的字段自动合并。',
    },
    {
      type: 'steps',
      items: [
        {
          title: '应用或根组件提供默认上下文',
          content: '大多数分支直接读取根级依赖。',
        },
        {
          title: '局部分支读取祖先上下文',
          content: '当前组件仍从父链读取，因此能取得祖先值作为局部配置输入。',
        },
        {
          title: '局部分支提供同 key 完整契约',
          content: '其后代解析到局部值，兄弟分支仍解析到根级值。',
        },
      ],
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const parentContext = inject(lessonContextKey)
if (!parentContext) throw new Error('缺少根级课程上下文')

const localMode = ref('重点复习')

provide(lessonContextKey, {
  owner: '局部练习区',
  mode: readonly(localMode),
  revision: readonly(localRevision),
  toggleMode: toggleLocalMode,
})`,
    },
    { type: 'heading', content: '普通值、ref 与对象身份' },
    {
      type: 'table',
      headers: ['提供的值', '注入结果', '提供方变化后'],
      rows: [
        ['普通字符串或数字', '调用时的普通值', '重新赋值不会通知后代'],
        ['ref / computed', '同一个 ref，不自动解包', '通过 .value 保持响应式连接'],
        ['reactive 对象', '同一个响应式代理', '属性更新会触发依赖更新'],
        ['readonly(ref)', '只读代理', '原始 ref 更新仍会传播'],
      ],
    },
    {
      type: 'text',
      content:
        'provide 保存的是传入值的身份。如果把变量重新指向另一个 ref，已经提供的仍是旧 ref；应更新原 ref 的 value，或提供一个 computed 来表达派生关系。依赖注入不会自动观察普通变量，也不会替你重新执行 provide。',
    },
    { type: 'heading', content: '可选依赖与默认值工厂' },
    {
      type: 'text',
      content:
        '依赖确实可选时，可以传普通默认值。创建成本较高或每个消费组件需要独立实例时，可传工厂函数并把第三个参数设为 true。若依赖类型本身就是函数，不传 true，函数本身就是默认值。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 普通默认值
const tone = inject(toneKey, 'neutral')

// 函数本身就是默认依赖
const onTrack = inject(trackKey, () => undefined)

// 缺少提供者时才创建 Service 实例
const service = inject(serviceKey, () => new Service(), true)`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '提供者显式提供 undefined 时，key 已经命中，不会回退到默认工厂。若 undefined 不合法，应修正提供契约，不要依赖默认值掩盖它。',
    },
    { type: 'heading', content: '组件级与应用级上下文' },
    {
      type: 'text',
      content:
        '组件 provide 的作用域随组件子树自然建立和销毁，适合表单、Tabs、主题分区等局部上下文。app.provide 在挂载前向整个应用提供依赖，常用于插件服务。Vue 3.3+ 的 app.runWithContext 允许 setup 外代码在同步回调期间读取应用依赖，但这个上下文不会跨 await 保存。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `app.provide(serviceKey, service)

const injected = app.runWithContext(() => inject(serviceKey))

/** 先同步取得依赖，再进入异步任务。 */
async function runTask() {
  await loadData()
  injected?.refresh()
}`,
    },
    {
      type: 'demo',
      id: 'vue.core.learn.intermediate.provide-inject.dependency-scope-lab-demo',
      description: '验证根级依赖、深层消费、局部同 key 覆盖和提供方命令的作用域',
      playground: true,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '为了少写一层 Props 就隐藏直接父子的公开输入',
          description:
            'Provide / Inject 适合跨越不关心依赖的中间组件。直接父子之间的必需输入若改成注入，组件调用处就看不到完整契约。',
          consequence: '子组件离开特定祖先后突然失败，复用和测试都需要猜测隐藏依赖。',
          wrong: {
            lang: 'ts',
            content: "provide('course-title', title)",
          },
          correct: {
            lang: 'vue',
            content: '<CourseCard :title="title" />',
          },
        },
        {
          title: '使用字符串 key 并假定值一定存在、类型一定正确',
          description:
            '字符串 key 可能碰撞，也不能在提供和注入两端同步类型；没有祖先提供时 inject 返回 undefined。',
          consequence: '访问 undefined 直接抛错，或在重构后悄悄注入同名但错误类型的值。',
          wrong: {
            lang: 'ts',
            content: "const context = inject('lesson-context')\ncontext.mode.value",
          },
          correct: {
            lang: 'ts',
            content:
              "const context = inject(lessonContextKey)\nif (!context) throw new Error('缺少 LessonContext 提供者')",
          },
        },
        {
          title: '提供普通值后期待后代自动响应变化',
          description: 'provide 只保存调用当下传入的值，不会把普通变量自动转换成响应式状态。',
          consequence: '提供方变量已经改变，后代仍显示初始快照。',
          wrong: {
            lang: 'ts',
            content: "let mode = '完整讲解'\nprovide(modeKey, mode)\nmode = '关键提示'",
          },
          correct: {
            lang: 'ts',
            content:
              "const mode = ref('完整讲解')\nprovide(modeKey, readonly(mode))\nmode.value = '关键提示'",
          },
        },
        {
          title: '让任意注入方直接修改共享 ref',
          description:
            '注入同一个可写 ref 只是技术能力，不等于每个后代都拥有修改共享状态的业务权限。',
          consequence: '修改入口散落在组件树中，校验规则被绕过，也难以定位状态由谁改变。',
          wrong: {
            lang: 'ts',
            content: 'provide(countKey, count)\ninject(countKey)!.value += 1',
          },
          correct: {
            lang: 'ts',
            content:
              'provide(counterKey, {\n  count: readonly(count),\n  increment: () => count.value += 1,\n})',
          },
        },
        {
          title: '在同一组件 provide 后立即 inject 自己的值',
          description: 'inject 从当前组件的父链开始查找；当前实例刚写入的 provides 只对后代可见。',
          consequence: '当前组件读到祖先值或 undefined，而不是刚提供的局部值。',
          wrong: {
            lang: 'ts',
            content: "provide(themeKey, 'dark')\nconst ownTheme = inject(themeKey)",
          },
          correct: {
            lang: 'ts',
            content:
              "const theme = ref('dark')\nprovide(themeKey, readonly(theme))\n// 当前组件直接使用 theme",
          },
        },
        {
          title: '认为嵌套同 key 的对象会自动合并',
          description: '最近提供者会完整遮蔽远层的同 key 值，Vue 不会做对象字段级合并。',
          consequence: '局部提供者只给出一个字段时，后代读取其他字段得到 undefined。',
          wrong: {
            lang: 'ts',
            content: "provide(settingsKey, { density: 'compact' })",
          },
          correct: {
            lang: 'ts',
            content:
              "const parent = inject(settingsKey)!\nprovide(settingsKey, { ...parent, density: 'compact' })",
          },
        },
        {
          title: '混淆函数默认值与默认值工厂',
          description:
            '函数作为第二个参数时默认就是注入值；只有第三个参数为 true 时才把它当作工厂执行。',
          consequence: '消费方期待 Service 实例，却拿到一个尚未执行的函数。',
          wrong: {
            lang: 'ts',
            content: 'const service = inject(serviceKey, () => new Service())',
          },
          correct: {
            lang: 'ts',
            content: 'const service = inject(serviceKey, () => new Service(), true)',
          },
        },
        {
          title: '在模块作用域、事件回调或 await 后临时调用 inject',
          description:
            '组件内 inject 必须在 setup 同步阶段调用。异步逻辑应复用同步取得的依赖，而不是稍后重新查找上下文。',
          consequence: '没有活动组件或应用上下文时返回 undefined，并在开发环境出现警告。',
          wrong: {
            lang: 'ts',
            content: 'await loadData()\nconst service = inject(serviceKey)',
          },
          correct: {
            lang: 'ts',
            content:
              'const service = inject(serviceKey)\n\n/** 使用 setup 期间取得的依赖。 */\nasync function run() {\n  await loadData()\n  service?.refresh()\n}',
          },
        },
      ],
    },
    { type: 'heading', content: '从源码推导作用域行为' },
    {
      type: 'text',
      content:
        'Vue 3.5.40 的 apiInject.ts 显示：组件实例默认继承父级 provides 对象，第一次 provide 时才通过 Object.create(parentProvides) 建立自己的原型层。inject 从父级 provides 查询，并用 key in provides 让 JavaScript 原型链完成向上查找。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `if (parentProvides === provides) {
  provides = currentInstance.provides = Object.create(parentProvides)
}

provides[key] = value

if (provides && key in provides) {
  return provides[key]
}`,
    },
    {
      type: 'steps',
      items: [
        {
          title: '中间组件不提供时复用父级依赖表',
          content: '它不需要复制所有依赖，也不会改变后代查找结果。',
        },
        {
          title: '第一次提供时建立局部原型层',
          content: '当前 key 留在最近层，未覆盖的其他 key 仍能沿原型链找到祖先。',
        },
        {
          title: '同 key 覆盖是完整值替换',
          content: '若业务需要字段继承，局部提供者必须显式读取祖先并构造完整契约。',
        },
        {
          title: '默认工厂只在 key 缺失时执行',
          content: '显式提供 undefined 仍算命中；工厂创建次数属于每次 inject 调用。',
        },
      ],
    },
    { type: 'heading', content: '高级使用场景' },
    {
      type: 'table',
      headers: ['场景', '推荐设计', '需要守住的边界'],
      rows: [
        [
          '表单、Tabs、菜单上下文',
          '父容器提供注册表和状态，深层子项注入',
          '子项自身公开输入仍用 Props',
        ],
        [
          '局部主题或语言覆盖',
          '应用提供默认值，局部子树同 key 完整覆盖',
          '不要误以为对象字段自动合并',
        ],
        ['只读状态与领域命令', 'readonly 状态配合 save、select 等命令', '修改规则留在提供方'],
        ['插件服务', '插件用 app.provide 暴露 InjectionKey 契约', '避免把服务挂到任意全局变量'],
        ['测试替身', '在挂载边界提供同 key 的轻量替身', '测试仍验证公开依赖契约'],
        ['读取封装', 'useContext 同步 inject 并统一缺失错误', 'composable 不改变依赖所有者'],
      ],
    },
    {
      type: 'exercise',
      title: '实现可局部覆盖的课程模式上下文',
      instructions:
        '定义 InjectionKey<LessonContext>；根组件提供 readonly mode、readonly revision 与 toggleMode；中间组件不转发上下文；深层消费方显式处理缺失提供者。再增加一个局部分支，用同 key 提供完整独立上下文，验证根级命令不会改变局部分支。',
      answer: `// lesson-context.ts
export interface LessonContext {
  mode: Readonly<Ref<string>>
  revision: Readonly<Ref<number>>
  toggleMode: () => void
}

export const lessonContextKey: InjectionKey<LessonContext> = Symbol('lesson-context')

// provider
const mode = ref('完整讲解')
const revision = ref(0)

/** 切换当前提供者拥有的模式。 */
function toggleMode() {
  mode.value = mode.value === '完整讲解' ? '关键提示' : '完整讲解'
  revision.value += 1
}

provide(lessonContextKey, {
  mode: readonly(mode),
  revision: readonly(revision),
  toggleMode,
})

// consumer
const context = inject(lessonContextKey)
if (!context) throw new Error('缺少 LessonContext 提供者')`,
    },
    {
      type: 'checklist',
      items: [
        { label: '直接父子输入继续使用 Props，不为减少一层传递隐藏公开契约' },
        { label: '组件子树共享上下文时再选择 Provide / Inject' },
        { label: '提供方与注入方导入同一个 InjectionKey 实例' },
        { label: '共享状态以 readonly 形式提供，合法修改通过提供方命令完成' },
        { label: '必需依赖在注入边界显式处理 undefined' },
        { label: '理解最近提供者覆盖整个 key，不会自动合并对象字段' },
        { label: '响应式数据提供 ref、computed 或 reactive，而不是普通快照' },
        { label: '函数默认值与默认值工厂通过第三个参数明确区分' },
        { label: '组件内 provide 与 inject 都在 setup 同步阶段调用' },
        { label: '应用级服务才考虑 app.provide，并明确应用与请求生命周期' },
      ],
    },
    { type: 'heading', content: '完成本课后的判断顺序' },
    {
      type: 'text',
      content:
        '先确定依赖所有者：直接父子输入用 Props，复用算法用组合式函数，组件子树上下文才用 Provide / Inject。决定注入后，先定义共享 InjectionKey 和完整契约，再由提供方公开 readonly 状态与命令；消费方同步注入并立即处理缺失。最后检查是否存在局部同 key 覆盖、默认值工厂、应用级生命周期或跨 await 误用。',
    },
  ],
  recap: [
    'Provide / Inject 解决组件子树中的跨层依赖，不替代直接父子的 Props 契约。',
    'InjectionKey 同步两端 TypeScript 类型，但运行时仍要求导入同一个 Symbol 实例。',
    '提供 ref 会保留同一个响应式连接；普通值不会自动变成响应式。',
    '共享状态应由提供方拥有，后代读取 readonly 状态并调用提供方命令。',
    '没有默认值时 inject 可能返回 undefined，必需依赖应在边界立即检查。',
    '最近提供者完整覆盖同 key 的祖先值，不会自动合并对象字段。',
    '函数默认值与默认工厂由 inject 的第三个参数区分。',
    '组件内 provide 与 inject 必须在 setup 同步阶段调用。',
    'app.provide 适合应用级服务，runWithContext 只提供同步读取窗口。',
    'provides 原型链解释了继承、局部覆盖和测试替身为什么成立。',
  ],
})
