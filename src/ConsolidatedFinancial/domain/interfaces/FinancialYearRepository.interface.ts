import { FinancialMonth } from "../FinancialMonth"

export interface IFinancialYearRepository {
  upsert(financialYear: FinancialMonth): Promise<void>

  one(filter: object): Promise<FinancialMonth | undefined>

  list(filter: object): Promise<FinancialMonth[]>
}
