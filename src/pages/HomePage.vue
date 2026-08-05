<script setup lang="ts">
import { computed } from 'vue'
import { learningCatalog } from '@/content/catalog'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

/** 首页主学习按钮的目标与文案。 */
const primaryLearningAction = computed(() => {
  const track = learningCatalog.getLearningTrack({ ecosystem: 'vue', module: 'core' })
  if (!track?.total) return { path: '/learn', label: '开始学习' }

  const trackProgress = progress.getTrackProgress(track)
  if (trackProgress.continueEntry) {
    return {
      path: trackProgress.continueEntry.path,
      label: trackProgress.hasStarted ? '继续学习' : '开始学习',
    }
  }
  return { path: track.entries[0]!.path, label: '回顾课程' }
})

const purposeLinks = [
  {
    path: '/learn',
    index: '01',
    title: '系统学习',
    summary: '从基础语法到生态能力，沿着清晰顺序逐步建立完整认知。',
    action: '开始学习',
  },
  {
    path: '/reference',
    index: '02',
    title: '技术参考',
    summary: '按生态和模块定位 API、规则、示例与版本来源。',
    action: '浏览参考',
  },
  {
    path: '/projects',
    index: '03',
    title: '项目实战',
    summary: '通过里程碑、任务和验收清单，把知识组合成可交付成果。',
    action: '查看项目',
  },
]
</script>

<template>
  <div class="home-page">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="hero-inner">
        <header class="hero-copy">
          <p class="eyebrow">框架与工程化学习平台</p>
          <h1 id="home-title">IT 学习站</h1>
          <p class="hero-summary">从理解一个概念，到独立完成一个项目。</p>
          <div class="hero-actions">
            <RouterLink class="primary-action" :to="primaryLearningAction.path">
              {{ primaryLearningAction.label }}
            </RouterLink>
            <RouterLink class="secondary-action" to="/reference">浏览技术参考</RouterLink>
          </div>
        </header>

        <div v-reveal class="learning-stage" aria-label="Vue 响应式学习示例">
          <header class="stage-toolbar">
            <div class="window-controls" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <p>响应式入门 <span>/</span> ref 与模板</p>
            <span class="stage-status">实时示例</span>
          </header>

          <div class="stage-workspace">
            <div class="code-pane">
              <p class="pane-label">App.vue</p>
              <pre><code><span class="code-muted">&lt;script setup&gt;</span>
<span class="code-purple">import</span> { ref } <span class="code-purple">from</span> <span class="code-green">'vue'</span>

<span class="code-purple">const</span> count = ref(<span class="code-blue">0</span>)
<span class="code-muted">&lt;/script&gt;</span>

<span class="code-muted">&lt;template&gt;</span>
  <span class="code-blue">&lt;button</span> @click=<span class="code-green">"count++"</span><span class="code-blue">&gt;</span>
    点击 &#123;&#123; count &#125;&#125; 次
  <span class="code-blue">&lt;/button&gt;</span>
<span class="code-muted">&lt;/template&gt;</span><span class="code-cursor" aria-hidden="true"></span></code></pre>
            </div>

            <div class="preview-pane">
              <div class="brand-row">
                <img src="https://vuejs.org/logo.svg" alt="Vue" width="44" height="44" />
                <img
                  src="https://react.dev/images/brand/logo_light.svg"
                  alt="React"
                  width="48"
                  height="43"
                />
              </div>
              <p class="preview-kicker">运行结果</p>
              <strong>点击 3 次</strong>
              <span>状态变化会立即映射到界面。</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="purpose-section" aria-labelledby="purpose-title">
      <div class="section-inner">
        <header v-reveal class="section-heading">
          <p class="eyebrow">选择路径</p>
          <h2 id="purpose-title">按你的目标开始</h2>
        </header>

        <nav v-reveal class="purpose-list" aria-label="学习目的">
          <RouterLink
            v-for="item in purposeLinks"
            :key="item.path"
            :to="item.path"
            class="purpose-link"
          >
            <span class="purpose-index">{{ item.index }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.summary }}</p>
            <span class="purpose-action">{{ item.action }} <span aria-hidden="true">→</span></span>
          </RouterLink>
        </nav>
      </div>
    </section>

    <section class="ecosystem-strip" aria-labelledby="ecosystem-strip-title">
      <div v-reveal class="section-inner ecosystem-inner">
        <div class="ecosystem-copy">
          <p class="eyebrow">持续扩展</p>
          <h2 id="ecosystem-strip-title">一个入口，连接完整生态</h2>
        </div>
        <div class="ecosystem-brands" aria-label="技术生态">
          <div class="brand-item">
            <img src="https://vuejs.org/logo.svg" alt="" width="40" height="40" />
            <span>Vue</span>
            <small>已开放</small>
          </div>
          <div class="brand-item planned">
            <img
              src="https://react.dev/images/brand/logo_light.svg"
              alt=""
              width="44"
              height="40"
            />
            <span>React</span>
            <small>规划中</small>
          </div>
          <div class="brand-item planned engineering-brand">
            <span class="engineering-mark" aria-hidden="true">TS</span>
            <span>工程化</span>
            <small>规划中</small>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  overflow: hidden;
  background: var(--color-bg-elevated);
}

