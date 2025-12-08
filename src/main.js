import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'video.js/dist/video-js.css' // 引入 video.js 样式

// 字体
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
