import { useLayoutEffect, useRef, useState } from 'react'
import './prepaint-measurement-demo.css'

type WidthMode = 'wide' | 'narrow'
type ContentMode = 'compact' | 'detailed'

type Measurement = {
  width: number
  height: number
  revision: number
}

const contentByMode: Record<ContentMode, string> = {
  compact: '较短内容只占少量行，用于观察内容收缩后的真实几何。',
  detailed:
    '同一段内容在宽度变窄时会自然换成更多行。布局 Effect 只在节点提交后读取真实尺寸，再把这个结果同步给下一次 render；按钮不会直接写入任何测量像素。',
}

/** 在绘制前测量同一节点，并用测量结果修正可见几何。 */
export default function PrepaintMeasurementDemo() {
  const [widthMode, setWidthMode] = useState<WidthMode>('wide')
  const [contentMode, setContentMode] = useState<ContentMode>('detailed')
  const [shellRevision, setShellRevision] = useState(0)
  const measurementRef = useRef<HTMLDivElement>(null)
  const [measurement, setMeasurement] = useState<Measurement>({
    width: 0,
    height: 0,
    revision: 0,
  })

  /** 提交后读取测量盒尺寸，并把结果写入可见状态。 */
  useLayoutEffect(() => {
    const node = measurementRef.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    setMeasurement((current) => ({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      revision: current.revision + 1,
    }))
  }, [contentMode, widthMode])

  /** 切换测量盒宽度模式，触发下一次布局测量。 */
  const toggleWidthMode = () => {
    setWidthMode(widthMode === 'wide' ? 'narrow' : 'wide')
  }

  /** 切换测量盒内容长度，触发下一次布局测量。 */
  const toggleContentMode = () => {
    setContentMode(contentMode === 'detailed' ? 'compact' : 'detailed')
  }

  /** 只更新外壳状态，用于验证无关提交不会重复测量。 */
  const updateShell = () => {
    setShellRevision((current) => current + 1)
  }

  return (
    <section className="prepaint-measurement-demo" data-testid="prepaint-measurement-demo">
      <header className="prepaint-measurement-demo-heading">
        <p>已提交 DOM 的测量</p>
        <h2>先测量真实尺寸，再绘制最终几何</h2>
        <span>宽度或内容改变时重新测量；无关外壳更新不会增加测量轮次。</span>
      </header>

      <div className="prepaint-measurement-demo-controls" aria-label="测量输入控制">
        <button type="button" aria-pressed={widthMode === 'narrow'} onClick={toggleWidthMode}>
          {widthMode === 'wide' ? '切换为窄宽度' : '切换为宽宽度'}
        </button>
        <button type="button" aria-pressed={contentMode === 'compact'} onClick={toggleContentMode}>
          {contentMode === 'detailed' ? '切换为短内容' : '切换为长内容'}
        </button>
        <button type="button" data-variant="secondary" onClick={updateShell}>
          只更新外壳
        </button>
      </div>

      <div className="prepaint-measurement-demo-state" aria-label="当前输入与同步轮次">
        <span data-testid="width-mode" data-width-mode={widthMode}>
          宽度：{widthMode === 'wide' ? '宽' : '窄'}
        </span>
        <span data-testid="content-mode" data-content-mode={contentMode}>
          内容：{contentMode === 'detailed' ? '长' : '短'}
        </span>
        <span data-testid="shell-revision">外壳 revision：{shellRevision}</span>
        <span data-testid="measurement-revision">测量轮次：{measurement.revision}</span>
      </div>

      <div className="prepaint-measurement-demo-stage">
        <div className="prepaint-measurement-demo-measurement">
          <span>已提交的测量盒</span>
          <div
            ref={measurementRef}
            className="prepaint-measurement-demo-box"
            data-testid="measurement-box"
            data-width-mode={widthMode}
            data-content-mode={contentMode}
          >
            {contentByMode[contentMode]}
          </div>
        </div>

        <div className="prepaint-measurement-demo-result" role="status" aria-live="polite">
          <span>useLayoutEffect 测得的尺寸</span>
          <output data-testid="measured-size">
            <span>宽度</span>
            <strong data-testid="measured-width">{measurement.width}px</strong>
            <span>高度</span>
            <strong data-testid="measured-height">{measurement.height}px</strong>
          </output>
          <p>宽高读数和标尺共用同一份 measurement State。</p>
        </div>

        <div className="prepaint-measurement-demo-ruler-panel">
          <span>由同一 State 驱动的几何标尺</span>
          <div className="prepaint-measurement-demo-ruler" data-testid="measurement-ruler">
            <div
              className="prepaint-measurement-demo-ruler-fill"
              data-testid="measurement-ruler-fill"
              style={{ height: measurement.height }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
