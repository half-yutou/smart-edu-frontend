import request from '../utils/request'

// 公共接口
export function getResourceList(params) {
  // params: { page, page_size, keyword, subject_id, grade_id, res_type }
  return request.get('/resource/list', { params })
}

export function getResourceDetail(id) {
  return request.get('/resource/detail', { params: { id } })
}

// 教师接口
export function getMyResources() {
  return request.get('/resource/teacher/my')
}

export function createResource(data) {
  return request.post('/resource/teacher/create', data)
}

export function updateResource(data) {
  return request.post('/resource/teacher/update', data)
}

export function deleteResource(id) {
  return request.post('/resource/teacher/delete', { resource_id: id })
}
