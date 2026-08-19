import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './app/router'
import { reveal } from './app/directives/reveal'
import { reactCoreProgressMigrations } from './categories/frontend/react/core/progress-migrations'
import { useProgressStore } from './common/progress/progress'

import './app/styles/tokens.css'
import './app/styles/base.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
useProgressStore(pinia).applyEntryMigrations(reactCoreProgressMigrations)
app.use(router)
app.directive('reveal', reveal)

app.mount('#app')
