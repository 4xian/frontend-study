import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

declare const router: Router

router.resolve({ name: '/', params: {} })
router.resolve({ name: '/users/[id]', params: { id: '42' } })
router.resolve({ name: '/users/[id]', params: { id: 42 } })

// @ts-expect-error 缺少必填 id
router.resolve({ name: '/users/[id]', params: {} })

// @ts-expect-error 当前 route 不接受 slug
router.resolve({ name: '/users/[id]', params: { slug: 'wrong' } })

// @ts-expect-error 生成 map 中不存在该名称
router.resolve({ name: '/missing', params: {} })

declare const normalizedUserRoute: RouteLocationNormalizedLoaded<'/users/[id]'>
const normalizedUserId: string = normalizedUserRoute.params.id

// @ts-expect-error normalized params.id 已从 URL 归一化为 string
const invalidNormalizedUserId: number = normalizedUserRoute.params.id

void normalizedUserId
void invalidNormalizedUserId
