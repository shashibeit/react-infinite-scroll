import { useState, useEffect, useRef } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  TableSortLabel
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

function Users() {
  const [rows, setRows] = useState([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [sortField, setSortField] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')
  const tableContainerRef = useRef(null)
  const pageSize = 100

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchText])

  // Reset and load data when search text or sort changes
  useEffect(() => {
    setRows([])
    setOffset(0)
    setHasMore(true)
    loadData(0, debouncedSearchText, sortField, sortOrder)
  }, [debouncedSearchText, sortField, sortOrder])

  // Function to fetch data from API
  const loadData = async (currentOffset, search, field, order) => {
    if (loading) return

    setLoading(true)
    
    try {
      const response = await fetch(
        `/api/getrecords?searchText=${encodeURIComponent(search)}&offset=${currentOffset}&sortField=${field}&sortOrder=${order}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const data = await response.json()
      
      // Assuming API returns an array of records
      // Adjust based on your actual API response structure
      const newRecords = data.records || data || []
      
      if (currentOffset === 0) {
        setRows(newRecords)
      } else {
        setRows(prevRows => [...prevRows, ...newRecords])
      }
      
      // If we got fewer records than pageSize, we've reached the end
      if (newRecords.length < pageSize) {
        setHasMore(false)
      }
      
      setOffset(currentOffset + pageSize)
    } catch (error) {
      console.error('Error fetching data:', error)
      // Optionally show error message to user
    } finally {
      setLoading(false)
    }
  }

  // Function to load more data
  const loadMoreData = () => {
    if (loading || !hasMore) return
    loadData(offset, debouncedSearchText, sortField, sortOrder)
  }

  // Handle scroll event
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    
    // Load more when scrolled to bottom (with 50px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreData()
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  // Handle sort
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortField(field)
  }

  return (
    <Box sx={{ width: '90', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Users List
        </Typography>
        <TextField
          placeholder="Search by name..."
          value={searchText}
          onChange={handleSearchChange}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <TableContainer 
        component={Paper} 
        ref={tableContainerRef}
        onScroll={handleScroll}
        sx={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'id'}
                  direction={sortField === 'id' ? sortOrder : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'age'}
                  direction={sortField === 'age' ? sortOrder : 'asc'}
                  onClick={() => handleSort('age')}
                >
                  Age
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortOrder : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.age}</TableCell>
                  <TableCell>{row.email}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {!hasMore && rows.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No more data to load
            </Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  )
}

export default Users
