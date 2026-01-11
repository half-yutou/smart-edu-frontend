<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- 左侧品牌区 -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-blue-600 to-cyan-500 items-center justify-center relative overflow-hidden">
      <div class="text-white text-center z-10 p-12">
        <h1 class="text-5xl font-bold mb-6 font-mono tracking-tight">加入我们</h1>
        <p class="text-xl opacity-90 font-light">
          注册成为 SmartEduHub 的一员<br>
          开启智能学习之旅
        </p>
      </div>
    </div>

    <!-- 右侧注册表单 -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-800">创建账号</h2>
        </div>

        <n-form ref="formRef" :model="form" :rules="rules" size="large">
          <n-form-item path="username" label="用户名">
            <n-input v-model:value="form.username" placeholder="请输入用户名" />
          </n-form-item>
          
          <n-form-item path="nickname" label="昵称">
            <n-input v-model:value="form.nickname" placeholder="您的称呼" />
          </n-form-item>

          <n-form-item path="password" label="密码">
            <n-input v-model:value="form.password" type="password" show-password-on="click" placeholder="请输入密码" />
          </n-form-item>

          <n-form-item path="confirmPassword" label="确认密码">
            <n-input v-model:value="form.confirmPassword" type="password" show-password-on="click" placeholder="请再次输入密码" />
          </n-form-item>

          <div class="mb-6">
            <n-radio-group v-model:value="form.role" name="role" size="large" class="w-full flex">
              <n-radio-button value="student" class="flex-1 text-center">我是学生</n-radio-button>
              <n-radio-button value="teacher" class="flex-1 text-center">我是老师</n-radio-button>
            </n-radio-group>
          </div>

          <n-button type="primary" size="large" block :loading="loading" @click="handleRegister" class="mb-4">
            立即注册
          </n-button>
          
          <div class="text-center">
            <n-button text type="primary" @click="router.push('/login')">
              已有账号？去登录
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
import { useMessage, NForm, NFormItem, NInput, NButton, NRadioGroup, NRadioButton } from 'naive-ui'
import { register, login } from '../api/auth'

const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  role: 'student'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名不能少于3位', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码不能少于6位', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value) => value === form.password, message: '两次密码不一致', trigger: 'blur' }
  ]
}

const handleRegister = (e) => {
  e?.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        // 1. 注册
        await register({
          username: form.username,
          password: form.password,
          nickname: form.nickname,
          role: form.role
        })
        
        message.success('注册成功，正在自动登录...')

        // 2. 自动登录
        const loginRes = await login({
          username: form.username,
          password: form.password,
          role: form.role
        })

        const userData = loginRes.data || {}
        localStorage.setItem('token', userData.token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        message.success('欢迎加入 SmartEduHub')

        if (userData.role === 'teacher') {
          router.push('/teacher/dashboard')
        } else {
          router.push('/student/dashboard')
        }
      } catch (error) {
        message.error(error.message || '注册失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
