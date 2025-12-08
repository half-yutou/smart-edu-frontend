<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-gray-800">资源广场</h2>

    <!-- 筛选工具栏 -->
    <n-card class="mb-6 rounded-xl shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <n-input v-model:value="searchForm.keyword" placeholder="搜索资源标题/描述..." clearable @keydown.enter="handleSearch">
          <template #prefix>
            <n-icon :component="SearchOutline" />
          </template>
        </n-input>
        
        <n-select v-model:value="searchForm.subject_id" :options="subjectOptions" placeholder="全部学科" clearable @update:value="handleSearch" />
        <n-select v-model:value="searchForm.grade_id" :options="gradeOptions" placeholder="全部年级" clearable @update:value="handleSearch" />
        <n-select v-model:value="searchForm.res_type" :options="typeOptions" placeholder="全部类型" clearable @update:value="handleSearch" />
      </div>
    </n-card>

    <!-- 资源列表 -->
    <div v-if="loading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <n-icon size="64" :component="FolderOpenOutline" class="mb-4 opacity-50" />
      <p>没有找到相关资源</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <n-card v-for="res in list" :key="res.id" hoverable class="rounded-xl cursor-pointer hover:-translate-y-1 transition-transform duration-300" @click="viewResource(res)">
        <template #header>
          <div class="flex items-start gap-3">
            <div class="p-2 bg-gray-100 rounded-lg shrink-0">
              <n-icon :component="res.res_type === 'video' ? VideocamOutline : DocumentTextOutline" size="24" class="text-gray-600" />
            </div>
            <div class="overflow-hidden">
              <div class="font-bold text-lg truncate" :title="res.title">{{ res.title }}</div>
              <div class="flex gap-2 mt-1">
                <n-tag size="small" :type="res.res_type === 'video' ? 'info' : 'success'" :bordered="false">
                  {{ res.res_type === 'video' ? '视频' : '文档' }}
                </n-tag>
                <n-tag size="small" :bordered="false" v-if="res.subject_name">{{ res.subject_name }}</n-tag>
                <n-tag size="small" :bordered="false" v-if="res.grade_id">{{ formatGrade(res.grade_id) }}</n-tag>
              </div>
            </div>
          </div>
        </template>
        
        <p class="text-gray-500 text-sm line-clamp-3 h-[4.5em] mb-4">{{ res.description || '暂无描述' }}</p>
        
        <template #footer>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span class="font-mono bg-gray-100 px-1 rounded">ID: {{ res.id }}</span>
              <n-icon :component="CopyOutline" class="cursor-pointer hover:text-green-600 transition-colors" size="14" @click="copyId(res.id, $event)" title="复制ID" />
            </div>
            <div class="flex justify-between items-center text-xs text-gray-400 border-t pt-2 mt-1">
              <span>上传者: {{ res.uploader_name || '未知' }}</span>
              <span>{{ formatDate(res.created_at) }}</span>
            </div>
          </div>
        </template>
      </n-card>
    </div>

    <div class="mt-6 flex justify-center" v-if="total > 0">
      <n-pagination v-model:page="searchForm.page" :page-count="Math.ceil(total / searchForm.page_size)" @update:page="handleSearch" />
    </div>

    <resource-preview-modal v-model:show="showPreview" :resource="previewResource" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { NCard, NInput, NSelect, NIcon, NSpin, NTag, NPagination, useMessage } from 'naive-ui'
import { SearchOutline, FolderOpenOutline, VideocamOutline, DocumentTextOutline, CopyOutline } from '@vicons/ionicons5'
import { getResourceList } from '../api/resource'
import { formatGrade } from '../utils/format'
import ResourcePreviewModal from '../components/common/ResourcePreviewModal.vue'

const message = useMessage()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const showPreview = ref(false)
const previewResource = ref(null)

const copyId = (id, event) => {
  event.stopPropagation()
  if (navigator.clipboard) {
    navigator.clipboard.writeText(id).then(() => {
      message.success('ID已复制')
    })
  } else {
    const input = document.createElement('input')
    input.setAttribute('value', id)
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    message.success('ID已复制')
  }
}

const searchForm = reactive({
  page: 1,
  page_size: 12,
  keyword: '',
  subject_id: null,
  grade_id: null,
  res_type: null
})

const subjectOptions = [
  { label: '数学', value: 1 },
  { label: '语文', value: 2 },
  { label: '英语', value: 3 },
  { label: '物理', value: 4 },
  { label: '化学', value: 5 }
]

const gradeOptions = [
  { label: '一年级', value: 1 },
  { label: '二年级', value: 2 },
  { label: '三年级', value: 3 },
  { label: '四年级', value: 4 },
  { label: '五年级', value: 5 },
  { label: '六年级', value: 6 },
  { label: '初一', value: 7 },
  { label: '初二', value: 8 },
  { label: '初三', value: 9 },
  { label: '高一', value: 10 },
  { label: '高二', value: 11 },
  { label: '高三', value: 12 }
]

const typeOptions = [
  { label: '视频', value: 'video' },
  { label: '文档', value: 'document' }
]

const handleSearch = async () => {
  loading.value = true
  try {
    const res = await getResourceList(searchForm)
    if (res.code === 0) {
      list.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (e) {
    message.error('获取资源列表失败')
  } finally {
    loading.value = false
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

const formatDate = (str) => {
  if (!str) return ''
  return new Date(str).toLocaleDateString()
}

onMounted(handleSearch)
</script>
