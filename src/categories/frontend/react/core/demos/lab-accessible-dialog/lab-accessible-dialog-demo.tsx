import { useId, useRef, useState } from 'react'
import type { Ref, RefCallback, SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import './lab-accessible-dialog-demo.css'

type DialogResult = 'continue-editing' | 'publish'
type CloseResult = '' | DialogResult

type CloseOutcome = {
  readonly result: CloseResult
  readonly focusReturned: boolean
}

type Announcement = {
  readonly title: string
  readonly audience: string
  readonly summary: string
}

type AccessibleDialogProps = {
  readonly host: HTMLDivElement
  readonly titleId: string
  readonly announcement: Announcement
  readonly ref?: Ref<HTMLDialogElement>
  readonly onCancel: () => void
  readonly onClose: (dialog: HTMLDialogElement) => void
  readonly onChoose: (result: DialogResult) => void
}

const ANNOUNCEMENT: Announcement = {
  title: 'React 学习小组活动通知',
  audience: '前端课程本科生',
  summary: '确认时间、地点和参与对象后发布到课程公告栏。',
}

/** 把原生 returnValue 转成结果区使用的短标签。 */
function formatOutcome(result: CloseResult): string {
  if (result === 'publish') return '已确认发布'
  if (result === 'continue-editing') return '继续编辑'
  return 'Escape 关闭'
}

/** 创建稳定的 Dialog Callback Ref，在提交时打开 modal，并在节点失效时清理对象 Ref。 */
function createDialogConnector(dialogNodeRef: {
  current: HTMLDialogElement | null
}): RefCallback<HTMLDialogElement> {
  return (dialog) => {
    if (dialog === null) return

    dialogNodeRef.current = dialog
    if (!dialog.open) dialog.showModal()

    return () => {
      if (dialogNodeRef.current === dialog) dialogNodeRef.current = null
    }
  }
}

/** 把原生对话框 Portal 到稳定宿主，并将 React 19 ref prop 转交给 dialog。 */
function AccessibleDialog({
  host,
  titleId,
  announcement,
  ref,
  onCancel,
  onClose,
  onChoose,
}: AccessibleDialogProps) {
  /** 把不可冒泡的原生 close 事件转换为明确的组件回调。 */
  function handleNativeClose(event: SyntheticEvent<HTMLDialogElement>): void {
    onClose(event.currentTarget)
  }

  return createPortal(
    <dialog
      ref={ref}
      className="accessible-dialog"
      aria-labelledby={titleId}
      data-testid="accessible-dialog"
      onCancel={onCancel}
      onClose={handleNativeClose}
    >
      <div className="accessible-dialog-body">
        <p className="accessible-dialog-eyebrow">发布确认</p>
        <h2 id={titleId} tabIndex={-1} autoFocus data-testid="dialog-title">
          确认发布课程公告
        </h2>
        <p className="accessible-dialog-lead">公告发布后会进入课程公告栏，请核对以下内容。</p>

        <dl className="accessible-dialog-summary">
          <div>
            <dt>公告名称</dt>
            <dd>{announcement.title}</dd>
          </div>
          <div>
            <dt>目标受众</dt>
            <dd>{announcement.audience}</dd>
          </div>
          <div>
            <dt>发布说明</dt>
            <dd>{announcement.summary}</dd>
          </div>
        </dl>

        <div className="accessible-dialog-actions">
          <button
            type="button"
            data-testid="continue-editing-button"
            onClick={() => onChoose('continue-editing')}
          >
            继续编辑
          </button>
          <button
            type="button"
            className="accessible-dialog-primary"
            data-testid="publish-button"
            onClick={() => onChoose('publish')}
          >
            确认发布
          </button>
        </div>
      </div>
    </dialog>,
    host,
  )
}

/** 展示原生 modal、Portal、Ref 转交、关闭结果和焦点恢复的完整协作。 */
export default function LabAccessibleDialogDemo() {
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null)
  const [isDialogRendered, setIsDialogRendered] = useState(false)
  const [cancelCount, setCancelCount] = useState(0)
  const [backgroundActionCount, setBackgroundActionCount] = useState(0)
  const [lastOutcome, setLastOutcome] = useState<CloseOutcome | null>(null)
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null)
  const dialogNodeRef = useRef<HTMLDialogElement | null>(null)
  const titleIdPrefix = useId()
  const dialogTitleId = `${titleIdPrefix}-title`
  const [connectDialog] = useState<RefCallback<HTMLDialogElement>>(() =>
    createDialogConnector(dialogNodeRef),
  )

  /** 请求 React 挂载 Dialog 子树，实际 modal 打开由节点提交后的 Callback Ref 完成。 */
  function handleOpenDialog(): void {
    setIsDialogRendered(true)
  }

  /** 记录 Escape 产生的可取消 close request，但允许浏览器继续完成关闭。 */
  function handleDialogCancel(): void {
    setCancelCount((count) => count + 1)
  }

  /** 在浏览器完成关闭和焦点恢复后记录结果，再撤下 React Dialog 子树。 */
  function handleDialogClose(dialog: HTMLDialogElement): void {
    setLastOutcome({
      result: dialog.returnValue as CloseResult,
      focusReturned: document.activeElement === triggerButtonRef.current,
    })
    setIsDialogRendered(false)
  }

  /** 通过当前 HTMLDialogElement 发起带 returnValue 的显式关闭。 */
  function handleDialogChoose(result: DialogResult): void {
    dialogNodeRef.current?.close(result)
  }

  /** 更新背景操作计数，供 modal 打开期间的 inert 行为验证。 */
  function handleBackgroundAction(): void {
    setBackgroundActionCount((count) => count + 1)
  }

  /** 恢复所有可观察记录，不改变稳定 Portal 宿主。 */
  function handleReset(): void {
    setCancelCount(0)
    setBackgroundActionCount(0)
    setLastOutcome(null)
  }

  return (
    <section
      className="accessible-dialog-demo"
      data-testid="accessible-dialog-demo"
      aria-labelledby={`${titleIdPrefix}-demo-title`}
    >
      <header className="accessible-dialog-heading">
        <p>Course announcement</p>
        <h2 id={`${titleIdPrefix}-demo-title`}>课程公告发布</h2>
        <span>确认公告内容，并保留最近一次关闭结果。</span>
      </header>

      <div className="accessible-dialog-workspace">
        <div className="accessible-dialog-announcement">
          <div>
            <span>待发布公告</span>
            <strong>{ANNOUNCEMENT.title}</strong>
            <p>{ANNOUNCEMENT.summary}</p>
          </div>
          <button
            ref={triggerButtonRef}
            type="button"
            className="accessible-dialog-trigger"
            data-testid="open-dialog-button"
            onClick={handleOpenDialog}
          >
            预览并发布
          </button>
        </div>

        <div className="accessible-dialog-toolbar">
          <button type="button" data-testid="background-action" onClick={handleBackgroundAction}>
            查看历史记录
          </button>
          <button type="button" data-testid="reset-dialog-demo" onClick={handleReset}>
            重置记录
          </button>
        </div>

        <div className="accessible-dialog-status" role="status" aria-live="polite">
          <div>
            <span>对话框</span>
            <strong data-testid="dialog-render-status">
              {isDialogRendered ? '已挂载' : '未挂载'}
            </strong>
          </div>
          <div>
            <span>上次结果</span>
            <strong data-testid="last-dialog-outcome">
              {lastOutcome ? formatOutcome(lastOutcome.result) : '尚未关闭'}
            </strong>
          </div>
          <div>
            <span>returnValue</span>
            <strong data-testid="last-return-value">
              {lastOutcome ? lastOutcome.result || '空字符串' : '尚无结果'}
            </strong>
          </div>
          <div>
            <span>焦点恢复</span>
            <strong data-testid="focus-returned-status">
              {lastOutcome ? (lastOutcome.focusReturned ? '已返回触发按钮' : '未返回') : '尚未验证'}
            </strong>
          </div>
          <div>
            <span>Escape 请求</span>
            <strong data-testid="cancel-count">{cancelCount}</strong>
          </div>
          <div>
            <span>背景操作</span>
            <strong data-testid="background-action-count">{backgroundActionCount}</strong>
          </div>
        </div>
      </div>

      <div
        ref={setPortalHost}
        className="accessible-dialog-host"
        data-testid="accessible-dialog-host"
      />

      {portalHost && isDialogRendered ? (
        <AccessibleDialog
          ref={connectDialog}
          host={portalHost}
          titleId={dialogTitleId}
          announcement={ANNOUNCEMENT}
          onCancel={handleDialogCancel}
          onClose={handleDialogClose}
          onChoose={handleDialogChoose}
        />
      ) : null}
    </section>
  )
}
