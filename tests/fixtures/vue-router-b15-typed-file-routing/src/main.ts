import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './styles.css'

/** 完成 memory history 的显式首导航后再挂载 fixture。 */
async function bootstrap(): Promise<void> {
  await router.push('/')
  await router.isReady()
  createApp(App).use(router).mount('#app')
}

void bootstrap()
