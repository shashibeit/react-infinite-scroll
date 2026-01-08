import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

interface QuestionDetail {
  id: number
  questionText: string
  status: string
  reviewType: string
  participantType: string
  section: string
  countries: string
}

function QuestionDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/getrecords?searchText=&offset=0&sortField=id&sortOrder=asc`)
        const result = await response.json()
        
        // Find the specific question by id
        const foundQuestion = result.records.find((record: QuestionDetail) => record.id === parseInt(id || '0'))
        
        if (foundQuestion) {
          setQuestion(foundQuestion)
        }
      } catch (error) {
        console.error('Error fetching question details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionDetails()
  }, [id])

  const handleBack = () => {
    navigate('/users')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!question) {
    return (
      <Box sx={{ padding: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to Questions
        </Button>
        <Paper sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Question not found
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Questions
      </Button>

      <Paper sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#22223e', mb: 3 }}>
          Question Details
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Question ID
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              {question.id}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Question Text
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {question.questionText}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.status}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Review Type
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.reviewType}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Participant Type
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.participantType}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Section
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.section}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Countries
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.countries}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default QuestionDetails
