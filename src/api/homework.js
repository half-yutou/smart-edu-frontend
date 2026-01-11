import request from '../utils/request'

// 学生端接口
export function getStudentHomeworkList(class_id) {
  return request.post('/homework/student/list', { class_id: class_id ? String(class_id) : undefined })
}

export function submitHomework(data) {
  // data: { homework_id, details: [{question_id, text_content, image_url}] }
  const payload = { ...data }
  payload.homework_id = payload.homework_id ? String(payload.homework_id) : undefined
  
  if (payload.details && Array.isArray(payload.details)) {
    payload.details = payload.details.map(item => ({
      ...item,
      question_id: String(item.question_id)
    }))
  }
  
  return request.post('/homework/student/submit', payload)
}

export function getSubmissionDetail(homework_id) {
  return request.post('/homework/student/submission', { homework_id: homework_id ? String(homework_id) : undefined })
}

// 教师端接口
export function createHomework(data) {
  // data: { class_id, title, content, deadline, questions: [...] }
  const payload = { ...data }
  payload.class_id = payload.class_id ? String(payload.class_id) : undefined
  return request.post('/homework/teacher/create', payload)
}

export function updateHomework(data) {
  const payload = { ...data }
  payload.homework_id = payload.homework_id ? String(payload.homework_id) : undefined
  payload.class_id = payload.class_id ? String(payload.class_id) : undefined
  
  if (payload.questions && Array.isArray(payload.questions)) {
    payload.questions = payload.questions.map(q => ({
      ...q,
      id: q.id ? String(q.id) : undefined
    }))
  }
  
  return request.post('/homework/teacher/update', payload)
}

export function deleteHomework(homework_id) {
  return request.post('/homework/teacher/delete', { homework_id: homework_id ? String(homework_id) : undefined })
}

export function getTeacherHomeworkList() {
  return request.post('/homework/teacher/list', {})
}

export function getTeacherHomeworkListByClass(class_id) {
  return request.post('/homework/teacher/list_by_class', { class_id: class_id ? String(class_id) : undefined })
}

export function getHomeworkSubmissions(homework_id) {
  return request.post('/homework/teacher/submissions', { homework_id: homework_id ? String(homework_id) : undefined })
}

export function gradeSubmission(data) {
  // data: { submission_id, details: [{detail_id, score, comment}] }
  const payload = { ...data }
  payload.submission_id = payload.submission_id ? String(payload.submission_id) : undefined
  
  if (payload.details && Array.isArray(payload.details)) {
    payload.details = payload.details.map(item => ({
      ...item,
      detail_id: String(item.detail_id)
    }))
  }
  
  return request.post('/homework/teacher/grade', payload)
}
