import { createServer, Response } from 'miragejs'

interface ServerConfig {
  environment?: string
}

export function makeServer({ environment = 'development' }: ServerConfig = {}) {
  const server = createServer({
    environment,

    routes() {
      this.namespace = 'api'

      this.get('/getrecords', (_schema, request) => {
        const searchText = (request.queryParams.searchText as string) || ''
        const offset = parseInt((request.queryParams.offset as string) || '0', 10)
        const sortField = (request.queryParams.sortField as string) || 'id'
        const sortOrder = (request.queryParams.sortOrder as string) || 'asc'
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
        filteredRecords.sort((a: any, b: any) => {
          const field = sortField as string
          let aValue = a[field]
          let bValue = b[field]

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
        return new Response(
          200,
          {},
          {
            records: paginatedRecords,
            total: filteredRecords.length,
            offset,
            pageSize
          }
        )
      })

      this.get('/getproducts', (_schema, request) => {
        const searchText = (request.queryParams.searchText as string) || ''
        const offset = parseInt((request.queryParams.offset as string) || '0', 10)
        const pageSize = parseInt((request.queryParams.pageSize as string) || '25', 10)
        const sortField = (request.queryParams.sortField as string) || 'id'
        const sortOrder = (request.queryParams.sortOrder as string) || 'asc'

        // Generate sample product data
        const productNames = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Webcam', 'Microphone', 'Speaker', 
          'Desk', 'Chair', 'Phone', 'Tablet', 'Charger', 'Cable', 'Router', 'Switch', 'Printer', 'Scanner', 'Camera', 'Tripod']
        const categories = ['Electronics', 'Accessories', 'Furniture', 'Peripherals', 'Networking']

        // Generate a large pool of products (e.g., 500 products)
        const allProducts = []
        for (let i = 1; i <= 500; i++) {
          const productName = `${productNames[Math.floor(Math.random() * productNames.length)]} ${i}`
          const category = categories[Math.floor(Math.random() * categories.length)]
          const price = parseFloat((Math.random() * (999 - 10) + 10).toFixed(2))
          const stock = Math.floor(Math.random() * 200)
          
          allProducts.push({ id: i, name: productName, category, price, stock })
        }

        // Filter by search text if provided
        let filteredProducts = allProducts
        if (searchText.trim() !== '') {
          filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchText.toLowerCase()) ||
            product.category.toLowerCase().includes(searchText.toLowerCase())
          )
        }

        // Sort products
        filteredProducts.sort((a: any, b: any) => {
          const field = sortField as string
          let aValue = a[field]
          let bValue = b[field]

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
        const paginatedProducts = filteredProducts.slice(offset, offset + pageSize)

        // Simulate network delay
        return new Response(
          200,
          {},
          {
            records: paginatedProducts,
            total: filteredProducts.length,
            offset,
            pageSize
          }
        )
      })
    },
  })

  return server
}
