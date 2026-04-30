import type { Role } from './auth'

const PERMISSIONS = {
  viewRevenue:       ['admin'],
  manageUsers:       ['admin'],
  manageCategories:  ['admin'],
  manageProducts:    ['admin', 'moderator'],
  generateCopy:      ['admin', 'moderator'],
  moderateReviews:   ['admin', 'moderator'],
  viewRestock:       ['admin', 'moderator'],
  viewOrders:        ['admin', 'moderator', 'staff'],
  updateOrderStatus: ['admin', 'moderator', 'staff'],
  viewMessages:      ['admin', 'moderator', 'staff'],
  deleteMessages:    ['admin', 'moderator'],
  useAIChat:         ['admin'],
  viewCLV:           ['admin'],
} as const satisfies Record<string, readonly Role[]>

export type Permission = keyof typeof PERMISSIONS

export function can(role: Role, action: Permission): boolean {
  return (PERMISSIONS[action] as readonly string[]).includes(role)
}

// Roles that can access the admin panel at all
export const STAFF_ROLES: Role[] = ['admin', 'moderator', 'staff']

export function isStaffRole(role: string): role is Role {
  return STAFF_ROLES.includes(role as Role)
}

export const ROLE_LABEL: Record<Role, string> = {
  admin:     'Admin',
  moderator: 'Moderator',
  staff:     'Staff',
  user:      'User',
}

export const ROLE_COLOR: Record<Role, { bg: string; text: string }> = {
  admin:     { bg: '#fee2e2', text: '#b91c1c' },
  moderator: { bg: '#f3e8ff', text: '#7c3aed' },
  staff:     { bg: '#dbeafe', text: '#1d4ed8' },
  user:      { bg: '#f3f4f6', text: '#6b7280' },
}
