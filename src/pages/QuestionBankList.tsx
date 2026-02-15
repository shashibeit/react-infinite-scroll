import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CancelIcon from '@mui/icons-material/Cancel'
import { appDb, Question } from '../db/appDb'
import { usePermissions } from '../store/authHooks'
import { useAppSelector } from '../store/hooks'

function QuestionBankList() {
  const navigate = useNavigate()
  const permissions = usePermissions()
  const { userRole } = useAppSelector((state) => state.auth)
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [questionToCancel, setQuestionToCancel] = useState<Question | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const allQuestions = await appDb.questions.toArray()
      setQuestions(allQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter((question) =>
    question.text.toLowerCase().includes(searchText.toLowerCase()) ||
    question.id.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleCreateQuestion = () => {
    navigate('/question-bank/create')
  }

  const handleCancelClick = (question: Question) => {
    setQuestionToCancel(question)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!questionToCancel) return

    try {
      // Update the question status to CANCELLED
      await appDb.questions.update(questionToCancel.id, {
        status: 'CANCELLED'
      })

      // Reload questions
      await loadQuestions()
      
      setCancelDialogOpen(false)
      setQuestionToCancel(null)
    } catch (error) {
      console.error('Error cancelling question:', error)
    }
  }

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false)
    setQuestionToCancel(null)
  }

  const canCancelQuestion = (question: Question): boolean => {
    // User can cancel if:
    // 1. Question is in REVIEW status
    // 2. Current user created the question
    return question.status === 'REVIEW' && question.createdBy === userRole
  }

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Question Bank
        </Typography>
        {permissions.canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateQuestion}
          >
            Create Question
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage all questions in the question bank. Create new questions or edit existing ones.
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search questions..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 3, maxWidth: 600 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">Loading questions...</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Question Text</strong></TableCell>
                  <TableCell><strong>Section</strong></TableCell>
                  <TableCell><strong>Review Type</strong></TableCell>
                  <TableCell><strong>Participant Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created By</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow
                    key={question.id}
                    hover
                  >
                    <TableCell>{question.id}</TableCell>
                    <TableCell sx={{ maxWidth: 400 }}>{question.text}</TableCell>
                    <TableCell>{question.sectionId}</TableCell>
                    <TableCell>{question.reviewType}</TableCell>
                    <TableCell>{question.participantType}</TableCell>
                    <TableCell>
                      <Chip
                        label={question.status}
                        color={
                          question.status === 'APPROVED' 
                            ? 'success' 
                            : question.status === 'CANCELLED'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{question.createdBy || 'System'}</TableCell>
                    <TableCell align="center">
                      {canCancelQuestion(question) && (
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleCancelClick(question)}
                          title="Cancel Request"
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredQuestions.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography color="text.secondary">
                {searchText ? 'No questions found' : 'No questions in the bank yet'}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total: {filteredQuestions.length} questions
            </Typography>
          </Box>
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Question Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this question request? This action cannot be undone. The question will be marked as cancelled and removed from the approval queue.
          </DialogContentText>
          {questionToCancel && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Question:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {questionToCancel.text}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose}>
            Keep Request
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
          >
            Cancel Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuestionBankList
