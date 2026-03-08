import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GetAppIcon from '@mui/icons-material/GetApp'

// Use html2pdf via window object
declare global {
  interface Window {
    html2pdf: any
  }
}

// Dummy data
const dummyQuestionnaireData = {
  title: 'Annual Risk Assessment - 2025',
  reviewId: 'REV-2025-001',
  organization: 'Sample Corporation',
  date: new Date().toLocaleDateString(),
  sections: [
    {
      id: 1,
      name: 'Risk Assessment',
      questions: [
        {
          id: 1,
          text: 'What is your risk assessment methodology?',
          answer: 'We follow a comprehensive risk assessment framework that includes identification, analysis, and mitigation strategies.'
        },
        {
          id: 2,
          text: 'Describe your compliance process',
          answer: 'Our compliance process involves regular audits, documentation reviews, and employee training programs.'
        },
        {
          id: 3,
          text: 'How do you handle data privacy?',
          answer: 'We implement industry-standard encryption, access controls, and data retention policies.'
        }
      ]
    },
    {
      id: 2,
      name: 'Security & Controls',
      questions: [
        {
          id: 4,
          text: 'What are your security measures?',
          answer: 'Multi-factor authentication, firewalls, intrusion detection systems, and regular security assessments.'
        },
        {
          id: 5,
          text: 'Explain your audit procedures',
          answer: 'Annual third-party audits, quarterly internal audits, and continuous monitoring of critical systems.'
        },
        {
          id: 6,
          text: 'What is your incident response plan?',
          answer: 'We maintain a 24/7 SOC, documented incident response procedures, and regular tabletop exercises.'
        }
      ]
    },
    {
      id: 3,
      name: 'Vendor Management',
      questions: [
        {
          id: 7,
          text: 'How do you manage vendor risks?',
          answer: 'Vendor assessment framework, contracts with security requirements, and ongoing performance monitoring.'
        },
        {
          id: 8,
          text: 'Describe your training program',
          answer: 'Annual security awareness training, role-based security training, and quarterly updates on emerging threats.'
        }
      ]
    }
  ]
}

function DemoDocument() {
  const printRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    if (!printRef.current) return

    setExporting(true)
    try {
      const element = printRef.current
      const opt = {
        margin: 10,
        filename: `${dummyQuestionnaireData.title}-${dummyQuestionnaireData.reviewId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      }

      // Use the globally loaded html2pdf from CDN
      if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save()
      } else {
        console.error('html2pdf library not loaded')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GetAppIcon />}
          onClick={handleExportPDF}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export as PDF'}
        </Button>
      </Stack>

      <Paper
        elevation={3}
        sx={{
          maxWidth: 1000,
          mx: 'auto',
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          backgroundColor: 'white'
        }}
        ref={printRef}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            {dummyQuestionnaireData.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {dummyQuestionnaireData.organization}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Review ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {dummyQuestionnaireData.reviewId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {dummyQuestionnaireData.date}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'green' }}>
                Active
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Executive Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Executive Summary
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#555' }}>
            This comprehensive risk assessment document provides an in-depth analysis of our organization's
            risk landscape, compliance posture, and control environment. The assessment covers key areas
            including risk management, security controls, operational resilience, and vendor management.
            Each section includes detailed questionnaire responses and recommendations for improvement.
          </Typography>
        </Box>

        {/* Sections */}
        {dummyQuestionnaireData.sections.map((section, sectionIdx) => (
          <Box key={section.id} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
              {sectionIdx + 1}. {section.name}
            </Typography>

            <Box sx={{ pl: 2 }}>
              {section.questions.map((question, qIdx) => (
                <Card key={question.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                      Q{sectionIdx + 1}.{qIdx + 1}: {question.text}
                    </Typography>
                    <Box sx={{ pl: 2, pt: 1, borderLeft: '3px solid #1976d2', backgroundColor: '#f9f9f9', p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                        {question.answer}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />
          </Box>
        ))}

        {/* Summary Statistics */}
        <Box sx={{ mb: 4, backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Summary Statistics
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Questions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyQuestionnaireData.sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>{section.name}</TableCell>
                    <TableCell align="right">{section.questions.length}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'green', fontWeight: 600 }}>
                        ✓ Completed
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Footer */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'center', pt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            This is a confidential document. © 2025 {dummyQuestionnaireData.organization}
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default DemoDocument
