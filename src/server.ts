import { createServer, Response, Model, Factory } from 'miragejs'
import { registerQuestionOrderRoutes } from './routes/questionOrderRoutes'

interface ServerConfig {
  environment?: string
}

// Types for Mirage models
interface Question {
  id: string
  text: string
  reviewType: 'Due Diligence' | 'Periodic Review'
  participantType: 'XY' | 'PQR'
  country: 'USA' | 'UK' | 'India' | 'Canada'
  order: number
  sectionId: number
}

interface Section {
  id: number
  name: string
}

export function makeServer({ environment = 'development' }: ServerConfig = {}) {
  const server = createServer({
    environment,

    models: {
      question: Model.extend<Partial<Question>>({}),
      section: Model.extend<Partial<Section>>({}),
    },

    factories: {
      section: Factory.extend({
        id(i: number) {
          return i + 1
        },
        name(i: number) {
          return `Section ${i + 1}`
        },
      }),

      question: Factory.extend({
        id(i: number) {
          return `QID${String(i + 1).padStart(4, '0')}`
        },
        text(i: number) {
          const templates = [
            'What is your risk assessment?',
            'Describe your compliance process',
            'How do you handle data privacy?',
            'What are your security measures?',
            'Explain your audit procedures',
            'What is your incident response plan?',
            'How do you manage vendor risks?',
            'Describe your training program',
            'What are your monitoring procedures?',
            'How do you ensure regulatory compliance?',
          ]
          return templates[i % templates.length]
        },
        reviewType() {
          return Math.random() > 0.5 ? 'Due Diligence' : 'Periodic Review'
        },
        participantType() {
          return Math.random() > 0.5 ? 'XY' : 'PQR'
        },
        country() {
          const countries = ['USA', 'UK', 'India', 'Canada']
          return countries[Math.floor(Math.random() * countries.length)]
        },
        sectionId(i: number) {
          return (i % 13) + 1
        },
        order(i: number) {
          return i + 1
        },
      }),
    },

    seeds(server) {
      // Create 13 sections
      for (let i = 0; i < 13; i++) {
        server.create('section', { id: String(i + 1), name: `Section ${i + 1}` } as any)
      }

      // Create questions for each section (random 5-10 per section)
      let questionCounter = 0
      for (let sectionId = 1; sectionId <= 13; sectionId++) {
        const numQuestions = Math.floor(Math.random() * 6) + 5 // 5 to 10 questions
        for (let q = 0; q < numQuestions; q++) {
          server.create('question', {
            id: `QID${String(questionCounter + 1).padStart(4, '0')}`,
            sectionId,
            order: q + 1,
          } as any)
          questionCounter++
        }
      }
    },

    routes() {
      this.namespace = 'api'
      this.timing = 500 // Simulate network delay

      // Register Question Order Routes
      registerQuestionOrderRoutes(this)

      // ========== Existing Routes ==========


      this.get('/getrecords', (_schema, request) => {
        const searchText = (request.queryParams.searchText as string) || ''
        const offset = parseInt((request.queryParams.offset as string) || '0', 10)
        const sortField = (request.queryParams.sortField as string) || 'id'
        const sortOrder = (request.queryParams.sortOrder as string) || 'asc'
        const pageSize = 100

        // Generate sample data
        const questionSamples = [
          'What are your thoughts on climate change policy?',
          'How can we improve public transportation?',
          'What measures should be taken for data privacy?',
          'How can healthcare accessibility be improved?',
          'What are your views on renewable energy adoption?',
          'How should education reform be approached?',
          'What strategies can reduce urban pollution?',
          'How can we address income inequality?',
          'What improvements are needed in cybersecurity?',
          'How should we regulate artificial intelligence?'
        ]
        
        const statuses = ['Active', 'Pending', 'Completed', 'Draft', 'Under Review']
        const reviewTypes = ['Peer Review', 'Expert Review', 'Internal Review', 'External Review', 'Public Review']
        const participantTypes = ['Individual', 'Organization', 'Government', 'Academic', 'Private Sector']
        const sections = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E']
        const countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Japan', 'Australia', 'India', 'Brazil', 'China']

        // Generate a large pool of records (e.g., 1000 records)
        const allRecords = []
        for (let i = 1; i <= 1000; i++) {
          const questionText = questionSamples[Math.floor(Math.random() * questionSamples.length)]
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          const reviewType = reviewTypes[Math.floor(Math.random() * reviewTypes.length)]
          const participantType = participantTypes[Math.floor(Math.random() * participantTypes.length)]
          const section = sections[Math.floor(Math.random() * sections.length)]
          const country = countries[Math.floor(Math.random() * countries.length)]
          
          allRecords.push({ 
            id: i, 
            questionText: `${questionText} (${i})`,
            status, 
            reviewType,
            participantType,
            section,
            countries: country
          })
        }

        // Filter by search text if provided
        let filteredRecords = allRecords
        if (searchText.trim() !== '') {
          filteredRecords = allRecords.filter(record => 
            record.questionText.toLowerCase().includes(searchText.toLowerCase()) ||
            record.status.toLowerCase().includes(searchText.toLowerCase()) ||
            record.reviewType.toLowerCase().includes(searchText.toLowerCase()) ||
            record.participantType.toLowerCase().includes(searchText.toLowerCase()) ||
            record.section.toLowerCase().includes(searchText.toLowerCase()) ||
            record.countries.toLowerCase().includes(searchText.toLowerCase())
          )
        }

        // Sort records only if sortField is provided
        if (sortField && sortField.trim() !== '') {
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
        }

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

      this.get('/getcategories', (_schema, request) => {
        const offset = parseInt((request.queryParams.offset as string) || '0', 10)
        const pageSize = parseInt((request.queryParams.pageSize as string) || '50', 10)

        // Generate sample category data
        const categoryPrefixes = ['Technology', 'Business', 'Science', 'Art', 'Music', 'Sports', 'Health', 
          'Education', 'Finance', 'Marketing', 'Design', 'Engineering', 'Medicine', 'Law', 'Agriculture',
          'Architecture', 'Psychology', 'Sociology', 'Philosophy', 'Literature']
        
        const categorySuffixes = ['Basics', 'Advanced', 'Professional', 'Expert', 'Fundamentals', 
          'Principles', 'Concepts', 'Applications', 'Theory', 'Practice']

        // Generate a pool of 200 categories
        const allCategories = []
        for (let i = 1; i <= 200; i++) {
          const prefix = categoryPrefixes[Math.floor(Math.random() * categoryPrefixes.length)]
          const suffix = categorySuffixes[Math.floor(Math.random() * categorySuffixes.length)]
          
          allCategories.push({
            id: i,
            name: `${prefix} - ${suffix} ${i}`,
            description: `Comprehensive ${prefix.toLowerCase()} ${suffix.toLowerCase()} for professionals`
          })
        }

        // Apply pagination
        const paginatedCategories = allCategories.slice(offset, offset + pageSize)

        return new Response(
          200,
          {},
          {
            records: paginatedCategories,
            total: allCategories.length,
            offset,
            pageSize
          }
        )
      })

      this.get('/getcountries', (_schema, request) => {
        const offset = parseInt((request.queryParams.offset as string) || '0', 10)
        const pageSize = parseInt((request.queryParams.pageSize as string) || '50', 10)

        // Generate sample country data (195 countries)
        const countries = [
          { id: 1, code: 'US', name: 'United States' },
          { id: 2, code: 'GB', name: 'United Kingdom' },
          { id: 3, code: 'CA', name: 'Canada' },
          { id: 4, code: 'AU', name: 'Australia' },
          { id: 5, code: 'DE', name: 'Germany' },
          { id: 6, code: 'FR', name: 'France' },
          { id: 7, code: 'IT', name: 'Italy' },
          { id: 8, code: 'ES', name: 'Spain' },
          { id: 9, code: 'JP', name: 'Japan' },
          { id: 10, code: 'CN', name: 'China' },
          { id: 11, code: 'IN', name: 'India' },
          { id: 12, code: 'BR', name: 'Brazil' },
          { id: 13, code: 'MX', name: 'Mexico' },
          { id: 14, code: 'RU', name: 'Russia' },
          { id: 15, code: 'ZA', name: 'South Africa' },
          { id: 16, code: 'NL', name: 'Netherlands' },
          { id: 17, code: 'BE', name: 'Belgium' },
          { id: 18, code: 'CH', name: 'Switzerland' },
          { id: 19, code: 'SE', name: 'Sweden' },
          { id: 20, code: 'NO', name: 'Norway' },
          { id: 21, code: 'DK', name: 'Denmark' },
          { id: 22, code: 'FI', name: 'Finland' },
          { id: 23, code: 'PL', name: 'Poland' },
          { id: 24, code: 'AT', name: 'Austria' },
          { id: 25, code: 'IE', name: 'Ireland' },
          { id: 26, code: 'PT', name: 'Portugal' },
          { id: 27, code: 'GR', name: 'Greece' },
          { id: 28, code: 'CZ', name: 'Czech Republic' },
          { id: 29, code: 'HU', name: 'Hungary' },
          { id: 30, code: 'RO', name: 'Romania' },
          { id: 31, code: 'NZ', name: 'New Zealand' },
          { id: 32, code: 'SG', name: 'Singapore' },
          { id: 33, code: 'HK', name: 'Hong Kong' },
          { id: 34, code: 'KR', name: 'South Korea' },
          { id: 35, code: 'TW', name: 'Taiwan' },
          { id: 36, code: 'TH', name: 'Thailand' },
          { id: 37, code: 'MY', name: 'Malaysia' },
          { id: 38, code: 'ID', name: 'Indonesia' },
          { id: 39, code: 'PH', name: 'Philippines' },
          { id: 40, code: 'VN', name: 'Vietnam' },
          { id: 41, code: 'AE', name: 'United Arab Emirates' },
          { id: 42, code: 'SA', name: 'Saudi Arabia' },
          { id: 43, code: 'IL', name: 'Israel' },
          { id: 44, code: 'TR', name: 'Turkey' },
          { id: 45, code: 'EG', name: 'Egypt' },
          { id: 46, code: 'AR', name: 'Argentina' },
          { id: 47, code: 'CL', name: 'Chile' },
          { id: 48, code: 'CO', name: 'Colombia' },
          { id: 49, code: 'PE', name: 'Peru' },
          { id: 50, code: 'VE', name: 'Venezuela' }
        ]

        // Extend to 195 countries by adding more
        for (let i = 51; i <= 195; i++) {
          countries.push({
            id: i,
            code: `C${i}`,
            name: `Country ${i}`
          })
        }

        // Apply pagination
        const paginatedCountries = countries.slice(offset, offset + pageSize)

        return new Response(
          200,
          {},
          {
            records: paginatedCountries,
            total: countries.length,
            offset,
            pageSize
          }
        )
      })
    },
  })

  return server
}
