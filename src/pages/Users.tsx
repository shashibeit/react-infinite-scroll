import { TableRow, TableCell } from '@mui/material'
import InfiniteScrollTable, { TableColumn } from '../components/InfiniteScrollTable'

interface UserRecord {
  id: number
  name: string
  age: number
  email: string
}

function Users() {
  // Define columns configuration
  const columns: TableColumn[] = [
    { field: 'id', label: 'ID', align: 'left', sortable: true },
    { field: 'name', label: 'Name', align: 'left', sortable: true },
    { field: 'age', label: 'Age', align: 'right', sortable: true },
    { field: 'email', label: 'Email', align: 'left', sortable: true }
  ]

  // Function to render each row
  const renderRow = (row: UserRecord) => (
    <TableRow key={row.id} hover>
      <TableCell>{row.id}</TableCell>
      <TableCell>{row.name}</TableCell>
      <TableCell align="right">{row.age}</TableCell>
      <TableCell>{row.email}</TableCell>
    </TableRow>
  )

  return (
    <InfiniteScrollTable<UserRecord>
      title="Users List"
      columns={columns}
      apiUrl="/api/getrecords"
      searchPlaceholder="Search by name..."
      pageSize={100}
      defaultSortField="id"
      defaultSortOrder="asc"
      renderRow={renderRow}
      extractRecords={(data) => data.records || data || []}
      scrollThreshold={300}
    />
  )
}

export default Users
