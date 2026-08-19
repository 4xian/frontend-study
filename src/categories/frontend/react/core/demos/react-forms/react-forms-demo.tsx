import { useId, useState } from 'react'
import type { ChangeEvent, SubmitEvent as ReactSubmitEvent } from 'react'
import './react-forms-demo.css'

type LearningMode = 'reading' | 'practice'
type DeliveryMode = 'online' | 'classroom'

type SubmissionSnapshot = {
  defaultPrevented: boolean
  submitter: string
  entries: Array<{ name: string; value: string }>
  name: string
  invitationCode: string
  topics: string[]
  disabledFieldIncluded: boolean
}

/** 只保留 FormData 中指定字段的文本值。 */
function readTextValue(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** 读取指定字段的全部文本值，并保留原有顺序。 */
function readTextValues(formData: FormData, name: string) {
  return formData.getAll(name).filter((value): value is string => typeof value === 'string')
}

/** 把当前 FormData entry 转成适合界面观察的文本。 */
function readEntries(formData: FormData) {
  return Array.from(formData.entries(), ([name, value]) => ({
    name,
    value: typeof value === 'string' ? value : value.name,
  }))
}

/** 连通受控字段、非受控字段与浏览器表单提交投影。 */
export default function ReactFormsDemo() {
  const idPrefix = useId()
  const nameId = `${idPrefix}-name`
  const nameHelpId = `${idPrefix}-name-help`
  const notificationId = `${idPrefix}-notification`
  const modeReadingId = `${idPrefix}-mode-reading`
  const modePracticeId = `${idPrefix}-mode-practice`
  const deliveryId = `${idPrefix}-delivery`
  const notesId = `${idPrefix}-notes`
  const invitationId = `${idPrefix}-invitation`
  const disabledId = `${idPrefix}-disabled`

  const [name, setName] = useState('React learner')
  const [receiveNotifications, setReceiveNotifications] = useState(true)
  const [learningMode, setLearningMode] = useState<LearningMode>('reading')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('online')
  const [notes, setNotes] = useState('希望系统学习 React 表单。')
  const [previewCount, setPreviewCount] = useState(0)
  const [snapshot, setSnapshot] = useState<SubmissionSnapshot | null>(null)

  /** 同步受控姓名输入的字符串值。 */
  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.currentTarget.value)
  }

  /** 同步受控通知复选框的布尔选中状态。 */
  function handleNotificationChange(event: ChangeEvent<HTMLInputElement>) {
    setReceiveNotifications(event.currentTarget.checked)
  }

  /** 同步受控单选组当前选择的学习方式。 */
  function handleLearningModeChange(event: ChangeEvent<HTMLInputElement>) {
    setLearningMode(event.currentTarget.value as LearningMode)
  }

  /** 同步受控下拉框当前选择的授课方式。 */
  function handleDeliveryModeChange(event: ChangeEvent<HTMLSelectElement>) {
    setDeliveryMode(event.currentTarget.value as DeliveryMode)
  }

  /** 同步受控多行文本的字符串值。 */
  function handleNotesChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setNotes(event.currentTarget.value)
  }

  /** 执行不会触发表单提交的普通预览命令。 */
  function handlePreview() {
    setPreviewCount((count) => count + 1)
  }

  /** 取消浏览器默认提交，并保存浏览器生成的 FormData 投影。 */
  function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget, event.nativeEvent.submitter)

    setSnapshot({
      defaultPrevented: event.defaultPrevented,
      submitter: readTextValue(formData, 'intent'),
      entries: readEntries(formData),
      name: readTextValue(formData, 'name'),
      invitationCode: readTextValue(formData, 'invitationCode'),
      topics: readTextValues(formData, 'topic'),
      disabledFieldIncluded: formData.has('internalCode'),
    })
  }

  return (
    <section className="react-forms-demo" aria-labelledby={`${idPrefix}-title`}>
      <header className="react-forms-heading">
        <p>React form</p>
        <h2 id={`${idPrefix}-title`}>编辑当前值，提交数据投影</h2>
        <span>左侧字段展示值来源；提交后，右侧按 FormData 的 entry 顺序显示结果。</span>
      </header>

      <div className="react-forms-columns">
        <form className="react-forms-fields" onSubmit={handleSubmit}>
          <div className="react-forms-field">
            <label htmlFor={nameId}>姓名（受控 value）</label>
            <input
              id={nameId}
              name="name"
              value={name}
              onChange={handleNameChange}
              aria-describedby={nameHelpId}
              required
            />
            <p id={nameHelpId}>必填；每次输入都会同步更新 React State。</p>
          </div>

          <div className="react-forms-field react-forms-choice">
            <input
              id={notificationId}
              name="notification"
              type="checkbox"
              value="email"
              checked={receiveNotifications}
              onChange={handleNotificationChange}
            />
            <label htmlFor={notificationId}>接收邮件通知（受控 checked）</label>
          </div>

          <fieldset>
            <legend>学习方式（受控 radio）</legend>
            <div className="react-forms-choice">
              <input
                id={modeReadingId}
                name="learningMode"
                type="radio"
                value="reading"
                checked={learningMode === 'reading'}
                onChange={handleLearningModeChange}
              />
              <label htmlFor={modeReadingId}>阅读讲解</label>
            </div>
            <div className="react-forms-choice">
              <input
                id={modePracticeId}
                name="learningMode"
                type="radio"
                value="practice"
                checked={learningMode === 'practice'}
                onChange={handleLearningModeChange}
              />
              <label htmlFor={modePracticeId}>动手练习</label>
            </div>
          </fieldset>

          <div className="react-forms-field">
            <label htmlFor={deliveryId}>授课方式（受控 select）</label>
            <select
              id={deliveryId}
              name="deliveryMode"
              value={deliveryMode}
              onChange={handleDeliveryModeChange}
            >
              <option value="online">线上</option>
              <option value="classroom">教室</option>
            </select>
          </div>

          <div className="react-forms-field">
            <label htmlFor={notesId}>学习说明（受控 textarea）</label>
            <textarea id={notesId} name="notes" value={notes} onChange={handleNotesChange} />
          </div>

          <div className="react-forms-field">
            <label htmlFor={invitationId}>邀请码（非受控 defaultValue）</label>
            <input id={invitationId} name="invitationCode" defaultValue="REACT-19" />
          </div>

          <fieldset>
            <legend>关注主题（非受控同名 checkbox）</legend>
            <div className="react-forms-choice">
              <input
                id={`${idPrefix}-topic-tsx`}
                name="topic"
                type="checkbox"
                value="tsx"
                defaultChecked
              />
              <label htmlFor={`${idPrefix}-topic-tsx`}>TSX</label>
            </div>
            <div className="react-forms-choice">
              <input
                id={`${idPrefix}-topic-state`}
                name="topic"
                type="checkbox"
                value="state"
                defaultChecked
              />
              <label htmlFor={`${idPrefix}-topic-state`}>State</label>
            </div>
            <div className="react-forms-choice">
              <input id={`${idPrefix}-topic-form`} name="topic" type="checkbox" value="form" />
              <label htmlFor={`${idPrefix}-topic-form`}>Form</label>
            </div>
          </fieldset>

          <div className="react-forms-field">
            <label htmlFor={`${idPrefix}-focus`}>练习重点（非受控 multiple select）</label>
            <select id={`${idPrefix}-focus`} name="topic" multiple defaultValue={['events']}>
              <option value="events">事件</option>
              <option value="accessibility">无障碍</option>
              <option value="form-data">FormData</option>
            </select>
          </div>

          <div className="react-forms-field">
            <label htmlFor={disabledId}>内部编号（已禁用）</label>
            <input id={disabledId} name="internalCode" defaultValue="INTERNAL-01" disabled />
          </div>

          <div className="react-forms-actions">
            <button type="button" onClick={handlePreview}>
              普通预览 · {previewCount}
            </button>
            <button type="submit" name="intent" value="register">
              提交报名
            </button>
          </div>
        </form>

        <aside className="react-forms-snapshot" aria-label="表单观察结果" aria-live="polite">
          <section>
            <p>Controlled state</p>
            <h3>React 当前值</h3>
            <dl>
              <div>
                <dt>name</dt>
                <dd>{name || '空字符串'}</dd>
              </div>
              <div>
                <dt>notification</dt>
                <dd>{String(receiveNotifications)}</dd>
              </div>
              <div>
                <dt>learningMode</dt>
                <dd>{learningMode}</dd>
              </div>
              <div>
                <dt>deliveryMode</dt>
                <dd>{deliveryMode}</dd>
              </div>
              <div>
                <dt>notes</dt>
                <dd>{notes || '空字符串'}</dd>
              </div>
            </dl>
          </section>

          <section className="react-forms-submission">
            <p>FormData entries</p>
            <h3>{snapshot ? '最近一次提交' : '等待提交'}</h3>
            {snapshot ? (
              <>
                <ol className="react-forms-entry-list">
                  {snapshot.entries.map((entry, index) => (
                    <li key={`${entry.name}-${index}`}>
                      <code>{entry.name}</code>
                      <span>{entry.value}</span>
                    </li>
                  ))}
                </ol>
                <dl>
                  <div>
                    <dt>get(name)</dt>
                    <dd>{snapshot.name}</dd>
                  </div>
                  <div>
                    <dt>invite</dt>
                    <dd>{snapshot.invitationCode}</dd>
                  </div>
                  <div>
                    <dt>getAll(topic)</dt>
                    <dd>{snapshot.topics.join(', ') || '空数组'}</dd>
                  </div>
                  <div>
                    <dt>submitter</dt>
                    <dd>{snapshot.submitter}</dd>
                  </div>
                  <div>
                    <dt>prevented</dt>
                    <dd>{String(snapshot.defaultPrevented)}</dd>
                  </div>
                  <div>
                    <dt>disabled included</dt>
                    <dd>{String(snapshot.disabledFieldIncluded)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="react-forms-empty">提交后显示字段名、字段值与同名多值。</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}
