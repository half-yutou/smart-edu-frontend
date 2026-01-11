import request from '../utils/request'

// 通用
export function getClassByID(id) {
  return request.post('/class/get', { id: id ? String(id) : undefined })
}

export function getClassByCode(code) {
  return request.post('/class/code', { code: code ? String(code) : undefined })
}

export function getClassResources(class_id, page = 1, page_size = 20) {
  return request.post('/class/resource/list', { class_id: class_id ? String(class_id) : undefined, page, page_size })
}

// 学生端接口
export function getStudentClassList() {
  return request.post('/class/student/list', {})
}

export function joinClass(code) {
  return request.post('/class/student/join', { code })
}

export function quitClass(class_id) {
  return request.post('/class/student/quit', { class_id: class_id ? String(class_id) : undefined })
}

// 教师端接口
export function createClass(data) {
  // data: { name, description, subject_id, grade_id }
  const payload = { ...data }
  payload.subject_id = payload.subject_id ? String(payload.subject_id) : undefined
  payload.grade_id = payload.grade_id ? String(payload.grade_id) : undefined
  return request.post('/class/teacher/create', payload)
}

export function updateClass(data) {
  // data: { class_id, name, description, subject_id, grade_id }
  const payload = { ...data }
  payload.class_id = payload.class_id ? String(payload.class_id) : undefined
  payload.subject_id = payload.subject_id ? String(payload.subject_id) : undefined
  payload.grade_id = payload.grade_id ? String(payload.grade_id) : undefined
  return request.post('/class/teacher/update', payload)
}

export function deleteClass(class_id) {
  return request.post('/class/teacher/delete', {
    class_id: class_id ? String(class_id) : undefined
  })
}

export function getTeacherClassList() {
  return request.post('/class/teacher/list', {})
}

export function addClassResource(class_id, resource_id) {
  return request.post('/class/teacher/resource/add', {
    class_id: class_id ? String(class_id) : undefined,
    resource_id: resource_id ? String(resource_id) : undefined
  })
}

export function removeClassResource(class_id, resource_id) {
  return request.post('/class/teacher/resource/remove', {
    class_id: class_id ? String(class_id) : undefined,
    resource_id: resource_id ? String(resource_id) : undefined
  })
}

export function getClassMembers(class_id) {
  return request.post('/class/teacher/members', { class_id: class_id ? String(class_id) : undefined })
}
