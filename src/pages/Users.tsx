import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TableRow, TableCell } from '@mui/material'
import InfiniteScrollTable, { TableColumn } from '../components/InfiniteScrollTable'

interface UserRecord {
  id: number
  questionText: string
  status: string
  reviewType: string
  participantType: string
  section: string
  countries: string
}

function Users() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<UserRecord[]>([])
  const [offset, setOffset] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('')
  const [sortField, setSortField] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
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

  // Function to fetch data from API
  const loadData = async (currentOffset: number, search: string, field: string, order: 'asc' | 'desc') => {
    if (loading) return

    setLoading(true)
    
    try {
      const response = await fetch(
        `/api/getrecords?searchText=${encodeURIComponent(search)}&offset=${currentOffset}&sortField=${field}&sortOrder=${order}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      console.log('Fetching data with offset:', currentOffset, 'search:', search, 'sortField:', field, 'sortOrder:', order)
      
      const data = await response.json()
      const newRecords = data.records || data || []
      
      if (currentOffset === 0) {
        setRows(newRecords)
      } else {
        setRows(prevRows => [...prevRows, ...newRecords])
      }
      
      if (newRecords.length < pageSize) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
      
      setOffset(currentOffset + pageSize)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data on mount
  useEffect(() => {
    loadData(0, '', sortField, sortOrder)
    setIsInitialLoad(false)
  }, [])

  // Debounce search text
  useEffect(() => {
    if (isInitialLoad) return
    
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchText, isInitialLoad])

  // Reset and load data when search text or sort changes
  useEffect(() => {
    if (isInitialLoad) return
    
    setRows([])
    setOffset(0)
    setHasMore(true)
    loadData(0, debouncedSearchText, sortField, sortOrder)
  }, [debouncedSearchText, sortField, sortOrder, isInitialLoad])

  // Window scroll event listener for infinite scroll
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
  }, [loading, hasMore, offset, debouncedSearchText, sortField, sortOrder, isInitialLoad])

  // Function to load more data
  const loadMoreData = () => {
    if (loading || !hasMore) return
    loadData(offset, debouncedSearchText, sortField, sortOrder)
  }

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchText(value)
  }

  // Handle sort change
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortField(field)
    setSortOrder(order)
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
