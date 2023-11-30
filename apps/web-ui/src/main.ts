import './assets/main.css'

import { createApp } from 'vue'

// 1、导入 createPinia
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus)

// 2、执行方法得到实例，把 pinia 实例 加入 到 app应用中
app.use(createPinia())

app.use(router)

app.mount('#app')
