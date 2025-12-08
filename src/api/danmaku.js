import request from '../utils/request'

export function getDanmakuList(resource_id) {
  return request.get('/danmaku/list', { params: { resource_id: String(resource_id) } })
}

export function sendDanmaku(data) {
  // data: { resource_id, content, time, color, type }
  return request.post('/danmaku/send', {
    ...data,
    resource_id: String(data.resource_id)
  })
}
