import request from '../utils/request'

export function getDanmakuList(resource_id) {
  return request.post('/danmaku/list', { resource_id: resource_id ? String(resource_id) : undefined })
}

export function sendDanmaku(data) {
  // data: { resource_id, content, time, color, type }
  const payload = { ...data }
  payload.resource_id = payload.resource_id ? String(payload.resource_id) : undefined
  return request.post('/danmaku/send', payload)
}
