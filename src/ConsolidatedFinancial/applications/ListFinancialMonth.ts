import {
  FinancialMonth,
  IFinancialYearRepository,
  ListFinancialMonthRequest,
} from "@/ConsolidatedFinancial/domain"
import { Logger } from "@/Shared/adapter"

export class ListFinancialMonth {
  private logger = Logger(ListFinancialMonth.name)

  constructor(
    private readonly financialYearRepository: IFinancialYearRepository
  ) {}

  async execute(req: ListFinancialMonthRequest): Promise<FinancialMonth[]> {
    this.logger.info(`Listing financial months`, req)

    return await this.financialYearRepository.list({
      ...req,
    })
  }
}
