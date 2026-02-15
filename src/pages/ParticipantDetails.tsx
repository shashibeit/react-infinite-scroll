import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface Participant {
  id: string
  name: string
  participantTypes: string[]
  country: string
  address: string
  contactNo: string
}

interface Review {
  id: string
  reviewType: string
  status: 'In Progress' | 'Completed' | 'Not Started'
  startDate: string
  assignedTo: string
  completionPercentage: number
}

// Mock data for participant details
const mockParticipantData: Record<string, Participant> = {
  P001: {
    id: 'P001',
    name: 'ABC Corporation',
    participantTypes: ['XY', 'Investor', 'Partner'],
    country: 'USA',
    address: '123 Business Street, New York, NY 10001',
    contactNo: '+1 (555) 123-4567'
  },
  P002: {
    id: 'P002',
    name: 'XYZ Limited',
    participantTypes: ['PQR', 'Vendor'],
    country: 'UK',
    address: '456 Commerce Road, London, EC1A 1BB',
    contactNo: '+44 20 1234 5678'
  },
  P003: {
    id: 'P003',
    name: 'Global Ventures Inc',
    participantTypes: ['XY', 'Investor'],
    country: 'Canada',
    address: '789 Investment Ave, Toronto, ON M5H 2N2',
    contactNo: '+1 (416) 555-7890'
  },
  P004: {
    id: 'P004',
    name: 'Tech Solutions Ltd',
    participantTypes: ['PQR', 'Partner', 'Vendor'],
    country: 'Germany',
    address: '321 Innovation Blvd, Berlin, 10115',
    contactNo: '+49 30 12345678'
  },
  P005: {
    id: 'P005',
    name: 'International Corp',
    participantTypes: ['XY'],
    country: 'France',
    address: '654 Global Plaza, Paris, 75001',
    contactNo: '+33 1 23 45 67 89'
  }
}

// Mock data for reviews
const mockReviewData: Record<string, Review[]> = {
  P001: [
    {
      id: 'R001',
      reviewType: 'Due Diligence',
      status: 'In Progress',
      startDate: '2026-01-15',
      assignedTo: 'John Smith',
      completionPercentage: 65
    },
    {
      id: 'R002',
      reviewType: 'Periodic Review',
      status: 'In Progress',
      startDate: '2026-02-01',
      assignedTo: 'Jane Doe',
      completionPercentage: 30
    },
    {
      id: 'R003',
      reviewType: 'Compliance Check',
      status: 'Completed',
      startDate: '2025-12-10',
      assignedTo: 'Mike Johnson',
      completionPercentage: 100
    }
  ],
  P002: [
    {
      id: 'R004',
      reviewType: 'Due Diligence',
      status: 'In Progress',
      startDate: '2026-02-10',
      assignedTo: 'Sarah Williams',
      completionPercentage: 45
    }
  ],
  P003: [
    {
      id: 'R005',
      reviewType: 'Periodic Review',
      status: 'Completed',
      startDate: '2025-11-20',
      assignedTo: 'Tom Brown',
      completionPercentage: 100
    }
  ],
  P004: [
    {
      id: 'R006',
      reviewType: 'Due Diligence',
      status: 'Not Started',
      startDate: '2026-03-01',
      assignedTo: 'Emily Davis',
      completionPercentage: 0
    }
  ],
  P005: [
    {
      id: 'R007',
      reviewType: 'Compliance Check',
      status: 'In Progress',
      startDate: '2026-02-05',
      assignedTo: 'David Wilson',
      completionPercentage: 80
    },
    {
      id: 'R008',
      reviewType: 'Periodic Review',
      status: 'In Progress',
      startDate: '2026-01-25',
      assignedTo: 'Lisa Anderson',
      completionPercentage: 55
    }
  ]
}

function ParticipantDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | false>(false)

  const participant = id ? mockParticipantData[id] : undefined
  const reviews = id ? mockReviewData[id] || [] : []
  const inProgressReviews = reviews.filter(r => r.status === 'In Progress')

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  if (!participant) {
    return (
      <Box sx={{ width: '100%', padding: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/participants')}
          sx={{ mb: 2 }}
        >
          Back to List
        </Button>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Participant not found
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/participants')}
        sx={{ mb: 3 }}
      >
        Back to List
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>
        {participant.name}
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Participant Details */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Participant Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {participant.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Country
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {participant.country}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact No
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {participant.contactNo}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {participant.address}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Participant Types */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Participant Types
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {participant.participantTypes.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  sx={{
                    borderRadius: 1,
                    fontWeight: 500
                  }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Review Details */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              Review Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {inProgressReviews.length} review{inProgressReviews.length !== 1 ? 's' : ''} in progress
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No reviews available
              </Typography>
            ) : (
              reviews.map((review) => (
                <Accordion
                  key={review.id}
                  expanded={expanded === review.id}
                  onChange={handleAccordionChange(review.id)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                      <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                        {review.reviewType}
                      </Typography>
                      <Chip
                        label={review.status}
                        size="small"
                        color={
                          review.status === 'In Progress'
                            ? 'warning'
                            : review.status === 'Completed'
                            ? 'success'
                            : 'default'
                        }
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Review ID
                        </Typography>
                        <Typography variant="body2">{review.id}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body2">
                          {new Date(review.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Assigned To
                        </Typography>
                        <Typography variant="body2">{review.assignedTo}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Completion
                        </Typography>
                        <Typography variant="body2">{review.completionPercentage}%</Typography>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}

export default ParticipantDetails
