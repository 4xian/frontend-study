import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './state-model-demo.css'

interface Category {
  id: string
  label: string
  description: string
}

interface Draft {
  subject: string
  detail: string
}

type SubmissionState =
  | { status: 'editing' }
  | { status: 'success'; reference: string }
  | { status: 'error'; message: string }

const initialDraft: Draft = {
  subject: '无法登录学习站',
  detail: '输入正确密码后仍然回到登录页。',
}

const categories: readonly Category[] = [
  { id: 'account', label: '账号问题', description: '登录、权限和个人资料' },
  { id: 'content', label: '内容问题', description: '课程、示例和文档显示' },
  { id: 'billing', label: '费用问题', description: '订单、发票和退款' },
]
const defaultCategoryId = 'account'

/** 展示一组有明确关系的 State 结构，并让每次更新保持模型一致。 */
export default function StateModelDemo() {
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId)
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'editing' })

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)
  const normalizedSubject = draft.subject.trim()
  const normalizedDetail = draft.detail.trim()
  const detailLength = normalizedDetail.length
  const isDraftReady = normalizedSubject !== '' && detailLength >= 12
  const completionLabel = isDraftReady ? '可以提交' : '还需完善'
  const ticketPreview = `${selectedCategory?.label ?? '未分类'}：${normalizedSubject || '未填写主题'}`

  /** 更新草稿中的一个字段，并把提交结果恢复为编辑阶段。 */
  function handleDraftChange(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    setSubmission({ status: 'editing' })
  }

  /** 只保存稳定分类 ID，不把分类对象复制进另一份 State。 */
  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCategoryId(event.currentTarget.value)
    setSubmission({ status: 'editing' })
  }

  /** 根据当前草稿把提交 State 转换到一个合法的结果分支。 */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (normalizedSubject === '') {
      setSubmission({ status: 'error', message: '请先填写主题，再提交工单。' })
      return
    }
    if (detailLength < 12) {
      setSubmission({ status: 'error', message: '问题描述至少需要 12 个字符。' })
      return
    }
    setSubmission({ status: 'success', reference: 'TICKET-2048' })
  }

  /** 恢复所有本地事实，并把互斥状态回到唯一的编辑分支。 */
  function handleReset() {
    setDraft(initialDraft)
    setSelectedCategoryId(defaultCategoryId)
    setSubmission({ status: 'editing' })
  }

  return (
    <section className="react-state-model-demo" data-testid="react-state-model-demo">
      <header className="react-state-model-heading">
        <p>State structure lab</p>
        <h2>把事实组织成不会互相打架的模型</h2>
      </header>

      <form className="react-state-model-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>工单草稿</legend>
          <label>
            <span>主题</span>
            <input
              value={draft.subject}
              onChange={(event) => handleDraftChange('subject', event.currentTarget.value)}
            />
          </label>
          <label>
            <span>分类</span>
            <select value={selectedCategoryId} onChange={handleCategoryChange}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>问题描述</span>
            <textarea
              rows={3}
              value={draft.detail}
              onChange={(event) => handleDraftChange('detail', event.currentTarget.value)}
            />
          </label>
        </fieldset>

        <div className="react-state-model-actions">
          <button type="button" onClick={handleReset}>
            重置
          </button>
          <button className="primary" type="submit">
            提交
          </button>
        </div>
      </form>

      <dl className="react-state-model-facts">
        <div>
          <dt>当前分类</dt>
          <dd>{selectedCategory?.label ?? '未选择'}</dd>
          <small>{selectedCategory?.description ?? '分类已不存在'}</small>
        </div>
        <div>
          <dt>草稿完成度</dt>
          <dd data-testid="state-derived-readiness">{completionLabel}</dd>
          <small>描述 {detailLength} 个字符，至少需要 12 个字符</small>
        </div>
        <div>
          <dt>工单预览</dt>
          <dd data-testid="state-derived-preview">{ticketPreview}</dd>
          <small>由当前分类和规范化主题直接计算</small>
        </div>
        <div>
          <dt>提交状态</dt>
          <dd>{submission.status}</dd>
          <small aria-live="polite">
            {submission.status === 'success'
              ? `编号：${submission.reference}`
              : submission.status === 'error'
                ? submission.message
                : '草稿可以继续编辑'}
          </small>
        </div>
        <div>
          <dt>结构观察</dt>
          <dd>只保存三份源 State</dd>
          <small>分类对象、完成度、字符数和预览都没有 setter</small>
        </div>
      </dl>
    </section>
  )
}
