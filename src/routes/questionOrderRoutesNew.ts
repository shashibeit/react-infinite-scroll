import { Server, Response } from 'miragejs'
import questionOrderData from '../data/questionOrderData.json'

/**
 * Question Order Routes - JSON-based API
 * 
 * This module serves question data from a static JSON file that simulates
 * a real API. The data structure includes filtering capabilities.
 */

export interface QuestionsState {
  originalData: any
  currentData: any
}

// Store the current state (simulating server-side state)
let questionsState: QuestionsState = {
  originalData: JSON.parse(JSON.stringify(questionOrderData)), // Deep copy
  currentData: JSON.parse(JSON.stringify(questionOrderData)),
}

/**
 * Reset questions to original state (simulates server reset endpoint)
 */
function resetToOriginal() {
  questionsState.currentData = JSON.parse(JSON.stringify(questionsState.originalData))
}

/**
 * Get fresh copy of data (always returns original state)
 * This ensures fresh data on each request without persistence
 */
function getFreshData() {
  return JSON.parse(JSON.stringify(questionsState.originalData))
}

/**
 * Apply filters to data
 */
function filterData(data: any, filters: any) {
  if (!filters.reviewType && !filters.participantType && !filters.country) {
    // No filters - return all data
    return {
      ...data,
      filteredSections: []
    }
  }

  // Apply filters to create filtered sections
  const filteredSections = data.sections
    .map((section: any) => ({
      ...section,
      questions: section.questions.filter((q: any) => {
        if (filters.reviewType && filters.reviewType.length > 0 && !filters.reviewType.includes(q.reviewType)) {
          return false
        }
        if (filters.participantType && filters.participantType.length > 0 && !filters.participantType.includes(q.participantType)) {
          return false
        }
        if (filters.country && filters.country.length > 0 && !filters.country.includes(q.country)) {
          return false
        }
        return true
      })
    }))
    .filter((section: any) => section.questions.length > 0) // Only include sections with matching questions

  return {
    ...data,
    filteredSections
  }
}

export function registerQuestionOrderRoutes(server: Server) {
  // POST /api/question-order/search - Fetch with filters in request body
  server.post('/question-order/search', (_schema, request) => {
    console.log('📠 [API] GET /question-order/search - Receiving fresh data')
    
    const body = request.requestBody ? JSON.parse(request.requestBody) : {}
    const { reviewType, participantType, country } = body

    // Always get fresh unmodified data
    const freshData = getFreshData()

    // Apply filters if any
    const filteredData = filterData(freshData, { reviewType, participantType, country })

    console.log('✅ [API] Returning data with', filteredData.sections.length, 'sections')
    
    return new Response(
      200,
      { 'Content-Type': 'application/json' },
      filteredData
    )
  })

  // POST /api/question-order/save - Save question order
  server.post('/question-order', (_schema, request) => {
    const body = request.requestBody ? JSON.parse(request.requestBody) : {}
    console.log('💾 [API] POST /question-order - Saving data')
    
    try {
      // Update current data with new order
      if (body.sections) {
        questionsState.currentData.sections = body.sections
      }
      
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        {
          status: 'SUCCESS',
          message: 'Question order saved successfully',
        }
      )
    } catch (error) {
      return new Response(
        400,
        { 'Content-Type': 'application/json' },
        {
          status: 'ERROR',
          message: 'Failed to save question order',
        }
      )
    }
  })

  // POST /api/question-order/reset - Reset to initial state
  server.post('/question-order/reset', (_schema, _request) => {
    console.log('🔄 [API] POST /question-order/reset - Resetting to original data')
    
    resetToOriginal()
    
    return new Response(
      200,
      { 'Content-Type': 'application/json' },
      {
        status: 'SUCCESS',
        message: 'Data reset to original state',
      }
    )
  })
}
