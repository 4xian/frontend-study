import { useLoaderData } from 'react-router'
import type { LoaderFunctionArgs } from 'react-router'

type ReportsData = {
  score: number
  moduleStamp: string
}

const moduleStamp = new Date().toISOString()

/** 暂停报告 loader，保留可观察的导航等待窗口。 */
function waitForReports(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在导航取消时释放报告计时器。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Navigation aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, 650)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 返回只属于质量报告 route module 的数据。 */
export async function loader({ request }: LoaderFunctionArgs): Promise<ReportsData> {
  await waitForReports(request.signal)
  return {
    score: new URL(request.url).searchParams.get('refresh') ? 96 : 94,
    moduleStamp,
  }
}

/** 呈现由 lazy route module 提供的质量报告页面。 */
export function Component() {
  const data = useLoaderData<typeof loader>()

  return (
    <article className="lazy-routes-card" data-testid="lazy-routes-reports">
      <p>Lazy route module</p>
      <h3>质量报告</h3>
      <span>组件和 loader 来自只在导航时解析的 route module。</span>
      <dl>
        <div>
          <dt>质量分</dt>
          <dd>{data.score}</dd>
        </div>
        <div>
          <dt>模块解析时间</dt>
          <dd>{data.moduleStamp}</dd>
        </div>
      </dl>
    </article>
  )
}
