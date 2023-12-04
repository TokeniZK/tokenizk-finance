import './assets/main.css'

import { createApp } from 'vue'

// 1、从 pinia 中 导入 createPinia 方法
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 3、 导入 Icon 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 4、 注册 Icon 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)

// 2、createPinia() 方法 执行后 得到 pinia实例，把 pinia 实例 加入到 app应用 中
app.use(createPinia())

app.use(router)

app.mount('#app')
