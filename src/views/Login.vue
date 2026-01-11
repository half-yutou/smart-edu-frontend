<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- 左侧品牌区 -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-600 items-center justify-center relative overflow-hidden">
      <!-- 装饰圆圈 -->
      <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div class="absolute top-20 left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div class="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div class="text-white text-center z-10 p-12">
        <h1 class="text-5xl font-bold mb-6 font-mono tracking-tight">SmartEduHub</h1>
        <p class="text-xl opacity-90 font-light">
          下一代智能教学辅助平台<br>
          AI 赋能 · 智慧教育 · 轻松批改
        </p>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-800">欢迎回来</h2>
        </div>

        <n-form ref="formRef" :model="form" :rules="rules" size="large">
          <n-form-item path="username" label="用户名">
            <n-input v-model:value="form.username" placeholder="请输入用户名">
              <template #prefix>
                <n-icon :component="PersonOutline" />
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="form.password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码"
              @keydown.enter.prevent="handleLogin"
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <div class="mb-6">
            <n-radio-group v-model:value="form.role" name="role" size="large" class="w-full flex">
              <n-radio-button value="student" class="flex-1 text-center">我是学生</n-radio-button>
              <n-radio-button value="teacher" class="flex-1 text-center">我是老师</n-radio-button>
            </n-radio-group>
          </div>

          <n-button type="primary" size="large" block :loading="loading" @click="handleLogin" class="mb-4">
            登录
          </n-button>
          
          <div class="text-center">
            <n-button text type="primary" @click="router.push('/register')">
              还没有账号？立即注册
            </n-button>
          </div>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NForm, NFormItem, NInput, NButton, NIcon, NRadioGroup, NRadioButton } from 'naive-ui'
import { LockClosedOutline, PersonOutline } from '@vicons/ionicons5'
import { login } from '../api/auth'

const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  role: 'student'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名不能少于3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = (e) => {
  e?.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const res = await login({
          username: form.username,
          password: form.password,
          role: form.role
        })
        
        const userData = res.data || {}
        if (!userData.token) {
            throw new Error('Token missing')
        }
        localStorage.setItem('token', userData.token)
        localStorage.setItem('user', JSON.stringify(userData))
        message.success('登录成功')
        
        if (userData.role === 'teacher') {
          router.push('/teacher/dashboard')
        } else {
          router.push('/student/dashboard')
        }
      } catch (error) {
        message.error(error.message || '网络错误或服务器异常')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
