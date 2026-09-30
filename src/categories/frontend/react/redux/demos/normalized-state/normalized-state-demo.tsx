import { configureStore, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'

import './normalized-state-demo.css'

type EntityId = string

type Author = {
  id: EntityId
  name: string
}

type Book = {
  id: EntityId
  title: string
  authorId: EntityId
  borrowed: boolean
}

type EntityState<T> = {
  ids: EntityId[]
  entities: Record<EntityId, T>
}

type LibraryState = {
  authors: EntityState<Author>
  books: EntityState<Book>
  selectedBookId: EntityId
  updateCount: number
}

const initialLibraryState: LibraryState = {
  authors: {
    ids: ['ada', 'grace'],
    entities: {
      ada: { id: 'ada', name: 'Ada Lovelace' },
      grace: { id: 'grace', name: 'Grace Hopper' },
    },
  },
  books: {
    ids: ['book-1', 'book-2', 'book-3'],
    entities: {
      'book-1': { id: 'book-1', title: '算法札记', authorId: 'ada', borrowed: false },
      'book-2': { id: 'book-2', title: '编译器边界', authorId: 'grace', borrowed: true },
      'book-3': { id: 'book-3', title: '计算史', authorId: 'ada', borrowed: false },
    },
  },
  selectedBookId: 'book-1',
  updateCount: 0,
}

const librarySlice = createSlice({
  name: 'library',
  initialState: initialLibraryState,
  reducers: {
    /** 选择一个存在的书籍实体。 */
    bookSelected: (state, action: PayloadAction<EntityId>) => {
      if (state.books.entities[action.payload]) state.selectedBookId = action.payload
    },
    /** 只更新指定书籍的标题字段。 */
    bookTitleChanged: (state, action: PayloadAction<{ id: EntityId; title: string }>) => {
      const book = state.books.entities[action.payload.id]
      if (book) {
        book.title = action.payload.title
        state.updateCount += 1
      }
    },
    /** 切换指定书籍的借阅状态。 */
    bookBorrowToggled: (state, action: PayloadAction<EntityId>) => {
      const book = state.books.entities[action.payload]
      if (book) {
        book.borrowed = !book.borrowed
        state.updateCount += 1
      }
    },
    /** 新增书籍并同步维护 ids 与 entities。 */
    bookAdded: (state, action: PayloadAction<Book>) => {
      if (!state.books.entities[action.payload.id]) {
        state.books.ids.push(action.payload.id)
        state.books.entities[action.payload.id] = action.payload
        state.updateCount += 1
      }
    },
    /** 删除书籍并同步维护两个索引及当前选择。 */
    bookRemoved: (state, action: PayloadAction<EntityId>) => {
      delete state.books.entities[action.payload]
      state.books.ids = state.books.ids.filter((id) => id !== action.payload)
      if (state.selectedBookId === action.payload) {
        state.selectedBookId = state.books.ids[0] ?? ''
      }
      state.updateCount += 1
    },
    /** 恢复 Demo 的初始规范化状态。 */
    reset: () => initialLibraryState,
  },
})

/** 创建 Demo 专用 store，让每次挂载都从同一份初始实体表开始。 */
function createDemoStore() {
  return configureStore({
    reducer: { library: librarySlice.reducer },
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>
type AppDispatch = DemoStore['dispatch']

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

/** 读取 library 根状态。 */
const selectLibrary = (state: RootState): LibraryState => state.library

/** 读取规范化的书籍集合。 */
const selectBooks = (state: RootState): EntityState<Book> => selectLibrary(state).books

/** 读取规范化的作者集合。 */
const selectAuthors = (state: RootState): EntityState<Author> => selectLibrary(state).authors

/** 读取当前选中的书籍 ID。 */
const selectSelectedBookId = (state: RootState): EntityId => selectLibrary(state).selectedBookId

/** 把规范化的书籍表派生为带作者名称的展示行。 */
const selectBookRows = createSelector(
  [selectBooks, selectAuthors],
  (books, authors): Array<Book & { authorName: string }> =>
    books.ids.flatMap((id) => {
      const book = books.entities[id]
      if (!book) return []
      return [{ ...book, authorName: authors.entities[book.authorId]?.name ?? '未知作者' }]
    }),
)

/** 读取当前选中的书籍及其关系对象。 */
const selectSelectedBook = createSelector(
  [selectBooks, selectAuthors, selectSelectedBookId],
  (books, authors, selectedBookId): (Book & { authorName: string }) | undefined => {
    const book = books.entities[selectedBookId]
    if (!book) return undefined
    return { ...book, authorName: authors.entities[book.authorId]?.name ?? '未知作者' }
  },
)

/** 展示 ids、entities 与关系引用如何协作。 */
function NormalizedStatePanel(): ReactElement {
  const dispatch = useAppDispatch()
  const library = useAppSelector((state) => state.library)
  const bookRows = useAppSelector(selectBookRows)
  const selectedBook = useAppSelector(selectSelectedBook)
  const [nextTitle, setNextTitle] = useState('算法札记（修订版）')

  /** 选中一个书籍 ID，观察同一实体表的读取方式。 */
  function selectBook(id: EntityId): void {
    dispatch(librarySlice.actions.bookSelected(id))
  }

  /** 只更新 entities 中的一个书籍对象，不复制作者数据。 */
  function renameSelectedBook(): void {
    if (!selectedBook) return
    dispatch(librarySlice.actions.bookTitleChanged({ id: selectedBook.id, title: nextTitle }))
  }

  /** 切换当前书籍的借阅字段。 */
  function toggleBorrowed(): void {
    if (selectedBook) dispatch(librarySlice.actions.bookBorrowToggled(selectedBook.id))
  }

  /** 新增一个通过 authorId 建立关系的书籍实体。 */
  function addBook(): void {
    dispatch(
      librarySlice.actions.bookAdded({
        id: 'book-4',
        title: '数据结构地图',
        authorId: 'grace',
        borrowed: false,
      }),
    )
    dispatch(librarySlice.actions.bookSelected('book-4'))
  }

  /** 删除当前书籍，并同步 ids 与 entities 两个索引。 */
  function removeSelectedBook(): void {
    if (selectedBook) dispatch(librarySlice.actions.bookRemoved(selectedBook.id))
  }

  /** 恢复可观察的初始规范化状态。 */
  function resetDemo(): void {
    dispatch(librarySlice.actions.reset())
    setNextTitle('算法札记（修订版）')
  }

  return (
    <section className="normalized-state-demo" data-testid="normalized-state-demo">
      <header className="normalized-state-demo__heading">
        <p>One source of truth, many queries</p>
        <h2>Normalized State</h2>
        <span>实体只保存一次，列表顺序与关系通过 ID 连接。</span>
      </header>

      <section className="normalized-state-demo__status" aria-live="polite">
        <div>
          <span>书籍数量</span>
          <strong data-testid="normalized-book-count">{library.books.ids.length}</strong>
        </div>
        <div>
          <span>作者数量</span>
          <strong>{library.authors.ids.length}</strong>
        </div>
        <div>
          <span>实体更新</span>
          <strong data-testid="normalized-update-count">{library.updateCount}</strong>
        </div>
      </section>

      <div className="normalized-state-demo__workspace">
        <section className="normalized-state-demo__panel">
          <h3>ids：顺序索引</h3>
          <p>列表只保存 ID，渲染时再从 entities 查找对象。</p>
          <div className="normalized-state-demo__book-list">
            {bookRows.map((book) => (
              <button
                className={book.id === library.selectedBookId ? 'is-selected' : ''}
                data-testid={`normalized-book-${book.id}`}
                key={book.id}
                type="button"
                onClick={() => selectBook(book.id)}
              >
                <strong>{book.title}</strong>
                <span>{book.authorName}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="normalized-state-demo__panel">
          <h3>关系查询</h3>
          {selectedBook ? (
            <dl className="normalized-state-demo__details">
              <div>
                <dt>book.id</dt>
                <dd>{selectedBook.id}</dd>
              </div>
              <div>
                <dt>book.authorId</dt>
                <dd>{selectedBook.authorId}</dd>
              </div>
              <div>
                <dt>作者名称</dt>
                <dd>{selectedBook.authorName}</dd>
              </div>
              <div>
                <dt>借阅状态</dt>
                <dd>{selectedBook.borrowed ? '已借出' : '可借阅'}</dd>
              </div>
            </dl>
          ) : (
            <p>当前没有选中的书籍。</p>
          )}
        </section>
      </div>

      <div className="normalized-state-demo__controls">
        <input
          aria-label="新的书名"
          value={nextTitle}
          onChange={(event) => setNextTitle(event.target.value)}
        />
        <button type="button" onClick={renameSelectedBook}>
          更新书名
        </button>
        <button type="button" onClick={toggleBorrowed}>
          切换借阅
        </button>
        <button type="button" onClick={addBook}>
          新增书籍
        </button>
        <button type="button" onClick={removeSelectedBook}>
          删除当前书籍
        </button>
        <button type="button" onClick={resetDemo}>
          重置
        </button>
      </div>

      <section className="normalized-state-demo__state" aria-label="规范化状态快照">
        <div>
          <h3>books.ids</h3>
          <code data-testid="normalized-ids">{JSON.stringify(library.books.ids)}</code>
        </div>
        <div>
          <h3>books.entities</h3>
          <pre data-testid="normalized-entities">
            {JSON.stringify(library.books.entities, null, 2)}
          </pre>
        </div>
      </section>
    </section>
  )
}

/** 为 React Demo 宿主提供独立 Provider 和 store。 */
function NormalizedStateDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)

  return (
    <Provider store={store}>
      <NormalizedStatePanel />
    </Provider>
  )
}

/** 为 React Demo 宿主注册标准化状态观察台。 */
export function createNormalizedStateDemo(): ComponentType {
  return NormalizedStateDemoRoot
}
