import Dexie, { Table } from 'dexie'

export type ReviewType = 'Due Diligence' | 'Periodic Review'
export type ParticipantType = 'XY' | 'PQR'
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
  status: QuestionStatus
  createdBy?: string
  createdAt?: string
}

export interface SectionQuestionOrder {
  sectionId: string
  questionId: string
  orderIndex: number
}

export class AppDb extends Dexie {
  sections!: Table<Section, string>
  questions!: Table<Question, string>
  sectionQuestionOrder!: Table<SectionQuestionOrder, [string, string]>

  constructor() {
    super('question-order-db')
    this.version(1).stores({
      sections: 'id',
      questions: 'id, sectionId, reviewType, participantType, status',
      sectionQuestionOrder: '[sectionId+questionId], sectionId, orderIndex'
    })
    this.version(2).stores({
      sections: 'id',
      questions: 'id, sectionId, reviewType, participantType, status, createdBy',
      sectionQuestionOrder: '[sectionId+questionId], sectionId, orderIndex'
    }).upgrade(async tx => {
      // Add createdBy and createdAt to existing questions
      const questions = await tx.table('questions').toArray()
      await Promise.all(
        questions.map(q => 
          tx.table('questions').update(q.id, {
            createdBy: 'System',
            createdAt: new Date().toISOString()
          })
        )
      )
    })
  }
}

export const appDb = new AppDb()
