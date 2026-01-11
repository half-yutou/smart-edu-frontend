<template>
  <div>
    <div class="mb-6 flex items-center gap-4">
      <n-button circle secondary @click="router.back()">
        <template #icon><n-icon :component="ArrowBackOutline" /></template>
      </n-button>
      <div>
        <h2 class="text-2xl font-bold text-gray-800">{{ homework.title }} - 提交管理</h2>
        <p class="text-gray-500 text-sm">共 {{ list.length }} 份提交</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20"><n-spin /></div>
    
    <div v-else>
      <n-data-table :columns="columns" :data="list" :pagination="{ pageSize: 10 }" />
    </div>

    <!-- 批改弹窗 -->
    <n-drawer v-model:show="showGrade" :width="700">
      <n-drawer-content :title="`批改: ${currentSub?.student?.nickname || '未知学生'}`">
        <div v-if="currentSub" class="space-y-6">
          <div v-for="(detail, index) in currentSub.details" :key="detail.id" class="p-4 bg-gray-50 rounded-xl border">
            <!-- 题目信息 -->
            <div class="mb-3 pb-3 border-b border-gray-200">
              <h4 class="font-bold text-gray-700">第 {{ index + 1 }} 题</h4>
              <p class="text-gray-600 mt-1">{{ getQuestionContent(detail.question_id) }}</p>
              <div class="mt-1 text-xs text-gray-400">
                标准答案: {{ getQuestionAnswer(detail.question_id) }}
              </div>
            </div>

            <!-- 学生回答 -->
            <div class="mb-4">
              <div v-if="detail.answer_content" class="bg-white p-3 rounded border mb-2">
                {{ detail.answer_content }}
              </div>
              <div v-if="detail.answer_image_url" class="mb-2">
                <n-image :src="detail.answer_image_url" width="200" />
              </div>
            </div>

            <!-- 评分区 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded border border-blue-100">
              <div>
                <label class="text-xs text-gray-500 mb-1 block">得分 (满分 {{ getQuestionScore(detail.question_id) }})</label>
                <n-input-number v-model:value="gradingForm[detail.id].score" :min="0" :max="getQuestionScore(detail.question_id)" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">评语</label>
                <n-input v-model:value="gradingForm[detail.id].comment" type="text" placeholder="输入评语" />
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showGrade = false">取消</n-button>
            <n-button type="primary" :loading="submitting" @click="handleSubmitGrade">保存复核结果</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, h, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NSpin, NDataTable, NTag, NDrawer, NDrawerContent, NInput, NInputNumber, NImage, useMessage } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { getHomeworkSubmissions, gradeSubmission } from '../../api/homework'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const homeworkId = route.params.id

// 从路由 state 获取题目信息
const homework = ref(history.state.homeworkData ? JSON.parse(history.state.homeworkData) : { title: '未知作业', questions: [] })

const list = ref([])
const loading = ref(false)
const showGrade = ref(false)
const currentSub = ref(null)
const submitting = ref(false)
const gradingForm = reactive({}) // { detail_id: { score: 0, comment: '' } }

const columns = [
  { title: '学生姓名', key: 'student.nickname' },
  { 
    title: '提交时间', 
    key: 'submitted_at',
    render: (row) => new Date(row.submitted_at).toLocaleString()
  },
  { 
    title: '总分', 
    key: 'total_score',
    render: (row) => h('span', { class: 'font-bold text-primary' }, row.total_score)
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      const type = row.status === 'graded' ? 'success' : 'warning'
      const text = row.status === 'graded' ? '已复核' : '待复核'
      return h(NTag, { type, size: 'small' }, { default: () => text })
    }
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => h(NButton, {
      size: 'small',
      type: 'primary',
      secondary: true,
      onClick: () => openGrade(row)
    }, { default: () => '人工复核' })
  }
]

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getHomeworkSubmissions(homeworkId)
    if (res.code === 0) {
      list.value = (res.data || []).map(item => ({
        ...item,
        id: item.id || item.ID
      }))
    }
  } catch (e) {
    message.error(e.message || '保存失败')
  } finally {
    loading.value = false
  }
}

const openGrade = (sub) => {
  currentSub.value = sub
  // 初始化表单
  sub.details.forEach(d => {
    gradingForm[d.id] = {
      score: d.score,
      comment: d.comment
    }
  })
  showGrade.value = true
}

const handleSubmitGrade = async () => {
  submitting.value = true
  try {
    const details = []
    for (const did in gradingForm) {
      details.push({
        detail_id: did,
        score: gradingForm[did].score,
        comment: gradingForm[did].comment
      })
    }

    const res = await gradeSubmission({
      submission_id: currentSub.value.id,
      details: details
    })
    
    if (res.code === 0) {
      message.success('复核保存成功')
      showGrade.value = false
      fetchList() // 刷新列表
    } else {
      message.error(res.msg || '保存失败')
    }
  } catch (e) {} finally {
    submitting.value = false
  }
}

// 辅助函数：根据 question_id 获取题目信息
const getQuestionContent = (qid) => {
  const q = homework.value.questions?.find(q => q.id === qid)
  return q ? q.content : '未知题目'
}
const getQuestionScore = (qid) => {
  const q = homework.value.questions?.find(q => q.id === qid)
  return q ? q.score : 0
}
const getQuestionAnswer = (qid) => {
  const q = homework.value.questions?.find(q => q.id === qid)
  return q ? (q.correct_answer || q.standard_answer) : ''
}

onMounted(fetchList)
</script>
