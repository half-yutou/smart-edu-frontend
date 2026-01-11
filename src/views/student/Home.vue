<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-gray-800">我的班级</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <n-card v-for="cls in classList" :key="cls.id" hoverable class="rounded-xl shadow-sm cursor-pointer hover:-translate-y-1 transition-transform duration-300" @click="handleSelectClass(cls)">
        <template #header>
          <div class="flex items-center gap-2">
            <div class="p-2 bg-green-100 rounded-lg">
              <n-icon :component="SchoolOutline" size="20" class="text-primary" />
            </div>
            <div>
              <div class="font-bold text-base">{{ cls.name }}</div>
              <div class="text-xs text-gray-400 mt-1" v-if="cls.grade_id || cls.subject_name">
                {{ formatGrade(cls.grade_id) }} · {{ cls.subject_name }}
              </div>
            </div>
          </div>
        </template>
        <p class="text-gray-500 line-clamp-2 h-10">{{ cls.description || '暂无描述' }}</p>
        <template #footer>
          <div class="flex justify-between items-center text-sm text-gray-400">
            <span>教师: {{ cls.teacher_name }}</span>
            <n-tag type="success" size="small" round>已加入</n-tag>
          </div>
        </template>
      </n-card>

      <!-- 加入班级卡片 -->
      <n-card hoverable class="rounded-xl shadow-sm border-dashed border-2 border-gray-200 flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-white hover:border-primary transition-all duration-300 h-full min-h-[180px]" @click="showJoinModal = true">
        <div class="flex flex-col items-center justify-center h-full py-4 text-gray-400 group">
          <n-icon :component="AddCircleOutline" size="40" class="mb-2 group-hover:text-primary transition-colors" />
          <span class="group-hover:text-primary transition-colors">加入新班级</span>
        </div>
      </n-card>
    </div>

    <!-- 加入班级弹窗 -->
    <n-modal v-model:show="showJoinModal" preset="card" title="加入班级" style="width: 400px">
      <p class="mb-2 text-gray-500">请输入老师提供的邀请码：</p>
      <n-input v-model:value="joinCode" placeholder="例如: X8Y9Z0" size="large" class="text-center tracking-widest uppercase" />
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showJoinModal = false">取消</n-button>
          <n-button type="primary" :loading="joining" @click="handleJoinClass" :disabled="!joinCode">加入</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NTag, NIcon, NModal, NInput, NButton, useMessage } from 'naive-ui'
import { SchoolOutline, AddCircleOutline } from '@vicons/ionicons5'
import { getStudentClassList, joinClass } from '../../api/class'
import { formatGrade } from '../../utils/format'

const router = useRouter()
const message = useMessage()
const classList = ref([])
const showJoinModal = ref(false)
const joinCode = ref('')
const joining = ref(false)

const fetchClasses = async () => {
  try {
    const res = await getStudentClassList()
    if (res.code === 0) {
      classList.value = (res.data || []).map(item => ({
        ...item,
        id: item.id || item.ID,
        teacher_name: item.teacher?.nickname || item.teacher?.username || '未知教师'
      }))
    }
  } catch (error) {
    // 拦截器已处理错误
  }
}

const handleJoinClass = async () => {
  if (!joinCode.value) return
  joining.value = true
  try {
    const res = await joinClass(joinCode.value)
    if (res.code === 0) {
      message.success('加入成功')
      showJoinModal.value = false
      joinCode.value = ''
      fetchClasses()
    } else {
      message.error(res.msg || '加入失败')
    }
  } catch (error) {
    // 拦截器已处理
  } finally {
    joining.value = false
  }
}

const handleSelectClass = (cls) => {
  // 跳转到班级详情（作业列表）
  router.push(`/student/class/${cls.id}`)
}

onMounted(fetchClasses)
</script>
