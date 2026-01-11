import request from '../utils/request'

// 公共接口

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/resource/teacher/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getResourceList(data) {
  // data: { page, page_size, keyword, subject_id, grade_id, res_type }
  const payload = { ...data }
  if (!payload.page) payload.page = 1
  if (!payload.page_size) payload.page_size = 20
  payload.subject_id = payload.subject_id ? String(payload.subject_id) : undefined
  payload.grade_id = payload.grade_id ? String(payload.grade_id) : undefined
  return request.post('/resource/list', payload)
}

export function getResourceDetail(id) {
  return request.post('/resource/detail', { id: id ? String(id) : undefined })
}

// 教师接口
export function getMyResources() {
  return request.post('/resource/teacher/my', {})
}

export function createResource(data) {
  const payload = { ...data }
  payload.subject_id = payload.subject_id ? String(payload.subject_id) : undefined
  payload.grade_id = payload.grade_id ? String(payload.grade_id) : undefined
  return request.post('/resource/teacher/create', payload)
}

export function updateResource(data) {
  const payload = { ...data }
  payload.resource_id = payload.resource_id ? String(payload.resource_id) : undefined
  payload.subject_id = payload.subject_id ? String(payload.subject_id) : undefined
  payload.grade_id = payload.grade_id ? String(payload.grade_id) : undefined
  return request.post('/resource/teacher/update', payload)
}

export function deleteResource(id) {
  return request.post('/resource/teacher/delete', { resource_id: id ? String(id) : undefined })
}
