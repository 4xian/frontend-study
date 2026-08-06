<script setup lang="ts">
import { ref } from 'vue'

type ContactMethod = 'email' | 'sms'
type Region = '' | 'north' | 'south'

const name = ref('Ada')
const bio = ref('正在学习 Vue 3')
const displayName = ref('初学者')
const displayNameDom = ref('初学者')
const displayNamePhase = ref('已提交到模型')
const age = ref<number | string>(18)
const accepted = ref(false)
const channels = ref<string[]>(['email'])
const contactMethod = ref<ContactMethod>('email')
const region = ref<Region>('')
const topics = ref<string[]>(['vue'])
const priority = ref(1)

/**
 * 记录 lazy 字段仍在 DOM 中编辑、尚未通过 change 提交的原始文本。
 */
function captureDisplayNameInput(event: Event): void {
  const input = event.currentTarget as HTMLInputElement
  displayNameDom.value = input.value
  displayNamePhase.value = '失焦前：本次输入尚未提交'
}

/**
 * 在 change 发生后记录 DOM 原文，并标记模型已完成 trim 提交。
 */
function markDisplayNameCommitted(event: Event): void {
  const input = event.currentTarget as HTMLInputElement
  displayNameDom.value = input.value
  displayNamePhase.value = 'change 后：模型已 trim 提交'
}

/**
 * 把实验台中的全部模型和教学状态恢复为统一初始值。
 */
function resetForm(): void {
  name.value = 'Ada'
  bio.value = '正在学习 Vue 3'
  displayName.value = '初学者'
  displayNameDom.value = '初学者'
  displayNamePhase.value = '已提交到模型'
  age.value = 18
  accepted.value = false
  channels.value = ['email']
  contactMethod.value = 'email'
  region.value = ''
  topics.value = ['vue']
  priority.value = 1
}
</script>

