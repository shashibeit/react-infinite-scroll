import { useEffect, useState } from 'react'
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
  Alert,
  Chip,
  TextField,
  Tooltip,
  Grid
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { useQuestionOrder } from '../store/questionOrderHooks'
import { applyFilteredShift } from '../utils/applyFilteredShift'

// Note: These options should ideally come from an API endpoint
const reviewTypeOptions = [
  { keyValue: 'DD', keyDesc: 'Due Diligence' },
  { keyValue: 'PR', keyDesc: 'Periodic Review' }
]
const participantTypeOptions = [
  { keyValue: 'XY', keyDesc: 'XY' },
  { keyValue: 'PQR', keyDesc: 'PQR' }
]
const countryOptions = [
  { keyValue: 'USA', keyDesc: 'USA' },
  { keyValue: 'UK', keyDesc: 'UK' },
  { keyValue: 'IND', keyDesc: 'India' },
  { keyValue: 'CAN', keyDesc: 'Canada' }
]

function SectionOrder() {
  // Redux state and actions
  const {
    sections,
    allSections,
    filters,
    isFiltered,
    loadData,
    updateFilters,
    resetData,
    updateQuestions
  } = useQuestionOrder()

  // Local UI state
  const [originalOrderMap, setOriginalOrderMap] = useState<Record<number, Record<string, number>>>({})
  const [draggedQuestion, setDraggedQuestion] = useState<{ sectionId: number; questionId: string } | null>(null)
  const [dragOverQuestion, setDragOverQuestion] = useState<{ sectionId: number; questionId: string } | null>(null)
  const [reorderedQuestions, setReorderedQuestions] = useState<Set<string>>(new Set())
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingDrop, setPendingDrop] = useState<{ 
    sourceSectionId: number
    sourceQuestionId: string
    targetQuestionId: string 
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({ open: false, message: '', severity: 'info' })
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set(sections.map(s => s.sectionID)))

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Update expanded sections when sections change
  useEffect(() => {
    setExpandedSections(new Set(sections.map(s => s.sectionID)))
  }, [sections.length])

  // Store original order on first load
  useEffect(() => {
    if (sections.length > 0) {
      sections.forEach((section) => {
        if (!originalOrderMap[section.sectionID]) {
          const originalPositions: Record<string, number> = {}
          section.questions.forEach((q, idx) => {
            originalPositions[q.questionID] = idx + 1
          })
          setOriginalOrderMap((prev) => ({ ...prev, [section.sectionID]: originalPositions }))
        }
      })
    }
  }, [sections, originalOrderMap])

  const handleQuestionDragStart = (e: React.DragEvent, sectionId: number, questionId: string) => {
    e.stopPropagation()
    setDraggedQuestion({ sectionId, questionId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleQuestionDragOver = (e: React.DragEvent, sectionId: number, questionId: string) => {
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

  const handleQuestionDrop = async (e: React.DragEvent, targetSectionId: number, targetQuestionId: string) => {
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
      // Store all information in pendingDrop to survive dragEnd event
      setPendingDrop({ 
        sourceSectionId,
        sourceQuestionId,
        targetQuestionId 
      })
      setConfirmDialogOpen(true)
      setDragOverQuestion(null)
      return
    }

    // No filters active, proceed directly
    await executeReorder(sourceSectionId, sourceQuestionId, targetQuestionId)
  }

  const executeReorder = async (
    sourceSectionId: number,
    sourceQuestionId: string,
    targetQuestionId: string
  ) => {
    // Find the section in Redux state
    const section = allSections.find(s => s.sectionID === sourceSectionId)
    if (!section) return

    const fullOrder = section.questions.map(q => q.questionID)
    const filteredOrder = sections.find(s => s.sectionID === sourceSectionId)?.questions.map(q => q.questionID) || []

    const fromIndex = filteredOrder.indexOf(sourceQuestionId)
    const toIndex = filteredOrder.indexOf(targetQuestionId)
    
    if (fromIndex === -1 || toIndex === -1) return

    const nextFilteredOrder = [...filteredOrder]
    const [removed] = nextFilteredOrder.splice(fromIndex, 1)
    nextFilteredOrder.splice(toIndex, 0, removed)

    const nextFullOrder = isFiltered
      ? applyFilteredShift(fullOrder, filteredOrder, nextFilteredOrder)
      : nextFilteredOrder

    // Create updated questions array with new order
    const updatedQuestions = nextFullOrder.map((qId, idx) => {
      const originalQ = section.questions.find(q => q.questionID === qId)!
      return { ...originalQ, questionOrderId: idx + 1 }
    })

    // Update Redux state
    updateQuestions(sourceSectionId, updatedQuestions)

    setReorderedQuestions((prev) => new Set(prev).add(sourceQuestionId))
    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  const handleConfirmReorder = async () => {
    if (!pendingDrop) {
      setConfirmDialogOpen(false)
      return
    }

    const { sourceSectionId, sourceQuestionId, targetQuestionId } = pendingDrop

    setConfirmDialogOpen(false)
    setPendingDrop(null)
    setDraggedQuestion(null)

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
    // Clear drag state - pendingDrop will preserve info we need for confirmation
    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  const handleExport = () => {
    const payload = {
      status: 'SUCCESS',
      filteredSections: isFiltered ? sections : [],
      sections: allSections
    }
    console.log('Data export', payload)
    
    const jsonString = JSON.stringify(payload, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `section-order-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleReset = async () => {
    resetData()
    setReorderedQuestions(new Set())
    setOriginalOrderMap({})
    
    console.log('Data reset complete')
  }

  const handleSaveToAPI = async () => {
    try {
      setSaving(true)

      // Build the output with global QuestionOrder
      let globalQuestionOrder = 1
      const formattedData = {
        sections: allSections.map((section) => ({
          sectionID: section.sectionID,
          questions: section.questions.map((question) => {
            const formatted = {
              questionID: question.questionID,
              QuestionOrder: globalQuestionOrder
            }
            globalQuestionOrder++
            return formatted
          })
        }))
      }

      console.log('=== POST Data to API ===')
      console.log('Formatted Data Object:', formattedData)
      console.log('POST Body (stringified):', JSON.stringify(formattedData, null, 2))
      console.log('========================')
      
      setSnackbar({
        open: true,
        message: 'Section order saved successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving to API:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save section order. Check console for details.',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Toggle section expansion
  const toggleSectionExpand = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Count active filters
  const activeFiltersCount = (
    (filters.reviewType?.length || 0) +
    (filters.participantType?.length || 0) +
    (filters.country?.length || 0)
  )

  // Filter questions by search term
  const filterQuestionsBySearch = (questions: any[]) => {
    if (!searchTerm) return questions
    return questions.filter(q => 
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Get metadata for question
  const getQuestionMetadata = (question: any) => {
    return [
      { label: question.reviewType, color: 'primary', icon: '📋' },
      { label: question.participantType, color: 'secondary', icon: '👤' },
      { label: question.country, color: 'success', icon: '🌍' }
    ]
  }

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Section Order Manager
      </Typography>

      {/* Statistics Card */}
      <Paper sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <FolderOpenIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{sections.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Sections</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <LocalOfferIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{sections.reduce((sum, s) => sum + s.questions.length, 0)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Questions</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{reorderedQuestions.size}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Reordered</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{activeFiltersCount}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Filters Active</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelReorder}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirm Shift Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are shifting questions while filters are active. This action will shift the <strong>final order of ALL questions</strong>, not just the filtered ones.
            <br /><br />
            The dragged question will be inserted at the new position, and all other questions will shift accordingly.
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
        Drag and drop questions to shift their positions. When you drag a question to a new position, it will be inserted there and all other questions will shift accordingly. Apply filters to see specific question types. Data fetched from Mock API.
      </Typography>

      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#e8f5e9', border: '1px solid #4caf50' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
          💡 Shift Behavior Example:
        </Typography>
        <Typography variant="body2" sx={{ color: '#1b5e20' }}>
          If filtered questions show: <strong>4, 7, 8</strong>
          <br />
          And you drag <strong>8</strong> to the position of <strong>4</strong>
          <br />
          The new order will be: <strong>8, 4, 7</strong> (question 8 is inserted before 4, others shift down)
        </Typography>
      </Paper>

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="🔍 Search questions by text..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        variant="outlined"
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          endAdornment: searchTerm && (
            <Tooltip title="Clear search">
              <CloseIcon 
                sx={{ cursor: 'pointer', mr: 1 }} 
                onClick={() => setSearchTerm('')}
              />
            </Tooltip>
          )
        }}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="review-type-select-label">Review Type</InputLabel>
          <Select
            labelId="review-type-select-label"
            label="Review Type"
            multiple
            value={filters.reviewType ?? []}
            onChange={(event) => {
              const value = event.target.value as string[]
              const newFilters = {
                ...filters,
                reviewType: value && value.length > 0 ? value : undefined
              }
              updateFilters(newFilters)
            }}
          >
            {reviewTypeOptions.map((option) => (
              <MenuItem key={option.keyValue} value={option.keyValue}>
                {option.keyDesc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="participant-type-select-label">Participant Type</InputLabel>
          <Select
            labelId="participant-type-select-label"
            label="Participant Type"
            multiple
            value={filters.participantType ?? []}
            onChange={(event) => {
              const value = event.target.value as string[]
              const newFilters = {
                ...filters,
                participantType: value && value.length > 0 ? value : undefined
              }
              updateFilters(newFilters)
            }}
          >
            {participantTypeOptions.map((option) => (
              <MenuItem key={option.keyValue} value={option.keyValue}>
                {option.keyDesc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="country-select-label">Country</InputLabel>
          <Select
            labelId="country-select-label"
            label="Country"
            multiple
            value={filters.country ?? []}
            onChange={(event) => {
              const value = event.target.value as string[]
              const newFilters = {
                ...filters,
                country: value && value.length > 0 ? value : undefined
              }
              updateFilters(newFilters)
            }}
          >
            {countryOptions.map((option) => (
              <MenuItem key={option.keyValue} value={option.keyValue}>
                {option.keyDesc}
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
            {saving ? 'Saving...' : 'Save to API'}
          </Button>
          <Button variant="outlined" onClick={handleExport}>
            Export JSON
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleReset}>
            Reset Mock Data
          </Button>
        </Stack>
      </Stack>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>
            Active Filters:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.reviewType?.map((value) => (
              <Chip
                key={`review-${value}`}
                label={`📋 ${value}`}
                onDelete={() => updateFilters({ 
                  ...filters, 
                  reviewType: filters.reviewType?.filter(v => v !== value).length ? filters.reviewType?.filter(v => v !== value) : undefined 
                })}
                color="primary"
                variant="outlined"
              />
            ))}
            {filters.participantType?.map((value) => (
              <Chip
                key={`participant-${value}`}
                label={`👤 ${value}`}
                onDelete={() => updateFilters({ 
                  ...filters, 
                  participantType: filters.participantType?.filter(v => v !== value).length ? filters.participantType?.filter(v => v !== value) : undefined 
                })}
                color="secondary"
                variant="outlined"
              />
            ))}
            {filters.country?.map((value) => (
              <Chip
                key={`country-${value}`}
                label={`🌍 ${value}`}
                onDelete={() => updateFilters({ 
                  ...filters, 
                  country: filters.country?.filter(v => v !== value).length ? filters.country?.filter(v => v !== value) : undefined 
                })}
                color="success"
                variant="outlined"
              />
            ))}
            {activeFiltersCount > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={() => updateFilters({})}
                sx={{ ml: 1 }}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map((section) => {
          // Get full section from allSections
          const fullSection = allSections.find(s => s.sectionID === section.sectionID)
          const orderedQuestions = section.questions
          const fullOrder = fullSection?.questions || []

          return (
            <Paper
              key={section.sectionID}
              sx={{
                p: 2,
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                transition: 'all 0.2s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title={expandedSections.has(section.sectionID) ? "Collapse section" : "Expand section"}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => toggleSectionExpand(section.sectionID)}
                      sx={{ minWidth: 32, p: 0 }}
                    >
                      {expandedSections.has(section.sectionID) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </Button>
                  </Tooltip>
                  <Typography variant="h6">{section.sectionName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({orderedQuestions.length} questions)
                  </Typography>
                </Box>
              </Box>

              {expandedSections.has(section.sectionID) && (
                <>
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
                      {filterQuestionsBySearch(orderedQuestions).map((question, index) => {
                        const originalPosition = originalOrderMap[section.sectionID]?.[question.questionID]
                        const currentPosition = index + 1
                        const hasOrderChanged = originalPosition && originalPosition !== currentPosition
                        const metadata = getQuestionMetadata(question)

                    return (
                      <Card
                        key={question.questionID}
                        draggable
                        onDragStart={(e) => handleQuestionDragStart(e, section.sectionID, question.questionID)}
                        onDragOver={(e) => handleQuestionDragOver(e, section.sectionID, question.questionID)}
                        onDragLeave={handleQuestionDragLeave}
                        onDrop={(e) => handleQuestionDrop(e, section.sectionID, question.questionID)}
                        onDragEnd={handleQuestionDragEnd}
                        sx={{
                          cursor: 'grab',
                          backgroundColor:
                            draggedQuestion?.questionId === question.questionID
                              ? '#fff3e0'
                              : reorderedQuestions.has(question.questionID)
                                ? '#e0e0e0'
                                : '#f5f5f5',
                          border:
                            dragOverQuestion?.sectionId === section.sectionID && dragOverQuestion?.questionId === question.questionID
                              ? '2px dashed #ff9800'
                              : reorderedQuestions.has(question.questionID)
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
                                {question.questionText}
                              </Typography>
                              {hasOrderChanged && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    fontSize: '0.7rem',
                                    color: '#ff9800',
                                    fontWeight: 600,
                                    mb: 0.5
                                  }}
                                >
                                  Previous: {originalPosition} → New: {currentPosition}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                {metadata.map((meta, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`${meta.icon} ${meta.label}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                  />
                                ))}
                              </Stack>
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
                      <span key={q.questionID}>
                        {idx + 1}. {q.questionText}
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
                  {fullOrder.map((q, idx) => {
                    const isHiddenByFilter = !orderedQuestions.some(oq => oq.questionID === q.questionID)
                    return (
                      <span key={q.questionID} style={{ opacity: isHiddenByFilter ? 0.5 : 1, fontStyle: isHiddenByFilter ? 'italic' : 'normal' }}>
                        {idx + 1}. {q.questionText}
                        {idx < fullOrder.length - 1 ? ' → ' : ''}
                      </span>
                    )
                  })}
                </Typography>
                {isFiltered && (
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                    Note: Grayed out questions are hidden by active filters but still maintain their position in the full order.
                  </Typography>
                )}
              </Box>
                </>
              )}
            </Paper>
          )
        })}
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

export default SectionOrder
