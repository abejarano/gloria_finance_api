import dayjs from "dayjs"
import { DateBR } from "@/Shared/helpers"
import { CloseFinancialMonthService } from "../services/CloseFinancialMonth.service"
import { GenerateFinancialMonthsService } from "@/ConsolidatedFinancial/infrastructure/services"
import type { IJob } from "@/package/queue/domain"

export class CloseFinancialMonth implements IJob {
  async handle(args: any): Promise<any> {
    const isLastDayMonth = (): boolean => {
      const now = dayjs.tz(new Date(), "America/Sao_Paulo")
      return now.add(1, "day").month() !== now.month()
    }

    const isDecember = () => DateBR().getMonth() === 11

    if (isLastDayMonth()) {
      await CloseFinancialMonthService()
    }

    if (isDecember()) {
      await GenerateFinancialMonthsService(DateBR().getFullYear() + 1)
    }
  }
}
