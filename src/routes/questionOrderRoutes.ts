import { Server, Response, Model, Factory } from 'miragejs'

// Types for Mirage models
export interface Question {
  id: string
  text: string
  reviewType: 'Due Diligence' | 'Periodic Review'
  participantType: 'XY' | 'PQR'
  country: 'USA' | 'UK' | 'India' | 'Canada'
  order: number
  sectionId: number
}

export interface Section {
  id: number
  name: string
}

// Models for question order
export const questionOrderModels = {
  question: Model.extend<Partial<Question>>({}),
  section: Model.extend<Partial<Section>>({}),
}

// Factories for question order
export const questionOrderFactories = {
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
}

// Seed function for question order data
export function seedQuestionOrderData(server: any) {
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
}

export function registerQuestionOrderRoutes(server: Server) {
  // POST /api/question-order/search - Fetch with filters in request body
  server.post('/question-order/search', (schema, request) => {
    const body = request.requestBody ? JSON.parse(request.requestBody) : {}
    const { reviewType, participantType, country } = body
    
    const hasFilters = Boolean(reviewType || participantType || country)

    // Get all questions grouped by section
    const allQuestions = schema.all('question').models
    const sections = schema.all('section').models

    // Group questions by section
    const sectionMap: Record<number, any[]> = {}
    sections.forEach(section => {
      const sectionId = Number(section.id)
      sectionMap[sectionId] = []
    })

    allQuestions.forEach(q => {
      const sectionId = Number((q as any).sectionId)
      if (sectionMap[sectionId]) {
        sectionMap[sectionId].push(q)
      }
    })

    // Build response with all sections
    const allSectionsData = sections.map(section => {
      const sectionId = Number(section.id)
      const questions = (sectionMap[sectionId] || [])
        .sort((a, b) => Number((a as any).order) - Number((b as any).order))
        .map((q, idx) => ({
          questionOrderId: idx + 1,
          questionID: (q as any).id,
          questionText: (q as any).text,
          reviewType: (q as any).reviewType,
          participantType: (q as any).participantType,
          country: (q as any).country,
          status: (q as any).status,
        }))

      return {
        sectionOrderId: sectionId,
        sectionID: sectionId,
        sectionName: (section as any).name,
        questions,
      }
    })

    // Build filtered sections if filters are active
    const filteredSectionsData = hasFilters
      ? sections
          .map(section => {
            const sectionId = Number(section.id)
            const filteredQuestions = (sectionMap[sectionId] || [])
              .filter(q => {
                const question = q as any
                if (reviewType && question.reviewType !== reviewType) return false
                if (participantType && question.participantType !== participantType) return false
                if (country && question.country !== country) return false
                return true
              })
              .sort((a, b) => Number((a as any).order) - Number((b as any).order))
              .map((q, idx) => ({
                questionOrderId: idx + 1,
                questionID: (q as any).id,
                questionText: (q as any).text,
                reviewType: (q as any).reviewType,
                participantType: (q as any).participantType,
                country: (q as any).country,
                status: (q as any).status,
              }))

            return {
              sectionOrderId: sectionId,
              sectionID: sectionId,
              sectionName: (section as any).name,
              questions: filteredQuestions,
            }
          })
          .filter(section => section.questions.length > 0)
      : []

    return new Response(
      200,
      {},
      {
        status: 'SUCCESS',
        filteredSections: filteredSectionsData,
        sections: allSectionsData,
      }
    )
  })

  // POST /api/question-order (save order)
  server.post('/question-order', (schema, request) => {
    const body = JSON.parse(request.requestBody)
    console.log('Mirage: Saving question order:', body)

    // Update the order in the database
    body.sections?.forEach((section: any) => {
      section.questions?.forEach((question: any, index: number) => {
        const q = schema.findBy('question', { id: question.questionID })
        if (q) {
          q.update({ order: index + 1 })
        }
      })
    })

    return new Response(
      200,
      {},
      {
        status: 'SUCCESS',
        message: 'Question order saved successfully',
      }
    )
  })

  // POST /api/question-order/reset (reset to initial state)
  server.post('/question-order/reset', (schema) => {
    // Clear all questions and sections
    schema.all('question').models.forEach(q => q.destroy())
    schema.all('section').models.forEach(s => s.destroy())

    // Re-seed using the shared seed function
    seedQuestionOrderData((server as any).schema)

    return new Response(
      200,
      {},
      {
        status: 'SUCCESS',
        message: 'Data reset successfully',
      }
    )
  })
}
