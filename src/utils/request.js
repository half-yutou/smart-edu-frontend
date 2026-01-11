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
      // 对接后端 errno.AuthFailed = 200002
      if (res.code === 200002) {
        message.error(res.msg || '登录已过期，请重新登录')
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(new Error(res.msg || 'Auth Failed'))
      }
      // 封装为 Error 对象，以便前端组件可以用 error.message 获取错误信息
      const err = new Error(res.msg || 'Error')
      err.code = res.code
      err.data = res.data
      return Promise.reject(err)
    }
    
    return res
  },
  error => {
    message.error(error.message || '网络请求失败')
    return Promise.reject(error)
  }
)

export default service
