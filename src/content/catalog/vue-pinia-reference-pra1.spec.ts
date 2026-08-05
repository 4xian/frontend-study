import { describe, expect, it } from 'vitest'
import { headingId } from '@/components/blocks/heading-id'
import { learningCatalog } from '@/content/catalog'
import { piniaRestrictedReferenceItems } from '@/content/catalog/manifests/vue-pinia-reference-index'
import type { ReferenceMeta } from '@/content/schema'

const piniaInstanceEntryId = 'vue.pinia.reference.core.pinia-instance'
const defineStoreEntryId = 'vue.pinia.reference.stores.define-store'
const storeShapeEntryId = 'vue.pinia.reference.stores.store-shape'
const storeToRefsEntryId = 'vue.pinia.reference.stores.store-to-refs'
const subscriptionsEntryId = 'vue.pinia.reference.observation.subscriptions'
const hydrationEntryId = 'vue.pinia.reference.runtime.hydration'
const hmrEntryId = 'vue.pinia.reference.runtime.hmr'
const pluginContractsEntryId = 'vue.pinia.reference.plugins.plugin-contracts'
const mapHelpersEntryId = 'vue.pinia.reference.options-api.map-helpers'
const internalTypesEntryId = 'vue.pinia.reference.boundaries.internal-types'

const pra1Mappings = [
  ['interfaces.pinia', piniaInstanceEntryId, 'pinia-interface', 'core'],
  ['variables.getactivepinia', piniaInstanceEntryId, 'get-active-pinia', 'core'],
  ['variables.setactivepinia', piniaInstanceEntryId, 'set-active-pinia', 'core'],
  ['functions.createpinia', piniaInstanceEntryId, 'create-pinia', 'core'],
  ['functions.disposepinia', piniaInstanceEntryId, 'dispose-pinia', 'core'],
  [
    'interfaces.definesetupstoreoptions',
    defineStoreEntryId,
    'define-setup-store-options',
    'stores',
  ],
  ['interfaces.definestoreoptions', defineStoreEntryId, 'define-store-options', 'stores'],
  ['interfaces.definestoreoptionsbase', defineStoreEntryId, 'define-store-options-base', 'stores'],
  ['interfaces.setupstoredefinition', defineStoreEntryId, 'setup-store-definition', 'stores'],
  ['interfaces.storedefinition', defineStoreEntryId, 'store-definition', 'stores'],
  ['functions.definestore', defineStoreEntryId, 'define-store', 'stores'],
  ['interfaces.storeproperties', storeShapeEntryId, 'store-properties', 'stores'],
  ['type-aliases.statetree', storeShapeEntryId, 'state-tree', 'stores'],
  ['type-aliases.store', storeShapeEntryId, 'store-type', 'stores'],
  ['type-aliases.storeactions', storeShapeEntryId, 'store-actions', 'stores'],
  ['type-aliases.storegeneric', storeShapeEntryId, 'store-generic', 'stores'],
  ['type-aliases.storegetters', storeShapeEntryId, 'store-getters', 'stores'],
  ['type-aliases.storestate', storeShapeEntryId, 'store-state', 'stores'],
  ['functions.storetorefs', storeToRefsEntryId, 'store-to-refs', 'stores'],
] as const

const pra2Mappings = [
  ['enumerations.mutationtype', subscriptionsEntryId, 'mutation-type', 'observation'],
  [
    'interfaces.subscriptioncallbackmutationdirect',
    subscriptionsEntryId,
    'direct-mutation',
    'observation',
  ],
  [
    'interfaces.subscriptioncallbackmutationpatchfunction',
    subscriptionsEntryId,
    'patch-function-mutation',
    'observation',
  ],
  [
    'interfaces.subscriptioncallbackmutationpatchobject',
    subscriptionsEntryId,
    'patch-object-mutation',
    'observation',
  ],
  [
    'type-aliases.storeonactionlistener',
    subscriptionsEntryId,
    'store-on-action-listener',
    'observation',
  ],
  [
    'type-aliases.storeonactionlistenercontext',
    subscriptionsEntryId,
    'store-on-action-listener-context',
    'observation',
  ],
  [
    'type-aliases.subscriptioncallback',
    subscriptionsEntryId,
    'subscription-callback',
    'observation',
  ],
  [
    'type-aliases.subscriptioncallbackmutation',
    subscriptionsEntryId,
    'subscription-callback-mutation',
    'observation',
  ],
  ['functions.accepthmrupdate', hmrEntryId, 'accept-hmr-update', 'runtime'],
  ['functions.shouldhydrate', hydrationEntryId, 'should-hydrate', 'runtime'],
  ['functions.skiphydrate', hydrationEntryId, 'skip-hydrate', 'runtime'],
] as const

