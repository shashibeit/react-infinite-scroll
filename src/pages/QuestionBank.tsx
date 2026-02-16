import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { Box, Paper, Tabs, Tab } from '@mui/material'
import { useEffect } from 'react'

function QuestionBank() {
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to /question-bank/list if on base /question-bank
  useEffect(() => {
    if (location.pathname === '/question-bank') {
      navigate('/question-bank/list', { replace: true })
    }
  }, [location.pathname, navigate])

  // Determine which tab is active based on current path
  const getActiveTab = () => {
    if (location.pathname.includes('/question-bank/list')) {
      return 0
    } else if (location.pathname.includes('/question-bank/ordering')) {
      return 1
    } else if (location.pathname.includes('/question-bank/section-order')) {
      return 2
    } else if (location.pathname.includes('/question-bank/approval')) {
      return 3
    }
    return 0
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const routes = ['/question-bank/list', '/question-bank/ordering', '/question-bank/section-order', '/question-bank/approval']
    navigate(routes[newValue])
  }

  // Don't show tabs on the create page
  const isCreatePage = location.pathname.includes('/question-bank/create')

  return (
    <Box sx={{ width: '100%' }}>
      {!isCreatePage && (
        <Paper square sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={getActiveTab()}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ px: 3 }}
          >
            <Tab label="Question List" />
            <Tab label="Question Ordering" />
            <Tab label="Section Order" />
            <Tab label="Question Approval" />
          </Tabs>
        </Paper>
      )}
      <Box>
        <Outlet />
      </Box>
    </Box>
  )
}

export default QuestionBank
