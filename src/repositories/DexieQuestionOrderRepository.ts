import { AppDb, Question, SectionQuestionOrder } from '../db/appDb'
import { QuestionFilters, QuestionOrderRepository } from './QuestionOrderRepository'

export class DexieQuestionOrderRepository implements QuestionOrderRepository {
  constructor(private db: AppDb) {}

  async getFullOrder(sectionId: string): Promise<string[]> {
    const ordered: SectionQuestionOrder[] = await this.db.sectionQuestionOrder
      .where('sectionId')
      .equals(sectionId)
      .sortBy('orderIndex')

    if (ordered.length > 0) {
      return ordered.map((entry) => entry.questionId)
    }

    const questions: Question[] = await this.db.questions.where('sectionId').equals(sectionId).toArray()
    return questions
      .slice()
      .sort((a: Question, b: Question) => a.id.localeCompare(b.id))
      .map((question: Question) => question.id)
  }

  async getFiltered(sectionId: string, filters: QuestionFilters): Promise<string[]> {
    const fullOrder = await this.getFullOrder(sectionId)

    if (!filters.reviewType && !filters.participantType && !filters.country) {
      return fullOrder
    }

    const questions = await this.db.questions.where('sectionId').equals(sectionId).toArray()
    const filtered = this.applyFilters(questions, filters)
    const allowedIds = new Set(filtered.map((question) => question.id))

    return fullOrder.filter((questionId) => allowedIds.has(questionId))
  }

  async saveOrder(sectionId: string, orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((questionId, index) => ({
      sectionId,
      questionId,
      orderIndex: index + 1
    }))

    await this.db.sectionQuestionOrder.where('sectionId').equals(sectionId).delete()
    if (updates.length > 0) {
      await this.db.sectionQuestionOrder.bulkAdd(updates)
    }
  }

  private applyFilters(questions: Question[], filters: QuestionFilters): Question[] {
    return questions.filter((question) => {
      if (filters.reviewType && question.reviewType !== filters.reviewType) {
        return false
      }
      if (filters.participantType && question.participantType !== filters.participantType) {
        return false
      }
      if (filters.country && question.country !== filters.country) {
        return false
      }
      return true
    })
  }
}
