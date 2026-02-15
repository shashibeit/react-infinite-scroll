import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PeopleIcon from '@mui/icons-material/People'
import QuizIcon from '@mui/icons-material/Quiz'
import DashboardIcon from '@mui/icons-material/Dashboard'

function Home() {
  const navigate = useNavigate()

  const cards = [
    {
      title: 'Participant Details',
      description: 'View and manage participant information, including details and contact information.',
      icon: <PeopleIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/participants'
    },
    {
      title: 'Question Bank',
      description: 'Manage questions, control ordering, review approvals, and create new questions.',
      icon: <QuizIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/question-bank'
    },
    {
      title: 'Dashboard',
      description: 'View analytics and insights about participants and questions (Coming Soon).',
      icon: <DashboardIcon sx={{ fontSize: 60, color: 'text.secondary' }} />,
      path: '/home',
      disabled: true
    }
  ]

  return (
    <Box sx={{ width: '100%', padding: 4 }}>
      <Paper 
        sx={{ 
          p: 6, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
          Welcome to Question Bank App
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage participants and organize your question bank efficiently
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Card 
              sx={{ 
                height: '100%',
                opacity: card.disabled ? 0.6 : 1
              }}
            >
              <CardActionArea
                onClick={() => !card.disabled && navigate(card.path)}
                disabled={card.disabled}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h5" component="div" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select a module above to get started
        </Typography>
      </Box>
    </Box>
  )
}

export default Home
