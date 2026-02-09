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
  TextField
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlagIcon from '@mui/icons-material/Flag'

interface DiffPart {
  text: string
  type: 'added' | 'removed' | 'same'
}

interface QuestionApprovalItem {
  changeRequestId: string
  questionId: string
  questionText: string
  assignedTo: string
  status: string
  requestedBy: string
  attribute: string
  dateRequested: string
  asIs: string
  toBe: string
  comment: string
}

const mockApprovals: QuestionApprovalItem[] = [
  {
    changeRequestId: 'CR-1092',
    questionId: '123',
    questionText:
      'How satisfied are you with the current onboarding process for new team members in your department?',
    assignedTo: 'Joie Smit',
    status: 'Pending',
    requestedBy: 'Ava Jenkins',
    attribute: 'Question Text',
    dateRequested: 'Feb 05, 2026',
    asIs: 'How satisfied are you with the current onboarding process for new team members in your department?',
    toBe: 'How satisfied are you with the current onboarding process for new hires in your department?',
    comment: 'Update wording to align with HR terminology.'
  },
  {
    changeRequestId: 'CR-1095',
    questionId: '188',
    questionText:
      'Please rate the clarity of communication from your immediate supervisor during the last quarter.',
    assignedTo: 'Joie Smit',
    status: 'Pending',
    requestedBy: 'Mason Holt',
    attribute: 'Question Text',
    dateRequested: 'Feb 06, 2026',
    asIs: 'Please rate the clarity of communication from your immediate supervisor during the last quarter.',
    toBe: 'Please rate the clarity of communication from your direct manager during the last quarter.',
    comment: 'Use consistent role name across questions.'
  },
  {
    changeRequestId: 'CR-1101',
    questionId: '205',
    questionText:
      'Which training modules were most helpful for improving your day-to-day productivity?',
    assignedTo: 'Joie Smit',
    status: 'Pending',
    requestedBy: 'Sofia Lin',
    attribute: 'Question Text',
    dateRequested: 'Feb 06, 2026',
    asIs: 'Which training modules were most helpful for improving your day-to-day productivity?',
    toBe: 'Which training modules were most helpful for improving your daily productivity?',
    comment: 'Simplify phrasing for readability.'
  },
  {
    changeRequestId: 'CR-1114',
    questionId: '256',
    questionText:
      'To what extent do you agree that the current tooling supports your team collaboration needs?',
    assignedTo: 'Joie Smit',
    status: 'Pending',
    requestedBy: 'Noah Alvarez',
    attribute: 'Question Text',
    dateRequested: 'Feb 07, 2026',
    asIs: 'To what extent do you agree that the current tooling supports your team collaboration needs?',
    toBe: 'To what extent do you agree that the current tooling supports your collaboration needs across teams?',
    comment: 'Clarify scope to include cross-team work.'
  },
  {
    changeRequestId: 'CR-1120',
    questionId: '311',
    questionText:
      'How frequently do you use the analytics dashboard to make decisions in your role?',
    assignedTo: 'Joie Smit',
    status: 'Pending',
    requestedBy: 'Ethan Park',
    attribute: 'Question Text',
    dateRequested: 'Feb 07, 2026',
    asIs: 'How frequently do you use the analytics dashboard to make decisions in your role?',
    toBe: 'How frequently do you use the analytics dashboard to make data-driven decisions in your role?',
    comment: 'Emphasize data-driven language.'
  }
]

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

  const handleApprovalCommentChange = (changeRequestId: string, value: string) => {
    setApprovalComments((prev) => ({ ...prev, [changeRequestId]: value }))
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ color: '#22223e', mb: 3 }}>
        Question Approval
      </Typography>

      <Stack spacing={2}>
        {mockApprovals.map((item) => {
          const title = `Question ID ${item.questionId} - ${truncateText(item.questionText, 70)}`

          return (
            <Accordion key={item.changeRequestId} elevation={1} disableGutters>
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
                  <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap">
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        State
                      </Typography>
                      <Chip
                        icon={<FlagIcon fontSize="small" />}
                        label={item.status}
                        size="small"
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
                        Requested By: {item.requestedBy}
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
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Approval Comment
                      </Typography>
                      <TextField
                        value={approvalComments[item.changeRequestId] || ''}
                        onChange={(event) =>
                          handleApprovalCommentChange(item.changeRequestId, event.target.value)
                        }
                        placeholder="Enter approval comment"
                        multiline
                        minRows={3}
                        fullWidth
                      />
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="success">
                      Approve
                    </Button>
                    <Button variant="outlined" color="error">
                      Reject
                    </Button>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Stack>
    </Box>
  )
}

export default QuestionApproval
