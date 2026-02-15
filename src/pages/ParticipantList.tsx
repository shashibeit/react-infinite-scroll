import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface Participant {
  id: string
  name: string
  type: 'XY' | 'PQR'
  country: string
  status: 'Active' | 'Inactive'
}

// Mock data for participants
const mockParticipants: Participant[] = [
  { id: 'P001', name: 'ABC Corporation', type: 'XY', country: 'USA', status: 'Active' },
  { id: 'P002', name: 'XYZ Limited', type: 'PQR', country: 'UK', status: 'Active' },
  { id: 'P003', name: 'Global Ventures Inc', type: 'XY', country: 'Canada', status: 'Active' },
  { id: 'P004', name: 'Tech Solutions Ltd', type: 'PQR', country: 'Germany', status: 'Inactive' },
  { id: 'P005', name: 'International Corp', type: 'XY', country: 'France', status: 'Active' },
]

function ParticipantList() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')

  const filteredParticipants = mockParticipants.filter((participant) =>
    participant.name.toLowerCase().includes(searchText.toLowerCase()) ||
    participant.id.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleRowClick = (participantId: string) => {
    navigate(`/participants/${participantId}`)
  }

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Participant List
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and manage all participants. Click on a row to see details.
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search participants..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Country</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredParticipants.map((participant) => (
              <TableRow
                key={participant.id}
                hover
                onClick={() => handleRowClick(participant.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{participant.id}</TableCell>
                <TableCell>{participant.name}</TableCell>
                <TableCell>{participant.type}</TableCell>
                <TableCell>{participant.country}</TableCell>
                <TableCell>{participant.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredParticipants.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            No participants found
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ParticipantList
