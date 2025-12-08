import request from '../utils/request'

// 通用
export function getClassDetail(id) {
  return request.post('/class/get', { id })
}

export function getClassResources(class_id, page = 1, page_size = 100) {
  return request.get('/class/resource/list', { params: { class_id, page, page_size } })
}

// 学生端接口
export function getStudentClassList() {
  return request.post('/class/student/list', {})
}

export function joinClass(code) {
  return request.post('/class/student/join', { code })
}

// 教师端接口
export function createClass(data) {
  return request.post('/class/teacher/create', data)
}

export function getTeacherClassList() {
  return request.post('/class/teacher/list', {})
}

export function addClassResource(class_id, resource_id) {
  return request.post('/class/teacher/resource/add', { class_id: String(class_id), resource_id: String(resource_id) })
}

export function removeClassResource(class_id, resource_id) {
  return request.post('/class/teacher/resource/remove', { class_id: String(class_id), resource_id: String(resource_id) })
}

export function getClassMembers(class_id) {
  return request.get('/class/teacher/members', { params: { class_id } })
}
