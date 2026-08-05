import { getActivePinia, setActivePinia } from 'pinia'

/** 执行 Demo Pinia 操作，并在同步调用结束后恢复原 active Pinia。 */
export function preserveActivePinia<T>(operation: () => T): T {
  const activePinia = getActivePinia()

  try {
    return operation()
  } finally {
    setActivePinia(activePinia)
  }
}
