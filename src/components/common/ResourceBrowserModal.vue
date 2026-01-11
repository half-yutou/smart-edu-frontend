<template>
  <n-modal :show="show" @update:show="$emit('update:show', $event)" preset="card" title="资源库浏览" style="width: 1000px; max-width: 95vw;" size="huge" :bordered="false">
    <div class="flex flex-col h-[70vh]">
      <!-- 筛选工具栏 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 flex-shrink-0">
        <n-input v-model:value="searchForm.keyword" placeholder="搜索资源标题/描述..." clearable @keydown.enter="handleSearch" />
        <n-select v-model:value="searchForm.subject_id" :options="subjectOptions" placeholder="全部学科" clearable @update:value="handleSearch" />
        <n-select v-model:value="searchForm.grade_id" :options="gradeOptions" placeholder="全部年级" clearable @update:value="handleSearch" />
        <n-select v-model:value="searchForm.res_type" :options="typeOptions" placeholder="全部类型" clearable @update:value="handleSearch" />
      </div>

      <!-- 资源列表 -->
      <div class="flex-1 overflow-y-auto min-h-0 relative pr-2">
        <div v-if="loading" class="flex justify-center py-20">
          <n-spin size="large" />
        </div>

        <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <n-icon size="64" :component="FolderOpenOutline" class="mb-4 opacity-50" />
          <p>没有找到相关资源</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <n-card v-for="res in list" :key="res.id" hoverable class="rounded-xl border hover:border-primary transition-colors" content-style="padding: 12px;">
            <div class="flex items-start gap-3 mb-2">
              <div class="p-2 bg-gray-100 rounded-lg shrink-0">
                <n-icon :component="res.res_type === 'video' ? VideocamOutline : DocumentTextOutline" size="20" class="text-gray-600" />
              </div>
              <div class="overflow-hidden flex-1">
                <div class="font-bold text-base truncate" :title="res.title">{{ res.title }}</div>
                <div class="flex gap-2 mt-1 flex-wrap">
                  <n-tag size="small" :type="res.res_type === 'video' ? 'info' : 'success'" :bordered="false" class="scale-90 origin-left">
                    {{ res.res_type === 'video' ? '视频' : '文档' }}
                  </n-tag>
                  <n-tag size="small" :bordered="false" v-if="res.grade_id" class="scale-90 origin-left">{{ formatGrade(res.grade_id) }}</n-tag>
                </div>
              </div>
            </div>
            
            <p class="text-gray-500 text-xs line-clamp-2 h-[2.5em] mb-3">{{ res.description || '暂无描述' }}</p>
            
            <n-button block type="primary" :disabled="isAdded(res.id)" @click="handleSelect(res)">
              {{ isAdded(res.id) ? '已添加' : '添加到班级' }}
            </n-button>
          </n-card>
        </div>
      </div>

      <!-- 分页 -->
      <div class="mt-4 flex justify-center flex-shrink-0" v-if="total > 0">
        <n-pagination v-model:page="searchForm.page" :page-count="Math.ceil(total / searchForm.page_size)" @update:page="handleSearch" />
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { NModal, NCard, NInput, NSelect, NIcon, NSpin, NTag, NPagination, NButton, useMessage } from 'naive-ui'
import { FolderOpenOutline, VideocamOutline, DocumentTextOutline } from '@vicons/ionicons5'
import { getResourceList } from '../../api/resource'
import { formatGrade } from '../../utils/format'
import { SUBJECT_OPTIONS, GRADE_OPTIONS, RESOURCE_TYPE_OPTIONS } from '../../utils/constants'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  excludeIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'select'])

const message = useMessage()
const loading = ref(false)
const list = ref([])
const total = ref(0)

const searchForm = reactive({
  page: 1,
  page_size: 12,
  keyword: '',
  subject_id: null,
  grade_id: null,
  res_type: null
})

const subjectOptions = SUBJECT_OPTIONS
const gradeOptions = GRADE_OPTIONS
const typeOptions = RESOURCE_TYPE_OPTIONS

const handleSearch = async () => {
  loading.value = true
  try {
    const res = await getResourceList(searchForm)
    if (res.code === 0) {
      list.value = (res.data.list || []).map(item => ({
        ...item,
        id: item.id || item.ID
      }))
      total.value = res.data.total || 0
    }
  } catch (e) {
    message.error('获取资源列表失败')
  } finally {
    loading.value = false
  }
}

const isAdded = (id) => {
  return props.excludeIds.includes(id)
}

const handleSelect = (res) => {
  if (isAdded(res.id)) return
  emit('select', res)
}

watch(() => props.show, (val) => {
  if (val) {
    handleSearch()
  }
})
</script>
