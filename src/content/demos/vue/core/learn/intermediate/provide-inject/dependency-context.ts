import type { InjectionKey, Ref } from 'vue'

export interface DependencyContext {
  owner: string
  mode: Readonly<Ref<string>>
  revision: Readonly<Ref<number>>
  toggleMode: () => void
}

export const dependencyContextKey: InjectionKey<DependencyContext> = Symbol('dependency-context')
export const optionalHintKey: InjectionKey<string> = Symbol('optional-hint')