.home-hero {
  background: var(--color-bg-elevated);
}

.hero-inner,
.section-inner {
  width: min(var(--page-content-width), calc(100% - 48px));
  margin: 0 auto;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100svh - var(--header-height) - 72px);
  padding: 56px 0 48px;
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
  animation: hero-arrive 700ms var(--ease-spring) both;
}

.eyebrow {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1.3;
}

.hero-copy h1 {
  margin-top: 12px;
  font-size: 72px;
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: 0;
}

.hero-summary {
  margin-top: 18px;
  color: var(--color-text-secondary);
  font-size: 24px;
  line-height: 1.4;
}

.hero-actions {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.hero-actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 22px;
  border-radius: var(--radius-full);
  font-size: 15px;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform 100ms var(--ease-out);
}

.hero-actions a:active,
.purpose-link:active {
  transform: scale(0.98);
}

.primary-action {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.primary-action:hover {
  background: var(--color-accent-hover);
}

.secondary-action {
  margin-left: 12px;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

.secondary-action:hover {
  background: var(--color-accent-soft);
}

.learning-stage {
  width: min(960px, 100%);
  height: 340px;
  margin: 44px auto 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  background: var(--color-code-surface);
  box-shadow: var(--shadow-lg);
  color: #f5f5f7;
}

.stage-toolbar {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-code-panel);
  font-size: 12px;
}

.window-controls {
  display: flex;
  width: 52px;
}

.window-controls span {
  width: 10px;
  height: 10px;
  margin-right: 7px;
  border-radius: 50%;
  background: #5d5d63;
}

.stage-toolbar p {
  flex: 1;
  color: #d2d2d7;
  text-align: center;
}

.stage-toolbar p span {
  margin: 0 6px;
  color: #6e6e73;
}

.stage-status {
  width: 52px;
  color: #6ad8a5;
  text-align: right;
}

.stage-workspace {
  display: flex;
  height: calc(100% - 44px);
}

.code-pane {
  flex: 1 1 68%;
  min-width: 0;
  padding: 22px 26px;
}

.pane-label,
.preview-kicker {
  margin-bottom: 16px;
  color: #86868b;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.code-pane pre {
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
}

.code-muted {
  color: #86868b;
}

.code-purple {
  color: #c586c0;
}

.code-green {
  color: #9bd09b;
}

.code-blue {
  color: #69b7ff;
}

.code-cursor {
  display: inline-block;
  width: 1px;
  height: 15px;
  margin-left: 2px;
  background: #f5f5f7;
  vertical-align: -2px;
  animation: cursor-pulse 1.1s step-end infinite;
}

.preview-pane {
  display: flex;
  flex: 0 0 32%;
  flex-direction: column;
  justify-content: center;
  padding: 28px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  background: #171719;
}

.brand-row {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.brand-row img + img {
  margin-left: 16px;
}

.preview-pane strong {
  font-size: 28px;
  line-height: 1.2;
}

.preview-pane > span {
  margin-top: 12px;
  color: #a1a1a6;
  line-height: 1.6;
}

.purpose-section {
  padding: 108px 0 116px;
  background: var(--color-section-soft);
}

.section-heading {
  max-width: 700px;
}

.section-heading h2,
.ecosystem-copy h2 {
  margin-top: 10px;
  font-size: var(--font-size-title);
  line-height: 1.08;
  letter-spacing: 0;
}

.purpose-list {
  display: flex;
  margin-top: 60px;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.purpose-link {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 300px;
  padding: 32px;
  color: var(--color-text);
  transition:
    background-color var(--duration-base) var(--ease-out),
    transform 100ms var(--ease-out);
}

.purpose-link + .purpose-link {
  border-left: 1px solid var(--color-border);
}

.purpose-link:hover {
  background: var(--color-bg-elevated);
}

.purpose-index {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.purpose-link strong {
  margin-top: 28px;
  font-size: 28px;
  line-height: 1.2;
}

.purpose-link p {
  margin-top: 14px;
  color: var(--color-text-secondary);
  line-height: 1.65;
}

.purpose-action {
  margin-top: auto;
  padding-top: 28px;
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 600;
}

.purpose-action span {
  display: inline-block;
  margin-left: 4px;
  transition: transform var(--duration-fast) var(--ease-out);
}

.purpose-link:hover .purpose-action span {
  transform: translateX(4px);
}

.ecosystem-strip {
  padding: 110px 0;
  background: var(--color-section-strong);
  color: var(--color-text-inverse);
}

.ecosystem-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.ecosystem-copy {
  width: 46%;
}

.ecosystem-strip .eyebrow {
  color: #a1a1a6;
}

.ecosystem-brands {
  display: flex;
  width: 48%;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.brand-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 26px 12px;
}

.brand-item + .brand-item {
  border-left: 1px solid rgba(255, 255, 255, 0.18);
}

.brand-item > span:not(.engineering-mark) {
  margin-top: 14px;
  font-weight: 600;
}

.brand-item small {
  margin-top: 4px;
  color: #a1a1a6;
}

.brand-item.planned {
  opacity: 0.68;
}

.engineering-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #a1a1a6;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
}

@keyframes hero-arrive {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cursor-pulse {
  50% {
    opacity: 0;
  }
}

@media (max-width: 760px) {
  .hero-inner,
  .section-inner {
    width: min(100% - 32px, var(--page-content-width));
  }

  .hero-inner {
    min-height: calc(100svh - var(--header-height) - 56px);
    padding: 44px 0 36px;
  }

  .hero-copy h1 {
    margin-top: 10px;
    font-size: 48px;
  }

  .hero-summary {
    margin-top: 14px;
    font-size: 19px;
  }

  .hero-actions {
    margin-top: 22px;
  }

  .hero-actions a {
    min-height: 42px;
    padding: 0 17px;
    font-size: 14px;
  }

  .secondary-action {
    margin-left: 8px;
  }

  .learning-stage {
    height: 300px;
    margin-top: 34px;
  }

  .stage-toolbar {
    padding: 0 12px;
  }

  .window-controls,
  .stage-status {
    width: 38px;
  }

  .window-controls span {
    width: 8px;
    height: 8px;
    margin-right: 5px;
  }

  .stage-status {
    overflow: hidden;
    color: transparent;
  }

  .stage-workspace {
    flex-direction: column;
  }

  .code-pane {
    flex: 1;
    padding: 18px;
  }

  .code-pane pre {
    font-size: 12px;
    line-height: 1.42;
  }

  .pane-label {
    margin-bottom: 10px;
  }

  .preview-pane {
    display: none;
  }

  .purpose-section,
  .ecosystem-strip {
    padding: 76px 0;
  }

  .section-heading h2,
  .ecosystem-copy h2 {
    font-size: 36px;
  }

  .purpose-list {
    flex-direction: column;
    margin-top: 40px;
  }

  .purpose-link {
    min-height: 0;
    padding: 26px 4px;
  }

  .purpose-link + .purpose-link {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }

  .purpose-link strong {
    margin-top: 14px;
    font-size: 24px;
  }

  .purpose-action {
    margin-top: 4px;
    padding-top: 20px;
  }

  .ecosystem-inner {
    display: block;
  }

  .ecosystem-copy,
  .ecosystem-brands {
    width: 100%;
  }

  .ecosystem-brands {
    margin-top: 42px;
  }

  .brand-item {
    padding: 22px 4px;
  }

  .brand-item > span:not(.engineering-mark) {
    font-size: 13px;
  }

  .brand-item small {
    font-size: 11px;
  }
}

@media (max-width: 420px) {
  .hero-copy h1 {
    font-size: 42px;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions a {
    width: 100%;
  }

  .secondary-action {
    margin-top: 10px;
    margin-left: 0;
  }

  .learning-stage {
    height: 280px;
    margin-top: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-copy,
  .code-cursor {
    animation: none;
  }

  .purpose-action span {
    transition: none;
  }
}
</style>