const pra3Mappings = [
  [
    'interfaces.definestoreoptionsinplugin',
    pluginContractsEntryId,
    'define-store-options-in-plugin',
    'plugins',
  ],
  [
    'interfaces.piniacustomproperties',
    pluginContractsEntryId,
    'pinia-custom-properties',
    'plugins',
  ],
  [
    'interfaces.piniacustomstateproperties',
    pluginContractsEntryId,
    'pinia-custom-state-properties',
    'plugins',
  ],
  ['interfaces.piniaplugin', pluginContractsEntryId, 'pinia-plugin', 'plugins'],
  ['interfaces.piniaplugincontext', pluginContractsEntryId, 'pinia-plugin-context', 'plugins'],
  [
    'interfaces.mapstorescustomization',
    mapHelpersEntryId,
    'map-stores-customization',
    'options-api',
  ],
  ['functions.mapactions', mapHelpersEntryId, 'map-actions', 'options-api'],
  ['functions.mapstate', mapHelpersEntryId, 'map-state', 'options-api'],
  ['functions.mapstores', mapHelpersEntryId, 'map-stores', 'options-api'],
  ['functions.mapwritablestate', mapHelpersEntryId, 'map-writable-state', 'options-api'],
  ['functions.setmapstoresuffix', mapHelpersEntryId, 'set-map-store-suffix', 'options-api'],
] as const

const allMappings = [...pra1Mappings, ...pra2Mappings, ...pra3Mappings] as const

const referenceEntries = [
  [piniaInstanceEntryId, 'core', 8],
  [defineStoreEntryId, 'stores', 8],
  [storeShapeEntryId, 'stores', 10],
  [storeToRefsEntryId, 'stores', 8],
  [subscriptionsEntryId, 'observation', 10],
  [hydrationEntryId, 'runtime', 8],
  [hmrEntryId, 'runtime', 8],
  [pluginContractsEntryId, 'plugins', 10],
  [mapHelpersEntryId, 'options-api', 10],
  [internalTypesEntryId, 'boundaries', 5],
] as const

const ra0Ids = `
enumerations.mutationtype
interfaces.storeonactionlistenercontext
interfaces.storewithstate
interfaces.subscriptioncallbackmutationbase
interfaces.definesetupstoreoptions
interfaces.definestoreoptions
interfaces.definestoreoptionsbase
interfaces.definestoreoptionsinplugin
interfaces.mapstorescustomization
interfaces.pinia
interfaces.piniacustomproperties
interfaces.piniacustomstateproperties
interfaces.piniaplugin
interfaces.piniaplugincontext
interfaces.setupstoredefinition
interfaces.storedefinition
interfaces.storeproperties
interfaces.subscriptioncallbackmutationdirect
interfaces.subscriptioncallbackmutationpatchfunction
interfaces.subscriptioncallbackmutationpatchobject
type-aliases.actionstree
type-aliases.deeppartial
type-aliases.extractactionsfromsetupstore
type-aliases.extractactionsfromsetupstore_keys
type-aliases.extractgettersfromsetupstore
type-aliases.extractgettersfromsetupstore_keys
type-aliases.extractstatefromsetupstore
type-aliases.extractstatefromsetupstore_keys
type-aliases.getterstree
type-aliases.mapactionsobjectreturn
type-aliases.mapactionsreturn
type-aliases.mapstateobjectreturn
type-aliases.mapstatereturn
type-aliases.mapwritablestateobjectreturn
type-aliases.mapwritablestatereturn
type-aliases.method
type-aliases.spread
type-aliases.statetree
type-aliases.store
type-aliases.storeactions
type-aliases.storegeneric
type-aliases.storegetters
type-aliases.storeobject
type-aliases.storeonactionlistener
type-aliases.storeonactionlistenercontext
type-aliases.storestate
type-aliases.storewithactions
type-aliases.storewithgetters
type-aliases.subscriptioncallback
type-aliases.subscriptioncallbackmutation
type-aliases.unwrapall
variables.getactivepinia
variables.mapgetters
variables.setactivepinia
variables.piniasymbol
functions.accepthmrupdate
functions.createpinia
functions.definestore
functions.disposepinia
functions.mapactions
functions.mapstate
functions.mapstores
functions.mapwritablestate
functions.setmapstoresuffix
functions.shouldhydrate
functions.skiphydrate
functions.storetorefs
`
  .trim()
  .split(/\s+/)
  .sort()

