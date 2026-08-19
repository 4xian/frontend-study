/** 在隔离文档中记录 v2 脚本执行，并派发可观察事件。 */
{
  const executions = (window.__ASYNC_SCRIPT_RESOURCE_EXECUTIONS__ ??= {
    v1: 0,
    v2: 0,
    eventOptOut: 0,
    events: [],
  })

  executions.v2 += 1
  executions.events.push(`v2#${executions.v2}`)
  window.dispatchEvent(
    new CustomEvent('react-course:async-script-resource-executed', {
      detail: { version: 'v2', count: executions.v2 },
    }),
  )
}
