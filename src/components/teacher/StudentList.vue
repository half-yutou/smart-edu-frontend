<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <n-icon size="64" :component="PeopleOutline" class="mb-4 opacity-50" />
      <p>还没有学生加入</p>
    </div>

    <div v-else>
      <n-data-table
        :columns="columns"
        :data="list"
        :pagination="pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { NSpin, NDataTable, NIcon } from 'naive-ui'
import { PeopleOutline } from '@vicons/ionicons5'
import { getClassMembers } from '../../api/class'

const props = defineProps({
  classId: {
    type: String,
    required: true
  }
})

const loading = ref(false)
const list = ref([])
const pagination = { pageSize: 10 }

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '用户名', key: 'username' },
  { title: '昵称', key: 'nickname' }
]

const fetchList = async () => {
  if (!props.classId) return
  loading.value = true
  try {
    const res = await getClassMembers(props.classId)
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

onMounted(fetchList)

watch(() => props.classId, () => {
  fetchList()
})
</script>
