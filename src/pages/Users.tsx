import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TableCell } from '@mui/material'
import InfiniteScrollTable, { TableColumn } from '../components/InfiniteScrollTable'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchQuestions,
  setSearchText,
  setDebouncedSearchText,
  setSortField,
  setSortOrder,
  resetQuestions,
  UserRecord
} from '../store/questionsSlice'

function Users() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const {
    rows,
    offset,
    loading,
    hasMore,
    searchText,
    debouncedSearchText,
    sortField,
    sortOrder
  } = useAppSelector((state) => state.questions)

  const pageSize = 100
  const scrollThreshold = 300

  // Define columns configuration
  const columns: TableColumn[] = [
    { field: 'id', label: 'ID', align: 'left', sortable: true, width: 80 },
    { field: 'questionText', label: 'Question Text', align: 'left', sortable: true, minWidth: 300 },
    { field: 'status', label: 'Status', align: 'left', sortable: true, width: 120 },
    { field: 'reviewType', label: 'Review Type', align: 'left', sortable: true, width: 150 },
    { field: 'participantType', label: 'Participant Type', align: 'left', sortable: true, width: 160 },
    { field: 'section', label: 'Section', align: 'left', sortable: true, width: 120 },
    { field: 'countries', label: 'Countries', align: 'left', sortable: true, width: 150 }
  ]

  // Load initial data on mount
  useEffect(() => {
    dispatch(fetchQuestions({
      offset: 0,
      searchText: '',
      sortField: '',
      sortOrder: 'asc',
      append: false
    }))
  }, [dispatch])

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setDebouncedSearchText(searchText))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchText, dispatch])

  // Reset and load data when search text or sort changes
  useEffect(() => {
    if (debouncedSearchText !== undefined || sortField !== undefined) {
      dispatch(resetQuestions())
      dispatch(fetchQuestions({
        offset: 0,
        searchText: debouncedSearchText,
        sortField,
        sortOrder,
        append: false
      }))
    }
  }, [debouncedSearchText, sortField, sortOrder, dispatch])

  // Window scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollHeight - scrollTop <= clientHeight + scrollThreshold && !loading && hasMore) {
        dispatch(fetchQuestions({
          offset,
          searchText: debouncedSearchText,
          sortField,
          sortOrder,
          append: true
        }))
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [loading, hasMore, offset, debouncedSearchText, sortField, sortOrder, dispatch])

  // Handle search change
  const handleSearchChange = (value: string) => {
    dispatch(setSearchText(value))
  }

  // Handle sort change
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    dispatch(setSortField(field))
    dispatch(setSortOrder(order))
  }

  // Function to handle row click
  const handleRowClick = (row: UserRecord) => {
    navigate(`/users/${row.id}`)
  }

  // Function to render each row
  const renderRow = (row: UserRecord) => (
    <>
      <TableCell>{row.id}</TableCell>
      <TableCell>{row.questionText}</TableCell>
      <TableCell>{row.status}</TableCell>
      <TableCell>{row.reviewType}</TableCell>
      <TableCell>{row.participantType}</TableCell>
      <TableCell>{row.section}</TableCell>
      <TableCell>{row.countries}</TableCell>
    </>
  )

  return (
    <InfiniteScrollTable<UserRecord>
      title="Questions List"
      columns={columns}
      data={rows}
      loading={loading}
      searchPlaceholder="Search questions..."
      searchValue={searchText}
      onSearchChange={handleSearchChange}
      sortField={sortField}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
      renderRow={renderRow}
      onRowClick={handleRowClick}
      hasMore={hasMore}
      totalRecords={rows.length}
    />
  )
}

export default Users
