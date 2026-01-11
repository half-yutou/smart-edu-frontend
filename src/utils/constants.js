export const GRADE_OPTIONS = [
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

export const SUBJECT_OPTIONS = [
  { label: '数学', value: 1 },
  { label: '语文', value: 2 },
  { label: '英语', value: 3 },
  { label: '物理', value: 4 },
  { label: '化学', value: 5 },
  { label: '生物', value: 6 },
  { label: '历史', value: 7 },
  { label: '地理', value: 8 },
  { label: '政治', value: 9 }
]

export const RESOURCE_TYPE_OPTIONS = [
  { label: '视频', value: 'video' },
  { label: '文档', value: 'document' }
]

// 辅助对象：用于 ID -> Name 的快速查找
export const GRADE_MAP = GRADE_OPTIONS.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

export const SUBJECT_MAP = SUBJECT_OPTIONS.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})