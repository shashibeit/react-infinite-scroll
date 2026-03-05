import { useRef, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Button,
  CircularProgress,
  Alert
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GetAppIcon from '@mui/icons-material/GetApp'
import { type QuestionnaireResponse } from '../services/QuestionnaireService'

function DocumentPreview() {
  const printRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const state = location.state as { questionnaire?: QuestionnaireResponse } | null
      if (state?.questionnaire) {
        setQuestionnaire(state.questionnaire)
        setError(null)
      } else {
        setError('No questionnaire data found. Please go back and try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questionnaire data')
    } finally {
      setLoading(false)
    }
  }, [location.state])

  const handleDownloadPdf = () => {
    if (!questionnaire?.mergedPdf) return

    // Create a link and trigger download
    const link = document.createElement('a')
    link.href = questionnaire.mergedPdf
    link.download = `${questionnaire.questionnaireData.title}-${questionnaire.questionnaireData.reviewId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          Loading document...
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

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Questionnaire
      </Button>

      <Paper
        elevation={2}
        sx={{
          maxWidth: 980,
          mx: 'auto',
          p: { xs: 2, md: 4 },
          borderRadius: 2
        }}
        ref={printRef}
      >
        {/* Complete Merged PDF */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Complete Document Preview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {questionnaire?.questionnaireData.title}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* PDF Viewer */}
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: 1,
            p: 2,
            minHeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <iframe
            src={questionnaire?.mergedPdf}
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              borderRadius: '4px'
            }}
            title="Complete Questionnaire Document"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Document Information */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Document Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Document Title
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {questionnaire?.questionnaireData.title}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Review ID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {questionnaire?.questionnaireData.reviewId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Total Sections
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {questionnaire?.questionnaireData.sections.length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Generated Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date().toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
          <Button variant="outlined" color="inherit" onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default DocumentPreview
