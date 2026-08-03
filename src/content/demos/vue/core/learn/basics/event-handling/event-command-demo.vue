<script setup lang="ts">
import { ref } from 'vue'

type ModifierMode = 'prevent.self' | 'self.prevent'

const commandCount = ref(0)
const lastEvent = ref('尚无事件')
const eventLog = ref<string[]>([])
const modifierMode = ref<ModifierMode>('prevent.self')
const linkResult = ref('尚未点击子链接')
const onceCount = ref(0)
let logNumber = 0

/**
 * 追加一条带稳定序号和当前目标的事件记录，并只保留最近八条。
 */
function appendLog(action: string, event?: Event, targetLabel?: string): void {
  logNumber++
  const eventType = event?.type ?? 'action'
  const currentTarget = event?.currentTarget
  const currentTargetLabel =
    targetLabel ??
    (currentTarget instanceof Element ? currentTarget.tagName.toLowerCase() : 'command')
  const number = String(logNumber).padStart(2, '0')
  eventLog.value = [
    ...eventLog.value,
    `${number} · ${eventType} · ${currentTargetLabel} · ${action}`,
  ].slice(-8)
  lastEvent.value = event ? `${eventType} · ${action}` : action
}

/**
 * 用方法处理器重置命令次数，并展示自动收到的 MouseEvent。
 */
function resetCommands(event: MouseEvent): void {
  commandCount.value = 0
  appendLog('方法处理器 reset', event)
}

/**
 * 保存指定业务版本，并记录模板显式传入的原生事件。
 */
function save(version: string, event: MouseEvent): void {
  appendLog(`保存 ${version}`, event)
}

/**
 * 记录多语句或命名方法中的第一步。
 */
function record(event: MouseEvent): void {
  appendLog('顺序 1：record', event)
}

/**
 * 记录多语句或命名方法中的第二步。
 */
function execute(): void {
  appendLog('顺序 2：execute')
}

/**
 * 用命名方法组织与模板多语句相同的同步顺序。
 */
function runNamedSequence(event: MouseEvent): void {
  record(event)
  execute()
}

/**
 * 切换两个静态修饰符顺序分支。
 */
function selectModifierMode(mode: ModifierMode): void {
  modifierMode.value = mode
  linkResult.value = '尚未点击子链接'
}

/**
 * 记录只有点击传播面板自身时才会运行的 self 处理器。
 */
function handlePanel(mode: ModifierMode, event: MouseEvent): void {
  appendLog(`${mode} 面板自身处理器`, event)
}

/**
 * 等本次事件传播结束后，读取父层修饰符是否阻止了链接默认行为。
 */
function inspectLink(mode: ModifierMode, event: MouseEvent): void {
  /**
   * 在父层 guard 执行后公布最终的 defaultPrevented 状态。
   */
  function reportDefaultBehavior(): void {
    const result = event.defaultPrevented ? '默认行为已阻止' : '默认行为保留'
    linkResult.value = `.${mode}：${result}`
    appendLog(`子链接 ${result}`, event, 'a')
  }

  setTimeout(reportDefaultBehavior)
}

/**
 * 记录某条键盘修饰符规则命中时的组合。
 */
function handleKeyboard(rule: string, event: KeyboardEvent): void {
  const keys = [
    event.ctrlKey ? 'Ctrl' : '',
    event.altKey ? 'Alt' : '',
    event.shiftKey ? 'Shift' : '',
    event.metaKey ? 'Meta' : '',
    event.key,
  ].filter(Boolean)
  appendLog(`${rule} 命中：${keys.join('+')}`, event)
}

/**
 * 记录 once 监听器唯一一次允许执行的动作。
 */
function runOnce(event: MouseEvent): void {
  onceCount.value++
  appendLog(`once 第 ${onceCount.value} 次`, event)
}

/**
 * 按实际传播阶段记录捕获、目标和冒泡顺序。
 */
function recordPhase(phase: 'capture' | 'target' | 'bubble', event: MouseEvent): void {
  appendLog(`传播 ${phase}`, event)
}

/**
 * 清空可见日志，并保留全局序号避免记录身份重复。
 */
function clearLog(): void {
  eventLog.value = []
  lastEvent.value = '尚无事件'
  linkResult.value = '尚未点击子链接'
}
</script>

