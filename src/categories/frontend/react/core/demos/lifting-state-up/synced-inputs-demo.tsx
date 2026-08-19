import { useState } from 'react'
import type { ChangeEvent } from 'react'
import './synced-inputs-demo.css'

interface SyncedInputProps {
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

interface ControlledTitleFieldProps {
  mode: 'controlled'
  label: string
  value: string
  onValueChange: (nextValue: string) => void
}

interface UncontrolledTitleFieldProps {
  mode: 'uncontrolled'
  label: string
  defaultValue?: string
}

type TitleFieldProps = ControlledTitleFieldProps | UncontrolledTitleFieldProps

const boundaryText = '共享 State 让编辑器、预览和字符统计始终读取同一份当前内容。'

/** 渲染一个读取共享值并向所有者报告编辑意图的输入框。 */
function SyncedInput({ label, value, onValueChange }: SyncedInputProps) {
  /** 把输入事件转换为组件合同中的新字符串。 */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.value)
  }

  return (
    <label className="react-lifting-field">
      <span>{label}</span>
      <input value={value} maxLength={60} onChange={handleChange} />
    </label>
  )
}

/** 按互斥 Props 合同渲染受控或非受控的文本字段。 */
function TitleField(props: TitleFieldProps) {
  const [internalValue, setInternalValue] = useState(
    props.mode === 'uncontrolled' ? (props.defaultValue ?? '') : '',
  )
  const currentValue = props.mode === 'controlled' ? props.value : internalValue

  /** 把输入事件交给当前值的唯一所有者。 */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.currentTarget.value
    if (props.mode === 'controlled') {
      props.onValueChange(nextValue)
      return
    }
    setInternalValue(nextValue)
  }

  return (
    <>
      <label className="react-lifting-ownership-field">
        <span>{props.label}</span>
        <input value={currentValue} onChange={handleChange} />
      </label>
      {props.mode === 'uncontrolled' ? (
        <output aria-live="polite" className="react-lifting-output">
          组件内部 State：{internalValue === '' ? '（空字符串）' : internalValue}
        </output>
      ) : null}
    </>
  )
}

/** 展示由共享文本即时得到的预览和字符数。 */
function SharedPreview({ text }: { text: string }) {
  const visibleText = text === '' ? '暂无内容' : text

  return (
    <section className="react-lifting-preview" aria-live="polite">
      <span>共享预览</span>
      <strong data-testid="lifting-preview">{visibleText}</strong>
      <small data-testid="lifting-count">{text.length} / 60 个字符</small>
    </section>
  )
}

/** 保存共享文字，并同时展示受控与非受控值所有权。 */
export default function SyncedInputsDemo() {
  const [text, setText] = useState('React State')
  const [controlledTitle, setControlledTitle] = useState('调用方拥有的标题')
  const [nextDefaultTitle, setNextDefaultTitle] = useState('组件初始拥有的标题')

  /** 用外部动作替换受控字段的当前值。 */
  function handleLoadControlledTitle() {
    setControlledTitle('父级刚刚载入的标题')
  }

  /** 用空字符串表达受控字段的合法空值。 */
  function handleClearControlledTitle() {
    setControlledTitle('')
  }

  /** 改变下一次默认值，保持当前非受控编辑不变。 */
  function handleChangeDefaultTitle() {
    setNextDefaultTitle('父级更新的下一次默认值')
  }

  return (
    <section className="react-lifting-demo" data-testid="react-lifting-demo">
      <header className="react-lifting-heading">
        <p>State ownership</p>
        <h2>共享 State 与值所有权</h2>
        <span>上方编辑器共享一份 State；下方字段分别展示受控和非受控合同。</span>
      </header>

      <div className="react-lifting-inputs">
        <SyncedInput label="编辑器 A" value={text} onValueChange={setText} />
        <SyncedInput label="编辑器 B" value={text} onValueChange={setText} />
      </div>

      <div className="react-lifting-actions">
        <button type="button" onClick={() => setText(boundaryText)}>
          填入边界样例
        </button>
        <button type="button" onClick={() => setText('')}>
          清空共享内容
        </button>
      </div>

      <SharedPreview text={text} />

      <div className="react-lifting-ownership">
        <article className="react-lifting-panel">
          <p className="react-lifting-kicker">受控</p>
          <h3>调用方拥有当前值</h3>
          <TitleField
            mode="controlled"
            label="受控标题（value + onValueChange）"
            value={controlledTitle}
            onValueChange={setControlledTitle}
          />
          <div className="react-lifting-actions">
            <button type="button" onClick={handleLoadControlledTitle}>
              外部载入标题
            </button>
            <button type="button" onClick={handleClearControlledTitle}>
              清空为空字符串
            </button>
          </div>
          <output className="react-lifting-output" aria-live="polite">
            父级 State：{controlledTitle === '' ? '（空字符串）' : controlledTitle}
          </output>
        </article>

        <article className="react-lifting-panel">
          <p className="react-lifting-kicker">非受控</p>
          <h3>组件拥有当前值</h3>
          <TitleField
            mode="uncontrolled"
            label="非受控标题（defaultValue + 内部 State）"
            defaultValue={nextDefaultTitle}
          />
          <button type="button" onClick={handleChangeDefaultTitle}>
            改变下一次 defaultValue
          </button>
          <output className="react-lifting-output" aria-live="polite">
            父级当前传入的 defaultValue：{nextDefaultTitle}
          </output>
          <small className="react-lifting-note">
            当前编辑不会被新的 defaultValue 覆盖；这里没有重建字段实例。
          </small>
        </article>
      </div>
    </section>
  )
}
