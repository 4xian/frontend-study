import {
  configureStore,
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './create-entity-adapter-demo.css'

type Article = {
  id: string
  title: string
  score: number
  published: boolean
}

type ArticleState = EntityState<Article, string> & {
  loading: 'idle' | 'pending'
  selectedId: string
  actionCount: number
}

const articlesAdapter = createEntityAdapter<Article>({
  sortComparer: (left, right) => right.score - left.score || left.title.localeCompare(right.title),
})

/** 创建一份可重复挂载的适配器初始状态。 */
function createInitialArticleState(): ArticleState {
  return articlesAdapter.getInitialState({
    loading: 'idle',
    selectedId: 'article-a',
    actionCount: 0,
  })
}

const initialArticleState = articlesAdapter.setAll(createInitialArticleState(), [
  { id: 'article-a', title: '状态边界', score: 92, published: true },
  { id: 'article-b', title: 'Selector 组合', score: 76, published: false },
  { id: 'article-c', title: '异步流程', score: 88, published: true },
])

const articlesSlice = createSlice({
  name: 'entityAdapterArticles',
  initialState: initialArticleState,
  reducers: {
    /** 新增文章并让 adapter 重新维护排序索引。 */
    articleAdded: (state, action: PayloadAction<Article>) => {
      articlesAdapter.addOne(state, action.payload)
      state.selectedId = action.payload.id
      state.actionCount += 1
    },
    /** 选择一个存在的文章实体，不改动实体集合。 */
    articleSelected: (state, action: PayloadAction<string>) => {
      if (state.entities[action.payload]) state.selectedId = action.payload
    },
    /** 按 ID 浅更新文章，并观察评分变化带来的排序变化。 */
    articleUpdated: (state, action: PayloadAction<{ id: string; changes: Partial<Article> }>) => {
      articlesAdapter.updateOne(state, action.payload)
      state.actionCount += 1
    },
    /** 删除文章并把选择移动到当前排序列表的第一项。 */
    articleRemoved: (state, action: PayloadAction<string>) => {
      articlesAdapter.removeOne(state, action.payload)
      if (state.selectedId === action.payload) state.selectedId = state.ids[0] ?? ''
      state.actionCount += 1
    },
    /** 用一组新文章替换集合，并保留适配器排序规则。 */
    articlesReplaced: (state, action: PayloadAction<Article[]>) => {
      articlesAdapter.setAll(state, action.payload)
      state.selectedId = state.ids[0] ?? ''
      state.actionCount += 1
    },
    /** 切换集合之外的加载状态字段。 */
    loadingChanged: (state) => {
      state.loading = state.loading === 'idle' ? 'pending' : 'idle'
      state.actionCount += 1
    },
    /** 恢复文章集合、排序和额外字段。 */
    reset: () => initialArticleState,
  },
})

/** 为 Demo 创建独立 store，避免多个挂载实例共享状态。 */
function createDemoStore() {
  return configureStore({ reducer: { articles: articlesSlice.reducer } })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

const articleSelectors = articlesAdapter.getSelectors<RootState>((state) => state.articles)

/** 读取当前选中的文章 ID。 */
const selectSelectedId = (state: RootState): string => state.articles.selectedId

/** 根据 selectedId 调用适配器生成的 selectById 读取详情。 */
const selectSelectedArticle = (state: RootState): Article | undefined =>
  articleSelectors.selectById(state, state.articles.selectedId)

/** 展示排序后的实体数量、选择详情和操作次数。 */
function CreateEntityAdapterPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const articles = useAppSelector(articleSelectors.selectAll)
  const entities = useAppSelector(articleSelectors.selectEntities)
  const ids = useAppSelector(articleSelectors.selectIds)
  const total = useAppSelector(articleSelectors.selectTotal)
  const selectedId = useAppSelector(selectSelectedId)
  const selectedArticle = useAppSelector(selectSelectedArticle)
  const loading = useAppSelector((state) => state.articles.loading)
  const actionCount = useAppSelector((state) => state.articles.actionCount)

  /** 让新文章成为当前选择，并观察 adapter 的新增与排序。 */
  function addArticle(): void {
    dispatch(
      articlesSlice.actions.articleAdded({
        id: 'article-d',
        title: '适配器实践',
        score: 84,
        published: false,
      }),
    )
  }

  /** 提高当前文章评分，触发排序 ID 的变化。 */
  function boostSelectedArticle(): void {
    if (selectedArticle) {
      dispatch(
        articlesSlice.actions.articleUpdated({
          id: selectedArticle.id,
          changes: { score: Math.min(selectedArticle.score + 10, 100) },
        }),
      )
    }
  }

  /** 只修改当前文章的已发布字段。 */
  function togglePublished(): void {
    if (selectedArticle) {
      dispatch(
        articlesSlice.actions.articleUpdated({
          id: selectedArticle.id,
          changes: { published: !selectedArticle.published },
        }),
      )
    }
  }

  /** 删除当前实体，观察 selectById 和选中 ID 的变化。 */
  function removeSelectedArticle(): void {
    if (selectedId) dispatch(articlesSlice.actions.articleRemoved(selectedId))
  }

  /** 用新集合替换现有实体，观察 ids 与 entities 同步重建。 */
  function replaceArticles(): void {
    dispatch(
      articlesSlice.actions.articlesReplaced([
        { id: 'article-x', title: '批量替换 A', score: 61, published: true },
        { id: 'article-y', title: '批量替换 B', score: 97, published: true },
      ]),
    )
  }

  /** 切换额外 loading 字段，不改变实体集合。 */
  function toggleLoading(): void {
    dispatch(articlesSlice.actions.loadingChanged())
  }

  /** dispatch reset action 后恢复文章集合、排序和额外字段。 */
  function resetDemo(): void {
    dispatch(articlesSlice.actions.reset())
  }

  /** 选择一个实体 ID，详情由 selectById 语义派生。 */
  function selectArticle(id: string): void {
    dispatch(articlesSlice.actions.articleSelected(id))
  }

  return (
    <section className="create-entity-adapter-demo" data-testid="create-entity-adapter-demo">
      <header className="create-entity-adapter-demo__heading">
        <p>One adapter, consistent collection semantics</p>
        <h2>createEntityAdapter</h2>
        <span>排序、CRUD 与 Selector 由同一个实体适配器维护。</span>
      </header>

      <section className="create-entity-adapter-demo__status" aria-live="polite">
        <div>
          <span>selectTotal</span>
          <strong data-testid="entity-adapter-total">{total}</strong>
        </div>
        <div>
          <span>loading</span>
          <strong data-testid="entity-adapter-loading">{loading}</strong>
        </div>
        <div>
          <span>操作次数</span>
          <strong data-testid="entity-adapter-action-count">{actionCount}</strong>
        </div>
      </section>

      <div className="create-entity-adapter-demo__workspace">
        <section className="create-entity-adapter-demo__panel">
          <h3>selectAll：按评分降序</h3>
          <p>sortComparer 只改变 ids 顺序，entities 仍按 ID 查找。</p>
          <div className="create-entity-adapter-demo__list">
            {articles.map((article) => (
              <button
                className={article.id === selectedId ? 'is-selected' : ''}
                data-testid={`entity-adapter-article-${article.id}`}
                key={article.id}
                type="button"
                onClick={() => selectArticle(article.id)}
              >
                <strong>{article.title}</strong>
                <span>
                  {article.score} 分 · {article.published ? '已发布' : '草稿'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="create-entity-adapter-demo__panel">
          <h3>selectById：当前详情</h3>
          {selectedArticle ? (
            <dl className="create-entity-adapter-demo__details">
              <div>
                <dt>id</dt>
                <dd>{selectedArticle.id}</dd>
              </div>
              <div>
                <dt>title</dt>
                <dd>{selectedArticle.title}</dd>
              </div>
              <div>
                <dt>score</dt>
                <dd>{selectedArticle.score}</dd>
              </div>
              <div>
                <dt>entities[id] === selectById</dt>
                <dd>{entities[selectedArticle.id] === selectedArticle ? '是' : '否'}</dd>
              </div>
            </dl>
          ) : (
            <p>当前没有选中的实体。</p>
          )}
        </section>
      </div>

      <div className="create-entity-adapter-demo__controls">
        <button type="button" onClick={addArticle}>
          新增文章
        </button>
        <button type="button" onClick={boostSelectedArticle}>
          提高评分
        </button>
        <button type="button" onClick={togglePublished}>
          切换发布
        </button>
        <button type="button" onClick={removeSelectedArticle}>
          删除当前文章
        </button>
        <button type="button" onClick={replaceArticles}>
          替换集合
        </button>
        <button type="button" onClick={toggleLoading}>
          切换 loading
        </button>
        <button type="button" onClick={resetDemo}>
          重置
        </button>
      </div>

      <section className="create-entity-adapter-demo__state" aria-label="适配器状态快照">
        <div>
          <h3>selectIds</h3>
          <code data-testid="entity-adapter-ids">{JSON.stringify(ids)}</code>
        </div>
        <div>
          <h3>selectEntities</h3>
          <pre data-testid="entity-adapter-entities">{JSON.stringify(entities, null, 2)}</pre>
        </div>
      </section>
    </section>
  )
}

/** 为 React Demo 宿主提供独立 Provider 和 store。 */
function CreateEntityAdapterDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <CreateEntityAdapterPanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册 createEntityAdapter 观察台。 */
export function createCreateEntityAdapterDemo(): ComponentType {
  return CreateEntityAdapterDemoRoot
}
