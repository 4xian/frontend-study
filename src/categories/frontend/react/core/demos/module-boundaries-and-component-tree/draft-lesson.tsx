/** 以默认导出暴露尚未进入当前 render 的草稿课程组件。 */
export default function DraftLesson() {
  return (
    <section className="module-tree-current">
      <span>本次 render 选择</span>
      <strong>DraftLesson</strong>
    </section>
  )
}
