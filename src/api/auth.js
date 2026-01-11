import request from '../utils/request'

export function register(data) {
  return request.post('/user/register', data)
}

export function login(data) {
  return request.post('/user/login', data)
}

export function logout() {
  return request.post('/user/logout', {})
}

export function updateProfile(data) {
  return request.post('/user/profile', data)
}
