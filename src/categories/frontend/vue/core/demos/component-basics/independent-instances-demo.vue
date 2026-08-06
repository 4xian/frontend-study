<script setup lang="ts">
import IndependentCounter from './parts/IndependentCounter.vue'
</script>

<template>
  <article class="instances-demo">
    <header class="demo-header">
      <div>
        <p class="eyebrow">组件实例实验台</p>
        <h3>一份定义，两个独立实例</h3>
      </div>
      <p class="file-paths">
        <span>independent-instances-demo.vue</span>
        <span>parts/IndependentCounter.vue</span>
      </p>
    </header>

    <div class="instance-list">
      <section class="instance-panel" aria-labelledby="instance-a-title">
        <div class="instance-heading">
          <p>01</p>
          <h4 id="instance-a-title">实例 A</h4>
        </div>
        <IndependentCounter />
      </section>

      <section class="instance-panel" aria-labelledby="instance-b-title">
        <div class="instance-heading">
          <p>02</p>
          <h4 id="instance-b-title">实例 B</h4>
        </div>
        <IndependentCounter />
      </section>
    </div>
  </article>
</template>

<style scoped>
.instances-demo {
  width: 100%;
  max-width: 860px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px;
  border-bottom: 1px solid var(--color-border);
}

.demo-header > div {
  min-width: 0;
  padding-right: 20px;
}

.eyebrow,
.instance-heading p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.file-paths {
  min-width: 0;
  flex: 0 1 270px;
  color: var(--color-text-tertiary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
  line-height: 1.55;
  text-align: right;
  overflow-wrap: anywhere;
}

.file-paths span {
  display: block;
}

.file-paths span + span {
  margin-top: 3px;
}

.instance-list {
  display: flex;
  align-items: stretch;
  padding: 22px;
}

.instance-panel {
  width: calc(50% - 7px);
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.instance-panel + .instance-panel {
  margin-left: 14px;
}

.instance-heading {
  display: flex;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.instance-heading p {
  width: 30px;
  flex: 0 0 30px;
}

.instance-heading h4 {
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.35;
}

@media (max-width: 620px) {
  .demo-header,
  .instance-list {
    display: block;
    padding: 18px;
  }

  .demo-header > div {
    padding-right: 0;
  }

  .file-paths {
    margin-top: 12px;
    text-align: left;
  }

  .instance-panel {
    width: 100%;
  }

  .instance-panel + .instance-panel {
    margin-left: 0;
    margin-top: 14px;
  }
}
</style>
