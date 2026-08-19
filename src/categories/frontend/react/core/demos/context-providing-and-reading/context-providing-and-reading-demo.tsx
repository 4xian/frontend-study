import { createContext, memo, useContext, useState, type ReactNode } from 'react'
import './context-providing-and-reading-demo.css'

type Density = 'comfortable' | 'compact'
type DensityValue = Density | undefined

interface DensityReaderProps {
  label: string
  description: string
  testId: string
}

interface SelfProvidingReaderProps {
  childValue: Density
}

const defaultOuterDensity: Density = 'comfortable'
const defaultInnerDensity: Density = 'compact'
const DensityContext = createContext<DensityValue>(defaultOuterDensity)

/** 把 Context 值转换成界面中可直接核对的文本。 */
function formatDensity(value: DensityValue): string {
  return value === undefined ? 'undefined' : value
}

/** 读取当前位置最近的 DensityContext Provider 并展示结果。 */
function DensityReader({ label, description, testId }: DensityReaderProps) {
  const density = useContext(DensityContext)

  return (
    <article className={`react-context-reader is-${formatDensity(density)}`}>
      <span>{label}</span>
      <strong data-testid={testId}>{formatDensity(density)}</strong>
      <p>{description}</p>
    </article>
  )
}

const MemoDensityReader = memo(DensityReader)

/** 保留 children 所在子树，证明中间组件无需读取或转发 Context。 */
function LayoutShell({ children }: { children: ReactNode }) {
  return <div className="react-context-layout-shell">{children}</div>
}

/** 先读取父树值，再为自己的后代提供另一个值。 */
function SelfProvidingReader({ childValue }: SelfProvidingReaderProps) {
  const inheritedValue = useContext(DensityContext)

  return (
    <section className="react-context-self-provider" data-testid="context-self-provider">
      <div className="react-context-self-result">
        <span>返回 Provider 的组件自身</span>
        <strong data-testid="context-self-value">{formatDensity(inheritedValue)}</strong>
        <p>读取发生在 Provider 上方，因此使用外层值。</p>
      </div>
      <DensityContext value={childValue}>
        <DensityReader
          label="该组件返回的 Provider 后代"
          description="后代位于新 Provider 的 children 中，读取局部值。"
          testId="context-self-child-value"
        />
      </DensityContext>
    </section>
  )
}

/** 展示默认值、显式 undefined、最近 Provider、嵌套覆盖和读取更新。 */
export default function ContextProvidingAndReadingDemo() {
  const [outerDensity, setOuterDensity] = useState<DensityValue>(defaultOuterDensity)
  const [innerDensity, setInnerDensity] = useState<Density>(defaultInnerDensity)
  const [innerProviderEnabled, setInnerProviderEnabled] = useState(true)

  /** 切换内层 Provider 的密度值。 */
  function toggleInnerDensity() {
    setInnerDensity((current) => (current === 'comfortable' ? 'compact' : 'comfortable'))
  }

  /** 恢复所有 Provider 控件的确定初始状态。 */
  function resetContextTree() {
    setOuterDensity(defaultOuterDensity)
    setInnerDensity(defaultInnerDensity)
    setInnerProviderEnabled(true)
  }

  const innerReader = (
    <DensityReader
      label="内层 Editor"
      description={
        innerProviderEnabled
          ? '最近匹配内层 Provider，覆盖外层值。'
          : '内层 Provider 已移除，回到外层值。'
      }
      testId="context-inner-value"
    />
  )

  return (
    <section className="react-context-demo" data-testid="react-context-demo">
      <header className="react-context-heading">
        <div>
          <p>Nearest provider wins</p>
          <h2>Context 树读取</h2>
        </div>
        <button type="button" onClick={resetContextTree} data-testid="context-reset">
          重置
        </button>
      </header>

      <section className="react-context-fixed-cases" aria-label="默认值与显式 undefined">
        <DensityReader
          label="没有 Provider"
          description="父树没有匹配 Provider，读取 createContext 的静态默认值。"
          testId="context-default-value"
        />
        <DensityContext value={undefined}>
          <DensityReader
            label="Provider 明确提供 undefined"
            description="已经找到 Provider，不会回退到默认值。"
            testId="context-undefined-value"
          />
        </DensityContext>
      </section>

      <section className="react-context-controls" aria-label="Provider 控件">
        <fieldset>
          <legend>外层 Provider value</legend>
          {(['comfortable', 'compact', undefined] as const).map((value) => {
            const label = formatDensity(value)
            return (
              <button
                key={label}
                type="button"
                aria-pressed={Object.is(outerDensity, value)}
                className={Object.is(outerDensity, value) ? 'is-active' : undefined}
                onClick={() => setOuterDensity(value)}
                data-testid={`context-outer-${label}`}
              >
                {label}
              </button>
            )
          })}
        </fieldset>

        <fieldset>
          <legend>内层 Provider</legend>
          <label>
            <input
              type="checkbox"
              checked={innerProviderEnabled}
              onChange={(event) => setInnerProviderEnabled(event.currentTarget.checked)}
              data-testid="context-inner-enabled"
            />
            <span>启用内层覆盖</span>
          </label>
          <button type="button" onClick={toggleInnerDensity} data-testid="context-toggle-inner">
            切换内层值：{innerDensity}
          </button>
        </fieldset>
      </section>

      <DensityContext value={outerDensity}>
        <LayoutShell>
          <MemoDensityReader
            label="外层 Header"
            description="memo 只比较 Props，Context 新值仍会到达读取组件。"
            testId="context-outer-value"
          />

          {innerProviderEnabled ? (
            <DensityContext value={innerDensity}>{innerReader}</DensityContext>
          ) : (
            innerReader
          )}

          <DensityReader
            label="内层外 Footer"
            description="不在内层 children 中，始终读取外层 Provider。"
            testId="context-sibling-value"
          />

          <SelfProvidingReader childValue={innerDensity} />
        </LayoutShell>
      </DensityContext>

      <section className="react-context-contracts" aria-label="Context 类型与身份合同">
        <div>
          <span>有意义的默认值</span>
          <code>createContext&lt;Density&gt;('comfortable')</code>
        </div>
        <div>
          <span>必须由 Provider 提供</span>
          <code>createContext&lt;Workspace | null&gt;(null)</code>
        </div>
        <p>提供方和读取方必须导入同一个 Context 对象；相同名称不能替代对象身份。</p>
      </section>
    </section>
  )
}
