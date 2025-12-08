import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

// 基础配置
const service = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // 后端地址
  timeout: 10000
})

// Naive UI 的消息提示 (用于在组件外弹出提示)
const { message } = createDiscreteApi(['message'])

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果是二进制数据，直接返回
    if (response.config.responseType === 'blob') {
      return res
    }
    
    // 业务逻辑错误
    if (res.code !== 0) {
      // 可以在这里统一处理错误提示，也可以抛出让组件自己处理
      // 为了方便，我们这里不强制弹窗，因为有些组件想自己控制
      // 但如果是 401，必须处理
      if (res.code === 401) {
        message.error('登录已过期，请重新登录')
        localStorage.clear()
        window.location.href = '/login'
      }
      // 封装为 Error 对象，以便前端组件可以用 error.message 获取错误信息
      const err = new Error(res.msg || 'Error')
      err.code = res.code
      err.data = res.data
      return Promise.reject(err)
    }
    
    return res // 为了方便，我们返回整个 res，让组件去取 res.data
  },
  error => {
    message.error(error.message || '网络请求失败')
    return Promise.reject(error)
  }
)

export default service
