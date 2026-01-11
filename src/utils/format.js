import { GRADE_MAP } from './constants'

export const formatGrade = (gradeId) => {
  if (!gradeId) return ''
  return GRADE_MAP[gradeId] || `${gradeId}年级`
}
