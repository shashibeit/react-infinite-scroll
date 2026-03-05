import { useState } from 'react'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Tooltip,
  Divider,
  Button,
  Chip,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlagIcon from '@mui/icons-material/Flag'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

type UserRole = 'DD Manager' | 'SME Analyst' | 'Risk SME View'

interface DiffPart {
  text: string
  type: 'added' | 'removed' | 'same'
}

interface QuestionApprovalItem {
  changeRequestId: string
  questionId: string
  questionText: string
  assignedTo: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  requestedBy: string
  requestedByRole: UserRole
  attribute: string
  dateRequested: string
  asIs: string
  toBe: string
  comment: string
}

const mockApprovals: QuestionApprovalItem[] = []

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength)}...`
}

const renderDiff = (parts: DiffPart[]) =>
  parts.map((part, index) => {
    if (part.type === 'added') {
      return (
        <Box
          key={`part-${index}`}
          component="span"
          sx={{ color: '#1e40af', fontWeight: 700 }}
        >
          {part.text}
        </Box>
      )
    }

    if (part.type === 'removed') {
      return (
        <Box
          key={`part-${index}`}
          component="span"
          sx={{
            color: 'text.secondary',
            textDecoration: 'line-through',
            textDecorationStyle: 'dashed'
          }}
        >
          {part.text}
        </Box>
      )
    }

    return (
      <Box key={`part-${index}`} component="span">
        {part.text}
      </Box>
    )
  })

const tokenizeText = (text: string) => text.match(/\S+|\s+/g) || []

const buildDiffParts = (fromText: string, toText: string) => {
  const fromTokens = tokenizeText(fromText)
  const toTokens = tokenizeText(toText)
  const rows = fromTokens.length
  const cols = toTokens.length
  const dp = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0))

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      if (fromTokens[i] === toTokens[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
  }

  const parts: DiffPart[] = []
  let i = 0
  let j = 0

  while (i < rows && j < cols) {
    if (fromTokens[i] === toTokens[j]) {
      parts.push({ text: fromTokens[i], type: 'same' })
      i += 1
      j += 1
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      parts.push({ text: fromTokens[i], type: 'removed' })
      i += 1
    } else {
      parts.push({ text: toTokens[j], type: 'added' })
      j += 1
    }
  }

  while (i < rows) {
    parts.push({ text: fromTokens[i], type: 'removed' })
    i += 1
  }

  while (j < cols) {
    parts.push({ text: toTokens[j], type: 'added' })
    j += 1
  }

  return parts.reduce<DiffPart[]>((acc, part) => {
    const last = acc[acc.length - 1]
    if (last && last.type === part.type) {
      last.text += part.text
      return acc
    }
    acc.push({ ...part })
    return acc
  }, [])
}

function QuestionApproval() {
  const [approvalComments, setApprovalComments] = useState<Record<string, string>>({})
  const [currentUser, setCurrentUser] = useState('Joie Smit')
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('DD Manager')
  
  // Enhanced approval workflow states
  const [selectedActions, setSelectedActions] = useState<Record<string, 'approve' | 'reject' | ''>>({})
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmingRequestId, setConfirmingRequestId] = useState<string>('')
  const [processingRequestId, setProcessingRequestId] = useState<string>('')
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleApprovalCommentChange = (changeRequestId: string, value: string) => {
    setApprovalComments((prev) => ({ ...prev, [changeRequestId]: value }))
  }

  const handleActionSelection = (changeRequestId: string, action: 'approve' | 'reject' | '') => {
    setSelectedActions((prev) => ({ ...prev, [changeRequestId]: action }))
  }

  const isApprovalValid = (changeRequestId: string) => {
    const hasComment = (approvalComments[changeRequestId] || '').trim().length > 0
    const hasAction = selectedActions[changeRequestId] !== '' && selectedActions[changeRequestId] !== undefined
    return hasComment && hasAction
  }

  const handleApprovalClick = (changeRequestId: string) => {
    if (!isApprovalValid(changeRequestId)) {
      return
    }
    setConfirmingRequestId(changeRequestId)
    setConfirmDialogOpen(true)
  }

  const handleConfirmApproval = async () => {
    setConfirmDialogOpen(false)
    setProcessingRequestId(confirmingRequestId)
    
    // Simulate 4-second processing delay
    await new Promise((resolve) => setTimeout(resolve, 4000))
    
    const action = selectedActions[confirmingRequestId]
    const actionText = action === 'approve' ? 'approved' : 'rejected'
    setSuccessMessage(`✓ Question changes have been ${actionText}`)
    setSuccessDialogOpen(true)
    setProcessingRequestId('')
    
    // Reset form
    setTimeout(() => {
      setSelectedActions((prev) => ({ ...prev, [confirmingRequestId]: '' }))
      setApprovalComments((prev) => ({ ...prev, [confirmingRequestId]: '' }))
      setSuccessDialogOpen(false)
    }, 2000)
  }

  const canApprove = (item: QuestionApprovalItem) => {
    // Risk SME View cannot approve
    if (currentUserRole === 'Risk SME View') return false
    
    // SME Analyst cannot approve
    if (currentUserRole === 'SME Analyst') return false
    
    // DD Manager cannot approve their own questions
    if (currentUserRole === 'DD Manager' && item.requestedBy === currentUser) return false
    
    // DD Manager can approve if not their own and status is Pending
    return currentUserRole === 'DD Manager' && item.status === 'Pending'
  }

  const canReject = (item: QuestionApprovalItem) => {
    // Same logic as approve
    return canApprove(item)
  }

  const canCancel = (item: QuestionApprovalItem) => {
    // Only SME Analyst can cancel their own pending requests
    return (
      currentUserRole === 'SME Analyst' &&
      item.requestedBy === currentUser &&
      item.status === 'Pending'
    )
  }

  const canViewOnly = () => {
    return currentUserRole === 'Risk SME View'
  }

  const getStatusColor = (status: QuestionApprovalItem['status']) => {
    switch (status) {
      case 'Pending':
        return 'warning'
      case 'Approved':
        return 'success'
      case 'Rejected':
        return 'error'
      case 'Cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPermissionMessage = (item: QuestionApprovalItem) => {
    if (currentUserRole === 'Risk SME View') {
      return 'You have view-only access.'
    }
    if (currentUserRole === 'SME Analyst') {
      if (item.requestedBy === currentUser && item.status === 'Pending') {
        return 'You can cancel your own request.'
      }
      return 'SME Analysts cannot approve or reject questions.'
    }
    if (currentUserRole === 'DD Manager' && item.requestedBy === currentUser) {
      return 'You cannot approve your own question. Another DD Manager can approve it.'
    }
    return null
  }

  // Filter items based on role
  const filteredApprovals = mockApprovals.filter((item) => {
    if (currentUserRole === 'Risk SME View') {
      // Risk SME View can only see approved items
      return item.status === 'Approved'
    }
    return true
  })

  return (
    <Box sx={{ padding: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#22223e' }}>
          Question Approval
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Current User</InputLabel>
            <Select
              value={currentUser}
              label="Current User"
              onChange={(e) => setCurrentUser(e.target.value)}
            >
              <MenuItem value="Joie Smit">Joie Smit</MenuItem>
              <MenuItem value="Mason Holt">Mason Holt</MenuItem>
              <MenuItem value="Ava Jenkins">Ava Jenkins</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={currentUserRole}
              label="Role"
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
            >
              <MenuItem value="DD Manager">DD Manager</MenuItem>
              <MenuItem value="SME Analyst">SME Analyst</MenuItem>
              <MenuItem value="Risk SME View">Risk SME View</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {canViewOnly() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You are viewing as Risk SME View. You can only see approved questions and cannot make changes.
        </Alert>
      )}

      <Stack spacing={2}>
        {filteredApprovals.map((item) => {
          const title = `Question ID ${item.questionId} - ${truncateText(item.questionText, 70)}`
          const permissionMsg = getPermissionMessage(item)

          return (
            <Accordion key={item.changeRequestId} elevation={1} disableGutters sx={{ position: 'relative' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack spacing={0.5} sx={{ width: '100%' }}>
                  <Tooltip title={item.questionText} placement="top-start">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {title}
                    </Typography>
                  </Tooltip>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to: {item.assignedTo}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {permissionMsg && (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      {permissionMsg}
                    </Alert>
                  )}
                  
                  <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap">
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        State
                      </Typography>
                      <Chip
                        icon={<FlagIcon fontSize="small" />}
                        label={item.status}
                        size="small"
                        color={getStatusColor(item.status)}
                        sx={{ width: 'fit-content' }}
                      />
                    </Stack>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Change Request ID: {item.changeRequestId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Question ID: {item.questionId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Requested By: {item.requestedBy} ({item.requestedByRole})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Attribute: {item.attribute}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Date Requested: {item.dateRequested}
                      </Typography>
                    </Box>
                  </Stack>

                  

                  <Divider />

                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        As Is Question Text
                      </Typography>
                      <Typography variant="body2">{item.asIs}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        To Be Question Text
                      </Typography>
                      <Typography variant="body2" component="div">
                        {renderDiff(buildDiffParts(item.asIs, item.toBe))}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Comment
                      </Typography>
                      <Typography variant="body2">{item.comment}</Typography>
                    </Box>
                    
                    {!canViewOnly() && item.status === 'Pending' && (
                      <>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Approval Decision
                          </Typography>
                          <FormControl component="fieldset">
                            <RadioGroup
                              row
                              value={selectedActions[item.changeRequestId] || ''}
                              onChange={(e) => handleActionSelection(item.changeRequestId, e.target.value as 'approve' | 'reject' | '')}
                            >
                              <FormControlLabel 
                                value="approve" 
                                control={<Radio />} 
                                label="Approve" 
                                disabled={!canApprove(item)}
                              />
                              <FormControlLabel 
                                value="reject" 
                                control={<Radio />} 
                                label="Reject" 
                                disabled={!canReject(item)}
                              />
                            </RadioGroup>
                          </FormControl>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Approval Comment
                          </Typography>
                          <TextField
                            value={approvalComments[item.changeRequestId] || ''}
                            onChange={(event) =>
                              handleApprovalCommentChange(item.changeRequestId, event.target.value)
                            }
                            placeholder="Enter approval comment (required)"
                            multiline
                            minRows={3}
                            fullWidth
                            disabled={!canApprove(item) && !canReject(item) && !canCancel(item)}
                            error={!!(selectedActions[item.changeRequestId] && (approvalComments[item.changeRequestId] || '').trim().length === 0)}
                            helperText={
                              selectedActions[item.changeRequestId] && (approvalComments[item.changeRequestId] || '').trim().length === 0
                                ? 'Approval comment is required'
                                : ''
                            }
                          />
                        </Box>
                      </>
                    )}
                  </Stack>

                  {item.status === 'Pending' && (
                    <Stack direction="row" spacing={2}>
                      {(canApprove(item) || canReject(item)) && (
                        <Button
                          variant="contained"
                          color={selectedActions[item.changeRequestId] === 'approve' ? 'success' : 'error'}
                          disabled={!isApprovalValid(item.changeRequestId)}
                          onClick={() => handleApprovalClick(item.changeRequestId)}
                          sx={{ minWidth: 120 }}
                        >
                          {selectedActions[item.changeRequestId] === 'approve' ? '✓ Approve' : selectedActions[item.changeRequestId] === 'reject' ? '✗ Reject' : 'Submit Decision'}
                        </Button>
                      )}
                      {canCancel(item) && (
                        <Button variant="outlined" color="warning">
                          Cancel Request
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>
              </AccordionDetails>

              {/* Processing Loader Overlay */}
              {processingRequestId === item.changeRequestId && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    borderRadius: 1
                  }}
                >
                  <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} />
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                      Processing your decision...
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Accordion>
          )
        })}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#22223e' }}>
          Confirm Your Decision
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2, mb: 1 }}>
            Are you sure you want to{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: selectedActions[confirmingRequestId] === 'approve' ? '#4caf50' : '#f44336'
              }}
            >
              {selectedActions[confirmingRequestId] === 'approve' ? 'APPROVE' : 'REJECT'}
            </Box>{' '}
            this question change?
          </DialogContentText>
          {approvalComments[confirmingRequestId] && (
            <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Your Comment:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {approvalComments[confirmingRequestId]}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmApproval}
            variant="contained"
            color={selectedActions[confirmingRequestId] === 'approve' ? 'success' : 'error'}
            autoFocus
          >
            {selectedActions[confirmingRequestId] === 'approve' ? '✓ Confirm Approval' : '✗ Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: '#4caf50',
              mb: 2
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#22223e' }}>
            Success!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {successMessage}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Demo Accordions Section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#22223e' }}>
          📋 Approval Workflow Demo
        </Typography>

        {/* Accordion 1: With Approve/Reject Buttons */}
        <Accordion elevation={1} disableGutters sx={{ mb: 2, backgroundColor: '#f5f7ff', position: 'relative' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#e3f2fd' }}>
            <Stack spacing={0.5} sx={{ width: '100%' }}>
              <Chip 
                label="With Approve/Reject Workflow" 
                color="primary" 
                size="small" 
                sx={{ width: 'fit-content', mb: 0.5 }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Question ID 450 - Clarify the role of project managers in cross-functional...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned to: Joie Smit
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap">
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    State
                  </Typography>
                  <Chip
                    icon={<FlagIcon fontSize="small" />}
                    label="Pending"
                    size="small"
                    color="warning"
                    sx={{ width: 'fit-content' }}
                  />
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Change Request ID: CR-1200
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Question ID: 450
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Requested By: Mason Holt (DD Manager)
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    As Is Question Text
                  </Typography>
                  <Typography variant="body2">What role do project managers play in cross-functional initiatives?</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    To Be Question Text
                  </Typography>
                  <Typography variant="body2" component="div">
                    What role do <Box component="span" sx={{ color: '#1e40af', fontWeight: 700 }}>senior</Box> project managers play in cross-functional initiatives?
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Comment
                  </Typography>
                  <Typography variant="body2">Add 'senior' to specify the level of project manager we're asking about.</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Approval Decision
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={selectedActions['CR-1200'] || ''}
                      onChange={(e) => setSelectedActions((prev) => ({ ...prev, ['CR-1200']: e.target.value as 'approve' | 'reject' | '' }))}
                    >
                      <FormControlLabel 
                        value="approve" 
                        control={<Radio />} 
                        label="Approve" 
                      />
                      <FormControlLabel 
                        value="reject" 
                        control={<Radio />} 
                        label="Reject" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Approval Comment
                  </Typography>
                  <TextField
                    value={approvalComments['CR-1200'] || ''}
                    onChange={(e) => setApprovalComments((prev) => ({ ...prev, ['CR-1200']: e.target.value }))}
                    placeholder="Enter approval comment (required)"
                    multiline
                    minRows={3}
                    fullWidth
                    error={!!(selectedActions['CR-1200'] && (approvalComments['CR-1200'] || '').trim().length === 0)}
                    helperText={
                      selectedActions['CR-1200'] && (approvalComments['CR-1200'] || '').trim().length === 0
                        ? 'Approval comment is required'
                        : ''
                    }
                  />
                </Box>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color={selectedActions['CR-1200'] === 'approve' ? 'success' : 'error'}
                  disabled={!isApprovalValid('CR-1200')}
                  onClick={() => handleApprovalClick('CR-1200')}
                  sx={{ minWidth: 120 }}
                >
                  {selectedActions['CR-1200'] === 'approve' ? '✓ Approve' : selectedActions['CR-1200'] === 'reject' ? '✗ Reject' : 'Submit Decision'}
                </Button>
              </Stack>
            </Stack>
          </AccordionDetails>

          {/* Processing Loader Overlay */}
          {processingRequestId === 'CR-1200' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                borderRadius: 1
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={60} />
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                  Processing your decision...
                </Typography>
              </Stack>
            </Box>
          )}
        </Accordion>

        {/* Accordion 2: With Cancel Changes Button */}
        <Accordion elevation={1} disableGutters sx={{ mb: 2, backgroundColor: '#fef5ff', position: 'relative' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#ffe0f0' }}>
            <Stack spacing={0.5} sx={{ width: '100%' }}>
              <Chip 
                label="With Cancel Request Option" 
                color="warning" 
                size="small" 
                sx={{ width: 'fit-content', mb: 0.5 }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Question ID 678 - Rephrase compliance documentation question...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned to: Sofia Lin
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap">
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    State
                  </Typography>
                  <Chip
                    icon={<FlagIcon fontSize="small" />}
                    label="Pending"
                    size="small"
                    color="warning"
                    sx={{ width: 'fit-content' }}
                  />
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Change Request ID: CR-1189
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Question ID: 678
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Requested By: Ava Jenkins (SME Analyst)
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    As Is Question Text
                  </Typography>
                  <Typography variant="body2">How well are your compliance processes documented and accessible?</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    To Be Question Text
                  </Typography>
                  <Typography variant="body2" component="div">
                    How <Box component="span" sx={{ color: '#1e40af', fontWeight: 700 }}>thoroughly</Box> are your compliance processes documented and <Box component="span" sx={{ textDecoration: 'line-through', textDecorationStyle: 'dashed', color: 'text.secondary' }}>accessible</Box> <Box component="span" sx={{ color: '#1e40af', fontWeight: 700 }}>available</Box>?
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Comment
                  </Typography>
                  <Typography variant="body2">Updated wording for better clarity in internal documentation reviews.</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Approval Decision
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={selectedActions['CR-1189'] || ''}
                      onChange={(e) => setSelectedActions((prev) => ({ ...prev, ['CR-1189']: e.target.value as 'approve' | 'reject' | '' }))}
                    >
                      <FormControlLabel 
                        value="approve" 
                        control={<Radio />} 
                        label="Approve" 
                      />
                      <FormControlLabel 
                        value="reject" 
                        control={<Radio />} 
                        label="Reject" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Approval Comment
                  </Typography>
                  <TextField
                    value={approvalComments['CR-1189'] || ''}
                    onChange={(e) => setApprovalComments((prev) => ({ ...prev, ['CR-1189']: e.target.value }))}
                    placeholder="Enter approval comment (required)"
                    multiline
                    minRows={3}
                    fullWidth
                    error={!!(selectedActions['CR-1189'] && (approvalComments['CR-1189'] || '').trim().length === 0)}
                    helperText={
                      selectedActions['CR-1189'] && (approvalComments['CR-1189'] || '').trim().length === 0
                        ? 'Approval comment is required'
                        : ''
                    }
                  />
                </Box>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color={selectedActions['CR-1189'] === 'approve' ? 'success' : 'error'}
                  disabled={!isApprovalValid('CR-1189')}
                  onClick={() => handleApprovalClick('CR-1189')}
                  sx={{ minWidth: 120 }}
                >
                  {selectedActions['CR-1189'] === 'approve' ? '✓ Approve' : selectedActions['CR-1189'] === 'reject' ? '✗ Reject' : 'Submit Decision'}
                </Button>
              </Stack>
            </Stack>
          </AccordionDetails>

          {/* Processing Loader Overlay */}
          {processingRequestId === 'CR-1189' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                borderRadius: 1
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={60} />
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                  Processing your decision...
                </Typography>
              </Stack>
            </Box>
          )}
        </Accordion>

        {/* Accordion 3: Read-Only Mode (No Buttons) */}
        <Accordion elevation={1} disableGutters sx={{ mb: 2, backgroundColor: '#f0f4f8' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#e2e8f0' }}>
            <Stack spacing={0.5} sx={{ width: '100%' }}>
              <Chip 
                label="Read-Only Mode (Approved)" 
                color="default" 
                size="small" 
                sx={{ width: 'fit-content', mb: 0.5 }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Question ID 892 - Add participant role classification...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned to: John Doe
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Alert severity="info" sx={{ mb: 1 }}>
                👁️ This approval is already completed. Viewing in read-only mode.
              </Alert>
              <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap">
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    State
                  </Typography>
                  <Chip
                    icon={<FlagIcon fontSize="small" />}
                    label="Approved"
                    size="small"
                    color="success"
                    sx={{ width: 'fit-content' }}
                  />
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Change Request ID: CR-1165
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Question ID: 892
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Requested By: Ethan Park (DD Manager)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Approved By: Sarah Miller (DD Manager)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    Date Approved: Feb 15, 2026
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    As Is Question Text
                  </Typography>
                  <Typography variant="body2">What is your role in the organization?</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    To Be Question Text
                  </Typography>
                  <Typography variant="body2" component="div">
                    What is your <Box component="span" sx={{ color: '#1e40af', fontWeight: 700 }}>current role and classification</Box> in the organization?
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Comment
                  </Typography>
                  <Typography variant="body2">Add role classification to better segment respondents for analysis.</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Approval Decision
                  </Typography>
                  <Chip label="✓ Approved" color="success" size="small" sx={{ width: 'fit-content' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Approval Comment
                  </Typography>
                  <Typography variant="body2" sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    ✓ Clear and meaningful improvement to question scope. This will provide better insights into different organizational perspectives.
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  )
}

export default QuestionApproval
