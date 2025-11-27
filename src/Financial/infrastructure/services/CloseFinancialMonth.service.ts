import { ChurchMongoRepository } from "@/Church/infrastructure"
import { FinancialYearMongoRepository } from "@/ConsolidatedFinancial/infrastructure"
import { ActionsFinancialMonth } from "@/ConsolidatedFinancial/domain"
import { UpdateFinancialMonth } from "@/ConsolidatedFinancial/applications/FinancialMonth"
import { DRE } from "@/Reports/applications"
import { FinanceRecordMongoRepository } from "@/Financial/infrastructure"
import { DREMongoRepository } from "@/Reports/infrastructure/persistence/DREMongoRepository"

export const CloseFinancialMonthService = async (): Promise<void> => {
  const churches = await ChurchMongoRepository.getInstance().all()

  for (const church of churches) {
    await new UpdateFinancialMonth(
      FinancialYearMongoRepository.getInstance()
    ).execute({
      action: ActionsFinancialMonth.CLOSE,
      churchId: church.getChurchId(),
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      closedBy: "system",
    })

    await new DRE(
      FinanceRecordMongoRepository.getInstance(),
      DREMongoRepository.getInstance(),
      ChurchMongoRepository.getInstance()
    ).generateAndSaveDRE({
      churchId: church.getChurchId(),
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    })
  }
}
