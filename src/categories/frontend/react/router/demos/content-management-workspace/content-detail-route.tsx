import {
  Form,
  Link,
  data,
  isRouteErrorResponse,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
  useRevalidator,
  useRouteError,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type UIMatch,
} from 'react-router'

import {
  workspaceUserContext,
  type ContentRecord,
  type ContentRepository,
} from './content-management-workspace-data'

type ContentDetailData = {
  content: ContentRecord
  loaderCalls: number
}

type ContentActionData = {
  ok: false
  errors?: { title?: string; summary?: string }
  formError?: string
}

type ContentDetailMatch = UIMatch<ContentDetailData>

/** 提供可取消的请求延时，呈现 navigation、fetcher 与 revalidator 状态。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在请求取消时释放详情计时器。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 从表单字段中读取经过裁剪的字符串。 */
function readText(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

/** 创建共享仓库对应的 lazy 详情 route module。 */
export function defaultModule(repository: ContentRepository) {
  let loaderCalls = 0

  /** 读取详情记录，并区分永久缺失与一次性服务故障。 */
  async function loader({ params, request }: LoaderFunctionArgs): Promise<ContentDetailData> {
    loaderCalls += 1
    await waitForRequest(request.signal, 380)
    const content = repository.get(params.contentId ?? '')

    if (!content) {
      throw data('未找到该内容', { status: 404, statusText: 'Not Found' })
    }

    const url = new URL(request.url)
    if (url.searchParams.get('fail') === 'once' && repository.consumeTemporaryFailure()) {
      throw data('内容服务暂时不可用', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    }

    return { content, loaderCalls }
  }

  /** 根据 intent 保存内容或切换发布状态。 */
  async function action({ context, params, request }: ActionFunctionArgs) {
    context.get(workspaceUserContext)
    const content = repository.get(params.contentId ?? '')
    if (!content) throw data('未找到该内容', { status: 404, statusText: 'Not Found' })

    const formData = await request.formData()
    const intent = formData.get('intent')
    await waitForRequest(request.signal, 520)

    if (intent === 'toggle-publish') {
      const updated = repository.toggleStatus(content.id)
      return { ok: true, status: updated.status }
    }

    if (intent === 'save') {
      const title = readText(formData, 'title')
      const summary = readText(formData, 'summary')
      const errors = {
        ...(title ? {} : { title: '请输入标题' }),
        ...(summary ? {} : { summary: '请输入摘要' }),
      }

      if (Object.keys(errors).length > 0) {
        return data<ContentActionData>({ ok: false, errors }, { status: 400 })
      }

      repository.update(content.id, { title, summary })
      return redirect(`/workspace/content/${content.id}`)
    }

    return data<ContentActionData>({ ok: false, formError: '不支持的内容操作' }, { status: 400 })
  }

  /** 呈现详情编辑、普通 Form pending 与独立发布 Fetcher。 */
  function Component() {
    const data = useLoaderData() as ContentDetailData
    const actionData = useActionData() as ContentActionData | undefined
    const navigation = useNavigation()
    const publishFetcher = useFetcher<{ ok: true; status: string }>()
    const location = useLocation()
    const isSaving = navigation.state !== 'idle' && navigation.formData?.get('intent') === 'save'
    const isPublishing = publishFetcher.state !== 'idle'

    return (
      <section className="content-workspace-panel" data-testid="content-workspace-detail">
        <div className="content-workspace-panel-heading">
          <div>
            <p>lazy content detail route</p>
            <h3>{data.content.title}</h3>
          </div>
          <Link to="/workspace/content">返回列表</Link>
        </div>

        <dl className="content-workspace-detail-meta">
          <div>
            <dt>内容 ID</dt>
            <dd>{data.content.id}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd data-testid="content-workspace-detail-status">
              {data.content.status === 'published' ? '已发布' : '草稿'}
            </dd>
          </div>
          <div>
            <dt>详情 loader</dt>
            <dd>{data.loaderCalls} 次</dd>
          </div>
          <div>
            <dt>location key</dt>
            <dd data-testid="content-workspace-location-key">{location.key}</dd>
          </div>
        </dl>

        <Form method="post" className="content-workspace-edit-form">
          <input type="hidden" name="intent" value="save" />
          <label htmlFor="content-workspace-title">标题</label>
          <input
            id="content-workspace-title"
            name="title"
            defaultValue={data.content.title}
            aria-invalid={Boolean(actionData?.errors?.title)}
          />
          {actionData?.errors?.title ? <span role="alert">{actionData.errors.title}</span> : null}
          <label htmlFor="content-workspace-summary">摘要</label>
          <textarea
            id="content-workspace-summary"
            name="summary"
            defaultValue={data.content.summary}
            rows={4}
            aria-invalid={Boolean(actionData?.errors?.summary)}
          />
          {actionData?.errors?.summary ? (
            <span role="alert">{actionData.errors.summary}</span>
          ) : null}
          {actionData?.formError ? <p role="alert">{actionData.formError}</p> : null}
          <button type="submit" disabled={isSaving}>
            {isSaving ? '保存中' : '保存内容'}
          </button>
        </Form>

        <publishFetcher.Form method="post" className="content-workspace-publish-form">
          <input type="hidden" name="intent" value="toggle-publish" />
          <div>
            <strong>行内发布</strong>
            <span>Fetcher 不改变当前地址，成功后由 loader 自动同步详情和根统计。</span>
          </div>
          <button
            type="submit"
            disabled={isPublishing}
            data-testid="content-workspace-publish-button"
          >
            {isPublishing
              ? '处理中'
              : data.content.status === 'published'
                ? '撤回发布'
                : '发布内容'}
          </button>
          <small data-testid="content-workspace-fetcher-state">
            fetcher: {publishFetcher.state}
          </small>
        </publishFetcher.Form>
      </section>
    )
  }

  /** 处理详情 route 的 404、503 和未知错误，并提供匹配的恢复动作。 */
  function ErrorBoundary() {
    const error = useRouteError()
    const revalidator = useRevalidator()
    const status = isRouteErrorResponse(error) ? error.status : 500
    const message = isRouteErrorResponse(error) ? String(error.data) : '详情加载发生未知错误。'
    const canRetry = status === 503

    /** 仅对临时 loader 故障重新验证当前详情。 */
    function handleRetry() {
      void revalidator.revalidate()
    }

    return (
      <section
        className="content-workspace-error"
        role="alert"
        aria-busy={revalidator.state === 'loading'}
        data-testid="content-workspace-detail-error"
      >
        <p>Nearest detail ErrorBoundary</p>
        <h3>
          {status === 404 ? '没有找到内容' : status === 503 ? '内容服务暂时不可用' : '详情无法显示'}
        </h3>
        <span>{message}</span>
        <strong data-testid="content-workspace-error-status">HTTP {status}</strong>
        <div>
          {canRetry ? (
            <button type="button" onClick={handleRetry} disabled={revalidator.state === 'loading'}>
              {revalidator.state === 'loading' ? '重试中' : '重试当前详情'}
            </button>
          ) : null}
          <Link to="/workspace/content">返回内容列表</Link>
        </div>
      </section>
    )
  }

  return {
    loader,
    action,
    Component,
    ErrorBoundary,
    handle: {
      /** 使用详情 loader data 生成动态面包屑，并为错误状态保留回退文本。 */
      breadcrumb(match: ContentDetailMatch) {
        return match.loaderData?.content.title ?? '内容详情'
      },
    },
  }
}
