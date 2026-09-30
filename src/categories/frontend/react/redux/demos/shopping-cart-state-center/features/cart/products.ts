export type ProductId = 'keyboard' | 'notebook' | 'lamp'

export type Product = {
  id: ProductId
  name: string
  description: string
  priceCents: number
}

export const products: Product[] = [
  {
    id: 'keyboard',
    name: '机械键盘',
    description: '紧凑布局，适合日常编码',
    priceCents: 39900,
  },
  {
    id: 'notebook',
    name: '方格笔记本',
    description: '记录需求与调试线索',
    priceCents: 3900,
  },
  {
    id: 'lamp',
    name: '桌面阅读灯',
    description: '三档亮度与定时关闭',
    priceCents: 24900,
  },
]

const productsById: Record<ProductId, Product> = {
  keyboard: products[0]!,
  notebook: products[1]!,
  lamp: products[2]!,
}

/** 按稳定商品 ID 读取商品目录数据。 */
export function getProductById(productId: ProductId): Product {
  return productsById[productId]
}
