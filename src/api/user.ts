import { get, put } from '../utils/request'
import type { IShip, IUserInfo } from '../types'

export function getProfile() {
  return get('/users/me')
}

export function updateProfile(data: Partial<Pick<IUserInfo, 'displayName' | 'contactPhone' | 'email' | 'nationality'>>) {
  return put<IUserInfo>('/users/me/profile', data)
}

export function updateShip(data: Omit<IShip, 'id' | 'isDefault'>) {
  return put<IShip>('/users/me/ship', data)
}