<template>
  <article class="event-demo">
    <header class="demo-header">
      <div>
        <p class="eyebrow">事件指令台</p>
        <h3>观察一次事件如何抵达处理器</h3>
        <p>所有区域共享最后事件与最近八条日志。</p>
      </div>
      <dl class="status-board" aria-live="polite">
        <div>
          <dt>命令次数</dt>
          <dd>{{ commandCount }}</dd>
        </div>
        <div>
          <dt>最后事件</dt>
          <dd>{{ lastEvent }}</dd>
        </div>
      </dl>
    </header>

    <section class="demo-section command-section" aria-labelledby="event-command-title">
      <div class="section-heading">
        <p>01</p>
        <div>
          <h4 id="event-command-title">处理器与参数</h4>
          <p>对比简单内联、自动事件参数和显式 $event。</p>
        </div>
      </div>
      <div class="control-row">
        <button type="button" @click="commandCount++">内联增加</button>
        <button type="button" @click="resetCommands">方法重置</button>
        <button type="button" @click="save('draft', $event)">保存草稿</button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="event-sequence-title">
      <div class="section-heading">
        <p>02</p>
        <div>
          <h4 id="event-sequence-title">同步动作顺序</h4>
          <p>两种写法都先 record，再 execute；复杂后应提取命名方法。</p>
        </div>
      </div>
      <div class="control-row">
        <!-- prettier-ignore-attribute -->
        <button type="button" @click="record($event); execute()">多语句顺序</button>
        <button type="button" @click="runNamedSequence">等价命名方法</button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="event-modifier-title">
      <div class="section-heading">
        <p>03</p>
        <div>
          <h4 id="event-modifier-title">修饰符顺序</h4>
          <p>点击子链接，比较父层 prevent 与 self 谁先运行。</p>
        </div>
      </div>
      <div class="mode-switch" aria-label="修饰符顺序">
        <button
          type="button"
          :aria-pressed="modifierMode === 'prevent.self'"
          @click="selectModifierMode('prevent.self')"
        >
          {{ modifierMode === 'prevent.self' ? '当前：.prevent.self' : '.prevent.self' }}
        </button>
        <button
          type="button"
          :aria-pressed="modifierMode === 'self.prevent'"
          @click="selectModifierMode('self.prevent')"
        >
          {{ modifierMode === 'self.prevent' ? '当前：.self.prevent' : '.self.prevent' }}
        </button>
      </div>
      <div
        v-if="modifierMode === 'prevent.self'"
        class="modifier-panel"
        @click.prevent.self="handlePanel('prevent.self', $event)"
      >
        <p>父层：@click.prevent.self</p>
        <a href="#event-demo-help" @click="inspectLink('prevent.self', $event)">点击子链接</a>
        <button type="button" @click="appendLog('子按钮点击', $event)">点击子按钮</button>
      </div>
      <div v-else class="modifier-panel" @click.self.prevent="handlePanel('self.prevent', $event)">
        <p>父层：@click.self.prevent</p>
        <a href="#event-demo-help" @click="inspectLink('self.prevent', $event)">点击子链接</a>
        <button type="button" @click="appendLog('子按钮点击', $event)">点击子按钮</button>
      </div>
      <p id="event-demo-help" class="result-line" aria-live="polite">{{ linkResult }}</p>
    </section>

    <section class="demo-section" aria-labelledby="event-keyboard-title">
      <div class="section-heading">
        <p>04</p>
        <div>
          <h4 id="event-keyboard-title">键盘规则</h4>
          <p>三个输入分别隔离普通按键、系统键与 exact 规则。</p>
        </div>
      </div>
      <div class="input-list">
        <div>
          <label for="event-enter">仅 Enter</label>
          <input
            id="event-enter"
            type="text"
            placeholder="按 Enter"
            @keyup.enter="handleKeyboard('Enter', $event)"
          />
        </div>
        <div>
          <label for="event-ctrl-enter">Ctrl + Enter</label>
          <input
            id="event-ctrl-enter"
            type="text"
            placeholder="允许额外系统键"
            @keyup.ctrl.enter="handleKeyboard('Ctrl+Enter', $event)"
          />
        </div>
        <div>
          <label for="event-exact-enter">精确 Ctrl + Enter</label>
          <input
            id="event-exact-enter"
            type="text"
            placeholder="不允许 Shift 等额外键"
            @keyup.ctrl.exact.enter="handleKeyboard('Ctrl+Enter.exact', $event)"
          />
        </div>
      </div>
    </section>

    <section class="demo-section option-section" aria-labelledby="event-option-title">
      <div class="section-heading">
        <p>05</p>
        <div>
          <h4 id="event-option-title">监听选项与传播</h4>
          <p>once 只调用一次；点击内层按钮会按 capture → target → bubble 记录。</p>
        </div>
      </div>
      <button type="button" class="once-button" @click.once="runOnce">
        只执行一次（已执行 {{ onceCount }} 次）
      </button>
      <p class="option-note">
        .passive 在注册时承诺处理器不会阻止默认行为，不能与 .prevent 同时使用。
      </p>
      <div
        class="phase-panel"
        @click.capture="recordPhase('capture', $event)"
        @click="recordPhase('bubble', $event)"
      >
        <p>外层同时注册 capture 与 bubble</p>
        <button type="button" @click="recordPhase('target', $event)">触发传播顺序</button>
      </div>
    </section>

    <section class="log-section" aria-labelledby="event-log-title">
      <div class="log-heading">
        <div>
          <p class="eyebrow">最近 8 条</p>
          <h4 id="event-log-title">事件日志</h4>
        </div>
        <button type="button" @click="clearLog">清空日志</button>
      </div>
      <ol v-if="eventLog.length" aria-live="polite">
        <li v-for="entry in eventLog" :key="entry">{{ entry }}</li>
      </ol>
      <p v-else class="empty-log">尚无事件记录</p>
    </section>
  </article>
