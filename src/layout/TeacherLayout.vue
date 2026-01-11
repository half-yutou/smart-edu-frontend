<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/teacher/dashboard')">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <span class="font-bold text-lg text-gray-800">SmartEduHub <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-1">教师端</span></span>
        </div>
        
        <div class="hidden md:flex items-center gap-6 mx-8">
          <router-link to="/teacher/dashboard" class="text-gray-600 hover:text-indigo-600 font-medium" active-class="text-indigo-600 font-bold">班级管理</router-link>
          <router-link to="/teacher/resources/square" class="text-gray-600 hover:text-indigo-600 font-medium" active-class="text-indigo-600 font-bold">资源广场</router-link>
          <router-link to="/teacher/resources/my" class="text-gray-600 hover:text-indigo-600 font-medium" active-class="text-indigo-600 font-bold">我的资源</router-link>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-gray-600">老师, {{ user.nickname || user.username }}</span>
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
import { logout } from '../api/auth'

const router = useRouter()
const message = useMessage()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const handleLogout = async () => {
  try {
    await logout()
  } catch (e) {
    // 即使后端报错也强制退出
  }
  localStorage.clear()
  message.success('已退出')
  router.push('/login')
}
</script>
