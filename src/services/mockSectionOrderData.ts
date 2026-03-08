// Mock data for Section Order V2

export interface Question {
  questionSeqNo: number
  questionId: string
  questionOrderId: string | number
  questionText?: string
  countries?: string[]
  participantTypes?: string[]
  reviewTypes?: string[]
}

export interface FilteredSection {
  sectionSeqNo: number
  sectionId: number
  sectionOrderId: string
  sectionName: string
  questions?: Question[]
}

export interface UpdateSectionOrderRequest {
  sections: FilteredSection[]
}

export interface UpdateSectionOrderResponse {
  status: 'SUCCESS' | 'ERROR'
  statusCode: string
  message: string
  data?: {
    sectionsUpdated: number
    questionsReordered: number
  }
}

export interface ApiResponse {
  status: 'SUCCESS' | 'ERROR'
  statusCode: string
  filteredSections: FilteredSection[]
  sections: FilteredSection[]
}

export interface FilterRequest {
  reviewTypes: string[]
  participantTypes: string[]
  countries: string[]
}

// Mock sections with full questions
const mockSectionsData: FilteredSection[] = [
  {
    sectionSeqNo: 1,
    sectionId: 1,
    sectionOrderId: '1',
    sectionName: 'Entity Information',
    questions: [
      {
        questionSeqNo: 1,
        questionId: 'QID0001',
        questionOrderId: '1',
        questionText: 'What is the legal name of the entity?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Issuer', 'Acquires'],
        reviewTypes: ['Due Diligence', 'Periodic Review'],
      },
      {
        questionSeqNo: 2,
        questionId: 'QID0002',
        questionOrderId: '2',
        questionText: 'What is the registration number?',
        countries: ['USA', 'UK'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 3,
        questionId: 'QID0003',
        questionOrderId: '3',
        questionText: 'When was the entity incorporated?',
        countries: ['India', 'Canada'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 4,
        questionId: 'QID0004',
        questionOrderId: '4',
        questionText: 'What is the principal business activity?',
        countries: ['USA'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 5,
        questionId: 'QID0005',
        questionOrderId: '5',
        questionText: 'Where is the registered office located?',
        countries: ['UK', 'Canada'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 6,
        questionId: 'QID0006',
        questionOrderId: '6',
        questionText: 'What is the total number of employees?',
        countries: ['USA', 'India'],
        participantTypes: ['Acquires', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 7,
        questionId: 'QID0007',
        questionOrderId: '7',
        questionText: 'What are the main subsidiaries?',
        countries: ['USA', 'UK', 'Canada'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 8,
        questionId: 'QID0008',
        questionOrderId: '8',
        questionText: 'What is the registered capital?',
        countries: ['India', 'UK'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 9,
        questionId: 'QID0009',
        questionOrderId: '9',
        questionText: 'Has the entity been subject to any regulatory action?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 10,
        questionId: 'QID0010',
        questionOrderId: '10',
        questionText: 'What is the financial year end date?',
        countries: ['UK', 'India'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Due Diligence'],
      },
    ],
  },
  {
    sectionSeqNo: 2,
    sectionId: 2,
    sectionOrderId: '2',
    sectionName: 'Contact Information',
    questions: [
      {
        questionSeqNo: 1,
        questionId: 'QID0011',
        questionOrderId: '11',
        questionText: 'What is the primary contact name?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 2,
        questionId: 'QID0012',
        questionOrderId: '12',
        questionText: 'What is the contact email address?',
        countries: ['USA', 'UK'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 3,
        questionId: 'QID0013',
        questionOrderId: '13',
        questionText: 'What is the contact phone number?',
        countries: ['India', 'Canada'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 4,
        questionId: 'QID0014',
        questionOrderId: '14',
        questionText: 'Is there a backup contact person?',
        countries: ['USA'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 5,
        questionId: 'QID0015',
        questionOrderId: '15',
        questionText: 'What is the mailing address?',
        countries: ['UK', 'Canada'],
        participantTypes: ['Issuer', 'Acquires'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 6,
        questionId: 'QID0016',
        questionOrderId: '16',
        questionText: 'What is the office location?',
        countries: ['USA', 'India'],
        participantTypes: ['Acquires DNC'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 7,
        questionId: 'QID0017',
        questionOrderId: '17',
        questionText: 'How can compliance be contacted?',
        countries: ['USA', 'UK'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 8,
        questionId: 'QID0018',
        questionOrderId: '18',
        questionText: 'What is the legal contact information?',
        countries: ['Canada', 'India'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 9,
        questionId: 'QID0019',
        questionOrderId: '19',
        questionText: 'What is the finance contact?',
        countries: ['USA'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 10,
        questionId: 'QID0020',
        questionOrderId: '20',
        questionText: 'What is the main website URL?',
        countries: ['UK', 'USA'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
    ],
  },
  {
    sectionSeqNo: 3,
    sectionId: 3,
    sectionOrderId: '3',
    sectionName: 'Controlling Party Information',
    questions: [
      {
        questionSeqNo: 1,
        questionId: 'QID0021',
        questionOrderId: '21',
        questionText: 'Who are the ultimate beneficial owners?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 2,
        questionId: 'QID0022',
        questionOrderId: '22',
        questionText: 'What is the ownership structure?',
        countries: ['India', 'UK'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 3,
        questionId: 'QID0023',
        questionOrderId: '23',
        questionText: 'Are there any nominees involved?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 4,
        questionId: 'QID0024',
        questionOrderId: '24',
        questionText: 'What percentage do major shareholders hold?',
        countries: ['UK', 'Canada'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 5,
        questionId: 'QID0025',
        questionOrderId: '25',
        questionText: 'Are public announcements made regarding ownership?',
        countries: ['USA', 'India'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 6,
        questionId: 'QID0026',
        questionOrderId: '26',
        questionText: 'Who controls the board of directors?',
        countries: ['USA', 'UK'],
        participantTypes: ['Acquires', 'Acquires DNC'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 7,
        questionId: 'QID0027',
        questionOrderId: '27',
        questionText: 'What is the voting structure?',
        countries: ['Canada', 'India'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 8,
        questionId: 'QID0028',
        questionOrderId: '28',
        questionText: 'Are there any pledged or mortgaged shares?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 9,
        questionId: 'QID0029',
        questionOrderId: '29',
        questionText: 'What are the directors\' interests?',
        countries: ['UK', 'India'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 10,
        questionId: 'QID0030',
        questionOrderId: '30',
        questionText: 'Are there any related party transactions?',
        countries: ['USA', 'UK'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
    ],
  },
  {
    sectionSeqNo: 4,
    sectionId: 4,
    sectionOrderId: '4',
    sectionName: 'Ownership Information',
    questions: [
      {
        questionSeqNo: 1,
        questionId: 'QID0031',
        questionOrderId: '31',
        questionText: 'What is the share capital breakdown?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 2,
        questionId: 'QID0032',
        questionOrderId: '32',
        questionText: 'Are there different classes of shares?',
        countries: ['India', 'UK'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 3,
        questionId: 'QID0033',
        questionOrderId: '33',
        questionText: 'What are the rights of each share class?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 4,
        questionId: 'QID0034',
        questionOrderId: '34',
        questionText: 'Are there any options or warrants outstanding?',
        countries: ['UK', 'Canada'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 5,
        questionId: 'QID0035',
        questionOrderId: '35',
        questionText: 'What is the share transfer policy?',
        countries: ['USA', 'India'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 6,
        questionId: 'QID0036',
        questionOrderId: '36',
        questionText: 'Are there anti-dilution provisions?',
        countries: ['USA', 'UK'],
        participantTypes: ['Acquires', 'Acquires DNC'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 7,
        questionId: 'QID0037',
        questionOrderId: '37',
        questionText: 'What is the recent ownership history?',
        countries: ['Canada', 'India'],
        participantTypes: ['Issuer'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 8,
        questionId: 'QID0038',
        questionOrderId: '38',
        questionText: 'Are there any shareholder agreements?',
        countries: ['USA', 'Canada'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
      {
        questionSeqNo: 9,
        questionId: 'QID0039',
        questionOrderId: '39',
        questionText: 'What is the dividend policy?',
        countries: ['UK', 'India'],
        participantTypes: ['Issuer', 'Acquires DNC'],
        reviewTypes: ['Due Diligence'],
      },
      {
        questionSeqNo: 10,
        questionId: 'QID0040',
        questionOrderId: '40',
        questionText: 'Are there any restrictions on share ownership?',
        countries: ['USA', 'UK'],
        participantTypes: ['Acquires'],
        reviewTypes: ['Periodic Review'],
      },
    ],
  },
]

// Function to filter sections based on filter criteria
export const getFilteredSections = (filters: FilterRequest): FilteredSection[] => {
  if (
    filters.reviewTypes.length === 0 &&
    filters.participantTypes.length === 0 &&
    filters.countries.length === 0
  ) {
    return []
  }

  return mockSectionsData
    .map((section) => {
      if (!section.questions) {
        return section
      }

      // Filter questions based on criteria
      const filteredQuestions = section.questions.filter((question) => {
        const matchesReviewType =
          filters.reviewTypes.length === 0 ||
          (question.reviewTypes &&
            question.reviewTypes.some((rt) => filters.reviewTypes.includes(rt)))

        const matchesParticipantType =
          filters.participantTypes.length === 0 ||
          (question.participantTypes &&
            question.participantTypes.some((pt) => filters.participantTypes.includes(pt)))

        const matchesCountry =
          filters.countries.length === 0 ||
          (question.countries && question.countries.some((c) => filters.countries.includes(c)))

        return matchesReviewType && matchesParticipantType && matchesCountry
      })

      // Only include section if it has filtered questions
      if (filteredQuestions.length > 0) {
        return {
          ...section,
          questions: filteredQuestions,
        }
      }

      return null
    })
    .filter((section) => section !== null) as FilteredSection[]
}

// Function to get all sections with all questions
export const getAllSections = (): FilteredSection[] => {
  return mockSectionsData
}

// Function to build API response
export const buildApiResponse = (filters: FilterRequest): ApiResponse => {
  const filteredSections = getFilteredSections(filters)
  const hasFilters =
    filters.reviewTypes.length > 0 ||
    filters.participantTypes.length > 0 ||
    filters.countries.length > 0

  return {
    status: 'SUCCESS',
    statusCode: '200',
    filteredSections: hasFilters ? filteredSections : [],
    sections: mockSectionsData, // Always return all sections so full order is available for drag-drop
  }
}

// Function to update section order
export const updateSectionOrder = (
  request: UpdateSectionOrderRequest
): UpdateSectionOrderResponse => {
  try {
    // Simulate API call delay
    if (request.sections && request.sections.length > 0) {
      let totalQuestionsReordered = 0

      // Count total questions reordered
      request.sections.forEach((section) => {
        if (section.questions) {
          totalQuestionsReordered += section.questions.length
        }
      })

      console.log('=== POST Data to API ===')
      console.log('Request Body:', JSON.stringify(request, null, 2))
      console.log('========================')

      return {
        status: 'SUCCESS',
        statusCode: '200',
        message: `Section order updated successfully. ${request.sections.length} sections and ${totalQuestionsReordered} questions reordered.`,
        data: {
          sectionsUpdated: request.sections.length,
          questionsReordered: totalQuestionsReordered,
        },
      }
    }

    return {
      status: 'ERROR',
      statusCode: '400',
      message: 'No sections provided in request',
    }
  } catch (error) {
    console.error('Error updating section order:', error)
    return {
      status: 'ERROR',
      statusCode: '500',
      message: 'Internal server error',
    }
  }
}
