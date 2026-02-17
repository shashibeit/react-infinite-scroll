// Mock API Service - Replace with real API endpoints when backend is ready

export type ReviewType = 'Due Diligence' | 'Periodic Review'
export type ParticipantType = 'XY' | 'PQR'
export type CountryType = 'USA' | 'UK' | 'India' | 'Canada'
export type QuestionStatus = 'APPROVED' | 'REVIEW' | 'CANCELLED'

export interface Section {
  id: string
  title: string
}

export interface Question {
  id: string
  sectionId: string
  text: string
  reviewType: ReviewType
  participantType: ParticipantType
  country: CountryType
  status: QuestionStatus
  createdBy?: string
  createdAt?: string
}

export interface SectionQuestionOrder {
  sectionId: string
  questionId: string
  orderIndex: number
}

export interface QuestionFilters {
  reviewType?: ReviewType
  participantType?: ParticipantType
  country?: CountryType
}

// Mock data storage (in-memory)
let mockSections: Section[] = []
let mockQuestions: Question[] = []
let mockOrderData: SectionQuestionOrder[] = []

// Helper function to get random element
function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Initialize mock data
function initializeMockData() {
  const sections: Section[] = [
    { id: '1', title: 'Customer Onboarding' },
    { id: '2', title: 'Risk Assessment' },
    { id: '3', title: 'Compliance Review' },
    { id: '4', title: 'Financial Analysis' },
    { id: '5', title: 'Data Privacy' },
    { id: '6', title: 'Operational Due Diligence' },
    { id: '7', title: 'IT Security' },
    { id: '8', title: 'Legal Documentation' },
    { id: '9', title: 'Background Checks' },
    { id: '10', title: 'Anti-Money Laundering' },
    { id: '11', title: 'Market Analysis' },
    { id: '12', title: 'Regulatory Compliance' },
    { id: '13', title: 'Third Party Validation' }
  ]

  const questionTemplates = [
    'What is the current status of {topic}?',
    'How does {topic} impact our operations?',
    'What measures are in place for {topic}?',
    'Who is responsible for {topic}?',
    'When was {topic} last reviewed?',
    'What are the key risks associated with {topic}?',
    'How is {topic} documented?',
    'What controls exist for {topic}?',
    'How often is {topic} monitored?',
    'What is the approval process for {topic}?',
    'How is {topic} reported to stakeholders?',
    'What training is required for {topic}?',
    'How is {topic} compliance verified?',
    'What are the penalties for {topic} violations?',
    'How can {topic} processes be improved?'
  ]

  const reviewTypes: ReviewType[] = ['Due Diligence', 'Periodic Review']
  const participantTypes: ParticipantType[] = ['XY', 'PQR']
  const countries: CountryType[] = ['USA', 'UK', 'India', 'Canada']

  const questions: Question[] = []
  const orderData: SectionQuestionOrder[] = []
  let globalQuestionCounter = 1

  sections.forEach((section) => {
    const questionCount = Math.floor(Math.random() * 6) + 5 // 5-10 questions
    const sectionQuestions: Question[] = []

    for (let i = 0; i < questionCount; i++) {
      const template = getRandom(questionTemplates)
      const questionText = template.replace('{topic}', section.title)

      const question: Question = {
        id: `QID${String(globalQuestionCounter).padStart(4, '0')}`,
        sectionId: section.id,
        text: questionText,
        reviewType: getRandom(reviewTypes),
        participantType: getRandom(participantTypes),
        country: getRandom(countries),
        status: Math.random() > 0.3 ? 'APPROVED' : 'REVIEW',
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      }

      sectionQuestions.push(question)
      globalQuestionCounter++
    }

    // Randomly shuffle questions within section
    sectionQuestions.sort(() => Math.random() - 0.5)

    // Add to main array and create order data
    sectionQuestions.forEach((question, index) => {
      questions.push(question)
      orderData.push({
        sectionId: section.id,
        questionId: question.id,
        orderIndex: index + 1
      })
    })
  })

  mockSections = sections
  mockQuestions = questions
  mockOrderData = orderData
}

// Initialize data on module load
initializeMockData()

// API Functions (simulating async calls)

