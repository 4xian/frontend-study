import { useId } from 'react'
import type { ChangeEvent } from 'react'

type RegistrationFieldsProps = {
  studentName: string
  studentEmail: string
  onStudentNameChange: (nextName: string) => void
  onStudentEmailChange: (nextEmail: string) => void
}

/** 渲染受控姓名与邮箱字段，并建立标签和帮助文本关联。 */
export function RegistrationFields({
  studentName,
  studentEmail,
  onStudentNameChange,
  onStudentEmailChange,
}: RegistrationFieldsProps) {
  const idPrefix = useId()
  const studentNameId = `${idPrefix}-student-name`
  const studentNameHelpId = `${idPrefix}-student-name-help`
  const studentEmailId = `${idPrefix}-student-email`
  const studentEmailHelpId = `${idPrefix}-student-email-help`

  /** 把姓名输入框的最新字符串交给根组件。 */
  function handleStudentNameChange(event: ChangeEvent<HTMLInputElement>) {
    onStudentNameChange(event.currentTarget.value)
  }

  /** 把邮箱输入框的最新字符串交给根组件。 */
  function handleStudentEmailChange(event: ChangeEvent<HTMLInputElement>) {
    onStudentEmailChange(event.currentTarget.value)
  }

  return (
    <fieldset className="course-registration-details">
      <legend>填写报名信息</legend>

      <div className="course-registration-field">
        <label htmlFor={studentNameId}>姓名</label>
        <input
          id={studentNameId}
          name="studentName"
          value={studentName}
          onChange={handleStudentNameChange}
          aria-describedby={studentNameHelpId}
          autoComplete="name"
          required
        />
        <p id={studentNameHelpId}>填写报名人姓名，此字段不能为空。</p>
      </div>

      <div className="course-registration-field">
        <label htmlFor={studentEmailId}>邮箱</label>
        <input
          id={studentEmailId}
          name="studentEmail"
          type="email"
          value={studentEmail}
          onChange={handleStudentEmailChange}
          aria-describedby={studentEmailHelpId}
          autoComplete="email"
          required
        />
        <p id={studentEmailHelpId}>邮箱必须符合浏览器支持的 email 格式。</p>
      </div>
    </fieldset>
  )
}
