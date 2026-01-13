<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <n-button text @click="router.back()" class="mb-2">
        <template #icon><n-icon :component="ArrowBackOutline" /></template> 返回
      </n-button>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">{{ homework.title }}</h2>
        <n-tag :type="statusType" size="large">{{ statusText }}</n-tag>
      </div>
      <p class="text-gray-500 mt-2" v-if="submission?.total_score !== undefined">
        总得分: <span class="text-2xl font-bold text-primary">{{ submission.total_score }}</span>
      </p>
    </div>

    <div v-if="loading" class="text-center py-20"><n-spin /></div>

    <div v-else class="space-y-8 pb-20">
      <n-card v-for="(q, index) in homework.questions" :key="q.id" :title="`${index + 1}. ${q.content} (${q.score}分)`" class="rounded-xl shadow-sm">
        <div v-if="q.question_type === 'choice'" class="mb-4 text-gray-600 bg-gray-50 p-3 rounded">
          选项: {{ q.options }}
        </div>

        <!-- 批改结果展示 -->
        <div v-if="getDetail(q.id)">
          <!-- 如果是批改中状态 -->
          <div v-if="submission.status === 'submitted'" class="mb-4 p-4 bg-indigo-50 rounded border border-indigo-100 text-indigo-700 flex items-center">
              <n-spin size="small" class="mr-3" /> 
              <span>AI 正在智能批改中，请稍候刷新...</span>
          </div>

          <!-- 如果已批改，显示分数 -->
          <div v-else-if="submission.status === 'ai_graded' || submission.status === 'feedback_received'" class="mb-4 p-4 rounded border" :class="getResultClass(getDetail(q.id), q.score)">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold" :class="getResultTextClass(getDetail(q.id), q.score)">
                得分: {{ getDetail(q.id).score }} / {{ q.score }}
              </span>
              <n-tag :type="getResultTagType(getDetail(q.id), q.score)" size="small">
                {{ getResultText(getDetail(q.id), q.score) }}
              </n-tag>
            </div>
            <div class="text-sm text-gray-600">
              <div class="mb-1"><strong>你的回答:</strong> {{ getDetail(q.id).answer_content }}</div>
              <div><strong>AI 点评:</strong> {{ getDetail(q.id).comment }}</div>
            </div>
          </div>
        </div>

        <!-- 答题区域 -->
        <div class="space-y-4">
          <!-- 文本输入 -->
          <n-input
            v-model:value="answers[q.id].text"
            type="textarea"
            placeholder="输入你的答案..."
            :disabled="isSubmitted && submission.status === 'submitted'" 
          />
          
          <!-- 图片上传 (OCR) -->
          <div>
            <p class="text-xs text-gray-400 mb-1">或者上传手写图片 (自动识别):</p>
            <n-upload
              :custom-request="(options) => customUpload(options, q.id)"
              @before-upload="beforeUpload"
              list-type="image-card"
              :max="1"
              :default-file-list="getImageList(q.id)"
              @remove="() => handleRemoveImage(q.id)"
              :disabled="isSubmitted && submission.status === 'submitted'"
            >
              点击上传
            </n-upload>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 底部提交栏 -->
    <div class="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-lg z-40" v-if="!loading">
      <div class="max-w-7xl mx-auto flex justify-end">
        <n-button 
          type="primary" 
          size="large" 
          :loading="submitting" 
          :disabled="isSubmitted && submission.status === 'submitted'"
          @click="handleSubmit"
        >
          {{ isSubmitted ? '重新提交 (覆盖)' : '提交作业' }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NTag, NSpin, NCard, NInput, NUpload, useMessage } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { submitHomework, getSubmissionDetail } from '../../api/homework'
import { uploadImage } from '../../api/resource'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const homework = ref({})
const submission = ref(null)
const answers = ref({}) // { qid: { text: '', image: '' } }
const loading = ref(true)
const submitting = ref(false)

