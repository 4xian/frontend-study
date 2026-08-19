import { useState } from 'react'
import type { ChangeEvent } from 'react'
import './product-table-demo.css'

interface Product {
  id: string
  name: string
  category: '水果' | '饮品'
  inStock: boolean
}

interface ProductFiltersProps {
  query: string
  onlyInStock: boolean
  onQueryChange: (query: string) => void
  onStockFilterChange: (onlyInStock: boolean) => void
}

interface ProductTableProps {
  products: Product[]
  query: string
  onlyInStock: boolean
}

const initialProducts: Product[] = [
  { id: 'apple', name: '苹果', category: '水果', inStock: true },
  { id: 'banana', name: '香蕉', category: '水果', inStock: false },
  { id: 'coffee', name: '咖啡', category: '饮品', inStock: true },
  { id: 'tea', name: '绿茶', category: '饮品', inStock: true },
]

/** 渲染两个受控筛选字段，并向 State 所有者报告用户意图。 */
function ProductFilters({
  query,
  onlyInStock,
  onQueryChange,
  onStockFilterChange,
}: ProductFiltersProps) {
  /** 把最新搜索文本交给父组件。 */
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.currentTarget.value)
  }

  /** 把复选框的最新选中状态交给父组件。 */
  function handleStockChange(event: ChangeEvent<HTMLInputElement>) {
    onStockFilterChange(event.currentTarget.checked)
  }

  return (
    <div className="react-product-filters">
      <label className="react-product-search">
        <span>搜索商品</span>
        <input value={query} onChange={handleQueryChange} placeholder="例如：苹果" />
      </label>
      <label className="react-product-stock-filter">
        <input type="checkbox" checked={onlyInStock} onChange={handleStockChange} />
        <span>只看有货</span>
      </label>
    </div>
  )
}

/** 根据所有者提供的筛选值计算并渲染商品结果。 */
function ProductTable({ products, query, onlyInStock }: ProductTableProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const visibleProducts = products.filter(
    (product) =>
      product.name.toLocaleLowerCase('zh-CN').includes(normalizedQuery) &&
      (!onlyInStock || product.inStock),
  )

  return (
    <>
      <div className="react-product-summary">
        <output aria-live="polite">匹配 {visibleProducts.length} 件商品</output>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="react-product-empty">没有匹配商品。</p>
      ) : (
        <div className="react-product-table-wrap">
          <table className="react-product-table">
            <thead>
              <tr>
                <th scope="col">商品</th>
                <th className="react-product-category" scope="col">
                  分类
                </th>
                <th scope="col">库存</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.name}</th>
                  <td className="react-product-category">{product.category}</td>
                  <td>{product.inStock ? '有货' : '缺货'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

/** 展示筛选条件、商品数据和派生结果的 State 所有权。 */
export default function ProductTableDemo() {
  const [query, setQuery] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)

  return (
    <div className="react-product-table-demo">
      <section className="react-product-panel">
        <h3>筛选商品的 State 所有权</h3>
        <ProductFilters
          query={query}
          onlyInStock={onlyInStock}
          onQueryChange={setQuery}
          onStockFilterChange={setOnlyInStock}
        />

        <ProductTable products={initialProducts} query={query} onlyInStock={onlyInStock} />
      </section>
    </div>
  )
}
