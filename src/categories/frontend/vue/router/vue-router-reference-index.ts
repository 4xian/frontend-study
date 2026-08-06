import type { ReferenceIndexManifest } from '@/common/catalog/types'
import { vueRouterComponentsComposablesReferenceSections } from './vue-router-components-composables-reference-index'
import { vueRouterConfigurationReferenceSections } from './vue-router-configuration-reference-index'
import { vueRouterMatchingReferenceSections } from './vue-router-matching-reference-index'
import { vueRouterNavigationReferenceSections } from './vue-router-navigation-reference-index'
import { vueRouterTypedFileBasedReferenceSections } from './vue-router-typed-file-based-reference-index'
import { vueRouterReferenceGroup } from './vue-router-reference-section'

const availableEntryIds = new Set([
  'vue.router.reference.configuration.create-router',
  'vue.router.reference.configuration.router-instance',
  'vue.router.reference.configuration.history',
  'vue.router.reference.matching.matcher',
  'vue.router.reference.matching.route-records',
  'vue.router.reference.matching.route-locations',
  'vue.router.reference.matching.params-query',
  'vue.router.reference.components.router-link',
  'vue.router.reference.components.router-view',
  'vue.router.reference.composables.navigation',
  'vue.router.reference.composables.injection-keys',
  'vue.router.reference.navigation.guards',
  'vue.router.reference.navigation.failures',
  'vue.router.reference.typed-routes.route-map',
])

export const vueRouterReferenceIndexManifest: ReferenceIndexManifest = {
  appliesTo: 'Vue Router 5.2.0',
  verifiedAt: '2026-08-04',
  groups: [
    vueRouterReferenceGroup(
      'configuration',
      'Configuration',
      vueRouterConfigurationReferenceSections,
      availableEntryIds,
    ),
    vueRouterReferenceGroup(
      'matching',
      'Matching',
      vueRouterMatchingReferenceSections,
      availableEntryIds,
    ),
    vueRouterReferenceGroup(
      'components-composables',
      'Components & Composables',
      vueRouterComponentsComposablesReferenceSections,
      availableEntryIds,
    ),
    vueRouterReferenceGroup(
      'navigation',
      'Navigation',
      vueRouterNavigationReferenceSections,
      availableEntryIds,
    ),
    vueRouterReferenceGroup(
      'typed-file-based',
      'Typed & File-Based',
      vueRouterTypedFileBasedReferenceSections,
      availableEntryIds,
    ),
  ],
}