export const mockApi = {
  // Get all sections
  async getSections(): Promise<Section[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockSections]
  },

  // Get all questions
  async getQuestions(): Promise<Question[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockQuestions]
  },

  // Get questions for a specific section
  async getQuestionsBySection(sectionId: string): Promise<Question[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockQuestions.filter(q => q.sectionId === sectionId)
  },

  // Get question order for a section
  async getSectionOrder(sectionId: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const orders = mockOrderData
      .filter(o => o.sectionId === sectionId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
    return orders.map(o => o.questionId)
  },

  // Save question order for a section
  async saveSectionOrder(sectionId: string, questionIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Remove old order data for this section
    mockOrderData = mockOrderData.filter(o => o.sectionId !== sectionId)
    
    // Add new order data
    questionIds.forEach((questionId, index) => {
      mockOrderData.push({
        sectionId,
        questionId,
        orderIndex: index + 1
      })
    })
  },

  // Get filtered questions for a section
  async getFilteredQuestions(sectionId: string, filters: QuestionFilters): Promise<Question[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let questions = mockQuestions.filter(q => q.sectionId === sectionId)
    
    if (filters.reviewType) {
      questions = questions.filter(q => q.reviewType === filters.reviewType)
    }
    if (filters.participantType) {
      questions = questions.filter(q => q.participantType === filters.participantType)
    }
    if (filters.country) {
      questions = questions.filter(q => q.country === filters.country)
    }
    
    // Sort by order
    const orderMap = new Map<string, number>()
    mockOrderData
      .filter(o => o.sectionId === sectionId)
      .forEach(o => orderMap.set(o.questionId, o.orderIndex))
    
    questions.sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 999
      const orderB = orderMap.get(b.id) ?? 999
      return orderA - orderB
    })
    
    return questions
  },

  // Get filtered question IDs (just the IDs in order)
  async getFilteredQuestionIds(sectionId: string, filters: QuestionFilters): Promise<string[]> {
    const questions = await this.getFilteredQuestions(sectionId, filters)
    return questions.map(q => q.id)
  },

  // Reset mock data
  async resetData(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    initializeMockData()
  },

  // Export all data
  async exportData(): Promise<{ sections: Section[], questions: Question[], order: SectionQuestionOrder[] }> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      sections: [...mockSections],
      questions: [...mockQuestions],
      order: [...mockOrderData]
    }
  },

  // Get question order data in backend format
  async getQuestionOrderData(filters: QuestionFilters): Promise<{
    status: 'SUCCESS' | 'ERROR'
    filteredSections: any[]
    sections: any[]
  }> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      // Build sections array (all sections with all questions)
      const sections = mockSections.map(section => {
        // Get all questions for this section
        const sectionQuestions = mockQuestions.filter(q => q.sectionId === section.id)
        
        // Get order for these questions
        const orderMap = new Map<string, number>()
        mockOrderData
          .filter(o => o.sectionId === section.id)
          .forEach(o => orderMap.set(o.questionId, o.orderIndex))
        
        // Sort by order
        sectionQuestions.sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999
          const orderB = orderMap.get(b.id) ?? 999
          return orderA - orderB
        })
        
        // Map to backend format
        const questions = sectionQuestions.map((q, index) => ({
          questionSeqNo: index + 1,
          questionID: q.id,
          questionText: q.text,
          reviewType: q.reviewType,
          participantType: q.participantType,
          country: q.country,
          status: q.status
        }))
        
        return {
          sectionSeqNo: parseInt(section.id),
          sectionID: parseInt(section.id),
          sectionName: section.title,
          questions
        }
      })
      
      // Build filtered sections array (only if filters are applied)
      let filteredSections: any[] = []
      const hasFilters = filters.reviewType || filters.participantType || filters.country
      
      if (hasFilters) {
        filteredSections = mockSections.map(section => {
          // Get questions for this section
          let sectionQuestions = mockQuestions.filter(q => q.sectionId === section.id)
          
          // Apply filters
          if (filters.reviewType) {
            sectionQuestions = sectionQuestions.filter(q => q.reviewType === filters.reviewType)
          }
          if (filters.participantType) {
            sectionQuestions = sectionQuestions.filter(q => q.participantType === filters.participantType)
          }
          if (filters.country) {
            sectionQuestions = sectionQuestions.filter(q => q.country === filters.country)
          }
          
          // Get order for these questions
          const orderMap = new Map<string, number>()
          mockOrderData
            .filter(o => o.sectionId === section.id)
            .forEach(o => orderMap.set(o.questionId, o.orderIndex))
          
          // Sort by order
          sectionQuestions.sort((a, b) => {
            const orderA = orderMap.get(a.id) ?? 999
            const orderB = orderMap.get(b.id) ?? 999
            return orderA - orderB
          })
          
          // Map to backend format
          const questions = sectionQuestions.map((q, index) => ({
            questionSeqNo: index + 1,
            questionID: q.id,
            questionText: q.text,
            reviewType: q.reviewType,
            participantType: q.participantType,
            country: q.country,
            status: q.status
          }))
          
          return {
            sectionSeqNo: parseInt(section.id),
            sectionID: parseInt(section.id),
            sectionName: section.title,
            questions
          }
        }).filter(section => section.questions.length > 0) // Only include sections with matching questions
      }
      
      return {
        status: 'SUCCESS',
        filteredSections,
        sections
      }
    } catch (error) {
      return {
        status: 'ERROR',
        filteredSections: [],
        sections: []
      }
    }
  },

  // Save order to API (POST endpoint simulation)
  async saveOrderToApi(data: any): Promise<{ success: boolean, message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('=== Mock API Call ===')
    console.log('POST /api/section-order')
    console.log('Data:', JSON.stringify(data, null, 2))
    console.log('====================')
    
    // Simulate success
    return {
      success: true,
      message: 'Order saved successfully'
    }
  }
}
