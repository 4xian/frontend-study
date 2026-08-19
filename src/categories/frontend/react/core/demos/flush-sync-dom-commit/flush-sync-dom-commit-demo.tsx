import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import './flush-sync-dom-commit-demo.css'

type CommitMode = 'default' | 'flush-sync'

type DomSnapshot = Readonly<{
  version: number | null
  text: string
}>

type CommitObservation = Readonly<{
  mode: CommitMode
  requestedVersion: number
  stateSnapshot: number
  domSnapshot: DomSnapshot
}>

type SynchronousInspector = (requestUpdate: () => void) => DomSnapshot

/** 读取第三方同步回调结束时可见的 DOM 版本与文本。 */
function readArticleSnapshot(article: HTMLElement | null): DomSnapshot {
  if (!article) return { version: null, text: 'DOM 尚未建立' }

  const version = Number(article.dataset.version)
  return {
    version: Number.isFinite(version) ? version : null,
    text: article.textContent?.replace(/\s+/g, ' ').trim() ?? '',
  }
}

/** 模拟要求 callback 返回前立即读取 DOM 的浏览器 API 或第三方控件。 */
function createSynchronousInspector(article: HTMLElement | null): SynchronousInspector {
  return (requestUpdate) => {
    requestUpdate()
    return readArticleSnapshot(article)
  }
}

/** 对比默认批处理与 flushSync 返回点上的 DOM 提交结果。 */
export default function FlushSyncDomCommitDemo() {
  const [version, setVersion] = useState(0)
  const [observation, setObservation] = useState<CommitObservation | null>(null)
  const articleRef = useRef<HTMLElement>(null)

  /** 使用默认更新，记录同步外部读取拿到的旧 DOM。 */
  function runDefaultUpdate(): void {
    const requestedVersion = version + 1
    const inspect = createSynchronousInspector(articleRef.current)
    const domSnapshot = inspect(() => setVersion(requestedVersion))

    setObservation({
      mode: 'default',
      requestedVersion,
      stateSnapshot: version,
      domSnapshot,
    })
  }

  /** 在外部同步回调内提交更新，使返回后的 DOM 读取命中目标版本。 */
  function runFlushSyncUpdate(): void {
    const requestedVersion = version + 1
    const inspect = createSynchronousInspector(articleRef.current)
    const domSnapshot = inspect(() => {
      flushSync(() => setVersion(requestedVersion))
    })

    setObservation({
      mode: 'flush-sync',
      requestedVersion,
      stateSnapshot: version,
      domSnapshot,
    })
  }

  /** 恢复统一起点，下一次对照从 DOM 版本 0 开始。 */
  function resetExperiment(): void {
    setVersion(0)
    setObservation(null)
  }

  const readMatchesRequest = observation?.domSnapshot.version === observation?.requestedVersion
  const modeLabel = observation?.mode === 'flush-sync' ? 'flushSync 回调' : '默认更新回调'

  return (
    <section className="flush-sync-demo" data-testid="flush-sync-dom-commit-demo">
      <header className="flush-sync-heading">
        <p>Synchronous integration boundary</p>
        <h2>外部回调返回时读取已提交 DOM</h2>
        <span>同一个同步检查器分别执行默认更新与 flushSync 更新。</span>
      </header>

      <div className="flush-sync-body">
        <section className="flush-sync-controls" aria-label="提交方式">
          <div>
            <span>当前实验起点</span>
            <strong data-testid="flush-sync-current-version">DOM 版本 {version}</strong>
          </div>
          <div className="flush-sync-actions">
            <button type="button" data-action="default" onClick={runDefaultUpdate}>
              默认更新后立即读取
            </button>
            <button type="button" data-action="flush-sync" onClick={runFlushSyncUpdate}>
              flushSync 后立即读取
            </button>
            <button
              type="button"
              className="is-quiet"
              data-action="reset"
              onClick={resetExperiment}
              disabled={version === 0 && observation === null}
            >
              重置实验
            </button>
          </div>
        </section>

        <article
          ref={articleRef}
          className="flush-sync-article"
          data-testid="flush-sync-article"
          data-version={version}
        >
          <span>外部系统要检查的真实 DOM</span>
          <h3>{`文档版本 ${version}`}</h3>
          <p>{`当前已提交 ${version + 1} 条内容记录。`}</p>
        </article>

        <section className="flush-sync-observation" aria-live="polite">
          <div className="flush-sync-section-heading">
            <div>
              <span>Callback observation</span>
              <h3>{observation ? modeLabel : '尚未运行同步检查器'}</h3>
            </div>
            <strong
              className={readMatchesRequest ? 'is-match' : 'is-stale'}
              data-testid="flush-sync-read-result"
            >
              {observation
                ? readMatchesRequest
                  ? '读取命中目标版本'
                  : '读取仍是旧版本'
                : '等待观察'}
            </strong>
          </div>

          <dl className="flush-sync-facts">
            <div>
              <dt>请求版本</dt>
              <dd data-testid="flush-sync-requested-version">
                {observation?.requestedVersion ?? '-'}
              </dd>
            </div>
            <div>
              <dt>handler State 快照</dt>
              <dd data-testid="flush-sync-state-snapshot">{observation?.stateSnapshot ?? '-'}</dd>
            </div>
            <div>
              <dt>callback 末尾 DOM</dt>
              <dd data-testid="flush-sync-callback-dom-version">
                {observation?.domSnapshot.version ?? '-'}
              </dd>
            </div>
            <div>
              <dt>当前已提交 DOM</dt>
              <dd data-testid="flush-sync-committed-version">{version}</dd>
            </div>
          </dl>

          <p className="flush-sync-captured-text" data-testid="flush-sync-captured-text">
            {observation
              ? `同步读取文本：${observation.domSnapshot.text}`
              : '运行任一方式后，这里保存 callback 返回前读到的文本。'}
          </p>
        </section>

        <dl className="flush-sync-boundaries">
          <div>
            <dt>返回点保证</dt>
            <dd>只有 flushSync 路径保证 callback 内的更新已经反映到 DOM。</dd>
          </div>
          <div>
            <dt>State 快照</dt>
            <dd>当前 handler 的变量仍属于创建它的 render。</dd>
          </div>
          <div>
            <dt>浏览器绘制</dt>
            <dd>同步 commit 不承诺屏幕已经完成一个独立 paint。</dd>
          </div>
          <div>
            <dt>扩大影响</dt>
            <dd>必要时还可能处理 callback 外的 pending 工作。</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
