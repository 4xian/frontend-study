import { describe, expect, it } from 'vitest'
import { learningCatalog } from '@/content/catalog'
import { createLearningCatalog } from './LearningCatalog'
import type { CatalogSource } from './types'
import type { LessonMeta, ReferenceMeta } from '@/content/schema'

/**
 * 创建用于校验官方参考索引目标的最小目录源。
 */
function createReferenceIndexSource(): CatalogSource {
  const referenceMeta = {
    id: 'vue.core.reference.reactivity.ref',
    type: 'reference',
    title: 'ref()',
    summary: '创建响应式 ref。',
    ecosystem: 'vue',
    module: 'core',
    collection: 'reactivity',
    tags: ['ref'],
    sources: [{ title: 'Vue', url: 'https://cn.vuejs.org/' }],
    appliesTo: 'Vue 3',
    verifiedAt: '2026-07-29',
  } satisfies ReferenceMeta

  return {
    ecosystems: [
      {
        id: 'vue',
        title: 'Vue',
        summary: 'Vue 生态',
        status: 'available',
        modules: [{ id: 'core', title: 'Vue 核心', status: 'available' }],
      },
    ],
    tracks: [
      {
        purpose: 'reference',
        ecosystem: 'vue',
        module: 'core',
        collections: [
          {
            id: 'reactivity',
            title: '响应式 API',
            entryIds: [referenceMeta.id],
          },
        ],
      },
    ],
    referenceIndexes: [
      {
        ecosystem: 'vue',
        module: 'core',
        appliesTo: 'Vue 3.5.40',
        verifiedAt: '2026-07-29',
        groups: [
          {
            id: 'reactivity',
            title: '响应式 API',
            sections: [
              {
                id: 'core',
                title: '响应式核心',
                items: [
                  {
                    id: 'reactivity-core.ref',
                    name: 'ref()',
                    officialUrl: 'https://cn.vuejs.org/api/reactivity-core.html#ref',
                    depth: 'detail',
                    status: 'available',
                    target: { entryId: referenceMeta.id },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    metas: [referenceMeta],
    loaders: {
      [referenceMeta.id]: async () => ({
        meta: referenceMeta,
        signature: 'function ref<T>(value: T): Ref<T>',
        blocks: [],
      }),
    },
  }
}

describe('LearningCatalog', () => {
  it('从生产目录加载 ref 正文并返回固定相邻条目', async () => {
    const orderedIds = learningCatalog
      .getNavigation({
        purpose: 'reference',
        ecosystem: 'vue',
        module: 'core',
        collection: 'reactivity',
      })
      .entries.map((item) => item.entryId)
    const entry = await learningCatalog.loadEntry('vue.core.reference.reactivity.ref')
    const neighbors = learningCatalog.getNeighbors(entry.meta.id)

    expect({
      orderedIds,
      entryId: entry.meta.id,
      previous: neighbors.previous,
      next: neighbors.next,
    }).toEqual({
      orderedIds: [
        'vue.core.reference.reactivity.ref',
        'vue.core.reference.reactivity.reactive',
        'vue.core.reference.reactivity.shallow',
        'vue.core.reference.reactivity.readonly',
        'vue.core.reference.reactivity.to-ref',
        'vue.core.reference.reactivity.utils',
        'vue.core.reference.reactivity.custom-ref',
        'vue.core.reference.reactivity.effect-scope',
      ],
      entryId: 'vue.core.reference.reactivity.ref',
      previous: undefined,
      next: {
        id: 'vue.core.reference.reactivity.reactive',
        title: 'reactive()',
        path: '/reference/vue/core/reactivity/reactive',
      },
    })
  })

  it('仅开放有正文的目录层级，模块进总览且分类进首篇详情', () => {
    const referenceRoot = learningCatalog.getNavigation({ purpose: 'reference' })
    const referenceModule = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
    })
    const learnRoot = learningCatalog.getNavigation({ purpose: 'learn' })

    expect({
      ecosystem: referenceRoot.ecosystems[0],
      module: referenceModule.module,
      collection: referenceModule.collections[0],
      learnVueStatus: learnRoot.ecosystems[0]?.status,
    }).toMatchObject({
      ecosystem: {
        status: 'available',
        path: '/reference/vue/core',
      },
      module: {
        status: 'available',
        path: '/reference/vue/core',
      },
      collection: {
        status: 'available',
        path: '/reference/vue/core/reactivity/ref',
      },
      learnVueStatus: 'available',
    })
  })

  it('完整编排 Vue 核心参考的九个分类与五十篇内容', () => {
    const moduleNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
    })
    const collectionTitles = moduleNavigation.collections.map((collection) => collection.title)
    const entryCount = moduleNavigation.collections.reduce(
      (count, collection) =>
        count +
        learningCatalog.getNavigation({
          purpose: 'reference',
          ecosystem: 'vue',
          module: 'core',
          collection: collection.id,
        }).entries.length,
      0,
    )

    expect({ collectionTitles, entryCount }).toEqual({
      collectionTitles: [
        '响应式 API',
        '计算与侦听',
        '组合式 API',
        '组件通信',
        'Options API',
        '内置内容',
        '单文件组件',
        '全局 API',
        '进阶主题',
      ],
      entryCount: 50,
    })
  })

  it('官方参考总览完整承接六类二十八页与二百零六项基线', () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'core' })
    const items = overview?.groups.flatMap((group) =>
      group.sections.flatMap((section) => section.items),
    )

    expect({
      groupCount: overview?.groups.length,
      sectionCount: overview?.groups.reduce((total, group) => total + group.sections.length, 0),
      availableCount: overview?.availableCount,
      plannedCount: items?.filter((item) => item.status === 'planned').length,
      total: overview?.total,
      uniqueItemCount: new Set(items?.map((item) => item.id)).size,
      officialUrlsValid: items?.every((item) =>
        item.officialUrl.startsWith('https://cn.vuejs.org/api/'),
      ),
    }).toEqual({
      groupCount: 6,
      sectionCount: 28,
      availableCount: 206,
      plannedCount: 0,
      total: 206,
      uniqueItemCount: 206,
      officialUrlsValid: true,
    })
  })

  it('已登记课程路线的 Vue 模块可直接进入独立总览', () => {
    const modules = learningCatalog.getNavigation({
      purpose: 'learn',
      ecosystem: 'vue',
    }).modules

    expect(
      modules.map((module) => ({ id: module.id, status: module.status, path: module.path })),
    ).toEqual([
      { id: 'core', status: 'available', path: '/learn/vue/core' },
      { id: 'router', status: 'available', path: '/learn/vue/router' },
      { id: 'pinia', status: 'available', path: '/learn/vue/pinia' },
    ])
  })

  it('从生产目录加载计算与侦听正文，并使用新资产 ID', async () => {
    const expectedIds = [
      'vue.core.reference.reactivity-watchers.computed',
      'vue.core.reference.reactivity-watchers.watch',
      'vue.core.reference.reactivity-watchers.watch-effect',
      'vue.core.reference.reactivity-watchers.watch-post-sync',
    ]
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'reactivity-watchers',
    })
    const entries = await Promise.all(expectedIds.map((id) => learningCatalog.loadEntry(id)))
    const assetIds = entries.flatMap((entry) =>
      entry.blocks.flatMap((block) => {
        if (block.type === 'demo' || block.type === 'principle' || block.type === 'interactive') {
          return [block.id]
        }
        return []
      }),
    )

    expect({
      navigationIds: navigation.entries.map((entry) => entry.entryId),
      loadedIds: entries.map((entry) => entry.meta.id),
      collections: entries.map((entry) => entry.meta.collection),
      assetIds,
    }).toEqual({
      navigationIds: expectedIds,
      loadedIds: expectedIds,
      collections: [
        'reactivity-watchers',
        'reactivity-watchers',
        'reactivity-watchers',
        'reactivity-watchers',
      ],
      assetIds: [
        'vue.core.reference.reactivity-watchers.computed.computed-cache-demo',
        'vue.core.reference.reactivity-watchers.computed.writable-computed',
        'vue.core.reference.reactivity-watchers.computed.computed-cache',
        'vue.core.reference.reactivity-watchers.watch.watch-sources',
        'vue.core.reference.reactivity-watchers.watch.watch-options',
        'vue.core.reference.reactivity-watchers.watch.watch-timing',
        'vue.core.reference.reactivity-watchers.watch-effect.watch-effect-auto',
        'vue.core.reference.reactivity-watchers.watch-post-sync.flush-timing-demo',
      ],
    })
  })

  it('从生产目录加载组合式 API 正文，并使用新 Demo ID', async () => {
    const expectedIds = [
      'vue.core.reference.composition.lifecycle',
      'vue.core.reference.composition.provide-inject',
      'vue.core.reference.composition.template-refs',
      'vue.core.reference.composition.use-id',
    ]
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'composition',
    })
    const entries = await Promise.all(expectedIds.map((id) => learningCatalog.loadEntry(id)))
    const demoIds = entries.flatMap((entry) =>
      entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
    )

    expect({
      navigationIds: navigation.entries.map((entry) => entry.entryId),
      loadedIds: entries.map((entry) => entry.meta.id),
      collections: entries.map((entry) => entry.meta.collection),
      demoIds,
    }).toEqual({
      navigationIds: expectedIds,
      loadedIds: expectedIds,
      collections: ['composition', 'composition', 'composition', 'composition'],
      demoIds: [
        'vue.core.reference.composition.lifecycle.lifecycle-hooks-demo',
        'vue.core.reference.composition.provide-inject.provide-inject-demo',
        'vue.core.reference.composition.template-refs.template-ref-demo',
        'vue.core.reference.composition.use-id.use-id-demo',
      ],
    })
  })

  it('从生产目录加载组件通信正文，并使用新 Demo ID', async () => {
    const expectedIds = [
      'vue.core.reference.components.props',
      'vue.core.reference.components.emits',
      'vue.core.reference.components.define-model',
      'vue.core.reference.components.slots',
      'vue.core.reference.components.attrs',
    ]
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'components',
    })
    const entries = await Promise.all(expectedIds.map((id) => learningCatalog.loadEntry(id)))
    const demoIds = entries.flatMap((entry) =>
      entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
    )

    expect({
      navigationIds: navigation.entries.map((entry) => entry.entryId),
      loadedIds: entries.map((entry) => entry.meta.id),
      collections: entries.map((entry) => entry.meta.collection),
      demoIds,
    }).toEqual({
      navigationIds: expectedIds,
      loadedIds: expectedIds,
      collections: ['components', 'components', 'components', 'components', 'components'],
      demoIds: [
        'vue.core.reference.components.props.props-one-way-demo',
        'vue.core.reference.components.emits.emits-demo',
        'vue.core.reference.components.define-model.define-model-demo',
        'vue.core.reference.components.slots.scoped-slots-demo',
        'vue.core.reference.components.attrs.attrs-demo',
      ],
    })
  })

  it('从生产目录加载六篇内置内容正文，并保持既有 Demo ID', async () => {
    const expectedIds = [
      'vue.core.reference.built-ins.directives',
      'vue.core.reference.built-ins.template-primitives',
      'vue.core.reference.built-ins.transition',
      'vue.core.reference.built-ins.keep-alive',
      'vue.core.reference.built-ins.teleport',
      'vue.core.reference.built-ins.suspense',
    ]
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'built-ins',
    })
    const entries = await Promise.all(expectedIds.map((id) => learningCatalog.loadEntry(id)))
    const demoIds = entries.flatMap((entry) =>
      entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
    )

    expect({
      navigationIds: navigation.entries.map((entry) => entry.entryId),
      loadedIds: entries.map((entry) => entry.meta.id),
      collections: entries.map((entry) => entry.meta.collection),
      demoIds,
    }).toEqual({
      navigationIds: expectedIds,
      loadedIds: expectedIds,
      collections: ['built-ins', 'built-ins', 'built-ins', 'built-ins', 'built-ins', 'built-ins'],
      demoIds: [
        'vue.core.reference.built-ins.transition.transition-demo',
        'vue.core.reference.built-ins.keep-alive.keep-alive-demo',
        'vue.core.reference.built-ins.teleport.teleport-demo',
        'vue.core.reference.built-ins.suspense.suspense-demo',
      ],
    })
  })

  it('从生产目录加载六篇全局 API 正文，并保持既有 Demo ID', async () => {
    const expectedIds = [
      'vue.core.reference.application.create-app',
      'vue.core.reference.application.create-ssr-app',
      'vue.core.reference.application.application-configuration',
      'vue.core.reference.application.next-tick',
      'vue.core.reference.application.define-component',
      'vue.core.reference.application.define-async-component',
    ]
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'application',
    })
    const entries = await Promise.all(expectedIds.map((id) => learningCatalog.loadEntry(id)))
    const demoIds = entries.flatMap((entry) =>
      entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
    )

    expect({
      navigationIds: navigation.entries.map((entry) => entry.entryId),
      loadedIds: entries.map((entry) => entry.meta.id),
      collections: entries.map((entry) => entry.meta.collection),
      demoIds,
    }).toEqual({
      navigationIds: expectedIds,
      loadedIds: expectedIds,
      collections: [
        'application',
        'application',
        'application',
        'application',
        'application',
        'application',
      ],
      demoIds: [
        'vue.core.reference.application.create-app.create-app-demo',
        'vue.core.reference.application.next-tick.next-tick-demo',
        'vue.core.reference.application.define-async-component.async-component-demo',
      ],
    })
  })

  it('从生产目录加载进阶主题正文，并使用新 Demo ID', async () => {
    const expectedIds = [
      'vue.core.reference.advanced.custom-directives',
      'vue.core.reference.advanced.custom-elements',
      'vue.core.reference.advanced.render-function',
      'vue.core.reference.advanced.server-rendering',
      'vue.core.reference.advanced.composables',
      'vue.core.reference.advanced.utility-types',
      'vue.core.reference.advanced.custom-renderer',
      'vue.core.reference.advanced.compile-time-flags',
    ]
    const navigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'core',
      collection: 'advanced',
    })
    const entries = await Promise.all(expectedIds.map((id) => learningCatalog.loadEntry(id)))
    const demoIds = entries.flatMap((entry) =>
      entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
    )

    expect({
      navigationIds: navigation.entries.map((entry) => entry.entryId),
      loadedIds: entries.map((entry) => entry.meta.id),
      collections: entries.map((entry) => entry.meta.collection),
      demoIds,
    }).toEqual({
      navigationIds: expectedIds,
      loadedIds: expectedIds,
      collections: [
        'advanced',
        'advanced',
        'advanced',
        'advanced',
        'advanced',
        'advanced',
        'advanced',
        'advanced',
      ],
      demoIds: [
        'vue.core.reference.advanced.custom-directives.custom-directive-demo',
        'vue.core.reference.advanced.render-function.render-function-demo',
        'vue.core.reference.advanced.composables.composable-demo',
      ],
    })
  })

  it('按显式阶段返回课程顺序和总课数', () => {
    const lessonMetas = [
      {
        id: 'vue.core.learn.basics.template-syntax',
        type: 'lesson',
        title: '模板语法',
        summary: '学习模板语法',
        ecosystem: 'vue',
        module: 'core',
        collection: 'basics',
        tags: ['template'],
        sources: [{ title: 'Vue', url: 'https://vuejs.org/' }],
        appliesTo: 'Vue 3',
        verifiedAt: '2026-07-29',
      },
      {
        id: 'vue.core.learn.intermediate.lifecycle',
        type: 'lesson',
        title: '生命周期',
        summary: '学习生命周期',
        ecosystem: 'vue',
        module: 'core',
        collection: 'intermediate',
        tags: ['lifecycle'],
        sources: [{ title: 'Vue', url: 'https://vuejs.org/' }],
        appliesTo: 'Vue 3',
        verifiedAt: '2026-07-29',
      },
      {
        id: 'vue.core.learn.advanced.render-function',
        type: 'lesson',
        title: '渲染函数',
        summary: '学习渲染函数',
        ecosystem: 'vue',
        module: 'core',
        collection: 'advanced',
        tags: ['render'],
        sources: [{ title: 'Vue', url: 'https://vuejs.org/' }],
        appliesTo: 'Vue 3',
        verifiedAt: '2026-07-29',
      },
    ] satisfies LessonMeta[]
    const source: CatalogSource = {
      ecosystems: [
        {
          id: 'vue',
          title: 'Vue',
          summary: 'Vue 生态',
          status: 'available',
          modules: [{ id: 'core', title: 'Vue 核心', status: 'available' }],
        },
      ],
      tracks: [
        {
          purpose: 'learn',
          ecosystem: 'vue',
          module: 'core',
          collections: [
            {
              id: 'basics',
              title: '基础课程',
              categories: [
                {
                  id: 'template',
                  title: '模板',
                  summary: '模板基础',
                  topics: ['模板语法'],
                  entries: [{ id: 'vue.core.learn.basics.template-syntax', status: 'available' }],
                },
              ],
            },
            {
              id: 'intermediate',
              title: '中级课程',
              categories: [
                {
                  id: 'lifecycle',
                  title: '生命周期',
                  summary: '生命周期基础',
                  topics: ['生命周期'],
                  entries: [{ id: 'vue.core.learn.intermediate.lifecycle', status: 'available' }],
                },
              ],
            },
            {
              id: 'advanced',
              title: '高级课程',
              categories: [
                {
                  id: 'rendering',
                  title: '渲染',
                  summary: '渲染进阶',
                  topics: ['渲染函数'],
                  entries: [{ id: 'vue.core.learn.advanced.render-function', status: 'available' }],
                },
              ],
            },
          ],
        },
      ],
      metas: lessonMetas,
      loaders: Object.fromEntries(
        lessonMetas.map((meta) => [meta.id, async () => ({ meta, objectives: [], blocks: [] })]),
      ),
    }
    const track = createLearningCatalog(source).getLearningTrack({
      ecosystem: 'vue',
      module: 'core',
    })

    expect({
      stages: track?.stages.map((stage) => ({
        id: stage.id,
        entryIds: stage.entries.map((entry) => entry.entryId),
      })),
      entryIds: track?.entries.map((entry) => entry.entryId),
      total: track?.total,
    }).toEqual({
      stages: [
        { id: 'basics', entryIds: ['vue.core.learn.basics.template-syntax'] },
        { id: 'intermediate', entryIds: ['vue.core.learn.intermediate.lifecycle'] },
        { id: 'advanced', entryIds: ['vue.core.learn.advanced.render-function'] },
      ],
      entryIds: [
        'vue.core.learn.basics.template-syntax',
        'vue.core.learn.intermediate.lifecycle',
        'vue.core.learn.advanced.render-function',
      ],
      total: 3,
    })
  })

  it('学习路径公开完整规划，但进度顺序只包含已上线课程', () => {
    const lessonMeta = {
      id: 'vue.core.learn.basics.template-syntax',
      type: 'lesson',
      title: '模板语法',
      summary: '学习模板语法',
      ecosystem: 'vue',
      module: 'core',
      collection: 'basics',
      tags: ['template'],
      sources: [{ title: 'Vue', url: 'https://vuejs.org/' }],
      appliesTo: 'Vue 3',
      verifiedAt: '2026-07-29',
    } satisfies LessonMeta
    const source = {
      ecosystems: [
        {
          id: 'vue',
          title: 'Vue',
          summary: 'Vue 生态',
          status: 'available',
          modules: [{ id: 'core', title: 'Vue 核心', status: 'available' }],
        },
      ],
      tracks: [
        {
          purpose: 'learn',
          ecosystem: 'vue',
          module: 'core',
          collections: [
            {
              id: 'basics',
              title: '基础课程',
              categories: [
                {
                  id: 'sfc-and-template',
                  title: '单文件组件与模板',
                  summary: '建立组件文件与模板基础。',
                  topics: ['单文件组件', '模板语法'],
                  entries: [
                    { id: lessonMeta.id, status: 'available' },
                    {
                      id: 'vue.core.learn.basics.conditional-list-rendering',
                      title: '条件渲染与列表渲染',
                      summary: '根据状态选择或重复渲染内容。',
                      status: 'planned',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      metas: [lessonMeta],
      loaders: {
        [lessonMeta.id]: async () => ({ meta: lessonMeta, objectives: [], blocks: [] }),
      },
    } as unknown as CatalogSource

    const track = createLearningCatalog(source).getLearningTrack({
      ecosystem: 'vue',
      module: 'core',
    })
    const category = track?.stages[0]?.categories[0]

    expect({
      availableEntryIds: track?.entries.map((entry) => entry.entryId),
      availableTotal: track?.total,
      roadmapTotal: track?.roadmapTotal,
      category: category && {
        id: category.id,
        availableCount: category.availableCount,
        total: category.total,
        entries: category.entries.map((entry) => ({
          entryId: entry.entryId,
          title: entry.title,
          status: entry.status,
          path: entry.path,
        })),
      },
    }).toEqual({
      availableEntryIds: ['vue.core.learn.basics.template-syntax'],
      availableTotal: 1,
      roadmapTotal: 2,
      category: {
        id: 'sfc-and-template',
        availableCount: 1,
        total: 2,
        entries: [
          {
            entryId: 'vue.core.learn.basics.template-syntax',
            title: '模板语法',
            status: 'available',
            path: '/learn/vue/core/basics/template-syntax',
          },
          {
            entryId: 'vue.core.learn.basics.conditional-list-rendering',
            title: '条件渲染与列表渲染',
            status: 'planned',
            path: undefined,
          },
        ],
      },
    })
  })

  it('参考总览公开官方覆盖状态，并将合并条目定位到站内锚点', () => {
    const referenceMeta = {
      id: 'vue.core.reference.reactivity.readonly',
      type: 'reference',
      title: 'readonly() / shallowReadonly()',
      summary: '创建只读代理。',
      ecosystem: 'vue',
      module: 'core',
      collection: 'reactivity',
      tags: ['readonly'],
      sources: [{ title: 'Vue', url: 'https://vuejs.org/' }],
      appliesTo: 'Vue 3',
      verifiedAt: '2026-07-29',
      anchors: ['readonly()', 'shallowReadonly()'],
    } satisfies ReferenceMeta
    const source = {
      ecosystems: [
        {
          id: 'vue',
          title: 'Vue',
          summary: 'Vue 生态',
          status: 'available',
          modules: [{ id: 'core', title: 'Vue 核心', status: 'available' }],
        },
      ],
      tracks: [
        {
          purpose: 'reference',
          ecosystem: 'vue',
          module: 'core',
          collections: [
            {
              id: 'reactivity',
              title: '响应式 API',
              entryIds: [referenceMeta.id],
            },
          ],
        },
      ],
      referenceIndexes: [
        {
          ecosystem: 'vue',
          module: 'core',
          appliesTo: 'Vue 3.5.40',
          verifiedAt: '2026-07-29',
          groups: [
            {
              id: 'reactivity',
              title: '响应式 API',
              sections: [
                {
                  id: 'core',
                  title: '响应式核心',
                  items: [
                    {
                      id: 'reactivity-core.readonly',
                      name: 'readonly()',
                      officialUrl: 'https://cn.vuejs.org/api/reactivity-core.html#readonly',
                      depth: 'detail',
                      status: 'available',
                      target: { entryId: referenceMeta.id },
                    },
                    {
                      id: 'reactivity-core.shallow-readonly',
                      name: 'shallowReadonly()',
                      officialUrl:
                        'https://cn.vuejs.org/api/reactivity-advanced.html#shallowreadonly',
                      depth: 'merged',
                      status: 'available',
                      target: { entryId: referenceMeta.id, anchor: 'shallowreadonly' },
                    },
                    {
                      id: 'reactivity-core.is-proxy',
                      name: 'isProxy()',
                      officialUrl: 'https://cn.vuejs.org/api/reactivity-utilities.html#isproxy',
                      depth: 'quick',
                      status: 'planned',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      metas: [referenceMeta],
      loaders: {
        [referenceMeta.id]: async () => ({ meta: referenceMeta, blocks: [] }),
      },
    } as unknown as CatalogSource

    const overview = createLearningCatalog(source).getReferenceOverview({
      ecosystem: 'vue',
      module: 'core',
    })
    const items = overview?.groups[0]?.sections[0]?.items

    expect({
      availableCount: overview?.availableCount,
      total: overview?.total,
      appliesTo: overview?.appliesTo,
      verifiedAt: overview?.verifiedAt,
      items: items?.map((item) => ({
        id: item.id,
        status: item.status,
        depth: item.depth,
        path: item.path,
      })),
    }).toEqual({
      availableCount: 2,
      total: 3,
      appliesTo: 'Vue 3.5.40',
      verifiedAt: '2026-07-29',
      items: [
        {
          id: 'reactivity-core.readonly',
          status: 'available',
          depth: 'detail',
          path: '/reference/vue/core/reactivity/readonly',
        },
        {
          id: 'reactivity-core.shallow-readonly',
          status: 'available',
          depth: 'merged',
          path: '/reference/vue/core/reactivity/readonly#shallowreadonly',
        },
        {
          id: 'reactivity-core.is-proxy',
          status: 'planned',
          depth: 'quick',
          path: undefined,
        },
      ],
    })
  })

  it('拒绝缺少站内目标的已上线参考索引', () => {
    const source = createReferenceIndexSource()
    source.referenceIndexes![0]!.groups[0]!.sections[0]!.items[0]!.target = undefined

    expect(() => createLearningCatalog(source)).toThrow('已上线参考索引缺少站内目标')
  })

  it('拒绝指向其他模块的参考索引目标', () => {
    const source = createReferenceIndexSource()
    source.ecosystems[0]!.modules.push({
      id: 'router',
      title: 'Vue Router',
      status: 'planned',
    })
    source.referenceIndexes![0]!.module = 'router'

    expect(() => createLearningCatalog(source)).toThrow('参考索引目标与模块不一致')
  })

  it.each([
    {
      scope: {
        purpose: 'reference' as const,
        ecosystem: 'vue',
        module: 'core',
        collection: 'reactivity',
      },
      expectedPaths: [
        '/reference/vue/core/reactivity/ref',
        '/reference/vue/core/reactivity/reactive',
      ],
      loadedId: 'vue.core.reference.reactivity.reactive',
    },
  ])('按清单顺序导航，并仅在请求正文时执行加载器', async (fixture) => {
    let loadCount = 0
    const source: CatalogSource = {
      ecosystems: [
        {
          id: 'vue',
          title: 'Vue',
          summary: 'Vue 生态',
          status: 'available',
          modules: [{ id: 'core', title: 'Vue 核心', status: 'available' }],
        },
      ],
      tracks: [
        {
          purpose: 'reference',
          ecosystem: 'vue',
          module: 'core',
          collections: [
            {
              id: 'reactivity',
              title: '响应式 API',
              entryIds: [
                'vue.core.reference.reactivity.ref',
                'vue.core.reference.reactivity.reactive',
              ],
            },
          ],
        },
      ],
      metas: [
        {
          id: 'vue.core.reference.reactivity.reactive',
          type: 'reference',
          title: 'reactive()',
          summary: '创建响应式对象',
          ecosystem: 'vue',
          module: 'core',
          collection: 'reactivity',
          tags: ['reactivity'],
          sources: [{ title: 'Vue', url: 'https://vuejs.org/' }],
          appliesTo: 'Vue 3',
          verifiedAt: '2026-07-27',
        },
        {
          id: 'vue.core.reference.reactivity.ref',
          type: 'reference',
          title: 'ref()',
          summary: '创建响应式引用',
          ecosystem: 'vue',
          module: 'core',
          collection: 'reactivity',
          tags: ['reactivity'],
          sources: [{ title: 'Vue', url: 'https://vuejs.org/' }],
          appliesTo: 'Vue 3',
          verifiedAt: '2026-07-27',
        },
      ],
      loaders: {
        'vue.core.reference.reactivity.ref': async () => ({
          meta: source.metas[1] as ReferenceMeta,
          signature: 'function ref<T>(value: T): Ref<T>',
          blocks: [],
        }),
        'vue.core.reference.reactivity.reactive': async () => {
          loadCount += 1
          return {
            meta: source.metas[0] as ReferenceMeta,
            signature: 'function reactive<T extends object>(target: T): UnwrapNestedRefs<T>',
            blocks: [],
          }
        },
      },
    }
    const catalog = createLearningCatalog(source)
    const paths = catalog.getNavigation(fixture.scope).entries.map((entry) => entry.path)
    const meta = catalog.getEntry(fixture.loadedId)
    const countBeforeLoad = loadCount
    const loaded = await catalog.loadEntry(fixture.loadedId)

    expect({
      paths,
      metaId: meta?.id,
      countBeforeLoad,
      loadedId: loaded.meta.id,
      loadCount,
    }).toEqual({
      paths: fixture.expectedPaths,
      metaId: fixture.loadedId,
      countBeforeLoad: 0,
      loadedId: fixture.loadedId,
      loadCount: 1,
    })
  })
})
