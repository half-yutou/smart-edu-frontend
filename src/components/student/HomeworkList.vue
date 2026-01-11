<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <n-icon size="64" :component="BookOutline" class="mb-4 opacity-50" />
      <p>老师还没有布置作业哦</p>
    </div>

    <div v-else class="grid gap-4">
      <n-card v-for="hw in list" :key="hw.id" hoverable class="rounded-xl cursor-pointer hover:border-primary transition-colors" @click="goDetail(hw)">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold mb-2 flex items-center gap-2">
              {{ hw.title }}
              <n-tag :type="getStatusType(hw.student_status)" size="small" v-if="hw.student_status && hw.student_status !== 'unsubmitted'">
                {{ getStatusText(hw.student_status) }}
              </n-tag>
            </h3>
            <p class="text-gray-500 text-sm">
              <n-icon :component="TimeOutline" class="mr-1 relative top-[1px]" />
              截止: {{ formatDate(hw.deadline) }}
            </p>
          </div>
          <n-button :type="isDone(hw.student_status) ? 'default' : 'primary'" secondary round>
            {{ isDone(hw.student_status) ? '查看详情' : '去完成' }}
          </n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NButton, NIcon, NSpin, NTag, useMessage } from 'naive-ui'
import { TimeOutline, BookOutline } from '@vicons/ionicons5'
import { getStudentHomeworkList } from '../../api/homework'

const props = defineProps({
  classId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const list = ref([])

const fetchList = async () => {
  if (!props.classId) return
  loading.value = true
  try {
    const res = await getStudentHomeworkList(props.classId)
    if (res.code === 0) {
      list.value = (res.data || []).map(item => ({
        ...item,
        id: item.id || item.ID
      }))
    }
  } catch (e) {
    // handled
  } finally {
    loading.value = false
  }
}

const goDetail = (hw) => {
  router.push({
    name: 'StudentHomeworkDetail',
    params: { id: hw.id },
    state: { homeworkData: JSON.stringify(hw) }
  })
}

const formatDate = (str) => {
  if (!str) return '无限制'
  return new Date(str).toLocaleString()
}

const getStatusType = (status) => {
  if (status === 'submitted') return 'warning'
  if (status === 'graded') return 'success'
  return 'default'
}

const getStatusText = (status) => {
  if (status === 'submitted') return '批改中'
  if (status === 'graded') return '已批改'
  return '未提交'
}

const isDone = (status) => {
  return status === 'submitted' || status === 'graded'
}

onMounted(fetchList)

watch(() => props.classId, () => {
  fetchList()
})
</script>
