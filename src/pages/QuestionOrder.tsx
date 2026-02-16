import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import SaveIcon from '@mui/icons-material/Save'
import { mockApi, Question, ReviewType, ParticipantType, CountryType, Section, QuestionFilters } from '../services/mockApi'
import { applyFilteredReorder } from '../utils/applyFilteredReorder'

const reviewTypeOptions: ReviewType[] = ['Due Diligence', 'Periodic Review']
const participantTypeOptions: ParticipantType[] = ['XY', 'PQR']
const countryOptions: CountryType[] = ['USA', 'UK', 'India', 'Canada']

const reorderList = (items: string[], sourceId: string, targetId: string): string[] => {
  const fromIndex = items.indexOf(sourceId)
  const toIndex = items.indexOf(targetId)

  if (fromIndex === -1 || toIndex === -1) {
    return items
  }

  const next = [...items]
  const [removed] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, removed)
  return next
}

function QuestionOrder() {
  const [sections, setSections] = useState<Section[]>([])
  const [filters, setFilters] = useState<QuestionFilters>({})
  const [sectionData, setSectionData] = useState<
    { section: Section; orderedQuestions: Question[]; fullOrder: string[]; fullQuestionMap: Record<string, Question> }[]
  >([])
  const [originalOrderMap, setOriginalOrderMap] = useState<Record<string, Record<string, number>>>({})
  const [draggedQuestion, setDraggedQuestion] = useState<{ sectionId: string; questionId: string } | null>(null)
  const [dragOverQuestion, setDragOverQuestion] = useState<{ sectionId: string; questionId: string } | null>(null)
  const [reorderedQuestions, setReorderedQuestions] = useState<Set<string>>(new Set())
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingDrop, setPendingDrop] = useState<{ targetQuestionId: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({ open: false, message: '', severity: 'info' })

  const loadAllSections = useCallback(
    async (nextFilters: QuestionFilters, preserveOriginalOrder = false) => {
      if (sections.length === 0) {
        setSectionData([])
        return
      }

      const data = await Promise.all(
        sections.map(async (section) => {
          // Get all questions for this section from API
          const allQuestions: Question[] = await mockApi.getQuestionsBySection(section.id)
          const questionLookup: Record<string, Question> = {}
          allQuestions.forEach((question: Question) => {
            questionLookup[question.id] = question
          })

          // Get filtered questions from API
          const filteredQuestions = await mockApi.getFilteredQuestions(section.id, nextFilters)

          // Get full order from API
          const fullOrder = await mockApi.getSectionOrder(section.id)

          // Store original order on first load
          if (!preserveOriginalOrder && !originalOrderMap[section.id]) {
            const originalPositions: Record<string, number> = {}
            fullOrder.forEach((qId, idx) => {
              originalPositions[qId] = idx + 1
            })
            setOriginalOrderMap((prev) => ({ ...prev, [section.id]: originalPositions }))
          }

          return { section, orderedQuestions: filteredQuestions, fullOrder, fullQuestionMap: questionLookup }
        })
      )

      setSectionData(data)
    },
    [sections, originalOrderMap]
  )

  useEffect(() => {
    const initialize = async () => {
      const availableSections = await mockApi.getSections()
      setSections(availableSections)
    }

    initialize()
  }, [])

  useEffect(() => {
    if (sections.length > 0) {
      loadAllSections(filters)
    }
  }, [sections, filters, loadAllSections])

  const isFiltered = Boolean(filters.reviewType || filters.participantType || filters.country)

  const handleQuestionDragStart = (e: React.DragEvent, sectionId: string, questionId: string) => {
    e.stopPropagation()
    setDraggedQuestion({ sectionId, questionId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleQuestionDragOver = (e: React.DragEvent, sectionId: string, questionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'

    if (
      draggedQuestion &&
      draggedQuestion.sectionId === sectionId &&
      draggedQuestion.questionId !== questionId
    ) {
      setDragOverQuestion({ sectionId, questionId })
    }
  }

  const handleQuestionDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    setDragOverQuestion(null)
  }

  const handleQuestionDrop = async (e: React.DragEvent, targetSectionId: string, targetQuestionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedQuestion) {
      setDragOverQuestion(null)
      return
    }

    const { sectionId: sourceSectionId, questionId: sourceQuestionId } = draggedQuestion

    if (sourceSectionId !== targetSectionId) {
      setDraggedQuestion(null)
      setDragOverQuestion(null)
      return
    }

    // If filters are active, show confirmation dialog
    if (isFiltered) {
      setPendingDrop({ targetQuestionId })
      setConfirmDialogOpen(true)
      setDragOverQuestion(null)
      return
    }

    // No filters active, proceed directly
    await executeReorder(sourceSectionId, sourceQuestionId, targetQuestionId)
  }

  const executeReorder = async (
    sourceSectionId: string,
    sourceQuestionId: string,
    targetQuestionId: string
  ) => {
    const fullOrder = await mockApi.getSectionOrder(sourceSectionId)
    const filteredOrder = await mockApi.getFilteredQuestionIds(sourceSectionId, filters)

    const nextFilteredOrder = reorderList(filteredOrder, sourceQuestionId, targetQuestionId)
    const nextFullOrder = isFiltered
      ? applyFilteredReorder(fullOrder, filteredOrder, nextFilteredOrder)
      : nextFilteredOrder

    if (isFiltered) {
      console.log('=== Filtered Reorder Logic ===')
      console.log('Original full order:', fullOrder)
      console.log('Filtered order (before):', filteredOrder)
      console.log('Filtered order (after drag):', nextFilteredOrder)
      console.log('Final full order:', nextFullOrder)
      console.log('==============================')
    }

    await mockApi.saveSectionOrder(sourceSectionId, nextFullOrder)
    console.log('Full order for section', sourceSectionId, ':', nextFullOrder)

    setReorderedQuestions((prev) => new Set(prev).add(sourceQuestionId))
    setDraggedQuestion(null)
    setDragOverQuestion(null)

    await loadAllSections(filters, true)
  }

  const handleConfirmReorder = async () => {
    if (!draggedQuestion || !pendingDrop) {
      setConfirmDialogOpen(false)
      return
    }

    const { sectionId: sourceSectionId, questionId: sourceQuestionId } = draggedQuestion
    const { targetQuestionId } = pendingDrop

    setConfirmDialogOpen(false)
    setPendingDrop(null)

    await executeReorder(sourceSectionId, sourceQuestionId, targetQuestionId)
  }

  const handleCancelReorder = () => {
    setConfirmDialogOpen(false)
    setPendingDrop(null)
    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  const handleQuestionDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  const handleExport = async () => {
    const payload = await mockApi.exportData()
    console.log('Data export', payload)
    
    // Create a downloadable JSON file
    const jsonString = JSON.stringify(payload, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = `question-order-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleReset = async () => {
    await mockApi.resetData()
    const availableSections = await mockApi.getSections()
    setSections(availableSections)
    setReorderedQuestions(new Set())
    setOriginalOrderMap({})
    
    console.log('Data reset complete. Sections:', availableSections.length)
    const allQuestions = await mockApi.getQuestions()
    console.log('Total questions loaded:', allQuestions.length)
    console.log('Questions by participant type:', {
      XY: allQuestions.filter(q => q.participantType === 'XY').length,
      PQR: allQuestions.filter(q => q.participantType === 'PQR').length
    })
  }

  const handleSaveToAPI = async () => {
    try {
      setSaving(true)

      // Build the data structure with global order
      let globalQuestionOrder = 1
      const formattedData = {
        sections: sectionData.map(({ section, fullOrder }) => ({
          sectionID: section.id,  // Already numeric format from database
          questions: fullOrder.map((questionId) => {
            const formatted = {
              questionID: questionId,  // Already in QID format from database
              QuestionOrder: globalQuestionOrder
            }
            globalQuestionOrder++
            return formatted
          })
        }))
      }

      console.log('=== POST Data (Question Order) ===')
      console.log('Data Object:', formattedData)
      console.log('JSON String:', JSON.stringify(formattedData, null, 2))
      console.log('===================================')

      setSnackbar({
        open: true,
        message: 'Data logged to console successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error logging data:', error)
      setSnackbar({
        open: true,
        message: 'Failed to log data. Check console for details.',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Question Order Manager
      </Typography>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelReorder}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirm Reorder
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are reordering questions while filters are active. This action will change the <strong>final order of ALL questions</strong>, not just the filtered ones.
            <br /><br />
            The questions not currently visible (due to filters) will be repositioned to maintain relative ordering.
            <br /><br />
            Do you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReorder} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmReorder} variant="contained" color="warning" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag questions within sections to reorder. Apply filters to see specific question types. Data fetched from Mock API.
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="review-type-select-label">Review Type</InputLabel>
          <Select
            labelId="review-type-select-label"
            label="Review Type"
            value={filters.reviewType ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                reviewType: event.target.value ? (event.target.value as ReviewType) : undefined
              }))
            }
          >
            <MenuItem value="">All</MenuItem>
            {reviewTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="participant-type-select-label">Participant Type</InputLabel>
          <Select
            labelId="participant-type-select-label"
            label="Participant Type"
            value={filters.participantType ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                participantType: event.target.value ? (event.target.value as ParticipantType) : undefined
              }))
            }
          >
            <MenuItem value="">All</MenuItem>
            {participantTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="country-select-label">Country</InputLabel>
          <Select
            labelId="country-select-label"
            label="Country"
            value={filters.country ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                country: event.target.value ? (event.target.value as CountryType) : undefined
              }))
            }
          >
            <MenuItem value="">All</MenuItem>
            {countryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveToAPI}
            disabled={saving}
          >
            {saving ? 'Logging...' : 'Save to API'}
          </Button>
          <Button variant="outlined" onClick={handleExport}>
            Export JSON
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleReset}>
            Reset Mock Data
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sectionData.map(({ section, orderedQuestions, fullOrder, fullQuestionMap }) => (
          <Paper
            key={section.id}
            sx={{
              p: 2,
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{section.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                ({orderedQuestions.length} questions)
              </Typography>
            </Box>

            {orderedQuestions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                No questions match the selected filters in this section.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 1.5,
                  pl: 4
                }}
              >
                {orderedQuestions.map((question, index) => {
                  const originalPosition = originalOrderMap[section.id]?.[question.id]
                  const currentPosition = index + 1
                  const hasOrderChanged = originalPosition && originalPosition !== currentPosition

                  return (
                    <Card
                      key={question.id}
                      draggable
                      onDragStart={(e) => handleQuestionDragStart(e, section.id, question.id)}
                      onDragOver={(e) => handleQuestionDragOver(e, section.id, question.id)}
                      onDragLeave={handleQuestionDragLeave}
                      onDrop={(e) => handleQuestionDrop(e, section.id, question.id)}
                      onDragEnd={handleQuestionDragEnd}
                      sx={{
                        cursor: 'grab',
                        backgroundColor:
                          draggedQuestion?.questionId === question.id
                            ? '#fff3e0'
                            : reorderedQuestions.has(question.id)
                              ? '#e0e0e0'
                              : '#f5f5f5',
                        border:
                          dragOverQuestion?.sectionId === section.id && dragOverQuestion?.questionId === question.id
                            ? '2px dashed #ff9800'
                            : reorderedQuestions.has(question.id)
                              ? '2px solid #757575'
                              : '1px solid #ddd',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: 2
                        },
                        '&:active': {
                          cursor: 'grabbing'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: hasOrderChanged ? '#ff9800' : '#1976d2',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              flexShrink: 0
                            }}
                          >
                            {currentPosition}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.4, mb: 0.5 }}>
                              {question.text}
                            </Typography>
                            {hasOrderChanged && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  fontSize: '0.7rem',
                                  color: '#ff9800',
                                  fontWeight: 600,
                                  mb: 0.3
                                }}
                              >
                                Previous: {originalPosition} → New: {currentPosition}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                              {question.reviewType} • {question.participantType} • {question.country}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })}
              </Box>
            )}

            {isFiltered && orderedQuestions.length > 0 && (
              <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 1, border: '1px solid #90caf9' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2', display: 'block', mb: 0.5 }}>
                  Filtered Order ({orderedQuestions.length} questions):
                </Typography>
                <Typography variant="caption" sx={{ color: '#444', lineHeight: 1.6 }}>
                  {orderedQuestions.map((q, idx) => (
                    <span key={q.id}>
                      {idx + 1}. {q.text}
                      {idx < orderedQuestions.length - 1 ? ' → ' : ''}
                    </span>
                  ))}
                </Typography>
                <Typography variant="caption" sx={{ color: '#1976d2', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  This shows only questions matching the current filters.
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', display: 'block', mb: 0.5 }}>
                Final Order (All Questions):
              </Typography>
              <Typography variant="caption" sx={{ color: '#444', lineHeight: 1.6 }}>
                {fullOrder.map((qId, idx) => {
                  const q = fullQuestionMap[qId]
                  if (!q) return null
                  const isHiddenByFilter = !orderedQuestions.some(oq => oq.id === qId)
                  return (
                    <span key={qId} style={{ opacity: isHiddenByFilter ? 0.5 : 1, fontStyle: isHiddenByFilter ? 'italic' : 'normal' }}>
                      {idx + 1}. {q.text}
                      {idx < fullOrder.length - 1 ? ' → ' : ''}
                    </span>
                  )
                }).filter(Boolean)}
              </Typography>
              {isFiltered && (
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                  Note: Grayed out questions are hidden by active filters but still maintain their position in the full order.
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default QuestionOrder
