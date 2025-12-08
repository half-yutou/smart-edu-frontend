<template>
  <div>
    <div class="mb-4 flex justify-end">
      <n-button type="primary" size="large" @click="openCreate">
        <template #icon><n-icon :component="AddOutline" /></template>
        发布作业
      </n-button>
    </div>

    <!-- 作业列表 -->
    <div v-if="loading" class="text-center py-20"><n-spin /></div>
    <div v-else-if="list.length === 0" class="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
      <p>暂无作业，点击右上角发布</p>
    </div>
    <div v-else class="space-y-4">
      <n-card v-for="hw in list" :key="hw.id" hoverable class="rounded-xl">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold mb-1">{{ hw.title }}</h3>
            <p class="text-gray-500 text-sm mb-2">截止: {{ formatDate(hw.deadline) }}</p>
            <div class="flex gap-2">
              <n-tag size="small" type="info">{{ hw.questions?.length || 0 }} 道题</n-tag>
            </div>
          </div>
          <div class="flex gap-2">
            <n-button size="small" secondary @click="editHomework(hw)">编辑</n-button>
            <n-button size="small" secondary @click="viewSubmissions(hw)">查看提交</n-button>
            <n-popconfirm @positive-click="handleDelete(hw)">
              <template #trigger>
                <n-button size="small" type="error" secondary>删除</n-button>
              </template>
              确定要删除该作业吗？
            </n-popconfirm>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 发布/编辑作业 模态框 -->
    <n-modal v-model:show="showCreate" preset="card" :title="isEdit ? '编辑作业' : '发布新作业'" style="width: 900px; max-width: 95vw;" :bordered="false" size="huge">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <n-form-item label="作业标题" path="title">
            <n-input v-model:value="form.title" placeholder="例如: 第一章课后练习" />
          </n-form-item>
          <n-form-item label="截止时间" path="deadline">
            <n-date-picker v-model:value="form.deadline" type="datetime" class="w-full" />
          </n-form-item>
        </div>

        <div class="flex justify-between items-center mb-4 border-t pt-4">
          <h3 class="font-bold text-lg text-gray-700">题目列表 ({{ form.questions.length }})</h3>
          <n-button type="primary" dashed @click="addQuestion">
            <template #icon><n-icon :component="AddOutline" /></template>
            添加题目
          </n-button>
        </div>

        <div v-if="form.questions.length === 0" class="text-center py-10 bg-gray-50 rounded-xl border border-dashed text-gray-400">
          点击右上角添加题目
        </div>

        <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div v-for="(q, index) in form.questions" :key="index" class="p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative group hover:border-primary transition-colors">
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <n-button circle size="small" type="error" secondary @click="removeQuestion(index)">
                 <template #icon><n-icon :component="TrashOutline" /></template>
               </n-button>
            </div>
            
            <div class="flex items-center gap-2 mb-3">
               <n-tag type="primary" size="small">第 {{ index + 1 }} 题</n-tag>
               <div class="w-32">
                 <n-select v-model:value="q.question_type" :options="typeOptions" size="small" />
               </div>
               <div class="flex items-center gap-2 ml-4 bg-gray-50 px-2 py-1 rounded">
                 <span class="text-xs text-gray-500">本题分值:</span>
                 <n-input-number v-model:value="q.score" size="tiny" :min="1" style="width: 80px" />
               </div>
            </div>
            
            <n-input v-model:value="q.content" type="textarea" placeholder="请输入题目描述..." :rows="2" class="mb-3 font-medium" />
            
            <div v-if="q.question_type === 'choice'" class="mb-3 p-3 bg-blue-50 rounded-lg">
              <label class="text-xs text-blue-600 mb-1 block">选项设置</label>
              <n-input v-model:value="q.options" placeholder="JSON格式: {'A':'选项1', 'B':'选项2'} 或 逗号分隔: 选项1,选项2" />
            </div>
            
            <div>
               <label class="text-xs text-gray-500 mb-1 block">标准答案 (用于 AI 自动批改)</label>
               <n-input v-model:value="q.standard_answer" placeholder="例如: A (选择题) 或 关键词 (简答题)" />
            </div>
          </div>
        </div>
      </n-form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <n-button size="large" @click="showCreate = false">取消</n-button>
          <n-button size="large" type="primary" :loading="creating" @click="handleCreate">
            {{ isEdit ? '保存修改' : '立即发布' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NCard, NTag, NSpin, NModal, NForm, NFormItem, NInput, NDatePicker, NSelect, NInputNumber, NPopconfirm, useMessage } from 'naive-ui'
import { AddOutline, TrashOutline } from '@vicons/ionicons5'
import { createHomework, getTeacherHomeworkList, deleteHomework, updateHomework } from '../../api/homework'

const props = defineProps({
  classId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const message = useMessage()

const list = ref([])
const loading = ref(false)
const showCreate = ref(false)
const isEdit = ref(false)
const currentHwId = ref(null)
const creating = ref(false)
const formRef = ref(null)

const form = reactive({
  title: '',
  deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
  questions: []
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

const typeOptions = [
  { label: '单选题', value: 'choice' },
  { label: '简答题', value: 'text' }
]

const fetchList = async () => {
  if (!props.classId) return
  loading.value = true
  try {
    const res = await getTeacherHomeworkList(props.classId)
    if (res.code === 0) {
      list.value = res.data || []
    }
  } catch (e) {} finally {
    loading.value = false
  }
}

const addQuestion = () => {
  form.questions.push({
    question_type: 'text',
    content: '',
    score: 10,
    options: '',
    standard_answer: ''
  })
}

const removeQuestion = (index) => {
  form.questions.splice(index, 1)
}

const openCreate = () => {
  isEdit.value = false
  currentHwId.value = null
  form.title = ''
  form.deadline = Date.now() + 7 * 24 * 60 * 60 * 1000
  form.questions = []
  showCreate.value = true
}

const editHomework = (hw) => {
  isEdit.value = true
  currentHwId.value = hw.id
  form.title = hw.title
  form.deadline = new Date(hw.deadline).getTime()
  form.questions = JSON.parse(JSON.stringify(hw.questions || []))
  showCreate.value = true
}

const handleCreate = () => {
  if (form.questions.length === 0) {
    message.warning('请至少添加一道题目')
    return
  }
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      creating.value = true
      try {
        const processedQuestions = form.questions.map(q => ({
          ...q,
          id: q.id ? String(q.id) : '0',
          options: (q.question_type === 'choice' && q.options) ? q.options : '{}'
        }))

        const payload = {
          class_id: String(props.classId),
          title: form.title,
          content: form.title,
          deadline: new Date(form.deadline).toISOString(),
          questions: processedQuestions
        }
        
        let res
        if (isEdit.value) {
          payload.homework_id = String(currentHwId.value)
          res = await updateHomework(payload)
        } else {
          res = await createHomework(payload)
        }

        if (res.code === 0) {
          message.success(isEdit.value ? '更新成功' : '发布成功')
          showCreate.value = false
          fetchList()
        } else {
          message.error(res.msg || '操作失败')
        }
      } catch (e) {
        console.error(e)
        message.error('请求失败: ' + (e.msg || e.message || '未知错误'))
      } finally {
        creating.value = false
      }
    }
  })
}

const handleDelete = async (hw) => {
  try {
    const res = await deleteHomework(hw.id)
    if (res.code === 0) {
      message.success('删除成功')
      fetchList()
    }
  } catch (e) {}
}

const viewSubmissions = (hw) => {
  router.push({
    name: 'TeacherHomeworkGrade',
    params: { id: hw.id },
    state: { homeworkData: JSON.stringify(hw) }
  })
}

const formatDate = (str) => new Date(str).toLocaleString()

onMounted(fetchList)

watch(() => props.classId, () => {
  fetchList()
})
</script>
