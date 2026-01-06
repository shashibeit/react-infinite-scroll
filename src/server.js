import { createServer } from 'miragejs'

export function makeServer({ environment = 'development' } = {}) {
  const server = createServer({
    environment,

    routes() {
      this.namespace = 'api'

      this.get('/getrecords', (schema, request) => {
        const searchText = request.queryParams.searchText || ''
        const offset = parseInt(request.queryParams.offset) || 0
        const sortField = request.queryParams.sortField || 'id'
        const sortOrder = request.queryParams.sortOrder || 'asc'
        const pageSize = 100

        // Generate sample data
        const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 
          'James', 'Mary', 'Robert', 'Patricia', 'William', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Elizabeth']
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
          'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

        // Generate a large pool of records (e.g., 1000 records)
        const allRecords = []
        for (let i = 1; i <= 1000; i++) {
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
          const name = `${firstName} ${lastName}`
          const age = Math.floor(Math.random() * (65 - 20 + 1)) + 20
          const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
          
          allRecords.push({ id: i, name, age, email })
        }

        // Filter by search text if provided
        let filteredRecords = allRecords
        if (searchText.trim() !== '') {
          filteredRecords = allRecords.filter(record => 
            record.name.toLowerCase().includes(searchText.toLowerCase())
          )
        }

        // Sort records
        filteredRecords.sort((a, b) => {
          let aValue = a[sortField]
          let bValue = b[sortField]

          // Handle string comparison for case-insensitive sorting
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
          }
        })

        // Apply pagination
        const paginatedRecords = filteredRecords.slice(offset, offset + pageSize)

        // Simulate network delay
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              records: paginatedRecords,
              total: filteredRecords.length,
              offset,
              pageSize
            })
          }, 300)
        })
      })
    },
  })

  return server
}
