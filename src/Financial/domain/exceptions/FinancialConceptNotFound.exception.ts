import { DomainException } from "@/Shared/domain"

export class FinancialConceptNotFound extends DomainException {
  name = "FINANCIAL_CONCEPT_NOT_FOUND"
  message = "Financial concept not found"

  constructor(props: string) {
    super()
    this.message = `Financial concept not found: ${props}`
  }
}
