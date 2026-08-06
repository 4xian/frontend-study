import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnActionsAsyncMeta } from './learn/actions-async.md?catalog-meta'
import { meta as learnComponentStoreToRefsMeta } from './learn/component-store-to-refs.md?catalog-meta'
import { meta as learnGettersMeta } from './learn/getters.md?catalog-meta'
import { meta as learnHmrDevtoolsMaintenanceMeta } from './learn/hmr-devtools-maintenance.md?catalog-meta'
import { meta as learnOutsideComponentsRouterMeta } from './learn/outside-components-router.md?catalog-meta'
import { meta as learnPluginsPersistenceMeta } from './learn/plugins-persistence.md?catalog-meta'
import { meta as learnSetupFirstStoreMeta } from './learn/setup-first-store.md?catalog-meta'
import { meta as learnSetupStoresMeta } from './learn/setup-stores.md?catalog-meta'
import { meta as learnSsrHydrationMeta } from './learn/ssr-hydration.md?catalog-meta'
import { meta as learnStatePatchResetMeta } from './learn/state-patch-reset.md?catalog-meta'
import { meta as learnStoreCompositionMeta } from './learn/store-composition.md?catalog-meta'
import { meta as learnStoreModelingMeta } from './learn/store-modeling.md?catalog-meta'
import { meta as learnStoreTestingMeta } from './learn/store-testing.md?catalog-meta'
import { meta as learnSubscriptionsActionsMeta } from './learn/subscriptions-actions.md?catalog-meta'
import { meta as referenceDefineStoreMeta } from './reference/define-store.md?catalog-meta'
import { meta as referenceHmrMeta } from './reference/hmr.md?catalog-meta'
import { meta as referenceHydrationMeta } from './reference/hydration.md?catalog-meta'
import { meta as referenceInternalTypesMeta } from './reference/internal-types.md?catalog-meta'
import { meta as referenceMapHelpersMeta } from './reference/map-helpers.md?catalog-meta'
import { meta as referencePiniaInstanceMeta } from './reference/pinia-instance.md?catalog-meta'
import { meta as referencePluginContractsMeta } from './reference/plugin-contracts.md?catalog-meta'
import { meta as referenceStoreShapeMeta } from './reference/store-shape.md?catalog-meta'
import { meta as referenceStoreToRefsMeta } from './reference/store-to-refs.md?catalog-meta'
import { meta as referenceSubscriptionsMeta } from './reference/subscriptions.md?catalog-meta'

export const vuePiniaContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'actions-async',
    meta: learnActionsAsyncMeta,
    load: async () => (await import('./learn/actions-async.md?content-entry')).default,
  },
  {
    slug: 'component-store-to-refs',
    meta: learnComponentStoreToRefsMeta,
    load: async () => (await import('./learn/component-store-to-refs.md?content-entry')).default,
  },
  {
    slug: 'getters',
    meta: learnGettersMeta,
    load: async () => (await import('./learn/getters.md?content-entry')).default,
  },
  {
    slug: 'hmr-devtools-maintenance',
    meta: learnHmrDevtoolsMaintenanceMeta,
    load: async () => (await import('./learn/hmr-devtools-maintenance.md?content-entry')).default,
  },
  {
    slug: 'outside-components-router',
    meta: learnOutsideComponentsRouterMeta,
    load: async () => (await import('./learn/outside-components-router.md?content-entry')).default,
  },
  {
    slug: 'plugins-persistence',
    meta: learnPluginsPersistenceMeta,
    load: async () => (await import('./learn/plugins-persistence.md?content-entry')).default,
  },
  {
    slug: 'setup-first-store',
    meta: learnSetupFirstStoreMeta,
    load: async () => (await import('./learn/setup-first-store.md?content-entry')).default,
  },
  {
    slug: 'setup-stores',
    meta: learnSetupStoresMeta,
    load: async () => (await import('./learn/setup-stores.md?content-entry')).default,
  },
  {
    slug: 'ssr-hydration',
    meta: learnSsrHydrationMeta,
    load: async () => (await import('./learn/ssr-hydration.md?content-entry')).default,
  },
  {
    slug: 'state-patch-reset',
    meta: learnStatePatchResetMeta,
    load: async () => (await import('./learn/state-patch-reset.md?content-entry')).default,
  },
  {
    slug: 'store-composition',
    meta: learnStoreCompositionMeta,
    load: async () => (await import('./learn/store-composition.md?content-entry')).default,
  },
  {
    slug: 'store-modeling',
    meta: learnStoreModelingMeta,
    load: async () => (await import('./learn/store-modeling.md?content-entry')).default,
  },
  {
    slug: 'store-testing',
    meta: learnStoreTestingMeta,
    load: async () => (await import('./learn/store-testing.md?content-entry')).default,
  },
  {
    slug: 'subscriptions-actions',
    meta: learnSubscriptionsActionsMeta,
    load: async () => (await import('./learn/subscriptions-actions.md?content-entry')).default,
  },
  {
    slug: 'define-store',
    meta: referenceDefineStoreMeta,
    load: async () => (await import('./reference/define-store.md?content-entry')).default,
  },
  {
    slug: 'hmr',
    meta: referenceHmrMeta,
    load: async () => (await import('./reference/hmr.md?content-entry')).default,
  },
  {
    slug: 'hydration',
    meta: referenceHydrationMeta,
    load: async () => (await import('./reference/hydration.md?content-entry')).default,
  },
  {
    slug: 'internal-types',
    meta: referenceInternalTypesMeta,
    load: async () => (await import('./reference/internal-types.md?content-entry')).default,
  },
  {
    slug: 'map-helpers',
    meta: referenceMapHelpersMeta,
    load: async () => (await import('./reference/map-helpers.md?content-entry')).default,
  },
  {
    slug: 'pinia-instance',
    meta: referencePiniaInstanceMeta,
    load: async () => (await import('./reference/pinia-instance.md?content-entry')).default,
  },
  {
    slug: 'plugin-contracts',
    meta: referencePluginContractsMeta,
    load: async () => (await import('./reference/plugin-contracts.md?content-entry')).default,
  },
  {
    slug: 'store-shape',
    meta: referenceStoreShapeMeta,
    load: async () => (await import('./reference/store-shape.md?content-entry')).default,
  },
  {
    slug: 'store-to-refs',
    meta: referenceStoreToRefsMeta,
    load: async () => (await import('./reference/store-to-refs.md?content-entry')).default,
  },
  {
    slug: 'subscriptions',
    meta: referenceSubscriptionsMeta,
    load: async () => (await import('./reference/subscriptions.md?content-entry')).default,
  },
]
