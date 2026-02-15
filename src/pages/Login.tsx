import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Stack
} from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'
import { useAppDispatch } from '../store/hooks'
import { login, type UserRole } from '../store/authSlice'

type NonNullUserRole = Exclude<UserRole, null>

const userRoles: { value: NonNullUserRole; label: string }[] = [
  { value: 'Internal Admin', label: 'Internal Admin / Internal Application Super User' },
  { value: 'DD Manager', label: 'DD Manager' },
  { value: 'DD Analyst', label: 'DD Analyst' },
  { value: 'Risk SME Analyst User', label: 'Risk SME Analyst User' },
  { value: 'Risk SME Analyst Viewer', label: 'Risk SME Analyst Viewer' }
]

function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [selectedRole, setSelectedRole] = useState<string>('')

  const handleLogin = () => {
    if (!selectedRole) {
      alert('Please select a role')
      return
    }

    // Dispatch login action to Redux
    dispatch(login({ role: selectedRole as UserRole }))
    
    console.log('Logged in as:', selectedRole)
    
    // Navigate to home page
    navigate('/home')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 2
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Question Bank Application
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Mock Login - Select Your Role
              </Typography>
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Login As</InputLabel>
              <Select
                value={selectedRole}
                label="Login As"
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              disabled={!selectedRole}
              sx={{ mt: 2 }}
            >
              Login
            </Button>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="caption" color="info.dark">
                <strong>Note:</strong> This is a mock login screen. Select any role to proceed.
                Your role selection will determine access levels within the application.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
