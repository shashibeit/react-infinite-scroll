import { ParticipantType, ReviewType, CountryType } from '../db/appDb'

export interface QuestionFilters {
  reviewType?: ReviewType
  participantType?: ParticipantType
  country?: CountryType
}

export interface QuestionOrderRepository {
  getFullOrder(sectionId: string): Promise<string[]>
  getFiltered(sectionId: string, filters: QuestionFilters): Promise<string[]>
  saveOrder(sectionId: string, orderedIds: string[]): Promise<void>
}
