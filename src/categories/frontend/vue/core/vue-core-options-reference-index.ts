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
  anchor: string,
): ReferenceItemDefinition {
  return [id, name, officialAnchor, 'merged', 'available', entryId, anchor]
}

export const vueCoreOptionsReferenceGroup: ReferenceIndexGroupManifest = {
  id: 'options-api',
  title: '选项式 API',
  sections: [
    referenceSection('options-state', '状态选项', [
      available('data', 'data', 'data', entryIds.state, '二data'),
      available('props', 'props', 'props', entryIds.state, '三props'),
      available('computed', 'computed', 'computed', entryIds.state, '四computed'),
      available('methods', 'methods', 'methods', entryIds.state, '五methods'),
      available('watch', 'watch', 'watch', entryIds.state, '六watch'),
      available('emits', 'emits', 'emits', entryIds.state, '七emits'),
      available('expose', 'expose', 'expose', entryIds.state, '八expose'),
    ]),
    referenceSection('options-rendering', '渲染选项', [
      available('template', 'template', 'template', entryIds.rendering, '二template'),
      available('render', 'render', 'render', entryIds.rendering, '三render'),
      available('compiler-options', 'compilerOptions', 'compileroptions', entryIds.rendering, '四compileroptions'),
      available('slots', 'slots', 'slots', entryIds.rendering, '五slots'),
    ]),
    referenceSection('options-lifecycle', '生命周期选项', [
      available('before-create', 'beforeCreate', 'beforecreate', entryIds.lifecycle, '二beforecreate'),
      available('created', 'created', 'created', entryIds.lifecycle, '三created'),
      available('before-mount', 'beforeMount', 'beforemount', entryIds.lifecycle, '四beforemount'),
      available('mounted', 'mounted', 'mounted', entryIds.lifecycle, '五mounted'),
      available('before-update', 'beforeUpdate', 'beforeupdate', entryIds.lifecycle, '六beforeupdate'),
      available('updated', 'updated', 'updated', entryIds.lifecycle, '七updated'),
      available('before-unmount', 'beforeUnmount', 'beforeunmount', entryIds.lifecycle, '八beforeunmount'),
      available('unmounted', 'unmounted', 'unmounted', entryIds.lifecycle, '九unmounted'),
      available('error-captured', 'errorCaptured', 'errorcaptured', entryIds.lifecycle, '十errorcaptured'),
      available('render-tracked', 'renderTracked', 'rendertracked', entryIds.lifecycle, '十一rendertracked'),
      available('render-triggered', 'renderTriggered', 'rendertriggered', entryIds.lifecycle, '十二rendertriggered'),
      available('activated', 'activated', 'activated', entryIds.lifecycle, '十三activated'),
      available('deactivated', 'deactivated', 'deactivated', entryIds.lifecycle, '十四deactivated'),
      available('server-prefetch', 'serverPrefetch', 'serverprefetch', entryIds.lifecycle, '十五serverprefetch'),
    ]),
    referenceSection('options-composition', '组合选项', [
      available('provide', 'provide', 'provide', entryIds.composition, '二provide'),
      available('inject', 'inject', 'inject', entryIds.composition, '三inject'),
      available('mixins', 'mixins', 'mixins', entryIds.composition, '四mixins'),
      available('extends', 'extends', 'extends', entryIds.composition, '五extends'),
    ]),
    referenceSection('options-misc', '其他杂项', [
      available('name', 'name', 'name', entryIds.misc, '二name'),
      available('inherit-attrs', 'inheritAttrs', 'inheritattrs', entryIds.misc, '三inheritattrs'),
      available('components', 'components', 'components', entryIds.misc, '四components'),
      available('directives', 'directives', 'directives', entryIds.misc, '五directives'),
    ]),
    referenceSection('component-instance', '组件实例', [
      available('data', '$data', 'data', entryIds.componentInstance, '二data'),
      available('props', '$props', 'props', entryIds.componentInstance, '三props'),
      available('el', '$el', 'el', entryIds.componentInstance, '四el'),
      available('options', '$options', 'options', entryIds.componentInstance, '五options'),
      available('parent', '$parent', 'parent', entryIds.componentInstance, '六parent'),
      available('root', '$root', 'root', entryIds.componentInstance, '七root'),
      available('slots', '$slots', 'slots', entryIds.componentInstance, '八slots'),
      available('refs', '$refs', 'refs', entryIds.componentInstance, '九refs'),
      available('attrs', '$attrs', 'attrs', entryIds.componentInstance, '十attrs'),
      available('watch', '$watch()', 'watch', entryIds.componentInstance, '十一watch'),
      available('emit', '$emit()', 'emit', entryIds.componentInstance, '十二emit'),
      available('force-update', '$forceUpdate()', 'forceupdate', entryIds.componentInstance, '十三forceupdate'),
      available('next-tick', '$nextTick()', 'nexttick', entryIds.componentInstance, '十四nexttick'),
    ]),
  ],
}
