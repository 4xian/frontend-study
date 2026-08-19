/** 记录退出特殊资源路径的脚本是否在当前客户端路径中执行。 */
{
  const executions = (window.__ASYNC_SCRIPT_RESOURCE_EXECUTIONS__ ??= {
    v1: 0,
    v2: 0,
    eventOptOut: 0,
    events: [],
  })

  executions.eventOptOut += 1
  executions.events.push(`event-opt-out#${executions.eventOptOut}`)
  window.dispatchEvent(
    new CustomEvent('react-course:async-script-resource-executed', {
      detail: { version: 'event-opt-out', count: executions.eventOptOut },
    }),
  )
}
