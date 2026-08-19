export type PendingActionGate<Value> = Readonly<{
  promise: Promise<Value>
  resolve: (value: Value) => void
}>

/** 创建由用户交互显式推进的一次性本地 deferred gate。 */
export function createPendingActionGate<Value>(): PendingActionGate<Value> {
  let settlePromise!: (value: Value) => void
  let isResolved = false
  const promise = new Promise<Value>((resolve) => {
    settlePromise = resolve
  })

  /** 只在首次调用时兑现当前 gate。 */
  function resolve(value: Value): void {
    if (isResolved) return
    isResolved = true
    settlePromise(value)
  }

  return { promise, resolve }
}
