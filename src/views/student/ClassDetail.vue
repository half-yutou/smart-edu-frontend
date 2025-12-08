<template>
  <div class="max-w-5xl mx-auto">
    <!-- 顶部导航与班级信息 -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <n-button circle secondary @click="router.back()">
          <template #icon><n-icon :component="ArrowBackOutline" /></template>
        </n-button>
        <h2 class="text-2xl font-bold text-gray-800">班级详情</h2>
      </div>

      <n-card class="rounded-2xl shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
        <div v-if="classInfo" class="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ classInfo.name }}</h1>
            <div class="flex flex-wrap gap-3 text-sm text-gray-600">
              <span class="bg-white px-2 py-1 rounded shadow-sm">
                <n-icon :component="PersonOutline" class="mr-1 relative top-[1px]" />
                教师: {{ classInfo.teacher_name }}
              </span>
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
            <div class="text-4xl font-bold text-indigo-200 opacity-50">CLASS</div>
          </div>
        </div>
        <div v-else class="py-4 flex justify-center">
          <n-spin size="small" />
        </div>
      </n-card>
    </div>

    <!-- 标签页内容 -->
    <n-tabs type="segment" animated class="bg-white p-4 rounded-2xl shadow-sm min-h-[500px]">
      <n-tab-pane name="homework" tab="班级作业">
        <HomeworkList :classId="classId" />
      </n-tab-pane>
      <n-tab-pane name="resource" tab="学习资料">
        <ResourceList :classId="classId" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NButton, NIcon, NSpin, NTabs, NTabPane, useMessage } from 'naive-ui'
import { ArrowBackOutline, PersonOutline, SchoolOutline, BookOutline } from '@vicons/ionicons5'
import { getClassDetail } from '../../api/class'
import HomeworkList from '../../components/student/HomeworkList.vue'
import ResourceList from '../../components/student/ResourceList.vue'
import { formatGrade } from '../../utils/format'

const route = useRoute()
const router = useRouter()
const message = useMessage()
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

onMounted(fetchDetail)
</script>