</template>

<style scoped>
.event-demo {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.demo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px;
}

.demo-header > div:first-child {
  min-width: 0;
  padding-right: 20px;
}

.eyebrow,
.section-heading > p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.demo-header h3 {
  margin-top: 6px;
  font-size: var(--font-size-xl);
}

.demo-header > div > p:last-child,
.section-heading div p,
.modifier-panel p,
.phase-panel p {
  margin-top: 6px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.status-board {
  width: 220px;
  flex: 0 0 220px;
  margin: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.status-board div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 12px;
}

.status-board div + div {
  border-top: 1px solid var(--color-border);
}

.status-board dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.status-board dd {
  min-width: 0;
  margin-left: 12px;
  overflow-wrap: anywhere;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-align: right;
}

.demo-section,
.log-section {
  min-width: 0;
  padding: 20px 22px 22px;
  border-top: 1px solid var(--color-border);
}

.section-heading {
  display: flex;
  align-items: flex-start;
}

.section-heading > p {
  width: 30px;
  flex: 0 0 30px;
  margin-top: 3px;
}

.section-heading > div {
  min-width: 0;
}

.section-heading h4,
.log-heading h4 {
  font-size: var(--font-size-lg);
}

.control-row,
.mode-switch {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
}

button {
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
}

button:hover {
  border-color: var(--color-accent);
}

button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 3px solid var(--color-accent-soft);
  outline-offset: 2px;
}

.control-row button,
.mode-switch button {
  margin-right: 8px;
  margin-bottom: 8px;
}

.mode-switch button[aria-pressed='true'] {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.modifier-panel,
.phase-panel {
  min-width: 0;
  padding: 16px;
  margin-top: 8px;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-bg-sunken);
}

.modifier-panel a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-top: 10px;
  color: var(--color-accent);
  font-weight: 600;
}

.modifier-panel button {
  margin-top: 10px;
  margin-left: 12px;
}

.result-line {
  min-height: 24px;
  margin-top: 12px;
  overflow-wrap: anywhere;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
}

.input-list {
  display: flex;
  margin-top: 16px;
}

.input-list > div {
  min-width: 0;
  width: 33.333%;
}

.input-list > div + div {
  margin-left: 12px;
}

.input-list label {
  display: block;
  min-height: 20px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.input-list input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 10px 12px;
  margin-top: 7px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
}

.option-section > .once-button {
  margin-top: 16px;
}

.option-note {
  padding: 10px 12px;
  margin-top: 12px;
  border-left: 3px solid var(--color-warning);
  background: var(--color-warning-bg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.phase-panel button {
  margin-top: 12px;
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.log-section {
  background: var(--color-bg-sunken);
}

.log-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.log-heading > div {
  min-width: 0;
  padding-right: 16px;
}

.log-section ol {
  padding: 0;
  margin: 14px 0 0;
  list-style: none;
}

.log-section li {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  overflow-wrap: anywhere;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
}

.log-section li + li {
  margin-top: 6px;
}

.empty-log {
  min-height: 22px;
  margin-top: 14px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

@media (max-width: 560px) {
  .demo-header {
    flex-direction: column;
    padding: 18px;
  }

  .demo-header > div:first-child {
    padding-right: 0;
  }

  .status-board {
    width: 100%;
    flex-basis: auto;
    margin-top: 16px;
  }

  .demo-section,
  .log-section {
    padding: 18px;
  }

  .control-row,
  .mode-switch,
  .input-list {
    flex-direction: column;
  }

  .control-row button,
  .mode-switch button,
  .input-list > div {
    width: 100%;
    margin-right: 0;
  }

  .input-list > div + div {
    margin-top: 14px;
    margin-left: 0;
  }

  .option-section > .once-button,
  .phase-panel button,
  .modifier-panel button {
    width: 100%;
  }

  .modifier-panel button {
    margin-left: 0;
  }

  .log-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .log-heading > div {
    padding-right: 0;
  }

  .log-heading button {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
