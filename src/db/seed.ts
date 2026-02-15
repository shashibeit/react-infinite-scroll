import { AppDb, Question, Section, SectionQuestionOrder } from './appDb'

export interface DbExport {
  sections: Section[]
  questions: Question[]
  sectionQuestionOrder: SectionQuestionOrder[]
}

export const resetDbWithMockData = async (db: AppDb): Promise<void> => {
  const sections: Section[] = [
    { id: 'sec-1', title: 'Customer Onboarding' },
    { id: 'sec-2', title: 'Risk Review' }
  ]

  const questions: Question[] = []
  const sectionQuestionOrder: SectionQuestionOrder[] = []

  const section1Questions = [
    'Describe the current onboarding workflow.',
    'Which systems are used for onboarding?',
    'What is the average onboarding time?',
    'Who approves onboarding steps?',
    'List any onboarding bottlenecks.'
  ]

  const section1QuestionsPQR = [
    'What documentation is required for PQR onboarding?',
    'How is PQR identity verification performed?',
    'What is the approval hierarchy for PQR onboarding?',
    'What compliance checks are mandatory for PQR?',
    'How long does PQR onboarding typically take?',
    'What follow-up actions are required after PQR onboarding?'
  ]

  const section2Questions = [
    'How often are risk reviews conducted?',
    'Who signs off on risk findings?',
    'What is the escalation path for risks?',
    'Which tools are used for risk tracking?'
  ]

  const addQuestions = (
    sectionId: string,
    entries: string[],
    reviewType: Question['reviewType'],
    participantType: Question['participantType'],
    idPrefix: string
  ) => {
    entries.forEach((text, index) => {
      const questionId = `${sectionId}-${idPrefix}-q${index + 1}`
      questions.push({
        id: questionId,
        sectionId,
        text,
        reviewType,
        participantType,
        status: index % 2 === 0 ? 'APPROVED' : 'REVIEW'
      })
    })
  }

  // Add all questions for each section
  addQuestions('sec-1', section1Questions, 'Due Diligence', 'XY', 'xy')
  addQuestions('sec-1', section1QuestionsPQR, 'Due Diligence', 'PQR', 'pqr')
  addQuestions('sec-2', section2Questions, 'Periodic Review', 'PQR', 'pqr')

  // Group questions by section and participant type
  const sec1XY = questions.filter(q => q.sectionId === 'sec-1' && q.participantType === 'XY')
  const sec1PQR = questions.filter(q => q.sectionId === 'sec-1' && q.participantType === 'PQR')
  const sec2Questions = questions.filter(q => q.sectionId === 'sec-2')

  // Custom order for Customer Onboarding (sec-1):
  // 2 XY, 2 PQR, 1 XY, 1 PQR, 2 PQR, 2 XY, remaining PQR
  const sec1OrderedQuestions = [
    ...sec1XY.slice(0, 2),    // First 2 XY
    ...sec1PQR.slice(0, 2),   // Next 2 PQR
    ...sec1XY.slice(2, 3),    // Then 1 XY
    ...sec1PQR.slice(2, 3),   // Then 1 PQR
    ...sec1PQR.slice(3, 5),   // 2 PQR
    ...sec1XY.slice(3, 5),    // 2 XY
    ...sec1PQR.slice(5)       // Remaining PQR
  ]

  // Assign order indices for Customer Onboarding
  sec1OrderedQuestions.forEach((question, index) => {
    sectionQuestionOrder.push({
      sectionId: 'sec-1',
      questionId: question.id,
      orderIndex: index + 1
    })
  })

  // Assign order indices for sec-2 (sequential)
  sec2Questions.forEach((question, index) => {
    sectionQuestionOrder.push({
      sectionId: 'sec-2',
      questionId: question.id,
      orderIndex: index + 1
    })
  })

  await db.sections.clear()
  await db.questions.clear()
  await db.sectionQuestionOrder.clear()
  await db.sections.bulkAdd(sections)
  await db.questions.bulkAdd(questions)
  await db.sectionQuestionOrder.bulkAdd(sectionQuestionOrder)
}

export const exportDbContent = async (db: AppDb): Promise<DbExport> => {
  const [sections, questions, sectionQuestionOrder] = await Promise.all([
    db.sections.toArray(),
    db.questions.toArray(),
    db.sectionQuestionOrder.toArray()
  ])

  return {
    sections,
    questions,
    sectionQuestionOrder
  }
}
