import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnDevelopmentEnvironmentAndRuntimeMeta } from './learn/development-environment-and-runtime.md?catalog-meta'

export const javaCoreContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'development-environment-and-runtime',
    meta: learnDevelopmentEnvironmentAndRuntimeMeta,
    load: async () =>
      (await import('./learn/development-environment-and-runtime.md?content-entry')).default,
  },
]
