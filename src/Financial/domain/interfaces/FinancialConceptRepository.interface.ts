import { ConceptType, FinancialConcept } from "@/Financial/domain"

export interface IFinancialConceptRepository {
  one(filter: object): Promise<FinancialConcept | undefined>

  findFinancialConceptsByChurchId(churchId: string): Promise<FinancialConcept[]>

  findFinancialConceptsByChurchIdAndTypeConcept(
    churchId: string,
    typeConcept: ConceptType
  ): Promise<FinancialConcept[]>

  upsert(financialConcept: FinancialConcept): Promise<void>
}
