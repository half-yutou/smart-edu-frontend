<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">我的资源管理</h2>
      <n-button type="primary" size="large" @click="openCreate">
        <template #icon><n-icon :component="CloudUploadOutline" /></template>
        上传资源
      </n-button>
    </div>

    <!-- 资源列表 -->
    <div v-if="loading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed rounded-xl bg-white">
      <n-icon size="64" :component="CloudOfflineOutline" class="mb-4 opacity-50" />
      <p>还没有上传过资源</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <n-card v-for="res in list" :key="res.id" hoverable class="rounded-xl">
        <template #header>
          <div class="flex items-start gap-3">
            <div class="p-2 bg-indigo-50 rounded-lg shrink-0">
              <n-icon :component="res.res_type === 'video' ? VideocamOutline : DocumentTextOutline" size="24" class="text-indigo-600" />
            </div>
            <div class="overflow-hidden">
              <div class="font-bold text-lg truncate" :title="res.title">{{ res.title }}</div>
              <div class="flex gap-2 mt-1">
                <n-tag size="small" :type="res.res_type === 'video' ? 'info' : 'success'" :bordered="false">
                  {{ getResourceTypeLabel(res.res_type) }}
                </n-tag>
                <n-tag size="small" :bordered="false" v-if="res.subject">{{ res.subject.name }}</n-tag>
                <n-tag size="small" :bordered="false" v-if="res.grade_id">{{ formatGrade(res.grade_id) }}</n-tag>
                <span class="text-xs text-gray-400 self-center">{{ formatDate(res.created_at) }}</span>
              </div>
            </div>
          </div>
        </template>
        
        <p class="text-gray-500 text-sm line-clamp-2 h-[3em] mb-4">{{ res.description || '暂无描述' }}</p>
        
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button size="small" secondary @click="viewResource(res)">查看</n-button>
            <n-button size="small" secondary @click="editResource(res)">编辑</n-button>
            <n-popconfirm @positive-click="handleDelete(res)">
              <template #trigger>
                <n-button size="small" type="error" secondary>删除</n-button>
              </template>
              确定要删除该资源吗？
            </n-popconfirm>
          </div>
        </template>
      </n-card>
    </div>

    <!-- 上传/编辑弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑资源' : '上传新资源'" style="width: 600px">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="form.title" placeholder="请输入资源标题" />
        </n-form-item>
        
        <n-form-item label="描述" path="description">
          <n-input v-model:value="form.description" type="textarea" placeholder="请输入资源描述..." />
        </n-form-item>
        
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="类型" path="res_type">
            <n-select v-model:value="form.res_type" :options="typeOptions" placeholder="选择类型" />
          </n-form-item>
        </div>

        <n-form-item label="资源文件" path="file_url">
          <div class="w-full">
            <n-upload
              :custom-request="customUpload"
              :max="1"
              :show-file-list="false"
            >
              <n-button>点击上传</n-button>
            </n-upload>
            <div v-if="form.file_url" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
              已上传: {{ getFileName(form.file_url) }}
            </div>
          </div>
        </n-form-item>
        
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="学科" path="subject_id">
            <n-select v-model:value="form.subject_id" :options="subjectOptions" placeholder="选择学科" />
          </n-form-item>
          <n-form-item label="年级" path="grade_id">
            <n-select v-model:value="form.grade_id" :options="gradeOptions" placeholder="选择年级" />
          </n-form-item>
        </div>
      </n-form>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存' : '上传' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <resource-preview-modal v-model:show="showPreview" :resource="previewResource" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { NCard, NInput, NSelect, NIcon, NSpin, NTag, NButton, NModal, NForm, NFormItem, NPopconfirm, NUpload, useMessage } from 'naive-ui'
import { CloudUploadOutline, CloudOfflineOutline, VideocamOutline, DocumentTextOutline } from '@vicons/ionicons5'
import { getMyResources, createResource, updateResource, deleteResource, uploadFile } from '../../api/resource'
import { formatGrade } from '../../utils/format'
import { SUBJECT_OPTIONS, GRADE_OPTIONS, RESOURCE_TYPE_OPTIONS } from '../../utils/constants'
import ResourcePreviewModal from '../../components/common/ResourcePreviewModal.vue'

const message = useMessage()
const loading = ref(false)
const list = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)
const formRef = ref(null)
const showPreview = ref(false)
const previewResource = ref(null)

const form = reactive({
  title: '',
  description: '',
  res_type: 'video',
  file_url: '',
  subject_id: null,
  grade_id: null
})

const getResourceTypeLabel = (type) => {
  const option = RESOURCE_TYPE_OPTIONS.find(o => o.value === type)
  return option ? option.label : '未知'
}

const customUpload = ({ file, onFinish, onError }) => {
  uploadFile(file.file).then(res => {
    if (res.code === 0) {
      form.file_url = res.data.url
      message.success('上传成功')
      onFinish()
    } else {
      message.error(res.msg || '上传失败')
      onError()
    }
  }).catch(() => {
    message.error('上传失败')
    onError()
  })
}

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  res_type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  file_url: [{ required: true, message: '请输入链接', trigger: 'blur' }],
  subject_id: [{ required: true, message: '请选择学科', trigger: 'change', type: 'number' }],
  grade_id: [{ required: true, message: '请选择年级', trigger: 'change', type: 'number' }]
}

const subjectOptions = SUBJECT_OPTIONS
const gradeOptions = GRADE_OPTIONS
const typeOptions = RESOURCE_TYPE_OPTIONS

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getMyResources()
    if (res.code === 0) {
      list.value = (res.data || []).map(item => ({
        ...item,
        id: item.id || item.ID
      }))
    }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  isEdit.value = false
  currentId.value = null
  form.title = ''
  form.description = ''
  form.res_type = 'video'
  form.file_url = ''
  form.subject_id = null
  form.grade_id = null
  showModal.value = true
}

const editResource = (res) => {
  isEdit.value = true
  currentId.value = res.id
  form.title = res.title
  form.description = res.description
  form.res_type = res.res_type
  form.file_url = res.file_url
  form.subject_id = res.subject_id
  form.grade_id = res.grade_id
  showModal.value = true
}

const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateResource({
            ...form,
            resource_id: currentId.value
          })
          message.success('更新成功')
        } else {
          await createResource(form)
          message.success('上传成功')
        }
        showModal.value = false
        fetchList()
      } catch (e) {
        message.error(e.msg || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = async (resItem) => {
  try {
    const res = await deleteResource(resItem.id)
    if (res.code === 0) {
      message.success('删除成功')
      fetchList()
    }
  } catch (e) {
    message.error('删除失败')
  }
}

const viewResource = (res) => {
  if (res.file_url) {
    previewResource.value = res
    showPreview.value = true
  } else {
    message.warning('资源链接无效')
  }
}

const getFileName = (url) => {
  if (!url) return ''
  try {
    const parts = url.split('/')
    return parts[parts.length - 1]
  } catch (e) {
    return url
  }
}

const formatDate = (str) => {
  if (!str) return ''
  return new Date(str).toLocaleDateString()
}

onMounted(fetchList)
</script>
