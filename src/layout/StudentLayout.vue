<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/student/dashboard')">
          <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span class="font-bold text-lg text-gray-800">SmartEduHub</span>
        </div>
        
        <div class="hidden md:flex items-center gap-6 mx-8">
          <router-link to="/student/dashboard" class="text-gray-600 hover:text-primary font-medium" active-class="text-primary font-bold">我的班级</router-link>
          <router-link to="/student/resources" class="text-gray-600 hover:text-primary font-medium" active-class="text-primary font-bold">资源广场</router-link>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-gray-600">你好, {{ user.nickname || '同学' }}</span>
          <n-button size="small" secondary @click="handleLogout">退出</n-button>
        </div>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { NButton, useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const handleLogout = () => {
  localStorage.clear()
  message.success('已退出')
  router.push('/login')
}
</script>
