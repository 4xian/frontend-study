import type { TrackManifest } from '../types'
import { vueCoreReferenceManifest } from './vue-core-reference'
import { vueCoreTrackManifest } from './vue-core-track'
import { vuePiniaTrackManifest } from './vue-pinia-track'
import { vueRouterTrackManifest } from './vue-router-track'

export const trackManifests: TrackManifest[] = [
  vueCoreTrackManifest,
  vueRouterTrackManifest,
  vuePiniaTrackManifest,
  vueCoreReferenceManifest,
  {
    purpose: 'projects',
    ecosystem: 'vue',
    module: 'core',
    collections: [
      {
        id: 'beginner',
        title: '入门项目',
        summary: '用小型项目组合 Vue 核心知识。',
        entryIds: [],
      },
    ],
  },
]