// 从路由 state 获取作业数据
const initData = () => {
  if (history.state.homeworkData) {
    homework.value = JSON.parse(history.state.homeworkData)
    // 初始化 answers
    homework.value.questions?.forEach(q => {
      answers.value[q.id] = { text: '', image: '' }
    })
    fetchSubmission()
  } else {
    message.error('数据丢失，请返回列表重试')
    router.back()
  }
}

const fetchSubmission = async () => {
  try {
    const res = await getSubmissionDetail(homework.value.id)
    if (res.code === 0 && res.data) {
      submission.value = { ...res.data, id: res.data.id || res.data.ID }
      // 回显答案（如果需要）
      // 这里简单处理：如果已提交，我们只在“批改结果区”显示，不回填到输入框，避免混淆
      // 除非用户想修改。为了方便用户修改，我们可以回填。
      if (res.data.details) {
        res.data.details.forEach(d => {
            if (answers.value[d.question_id]) {
              answers.value[d.question_id].text = d.answer_content // 注意：OCR 的内容也会回填到这里
              answers.value[d.question_id].image = d.answer_image_url
            }
        })
      }
    }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const customUpload = ({ file, onFinish, onError }, qid) => {
  uploadImage(file.file).then(res => {
    answers.value[qid].image = res.data.url
    message.success('上传成功')
    onFinish()
  }).catch(err => {
    message.error(err.message || '上传失败')
    onError()
  })
}

const beforeUpload = (data) => {
  const isImage = data.file.file?.type === 'image/jpeg' || data.file.file?.type === 'image/png'
  if (!isImage) {
    message.error('只能上传 JPG 或 PNG 格式的图片')
    return false
  }
  return true
}

const handleRemoveImage = (qid) => {
  answers.value[qid].image = ''
}

const getImageList = (qid) => {
  const url = answers.value[qid]?.image
  if (url) {
    return [{
      id: '1',
      name: 'image.png',
      status: 'finished',
      url: url
    }]
  }
  return []
}

const getDetail = (qid) => {
  return submission.value?.details?.find(d => d.question_id === qid)
}

// 辅助函数：根据分数判断状态
const getResultTagType = (detail, maxScore) => {
  if (detail.score === maxScore) return 'success'
  if (detail.score === 0) return 'error'
  return 'warning'
}

const getResultText = (detail, maxScore) => {
  if (detail.score === maxScore) return '正确'
  if (detail.score === 0) return '错误'
  return '可改进'
}

const getResultClass = (detail, maxScore) => {
  if (detail.score === maxScore) return 'bg-green-50 border-green-100'
  if (detail.score === 0) return 'bg-red-50 border-red-100'
  return 'bg-yellow-50 border-yellow-100'
}

const getResultTextClass = (detail, maxScore) => {
  if (detail.score === maxScore) return 'text-green-700'
  if (detail.score === 0) return 'text-red-700'
  return 'text-yellow-700'
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const details = []
    for (const qid in answers.value) {
      const ans = answers.value[qid]
      if (ans.text || ans.image) {
        details.push({
          question_id: qid,
          text_content: ans.text,
          image_url: ans.image
        })
      }
    }

    const res = await submitHomework({
      homework_id: homework.value.id,
      details: details
    })
    
    if (res.code === 0) {
      message.success('提交成功！AI 正在批改中...')
      fetchSubmission() // 刷新状态
    }
  } catch (e) {
    message.error(e.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

const isSubmitted = computed(() => !!submission.value)
const statusText = computed(() => {
  if (!submission.value) return '未提交'
  if (submission.value.status === 'submitted') return '批改中'
  if (submission.value.status === 'ai_graded') return 'AI已评分'
  if (submission.value.status === 'feedback_received') return '教师已复核'
  return submission.value.status
})
const statusType = computed(() => {
  if (!submission.value) return 'default'
  if (submission.value.status === 'submitted') return 'warning'
  if (submission.value.status === 'ai_graded') return 'success'
  if (submission.value.status === 'feedback_received') return 'primary'
  return 'success'
})

onMounted(initData)
</script>
