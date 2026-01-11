<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">我的教学班级</h2>
      <n-button type="primary" size="large" @click="showCreateModal = true">
        <template #icon><n-icon :component="AddOutline" /></template>
        创建班级
      </n-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <n-card v-for="cls in classList" :key="cls.id" hoverable class="rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow" @click="goClassDetail(cls)">
        <template #header>
          <div class="flex items-center gap-2">
            <n-icon :component="PeopleOutline" class="text-indigo-500" />
            <div>
              <div class="font-bold">{{ cls.name }}</div>
              <div class="text-xs text-gray-400" v-if="cls.grade_id || cls.subject_name">
                {{ formatGrade(cls.grade_id) }} · {{ cls.subject_name }}
              </div>
            </div>
          </div>
        </template>
        <p class="text-gray-500 mb-4 h-10 line-clamp-2">{{ cls.description || '暂无描述' }}</p>
        
        <div class="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 flex justify-between items-center" @click.stop="copyCode(cls.code)">
          <span class="text-xs text-gray-400">邀请码</span>
          <div class="flex items-center gap-1">
            <span class="font-mono font-bold text-lg text-indigo-600">{{ cls.code }}</span>
            <n-icon :component="CopyOutline" class="text-gray-400 hover:text-indigo-600 cursor-pointer" />
          </div>
        </div>
      </n-card>

      <!-- 空状态 -->
      <div v-if="classList.length === 0" class="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
        <n-icon size="48" :component="SchoolOutline" class="mb-2 opacity-50" />
        <p>还没有创建班级，快去创建一个吧</p>
      </div>
    </div>

    <!-- 创建班级弹窗 -->
    <n-modal v-model:show="showCreateModal" preset="card" title="创建新班级" style="width: 500px">
      <n-form ref="formRef" :model="form" :rules="rules">
        <n-form-item label="班级名称" path="name">
          <n-input v-model:value="form.name" placeholder="例如: 2024级高等数学A班" />
        </n-form-item>
        
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="年级" path="grade_id">
            <n-select v-model:value="form.grade_id" :options="gradeOptions" placeholder="请选择年级" />
          </n-form-item>
          <n-form-item label="学科" path="subject_id">
            <n-select v-model:value="form.subject_id" :options="subjectOptions" placeholder="请选择学科" />
          </n-form-item>
        </div>

        <n-form-item label="班级描述" path="description">
          <n-input v-model:value="form.description" type="textarea" placeholder="简要介绍班级情况..." />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" :loading="creating" @click="handleCreate">创建</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NCard, NModal, NForm, NFormItem, NInput, NSelect, useMessage } from 'naive-ui'
import { AddOutline, PeopleOutline, CopyOutline, SchoolOutline } from '@vicons/ionicons5'
import { createClass, getTeacherClassList } from '../../api/class'
import { useClipboard } from '@vueuse/core'
import { formatGrade } from '../../utils/format'
import { SUBJECT_OPTIONS, GRADE_OPTIONS } from '../../utils/constants'

const router = useRouter()
const message = useMessage()
const { copy } = useClipboard()

const classList = ref([])
const showCreateModal = ref(false)
const creating = ref(false)
const formRef = ref(null)

const form = reactive({
  name: '',
  description: '',
  subject_id: null,
  grade_id: null
})

const rules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  subject_id: [{ required: true, message: '请选择学科', trigger: ['blur', 'change'], type: 'number' }],
  grade_id: [{ required: true, message: '请选择年级', trigger: ['blur', 'change'], type: 'number' }]
}

const subjectOptions = SUBJECT_OPTIONS
const gradeOptions = GRADE_OPTIONS

const fetchList = async () => {
  try {
    const res = await getTeacherClassList()
    if (res.code === 0) {
      classList.value = (res.data || []).map(item => ({
        ...item,
        id: item.id || item.ID,
      }))
    }
  } catch (e) {}
}

const handleCreate = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      creating.value = true
      try {
        const res = await createClass(form)
        if (res.code === 0) {
          message.success('创建成功')
          showCreateModal.value = false
          form.name = ''
          form.description = ''
          form.grade_id = null
          form.subject_id = null
          fetchList()
        } else {
          message.error(res.msg || '创建失败')
        }
      } catch (e) {} finally {
        creating.value = false
      }
    }
  })
}

const copyCode = (code) => {
  copy(code)
  message.success('邀请码已复制')
}

const goClassDetail = (cls) => {
  router.push(`/teacher/class/${cls.id}`)
}

onMounted(fetchList)
</script>
