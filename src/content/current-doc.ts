/* 当前页知识点数据的共享状态：ApiDocPage 写入，AppOutline 读取 */
import { ref } from 'vue'
import type { ApiDoc } from './types'

/** 当前页知识点数据（非知识点页为 null） */
export const currentDoc = ref<ApiDoc | null>(null)
