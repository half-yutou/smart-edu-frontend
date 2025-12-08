<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <n-icon size="64" :component="FolderOpenOutline" class="mb-4 opacity-50" />
      <p>老师还没有上传资料哦</p>
    </div>

    <div v-else class="space-y-4">
      <n-card v-for="res in list" :key="res.id" hoverable class="rounded-xl">
        <div class="flex justify-between items-center">
          <div class="flex items-start gap-3">
            <div class="p-3 bg-gray-100 rounded-lg">
              <n-icon :component="res.res_type === 'video' ? VideocamOutline : DocumentTextOutline" size="24" class="text-gray-600" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-gray-800">{{ res.title }}</h3>
              <p class="text-gray-500 text-sm mt-1 line-clamp-2">{{ res.description || '暂无描述' }}</p>
              <div class="flex gap-2 mt-2">
                <n-tag size="small" :type="res.res_type === 'video' ? 'info' : 'success'">
                  {{ res.res_type === 'video' ? '视频' : '文档' }}
                </n-tag>
                <n-tag size="small" :bordered="false" v-if="res.subject_name">{{ res.subject_name }}</n-tag>
                <n-tag size="small" :bordered="false" v-if="res.grade_id">{{ formatGrade(res.grade_id) }}</n-tag>
                <span class="text-xs text-gray-400 flex items-center">
                  {{ formatDate(res.created_at) }}
                </span>
              </div>
            </div>
          </div>
          <n-button type="primary" secondary @click="viewResource(res)">
            查看
          </n-button>
        </div>
      </n-card>
    </div>

    <resource-preview-modal v-model:show="showPreview" :resource="previewResource" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { NCard, NButton, NIcon, NSpin, NTag, useMessage } from 'naive-ui'
import { FolderOpenOutline, VideocamOutline, DocumentTextOutline } from '@vicons/ionicons5'
import { getClassResources } from '../../api/class'
import { formatGrade } from '../../utils/format'
import ResourcePreviewModal from '../common/ResourcePreviewModal.vue'

const props = defineProps({
  classId: {
    type: String,
    required: true
  }
})

const message = useMessage()
const loading = ref(false)
const list = ref([])
const showPreview = ref(false)
const previewResource = ref(null)

const fetchList = async () => {
  if (!props.classId) return
  loading.value = true
  try {
    const res = await getClassResources(props.classId)
    if (res.code === 0) {
      list.value = res.data.list || []
    }
  } catch (e) {
    // handled
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

onMounted(fetchList)

watch(() => props.classId, () => {
  fetchList()
})
</script>
