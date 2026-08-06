<script setup lang="ts">
const props = defineProps<{
  idPrefix: string
  instanceLabel: string
}>()

const [title, titleModifiers] = defineModel<string, 'capitalize'>('title', {
  required: true,
  /** 裁剪并按修饰符决定是否首字母大写。 */
  set(value) {
    const trimmed = value.trim()
    return titleModifiers.capitalize ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed
  },
})
const access = defineModel<'viewer' | 'editor'>('access', { required: true })
const notes = defineModel<string>({ default: '仅存于未绑定子组件' })
</script>

<template>
  <section class="component-model-editor" :aria-label="props.instanceLabel">
    <div class="model-field">
      <label :for="`${props.idPrefix}-title`">标题模型（v-model:title.capitalize）</label>
      <input :id="`${props.idPrefix}-title`" v-model="title" type="text" />
    </div>

    <div class="model-field">
      <label :for="`${props.idPrefix}-access`">权限模型（v-model:access）</label>
      <select :id="`${props.idPrefix}-access`" v-model="access">
        <option value="viewer">viewer</option>
        <option value="editor">editor</option>
      </select>
    </div>

    <div class="model-field">
      <label :for="`${props.idPrefix}-notes`">备注模型（默认 v-model）</label>
      <input :id="`${props.idPrefix}-notes`" v-model="notes" type="text" />
    </div>
  </section>
</template>

<style scoped>
.component-model-editor {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-top: 16px;
}

.model-field {
  min-width: 0;
  margin-top: 14px;
}

.model-field:first-child {
  margin-top: 0;
}

.model-field label {
  display: block;
  min-width: 0;
  margin-bottom: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.model-field input,
.model-field select {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 9px 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.model-field input:focus-visible,
.model-field select:focus-visible {
  border-color: var(--color-accent);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
