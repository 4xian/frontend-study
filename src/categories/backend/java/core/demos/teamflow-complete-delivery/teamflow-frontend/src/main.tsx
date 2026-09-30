/** @jsxImportSource react */
import { useState } from 'react'
import type { FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type Project = {
  id: string
  name: string
}

type ProjectPage = {
  items: Project[]
  nextPageToken: string | null
}

type User = {
  id: string
  displayName: string
  email: string
}

type Team = {
  id: string
  name: string
}

type Page<T> = {
  items: T[]
  nextPageToken: string | null
}

type MeResponse = {
  userId: string
  username: string
  authorities: string[]
}

type TokenResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

type TaskResponse = {
  id: string
  projectId: string
  title: string
  dueAt?: string
  assignee?: string
  status: string
  version: number
}

type DeliveryResponse = {
  eventId: string
  outboxStatus: string
  attempts: number
  notificationCount: number
}

const apiBaseUrl = import.meta.env.VITE_TEAMFLOW_API_BASE_URL ?? 'http://127.0.0.1:18080'

/** 读取 JSON；失败时保留服务端状态，便于联调定位。 */
async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return (await response.json()) as T
}

/** 提供登录、目录浏览、任务操作和交付状态的真实联调路径。 */
function TeamFlowApp() {
  const [token, setToken] = useState('')
  const [me, setMe] = useState<MeResponse | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [selectedProject, setSelectedProject] = useState('PRJ-1')
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null)
  const [title, setTitle] = useState('完成结课联调')
  const [delivery, setDelivery] = useState<DeliveryResponse | null>(null)
  const [result, setResult] = useState('尚未连接')

  /** 为受保护请求附加当前 Bearer token。 */
  function authHeaders(): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : { Authorization: '' }
  }

  /** 用固定本地用户换取短期 Bearer token。 */
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'Passw0rd!Pass' }),
      })
      const body = await readJson<TokenResponse>(response)
      setToken(body.accessToken)
      setResult(`已认证，有效期 ${body.expiresIn} 秒`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '认证失败')
    }
  }

  /** 读取当前用户摘要，确认 JWT claims 已映射到服务端权限。 */
  async function loadMe() {
    try {
      const body = await readJson<MeResponse>(
        await fetch(`${apiBaseUrl}/api/v1/me`, { headers: authHeaders() }),
      )
      setMe(body)
      setResult(`当前用户 ${body.username}`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '用户信息加载失败')
    }
  }

  /** 读取用户目录第一页。 */
  async function loadUsers() {
    try {
      const body = await readJson<Page<User>>(
        await fetch(`${apiBaseUrl}/api/v1/users?pageSize=20`, { headers: authHeaders() }),
      )
      setUsers(body.items)
      setResult(`已加载 ${body.items.length} 个用户`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '用户加载失败')
    }
  }

  /** 读取团队目录第一页。 */
  async function loadTeams() {
    try {
      const body = await readJson<Page<Team>>(
        await fetch(`${apiBaseUrl}/api/v1/teams?pageSize=20`, { headers: authHeaders() }),
      )
      setTeams(body.items)
      setResult(`已加载 ${body.items.length} 个团队`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '团队加载失败')
    }
  }

  /** 使用既有 pageToken 响应合同读取第一页项目。 */
  async function loadProjects() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/projects?pageSize=20`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await readJson<ProjectPage>(response)
      setProjects(body.items)
      if (body.items[0]) {
        setSelectedProject(body.items[0].id)
      }
      setResult(`已加载 ${body.items.length} 个项目`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '项目加载失败')
    }
  }

  /** 读取当前项目的任务列表。 */
  async function loadTasks() {
    try {
      const body = await readJson<Page<TaskResponse>>(
        await fetch(`${apiBaseUrl}/api/v1/projects/${selectedProject}/tasks?pageSize=20`, {
          headers: authHeaders(),
        }),
      )
      setTasks(body.items)
      setSelectedTask(body.items[0] ?? null)
      setResult(`已加载 ${body.items.length} 个任务`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '任务加载失败')
    }
  }

  /** 使用唯一幂等键创建一项 TeamFlow 任务。 */
  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/projects/${selectedProject}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `frontend-${crypto.randomUUID()}`,
        },
        body: JSON.stringify({
          title,
          dueAt: '2026-09-01T18:00:00+08:00',
          assignee: 'demo',
        }),
      })
      const body = await readJson<TaskResponse>(response)
      setTasks((current) => [body, ...current.filter((task) => task.id !== body.id)])
      setSelectedTask(body)
      setResult(`${body.id} · ${body.status}`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '任务创建失败')
    }
  }

  /** 以当前版本完成选中的任务并触发 outbox 通知。 */
  async function completeTask() {
    if (!selectedTask) return
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/projects/${selectedTask.projectId}/tasks/${selectedTask.id}`,
        {
          method: 'PUT',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: selectedTask.version, status: 'DONE' }),
        },
      )
      const body = await readJson<TaskResponse>(response)
      setSelectedTask(body)
      setTasks((current) => current.map((task) => (task.id === body.id ? body : task)))
      setResult(`${body.id} · ${body.status}`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '任务完成失败')
    }
  }

  /** 查询任务的 outbox、发布和通知状态。 */
  async function loadDelivery() {
    if (!selectedTask) return
    try {
      const body = await readJson<DeliveryResponse>(
        await fetch(
          `${apiBaseUrl}/api/v1/projects/${selectedTask.projectId}/tasks/${selectedTask.id}/delivery`,
          { headers: authHeaders() },
        ),
      )
      setDelivery(body)
      setResult(`${body.outboxStatus} · 通知 ${body.notificationCount}`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '交付状态加载失败')
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">TEAMFLOW</p>
          <h1>交付联调台</h1>
        </div>
        <output className="status">{result}</output>
      </header>

      <section className="workspace">
        <form className="panel" onSubmit={login}>
          <h2>认证</h2>
          <label>
            用户
            <input value="demo" readOnly />
          </label>
          <label>
            密码
            <input value="Passw0rd!Pass" type="password" readOnly />
          </label>
          <button type="submit">获取令牌</button>
          <button type="button" onClick={loadMe} disabled={!token}>
            当前用户
          </button>
          {me && (
            <p className="muted">
              {me.userId} · {me.authorities.join(', ')}
            </p>
          )}
        </form>

        <section className="panel">
          <div className="panel-heading">
            <h2>用户与团队</h2>
            <div className="actions">
              <button type="button" onClick={loadUsers} disabled={!token}>
                用户
              </button>
              <button type="button" onClick={loadTeams} disabled={!token}>
                团队
              </button>
            </div>
          </div>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <strong>{user.displayName}</strong>
                <span>{user.email}</span>
              </li>
            ))}
            {teams.map((team) => (
              <li key={team.id}>
                <strong>{team.id}</strong>
                <span>{team.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>项目</h2>
            <button type="button" onClick={loadProjects} disabled={!token}>
              刷新
            </button>
          </div>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <strong>{project.id}</strong>
                <span>{project.name}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={loadTasks} disabled={!token || !selectedProject}>
            查看任务
          </button>
        </section>

        <form className="panel" onSubmit={createTask}>
          <h2>新任务</h2>
          <label>
            项目
            <select
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
            >
              {(projects.length > 0 ? projects : [{ id: 'PRJ-1', name: 'TeamFlow delivery' }]).map(
                (project) => (
                  <option key={project.id} value={project.id}>
                    {project.id} · {project.name}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            标题
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <button type="submit" disabled={!token || !title.trim()}>
            创建任务
          </button>
        </form>

        <section className="panel wide">
          <div className="panel-heading">
            <h2>任务与交付</h2>
            <div className="actions">
              <button
                type="button"
                onClick={completeTask}
                disabled={!selectedTask || selectedTask.status === 'DONE'}
              >
                完成任务
              </button>
              <button type="button" onClick={loadDelivery} disabled={!selectedTask}>
                刷新交付
              </button>
            </div>
          </div>
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={selectedTask?.id === task.id ? 'selected' : ''}>
                <button type="button" className="link-button" onClick={() => setSelectedTask(task)}>
                  {task.id}
                </button>
                <span>
                  {task.title} · {task.status} · v{task.version}
                </span>
              </li>
            ))}
          </ul>
          {delivery && (
            <p className="muted">
              event {delivery.eventId} · {delivery.outboxStatus} · 尝试 {delivery.attempts} · 通知{' '}
              {delivery.notificationCount}
            </p>
          )}
        </section>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<TeamFlowApp />)
