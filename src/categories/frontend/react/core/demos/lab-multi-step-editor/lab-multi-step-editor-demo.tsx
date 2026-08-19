import { useState } from 'react'
import { ARTICLE_TEMPLATES, type ArticleTemplate } from './editor-data'
import { EditorWorkspace } from './editor-workspace'
import './lab-multi-step-editor-demo.css'

type EditorSession = {
  readonly templateId: ArticleTemplate['id']
  readonly revision: number
}

type TemplateToolbarProps = {
  readonly currentTemplateId: ArticleTemplate['id']
  readonly onTemplateChange: (nextTemplateId: ArticleTemplate['id']) => void
  readonly onReload: () => void
}

/** 渲染编辑器身份选择和显式重新加载命令。 */
function TemplateToolbar({ currentTemplateId, onTemplateChange, onReload }: TemplateToolbarProps) {
  return (
    <section className="multi-step-editor-toolbar" aria-labelledby="editor-template-heading">
      <div>
        <p>编辑对象</p>
        <h2 id="editor-template-heading">选择文章模板</h2>
        <span>切换或重新加载模板会放弃当前编辑。</span>
      </div>
      <div className="multi-step-editor-template-actions">
        {ARTICLE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            aria-pressed={template.id === currentTemplateId}
            onClick={() => onTemplateChange(template.id)}
          >
            {template.label}
          </button>
        ))}
        <button type="button" className="is-reload" onClick={onReload}>
          重新加载当前模板
        </button>
      </div>
    </section>
  )
}

/** 组合外层模板会话和以 key 标识的多步骤编辑器。 */
export default function LabMultiStepEditorDemo() {
  const [session, setSession] = useState<EditorSession>({
    templateId: 'blank',
    revision: 0,
  })
  const currentTemplate = ARTICLE_TEMPLATES.find((template) => template.id === session.templateId)!

  /** 切换业务模板，并为目标模板建立新的编辑会话。 */
  function handleTemplateChange(nextTemplateId: ArticleTemplate['id']) {
    setSession((previous) =>
      previous.templateId === nextTemplateId
        ? previous
        : { templateId: nextTemplateId, revision: 0 },
    )
  }

  /** 递增明确的会话版本，重新加载当前模板初值。 */
  function handleReload() {
    setSession((previous) => ({
      ...previous,
      revision: previous.revision + 1,
    }))
  }

  return (
    <div className="multi-step-editor-demo">
      <header className="multi-step-editor-demo-heading">
        <p>文章工作区</p>
        <h2>多步骤编辑器</h2>
        <span>填写基本信息与发布信息，复核后完成编辑。</span>
      </header>

      <TemplateToolbar
        currentTemplateId={session.templateId}
        onTemplateChange={handleTemplateChange}
        onReload={handleReload}
      />

      <EditorWorkspace
        key={`${session.templateId}:${session.revision}`}
        templateLabel={currentTemplate.label}
        initialDraft={currentTemplate.initialDraft}
      />
    </div>
  )
}
