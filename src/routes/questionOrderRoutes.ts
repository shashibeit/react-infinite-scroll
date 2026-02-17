import { Server, Response } from 'miragejs'

export function registerQuestionOrderRoutes(server: Server) {
  // GET /api/question-order?reviewType=...&participantType=...&country=...
  server.get('/question-order', (schema, request) => {
    const { reviewType, participantType, country } = request.queryParams as Record<string, string>
    
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
          questionSeqNo: idx + 1,
          questionID: (q as any).id,
          questionText: (q as any).text,
          reviewType: (q as any).reviewType,
          participantType: (q as any).participantType,
          country: (q as any).country,
          status: (q as any).status,
        }))

      return {
        sectionSeqNo: sectionId,
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
                questionSeqNo: idx + 1,
                questionID: (q as any).id,
                questionText: (q as any).text,
                reviewType: (q as any).reviewType,
                participantType: (q as any).participantType,
                country: (q as any).country,
                status: (q as any).status,
              }))

            return {
              sectionSeqNo: sectionId,
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

    // Re-seed
    for (let i = 0; i < 13; i++) {
      schema.create('section', { id: String(i + 1), name: `Section ${i + 1}` } as any)
    }

    let questionCounter = 0
    for (let sectionId = 1; sectionId <= 13; sectionId++) {
      const numQuestions = Math.floor(Math.random() * 6) + 5
      for (let q = 0; q < numQuestions; q++) {
        schema.create('question', {
          id: `QID${String(questionCounter + 1).padStart(4, '0')}`,
          sectionId,
          order: q + 1,
        } as any)
        questionCounter++
      }
    }

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
