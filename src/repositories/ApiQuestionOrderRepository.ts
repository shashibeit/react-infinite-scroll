import { QuestionFilters, QuestionOrderRepository } from './QuestionOrderRepository'

export class ApiQuestionOrderRepository implements QuestionOrderRepository {
  constructor(private baseUrl = '') {}

  async getFullOrder(sectionId: string): Promise<string[]> {
    throw new Error(`Implement GET ${this.baseUrl}/sections/${sectionId}/order before use.`)
  }

  async getFiltered(sectionId: string, filters: QuestionFilters): Promise<string[]> {
    void filters
    throw new Error(`Implement GET ${this.baseUrl}/sections/${sectionId}/order with filters before use.`)
  }

  async saveOrder(sectionId: string, orderedIds: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sections/${sectionId}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ questionIdsInOrder: orderedIds })
    })

    if (!response.ok) {
      throw new Error(`Failed to save order (${response.status})`)
    }
  }
}
