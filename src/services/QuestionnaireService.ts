// Mock Questionnaire Service

import { 
  generateAcknowledgementPage, 
  generateTableOfContentsPage,
  generateSignaturePage,
  generateMergedCompletePdf,
  type Section
} from '../utils/pdfGenerator'

export interface Question {
  id: string
  text: string
  type: 'single-select' | 'multi-select' | 'text' | 'date'
  options?: string[]
}

export interface QuestionnaireData {
  id: string
  reviewId: string
  title: string
  sections: Section[]
}

export interface QuestionnaireResponse {
  headerPdf: string // Acknowledgement page
  tocPdf: string // Table of Contents page
  questionnaireData: QuestionnaireData
  footerPdf: string // Signature page
  mergedPdf: string // Complete merged PDF
}

// Mock data
const mockQuestionnaires: Record<string, QuestionnaireResponse> = {
  R001: {
    headerPdf: generateAcknowledgementPage(),
    tocPdf: generateTableOfContentsPage([
      { title: 'Company Overview', pageNumber: 3 },
      { title: 'Financial Information', pageNumber: 4 },
      { title: 'Compliance & Risk', pageNumber: 5 }
    ]),
    questionnaireData: {
      id: 'Q001',
      reviewId: 'R001',
      title: 'Due Diligence Review Questionnaire',
      sections: [
        {
          id: 'S001',
          title: 'Company Overview',
          questions: [
            {
              id: 'Q1',
              text: 'What is your company type?',
              type: 'single-select',
              options: ['Private Limited', 'Public Limited', 'Partnership', 'Sole Proprietorship']
            },
            {
              id: 'Q2',
              text: 'How many years has your company been in operation?',
              type: 'text'
            },
            {
              id: 'Q3',
              text: 'Which countries does your company operate in?',
              type: 'multi-select',
              options: ['USA', 'UK', 'India', 'Germany', 'Canada', 'Australia']
            }
          ]
        },
        {
          id: 'S002',
          title: 'Financial Information',
          questions: [
            {
              id: 'Q4',
              text: 'What was your annual revenue for the last fiscal year?',
              type: 'text'
            },
            {
              id: 'Q5',
              text: 'Select all applicable certifications',
              type: 'multi-select',
              options: ['ISO 9001', 'ISO 27001', 'SOC 2', 'GDPR Compliant', 'HIPAA Compliant']
            },
            {
              id: 'Q6',
              text: 'When was your last financial audit conducted?',
              type: 'date'
            }
          ]
        },
        {
          id: 'S003',
          title: 'Compliance & Risk',
          questions: [
            {
              id: 'Q7',
              text: 'Has your company faced any regulatory violations?',
              type: 'single-select',
              options: ['Yes', 'No', 'Not Applicable']
            },
            {
              id: 'Q8',
              text: 'Describe your risk management framework',
              type: 'text'
            },
            {
              id: 'Q9',
              text: 'Which data protection standards do you follow?',
              type: 'multi-select',
              options: ['GDPR', 'CCPA', 'LGPD', 'PDPA', 'Other']
            }
          ]
        }
      ]
    },
    footerPdf: generateSignaturePage(),
    mergedPdf: generateMergedCompletePdf([
      {
        id: 'S001',
        title: 'Company Overview',
        questions: [
          {
            id: 'Q1',
            text: 'What is your company type?',
            type: 'single-select',
            options: ['Private Limited', 'Public Limited', 'Partnership', 'Sole Proprietorship']
          },
          {
            id: 'Q2',
            text: 'How many years has your company been in operation?',
            type: 'text'
          },
          {
            id: 'Q3',
            text: 'Which countries does your company operate in?',
            type: 'multi-select',
            options: ['USA', 'UK', 'India', 'Germany', 'Canada', 'Australia']
          }
        ]
      },
      {
        id: 'S002',
        title: 'Financial Information',
        questions: [
          {
            id: 'Q4',
            text: 'What was your annual revenue for the last fiscal year?',
            type: 'text'
          },
          {
            id: 'Q5',
            text: 'Select all applicable certifications',
            type: 'multi-select',
            options: ['ISO 9001', 'ISO 27001', 'SOC 2', 'GDPR Compliant', 'HIPAA Compliant']
          },
          {
            id: 'Q6',
            text: 'When was your last financial audit conducted?',
            type: 'date'
          }
        ]
      },
      {
        id: 'S003',
        title: 'Compliance & Risk',
        questions: [
          {
            id: 'Q7',
            text: 'Has your company faced any regulatory violations?',
            type: 'single-select',
            options: ['Yes', 'No', 'Not Applicable']
          },
          {
            id: 'Q8',
            text: 'Describe your risk management framework',
            type: 'text'
          },
          {
            id: 'Q9',
            text: 'Which data protection standards do you follow?',
            type: 'multi-select',
            options: ['GDPR', 'CCPA', 'LGPD', 'PDPA', 'Other']
          }
        ]
      }
    ])
  },
  R002: {
    headerPdf: generateAcknowledgementPage(),
    tocPdf: generateTableOfContentsPage([
      { title: 'Performance Metrics', pageNumber: 3 },
      { title: 'Strategic Initiatives', pageNumber: 4 }
    ]),
    questionnaireData: {
      id: 'Q002',
      reviewId: 'R002',
      title: 'Periodic Review Questionnaire',
      sections: [
        {
          id: 'S001',
          title: 'Performance Metrics',
          questions: [
            {
              id: 'Q1',
              text: 'What is your current growth rate?',
              type: 'text'
            },
            {
              id: 'Q2',
              text: 'Which performance indicators improved?',
              type: 'multi-select',
              options: ['Revenue', 'Market Share', 'Customer Satisfaction', 'Operational Efficiency', 'Employee Retention']
            }
          ]
        },
        {
          id: 'S002',
          title: 'Strategic Initiatives',
          questions: [
            {
              id: 'Q3',
              text: 'Describe your key strategic initiatives for next year',
              type: 'text'
            },
            {
              id: 'Q4',
              text: 'Have strategic goals been met?',
              type: 'single-select',
              options: ['Yes', 'Partially', 'No', 'On Track']
            }
          ]
        }
      ]
    },
    footerPdf: generateSignaturePage(),
    mergedPdf: generateMergedCompletePdf([
      {
        id: 'S001',
        title: 'Performance Metrics',
        questions: [
          {
            id: 'Q1',
            text: 'What is your current growth rate?',
            type: 'text'
          },
          {
            id: 'Q2',
            text: 'Which performance indicators improved?',
            type: 'multi-select',
            options: ['Revenue', 'Market Share', 'Customer Satisfaction', 'Operational Efficiency', 'Employee Retention']
          }
        ]
      },
      {
        id: 'S002',
        title: 'Strategic Initiatives',
        questions: [
          {
            id: 'Q3',
            text: 'Describe your key strategic initiatives for next year',
            type: 'text'
          },
          {
            id: 'Q4',
            text: 'Have strategic goals been met?',
            type: 'single-select',
            options: ['Yes', 'Partially', 'No', 'On Track']
          }
        ]
      }
    ])
  },
  R004: {
    headerPdf: generateAcknowledgementPage(),
    tocPdf: generateTableOfContentsPage([
      { title: 'Business Structure', pageNumber: 3 }
    ]),
    questionnaireData: {
      id: 'Q003',
      reviewId: 'R004',
      title: 'Due Diligence Review Questionnaire',
      sections: [
        {
          id: 'S001',
          title: 'Business Structure',
          questions: [
            {
              id: 'Q1',
              text: 'Describe your organizational structure',
              type: 'text'
            },
            {
              id: 'Q2',
              text: 'How many employees do you have?',
              type: 'text'
            }
          ]
        }
      ]
    },
    footerPdf: generateSignaturePage(),
    mergedPdf: generateMergedCompletePdf([
      {
        id: 'S001',
        title: 'Business Structure',
        questions: [
          {
            id: 'Q1',
            text: 'Describe your organizational structure',
            type: 'text'
          },
          {
            id: 'Q2',
            text: 'How many employees do you have?',
            type: 'text'
          }
        ]
      }
    ])
  }
}

// API call to send questionnaire (mock)
export const sendQuestionnaire = async (reviewId: string): Promise<QuestionnaireResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const response = mockQuestionnaires[reviewId]
  if (!response) {
    throw new Error(`Questionnaire not found for review ID: ${reviewId}`)
  }

  return response
}

// Generate table of contents from questionnaire data
export const generateTableOfContents = (questionnaire: QuestionnaireData): Array<{ id: string; title: string }> => {
  return questionnaire.sections.map((section, index) => ({
    id: section.id,
    title: `${index + 1}. ${section.title}`
  }))
}
