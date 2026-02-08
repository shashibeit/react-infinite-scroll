import { useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Checkbox,
  TextField,
  Button,
  Chip
} from '@mui/material'

function DocumentPreview() {
  const printRef = useRef<HTMLDivElement | null>(null)

  const handleDownloadPdf = () => {
    if (!printRef.current) return

    const printContents = printRef.current.innerHTML
    const printWindow = window.open('', '', 'width=1024,height=768')

    if (!printWindow) return

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n')

    printWindow.document.open()
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Document Preview</title>
          ${styles}
          <style>
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const handleCancel = () => {
    window.history.back()
  }

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <style>
        {`
          @media print {
            body {
              margin: 0;
            }
            .no-print {
              display: none !important;
            }
            .print-root {
              padding: 0 !important;
            }
          }
        `}
      </style>
      <Paper
        elevation={2}
        sx={{
          maxWidth: 980,
          mx: 'auto',
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          '@media print': {
            boxShadow: 'none',
            borderRadius: 0,
            p: 0
          }
        }}
        className="print-root"
        ref={printRef}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Final Document Preview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is the final version of the document for printing as PDF or Word.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Top Section (Static Details)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Document ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  DOC-2026-001
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Policy Review Team
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  February 8, 2026
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip label="Ready for Print" color="success" size="small" />
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Questions and Responses
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
              Section 1
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                1. Single Select Question
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Which policy area should be prioritized?
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup name="priority-area">
                  <FormControlLabel value="transport" control={<Radio />} label="Public Transportation" />
                  <FormControlLabel value="energy" control={<Radio />} label="Renewable Energy" />
                  <FormControlLabel value="health" control={<Radio />} label="Healthcare Access" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                2. Multi Select Question
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select all applicable stakeholder groups.
              </Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="Government" />
                <FormControlLabel control={<Checkbox />} label="Private Sector" />
                <FormControlLabel control={<Checkbox />} label="Academic" />
                <FormControlLabel control={<Checkbox />} label="Public" />
              </FormGroup>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
              Section 2
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                1. Input Question
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Provide a short title for this document.
              </Typography>
              <TextField fullWidth size="small" placeholder="Type your answer here" />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                2. Paragraph Question
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Provide a summary of key considerations.
              </Typography>
              <TextField fullWidth multiline minRows={4} placeholder="Write your response here" />
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Appendix (Static Details)
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Version Notes
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Final edits completed. All validations passed. Ready for distribution and printing.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Contact
            </Typography>
            <Typography variant="body1">
              policy-team@example.com | +1 (555) 123-4567
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }} className="no-print">
          <Button variant="contained" color="primary" onClick={handleDownloadPdf}>
            Download PDF
          </Button>
          <Button variant="outlined" color="inherit" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default DocumentPreview
