import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
} from 'react'

import type { EmbeddedStatusStore } from './embedded-status-store'

export type PanelMeasurement = Readonly<{
  revision: number
  width: number
  height: number
}>

export type PanelCommit = Readonly<{
  panel: HTMLElement | null
  primaryAction: HTMLButtonElement | null
}>

export type CommandEvidence = Readonly<{
  command: 'focusPrimaryAction' | 'remeasure'
  result: string
}>

export type EmbeddedStatusPanelHandle = Readonly<{
  focusPrimaryAction: () => CommandEvidence
  remeasure: () => CommandEvidence
}>

type EmbeddedStatusPanelProps = Readonly<{
  ref?: Ref<EmbeddedStatusPanelHandle>
  store: EmbeddedStatusStore
  onCommit: (commit: PanelCommit) => void
  onMeasurement: (measurement: PanelMeasurement) => void
}>

/** 读取宿主 Store，并只公开聚焦与重新测量两个受限命令。 */
export function EmbeddedStatusPanel({
  ref,
  store,
  onCommit,
  onMeasurement,
}: EmbeddedStatusPanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const primaryActionRef = useRef<HTMLButtonElement>(null)
  const measurementRevisionRef = useRef(0)
  const [acknowledgementCount, setAcknowledgementCount] = useState(0)
  const [measurementRequest, setMeasurementRequest] = useState(0)
  const [measurement, setMeasurement] = useState<PanelMeasurement>({
    revision: 0,
    width: 0,
    height: 0,
  })
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)

  useImperativeHandle(
    ref,
    () => ({
      /** 聚焦面板主按钮，并返回不含 DOM 节点的结果。 */
      focusPrimaryAction(): CommandEvidence {
        const button = primaryActionRef.current
        button?.focus()
        return {
          command: 'focusPrimaryAction',
          result:
            button && button.ownerDocument.activeElement === button
              ? '焦点已进入面板主按钮'
              : '面板主按钮尚未就绪',
        }
      },
      /** 请求下一次提交后重新读取面板布局。 */
      remeasure(): CommandEvidence {
        setMeasurementRequest((current) => current + 1)
        return {
          command: 'remeasure',
          result: '已安排下一次提交后测量',
        }
      },
    }),
    [],
  )

  /** 在当前提交后、浏览器绘制前读取面板尺寸并报告节点身份。 */
  useLayoutEffect(() => {
    const panel = panelRef.current
    const primaryAction = primaryActionRef.current
    if (!panel || !primaryAction) return

    const rect = panel.getBoundingClientRect()
    measurementRevisionRef.current += 1
    const nextMeasurement = Object.freeze({
      revision: measurementRevisionRef.current,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    })
    setMeasurement(nextMeasurement)
    onCommit({ panel, primaryAction })
    onMeasurement(nextMeasurement)
  }, [measurementRequest, onCommit, onMeasurement, snapshot.revision])

  /** 记录同一静态按钮被 React 接管后的事件更新。 */
  function acknowledgeCurrentStatus(): void {
    setAcknowledgementCount((current) => current + 1)
  }

  const measurementLabel =
    measurement.revision === 0
      ? '等待首次提交后测量'
      : `${measurement.width} x ${measurement.height}px / revision ${measurement.revision}`

  return (
    <article
      ref={panelRef}
      className="embedded-status-panel"
      data-status={snapshot.status}
      data-testid="embedded-status-panel"
    >
      <header className="embedded-status-panel__heading">
        <span>Embedded service status</span>
        <strong>服务状态面板</strong>
      </header>
      <div className="embedded-status-panel__body">
        <section className="embedded-status-panel__summary" aria-label="当前服务状态">
          <span>当前状态</span>
          <strong data-testid="panel-status-label">{snapshot.label}</strong>
          <p data-testid="panel-status-message">{snapshot.message}</p>
        </section>
        <dl className="embedded-status-panel__facts">
          <div>
            <dt>活动服务</dt>
            <dd data-testid="panel-active-services">{snapshot.activeServices}</dd>
          </div>
          <div>
            <dt>快照 revision</dt>
            <dd data-testid="panel-snapshot-revision">{snapshot.revision}</dd>
          </div>
        </dl>
      </div>
      <footer className="embedded-status-panel__footer">
        <div>
          <span>布局测量</span>
          <strong data-testid="panel-measurement">{measurementLabel}</strong>
        </div>
        <button
          ref={primaryActionRef}
          type="button"
          data-testid="panel-primary-action"
          onClick={acknowledgeCurrentStatus}
        >
          确认当前状态
        </button>
        <p data-testid="panel-acknowledgement">确认次数：{acknowledgementCount}</p>
      </footer>
    </article>
  )
}
