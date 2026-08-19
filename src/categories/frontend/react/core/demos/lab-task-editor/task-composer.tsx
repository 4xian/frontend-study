type TaskComposerProps = {
  draft: string
  canAdd: boolean
  onDraftChange: (value: string) => void
  onAdd: () => void
}

/** 接收任务草稿，并把添加动作交回清单拥有者。 */
export function TaskComposer({ draft, canAdd, onDraftChange, onAdd }: TaskComposerProps) {
  return (
    <section className="task-editor-composer" aria-labelledby="task-editor-composer-title">
      <div>
        <p>新增任务</p>
        <h3 id="task-editor-composer-title">把下一项工作加入清单</h3>
      </div>

      <label>
        <span>新任务</span>
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.currentTarget.value)}
          placeholder="例如：整理学习笔记"
        />
      </label>

      <button type="button" data-action="add" disabled={!canAdd} onClick={onAdd}>
        添加任务
      </button>
    </section>
  )
}
