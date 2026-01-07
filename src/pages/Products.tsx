import { useState, useEffect } from 'react'
import { DataGrid, GridColDef, GridSortModel, GridFilterModel } from '@mui/x-data-grid'
import { Box, Typography, TextField, InputAdornment, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface ProductRecord {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

function Products() {
  const [rows, setRows] = useState<ProductRecord[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  })
  const [rowCount, setRowCount] = useState<number>(0)
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'id', sort: 'asc' }
  ])

  // Define columns
  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      flex: 0.5,
      minWidth: 90,
      headerClassName: 'custom-header'
    },
    { 
      field: 'name', 
      headerName: 'Product Name', 
      flex: 2,
      minWidth: 200,
      headerClassName: 'custom-header'
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      flex: 1,
      minWidth: 150,
      headerClassName: 'custom-header'
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      flex: 1,
      minWidth: 100,
      type: 'number',
      headerClassName: 'custom-header',
      valueFormatter: (params) => `$${params}`
    },
    { 
      field: 'stock', 
      headerName: 'Stock', 
      flex: 1,
      minWidth: 100,
      type: 'number',
      headerClassName: 'custom-header'
    }
  ]

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    
    try {
      const offset = paginationModel.page * paginationModel.pageSize
      const sortField = sortModel[0]?.field || 'id'
      const sortOrder = sortModel[0]?.sort || 'asc'
      
      const response = await fetch(
        `/api/getproducts?searchText=${encodeURIComponent(searchText)}&offset=${offset}&pageSize=${paginationModel.pageSize}&sortField=${sortField}&sortOrder=${sortOrder}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const data = await response.json()
      setRows(data.records || [])
      setRowCount(data.total || 0)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when pagination, sort, or search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(timer)
  }, [paginationModel, sortModel, searchText])

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Products
        </Typography>
        <TextField
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
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
      
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={rowCount}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            '& .custom-header': {
              backgroundColor: '#22223e !important',
              color: '#fff !important',
            },
            '& .MuiDataGrid-sortIcon': {
              color: '#fff !important',
            },
            '& .MuiDataGrid-menuIconButton': {
              color: '#fff !important',
            }
          }}
        />
      </Paper>
    </Box>
  )
}

export default Products
