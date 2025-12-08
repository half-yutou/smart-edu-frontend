<template>
  <div>
    <div class="mb-4 flex justify-end">
      <n-button type="primary" @click="showAddModal = true">
        <template #icon><n-icon :component="AddOutline" /></template>
        添加资源
      </n-button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
      <n-icon size="64" :component="FolderOpenOutline" class="mb-4 opacity-50" />
      <p>还没有添加资源，点击右上角添加</p>
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
          <div class="flex gap-2">
            <n-button secondary size="small" @click="viewResource(res)">查看</n-button>
            <n-popconfirm @positive-click="handleRemove(res)">
              <template #trigger>
                <n-button type="error" secondary size="small">移除</n-button>
              </template>
              确定要从班级移除该资源吗？(不会删除原资源)
            </n-popconfirm>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 添加资源弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="添加资源到班级" style="width: 600px">
      <n-tabs type="segment">
        <n-tab-pane name="my" tab="我的资源库">
          <div v-if="myResourcesLoading" class="text-center py-10"><n-spin /></div>
          <div v-else-if="myResources.length === 0" class="text-center py-10 text-gray-400">
            暂无上传的资源，请先去资源管理上传
          </div>
          <div v-else class="max-h-[400px] overflow-y-auto space-y-2">
            <div v-for="res in myResources" :key="res.id" class="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
              <div class="truncate flex-1 mr-4">
                <div class="font-bold">{{ res.title }}</div>
                <div class="text-xs text-gray-400">{{ res.res_type }}</div>
              </div>
              <n-button size="small" type="primary" :disabled="isAdded(res.id)" @click="handleAdd(res.id)">
                {{ isAdded(res.id) ? '已添加' : '添加' }}
              </n-button>
            </div>
          </div>
        </n-tab-pane>
        <n-tab-pane name="square" tab="资源广场">
          <div class="py-10 text-center flex flex-col items-center gap-4">
            <n-icon size="48" :component="SearchOutline" class="text-gray-300" />
            <p class="text-gray-500">浏览全站公开资源并添加到班级</p>
            <n-button type="primary" secondary @click="showBrowserModal = true">
              打开资源浏览器
            </n-button>
          </div>
        </n-tab-pane>
        <n-tab-pane name="id" tab="通过ID添加">
          <div class="py-10 text-center">
            <n-input-group>
              <n-input v-model:value="resourceIdInput" placeholder="请输入资源ID" />
              <n-button type="primary" @click="handleAdd(resourceIdInput)">添加</n-button>
            </n-input-group>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-modal>

    <resource-browser-modal
      v-model:show="showBrowserModal"
      :exclude-ids="list.map(r => r.id)"
      @select="(res) => handleAdd(res.id)"
    />

    <resource-preview-modal v-model:show="showPreview" :resource="previewResource" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { NCard, NButton, NIcon, NSpin, NTag, NPopconfirm, NModal, NTabs, NTabPane, NInput, NInputGroup, useMessage } from 'naive-ui'
import { FolderOpenOutline, VideocamOutline, DocumentTextOutline, AddOutline, SearchOutline } from '@vicons/ionicons5'
import { getClassResources, addClassResource, removeClassResource } from '../../api/class'
import { getMyResources } from '../../api/resource'
import { formatGrade } from '../../utils/format'
import ResourceBrowserModal from '../common/ResourceBrowserModal.vue'
import ResourcePreviewModal from '../common/ResourcePreviewModal.vue'

const props = defineProps({
  classId: {
    type: String,
    required: true
  }
})

const message = useMessage()
const loading = ref(false)
const showBrowserModal = ref(false)
const list = ref([])
const showAddModal = ref(false)
const myResources = ref([])
const myResourcesLoading = ref(false)
const resourceIdInput = ref('')
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

const fetchMyResources = async () => {
  myResourcesLoading.value = true
  try {
    const res = await getMyResources()
    if (res.code === 0) {
      myResources.value = res.data || []
    }
  } catch (e) {
  } finally {
    myResourcesLoading.value = false
  }
}

const handleAdd = async (resourceId) => {
  if (!resourceId) return
  try {
    const res = await addClassResource(props.classId, resourceId)
    if (res.code === 0) {
      message.success('添加成功')
      fetchList()
    } else {
      message.error(res.msg || '添加失败')
    }
  } catch (e) {
    message.error(e.message || '操作失败')
  }
}

const handleRemove = async (resItem) => {
  try {
    const res = await removeClassResource(props.classId, resItem.id)
    if (res.code === 0) {
      message.success('移除成功')
      fetchList()
    }
  } catch (e) {
    message.error('移除失败')
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

const isAdded = (id) => {
  return list.value.some(r => r.id === id)
}

onMounted(() => {
  fetchList()
  fetchMyResources()
})

watch(() => props.classId, () => {
  fetchList()
})

watch(showAddModal, (val) => {
  if (val && myResources.value.length === 0) {
    fetchMyResources()
  }
})
</script>
