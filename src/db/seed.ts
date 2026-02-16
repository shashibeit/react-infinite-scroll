import { AppDb, Question, Section, SectionQuestionOrder, CountryType, ReviewType, ParticipantType } from './appDb'

export interface DbExport {
  sections: Section[]
  questions: Question[]
  sectionQuestionOrder: SectionQuestionOrder[]
}

export const resetDbWithMockData = async (db: AppDb): Promise<void> => {
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

  const questions: Question[] = []
  const sectionQuestionOrder: SectionQuestionOrder[] = []
  
  // Global question counter for QID format
  let globalQuestionCounter = 1

  const reviewTypes: ReviewType[] = ['Due Diligence', 'Periodic Review']
  const participantTypes: ParticipantType[] = ['XY', 'PQR']
  const countries: CountryType[] = ['USA', 'UK', 'India', 'Canada']

  // Sample question templates
  const questionTemplates = [
    'What is the current process for {topic}?',
    'How is {topic} documented and maintained?',
    'Who is responsible for {topic}?',
    'What are the key controls for {topic}?',
    'How often is {topic} reviewed?',
    'What tools are used for {topic}?',
    'Describe the approval process for {topic}.',
    'What are the escalation procedures for {topic}?',
    'How is {topic} monitored and reported?',
    'What compliance requirements apply to {topic}?',
    'What training is provided for {topic}?',
    'How are exceptions handled in {topic}?',
    'What metrics are tracked for {topic}?',
    'Describe the workflow for {topic}.',
    'What documentation is required for {topic}?'
  ]

  // Helper to get random element from array
  const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  // Generate questions for each section
  sections.forEach((section) => {
    const numQuestions = 5 + Math.floor(Math.random() * 6) // 5-10 questions per section
    
    for (let i = 0; i < numQuestions; i++) {
      const questionId = `QID${String(globalQuestionCounter).padStart(4, '0')}`
      globalQuestionCounter++
      
      const template = getRandom(questionTemplates)
      const text = template.replace('{topic}', section.title.toLowerCase())
      
      questions.push({
        id: questionId,
        sectionId: section.id,
        text,
        reviewType: getRandom(reviewTypes),
        participantType: getRandom(participantTypes),
        country: getRandom(countries),
        status: Math.random() > 0.3 ? 'APPROVED' : 'REVIEW'
      })
    }
  })

  // Create random order for each section
  sections.forEach((section) => {
    const sectionQuestions = questions.filter(q => q.sectionId === section.id)
    
    // Shuffle questions randomly
    const shuffled = [...sectionQuestions].sort(() => Math.random() - 0.5)
    
    shuffled.forEach((question, index) => {
      sectionQuestionOrder.push({
        sectionId: section.id,
        questionId: question.id,
        orderIndex: index + 1
      })
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
