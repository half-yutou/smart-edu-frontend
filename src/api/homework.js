import request from '../utils/request'

// 学生端接口
export function getStudentHomeworkList(class_id) {
  return request.get('/homework/student/list', { params: { class_id } })
}

export function submitHomework(data) {
  // data: { homework_id, details: [{question_id, text_content, image_url}] }
  return request.post('/homework/student/submit', data)
}

export function getSubmissionDetail(homework_id) {
  return request.get('/homework/student/submission', { params: { homework_id } })
}

// 教师端接口
export function createHomework(data) {
  // data: { class_id, title, content, deadline, questions: [...] }
  return request.post('/homework/teacher/create', data)
}

export function updateHomework(data) {
  return request.post('/homework/teacher/update', data)
}

export function getTeacherHomeworkList(class_id) {
  return request.get('/homework/teacher/list', { params: { class_id } })
}

export function deleteHomework(homework_id) {
  return request.post('/homework/teacher/delete', { homework_id })
}

export function getHomeworkSubmissions(homework_id) {
  return request.get('/homework/teacher/submissions', { params: { homework_id } })
}

export function gradeSubmission(data) {
  // data: { submission_id, details: [{detail_id, score, comment}] }
  return request.post('/homework/teacher/grade', data)
}
