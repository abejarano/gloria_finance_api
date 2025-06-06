import { ConceptType } from "@/Financial/domain"

export type FinancialConceptRequest = {
  name: string
  description: string
  type: ConceptType
  active: boolean
  churchId: string
  financialConceptId?: string
}
