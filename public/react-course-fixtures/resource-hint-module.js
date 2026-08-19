window.__RESOURCE_HINT_MODULE_RUNS__ = (window.__RESOURCE_HINT_MODULE_RUNS__ ?? 0) + 1
window.dispatchEvent(new CustomEvent('react-course:resource-hint-executed'))

export const resourceHintModuleReady = true