/** 将目录或 restricted tuple 的分类维度转换为稳定机械计数。 */
function countBy<T>(values: readonly T[], select: (value: T) => string): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    const key = select(value)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

describe('Pinia Reference PRA1-PRA4', () => {
  it('累计发布 41 项，并保持 stable 与 restricted 边界闭合', async () => {
    const overview = learningCatalog.getReferenceOverview({ ecosystem: 'vue', module: 'pinia' })
    const items =
      overview?.groups.flatMap((group) => group.sections.flatMap((section) => section.items)) ?? []
    const itemsById = new Map(items.map((item) => [item.id, item]))
    const availableItems = items.filter((item) => item.status === 'available')
    const plannedItems = items.filter((item) => item.status === 'planned')
    const stableIds = items.map((item) => item.id)
    const restrictedIds = piniaRestrictedReferenceItems.map(([id]) => id)
    const restrictedIdSet = new Set<string>(restrictedIds)

    expect({
      available: overview?.availableCount,
      planned: plannedItems.length,
      total: overview?.total,
      sourceTags: countBy(items, (item) => item.sourceTag ?? 'missing'),
      depths: countBy(items, (item) => item.depth),
    }).toEqual({
      available: 41,
      planned: 0,
      total: 41,
      sourceTags: { public: 41 },
      depths: { detail: 17, merged: 17, quick: 7 },
    })
    expect(countBy(availableItems, (item) => item.depth)).toEqual({
      detail: 17,
      merged: 17,
      quick: 7,
    })
    expect(
      countBy(
        pra2Mappings.map(([id]) => itemsById.get(id)!),
        (item) => item.depth,
      ),
    ).toEqual({ detail: 5, merged: 6 })
    expect(
      countBy(
        pra3Mappings.map(([id]) => itemsById.get(id)!),
        (item) => item.depth,
      ),
    ).toEqual({ detail: 2, merged: 7, quick: 2 })
    expect(pra3Mappings.filter(([, entryId]) => entryId === pluginContractsEntryId)).toHaveLength(5)
    expect(pra3Mappings.filter(([, entryId]) => entryId === mapHelpersEntryId)).toHaveLength(6)

    expect({
      total: piniaRestrictedReferenceItems.length,
      sourceTags: countBy(piniaRestrictedReferenceItems, (item) => item[2]),
      coverage: countBy(piniaRestrictedReferenceItems, (item) => item[6]),
    }).toEqual({
      total: 26,
      sourceTags: { internal: 25, deprecated: 1 },
      coverage: { documented: 26 },
    })
    const internalTypesItems = piniaRestrictedReferenceItems.filter(
      (item) => item[4] === internalTypesEntryId,
    )
    expect(internalTypesItems).toHaveLength(24)
    expect(internalTypesItems.every((item) => item[2] === 'internal')).toBe(true)
    expect(internalTypesItems.every((item) => item[6] === 'documented')).toBe(true)
    expect(new Set(stableIds).size).toBe(41)
    expect(new Set(restrictedIds).size).toBe(26)
    expect(stableIds.filter((id) => restrictedIdSet.has(id))).toEqual([])
    expect([...stableIds, ...restrictedIds].sort()).toEqual(ra0Ids)

    expect(
      allMappings.map(([id]) => {
        const item = itemsById.get(id)
        return [item?.id, item?.status, item?.target?.entryId, item?.target?.anchor, item?.path]
      }),
    ).toEqual(
      allMappings.map(([id, entryId, anchor, collection]) => [
        id,
        'available',
        entryId,
        anchor,
        `/reference/vue/pinia/${collection}/${entryId.split('.').at(-1)}#${anchor}`,
      ]),
    )
    expect(plannedItems.every((item) => item.target === undefined && item.path === undefined)).toBe(
      true,
    )
    expect(
      countBy(
        items.filter((item) => item.status === 'available'),
        (item) => item.target?.entryId ?? 'missing',
      ),
    ).toEqual({
      [piniaInstanceEntryId]: 5,
      [defineStoreEntryId]: 6,
      [storeShapeEntryId]: 7,
      [storeToRefsEntryId]: 1,
      [subscriptionsEntryId]: 8,
      [hmrEntryId]: 1,
      [hydrationEntryId]: 2,
      [pluginContractsEntryId]: 5,
      [mapHelpersEntryId]: 6,
    })

    const coreNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'core',
    })
    const storesNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'stores',
    })
    const observationNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'observation',
    })
    const runtimeNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'runtime',
    })
    const pluginsNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'plugins',
    })
    const optionsApiNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'options-api',
    })
    const boundariesNavigation = learningCatalog.getNavigation({
      purpose: 'reference',
      ecosystem: 'vue',
      module: 'pinia',
      collection: 'boundaries',
    })
    expect(runtimeNavigation.collections.map((collection) => collection.id)).toEqual([
      'core',
      'stores',
      'observation',
      'runtime',
      'plugins',
      'options-api',
      'boundaries',
    ])
    expect(coreNavigation.entries.map((entry) => entry.entryId)).toEqual([piniaInstanceEntryId])
    expect(storesNavigation.entries.map((entry) => entry.entryId)).toEqual([
      defineStoreEntryId,
      storeShapeEntryId,
      storeToRefsEntryId,
    ])
    expect(observationNavigation.entries.map((entry) => entry.entryId)).toEqual([
      subscriptionsEntryId,
    ])
    expect(runtimeNavigation.entries.map((entry) => entry.entryId)).toEqual([
      hydrationEntryId,
      hmrEntryId,
    ])
    expect(pluginsNavigation.entries.map((entry) => entry.entryId)).toEqual([
      pluginContractsEntryId,
    ])
    expect(optionsApiNavigation.entries.map((entry) => entry.entryId)).toEqual([mapHelpersEntryId])
    expect(boundariesNavigation.entries.map((entry) => entry.entryId)).toEqual([
      internalTypesEntryId,
    ])

    const entries = await Promise.all(
      referenceEntries.map(([entryId]) => learningCatalog.loadEntry(entryId)),
    )
    const entriesById = new Map(entries.map((entry) => [entry.meta.id, entry]))

    const storeToRefsEntry = entriesById.get(storeToRefsEntryId)
    if (!storeToRefsEntry || !('signature' in storeToRefsEntry)) {
      throw new Error(`${storeToRefsEntryId} 必须是 ReferenceEntry`)
    }
    const ssrPitfall = storeToRefsEntry.blocks
      .filter((block) => block.type === 'pitfalls')
      .flatMap((block) => block.items)
      .find((item) => item.title === '把提取等同于 SSR 序列化')
    const ssrCorrectExample = ssrPitfall?.correct.content ?? ''
    const initializePluginState = 'store.$state.pluginState = initialPluginState'
    const bindPluginState = "store.pluginState = toRef(store.$state, 'pluginState')"
    expect(ssrCorrectExample).toContain(initializePluginState)
    expect(ssrCorrectExample).toContain(bindPluginState)
    expect(ssrCorrectExample.indexOf(initializePluginState)).toBeLessThan(
      ssrCorrectExample.indexOf(bindPluginState),
    )

    const hydrationEntry = entriesById.get(hydrationEntryId)
    const hmrEntry = entriesById.get(hmrEntryId)
    const pluginContractsEntry = entriesById.get(pluginContractsEntryId)
    const mapHelpersEntry = entriesById.get(mapHelpersEntryId)
    const internalTypesEntry = entriesById.get(internalTypesEntryId)
    if (!hydrationEntry || !('signature' in hydrationEntry)) {
      throw new Error(`${hydrationEntryId} 必须是 ReferenceEntry`)
    }
    if (!hmrEntry || !('signature' in hmrEntry)) {
      throw new Error(`${hmrEntryId} 必须是 ReferenceEntry`)
    }
    if (!pluginContractsEntry || !('signature' in pluginContractsEntry)) {
      throw new Error(`${pluginContractsEntryId} 必须是 ReferenceEntry`)
    }
    if (!mapHelpersEntry || !('signature' in mapHelpersEntry)) {
      throw new Error(`${mapHelpersEntryId} 必须是 ReferenceEntry`)
    }
    if (!internalTypesEntry || !('signature' in internalTypesEntry)) {
      throw new Error(`${internalTypesEntryId} 必须是 ReferenceEntry`)
    }
    const hydrationContent = JSON.stringify(hydrationEntry.blocks)
    expect(hydrationContent).toContain('Setup Store')
    expect(hydrationContent).toContain('Options Store')
    expect(hydrationContent).toContain('宿主 SSR')
    expect(hydrationContent).toContain('Deferred/not-run')

    const hmrContent = JSON.stringify(hmrEntry.blocks)
    expect(hmrContent).toContain('Deferred/not-run')
    expect(hmrContent).toContain('$subscribe()')
    expect(hmrContent).toContain('$onAction()')
    expect(hmrContent.match(/it\.todo/g)).toHaveLength(2)

    const pluginContent = JSON.stringify(pluginContractsEntry.blocks)
    const pluginInstallationExample =
      pluginContractsEntry.blocks
        .flatMap((block) =>
          block.type === 'code' && block.content.includes('pinia.use(plugin)')
            ? [block.content]
            : [],
        )
        .at(0) ?? ''
    const pluginContextTable = pluginContractsEntry.blocks.find(
      (block) => block.type === 'table' && block.headers.includes('identity'),
    )
    const pluginHeadingIds = pluginContractsEntry.blocks.flatMap((block) =>
      block.type === 'heading' ? [headingId(block.content)] : [],
    )
    const mapHeadingIds = mapHelpersEntry.blocks.flatMap((block) =>
      block.type === 'heading' ? [headingId(block.content)] : [],
    )
    expect(pluginContent).toContain('app.use(pinia)')
    expect(pluginContent).toContain('store.$state')
    expect(pluginContent).toContain('toRef')
    expect(pluginContent).toContain('Devtools')
    expect(pluginContent).toContain('SSR serialization')
    expect(pluginContent).toContain('Hydration')
    expect(pluginContent).toContain('declaration merging')
    expect(pluginContent).toContain('$dispose')
    expect(pluginInstallationExample.indexOf('pinia.use(plugin)')).toBeLessThan(
      pluginInstallationExample.indexOf('app.use(pinia)'),
    )
    expect(pluginInstallationExample.indexOf('app.use(pinia)')).toBeLessThan(
      pluginInstallationExample.indexOf('useAccountStore(pinia)'),
    )
    expect(pluginContextTable).toMatchObject({
      type: 'table',
      rows: [
        ['pinia', '当前 Pinia 实例本身', expect.any(String)],
        ['app', 'pinia 安装到的 Vue App 本身', expect.any(String)],
        ['store', '当前新建 Store 本身', expect.any(String)],
        ['options', '当前 definition 的 plugin-facing options', expect.any(String)],
      ],
    })
    expect(pluginHeadingIds).not.toContain('internal-pinia-symbol')
    expect(pluginHeadingIds).not.toContain('deprecated-map-getters')
    expect(mapHeadingIds.filter((anchor) => anchor === 'deprecated-map-getters')).toHaveLength(1)
    expect(mapHeadingIds).not.toContain('internal-pinia-symbol')

    const mapContent = JSON.stringify(mapHelpersEntry.blocks)
    expect(mapContent).toContain('computed')
    expect(mapContent).toContain('methods')
    expect(mapContent).toContain('this.$pinia')
    expect(mapContent).toContain('array')
    expect(mapContent).toContain('object')
    expect(mapContent).toContain('function')
    expect(mapContent).toContain('setter')
    expect(mapContent).toContain('全局')
    expect(mapContent).toContain('mapGetters')
    expect(mapContent).toContain('mapState()')

    const internalTypesContent = JSON.stringify(internalTypesEntry.blocks)
    expect(internalTypesContent).toContain('internal')
    expect(internalTypesContent).toContain('公开替代')
    expect(internalTypesContent).toContain('不要 import')
    const internalTypeHeadingIds = internalTypesEntry.blocks.flatMap((block) =>
      block.type === 'heading' ? [headingId(block.content)] : [],
    )
    for (const [, name, , , entryId, anchor] of piniaRestrictedReferenceItems.slice(0, 24)) {
      expect(entryId).toBe(internalTypesEntryId)
      expect(internalTypesContent).toContain(name)
      expect(
        internalTypeHeadingIds.filter((heading) => heading === anchor),
        anchor,
      ).toHaveLength(1)
    }

    for (const item of availableItems) {
      const targetEntry = entriesById.get(item.target?.entryId ?? '')
      expect(
        targetEntry?.meta.sources.map((source) => source.url),
        `${item.id} 的目标正文必须登记精确官方 URL`,
      ).toContain(item.officialUrl)
    }

    for (const [entryId, collection, expectedPitfalls] of referenceEntries) {
      const entry = entriesById.get(entryId)
      expect(entry, entryId).toBeDefined()
      if (!entry || !('signature' in entry)) throw new Error(`${entryId} 必须是 ReferenceEntry`)

      const headings = entry.blocks.flatMap((block) =>
        block.type === 'heading' ? [block.content] : [],
      )
      const headingIds = headings.map(headingId)
      const pitfallCount = entry.blocks
        .filter((block) => block.type === 'pitfalls')
        .reduce((total, block) => total + block.items.length, 0)
      const inferenceIndex = entry.blocks.findIndex(
        (block) => block.type === 'heading' && block.content === '源码推导与适用场景',
      )
      const inferences = entry.blocks[inferenceIndex + 1]

      expect(entry.meta.collection, entryId).toBe(collection)
      expect(entry.signature.trim().length, entryId).toBeGreaterThan(0)
      expect(new Set(headingIds).size, entryId).toBe(headingIds.length)
      expect(entry.meta.anchors, entryId).toEqual(headings)
      expect(
        headings.filter((heading) => heading === '易错使用提示'),
        entryId,
      ).toHaveLength(1)
      expect(
        headings.filter((heading) => heading === '源码推导与适用场景'),
        entryId,
      ).toHaveLength(1)
      expect(pitfallCount, entryId).toBe(expectedPitfalls)
      expect(inferences, entryId).toMatchObject({ type: 'steps' })
      if (inferences?.type === 'steps') {
        expect(
          inferences.items.every(
            (item) => /^\d+\./.test(item.title) && item.content.trim().length > 0,
          ),
          entryId,
        ).toBe(true)
      }
      expect(
        entry.blocks.flatMap((block) => (block.type === 'demo' ? [block.id] : [])),
        entryId,
      ).toEqual([])
      expect(
        entry.meta.sources.some((source) => source.url.includes('pinia.vuejs.org')),
        entryId,
      ).toBe(true)
      expect(
        entry.meta.sources.some((source) =>
          source.url.includes('ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1'),
        ),
        entryId,
      ).toBe(true)
      expect(
        (entry.meta.related ?? []).every((relatedId) => learningCatalog.getEntry(relatedId)),
        entryId,
      ).toBe(true)
    }

    for (const [id, entryId, anchor] of allMappings) {
      const entry = entriesById.get(entryId)
      if (!entry || !('signature' in entry)) throw new Error(`${entryId} 必须是 ReferenceEntry`)
      const headingIds = entry.blocks.flatMap((block) =>
        block.type === 'heading' ? [headingId(block.content)] : [],
      )
      expect(
        headingIds.filter((heading) => heading === anchor),
        id,
      ).toHaveLength(1)
    }

    const instanceEntry = entriesById.get(piniaInstanceEntryId)
    if (!instanceEntry || !('signature' in instanceEntry)) {
      throw new Error(`${piniaInstanceEntryId} 必须是 ReferenceEntry`)
    }
    expect(
      instanceEntry.blocks
        .flatMap((block) => (block.type === 'heading' ? [headingId(block.content)] : []))
        .filter((anchor) => anchor === 'internal-pinia-symbol'),
    ).toHaveLength(1)
  })

  it('通过唯一公开 seam 搜索 Pinia 课程、Reference 与 restricted 承载页', () => {
    const learningScope = { purpose: 'learn', ecosystem: 'vue', module: 'pinia' } as const
    const referenceScope = { purpose: 'reference', ecosystem: 'vue', module: 'pinia' } as const
    const learningTrack = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'pinia' })
    const lessonIds = learningTrack?.entries.map((entry) => entry.entryId) ?? []

    expect(lessonIds).toHaveLength(14)
    for (const lessonId of lessonIds) {
      const meta = learningCatalog.getEntry(lessonId)
      expect(meta, lessonId).toBeDefined()
      expect(
        learningCatalog.search(meta?.title ?? '', learningScope).map((hit) => hit.id),
        lessonId,
      ).toContain(lessonId)
    }
    expect(learningCatalog.search('版本化', learningScope).map((hit) => hit.id)).toContain(
      'vue.pinia.learn.advanced.plugins-persistence',
    )
    expect(learningCatalog.search('pinia.use', learningScope).map((hit) => hit.id)).toContain(
      'vue.pinia.learn.advanced.plugins-persistence',
    )

    for (const [entryId] of referenceEntries) {
      const meta = learningCatalog.getEntry(entryId)
      expect(meta, entryId).toBeDefined()
      expect(
        learningCatalog.search(meta?.title ?? '', referenceScope).map((hit) => hit.id),
        entryId,
      ).toContain(entryId)
      if (meta?.type !== 'reference') continue
      for (const anchor of (meta as ReferenceMeta).anchors ?? []) {
        expect(
          learningCatalog.search(anchor, referenceScope).map((hit) => hit.id),
          `${entryId}#${anchor}`,
        ).toContain(entryId)
      }
    }

    const piniaHits = learningCatalog.search('Pinia', referenceScope)
    expect(piniaHits.length).toBeGreaterThan(0)
    expect(piniaHits.every((hit) => hit.group === 'vue.pinia' && hit.groupLabel === 'Pinia')).toBe(
      true,
    )

    const overviewItems =
      learningCatalog
        .getReferenceOverview({ ecosystem: 'vue', module: 'pinia' })
        ?.groups.flatMap((group) => group.sections.flatMap((section) => section.items)) ?? []
    for (const item of overviewItems) {
      const hit = learningCatalog
        .search(item.name, referenceScope)
        .find((result) => result.id === item.id)
      expect(hit?.path, item.name).toBe(item.path)
    }
    expect(
      learningCatalog
        .search('defineStore()', referenceScope)
        .find((item) => item.id === 'functions.definestore')?.path,
    ).toBe('/reference/vue/pinia/stores/define-store#define-store')
    expect(
      learningCatalog.search('public', referenceScope).every((item) => item.path.includes('#')),
    ).toBe(true)
    expect(
      learningCatalog.search('internal', referenceScope).every((item) => item.path.includes('#')),
    ).toBe(true)
    expect(
      learningCatalog
        .search('internal')
        .filter((item) => item.path.startsWith('/reference/'))
        .every((item) => item.path.includes('#')),
    ).toBe(true)

    for (const [id, name, sourceTag, , entryId, anchor] of piniaRestrictedReferenceItems) {
      const hit = learningCatalog.search(name, referenceScope).find((item) => item.id === id)
      const meta = learningCatalog.getEntry(entryId)
      expect(hit, name).toEqual({
        id,
        title: name,
        summary: meta?.summary,
        path: `/reference/vue/pinia/${meta?.collection}/${entryId.split('.').at(-1)}#${anchor}`,
        group: 'vue.pinia',
        groupLabel: 'Pinia',
      })
      expect(
        learningCatalog.search(sourceTag, referenceScope).some((item) => item.id === id),
        `${sourceTag}:${name}`,
      ).toBe(true)
    }
  })

  it('14 门课程都与至少一篇 Pinia Reference 双向关联', async () => {
    const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'pinia' })
    const lessonIds = track?.entries.map((entry) => entry.entryId) ?? []
    const referenceIds = new Set<string>(referenceEntries.map(([entryId]) => entryId))

    expect(lessonIds).toHaveLength(14)
    for (const lessonId of lessonIds) {
      const lessonMeta = learningCatalog.getEntry(lessonId)
      const relatedReferenceIds = (lessonMeta?.related ?? []).filter((id) => referenceIds.has(id))
      expect(relatedReferenceIds.length, lessonId).toBeGreaterThan(0)

      for (const referenceId of relatedReferenceIds) {
        const reference = await learningCatalog.loadEntry(referenceId)
        expect(reference.meta.related, `${lessonId} -> ${referenceId}`).toContain(lessonId)
      }
    }
  })
})
