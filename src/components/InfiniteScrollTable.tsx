import { ReactElement } from 'react'
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
  CircularProgress
} from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

export interface TableColumn {
  field: string
  label: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  width?: string | number
  minWidth?: string | number
}

export interface InfiniteScrollTableProps<T = any> {
  columns: TableColumn[]
  data: T[]
  loading?: boolean
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (field: string, order: 'asc' | 'desc') => void
  renderRow: (row: T, columns: TableColumn[]) => ReactElement
  onRowClick?: (row: T) => void
  hasMore?: boolean
  emptyMessage?: string
}

function InfiniteScrollTable<T = any>({
  columns = [],
  data,
  loading = false,
  sortField = '',
  sortOrder = 'asc',
  onSortChange,
  renderRow,
  onRowClick,
  hasMore = true,
  emptyMessage = 'No records found'
}: InfiniteScrollTableProps<T>) {

  // Handle sort
  const handleSort = (field: string) => {
    if (onSortChange) {
      const isAsc = sortField === field && sortOrder === 'asc'
      onSortChange(field, isAsc ? 'desc' : 'asc')
    }
  }

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell 
                  key={column.field} 
                  align={column.align || 'left'}
                  sx={{ 
                    backgroundColor: '#23233f !important', 
                    color: '#FFF',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    paddingTop: 0,
                    paddingBottom: 0,
                    minHeight: '80px',
                    maxHeight: '80px',
                    height: '80px',
                    fontSize: '16px',
                    fontWeight: 300,
                    width: column.width,
                    minWidth: column.minWidth,
                    borderRight: index === columns.length - 1 ? 'none' : '2px solid #FFF',
                    outline: 'none'
                  }}
                >
                  {column.sortable !== false && onSortChange ? (
                    <Box
                      onClick={() => handleSort(column.field)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: sortField === column.field ? '#EC6B29' : '#FFF',
                        fontSize: '16px',
                        fontWeight: 300
                      }}
                    >
                      <span>{column.label}</span>
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                        {sortField === column.field && sortOrder === 'asc' ? (
                          <KeyboardArrowUpIcon sx={{ fontSize: 20, color: '#EC6B29' }} />
                        ) : sortField === column.field && sortOrder === 'desc' ? (
                          <KeyboardArrowDownIcon sx={{ fontSize: 20, color: '#EC6B29' }} />
                        ) : (
                          <KeyboardArrowUpIcon sx={{ fontSize: 20, color: '#FFF', opacity: 0.5 }} />
                        )}
                      </Box>
                    </Box>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(!data || data.length === 0) && !loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.map((row, index) => (
                <TableRow
                  key={(row as any).id}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    backgroundColor: index % 2 === 0 ? '#F0F0F2' : '#E3E3E5',
                    minHeight: '80px',
                    '&:hover': onRowClick ? {
                      opacity: 0.8
                    } : {},
                    '& .MuiTableCell-root': {
                      color: '#23233F',
                      fontSize: '16px',
                      fontWeight: 300,
                      paddingLeft: '10px',
                      paddingRight: '10px',
                      minHeight: '80px',
                      borderRight: '2px solid #FFF',
                      outline: 'none',
                      '&:last-child': {
                        borderRight: 'none'
                      },
                      '& a': {
                        color: '#3C76A7',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }
                    }
                  }}
                >
                  {renderRow(row, columns)}
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
        {!hasMore && data && data.length > 0 && (
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
