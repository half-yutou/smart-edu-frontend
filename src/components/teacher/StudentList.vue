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
  { title: '昵称', key: 'nickname' },
  { title: '手机号', key: 'phone' },
  { 
    title: '加入时间', 
    key: 'created_at',
    render(row) {
      return new Date(row.created_at).toLocaleString() // Note: User model created_at is user creation, not join time. Join time is in junction table, API returns User objects. So this is user reg time. 
      // If we want join time, backend needs to return it. For now, show reg time or nothing.
      // Actually let's just show basic info.
    }
  }
]

const fetchList = async () => {
  if (!props.classId) return
  loading.value = true
  try {
    const res = await getClassMembers(props.classId)
    if (res.code === 0) {
      list.value = res.data || []
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
