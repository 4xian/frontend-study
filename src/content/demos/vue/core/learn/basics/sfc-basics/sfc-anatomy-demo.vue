<script setup lang="ts">
const componentTitle = '学习卡片'
</script>

<template>
  <article class="sfc-preview">
    <header class="preview-header">
      <p class="eyebrow">ProfileCard.vue</p>
      <h3>{{ componentTitle }}</h3>
    </header>
    <div class="section-list">
      <section class="file-section template-section">
        <code>&lt;template&gt;</code>
        <p>描述组件最终要渲染的结构。</p>
      </section>
      <section class="file-section script-section">
        <code>&lt;script setup lang="ts"&gt;</code>
        <p>准备模板使用的数据与组件逻辑。</p>
      </section>
      <section class="file-section style-section">
        <code>&lt;style scoped&gt;</code>
        <p>为当前组件声明局部样式。</p>
      </section>
    </div>
  </article>
</template>

<style scoped>
.sfc-preview {
  max-width: 620px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.preview-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.eyebrow {
  margin: 0;
  color: var(--color-text-tertiary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
}

h3 {
  margin: 0 0 0 16px;
  color: var(--color-text);
  font-size: var(--font-size-lg);
}

.section-list {
  margin-top: 14px;
}

.file-section {
  display: flex;
  align-items: baseline;
  padding: 12px 0;
}

.file-section + .file-section {
  border-top: 1px solid var(--color-border);
}

.file-section code {
  flex: 0 0 210px;
  color: var(--color-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
}

.file-section p {
  margin: 0 0 0 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
}

@media (max-width: 560px) {
  .preview-header {
    display: block;
  }

  h3 {
    margin-top: 6px;
    margin-left: 0;
  }

  .file-section {
    display: block;
  }

  .file-section p {
    margin-top: 6px;
    margin-left: 0;
  }
}
</style>
