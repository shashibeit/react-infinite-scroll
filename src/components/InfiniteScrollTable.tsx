import { useState, useEffect, ReactElement } from 'react'
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

export interface TableColumn {
  field: string
  label: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
}

export interface InfiniteScrollTableProps<T = any> {
  title: string
  columns: TableColumn[]
  apiUrl?: string
  buildApiUrl?: (searchText: string, offset: number, sortField: string, sortOrder: string) => string
  extractRecords?: (data: any) => T[]
  searchPlaceholder?: string
  pageSize?: number
  defaultSortField?: string
  defaultSortOrder?: 'asc' | 'desc'
  renderRow: (row: T, columns: TableColumn[]) => ReactElement
  scrollThreshold?: number
}

function InfiniteScrollTable<T = any>({
  title,
  columns = [],
  apiUrl,
  buildApiUrl,
  extractRecords = (data: any) => data.records || data || [],
  searchPlaceholder = 'Search...',
  pageSize = 100,
  defaultSortField = columns[0]?.field || 'id',
  defaultSortOrder = 'asc',
  renderRow,
  scrollThreshold = 300
}: InfiniteScrollTableProps<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [offset, setOffset] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('')
  const [sortField, setSortField] = useState<string>(defaultSortField)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder)

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

  // Window scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollHeight - scrollTop <= clientHeight + scrollThreshold) {
        loadMoreData()
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [loading, hasMore, offset, debouncedSearchText, sortField, sortOrder])

  // Function to fetch data from API
  const loadData = async (currentOffset: number, search: string, field: string, order: 'asc' | 'desc') => {
    if (loading) return

    setLoading(true)
    
    try {
      const url = buildApiUrl 
        ? buildApiUrl(search, currentOffset, field, order)
        : `${apiUrl}?searchText=${encodeURIComponent(search)}&offset=${currentOffset}&sortField=${field}&sortOrder=${order}`

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const data = await response.json()
      const newRecords = extractRecords(data)
      
      if (currentOffset === 0) {
        setRows(newRecords)
      } else {
        setRows(prevRows => [...prevRows, ...newRecords])
      }
      
      if (newRecords.length < pageSize) {
        setHasMore(false)
      }
      
      setOffset(currentOffset + pageSize)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to load more data
  const loadMoreData = () => {
    if (loading || !hasMore) return
    loadData(offset, debouncedSearchText, sortField, sortOrder)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  // Handle sort
  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortField(field)
  }

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          {title}
        </Typography>
        <TextField
          placeholder={searchPlaceholder}
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
      
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.field} 
                  align={column.align || 'left'}
                  sx={{ backgroundColor: '#22223e !important', color: '#fff' }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={sortField === column.field ? sortOrder : 'asc'}
                      onClick={() => handleSort(column.field)}
                      sx={{ 
                        color: '#fff !important',
                        '&.Mui-active': {
                          color: '#fff !important'
                        },
                        '& .MuiTableSortLabel-icon': {
                          color: '#fff !important'
                        }
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => renderRow(row, columns))
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

export default InfiniteScrollTable
