import type { ReferenceIndexGroupManifest } from '@/common/catalog/types'
import { referenceSection, type ReferenceItemDefinition } from './vue-core-reference-section'
const entryIds = {
  componentInstance: 'vue.core.reference.options-api.component-instance',
  composition: 'vue.core.reference.options-api.composition-options',
  lifecycle: 'vue.core.reference.options-api.lifecycle-options',
  misc: 'vue.core.reference.options-api.misc-options',
  rendering: 'vue.core.reference.options-api.rendering-options',
  state: 'vue.core.reference.options-api.state-options',
} as const

/** 创建一个已映射到主题页 heading 的 Options API 条目。 */
function available(
  id: string,
  name: string,
  officialAnchor: string,
  entryId: string,
): ReferenceItemDefinition {
  return [id, name, officialAnchor, 'merged', 'available', entryId, officialAnchor]
}

export const vueCoreOptionsReferenceGroup: ReferenceIndexGroupManifest = {
  id: 'options-api',
  title: '选项式 API',
  sections: [
    referenceSection('options-state', '状态选项', [
      available('data', 'data', 'data', entryIds.state),
      available('props', 'props', 'props', entryIds.state),
      available('computed', 'computed', 'computed', entryIds.state),
      available('methods', 'methods', 'methods', entryIds.state),
      available('watch', 'watch', 'watch', entryIds.state),
      available('emits', 'emits', 'emits', entryIds.state),
      available('expose', 'expose', 'expose', entryIds.state),
    ]),
    referenceSection('options-rendering', '渲染选项', [
      available('template', 'template', 'template', entryIds.rendering),
      available('render', 'render', 'render', entryIds.rendering),
      available('compiler-options', 'compilerOptions', 'compileroptions', entryIds.rendering),
      available('slots', 'slots', 'slots', entryIds.rendering),
    ]),
    referenceSection('options-lifecycle', '生命周期选项', [
      available('before-create', 'beforeCreate', 'beforecreate', entryIds.lifecycle),
      available('created', 'created', 'created', entryIds.lifecycle),
      available('before-mount', 'beforeMount', 'beforemount', entryIds.lifecycle),
      available('mounted', 'mounted', 'mounted', entryIds.lifecycle),
      available('before-update', 'beforeUpdate', 'beforeupdate', entryIds.lifecycle),
      available('updated', 'updated', 'updated', entryIds.lifecycle),
      available('before-unmount', 'beforeUnmount', 'beforeunmount', entryIds.lifecycle),
      available('unmounted', 'unmounted', 'unmounted', entryIds.lifecycle),
      available('error-captured', 'errorCaptured', 'errorcaptured', entryIds.lifecycle),
      available('render-tracked', 'renderTracked', 'rendertracked', entryIds.lifecycle),
      available('render-triggered', 'renderTriggered', 'rendertriggered', entryIds.lifecycle),
      available('activated', 'activated', 'activated', entryIds.lifecycle),
      available('deactivated', 'deactivated', 'deactivated', entryIds.lifecycle),
      available('server-prefetch', 'serverPrefetch', 'serverprefetch', entryIds.lifecycle),
    ]),
    referenceSection('options-composition', '组合选项', [
      available('provide', 'provide', 'provide', entryIds.composition),
      available('inject', 'inject', 'inject', entryIds.composition),
      available('mixins', 'mixins', 'mixins', entryIds.composition),
      available('extends', 'extends', 'extends', entryIds.composition),
    ]),
    referenceSection('options-misc', '其他杂项', [
      available('name', 'name', 'name', entryIds.misc),
      available('inherit-attrs', 'inheritAttrs', 'inheritattrs', entryIds.misc),
      available('components', 'components', 'components', entryIds.misc),
      available('directives', 'directives', 'directives', entryIds.misc),
    ]),
    referenceSection('component-instance', '组件实例', [
      available('data', '$data', 'data', entryIds.componentInstance),
      available('props', '$props', 'props', entryIds.componentInstance),
      available('el', '$el', 'el', entryIds.componentInstance),
      available('options', '$options', 'options', entryIds.componentInstance),
      available('parent', '$parent', 'parent', entryIds.componentInstance),
      available('root', '$root', 'root', entryIds.componentInstance),
      available('slots', '$slots', 'slots', entryIds.componentInstance),
      available('refs', '$refs', 'refs', entryIds.componentInstance),
      available('attrs', '$attrs', 'attrs', entryIds.componentInstance),
      available('watch', '$watch()', 'watch', entryIds.componentInstance),
      available('emit', '$emit()', 'emit', entryIds.componentInstance),
      available('force-update', '$forceUpdate()', 'forceupdate', entryIds.componentInstance),
      available('next-tick', '$nextTick()', 'nexttick', entryIds.componentInstance),
    ]),
  ],
}
