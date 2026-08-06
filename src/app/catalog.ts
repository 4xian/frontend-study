import { categoryTechnologyManifests } from '@/categories/manifest'
import { createLearningCatalog } from '@/common/catalog'
import { registerDemoAssets, registerPrincipleAssets } from '@/common/content/demo-registry'

const modules = categoryTechnologyManifests.flatMap((technology) => technology.modules)
registerDemoAssets(modules.flatMap((module) => module.demos))
registerPrincipleAssets(modules.flatMap((module) => module.principles ?? []))

export const learningCatalog = createLearningCatalog({
  technologies: categoryTechnologyManifests,
})

export type * from '@/common/catalog'
