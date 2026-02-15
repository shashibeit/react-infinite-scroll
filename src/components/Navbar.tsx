import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Chip, Button } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/authSlice'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { userRole } = useAppSelector((state) => state.auth)
  
  // Determine which tab is active based on current path
  const getActiveTab = () => {
    if (location.pathname === '/home' || location.pathname === '/') {
      return 0
    } else if (location.pathname.startsWith('/participants')) {
      return 1
    } else if (location.pathname.startsWith('/question-bank')) {
      return 2
    }
    return false
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ mr: 4 }}>
          Question Bank App
        </Typography>
        <Tabs 
          value={getActiveTab()} 
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ flexGrow: 1 }}
        >
          <Tab label="Home" component={Link} to="/home" />
          <Tab label="Participant Details" component={Link} to="/participants" />
          <Tab label="Question Bank" component={Link} to="/question-bank" />
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userRole && (
            <Chip
              icon={<PersonIcon />}
              label={userRole}
              color="secondary"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
