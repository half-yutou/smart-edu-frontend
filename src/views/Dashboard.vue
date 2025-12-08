<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
    <p>欢迎登录！这里是控制台。</p>
    <n-button type="warning" @click="handleLogout">退出登录</n-button>
  </div>
</template>

<script setup>
import { NButton, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = useMessage()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  message.success('已退出登录')
  router.push('/login')
}
</script>
