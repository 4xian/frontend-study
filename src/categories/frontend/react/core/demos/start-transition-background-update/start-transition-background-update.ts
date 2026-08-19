import { startTransition } from 'react'

/** 在 Hook 外把已有 State setter 包装成一个 standalone Transition 更新。 */
export function startBackgroundUpdate(update: () => void): void {
  startTransition(update)
}
