import './assets/main.css'

import { createApp } from 'vue'

// 1、导入 createPinia
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 3、Icon 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)

// 2、执行方法得到实例，把 pinia 实例 加入 到 app应用中
app.use(createPinia())

app.use(router)

app.mount('#app')
