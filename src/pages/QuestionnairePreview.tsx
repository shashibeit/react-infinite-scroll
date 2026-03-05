import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Stack,
  List,
  ListItemButton,
  ListItemText,
  Alert
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { sendQuestionnaire, generateTableOfContents, type QuestionnaireResponse } from '../services/QuestionnaireService'

function QuestionnairePreview() {
  const { reviewId } = useParams<{ reviewId: string }>()
  const navigate = useNavigate()
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>('0')

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        if (!reviewId) {
          throw new Error('Review ID not found')
        }
        const data = await sendQuestionnaire(reviewId)
        setQuestionnaire(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questionnaire')
        setQuestionnaire(null)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionnaire()
  }, [reviewId])

  const handleViewDocument = () => {
    if (questionnaire && reviewId) {
      navigate(`/document-preview/${reviewId}`, { 
        state: { questionnaire } 
      })
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading questionnaire...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!questionnaire) {
    return (
      <Box sx={{ padding: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="warning">No questionnaire data found</Alert>
      </Box>
    )
  }

  const tableOfContents = generateTableOfContents(questionnaire.questionnaireData)
  const sections = questionnaire.questionnaireData.sections
  const currentSectionIndex = parseInt(selectedSection)
  const currentSection = sections[currentSectionIndex]

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Review Details
      </Button>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          {questionnaire.questionnaireData.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Review ID: {questionnaire.questionnaireData.reviewId}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Table of Contents */}
          <Grid item xs={12} md={3}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Table of Contents
                </Typography>
                <List sx={{ p: 0 }}>
                  {tableOfContents.map((item, index) => (
                    <ListItemButton
                      key={item.id}
                      selected={currentSectionIndex === index}
                      onClick={() => setSelectedSection(index.toString())}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                          '&:hover': {
                            backgroundColor: 'primary.light'
                          }
                        }
                      }}
                    >
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontWeight: currentSectionIndex === index ? 600 : 400 }
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Questions */}
          <Grid item xs={12} md={9}>
            {currentSection && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  {currentSection.title}
                </Typography>

                <Stack spacing={3}>
                  {currentSection.questions.map((question, index) => (
                    <Paper key={question.id} variant="outlined" sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        {index + 1}. {question.text}
                      </Typography>

                      {question.type === 'single-select' && question.options && (
                        <Box sx={{ pl: 2, mt: 1.5 }}>
                          {question.options.map((option) => (
                            <Box key={option} sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                • {option}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {question.type === 'multi-select' && question.options && (
                        <Box sx={{ pl: 2, mt: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            (Select all that apply)
                          </Typography>
                          {question.options.map((option) => (
                            <Box key={option} sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                ☐ {option}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {question.type === 'text' && (
                        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary', fontStyle: 'italic' }}>
                          [Text response expected]
                        </Typography>
                      )}

                      {question.type === 'date' && (
                        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary', fontStyle: 'italic' }}>
                          [Date response expected]
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  {currentSectionIndex > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedSection((currentSectionIndex - 1).toString())}
                    >
                      Previous Section
                    </Button>
                  )}
                  {currentSectionIndex < sections.length - 1 && (
                    <Button
                      variant="outlined"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => setSelectedSection((currentSectionIndex + 1).toString())}
                    >
                      Next Section
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleBack}>
            Cancel
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewDocument}
          >
            View Final Document
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default QuestionnairePreview
