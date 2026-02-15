import { useAppSelector } from './hooks'
import { UserRole } from './authSlice'

// Define permission levels for different roles
const rolePermissions = {
  'Internal Admin': {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canViewAll: true,
    canManageUsers: true,
    canExport: true
  },
  'DD Manager': {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canViewAll: true,
    canManageUsers: false,
    canExport: true
  },
  'DD Analyst': {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canApprove: false,
    canViewAll: true,
    canManageUsers: false,
    canExport: true
  },
  'Risk SME Analyst User': {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canApprove: false,
    canViewAll: false,
    canManageUsers: false,
    canExport: false
  },
  'Risk SME Analyst Viewer': {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canViewAll: false,
    canManageUsers: false,
    canExport: false
  }
}

export function useAuth() {
  const { isAuthenticated, userRole, userName } = useAppSelector((state) => state.auth)
  
  return {
    isAuthenticated,
    userRole,
    userName
  }
}

export function usePermissions() {
  const { userRole } = useAppSelector((state) => state.auth)
  
  if (!userRole) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canViewAll: false,
      canManageUsers: false,
      canExport: false,
      hasPermission: () => false
    }
  }
  
  const permissions = rolePermissions[userRole as keyof typeof rolePermissions]
  
  return {
    ...permissions,
    hasPermission: (permission: keyof typeof permissions) => permissions[permission]
  }
}

// Helper function to check if user has specific role
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { userRole } = useAppSelector((state) => state.auth)
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}
