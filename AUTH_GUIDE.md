# Redux Auth Integration

## Overview
Authentication and user roles are now fully integrated with Redux for global state management.

## Redux State Structure

```typescript
auth: {
  isAuthenticated: boolean
  userRole: UserRole | null
  userName: string | null
}
```

## Available Hooks

### 1. `useAuth()` - Get current auth state
```typescript
import { useAuth } from '../store/authHooks'

const { isAuthenticated, userRole, userName } = useAuth()
```

### 2. `usePermissions()` - Check role-based permissions
```typescript
import { usePermissions } from '../store/authHooks'

const { canCreate, canEdit, canDelete, canApprove, canViewAll, canExport } = usePermissions()

// Or check specific permission
const permissions = usePermissions()
if (permissions.hasPermission('canCreate')) {
  // Show create button
}
```

### 3. `useHasRole()` - Check if user has specific role
```typescript
import { useHasRole } from '../store/authHooks'

const isAdmin = useHasRole(['Internal Admin'])
const canManage = useHasRole(['Internal Admin', 'DD Manager'])
```

## Permission Levels by Role

| Permission | Internal Admin | DD Manager | DD Analyst | Risk SME User | Risk SME Viewer |
|------------|---------------|------------|------------|---------------|-----------------|
| canCreate | ✅ | ✅ | ✅ | ✅ | ❌ |
| canEdit | ✅ | ✅ | ✅ | ✅ | ❌ |
| canDelete | ✅ | ✅ | ❌ | ❌ | ❌ |
| canApprove | ✅ | ✅ | ❌ | ❌ | ❌ |
| canViewAll | ✅ | ✅ | ✅ | ❌ | ❌ |
| canManageUsers | ✅ | ❌ | ❌ | ❌ | ❌ |
| canExport | ✅ | ✅ | ✅ | ❌ | ❌ |

## Usage Examples

### Hide/Show UI Elements
```typescript
function MyComponent() {
  const permissions = usePermissions()
  
  return (
    <div>
      {permissions.canCreate && (
        <Button>Create New</Button>
      )}
      {permissions.canDelete && (
        <IconButton><DeleteIcon /></IconButton>
      )}
    </div>
  )
}
```

### Conditional Access to Features
```typescript
function QuestionBankList() {
  const { canCreate, canEdit } = usePermissions()
  const isAdmin = useHasRole(['Internal Admin'])
  
  const handleEdit = (id) => {
    if (canEdit) {
      // Allow edit
    } else {
      alert('You do not have permission to edit')
    }
  }
}
```

### Redux Actions
```typescript
import { useAppDispatch } from '../store/hooks'
import { logout } from '../store/authSlice'

const dispatch = useAppDispatch()
dispatch(logout()) // Logs out and clears state
```
