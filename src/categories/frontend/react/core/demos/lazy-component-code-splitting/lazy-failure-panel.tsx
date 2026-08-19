/** 在模块初始化期间制造确定性失败，使真实的动态 import Promise 进入 rejected 状态。 */
function failModuleEvaluation(): never {
  throw new Error('按需报告模块加载失败')
}

const moduleEvaluationFailure = failModuleEvaluation()

/** 模块求值成功时本应提供给 lazy 的默认导出；失败演示不会执行到此组件。 */
export default function LazyFailurePanel() {
  return moduleEvaluationFailure
}