<template>
  <article class="form-demo">
    <header class="demo-header">
      <div>
        <p class="eyebrow">表单状态实验台</p>
        <h3>观察不同控件如何更新同一份状态</h3>
        <p>输入区保留原生控件语义，状态区显示模型值和实际类型。</p>
      </div>
      <button type="button" class="reset-button" @click="resetForm">重置表单</button>
    </header>

    <div class="lab-layout">
      <div class="form-controls">
        <section class="form-section" aria-labelledby="form-live-title">
          <div class="section-heading">
            <p>01</p>
            <div>
              <h4 id="form-live-title">即时资料</h4>
              <span>text 与 textarea 在 input 时同步模型。</span>
            </div>
          </div>

          <div class="field-list">
            <div class="field">
              <label for="form-name">姓名（即时）</label>
              <input id="form-name" v-model="name" type="text" autocomplete="name" />
            </div>
            <div class="field">
              <label for="form-bio">个人简介（即时）</label>
              <textarea id="form-bio" v-model="bio" rows="3"></textarea>
            </div>
          </div>
        </section>

        <section class="form-section" aria-labelledby="form-modifier-title">
          <div class="section-heading">
            <p>02</p>
            <div>
              <h4 id="form-modifier-title">提交时机与值转换</h4>
              <span>分别观察 lazy.trim 与 number 的模型边界。</span>
            </div>
          </div>

          <div class="field-list">
            <div class="field">
              <label for="form-display-name">显示名称（失焦后提交）</label>
              <input
                id="form-display-name"
                v-model.lazy.trim="displayName"
                type="text"
                @input="captureDisplayNameInput"
                @change="markDisplayNameCommitted"
              />
              <p class="field-status" aria-live="polite">{{ displayNamePhase }}</p>
            </div>
            <div class="field">
              <label for="form-age">年龄（number）</label>
              <input id="form-age" v-model.number="age" type="number" min="0" step="1" />
              <p class="field-status">清空后模型值为 <code>''</code>，类型为 string。</p>
            </div>
          </div>
        </section>

        <section class="form-section" aria-labelledby="form-choice-title">
          <div class="section-heading">
            <p>03</p>
            <div>
              <h4 id="form-choice-title">选择偏好</h4>
              <span>模型形状决定 checkbox、radio 与 select 的结果。</span>
            </div>
          </div>

          <div class="choice-list">
            <fieldset class="choice-group">
              <legend>协议状态</legend>
              <label class="choice-row" for="form-accepted">
                <input id="form-accepted" v-model="accepted" type="checkbox" />
                <span>接受课程通知</span>
              </label>
            </fieldset>

            <fieldset class="choice-group">
              <legend>通知渠道（Array）</legend>
              <div class="choice-options">
                <label class="choice-row" for="channel-email">
                  <input id="channel-email" v-model="channels" type="checkbox" value="email" />
                  <span>邮件</span>
                </label>
                <label class="choice-row" for="channel-sms">
                  <input id="channel-sms" v-model="channels" type="checkbox" value="sms" />
                  <span>短信</span>
                </label>
                <label class="choice-row" for="channel-site">
                  <input id="channel-site" v-model="channels" type="checkbox" value="site" />
                  <span>站内消息</span>
                </label>
              </div>
            </fieldset>

            <fieldset class="choice-group">
              <legend>首选联系方式</legend>
              <div class="choice-options">
                <label class="choice-row" for="contact-email">
                  <input id="contact-email" v-model="contactMethod" type="radio" value="email" />
                  <span>邮件优先</span>
                </label>
                <label class="choice-row" for="contact-sms">
                  <input id="contact-sms" v-model="contactMethod" type="radio" value="sms" />
                  <span>短信优先</span>
                </label>
              </div>
            </fieldset>
          </div>

          <div class="select-list">
            <div class="field">
              <label for="form-region">学习地区</label>
              <select id="form-region" v-model="region">
                <option disabled value="">请选择地区</option>
                <option value="north">北区</option>
                <option value="south">南区</option>
              </select>
            </div>

            <div class="field">
              <label for="form-topics">关注主题（Array 多选）</label>
              <select id="form-topics" v-model="topics" multiple size="3">
                <option value="vue">Vue</option>
                <option value="typescript">TypeScript</option>
                <option value="router">Vue Router</option>
              </select>
            </div>

            <div class="field">
              <label for="form-priority">学习强度（动态数值）</label>
              <select id="form-priority" v-model="priority">
                <option :value="1">轻量 · 1</option>
                <option :value="2">标准 · 2</option>
                <option :value="3">集中 · 3</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <aside class="state-panel" aria-labelledby="form-state-title">
        <div class="state-heading">
          <p class="eyebrow">JavaScript 模型</p>
          <h4 id="form-state-title">当前状态</h4>
        </div>

        <dl>
          <div>
            <dt>姓名 · string</dt>
            <dd data-state="name">{{ JSON.stringify(name) }}</dd>
          </div>
          <div>
            <dt>简介 · string</dt>
            <dd data-state="bio">{{ JSON.stringify(bio) }}</dd>
          </div>
          <div>
            <dt>lazy DOM 原文</dt>
            <dd data-state="lazy-dom">{{ JSON.stringify(displayNameDom) }}</dd>
          </div>
          <div>
            <dt>lazy 模型 · string</dt>
            <dd data-state="lazy-model">{{ JSON.stringify(displayName) }}</dd>
          </div>
          <div>
            <dt>lazy 阶段</dt>
            <dd data-state="lazy-phase">{{ displayNamePhase }}</dd>
          </div>
          <div>
            <dt>number 值</dt>
            <dd data-state="age-value">{{ JSON.stringify(age) }}</dd>
          </div>
          <div>
            <dt>number typeof</dt>
            <dd data-state="age-type">{{ typeof age }}</dd>
          </div>
          <div>
            <dt>布尔 checkbox</dt>
            <dd data-state="accepted">{{ accepted }} · boolean</dd>
          </div>
          <div>
            <dt>checkbox 组</dt>
            <dd data-state="channels">{{ JSON.stringify(channels) }} · Array</dd>
          </div>
          <div>
            <dt>radio</dt>
            <dd data-state="contact">{{ JSON.stringify(contactMethod) }} · string</dd>
          </div>
          <div>
            <dt>单选 select</dt>
            <dd data-state="region">{{ JSON.stringify(region) }} · string</dd>
          </div>
          <div>
            <dt>多选 select</dt>
            <dd data-state="topics">{{ JSON.stringify(topics) }} · Array</dd>
          </div>
          <div>
            <dt>动态 option 值</dt>
            <dd data-state="priority-value">{{ priority }}</dd>
          </div>
          <div>
            <dt>动态 option typeof</dt>
            <dd data-state="priority-type">{{ typeof priority }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </article>
</template>

<style scoped>
.form-demo {
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
.section-heading > p {
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

.demo-header > div > p:last-child,
.section-heading span {
  margin-top: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
}

.reset-button {
  min-height: 44px;
  flex: 0 0 auto;
  padding: 8px 15px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
}

.lab-layout {
  display: flex;
  align-items: stretch;
  min-width: 0;
}

.form-controls {
  width: 62%;
  min-width: 0;
}

.form-section {
  padding: 20px 22px 22px;
}

.form-section + .form-section {
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
.state-heading h4 {
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.35;
}

.section-heading span {
  display: block;
}

.field-list,
.select-list,
.choice-list {
  margin-top: 17px;
}

.field + .field,
.choice-group + .choice-group {
  margin-top: 15px;
}

.field label {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  min-width: 0;
  margin-top: 7px;
  padding: 9px 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
}

.field input,
.field select:not([multiple]) {
  min-height: 44px;
}

.field textarea {
  min-height: 82px;
  resize: vertical;
}

.field select[multiple] {
  min-height: 112px;
}

.field-status {
  min-height: 20px;
  margin-top: 7px;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1.5;
}

.field-status code {
  color: var(--color-text-secondary);
}

.choice-group {
  min-width: 0;
  padding: 13px 14px 14px;
  border: 1px solid var(--color-border);
  border-radius: 7px;
}

.choice-group legend {
  padding: 0 6px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.choice-options {
  display: flex;
  flex-wrap: wrap;
  margin-right: -10px;
}

.choice-row {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-right: 10px;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.choice-row input {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin: 0 8px 0 0;
  accent-color: var(--color-accent);
}

.state-panel {
  width: 38%;
  min-width: 0;
  padding: 20px;
  border-left: 1px solid var(--color-border);
  background: var(--color-bg-sunken);
}

.state-heading h4 {
  margin-top: 4px;
}

.state-panel dl {
  margin-top: 15px;
}

.state-panel dl > div {
  padding: 10px 0;
  border-top: 1px solid var(--color-border);
}

.state-panel dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.state-panel dd {
  min-height: 20px;
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: var(--color-text);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.45;
  white-space: pre-wrap;
}

.reset-button:hover {
  background: var(--color-accent-hover);
}

.reset-button:focus-visible,
.field input:focus-visible,
.field textarea:focus-visible,
.field select:focus-visible,
.choice-row:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .demo-header,
  .lab-layout {
    flex-direction: column;
  }

  .demo-header {
    padding: 18px;
  }

  .demo-header > div {
    padding-right: 0;
  }

  .reset-button {
    width: 100%;
    margin-top: 16px;
  }

  .form-controls,
  .state-panel {
    width: 100%;
  }

  .form-section,
  .state-panel {
    padding: 18px;
  }

  .choice-options {
    flex-direction: column;
    margin-right: 0;
  }

  .choice-row {
    width: 100%;
    margin-right: 0;
  }

  .state-panel {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}
</style>
