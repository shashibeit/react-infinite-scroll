import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  IconButton,
  Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { appDb, Section, ReviewType, ParticipantType } from '../db/appDb'
import { useAppSelector } from '../store/hooks'

type ResponseType = 'Multi select' | 'Single Select' | 'Text' | 'Input' | 'Paragraph' | ''

const countryOptions = [
  'USA', 'UK', 'Canada', 'Germany', 'France', 'India', 'Australia', 'Japan', 'China', 'Brazil'
]

function CreateQuestion() {
  const { userRole } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const [sections, setSections] = useState<Section[]>([])
  const [formData, setFormData] = useState({
    text: '',
    sectionId: '',
    reviewType: '' as ReviewType | '',
    participantType: '' as ParticipantType | '',
    status: 'REVIEW' as const,
    isActive: true,
    isDefaultQuestion: false,
    responseType: '' as ResponseType,
    country: ''
  })
  const [options, setOptions] = useState<string[]>(['', ''])

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    const allSections = await appDb.sections.toArray()
    setSections(allSections)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.text || !formData.sectionId || !formData.reviewType || !formData.participantType || !formData.responseType) {
      alert('Please fill in all required fields')
      return
    }

    // Validate options for Single Select and Multi select
    if ((formData.responseType === 'Single Select' || formData.responseType === 'Multi select') && 
        options.some(opt => opt.trim() === '')) {
      alert('Please fill in all option values')
      return
    }

    try {
      // Generate a unique ID for the question
      const timestamp = Date.now()
      const questionId = `${formData.sectionId}-q${timestamp}`

      await appDb.questions.add({
        id: questionId,
        text: formData.text,
        sectionId: formData.sectionId,
        reviewType: formData.reviewType as ReviewType,
        participantType: formData.participantType as ParticipantType,
        status: formData.status,
        createdBy: userRole || 'Unknown',
        createdAt: new Date().toISOString()
      })

      // Add to section question order
      const existingOrders = await appDb.sectionQuestionOrder
        .where('sectionId')
        .equals(formData.sectionId)
        .toArray()

      // Get the highest orderIndex for this section
      const maxOrderIndex = existingOrders.length > 0
        ? Math.max(...existingOrders.map(o => o.orderIndex))
        : -1

      // Add new question to order
      await appDb.sectionQuestionOrder.add({
        sectionId: formData.sectionId,
        questionId: questionId,
        orderIndex: maxOrderIndex + 1
      })

      console.log('Question created:', {
        ...formData,
        options: (formData.responseType === 'Single Select' || formData.responseType === 'Multi select') ? options : undefined
      })

      alert('Question created successfully!')
      navigate('/question-bank/list')
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Failed to create question. Please try again.')
    }
  }

  const handleCancel = () => {
    navigate('/question-bank/list')
  }

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const showOptions = formData.responseType === 'Single Select' || formData.responseType === 'Multi select'

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleCancel}
        sx={{ mb: 2 }}
      >
        Back to List
      </Button>

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create New Question
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Question Text"
              required
              fullWidth
              multiline
              rows={4}
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Enter the question text..."
            />

            <FormControl fullWidth required>
              <InputLabel>Section</InputLabel>
              <Select
                value={formData.sectionId}
                label="Section"
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              >
                {sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Review Type</InputLabel>
              <Select
                value={formData.reviewType}
                label="Review Type"
                onChange={(e) => setFormData({ ...formData, reviewType: e.target.value as ReviewType })}
              >
                <MenuItem value="Due Diligence">Due Diligence</MenuItem>
                <MenuItem value="Periodic Review">Periodic Review</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Participant Type</InputLabel>
              <Select
                value={formData.participantType}
                label="Participant Type"
                onChange={(e) => setFormData({ ...formData, participantType: e.target.value as ParticipantType })}
              >
                <MenuItem value="XY">XY</MenuItem>
                <MenuItem value="PQR">PQR</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                label="Country"
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {countryOptions.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Response Type</InputLabel>
              <Select
                value={formData.responseType}
                label="Response Type"
                onChange={(e) => {
                  const newResponseType = e.target.value as ResponseType
                  setFormData({ ...formData, responseType: newResponseType })
                  // Reset options when changing to/from option-based types
                  if (newResponseType === 'Single Select' || newResponseType === 'Multi select') {
                    if (options.length === 0) {
                      setOptions(['', ''])
                    }
                  }
                }}
              >
                <MenuItem value="Single Select">Single Select</MenuItem>
                <MenuItem value="Multi select">Multi select</MenuItem>
                <MenuItem value="Text">Text</MenuItem>
                <MenuItem value="Input">Input</MenuItem>
                <MenuItem value="Paragraph">Paragraph</MenuItem>
              </Select>
            </FormControl>

            {showOptions && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Options for {formData.responseType}
                </Typography>
                <Stack spacing={2}>
                  {options.map((option, index) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center">
                      <TextField
                        fullWidth
                        label={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Enter option ${index + 1}`}
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveOption(index)}
                        disabled={options.length <= 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddOption}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Add Option
                  </Button>
                </Stack>
              </Box>
            )}

            <Divider />

            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefaultQuestion}
                    onChange={(e) => setFormData({ ...formData, isDefaultQuestion: e.target.checked })}
                  />
                }
                label="Default Question"
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
              >
                Create Question
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}

export default CreateQuestion
