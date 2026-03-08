import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'

import { applyFilteredShift } from '../utils/applyFilteredShift'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchSectionOrderData,
  submitSectionOrderData,
  setSections,
  setFullOrderSections,
  FilterRequest,
  Question,
  UpdateSectionOrderRequest,
  FilteredSection,
} from '../store/sectionOrderV2Slice'
import { fetchFilterOptions } from '../store/filterOptionsSlice'

interface FilterOption {
  keyVal: string
  keyDesc: string
}

const SectionOrderV2: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    sections,
    fullOrderSections,
    loading: reduxLoading,
    submitLoading: reduxSubmitLoading,
    error: reduxError,
  } = useAppSelector((state) => state.sectionOrderV2)

  const {
    reviewTypes: reviewTypeOptions,
    participantTypes: participantTypeOptions,
    countries: countryOptions,
  } = useAppSelector((state) => state.filterOptions)

  const [reviewTypes, setReviewTypes] = useState<string[]>([])
  const [participantTypes, setParticipantTypes] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [initialFullOrderSections, setInitialFullOrderSections] = useState<FilteredSection[]>([])
  const [draggedQuestion, setDraggedQuestion] = useState<{
    sectionId: number
    questionId: string
  } | null>(null)
  const [dragOverQuestion, setDragOverQuestion] = useState<{
    sectionId: number
    questionId: string
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState(reduxError || '')

  // Map keyVal to keyDesc for API call
  const mapKeyValToDesc = (keyVals: string[], options: FilterOption[]): string[] => {
    return keyVals.map((val) => options.find((opt) => opt.keyVal === val)?.keyDesc || val).filter(Boolean)
  }

  const getDisplayValue = (values: string[], options: FilterOption[]) => {
    return values
      .map((val) => options.find((opt) => opt.keyVal === val)?.keyDesc)
      .filter(Boolean)
      .join(', ')
  }

  // Helper function to check if order has changed
  const hasOrderChanged = (): boolean => {
    if (initialFullOrderSections.length === 0 || fullOrderSections.length === 0) {
      return false
    }

    // Compare each section's questions order
    for (let i = 0; i < fullOrderSections.length; i++) {
      const currentSection = fullOrderSections[i]
      const initialSection = initialFullOrderSections[i]

      if (!currentSection.questions || !initialSection.questions) return false

      // Check if question order is different
      const currentOrder = currentSection.questions.map((q) => q.questionId)
      const initialOrder = initialSection.questions.map((q) => q.questionId)

      if (currentOrder.length !== initialOrder.length) return true

      for (let j = 0; j < currentOrder.length; j++) {
        if (currentOrder[j] !== initialOrder[j]) {
          return true
        }
      }
    }

    return false
  }

  // Helper function to fix sequence numbers in filtered questions
  // API returns sequential numbers (1, 2, 3) but we need original (3, 5, 7)
  const fixFilteredSequenceNumbers = (
    filteredSections: FilteredSection[],
    fullSections: FilteredSection[]
  ): FilteredSection[] => {
    return filteredSections.map((section) => {
      // Find the corresponding full section
      const fullSection = fullSections.find((s) => s.sectionId === section.sectionId)

      if (!section.questions || !fullSection || !fullSection.questions) {
        return section
      }

      // Create a map of questionId -> original questionSeqNo
      const seqNumberMap = new Map<string, number>()
      fullSection.questions.forEach((q) => {
        seqNumberMap.set(q.questionId, q.questionSeqNo)
      })

      // Fix sequence numbers in filtered questions
      const correctedQuestions = section.questions.map((q) => {
        const originalSeqNo = seqNumberMap.get(q.questionId)
        if (originalSeqNo !== undefined) {
          return { ...q, questionSeqNo: originalSeqNo }
        }
        return q
      })

      return { ...section, questions: correctedQuestions }
    })
  }

  // Fetch filtered data based on filters
  const fetchFilteredData = async (reviewTypesVal: string[], participantTypesVal: string[], countriesVal: string[]) => {
    // Build API request payload with mapped descriptions
    const filterRequest: FilterRequest = {
      reviewTypes: mapKeyValToDesc(reviewTypesVal, reviewTypeOptions),
      participantTypes: mapKeyValToDesc(participantTypesVal, participantTypeOptions),
      countries: mapKeyValToDesc(countriesVal, countryOptions),
    }

    // Dispatch Redux thunk to fetch data
    const result = await dispatch(fetchSectionOrderData(filterRequest))
    
    // Check if the request was successful using meta.requestStatus
    if (result.meta.requestStatus === 'fulfilled' && result.payload) {
      // Success case
      const response = result.payload as any
      dispatch(setFullOrderSections(response.sections))
      
      // Store initial order for comparison
      setInitialFullOrderSections(JSON.parse(JSON.stringify(response.sections)))
      
      // Check if any filters are applied
      const filtersApplied = reviewTypesVal.length > 0 || participantTypesVal.length > 0 || countriesVal.length > 0
      
      // Determine what to display
      let sectionsToDisplay
      if (filtersApplied) {
        // If filters are applied, only show filtered results (even if empty)
        // Fix sequence numbers if API returns them sequentially
        sectionsToDisplay = fixFilteredSequenceNumbers(
          response.filteredSections,
          response.sections
        )
      } else {
        // If no filters, show all sections
        sectionsToDisplay = response.sections
      }
      
      dispatch(setSections(sectionsToDisplay))
    } else if (result.meta.requestStatus === 'rejected') {
      // Error case - set sections to empty and let Redux error handler show the error
      console.error('Error fetching data:', result.payload)
      dispatch(setSections([]))
    }
  }

  // Handle filter changes
  const handleReviewTypeChange = (e: any) => {
    const newReviewTypes = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
    setReviewTypes(newReviewTypes)
  }

  const handleParticipantTypeChange = (e: any) => {
    const newParticipantTypes =
      typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
    setParticipantTypes(newParticipantTypes)
  }

  const handleCountryChange = (e: any) => {
    const newCountries = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
    setCountries(newCountries)
  }

  // Fetch data whenever filters change
  useEffect(() => {
    fetchFilteredData(reviewTypes, participantTypes, countries)
  }, [reviewTypes, participantTypes, countries])

  // Load initial data on mount
  useEffect(() => {
    if (sections.length === 0 && fullOrderSections.length === 0) {
      fetchFilteredData([], [], [])
    }
  }, [])

  // Fetch filter options on mount
  useEffect(() => {
    dispatch(fetchFilterOptions())
  }, [dispatch])

  // Sync Redux error to component state
  useEffect(() => {
    if (reduxError) {
      setErrorMessage(reduxError)
    }
  }, [reduxError])

  const handleCancel = () => {
    setReviewTypes([])
    setParticipantTypes([])
    setCountries([])
  }

  const handleSubmit = () => {
    console.log('Filter applied:', {
      reviewTypes: mapKeyValToDesc(reviewTypes, reviewTypeOptions),
      participantTypes: mapKeyValToDesc(participantTypes, participantTypeOptions),
      countries: mapKeyValToDesc(countries, countryOptions),
    })

    submitSectionOrder()
  }

  const submitSectionOrder = async () => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      // Build request payload
      const request: UpdateSectionOrderRequest = {
        sections: fullOrderSections,
      }

      // Dispatch Redux thunk to submit
      const result = await dispatch(submitSectionOrderData(request))

      if (result.payload) {
        setSuccessMessage('Section order submitted successfully!')
        setSuccessDialogOpen(true)
      } else if (result.payload === undefined) {
        setErrorMessage('Failed to submit section order. Please check the console for more details.')
      }
    } catch (error) {
      console.error('Error submitting section order:', error)
      setErrorMessage('Failed to submit section order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false)
  }

  // Drag and Drop Handlers
  const handleQuestionDragStart = (
    e: React.DragEvent,
    sectionId: number,
    questionId: string
  ) => {
    console.log('Drag started:', questionId)
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    setDraggedQuestion({ sectionId, questionId })
  }

  const handleQuestionDragOver = (
    e: React.DragEvent,
    sectionId: number,
    questionId: string
  ) => {
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

  const handleQuestionDragEnd = () => {
    console.log('Drag ended')
    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  const handleQuestionDrop = (
    e: React.DragEvent,
    targetSectionId: number,
    targetQuestionId: string
  ) => {
    console.log('Drop triggered on:', targetQuestionId, 'draggedQuestion:', draggedQuestion)
    e.preventDefault()
    e.stopPropagation()

    if (!draggedQuestion) {
      console.log('No dragged question')
      setDragOverQuestion(null)
      return
    }

    const { sectionId: sourceSectionId, questionId: sourceQuestionId } = draggedQuestion

    if (sourceSectionId !== targetSectionId) {
      console.log('Different sections')
      setDraggedQuestion(null)
      setDragOverQuestion(null)
      return
    }

    // Get the current displayed section (could be filtered or unfiltered)
    const displayedSection = sections.find((s) => s.sectionId === sourceSectionId)
    if (!displayedSection || !displayedSection.questions) {
      console.log('No displayed section or questions')
      setDraggedQuestion(null)
      setDragOverQuestion(null)
      return
    }

    // Get the full order section for reference
    const fullSection = fullOrderSections.find((s) => s.sectionId === sourceSectionId)
    if (!fullSection || !fullSection.questions) {
      console.log('No full section or questions')
      setDraggedQuestion(null)
      setDragOverQuestion(null)
      return
    }

    // Check if filters are active by comparing section sizes
    const isFiltered = displayedSection.questions.length < fullSection.questions.length
    console.log('isFiltered:', isFiltered)

    // Get current displayed order
    const displayedOrder = displayedSection.questions.map((q) => q.questionId)
    const draggedIndex = displayedOrder.indexOf(sourceQuestionId)
    const targetIndex = displayedOrder.indexOf(targetQuestionId)

    console.log('draggedIndex:', draggedIndex, 'targetIndex:', targetIndex)
    console.log('displayedOrder:', displayedOrder)

    if (draggedIndex === -1 || targetIndex === -1) {
      console.log('Invalid indices')
      setDraggedQuestion(null)
      setDragOverQuestion(null)
      return
    }

    if (isFiltered) {
      // FILTERED VIEW: Swap the two questions directly
      console.log('Using SWAP behavior for filtered view')
      
      // Swap in displayed order
      const newDisplayedOrder = [...displayedOrder]
      const temp = newDisplayedOrder[draggedIndex]
      newDisplayedOrder[draggedIndex] = newDisplayedOrder[targetIndex]
      newDisplayedOrder[targetIndex] = temp

      // Find positions in full order and swap there
      const fullOrder = fullSection.questions.map((q) => q.questionId)
      const draggedFullIndex = fullOrder.indexOf(sourceQuestionId)
      const targetFullIndex = fullOrder.indexOf(targetQuestionId)

      const newFullOrder = [...fullOrder]
      const tempFull = newFullOrder[draggedFullIndex]
      newFullOrder[draggedFullIndex] = newFullOrder[targetFullIndex]
      newFullOrder[targetFullIndex] = tempFull

      console.log('newFullOrder:', newFullOrder)

      // Update full order sections - swap both position AND sequence numbers
      const updatedFullSections = fullOrderSections.map((s) => {
        if (s.sectionId === sourceSectionId && s.questions) {
          // Find the dragged and target questions
          const draggedQuestion = s.questions.find((q) => q.questionId === sourceQuestionId)
          const targetQuestion = s.questions.find((q) => q.questionId === targetQuestionId)

          if (!draggedQuestion || !targetQuestion) return s

          // Swap their sequence numbers
          const draggedSeqNo = draggedQuestion.questionSeqNo
          const targetSeqNo = targetQuestion.questionSeqNo

          // Reorder questions based on new full order
          const reorderedQuestions = newFullOrder.map((qId) => {
            const question = s.questions!.find((q) => q.questionId === qId)
            if (!question) return undefined

            // Swap sequence numbers for the two swapped items
            if (qId === sourceQuestionId) {
              return { ...question, questionSeqNo: targetSeqNo }
            } else if (qId === targetQuestionId) {
              return { ...question, questionSeqNo: draggedSeqNo }
            }
            return question
          }).filter((q): q is Question => q !== undefined)

          return {
            ...s,
            questions: reorderedQuestions,
          }
        }
        return s
      })

      dispatch(setFullOrderSections(updatedFullSections))

      // Update displayed sections
      const updatedDisplayedSections = sections.map((s) => {
        if (s.sectionId === sourceSectionId && s.questions) {
          const updatedFullSection = updatedFullSections.find((fs) => fs.sectionId === sourceSectionId)
          if (!updatedFullSection || !updatedFullSection.questions) return s

          // Keep displayed questions in their new order, getting their details from full section
          const reorderedQuestions = newDisplayedOrder
            .map((qId) => {
              const fullQuestion = updatedFullSection.questions!.find((q) => q.questionId === qId)
              return fullQuestion
            })
            .filter((q): q is Question => q !== undefined)

          return {
            ...s,
            questions: reorderedQuestions,
          }
        }
        return s
      })

      dispatch(setSections(updatedDisplayedSections))
    } else {
      // UNFILTERED VIEW: Shift behavior
      console.log('Using SHIFT behavior for unfiltered view')
      
      const newDisplayedOrder = [...displayedOrder]
      newDisplayedOrder.splice(draggedIndex, 1)
      newDisplayedOrder.splice(targetIndex, 0, sourceQuestionId)

      const fullOrder = fullSection.questions.map((q) => q.questionId)

      // Use applyFilteredShift for shift operations
      const newFullOrder = applyFilteredShift(fullOrder, displayedOrder, newDisplayedOrder)
      console.log('newFullOrder:', newFullOrder)

      // Update full order sections
      const updatedFullSections = fullOrderSections.map((s) => {
        if (s.sectionId === sourceSectionId && s.questions) {
          const reorderedQuestions = newFullOrder.map((qId) =>
            s.questions!.find((q) => q.questionId === qId)!
          )

          const updated = reorderedQuestions.map((q, idx) => ({
            ...q,
            questionSeqNo: idx + 1,
          }))

          return {
            ...s,
            questions: updated,
          }
        }
        return s
      })

      dispatch(setFullOrderSections(updatedFullSections))

      // Update displayed sections with new order
      const updatedDisplayedSections = sections.map((s) => {
        if (s.sectionId === sourceSectionId && s.questions) {
          const updatedFullSection = updatedFullSections.find((fs) => fs.sectionId === sourceSectionId)
          if (!updatedFullSection || !updatedFullSection.questions) return s

          const reorderedQuestions = newDisplayedOrder.map((qId) => {
            const fullQuestion = updatedFullSection.questions!.find((q) => q.questionId === qId)
            return fullQuestion!
          })

          return {
            ...s,
            questions: reorderedQuestions,
          }
        }
        return s
      })

      dispatch(setSections(updatedDisplayedSections))
    }

    setDraggedQuestion(null)
    setDragOverQuestion(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Section Order V2
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Review Types Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Review Types</InputLabel>
                <Select
                  multiple
                  value={reviewTypes}
                  onChange={handleReviewTypeChange}
                  input={<OutlinedInput label="Review Types" />}
                  renderValue={(selected) => getDisplayValue(selected as string[], reviewTypeOptions)}
                >
                  {reviewTypeOptions.map((option) => (
                    <MenuItem key={option.keyVal} value={option.keyVal}>
                      {option.keyDesc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Participant Types Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Participant Types</InputLabel>
                <Select
                  multiple
                  value={participantTypes}
                  onChange={handleParticipantTypeChange}
                  input={<OutlinedInput label="Participant Types" />}
                  renderValue={(selected) =>
                    getDisplayValue(selected as string[], participantTypeOptions)
                  }
                >
                  {participantTypeOptions.map((option) => (
                    <MenuItem key={option.keyVal} value={option.keyVal}>
                      {option.keyDesc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Countries Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Countries</InputLabel>
                <Select
                  multiple
                  value={countries}
                  onChange={handleCountryChange}
                  input={<OutlinedInput label="Countries" />}
                  renderValue={(selected) => getDisplayValue(selected as string[], countryOptions)}
                >
                  {countryOptions.map((option) => (
                    <MenuItem key={option.keyVal} value={option.keyVal}>
                      {option.keyDesc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="text"
              color="inherit"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting || sections.length === 0 || !hasOrderChanged()}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading Modal */}
      <Dialog 
        open={submitting || reduxSubmitLoading} 
        onClose={() => {}} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <CircularProgress size={50} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Submitting section order...
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Please wait while we process your changes
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mt: 2, mb: 2 }}
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>✓ Success</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>{successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading State - Only for fetching, not for submission (submission uses Modal Dialog) */}
      {reduxLoading && !submitting && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Sections Display */}
      {!reduxLoading && !submitting && sections.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sections.map((section) => (
            <Paper
              key={section.sectionId}
              sx={{
                p: 2,
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                transition: 'all 0.2s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {section.sectionSeqNo}. {section.sectionName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  ({section.questions?.length || 0} questions)
                </Typography>
              </Box>

              {section.questions && section.questions.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 1.5,
                    pl: 4
                  }}
                >
                  {section.questions.map((question: Question) => (
                    <Card
                      key={question.questionId}
                      draggable
                      onDragStart={(e) =>
                        handleQuestionDragStart(e, section.sectionId, question.questionId)
                      }
                      onDragOver={(e) =>
                        handleQuestionDragOver(e, section.sectionId, question.questionId)
                      }
                      onDragLeave={handleQuestionDragLeave}
                      onDrop={(e) =>
                        handleQuestionDrop(e, section.sectionId, question.questionId)
                      }
                      onDragEnd={handleQuestionDragEnd}
                      sx={{
                        cursor: 'grab',
                        userSelect: 'none',
                        backgroundColor:
                          draggedQuestion?.questionId === question.questionId
                            ? '#fff3e0'
                            : '#f5f5f5',
                        border:
                          dragOverQuestion?.sectionId === section.sectionId &&
                          dragOverQuestion?.questionId === question.questionId
                            ? '2px dashed #ff9800'
                            : '1px solid #ddd',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: 2,
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box
                            sx={{
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: '#23233F',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              flexShrink: 0
                            }}
                          >
                            {question.questionSeqNo}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.4, mb: 0.5 }}>
                              {question.questionText}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                  No questions in this section
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!reduxLoading && !submitting && sections.length === 0 && (
        <Card>
          <CardContent>
            <Typography color="textSecondary" align="center">
              No Data available
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default SectionOrderV2
