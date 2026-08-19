import { useId, useState } from 'react'
import './use-id-accessible-links-demo.css'

type AccessibleFieldProps = {
  label: string
  help: string
  error: string
  hasError: boolean
}

/** 渲染一组具有唯一名称与描述关联的输入元素。 */
function AccessibleField({ label, help, error, hasError }: AccessibleFieldProps) {
  const idPrefix = useId()
  const inputId = `${idPrefix}-input`
  const helpId = `${idPrefix}-help`
  const errorId = `${idPrefix}-error`
  const describedBy = hasError ? `${helpId} ${errorId}` : helpId

  return (
    <article className="use-id-field">
      <div className="use-id-field-heading">
        <label htmlFor={inputId}>{label}</label>
        <span>{hasError ? '含错误描述' : '仅帮助描述'}</span>
      </div>

      <input id={inputId} type="email" aria-describedby={describedBy} />
      <p id={helpId} className="use-id-help">
        {help}
      </p>
      {hasError ? (
        <p id={errorId} className="use-id-error">
          {error}
        </p>
      ) : null}

      <dl className="use-id-observer">
        <div>
          <dt>input id</dt>
          <dd>
            <code>{inputId}</code>
          </dd>
        </div>
        <div>
          <dt>label for</dt>
          <dd>
            <code>{inputId}</code>
          </dd>
        </div>
        <div>
          <dt>help id</dt>
          <dd>
            <code>{helpId}</code>
          </dd>
        </div>
        <div>
          <dt>error id</dt>
          <dd>
            <code>{errorId}</code>
          </dd>
        </div>
        <div>
          <dt>aria-describedby</dt>
          <dd>
            <code>{describedBy}</code>
          </dd>
        </div>
      </dl>
    </article>
  )
}

/** 展示两个字段实例，并统一切换错误描述是否参与关联。 */
export default function UseIdAccessibleLinksDemo() {
  const [showErrors, setShowErrors] = useState(false)

  /** 切换错误节点与对应描述 ID 是否同时存在。 */
  function handleToggleErrors() {
    setShowErrors((visible) => !visible)
  }

  return (
    <section className="use-id-demo" aria-labelledby="use-id-demo-title">
      <header className="use-id-heading">
        <p>useId</p>
        <h2 id="use-id-demo-title">两个实例，两组独立关联</h2>
        <span>每组字段共享自己的 ID 前缀，错误出现时只扩展当前实例的描述引用。</span>
      </header>

      <div className="use-id-actions">
        <button type="button" onClick={handleToggleErrors} aria-pressed={showErrors}>
          {showErrors ? '隐藏错误' : '显示错误'}
        </button>
        <output aria-live="polite">{showErrors ? '帮助与错误共同描述' : '仅帮助文本描述'}</output>
      </div>

      <div className="use-id-fields">
        <AccessibleField
          label="课程邮箱"
          help="请输入学校提供的邮箱。"
          error="课程邮箱格式不完整。"
          hasError={showErrors}
        />
        <AccessibleField
          label="联系邮箱"
          help="用于接收课程通知。"
          error="联系邮箱格式不完整。"
          hasError={showErrors}
        />
      </div>

      <p className="use-id-rule">
        每个字段始终调用一次 <code>useId</code>；状态只改变描述字符串和错误节点。
      </p>
    </section>
  )
}
