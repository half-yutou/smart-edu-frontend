<template>
  <div class="max-w-6xl mx-auto">
    <!-- 顶部导航与班级信息 -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <n-button circle secondary @click="router.back()">
          <template #icon><n-icon :component="ArrowBackOutline" /></template>
        </n-button>
        <h2 class="text-2xl font-bold text-gray-800">班级管理</h2>
      </div>

      <n-card class="rounded-2xl shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50 border-none">
        <div v-if="classInfo" class="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ classInfo.name }}</h1>
            <div class="flex flex-wrap gap-3 text-sm text-gray-600 items-center">
              <div class="bg-white px-3 py-1 rounded shadow-sm flex items-center gap-2 cursor-pointer" @click="copyCode(classInfo.code)">
                <span class="font-mono font-bold text-indigo-600">{{ classInfo.code }}</span>
                <n-icon :component="CopyOutline" />
              </div>
              <span class="bg-white px-2 py-1 rounded shadow-sm" v-if="classInfo.grade_id">
                <n-icon :component="SchoolOutline" class="mr-1 relative top-[1px]" />
                {{ formatGrade(classInfo.grade_id) }}
              </span>
              <span class="bg-white px-2 py-1 rounded shadow-sm" v-if="classInfo.subject_name">
                <n-icon :component="BookOutline" class="mr-1 relative top-[1px]" />
                {{ classInfo.subject_name }}
              </span>

            </div>
          </div>
          <div class="text-right hidden md:block">
            <div class="text-4xl font-bold text-indigo-200 opacity-50">TEACHER</div>
          </div>
        </div>
        <div v-else class="py-4 flex justify-center">
          <n-spin size="small" />
        </div>
      </n-card>
    </div>

    <!-- 标签页内容 -->
    <n-tabs type="segment" animated class="bg-white p-4 rounded-2xl shadow-sm min-h-[500px]">
      <n-tab-pane name="homework" tab="作业管理">
        <HomeworkList :classId="classId" />
      </n-tab-pane>
      <n-tab-pane name="resource" tab="资源管理">
        <ResourceList :classId="classId" />
      </n-tab-pane>
      <n-tab-pane name="student" tab="学生列表">
        <StudentList :classId="classId" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NButton, NIcon, NSpin, NTabs, NTabPane, useMessage } from 'naive-ui'
import { ArrowBackOutline, SchoolOutline, BookOutline, CopyOutline } from '@vicons/ionicons5'
import { useClipboard } from '@vueuse/core'
import { getClassDetail } from '../../api/class'
import HomeworkList from '../../components/teacher/HomeworkList.vue'
import ResourceList from '../../components/teacher/ResourceList.vue'
import StudentList from '../../components/teacher/StudentList.vue'
import { formatGrade } from '../../utils/format'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { copy } = useClipboard()
const classId = route.params.id
const classInfo = ref(null)

const fetchDetail = async () => {
  try {
    const res = await getClassDetail(classId)
    if (res.code === 0) {
      classInfo.value = res.data
    }
  } catch (e) {
    message.error('获取班级信息失败')
  }
}

const copyCode = (code) => {
  if (!code) return
  copy(code)
  message.success('邀请码已复制')
}

onMounted(fetchDetail)
</script>
